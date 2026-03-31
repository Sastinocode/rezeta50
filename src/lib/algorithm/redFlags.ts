// ─────────────────────────────────────────────────────────────────────────────
// Rezeta 50 · Detección de Red Flags
// ─────────────────────────────────────────────────────────────────────────────

import type { RedFlagResult } from '@/types/database'
import type { ZoneScoreResult, ZoneAnswerMap } from './zoneScore'

export interface ZoneWithAnswers {
  zone_code: string
  side: string | null
  answers: ZoneAnswerMap
}

/**
 * Detecta red flags clínicas a partir de las puntuaciones de zona y las
 * respuestas del cuestionario.
 *
 * RF-02: Frecuencia constante + límite funcional severo
 * RF-03: Lesión reciente (<1 año) + dolor muy agudo (<2 semanas)
 * RF-05: ZoneScore >= 85 en zona cervical o lumbar
 * RF-06: 4 o más zonas en nivel rojo
 */
export function detectRedFlags(
  zoneScores: ZoneScoreResult[],
  zonesWithAnswers: ZoneWithAnswers[]
): RedFlagResult[] {
  const flags: RedFlagResult[] = []

  // Construir mapa de respuestas por zona_code+side para acceso rápido
  const answerMap = new Map<string, ZoneAnswerMap>()
  for (const z of zonesWithAnswers) {
    answerMap.set(`${z.zone_code}__${z.side ?? 'null'}`, z.answers)
  }

  const getAnswers = (zone_code: string, side: string | null): ZoneAnswerMap =>
    answerMap.get(`${zone_code}__${side ?? 'null'}`) ?? {}

  for (const zone of zoneScores) {
    const a = getAnswers(zone.zone_code, zone.side)
    const zoneName = zoneLabel(zone.zone_code, zone.side)

    // ── RF-02: constante + mucho límite funcional ─────────────────────────
    if (a.frequency === 'constant' && a.functional_limit === 'severe') {
      flags.push({
        id: 'RF-02',
        zone: zoneName,
        message:
          `${zoneName}: dolor constante con limitación funcional severa. ` +
          'Consulta médica o fisioterapéutica urgente antes de iniciar cualquier programa.',
      })
    }

    // ── RF-03: lesión reciente + inicio agudo ─────────────────────────────
    if (a.prior_injury === 'recent' && a.duration === 'less_1w') {
      flags.push({
        id: 'RF-03',
        zone: zoneName,
        message:
          `${zoneName}: lesión reciente con dolor de inicio agudo. ` +
          'Requiere evaluación médica antes de ejercicio.',
      })
    }

    // ── RF-05: score >= 85 en cervical o lumbar ────────────────────────────
    if (
      zone.score >= 85 &&
      (zone.zone_code === 'cervical' || zone.zone_code === 'lumbar')
    ) {
      flags.push({
        id: 'RF-05',
        zone: zoneName,
        message:
          `${zoneName}: puntuación de afectación muy alta (${zone.score}/100). ` +
          'Se recomienda valoración médica o fisioterapéutica prioritaria.',
      })
    }
  }

  // ── RF-06: 4+ zonas en rojo ───────────────────────────────────────────────
  const rojoCount = zoneScores.filter((z) => z.level === 'rojo').length
  if (rojoCount >= 4) {
    flags.push({
      id: 'RF-06',
      zone: 'general',
      message:
        `${rojoCount} zonas con nivel de afectación alto (rojo). ` +
        'Patrón de afectación generalizada — consulta con profesional sanitario.',
    })
  }

  // Deduplicar por id+zona (un mismo flag no debe repetirse)
  const seen = new Set<string>()
  return flags.filter((f) => {
    const key = `${f.id}__${f.zone}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

// ── Helper ─────────────────────────────────────────────────────────────────────

const ZONE_LABELS: Record<string, string> = {
  cervical:    'Cervical',
  dorsal:      'Dorsal',
  lumbar:      'Lumbar',
  shoulder:    'Hombro',
  elbow:       'Codo',
  wrist:       'Muñeca/Mano',
  hip:         'Cadera',
  knee:        'Rodilla',
  ankle_foot:  'Tobillo/Pie',
}

function zoneLabel(zone_code: string, side: string | null): string {
  const base = ZONE_LABELS[zone_code] ?? zone_code
  if (!side) return base
  return `${base} ${side === 'r' ? 'derecho' : 'izquierdo'}`
}
