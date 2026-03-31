// ─────────────────────────────────────────────────────────────────────────────
// Rezeta 50 · Algoritmo de puntuación por zona (ZoneScore)
// ─────────────────────────────────────────────────────────────────────────────
//
// NOTA: los valores de las respuestas son los que guarda el store de Zustand
// y se persisten en Supabase (zone_answers.answer_value). No son los valores
// del spec en español sino los internos del store:
//   duration:         'less_1w' | '1w_1m' | '1m_6m' | 'more_6m'
//   frequency:        'occasional' | 'weekly' | 'daily' | 'constant'
//   functional_limit: 'none' | 'mild' | 'moderate' | 'severe'
//   prior_diagnosis:  'true' | 'false'
//   prior_injury:     'none' | 'recent' | 'chronic'
//   activity_level:   'sedentary' | 'walking' | 'exercise_1_2' | 'exercise_3_plus' | 'athlete'
//   age_range:        '<30' | '30-45' | '46-60' | '>60'
// ─────────────────────────────────────────────────────────────────────────────

import type { ZoneCode, ZoneSide, ZoneLevel } from '@/types/database'
import { getPathology } from '@/constants/pathologies'

// ── Tipos de entrada ──────────────────────────────────────────────────────────

export interface ZoneAnswerMap {
  pain_level?: string        // '0'–'10'
  duration?: string
  frequency?: string
  functional_limit?: string
  prior_diagnosis?: string   // 'true' | 'false'
  prior_diagnosis_text?: string
  prior_injury?: string
}

export interface GlobalAnswerMap {
  activity_level?: string
  goals?: string             // JSON-stringified string[]
  age_range?: string
  floor_exercises?: string
}

export interface ZoneScoreResult {
  zone_code: ZoneCode
  side: ZoneSide
  score: number
  level: ZoneLevel
  orientation: string
  candidate_pathology: string
  red_flags: string[]
}

// ── Tablas de conversión ──────────────────────────────────────────────────────

function painScore(raw: string | undefined): number {
  const n = parseInt(raw ?? '5', 10)
  if (n <= 2) return 10
  if (n === 3) return 30
  if (n === 4) return 40
  if (n === 5) return 50
  if (n === 6) return 60
  if (n === 7) return 70
  if (n === 8) return 80
  if (n === 9) return 90
  return 100
}

function durationScore(val: string | undefined): number {
  switch (val) {
    case 'less_1w': return 10   // < 1 semana → agudo
    case '1w_1m':   return 30   // 1 sem – 1 mes → subagudo
    case '1m_6m':   return 60   // 1 – 6 meses → crónico moderado
    case 'more_6m': return 90   // > 6 meses → crónico severo
    default:        return 30
  }
}

function frequencyScore(val: string | undefined): number {
  switch (val) {
    case 'occasional': return 15
    case 'weekly':     return 45
    case 'daily':      return 75
    case 'constant':   return 100
    default:           return 15
  }
}

function functionScore(val: string | undefined): number {
  switch (val) {
    case 'none':     return 5
    case 'mild':     return 35
    case 'moderate': return 65
    case 'severe':   return 90
    default:         return 5
  }
}

function historyScore(
  prior_diagnosis: string | undefined,
  prior_injury: string | undefined
): number {
  const hasDx     = prior_diagnosis === 'true'
  const injury    = prior_injury ?? 'none'

  if (!hasDx && injury === 'none')    return 0    // ninguno
  if (hasDx  && injury === 'none')    return 30   // solo diagnóstico
  if (!hasDx && injury === 'chronic') return 50   // lesión > 1 año
  if (!hasDx && injury === 'recent')  return 70   // lesión < 1 año
  if (hasDx  && injury === 'recent')  return 90   // diagnóstico + lesión reciente
  if (hasDx  && injury === 'chronic') return 60   // diagnóstico + lesión antigua
  return 0
}

function ageModifier(val: string | undefined): number {
  switch (val) {
    case '<30':   return 1.00
    case '30-45': return 1.03
    case '46-60': return 1.08
    case '>60':   return 1.15
    default:      return 1.00
  }
}

// ── Función principal ─────────────────────────────────────────────────────────

export function calculateZoneScore(
  zone_code: ZoneCode,
  side: ZoneSide,
  answers: ZoneAnswerMap,
  globalAnswers: GlobalAnswerMap
): ZoneScoreResult {
  const pain     = painScore(answers.pain_level)
  const duration = durationScore(answers.duration)
  const freq     = frequencyScore(answers.frequency)
  const func     = functionScore(answers.functional_limit)
  const hist     = historyScore(answers.prior_diagnosis, answers.prior_injury)
  const ageMod   = ageModifier(globalAnswers.age_range)

  // Bonus por cronicidad: duración larga + frecuencia alta
  const isChronic = answers.duration === 'more_6m' || answers.duration === '1m_6m'
  const isHighFreq = answers.frequency === 'daily' || answers.frequency === 'constant'
  const chronicity_bonus = isChronic && answers.duration === 'more_6m' && isHighFreq ? 8 : 0

  const raw =
    pain * 0.35 +
    duration * 0.20 +
    freq * 0.15 +
    func * 0.20 +
    hist * 0.10

  const score = Math.min(100, Math.round(raw * ageMod + chronicity_bonus))

  const level: ZoneLevel = score < 40 ? 'verde' : score < 70 ? 'ambar' : 'rojo'

  const pathology = getPathology(zone_code, level)
  const orientation       = pathology?.orientation_text    ?? 'Consulta con un profesional.'
  const candidate_pathology = pathology?.candidate_pathology ?? '—'

  return {
    zone_code,
    side,
    score,
    level,
    orientation,
    candidate_pathology,
    red_flags: [],
  }
}
