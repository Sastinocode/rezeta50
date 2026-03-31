// ─────────────────────────────────────────────────────────────────────────────
// POST /api/generate-report
// Genera y persiste el informe MSK usando el algoritmo real de Rezeta 50
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'
import { generateReport } from '@/lib/algorithm'

// ── Supabase con service_role (bypasa RLS para leer datos del cuestionario) ───

function createServiceClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
    }
  )
}

// ── Supabase con sesión del usuario ───────────────────────────────────────────

function createUserClient() {
  const cookieStore = cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch { /* server component */ }
        },
      },
    }
  )
}

// ── POST handler ──────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const { questionnaire_id } = await request.json()
    if (!questionnaire_id) {
      return NextResponse.json({ error: 'Falta questionnaire_id' }, { status: 400 })
    }

    // 1. Verificar autenticación
    const userClient = createUserClient()
    const { data: { user } } = await userClient.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const serviceClient = createServiceClient()

    // 2. Leer cuestionario completo con todas sus relaciones
    const { data: questionnaire, error: qError } = await serviceClient
      .from('questionnaires')
      .select(`
        id,
        user_id,
        body_zones (
          id,
          zone_code,
          side,
          zone_answers (question_key, answer_value)
        ),
        global_answers (question_key, answer_value)
      `)
      .eq('id', questionnaire_id)
      .single()

    if (qError || !questionnaire) {
      console.error('[generate-report] Error leyendo cuestionario:', qError)
      return NextResponse.json({ error: 'Cuestionario no encontrado' }, { status: 404 })
    }

    if (questionnaire.user_id !== user.id) {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
    }

    // 3. Leer programas activos
    const { data: programs, error: pError } = await serviceClient
      .from('programs')
      .select('id, name, description, zone_codes, level, phase, harbiz_url, price_eur, duration_weeks, sessions_week, floor_required, active')
      .eq('active', true)

    if (pError) {
      console.error('[generate-report] Error leyendo programas:', pError)
      return NextResponse.json({ error: 'Error leyendo programas' }, { status: 500 })
    }

    // 4. Construir input del algoritmo
    const bodyZones = (questionnaire.body_zones ?? []) as Array<{
      id: string
      zone_code: string
      side: string | null
      zone_answers: Array<{ question_key: string; answer_value: string }>
    }>

    const globalAnswers = (questionnaire.global_answers ?? []) as Array<{
      question_key: string
      answer_value: string
    }>

    const programRows = (programs ?? []) as Array<{
      id: string
      name: string
      description: string | null
      zone_codes: string[]
      level: string
      phase: string
      harbiz_url: string
      price_eur: number
      duration_weeks: number
      sessions_week: number
      floor_required: boolean
      active: boolean
    }>

    // 5. Ejecutar algoritmo
    const report_data = generateReport(
      {
        id:             questionnaire_id,
        user_id:        user.id,
        body_zones:     bodyZones,
        global_answers: globalAnswers,
      },
      programRows
    )

    // 6. Insertar report
    const { data: report, error: rError } = await userClient
      .from('reports')
      .insert({
        questionnaire_id,
        user_id: user.id,
        report_data: report_data as unknown as import('@/types/database').Json,
      })
      .select('id')
      .single()

    if (rError || !report) {
      console.error('[generate-report] Error insertando report:', rError)
      return NextResponse.json({ error: 'Error guardando informe' }, { status: 500 })
    }

    return NextResponse.json({ report_id: report.id })

  } catch (err) {
    console.error('[generate-report] Error interno:', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
