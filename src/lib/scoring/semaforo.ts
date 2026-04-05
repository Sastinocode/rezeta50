// ── Semáforo — severity classification ───────────────────────────────────────
// Ranges are inclusive. Score 0-100 severity scale (higher = worse).

export type SemaforoColor = 'verde' | 'amarillo' | 'rojo'

export interface SemaforoResult {
  color: SemaforoColor
  label: string       // short label for UI badges
  mensaje: string     // one-line description
  cta: string         // call to action text
}

export function getSemaforo(score: number): SemaforoResult {
  if (score <= 39) {
    return {
      color: 'verde',
      label: 'Buena salud',
      mensaje: 'Tu movimiento está en buen estado. Enfócate en mantenerlo y mejorar tu rendimiento.',
      cta: 'Ver planes de mantenimiento',
    }
  }
  if (score <= 74) {
    return {
      color: 'amarillo',
      label: 'Atención recomendada',
      mensaje: 'Tienes molestias que conviene atender antes de que se agraven. Un plan personalizado puede ayudarte.',
      cta: 'Ver planes personalizados',
    }
  }
  return {
    color: 'rojo',
    label: 'Atención prioritaria',
    mensaje: 'Tu situación requiere atención profesional. Te recomendamos consultar con un especialista.',
    cta: 'Hablar con un especialista',
  }
}

export const SEMAFORO_COLORS: Record<SemaforoColor, { bg: string; text: string; border: string }> = {
  verde:    { bg: '#14532d', text: '#4ade80', border: '#16a34a' },
  amarillo: { bg: '#713f12', text: '#fbbf24', border: '#d97706' },
  rojo:     { bg: '#7f1d1d', text: '#f87171', border: '#dc2626' },
}
