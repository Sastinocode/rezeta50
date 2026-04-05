// ── MoveScore Algorithm ────────────────────────────────────────────────────────
// Score 0-100 (severity). Higher = more urgent / worse condition.
// Weights: intensidad 30%, limitación 25%, duración 20%, historial 15%, frecuencia 10%

export interface ZonaAfectada {
  zona: string
  lado?: string
  intensidad: number   // 1-10
  duracion?: string    // e.g. "3 meses", "2 semanas"
  frecuencia?: string  // e.g. "constante", "frecuente", "ocasional"
}

export interface MoveChatPayload {
  nombre?: string
  zonas_afectadas?: ZonaAfectada[]
  actividad_fisica?: {
    tipo?: string
    dias_semana?: number
    limitacion_por_dolor?: string
  }
  impacto_vida_diaria?: 'leve' | 'moderado' | 'severo'
  objetivo_principal?: string
  movescore_estimado?: number
  nivel_urgencia?: 'preventivo' | 'atencion' | 'rehabilitador' | 'derivacion'
  recomendacion_principal?: string
}

// ── Factor parsers ──────────────────────────────────────────────────────────

function parseIntensidad(zonas: ZonaAfectada[]): number {
  if (!zonas.length) return 0
  const avg = zonas.reduce((sum, z) => sum + Math.min(Math.max(z.intensidad ?? 1, 1), 10), 0) / zonas.length
  return avg / 10 // 0-1
}

function parseLimitacion(impacto?: string): number {
  switch (impacto) {
    case 'leve':     return 0.2
    case 'moderado': return 0.55
    case 'severo':   return 1.0
    default:         return 0.3
  }
}

function parseDuracion(zonas: ZonaAfectada[]): number {
  // Use worst (longest) duration across zones
  let max = 0
  for (const z of zonas) {
    const score = duracionScore(z.duracion ?? '')
    if (score > max) max = score
  }
  return max || 0.2
}

function duracionScore(duracion: string): number {
  const d = duracion.toLowerCase()
  if (/año|chronic|crónic|>6|más de 6/i.test(d)) return 1.0
  if (/6 mes|5 mes|4 mes/i.test(d)) return 0.8
  if (/3 mes|2 mes/i.test(d)) return 0.6
  if (/mes|4 semana|5 semana|6 semana/i.test(d)) return 0.4
  if (/semana|días|dias/i.test(d)) return 0.2
  if (/hoy|horas|ayer/i.test(d)) return 0.1
  return 0.3 // default: a few weeks
}

function parseHistorial(nivelUrgencia?: string): number {
  switch (nivelUrgencia) {
    case 'preventivo':   return 0.1
    case 'atencion':     return 0.35
    case 'rehabilitador':return 0.65
    case 'derivacion':   return 1.0
    default:             return 0.3
  }
}

function parseFrecuencia(zonas: ZonaAfectada[]): number {
  let max = 0
  for (const z of zonas) {
    const score = frecuenciaScore(z.frecuencia ?? '')
    if (score > max) max = score
  }
  return max || 0.3
}

function frecuenciaScore(frecuencia: string): number {
  const f = frecuencia.toLowerCase()
  if (/constante|siempre|continuo|permanente/i.test(f)) return 1.0
  if (/frecuente|casi siempre|a menudo|vari/i.test(f)) return 0.6
  if (/ocasional|aveces|a veces|rara/i.test(f)) return 0.3
  if (/esfuerzo|actividad|deporte|ejercicio/i.test(f)) return 0.2
  return 0.35
}

// ── Main export ─────────────────────────────────────────────────────────────

export interface ScoreResult {
  score: number        // 0-100, rounded
  zone: string         // primary affected zone (first zona or 'general')
  factors: {
    intensidad: number
    limitacion: number
    duracion: number
    historial: number
    frecuencia: number
  }
}

export function calculateMoveScore(payload: MoveChatPayload): ScoreResult {
  const zonas = payload.zonas_afectadas ?? []

  const intensidad = parseIntensidad(zonas)
  const limitacion = parseLimitacion(payload.impacto_vida_diaria)
  const duracion   = parseDuracion(zonas)
  const historial  = parseHistorial(payload.nivel_urgencia)
  const frecuencia = parseFrecuencia(zonas)

  const raw =
    intensidad * 0.30 +
    limitacion * 0.25 +
    duracion   * 0.20 +
    historial  * 0.15 +
    frecuencia * 0.10

  const score = Math.round(Math.min(Math.max(raw * 100, 0), 100))

  const zone = zonas[0]?.zona ?? 'general'

  return { score, zone, factors: { intensidad, limitacion, duracion, historial, frecuencia } }
}
