import { createServiceClient } from '@/lib/supabase/server'

export default async function DevPage() {
  const supabase = createServiceClient()

  const { data: plans, error } = await supabase
    .from('plan_catalog')
    .select('*')

  return (
    <main className="min-h-screen bg-neutral-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <span className="text-xs font-mono text-neutral-500 bg-neutral-900 px-3 py-1 rounded-full border border-neutral-800">
            DEV · Verificación Supabase
          </span>
          <h1 className="text-2xl font-black mt-4 mb-1">plan_catalog</h1>
          <p className="text-sm text-neutral-500">
            URL: <span className="text-neutral-400">{process.env.NEXT_PUBLIC_SUPABASE_URL}</span>
          </p>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-500/40 rounded-xl p-5 mb-6">
            <p className="text-red-300 font-bold text-sm mb-1">Error al consultar plan_catalog</p>
            <p className="text-red-400/80 text-xs font-mono">{error.message}</p>
            <p className="text-red-400/60 text-xs font-mono mt-1">code: {error.code}</p>
          </div>
        )}

        {!error && (!plans || plans.length === 0) && (
          <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-xl p-5 mb-6">
            <p className="text-yellow-300 font-bold text-sm">Tabla vacía</p>
            <p className="text-yellow-400/70 text-xs mt-1">
              La tabla <code>plan_catalog</code> existe pero no tiene filas. Ejecuta el seed SQL.
            </p>
          </div>
        )}

        {plans && plans.length > 0 && (
          <p className="text-green-400 text-sm font-bold mb-6">
            ✓ Conexión OK · {plans.length} plan{plans.length !== 1 ? 'es' : ''} encontrado{plans.length !== 1 ? 's' : ''}
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {plans?.map((plan) => (
            <div
              key={plan.id}
              className="rounded-2xl border border-white/10 bg-white/4 p-6 flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                  style={{
                    background: plan.tier === 'pro' ? 'rgba(26,71,49,0.4)' : 'rgba(255,255,255,0.06)',
                    color: plan.tier === 'pro' ? '#4ade80' : '#9ca3af',
                    border: plan.tier === 'pro' ? '1px solid #1A4731' : '1px solid rgba(255,255,255,0.1)'
                  }}>
                  {plan.tier}
                </span>
                <span className="text-lg font-black text-yellow-400">
                  {plan.price_eur === 0 ? 'Gratis' : `${plan.price_eur} €`}
                </span>
              </div>

              <h2 className="text-lg font-black leading-tight">{plan.name}</h2>

              {plan.description && (
                <p className="text-xs text-neutral-400 leading-relaxed">{plan.description}</p>
              )}

              {Array.isArray(plan.features) && plan.features.length > 0 && (
                <ul className="space-y-1">
                  {(plan.features as string[]).map((f) => (
                    <li key={f} className="text-xs text-neutral-300 flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-green-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-auto pt-2 border-t border-white/5 text-xs text-neutral-600 font-mono space-y-0.5">
                {plan.duration_weeks && <p>⏱ {plan.duration_weeks} sem · {plan.sessions_per_week ?? '?'} ses/sem</p>}
                <p>slug: {plan.slug}</p>
                <p>sort: {plan.sort_order}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
