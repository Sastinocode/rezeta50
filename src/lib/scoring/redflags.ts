// ── Red Flag Detection ─────────────────────────────────────────────────────────
// Red flags force score=100 and semáforo=rojo regardless of calculated value.
// They indicate conditions that require immediate professional referral.

import type { MoveChatPayload } from './calculateMoveScore'

export interface RedFlagResult {
  hasFlag: boolean
  reasons: string[]
}

// Keywords that suggest serious pathology in pain descriptions or goals text
const RED_FLAG_KEYWORDS = [
  'entumecimiento',
  'hormigueo',
  'pérdida de fuerza',
  'debilidad progresiva',
  'incontinencia',
  'pérdida de control',
  'parálisis',
  'fiebre',
  'pérdida de peso',
  'dolor nocturno intenso',
  'dolor en reposo',
  'traumatismo',
  'fractura',
  'cauda',
]

export function hasRedFlags(payload: MoveChatPayload): RedFlagResult {
  const reasons: string[] = []

  // 1. Derivación urgency always triggers red flag
  if (payload.nivel_urgencia === 'derivacion') {
    reasons.push('Nivel de urgencia: derivación médica requerida')
  }

  // 2. Extreme pain (≥9/10) on any zone
  for (const z of payload.zonas_afectadas ?? []) {
    if ((z.intensidad ?? 0) >= 9) {
      reasons.push(`Dolor muy intenso (${z.intensidad}/10) en ${z.zona}`)
      break
    }
  }

  // 3. Keyword scan in objective / recommendation text
  const textToScan = [
    payload.objetivo_principal ?? '',
    payload.recomendacion_principal ?? '',
  ].join(' ').toLowerCase()

  for (const kw of RED_FLAG_KEYWORDS) {
    if (textToScan.includes(kw)) {
      reasons.push(`Síntoma de alerta detectado: "${kw}"`)
      break // one is enough
    }
  }

  return { hasFlag: reasons.length > 0, reasons }
}
