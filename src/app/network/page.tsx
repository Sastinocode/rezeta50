// ── MoveNetwork — Professionals listing ──────────────────────────────────────
import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'

export const metadata = { title: 'MoveNetwork · Profesionales' }

interface Professional {
  id: string
  slug: string
  nombre: string
  especialidad: string
  zona: string
  bio: string | null
  foto_url: string | null
  precio_sesion: number | null
  whatsapp: string | null
}

export default async function NetworkPage({
  searchParams,
}: {
  searchParams: { especialidad?: string; zona?: string }
}) {
  let pros: Professional[] = []

  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const supabase = createServiceClient()
    let query = supabase
      .from('professionals')
      .select('id, slug, nombre, especialidad, zona, bio, foto_url, precio_sesion, whatsapp')
      .eq('verificado', true)
      .eq('activo', true)
      .order('created_at', { ascending: true })

    if (searchParams.especialidad) {
      query = query.ilike('especialidad', `%${searchParams.especialidad}%`)
    }
    if (searchParams.zona) {
      query = query.ilike('zona', `%${searchParams.zona}%`)
    }

    const { data } = await query
    pros = (data as Professional[]) ?? []
  }

  // Build unique filter options from results (all pros before filter)
  const allPros: Professional[] = pros

  return (
    <div
      className="min-h-screen px-4 py-8 max-w-4xl mx-auto"
      style={{ background: '#0d0d0d', color: '#fff' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Link href="/" className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors">
          ← Inicio
        </Link>
        <p className="text-xs text-neutral-500">Move by Zincuenta</p>
      </div>

      <h1 className="text-3xl font-black mb-1">MoveNetwork</h1>
      <p className="text-sm text-neutral-400 mb-8">Profesionales verificados en salud del movimiento</p>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        <FilterLink href="/network" active={!searchParams.especialidad && !searchParams.zona} label="Todos" />
        <FilterLink href="/network?zona=Murcia" active={searchParams.zona === 'Murcia'} label="Murcia" />
        <FilterLink href="/network?especialidad=fisioterapia" active={searchParams.especialidad === 'fisioterapia'} label="Fisioterapia" />
        <FilterLink href="/network?especialidad=readaptación" active={searchParams.especialidad === 'readaptación'} label="Readaptación" />
      </div>

      {/* Grid */}
      {pros.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-neutral-400 text-sm mb-4">No se encontraron profesionales con ese filtro.</p>
          <Link href="/network" className="text-xs text-green-400 hover:underline">Ver todos</Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {pros.map((pro) => (
            <ProCard key={pro.id} pro={pro} />
          ))}
        </div>
      )}

      {/* CTA for professionals */}
      <div
        className="mt-12 rounded-2xl p-6 text-center"
        style={{ background: 'rgba(26,71,49,0.15)', border: '1px solid #1A4731' }}
      >
        <p className="text-sm font-bold mb-1">¿Eres profesional?</p>
        <p className="text-xs text-neutral-400 mb-4">Únete a MoveNetwork y llega a pacientes que te necesitan.</p>
        <Link
          href="/#waitlist"
          className="inline-block px-5 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95"
          style={{ background: '#1A4731', color: '#fff' }}
        >
          Solicitar acceso →
        </Link>
      </div>
    </div>
  )
}

function FilterLink({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
      style={
        active
          ? { background: '#1A4731', color: '#4ade80', border: '1px solid #16a34a' }
          : { background: 'rgba(255,255,255,0.06)', color: '#a3a3a3', border: '1px solid rgba(255,255,255,0.08)' }
      }
    >
      {label}
    </Link>
  )
}

function ProCard({ pro }: { pro: Professional }) {
  const initials = pro.nombre
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-4"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      {/* Top: avatar + name */}
      <div className="flex items-start gap-4">
        {pro.foto_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={pro.foto_url}
            alt={pro.nombre}
            className="w-14 h-14 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-black flex-shrink-0"
            style={{ background: '#1A4731', color: '#4ade80' }}
          >
            {initials}
          </div>
        )}
        <div className="min-w-0">
          <h2 className="font-bold text-base leading-tight">{pro.nombre}</h2>
          <p className="text-xs text-green-400 mt-0.5">{pro.especialidad}</p>
          <p className="text-xs text-neutral-500 mt-0.5">📍 {pro.zona}</p>
        </div>
        {pro.precio_sesion && (
          <div className="ml-auto flex-shrink-0 text-right">
            <p className="text-lg font-black text-white">{pro.precio_sesion}€</p>
            <p className="text-[10px] text-neutral-500">/ sesión</p>
          </div>
        )}
      </div>

      {/* Bio excerpt */}
      {pro.bio && (
        <p className="text-xs text-neutral-400 leading-relaxed line-clamp-2">{pro.bio}</p>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-auto">
        <Link
          href={`/pro/${pro.slug}`}
          className="flex-1 py-2.5 rounded-xl text-center text-xs font-semibold transition-all border border-white/10 hover:border-white/20"
          style={{ color: '#e5e5e5' }}
        >
          Ver perfil
        </Link>
        {pro.whatsapp && (
          <a
            href={`https://wa.me/${pro.whatsapp}?text=${encodeURIComponent('Hola, te contacto a través de MoveNetwork. Me gustaría concertar una sesión.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2.5 rounded-xl text-center text-xs font-bold transition-all active:scale-95"
            style={{ background: '#1A4731', color: '#fff' }}
          >
            Contactar →
          </a>
        )}
      </div>
    </div>
  )
}
