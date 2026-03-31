import type { Metadata } from 'next'
import Link from 'next/link'
import { Gift, UserCheck, Stethoscope, ChevronRight } from 'lucide-react'
import { DISCLAIMER_INICIO } from '@/constants/disclaimers'

export const metadata: Metadata = {
  title: 'Rezeta 50 · Cuestionario musculoesquelético gratuito',
  description:
    'Cuestionario musculoesquelético gratuito en 5 minutos. Descubre el estado de tus articulaciones y recibe un informe personalizado con semáforo de riesgo.',
  alternates: { canonical: 'https://rezeta50.vercel.app/' },
}

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#111111]">
      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="px-6 py-5 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-xl font-black text-white tracking-tight">Rezeta</span>
          <span
            className="text-xs font-black px-1.5 py-0.5 rounded"
            style={{ background: '#F4DF49', color: '#111111' }}
          >
            50
          </span>
        </div>
        <span className="text-xs text-white/40 font-medium">Zincuenta Sport Club · Murcia</span>
      </header>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center">
        <div className="max-w-lg mx-auto space-y-8">
          {/* Badge */}
          <span
            className="inline-block text-xs font-bold px-3 py-1.5 rounded-full tracking-wide uppercase"
            style={{ background: '#F4DF49', color: '#111111' }}
          >
            🆓 Completamente gratuito
          </span>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight tracking-tight">
            Tu cuerpo te habla.
            <br />
            <span style={{ color: '#F4DF49' }}>¿Sabes qué te dice?</span>
          </h1>

          {/* Subtítulo */}
          <p className="text-lg text-white/60 leading-relaxed">
            Cuestionario musculoesquelético gratuito en <strong className="text-white">5 minutos</strong>.
            Descubre el estado de tus articulaciones y recibe un informe
            personalizado con recomendaciones de ejercicio.
          </p>

          {/* CTA principal */}
          <Link
            href="/cuestionario"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-lg transition-all active:scale-95 hover:opacity-90"
            style={{ background: '#F4DF49', color: '#111111' }}
          >
            Empezar valoración gratis
            <ChevronRight size={20} />
          </Link>

          {/* Puntos de valor */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            {[
              { icon: <Gift size={20} />, label: 'Gratuito', desc: 'Sin tarjeta. Sin trampa. 100% gratis.' },
              { icon: <UserCheck size={20} />, label: 'Personalizado', desc: 'Informe único según tus zonas y respuestas.' },
              { icon: <Stethoscope size={20} />, label: 'Clínico', desc: 'Basado en criterios fisioterapéuticos.' },
            ].map(({ icon, label, desc }) => (
              <div key={label} className="flex flex-col items-center gap-2 p-5 rounded-2xl border border-white/10 bg-white/5">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: '#F4DF49', color: '#111111' }}
                >
                  {icon}
                </div>
                <span className="font-bold text-white text-sm">{label}</span>
                <span className="text-xs text-white/50 text-center">{desc}</span>
              </div>
            ))}
          </div>

          {/* Disclaimer clínico */}
          <p className="text-xs text-white/30 leading-relaxed max-w-sm mx-auto mt-2 p-3 rounded-xl border border-white/10">
            {DISCLAIMER_INICIO}
          </p>
        </div>
      </main>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="px-4 py-4 text-center text-xs text-white/30 border-t border-white/10">
        Rezeta 50 · Zincuenta Sport Club · Murcia
      </footer>
    </div>
  )
}
