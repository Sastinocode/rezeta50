// ─────────────────────────────────────────────────────────────────────────────
// Rezeta 50 · Orquestador del algoritmo MSK
// ─────────────────────────────────────────────────────────────────────────────

import type { ReportData } from '@/types/database'
import { calculateZoneScore, type ZoneAnswerMap, type GlobalAnswerMap } from './zoneScore'
import { calculateGlobalScore } from './globalScore'
import { detectRedFlags, type ZoneWithAnswers } from './redFlags'
import { matchPrograms, type ProgramRow } from './matching'

// ── Tipos de entrada ──────────────────────────────────────────────────────────

export interface BodyZoneInput {
  id: string
  zone_code: string
  side: string | null
  zone_answers: Array<{ question_key: string; answer_value: string }>
}

export interface QuestionnaireInput {
  id: string
  user_id: string
  body_zones: BodyZoneInput[]
  global_answers: Array<{ question_key: string; answer_value: string }>
}

// ── Helpers de parseo ─────────────────────────────────────────────────────────

function parseAnswers(rows: Array<{ question_key: string; answer_value: string }>): Record<string, string> {
  const map: Record<string, string> = {}
  for (const row of rows) {
    map[row.question_key] = row.answer_value
  }
  return map
}

// ── Orquestador principal ─────────────────────────────────────────────────────

export function generateReport(
  questionnaire: QuestionnaireInput,
  programs: ProgramRow[]
): ReportData {
  // 1. Parsear respuestas globales
  const globalRaw    = parseAnswers(questionnaire.global_answers)
  const globalAnswers: GlobalAnswerMap = {
    activity_level:  globalRaw.activity_level,
    goals:           globalRaw.goals,
    age_range:       globalRaw.age_range,
    floor_exercises: globalRaw.floor_exercises,
  }

  // 2. Calcular ZoneScore por cada zona
  const zoneScores = questionnaire.body_zones.map((bz) => {
    const zoneRaw = parseAnswers(bz.zone_answers)
    const zoneAnswers: ZoneAnswerMap = {
      pain_level:           zoneRaw.pain_level,
      duration:             zoneRaw.duration,
      frequency:            zoneRaw.frequency,
      functional_limit:     zoneRaw.functional_limit,
      prior_diagnosis:      zoneRaw.prior_diagnosis,
      prior_diagnosis_text: zoneRaw.prior_diagnosis_text,
      prior_injury:         zoneRaw.prior_injury,
    }
    return calculateZoneScore(
      bz.zone_code as Parameters<typeof calculateZoneScore>[0],
      bz.side as Parameters<typeof calculateZoneScore>[1],
      zoneAnswers,
      globalAnswers
    )
  })

  // 3. Score global
  const { global_score, global_level } = calculateGlobalScore(zoneScores, globalAnswers)

  // 4. Red flags
  const zonesWithAnswers: ZoneWithAnswers[] = questionnaire.body_zones.map((bz) => ({
    zone_code: bz.zone_code,
    side:      bz.side,
    answers:   parseAnswers(bz.zone_answers),
  }))
  const red_flags = detectRedFlags(zoneScores, zonesWithAnswers)

  // 5. Matching de programas
  const program_snapshots = matchPrograms(zoneScores, programs, globalAnswers)
  const recommended_programs = program_snapshots.map((p) => p.id)

  const report_data: ReportData = {
    global_score,
    global_level,
    zone_results: zoneScores,
    recommended_programs,
    program_snapshots,
    red_flags,
    generated_at: new Date().toISOString(),
  }

  // Log de verificación (visible en los logs del servidor)
  console.log('[Rezeta50 Algorithm] report_data:', JSON.stringify({
    global_score,
    global_level,
    zones: zoneScores.map((z) => ({
      zone: `${z.zone_code}${z.side ? `_${z.side}` : ''}`,
      score: z.score,
      level: z.level,
    })),
    red_flags: red_flags.map((f) => f.id),
    programs: program_snapshots.map((p) => p.name),
  }, null, 2))

  return report_data
}
