// ─────────────────────────────────────────────────────────────────────────────
// POST /api/generate-prehab-report
// Genera y persiste el informe PREHAB (Athlete Health Score)
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'
import type { InjuryZone, SorenessZone, PrehabGoals } from '@/store/prehabStore'
import type { ZoneCode, ZoneSide } from '@/types/database'

// ── Tipos del input ────────────────────────────────────────────────────────────

interface PrehabInput {
  sport: string
  ageRange: string
  level: string
  season: string
  trainingDays: string
  intensity: number
  sessionHours: string
  goals: Partial<PrehabGoals>
  injuryZones: InjuryZone[]
  sorenessZones: SorenessZone[]
}

// ── Tipos del output ───────────────────────────────────────────────────────────

export interface PrehabRiskZone {
  code: ZoneCode
  side: ZoneSide
  label: string
  risk: 'bajo' | 'moderado' | 'alto'
  reasons: string[]
}

export interface PrehabRecommendation {
  title: string
  description: string
  priority: number
  category: 'carga' | 'movilidad' | 'fuerza' | 'recuperacion' | 'prevencion'
}

export interface PrehabReportData {
  module: 'prehab'
  athleteHealthScore: number
  riskLevel: 'bajo' | 'moderado' | 'alto'
  sport: string
  profile: { ageRange: string; level: string; season: string }
  trainingLoad: { days: string; intensity: number; hours: string }
  goals: Partial<PrehabGoals>
  riskZones: PrehabRiskZone[]
  recommendations: PrehabRecommendation[]
  generated_at: string
}

// ── Supabase ────────────────────────────────────────────────────────────────

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

// ── Algoritmo de scoring ───────────────────────────────────────────────────────

const ZONE_LABELS: Record<string, string> = {
  cervical:   'Cervical',
  dorsal:     'Dorsal',
  lumbar:     'Lumbar',
  shoulder:   'Hombro',
  elbow:      'Codo',
  wrist:      'Muñeca',
  hip:        'Cadera',
  knee:       'Rodilla',
  ankle_foot: 'Tobillo / Pie',
}

function getZoneLabel(code: ZoneCode, side: ZoneSide): string {
  const base = ZONE_LABELS[code] ?? code
  if (!side) return base
  return `${base} ${side === 'r' ? 'Der.' : 'Izq.'}`
}

// Riesgo de lesión por deporte (zonas más vulnerables por deporte)
const SPORT_RISK_ZONES: Record<string, ZoneCode[]> = {
  futbol:     ['knee', 'ankle_foot', 'hip', 'lumbar'],
  padel:      ['shoulder', 'elbow', 'wrist', 'lumbar', 'knee'],
  running:    ['knee', 'ankle_foot', 'hip', 'lumbar'],
  natacion:   ['shoulder', 'cervical', 'lumbar'],
  ciclismo:   ['knee', 'lumbar', 'cervical', 'hip'],
  gym:        ['lumbar', 'shoulder', 'knee', 'elbow'],
  crossfit:   ['lumbar', 'shoulder', 'knee', 'wrist', 'elbow'],
  tenis:      ['shoulder', 'elbow', 'wrist', 'knee'],
  baloncesto: ['ankle_foot', 'knee', 'shoulder'],
  otro:       ['lumbar', 'knee', 'shoulder'],
}

function calculatePrehabScore(input: PrehabInput): PrehabReportData {
  let score = 100

  // ── 1. Penalización por carga de entrenamiento ──────────────────────────────

  const daysMap: Record<string, number> = { '1-2': 0, '3-4': -5, '5-6': -10, '7+': -18 }
  const intensityPenalty = [0, 0, -3, -6, -10, -15]
  const hoursMap: Record<string, number> = { '<1': 0, '1-2': -3, '>2': -6 }

  score += daysMap[input.trainingDays] ?? 0
  score += intensityPenalty[input.intensity] ?? 0
  score += hoursMap[input.sessionHours] ?? 0

  // Combinación días + intensidad alta = mayor riesgo
  if (input.trainingDays === '7+' && input.intensity >= 4) score -= 10
  if (input.trainingDays === '5-6' && input.intensity === 5) score -= 5

  // ── 2. Penalización por historial de lesiones ────────────────────────────────

  for (const z of input.injuryZones) {
    if (z.timing === 'recent')  score -= 12
    else if (z.timing === 'chronic') score -= 10
    else score -= 5
  }

  // ── 3. Penalización por molestias actuales ───────────────────────────────────

  for (const z of input.sorenessZones) {
    if (z.intensity === 3)      score -= 12
    else if (z.intensity === 2) score -= 7
    else score -= 3
  }

  // ── 4. Bonus por enfoque en prevención ──────────────────────────────────────

  const preventionGoal = (input.goals as Record<string, number>).prevention ?? 0
  if (preventionGoal >= 4) score += 5
  if (preventionGoal === 5) score += 3

  // ── 5. Ajuste por edad ───────────────────────────────────────────────────────

  const ageAdj: Record<string, number> = { '<18': 5, '18-30': 2, '31-45': 0, '46-60': -5, '>60': -10 }
  score += ageAdj[input.ageRange] ?? 0

  // Clamp 0-100
  const athleteHealthScore = Math.max(0, Math.min(100, Math.round(score)))

  // ── Nivel de riesgo global ───────────────────────────────────────────────────

  const riskLevel = athleteHealthScore >= 70
    ? 'bajo'
    : athleteHealthScore >= 45
    ? 'moderado'
    : 'alto'

  // ── Zonas de riesgo ──────────────────────────────────────────────────────────

  const sportZones = SPORT_RISK_ZONES[input.sport] ?? SPORT_RISK_ZONES.otro
  const riskZonesMap = new Map<string, PrehabRiskZone>()

  const addOrUpdateZone = (
    code: ZoneCode,
    side: ZoneSide,
    risk: 'bajo' | 'moderado' | 'alto',
    reason: string
  ) => {
    const key = `${code}-${side}`
    const existing = riskZonesMap.get(key)
    if (existing) {
      existing.reasons.push(reason)
      if (risk === 'alto' || (risk === 'moderado' && existing.risk === 'bajo')) {
        existing.risk = risk
      }
    } else {
      riskZonesMap.set(key, {
        code,
        side,
        label: getZoneLabel(code, side),
        risk,
        reasons: [reason],
      })
    }
  }

  // Zonas por deporte
  for (const code of sportZones.slice(0, 3)) {
    const sportName = {
      futbol: 'Fútbol', padel: 'Pádel', running: 'Running', natacion: 'Natación',
      ciclismo: 'Ciclismo', gym: 'Gym/Fitness', crossfit: 'CrossFit',
      tenis: 'Tenis', baloncesto: 'Baloncesto', otro: 'tu deporte',
    }[input.sport] ?? 'tu deporte'
    addOrUpdateZone(code, null, 'bajo', `Zona frecuente en ${sportName}`)
  }

  // Zonas con historial de lesiones
  for (const z of input.injuryZones) {
    const r = z.timing === 'recent' ? 'alto' : z.timing === 'chronic' ? 'moderado' : 'bajo'
    const reason = z.timing === 'recent'
      ? 'Lesión reciente (< 6 meses)'
      : z.timing === 'chronic'
      ? 'Lesión crónica recurrente'
      : 'Lesión previa (> 6 meses)'
    addOrUpdateZone(z.code, z.side, r, reason)
  }

  // Zonas con molestias actuales
  for (const z of input.sorenessZones) {
    const r = z.intensity === 3 ? 'alto' : z.intensity === 2 ? 'moderado' : 'bajo'
    const reason = z.intensity === 3
      ? 'Molestia actual intensa'
      : z.intensity === 2
      ? 'Molestia actual moderada'
      : 'Molestia actual leve'
    addOrUpdateZone(z.code, z.side, r, reason)
  }

  // Ordenar por riesgo: alto > moderado > bajo
  const riskOrder = { alto: 0, moderado: 1, bajo: 2 }
  const riskZones = Array.from(riskZonesMap.values())
    .sort((a, b) => riskOrder[a.risk] - riskOrder[b.risk])
    .slice(0, 6) // máx 6 zonas

  // ── Recomendaciones ──────────────────────────────────────────────────────────

  const recommendations: PrehabRecommendation[] = []

  // Carga excesiva
  if (input.trainingDays === '7+' || (input.trainingDays === '5-6' && input.intensity >= 4)) {
    recommendations.push({
      title: 'Reduce la carga de entrenamiento',
      description: 'Entrenas con muy alta frecuencia e intensidad. Introduce al menos 1-2 días de recuperación activa o descanso completo por semana.',
      priority: 1,
      category: 'carga',
    })
  }

  // Lesiones recientes
  const recentInjuries = input.injuryZones.filter((z) => z.timing === 'recent')
  if (recentInjuries.length > 0) {
    recommendations.push({
      title: 'Protocolo de retorno a la práctica',
      description: `Tienes ${recentInjuries.length} lesión(es) reciente(s). Es fundamental una readaptación progresiva antes de retomar la carga completa. Considera el módulo REHAB.`,
      priority: 1,
      category: 'prevencion',
    })
  }

  // Molestias intensas
  const intenseSoreness = input.sorenessZones.filter((z) => z.intensity >= 2)
  if (intenseSoreness.length > 0) {
    recommendations.push({
      title: 'Atención a molestias activas',
      description: `Presentas molestias en ${intenseSoreness.length} zona(s). Prioriza el trabajo de descarga, movilidad y control motor en estas áreas antes de aumentar la carga.`,
      priority: 1,
      category: 'recuperacion',
    })
  }

  // Movilidad
  if ((input.goals as Record<string, number>).flexibility >= 3) {
    recommendations.push({
      title: 'Protocolo de movilidad diaria',
      description: 'Dedica 10-15 minutos diarios a movilidad articular, especialmente en las zonas de mayor carga de tu deporte. La consistencia es clave.',
      priority: 2,
      category: 'movilidad',
    })
  }

  // Fuerza preventiva
  recommendations.push({
    title: 'Ejercicio preventivo de fuerza',
    description: `Para ${input.sport === 'otro' ? 'tu deporte' : input.sport}, trabaja específicamente la fuerza excéntrica y el control neuromuscular en las zonas de mayor riesgo.`,
    priority: 2,
    category: 'fuerza',
  })

  // Recuperación
  if (input.sessionHours === '>2' || input.trainingDays === '5-6' || input.trainingDays === '7+') {
    recommendations.push({
      title: 'Optimiza tu recuperación',
      description: 'Con tu volumen de entrenamiento, la recuperación es tan importante como el propio ejercicio. Prioriza el sueño (7-9h), hidratación y nutrición post-entreno.',
      priority: 3,
      category: 'recuperacion',
    })
  }

  // Temporada específica
  if (input.season === 'pre') {
    recommendations.push({
      title: 'Protocolo de pre-temporada',
      description: 'Estás en pre-temporada: incrementa la carga de forma progresiva (no más del 10% semanal). Es el momento ideal para establecer bases de movilidad y fuerza preventiva.',
      priority: 2,
      category: 'prevencion',
    })
  } else if (input.season === 'in') {
    recommendations.push({
      title: 'Mantenimiento en temporada',
      description: 'Durante la temporada, mantén la carga de fuerza preventiva y prioriza la recuperación entre sesiones y competiciones.',
      priority: 2,
      category: 'carga',
    })
  }

  return {
    module: 'prehab',
    athleteHealthScore,
    riskLevel,
    sport: input.sport,
    profile: { ageRange: input.ageRange, level: input.level, season: input.season },
    trainingLoad: { days: input.trainingDays, intensity: input.intensity, hours: input.sessionHours },
    goals: input.goals,
    riskZones,
    recommendations: recommendations.sort((a, b) => a.priority - b.priority).slice(0, 5),
    generated_at: new Date().toISOString(),
  }
}

// ── POST handler ──────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const input: PrehabInput = await request.json()

    if (!input.sport || !input.ageRange || !input.level) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
    }

    const userClient = createUserClient()
    const { data: { user } } = await userClient.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    // Generar informe
    const reportData = calculatePrehabScore(input)

    // Guardar en tabla questionnaires (como referencia) + reports
    const { data: questionnaire, error: qError } = await userClient
      .from('questionnaires')
      .insert({ user_id: user.id, status: 'completed', completed_at: new Date().toISOString() })
      .select('id')
      .single()

    if (qError || !questionnaire) {
      console.error('[generate-prehab-report] Error creando questionnaire:', qError)
      return NextResponse.json({ error: 'Error guardando datos' }, { status: 500 })
    }

    const { data: report, error: rError } = await userClient
      .from('reports')
      .insert({
        questionnaire_id: questionnaire.id,
        user_id: user.id,
        report_data: reportData as unknown as import('@/types/database').Json,
      })
      .select('id')
      .single()

    if (rError || !report) {
      console.error('[generate-prehab-report] Error guardando report:', rError)
      return NextResponse.json({ error: 'Error guardando informe' }, { status: 500 })
    }

    return NextResponse.json({ report_id: report.id })

  } catch (err) {
    console.error('[generate-prehab-report] Error interno:', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
