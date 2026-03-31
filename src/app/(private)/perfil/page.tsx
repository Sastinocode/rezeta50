import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { LogOut, ClipboardList, PlusCircle, ChevronRight } from 'lucide-react'

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr))
}

function LevelBadge({ level }: { level: string }) {
  const map = {
    verde: { bg: 'bg-green-100', text: 'text-green-700', label: 'Verde' },
    ambar: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Ámbar' },
    rojo:  { bg: 'bg-red-100',   text: 'text-red-700',   label: 'Rojo'  },
  } as const
  const style = map[level as keyof typeof map] ?? map.ambar
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${style.bg} ${style.text}`}>
      {style.label}
    </span>
  )
}

// ── Server Component ──────────────────────────────────────────────────────────

export default async function PerfilPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/registro')

  // Obtener informes del usuario con su cuestionario
  const { data: reports } = await supabase
    .from('reports')
    .select('id, created_at, report_data, questionnaire_id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const safeReports = reports ?? []

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="px-4 py-4 bg-white border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl font-black text-[#111111] tracking-tight">Rezeta</span>
          <span
            className="text-xs font-bold px-1.5 py-0.5 rounded"
            style={{ background: '#F4DF49', color: '#111111' }}
          >
            50
          </span>
        </div>
        {/* Sign out — necesita un Client Component, usamos un form action */}
        <form action="/api/auth/signout" method="POST">
          <button
            type="submit"
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-500 transition-colors"
          >
            <LogOut size={15} />
            Cerrar sesión
          </button>
        </form>
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-8 space-y-6">
        {/* Saludo */}
        <div>
          <h1 className="text-2xl font-black text-[#111111]">Mi perfil</h1>
          <p className="text-sm text-slate-500 mt-1">{user.email}</p>
        </div>

        {/* Nueva valoración */}
        <Link
          href="/cuestionario"
          className="flex items-center gap-3 p-4 rounded-2xl border-2 border-dashed border-[#F4DF49]/50 bg-[#FAFBE8]/50 hover:border-[#F4DF49] hover:bg-[#FAFBE8] transition-all"
        >
          <span
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: '#F4DF49' }}
          >
            <PlusCircle size={20} color="white" />
          </span>
          <div>
            <p className="font-bold text-[#111111] text-sm">Hacer nueva valoración</p>
            <p className="text-xs text-slate-500">Repite el cuestionario cuando quieras</p>
          </div>
        </Link>

        {/* Lista de informes */}
        <div>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <ClipboardList size={14} />
            Mis valoraciones
          </h2>

          {safeReports.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <p className="text-sm">Aún no tienes valoraciones guardadas.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {safeReports.map((report) => {
                const data = report.report_data as {
                  global_score?: number
                  global_level?: string
                  zone_results?: unknown[]
                } | null
                return (
                  <Link
                    key={report.id}
                    href={`/informe/${report.id}`}
                    className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-200 hover:border-[#F4DF49]/40 hover:shadow-sm transition-all"
                  >
                    {/* Score */}
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 font-black text-lg text-white"
                      style={{
                        background:
                          data?.global_level === 'verde' || data?.global_level === 'preventivo'
                            ? '#22c55e'
                          : data?.global_level === 'rojo' || data?.global_level === 'derivacion'
                            ? '#ef4444'
                          : data?.global_level === 'rehabilitador'
                            ? '#f97316'
                          : '#f59e0b',
                      }}
                    >
                      {data?.global_score ?? '—'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-semibold text-[#111111] text-sm">
                          Valoración #{safeReports.indexOf(report) + 1}
                        </span>
                        {data?.global_level && <LevelBadge level={data.global_level} />}
                      </div>
                      <p className="text-xs text-slate-500">
                        {formatDate(report.created_at)}{' '}
                        · {(data?.zone_results as unknown[])?.length ?? 0} zona(s)
                      </p>
                    </div>

                    <ChevronRight size={16} className="text-slate-400 flex-shrink-0" />
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
