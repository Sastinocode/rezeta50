// ── Move Admin Panel ──────────────────────────────────────────────────────────
// No auth guard for MVP — accessible at /admin

import { revalidatePath } from 'next/cache'
import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'

export const metadata = { title: 'Admin · Move', robots: { index: false } }

// ── Server Action: verify professional ───────────────────────────────────────
async function verifyProfessional(formData: FormData) {
  'use server'
  const id = formData.get('id') as string
  if (!id) return
  const supabase = createServiceClient()
  await supabase.from('professionals').update({ verificado: true } as never).eq('id', id)
  revalidatePath('/admin')
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function AdminPage() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return <p className="text-neutral-400 text-sm p-8">Servidor no configurado.</p>
  }

  const supabase = createServiceClient()

  const [
    { data: professionals },
    { data: waitlist },
    { count: sessionCount },
  ] = await Promise.all([
    supabase
      .from('professionals')
      .select('id, nombre, especialidad, zona, verificado, activo, precio_sesion, whatsapp')
      .order('created_at', { ascending: false }),
    supabase
      .from('waitlist')
      .select('id, email, name, plan_interest, created_at, status')
      .order('created_at', { ascending: false })
      .limit(50),
    supabase
      .from('move_sessions')
      .select('id', { count: 'exact', head: true }),
  ])

  const pros = professionals ?? []
  const leads = waitlist ?? []
  const totalSessions = sessionCount ?? 0
  const verified = pros.filter((p) => p.verificado).length

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">Panel Admin</h1>
          <p className="text-sm text-neutral-400 mt-0.5">Move by Zincuenta</p>
        </div>
        <Link href="/" className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors">
          ← Inicio
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Sesiones totales', value: totalSessions },
          { label: 'Profesionales', value: pros.length },
          { label: 'Verificados', value: verified, color: '#4ade80' },
          { label: 'Lista de espera', value: leads.length },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl p-4"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <p className="text-2xl font-black" style={{ color: s.color ?? '#fff' }}>{s.value}</p>
            <p className="text-xs text-neutral-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Professionals */}
      <section>
        <h2 className="text-lg font-bold mb-3">Profesionales</h2>
        {pros.length === 0 ? (
          <p className="text-sm text-neutral-500">No hay profesionales registrados.</p>
        ) : (
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  {['Nombre', 'Especialidad', 'Zona', 'Precio', 'Estado', ''].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-neutral-400 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pros.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td className="px-4 py-3 font-medium">{p.nombre}</td>
                    <td className="px-4 py-3 text-neutral-400 text-xs">{p.especialidad}</td>
                    <td className="px-4 py-3 text-neutral-400 text-xs">{p.zona}</td>
                    <td className="px-4 py-3 text-neutral-300 text-xs">
                      {p.precio_sesion ? `${p.precio_sesion}€` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {p.verificado ? (
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: '#14532d', color: '#4ade80' }}>
                          Verificado
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(255,255,255,0.06)', color: '#a3a3a3' }}>
                          Pendiente
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {!p.verificado && (
                        <form action={verifyProfessional}>
                          <input type="hidden" name="id" value={p.id} />
                          <button
                            type="submit"
                            className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all active:scale-95"
                            style={{ background: '#1A4731', color: '#4ade80' }}
                          >
                            Verificar
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Waitlist */}
      <section>
        <h2 className="text-lg font-bold mb-3">Lista de espera</h2>
        {leads.length === 0 ? (
          <p className="text-sm text-neutral-500">No hay registros.</p>
        ) : (
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  {['Email', 'Nombre', 'Tipo', 'Fecha', 'Estado'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-neutral-400 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leads.map((l) => (
                  <tr key={l.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td className="px-4 py-3 text-neutral-200 text-xs font-mono">{l.email}</td>
                    <td className="px-4 py-3 text-neutral-400 text-xs">{l.name ?? '—'}</td>
                    <td className="px-4 py-3 text-neutral-400 text-xs capitalize">{l.plan_interest ?? '—'}</td>
                    <td className="px-4 py-3 text-neutral-500 text-xs whitespace-nowrap">
                      {new Date(l.created_at).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-neutral-400">{l.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
