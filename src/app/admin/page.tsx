// ─────────────────────────────────────────────────────────────────────────────
// Rezeta 50 · /admin — Panel de cuestionarios completados
// Server Component — solo accesible con rol 'admin' (verificado en layout)
// ─────────────────────────────────────────────────────────────────────────────

import type { Metadata } from 'next'
import Link from 'next/link'
import { createServerClient } from '@supabase/ssr'
import type { Database, GlobalLevel } from '@/types/database'
import { ClipboardList, Users, BarChart2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Panel Admin · Rezeta 50',
  robots: { index: false },
}

// ── Service role client ───────────────────────────────────────────────────────

function createServiceClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const LEVEL_COLORS: Record<string, string> = {
  preventivo:    'bg-green-100 text-green-700',
  atencion:      'bg-amber-100 text-amber-700',
  rehabilitador: 'bg-orange-100 text-orange-700',
  derivacion:    'bg-red-100 text-red-700',
  // compat antiguo
  verde: 'bg-green-100 text-green-700',
  ambar: 'bg-amber-100 text-amber-700',
  rojo:  'bg-red-100 text-red-700',
}

const LEVEL_LABELS: Record<string, string> = {
  preventivo:    'Preventivo',
  atencion:      'Atención',
  rehabilitador: 'Rehabilitador',
  derivacion:    'Derivación',
  verde: 'Verde',
  ambar: 'Ámbar',
  rojo:  'Rojo',
}

const ZONE_LABELS: Record<string, string> = {
  cervical: 'Cerv', dorsal: 'Dors', lumbar: 'Lumb',
  shoulder: 'Homb', elbow: 'Codo', wrist: 'Muñ',
  hip: 'Cad', knee: 'Rod', ankle_foot: 'Tob',
}

function formatDate(d: string) {
  return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(d))
}

// ── Page ──────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 20

export default async function AdminPage({
  searchParams,
}: {
  searchParams: { page?: string; nivel?: string }
}) {
  const service = createServiceClient()
  const page = Math.max(1, parseInt(searchParams.page ?? '1', 10))
  const nivelFilter = searchParams.nivel ?? 'all'

  // 1. Obtener reports con questionnaire data
  const { data: reports } = await service
    .from('reports')
    .select('id, user_id, created_at, report_data, questionnaire_id')
    .order('created_at', { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)

  // 2. Count total para paginación
  const { count } = await service
    .from('reports')
    .select('id', { count: 'exact', head: true })

  // 3. Obtener emails de usuarios (service role tiene acceso a auth.admin)
  const userIds = Array.from(new Set((reports ?? []).map((r) => r.user_id)))
  const emailMap = new Map<string, string>()
  for (const uid of userIds) {
    const { data: u } = await service.auth.admin.getUserById(uid)
    if (u?.user?.email) emailMap.set(uid, u.user.email)
  }

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  // Tipado del report_data
  type RD = { global_score?: number; global_level?: string; zone_results?: Array<{ zone_code: string; side: string|null; level: string }> }
  const rows = (reports ?? []).map((r) => {
    const data = r.report_data as unknown as RD
    return {
      id:           r.id,
      questionnaire_id: r.questionnaire_id,
      user_id:      r.user_id,
      email:        emailMap.get(r.user_id) ?? r.user_id.slice(0, 8) + '...',
      created_at:   r.created_at,
      global_score: data.global_score ?? 0,
      global_level: (data.global_level ?? 'atencion') as GlobalLevel | string,
      zones:        data.zone_results ?? [],
    }
  })

  // Filtro por nivel (client-side sobre los datos ya cargados)
  const filtered = nivelFilter === 'all'
    ? rows
    : rows.filter((r) => r.global_level === nivelFilter)

  // Stats
  const totalReports = count ?? 0
  const niveles = rows.reduce((acc, r) => {
    acc[r.global_level] = (acc[r.global_level] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#1A3C5E]">Panel de Administración</h1>
          <p className="text-sm text-slate-500 mt-1">Cuestionarios completados por usuarios</p>
        </div>
        <Link
          href="/admin/programas"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white"
          style={{ background: '#E8A020' }}
        >
          <BarChart2 size={16} />
          Gestionar programas
        </Link>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: totalReports, icon: <ClipboardList size={16} /> },
          { label: 'Rehabilitador', value: (niveles.rehabilitador ?? 0) + (niveles.rojo ?? 0), color: 'text-orange-600' },
          { label: 'Derivación', value: niveles.derivacion ?? 0, color: 'text-red-600' },
          { label: 'Usuarios únicos', value: new Set(rows.map(r => r.user_id)).size, icon: <Users size={16} /> },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className="text-2xl font-black text-[#1A3C5E]">{s.value}</div>
            <div className={`text-xs text-slate-500 mt-1 ${s.color ?? ''}`}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filtro por nivel */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'preventivo', 'atencion', 'rehabilitador', 'derivacion'] as const).map((n) => (
          <Link
            key={n}
            href={`/admin?nivel=${n}&page=1`}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              nivelFilter === n
                ? 'bg-[#1A3C5E] text-white border-[#1A3C5E]'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
            }`}
          >
            {n === 'all' ? 'Todos' : LEVEL_LABELS[n]}
          </Link>
        ))}
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Fecha</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Usuario</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Zonas</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Score</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Nivel</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 text-sm">
                    No hay cuestionarios con este filtro.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                      {formatDate(r.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium text-slate-700 truncate max-w-[120px] block">{r.email}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {r.zones.map((z, i) => {
                          const zc = LEVEL_COLORS[z.level] ?? 'bg-slate-100 text-slate-600'
                          return (
                            <span key={i} className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${zc}`}>
                              {ZONE_LABELS[z.zone_code] ?? z.zone_code}
                              {z.side ? ` ${z.side}` : ''}
                            </span>
                          )
                        })}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-black text-[#1A3C5E]">{r.global_score}</span>
                      <span className="text-slate-400 text-xs">/100</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${LEVEL_COLORS[r.global_level] ?? 'bg-slate-100 text-slate-600'}`}>
                        {LEVEL_LABELS[r.global_level] ?? r.global_level}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/informe/${r.id}`}
                        className="text-xs font-semibold text-[#E8A020] hover:underline whitespace-nowrap"
                      >
                        Ver informe →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <span className="text-xs text-slate-500">
              Página {page} de {totalPages} · {totalReports} registros
            </span>
            <div className="flex gap-2">
              {page > 1 && (
                <Link href={`/admin?nivel=${nivelFilter}&page=${page - 1}`}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold hover:bg-slate-50">
                  ← Anterior
                </Link>
              )}
              {page < totalPages && (
                <Link href={`/admin?nivel=${nivelFilter}&page=${page + 1}`}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold hover:bg-slate-50">
                  Siguiente →
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
