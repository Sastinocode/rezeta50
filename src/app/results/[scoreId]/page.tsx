import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'
import { ScoreGauge } from '@/components/results/ScoreGauge'
import { getSemaforo, SEMAFORO_COLORS, type SemaforoColor } from '@/lib/scoring/semaforo'

interface Props {
  params: { scoreId: string }
}

export default async function ResultsPage({ params }: Props) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return <ErrorScreen message="Servicio no disponible" />
  }

  const supabase = createServiceClient()

  const { data: scoreRow } = await supabase
    .from('move_scores')
    .select('id, score, details, session_id, created_at')
    .eq('id', params.scoreId)
    .single()

  if (!scoreRow) notFound()

  const score = scoreRow.score
  const details = (scoreRow.details ?? {}) as Record<string, unknown>
  const semaforo = (details.semaforo as SemaforoColor) ?? getSemaforo(score).color
  const zone = (details.zone as string) ?? 'general'
  const isRedFlag = !!(details.red_flags)
  const redFlagReasons = (details.red_flags as string[]) ?? []
  const semaforoData = getSemaforo(score)
  const colors = SEMAFORO_COLORS[semaforo]

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start px-4 py-8 max-w-lg mx-auto"
      style={{ background: '#0d0d0d', color: '#fff' }}
    >
      {/* Header */}
      <div className="w-full flex items-center justify-between mb-8">
        <Link
          href="/"
          className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
        >
          ← Inicio
        </Link>
        <p className="text-xs text-neutral-500">Move by Zincuenta</p>
      </div>

      {/* Title */}
      <p className="text-xs uppercase tracking-widest text-neutral-500 mb-1">Tu MoveScore</p>

      {/* Gauge */}
      <ScoreGauge score={score} semaforo={semaforo} animate />

      {/* Semáforo badge */}
      <div
        className="mt-3 px-4 py-1.5 rounded-full text-sm font-semibold"
        style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
      >
        {semaforoData.label}
      </div>

      {/* Message */}
      <p className="mt-4 text-sm text-neutral-300 text-center leading-relaxed max-w-xs">
        {semaforoData.mensaje}
      </p>

      {/* Red flag warning */}
      {isRedFlag && (
        <div
          className="mt-5 w-full rounded-2xl p-4"
          style={{ background: 'rgba(127,29,29,0.25)', border: '1px solid #dc2626' }}
        >
          <p className="text-sm font-bold text-red-400 mb-2">⚠ Señales de alerta detectadas</p>
          <ul className="space-y-1">
            {redFlagReasons.map((r, i) => (
              <li key={i} className="text-xs text-red-300">• {r}</li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-red-300">
            Te recomendamos consultar con un profesional de salud antes de iniciar cualquier programa.
          </p>
        </div>
      )}

      {/* CTA section */}
      {!isRedFlag ? (
        <div className="mt-8 w-full space-y-3">
          <Link
            href={`/store?zone=${encodeURIComponent(zone)}&semaforo=${semaforo}`}
            className="block w-full py-4 rounded-2xl text-center font-bold text-sm transition-all active:scale-95"
            style={{ background: '#1A4731', color: '#fff' }}
          >
            {semaforoData.cta} →
          </Link>
          <Link
            href="/chat"
            className="block w-full py-3 rounded-2xl text-center text-xs text-neutral-400 hover:text-neutral-200 transition-colors border border-white/8"
          >
            Repetir evaluación
          </Link>
        </div>
      ) : (
        <div className="mt-8 w-full space-y-3">
          <a
            href="tel:+34000000000"
            className="block w-full py-4 rounded-2xl text-center font-bold text-sm transition-all active:scale-95"
            style={{ background: '#7f1d1d', color: '#fff' }}
          >
            Contactar especialista →
          </a>
          <Link
            href="/chat"
            className="block w-full py-3 rounded-2xl text-center text-xs text-neutral-400 hover:text-neutral-200 transition-colors border border-white/8"
          >
            Nueva evaluación
          </Link>
        </div>
      )}

      {/* Zone tag */}
      <p className="mt-6 text-xs text-neutral-600">
        Zona principal evaluada:{' '}
        <span className="text-neutral-400 capitalize">{zone.replace(/_/g, ' ')}</span>
      </p>
    </div>
  )
}

function ErrorScreen({ message }: { message: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0d0d0d' }}>
      <p className="text-neutral-400 text-sm">{message}</p>
    </div>
  )
}
