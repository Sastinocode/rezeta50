// ─────────────────────────────────────────────────────────────────────────────
// /api/admin/programs — CRUD de programas Harbiz (solo admin)
// GET: listar todos los programas (incluyendo inactivos)
// POST: crear nuevo programa
// PATCH: editar programa existente (id en body)
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

function createServiceClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  )
}

function createUserClient() {
  const cookieStore = cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(s) { try { s.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } catch {} },
      },
    }
  )
}

async function verifyAdmin(): Promise<string | null> {
  const userClient = createUserClient()
  const { data: { user } } = await userClient.auth.getUser()
  if (!user) return null

  const { data: roleRow } = await userClient
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .eq('role', 'admin')
    .maybeSingle()

  return roleRow ? user.id : null
}

// ── GET /api/admin/programs ───────────────────────────────────────────────────

export async function GET() {
  const adminId = await verifyAdmin()
  if (!adminId) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const service = createServiceClient()
  const { data, error } = await service
    .from('programs')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ programs: data })
}

// ── POST /api/admin/programs ──────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const adminId = await verifyAdmin()
  if (!adminId) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const body = await request.json()
  const service = createServiceClient()

  const { data, error } = await service
    .from('programs')
    .insert({
      name:           body.name,
      description:    body.description ?? null,
      zone_codes:     body.zone_codes,
      level:          body.level,
      phase:          body.phase,
      harbiz_url:     body.harbiz_url,
      price_eur:      Number(body.price_eur),
      duration_weeks: Number(body.duration_weeks),
      sessions_week:  Number(body.sessions_week),
      floor_required: Boolean(body.floor_required),
      active:         body.active !== false,
    })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ program: data })
}

// ── PATCH /api/admin/programs ─────────────────────────────────────────────────

export async function PATCH(request: NextRequest) {
  const adminId = await verifyAdmin()
  if (!adminId) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const body = await request.json()
  const { id, ...fields } = body
  if (!id) return NextResponse.json({ error: 'Falta id' }, { status: 400 })

  const service = createServiceClient()
  const { error } = await service
    .from('programs')
    .update({
      name:           fields.name,
      description:    fields.description ?? null,
      zone_codes:     fields.zone_codes,
      level:          fields.level,
      phase:          fields.phase,
      harbiz_url:     fields.harbiz_url,
      price_eur:      Number(fields.price_eur),
      duration_weeks: Number(fields.duration_weeks),
      sessions_week:  Number(fields.sessions_week),
      floor_required: Boolean(fields.floor_required),
      active:         fields.active !== false,
    })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
