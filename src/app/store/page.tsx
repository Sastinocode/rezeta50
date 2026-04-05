import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'
import type { SemaforoColor } from '@/lib/scoring/semaforo'
import { SEMAFORO_COLORS } from '@/lib/scoring/semaforo'

interface Props {
  searchParams: { zone?: string; semaforo?: string }
}

interface Plan {
  id: string
  name: string
  description: string | null
  features: string[]
  price_eur: number
  duration_weeks: number | null
  harbiz_url: string | null
  active: boolean
}

export default async function StorePage({ searchParams }: Props) {
  const zone = searchParams.zone ?? ''
  const semaforo = (searchParams.semaforo ?? 'amarillo') as SemaforoColor

  let plans: Plan[] = []

  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const supabase = createServiceClient()
    const { data } = await supabase
      .from('plan_catalog')
      .select('id, name, description, features, price_eur, duration_weeks, harbiz_url, active')
      .eq('active', true)

    plans = (data as Plan[]) ?? []
  }

  const colors = SEMAFORO_COLORS[semaforo] ?? SEMAFORO_COLORS.amarillo

  return (
    <div
      className="min-h-screen flex flex-col px-4 py-8 max-w-lg mx-auto"
      style={{ background: '#0d0d0d', color: '#fff' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/" className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors">
          ← Inicio
        </Link>
        <p className="text-xs text-neutral-500">Move by Zincuenta</p>
      </div>

      {/* Title */}
      <h1 className="text-2xl font-black mb-1">Planes recomendados</h1>
      {zone && (
        <p className="text-sm text-neutral-400 mb-6">
          Basado en tu evaluación{' '}
          <span className="capitalize" style={{ color: colors.text }}>
            · {zone.replace(/_/g, ' ')}
          </span>
        </p>
      )}

      {/* Plans */}
      {plans.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-neutral-500 text-sm">No hay planes disponibles en este momento.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} accentColor={colors.text} />
          ))}
        </div>
      )}

      {/* Bottom CTA */}
      <div className="mt-8 pt-6 border-t border-white/8">
        <p className="text-xs text-neutral-500 text-center mb-4">
          ¿No encuentras lo que buscas?
        </p>
        <Link
          href="/chat"
          className="block w-full py-3 rounded-2xl text-center text-sm text-neutral-300 border border-white/10 hover:border-white/20 transition-colors"
        >
          Repetir evaluación
        </Link>
      </div>
    </div>
  )
}

function PlanCard({ plan, accentColor }: { plan: Plan; accentColor: string }) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h2 className="font-bold text-base leading-tight">{plan.name}</h2>
          {plan.duration_weeks && (
            <p className="text-xs text-neutral-500 mt-0.5">{plan.duration_weeks} semanas</p>
          )}
        </div>
        <div className="text-right flex-shrink-0 ml-3">
          <p className="text-xl font-black" style={{ color: accentColor }}>
            {plan.price_eur}€
          </p>
        </div>
      </div>

      {plan.description && (
        <p className="text-sm text-neutral-400 mb-3 leading-relaxed">{plan.description}</p>
      )}

      {plan.features && plan.features.length > 0 && (
        <ul className="space-y-1 mb-4">
          {plan.features.map((f, i) => (
            <li key={i} className="text-xs text-neutral-400 flex items-start gap-1.5">
              <span style={{ color: accentColor }}>✓</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>
      )}

      {plan.harbiz_url ? (
        <a
          href={plan.harbiz_url}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full py-3 rounded-xl text-center font-bold text-sm transition-all active:scale-95"
          style={{ background: '#1A4731', color: '#fff' }}
        >
          Empezar plan →
        </a>
      ) : (
        <button
          className="w-full py-3 rounded-xl text-sm font-semibold text-neutral-400 border border-white/10 cursor-not-allowed"
          disabled
        >
          Próximamente
        </button>
      )}
    </div>
  )
}
