// ─────────────────────────────────────────────────────────────────────────────
// Rezeta 50 · Puntuación global (GlobalScore)
// ─────────────────────────────────────────────────────────────────────────────

import type { GlobalLevel } from '@/types/database'
import type { ZoneScoreResult } from './zoneScore'
import type { GlobalAnswerMap } from './zoneScore'

export interface GlobalScoreResult {
  global_score: number
  global_level: GlobalLevel
}

// Pesos por nivel para la media ponderada
const LEVEL_WEIGHT: Record<string, number> = {
  verde: 1.0,
  ambar: 1.5,
  rojo:  2.5,
}

export function calculateGlobalScore(
  zoneScores: ZoneScoreResult[],
  globalAnswers: GlobalAnswerMap
): GlobalScoreResult {
  if (zoneScores.length === 0) {
    return { global_score: 0, global_level: 'preventivo' }
  }

  // Media ponderada por nivel de cada zona
  let sumWeighted = 0
  let sumWeights  = 0

  for (const z of zoneScores) {
    const w = LEVEL_WEIGHT[z.level] ?? 1.0
    sumWeighted += z.score * w
    sumWeights  += w
  }

  let score = sumWeights > 0 ? sumWeighted / sumWeights : 0

  // Modificador por nivel de actividad
  const activity = globalAnswers.activity_level
  if (activity === 'sedentary') {
    score *= 1.10
  } else if (activity === 'exercise_3_plus' || activity === 'athlete') {
    score *= 0.95
  }

  const global_score = Math.min(100, Math.round(score))

  const global_level: GlobalLevel =
    global_score < 30 ? 'preventivo'
    : global_score < 55 ? 'atencion'
    : global_score < 75 ? 'rehabilitador'
    : 'derivacion'

  return { global_score, global_level }
}
