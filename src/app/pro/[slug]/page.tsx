// ── Professional public profile ───────────────────────────────────────────────
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props) {
  return { title: `Perfil · ${params.slug} · Move` }
}

export default async function ProProfilePage({ params }: Props) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return <ErrorScreen message="Servicio no disponible" />
  }

  const supabase = createServiceClient()
  const { data: pro } = await supabase
    .from('professionals')
    .select('*')
    .eq('slug', params.slug)
    .eq('verificado', true)
    .eq('activo', true)
    .single()

  if (!pro) notFound()

  const initials = pro.nombre
    .split(' ')
    .map((w: string) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const waMessage = encodeURIComponent(
    `Hola ${pro.nombre}, te contacto a través de MoveNetwork. Me gustaría concertar una sesión.`
  )

  return (
    <div
      className="min-h-screen px-4 py-8 max-w-lg mx-auto"
      style={{ background: '#0d0d0d', color: '#fff' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Link href="/network" className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors">
          ← Profesionales
        </Link>
        <p className="text-xs text-neutral-500">Move by Zincuenta</p>
      </div>

      {/* Profile hero */}
      <div className="flex flex-col items-center text-center gap-4 mb-8">
        {pro.foto_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={pro.foto_url}
            alt={pro.nombre}
            className="w-24 h-24 rounded-full object-cover"
          />
        ) : (
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-black"
            style={{ background: '#1A4731', color: '#4ade80' }}
          >
            {initials}
          </div>
        )}

        <div>
          <h1 className="text-2xl font-black">{pro.nombre}</h1>
          <p className="text-green-400 text-sm mt-1">{pro.especialidad}</p>
          <p className="text-neutral-500 text-xs mt-1">📍 {pro.zona}</p>
        </div>

        {/* Verified badge */}
        <div
          className="px-3 py-1 rounded-full text-xs font-semibold"
          style={{ background: '#14532d', color: '#4ade80', border: '1px solid #16a34a' }}
        >
          ✓ Verificado por Move
        </div>
      </div>

      {/* Bio */}
      {pro.bio && (
        <div
          className="rounded-2xl p-5 mb-5"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-3">Sobre mí</h2>
          <p className="text-sm text-neutral-300 leading-relaxed">{pro.bio}</p>
        </div>
      )}

      {/* Details */}
      <div
        className="rounded-2xl p-5 mb-6"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-4">Detalles</h2>
        <dl className="space-y-3">
          <DetailRow label="Especialidad" value={pro.especialidad} />
          <DetailRow label="Zona" value={pro.zona} />
          {pro.precio_sesion && (
            <DetailRow label="Precio por sesión" value={`${pro.precio_sesion}€`} highlight />
          )}
        </dl>
      </div>

      {/* CTA */}
      {pro.whatsapp ? (
        <a
          href={`https://wa.me/${pro.whatsapp}?text=${waMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full py-4 rounded-2xl text-center font-bold text-sm transition-all active:scale-95 mb-3"
          style={{ background: '#1A4731', color: '#fff' }}
        >
          Contactar por WhatsApp →
        </a>
      ) : (
        <div
          className="w-full py-4 rounded-2xl text-center text-sm text-neutral-500 border border-white/8 mb-3"
        >
          Contacto no disponible actualmente
        </div>
      )}

      <Link
        href="/network"
        className="block w-full py-3 rounded-2xl text-center text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
      >
        Ver otros profesionales
      </Link>
    </div>
  )
}

function DetailRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <dt className="text-xs text-neutral-500">{label}</dt>
      <dd className="text-sm font-semibold" style={{ color: highlight ? '#4ade80' : '#e5e5e5' }}>
        {value}
      </dd>
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
