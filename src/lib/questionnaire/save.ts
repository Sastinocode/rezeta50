import { createClient } from '@/lib/supabase/client'
import type { ZoneAnswers, ZoneSelection, GlobalAnswers } from '@/store/questionnaireStore'

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface StoreSnapshot {
  selectedZones: ZoneSelection[]
  globalAnswers: GlobalAnswers
}

// ── Helper: convierte ZoneAnswers en array de {question_key, answer_value} ────

function answersToRows(
  body_zone_id: string,
  answers: ZoneAnswers
): { body_zone_id: string; question_key: string; answer_value: string }[] {
  return Object.entries(answers)
    .filter(([key, val]) => {
      // Omitir texto de diagnóstico si está vacío
      if (key === 'prior_diagnosis_text') return val !== '' && val !== undefined
      return val !== undefined
    })
    .map(([key, val]) => ({
      body_zone_id,
      question_key: key,
      answer_value: typeof val === 'boolean'
        ? val ? 'true' : 'false'
        : String(val),
    }))
}

// ── Helper: convierte GlobalAnswers en array de rows ─────────────────────────

function globalAnswersToRows(
  questionnaire_id: string,
  answers: GlobalAnswers
): { questionnaire_id: string; question_key: string; answer_value: string }[] {
  return Object.entries(answers)
    .filter(([, val]) => val !== undefined)
    .map(([key, val]) => ({
      questionnaire_id,
      question_key: key,
      answer_value: Array.isArray(val) ? JSON.stringify(val) : String(val),
    }))
}

// ── Función principal ─────────────────────────────────────────────────────────

/**
 * Guarda el cuestionario completo en Supabase y genera el informe.
 * Devuelve el report_id para la redirección.
 *
 * Orden de operaciones:
 * 1. Crear questionnaire
 * 2. Crear body_zones + zone_answers para cada zona (paralelo entre zonas)
 * 3. Crear global_answers
 * 4. Llamar a /api/generate-report → obtener report_id
 */
export async function saveQuestionnaire(
  userId: string,
  store: StoreSnapshot
): Promise<string> {
  const supabase = createClient()

  // ── 1. Crear questionnaire ─────────────────────────────────────────────────
  const { data: questionnaire, error: qError } = await supabase
    .from('questionnaires')
    .insert({
      user_id: userId,
      status: 'completed',
      completed_at: new Date().toISOString(),
    })
    .select('id')
    .single()

  if (qError || !questionnaire) {
    throw new Error(`Error creando cuestionario: ${qError?.message}`)
  }

  const questionnaire_id = questionnaire.id

  try {
    // ── 2. Zonas con respuestas (paralelo entre zonas) ─────────────────────
    const zonesWithAnswers = store.selectedZones.filter((z) => z.answers)

    await Promise.all(
      zonesWithAnswers.map(async (zone) => {
        // Crear body_zone
        const { data: bodyZone, error: bzError } = await supabase
          .from('body_zones')
          .insert({
            questionnaire_id,
            zone_code: zone.zone_code,
            side: zone.side,
          })
          .select('id')
          .single()

        if (bzError || !bodyZone) {
          throw new Error(`Error creando body_zone ${zone.zone_code}: ${bzError?.message}`)
        }

        // Crear zone_answers para esta zona
        if (zone.answers) {
          const answerRows = answersToRows(bodyZone.id, zone.answers)
          if (answerRows.length > 0) {
            const { error: zaError } = await supabase
              .from('zone_answers')
              .insert(answerRows)
            if (zaError) {
              throw new Error(`Error guardando respuestas de zona: ${zaError.message}`)
            }
          }
        }
      })
    )

    // ── 3. Respuestas globales ────────────────────────────────────────────
    const globalRows = globalAnswersToRows(questionnaire_id, store.globalAnswers)
    if (globalRows.length > 0) {
      const { error: gaError } = await supabase
        .from('global_answers')
        .insert(globalRows)
      if (gaError) {
        throw new Error(`Error guardando respuestas globales: ${gaError.message}`)
      }
    }

    // ── 4. Generar informe via API ────────────────────────────────────────
    const response = await fetch('/api/generate-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionnaire_id }),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(`Error generando informe: ${err.error ?? response.statusText}`)
    }

    const { report_id } = await response.json()
    if (!report_id) throw new Error('La API no devolvió report_id')

    return report_id as string

  } catch (err) {
    // Limpiar el questionnaire huérfano si algo falló
    await supabase.from('questionnaires').delete().eq('id', questionnaire_id)
    throw err
  }
}
