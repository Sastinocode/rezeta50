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
    <div className="min-h-screen flex flex-col bg-white">
      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="px-4 py-4 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="text-xl font-black text-[#1A3C5E] tracking-tight">Rezeta</span>
          <span
            className="text-xs font-bold px-1.5 py-0.5 rounded"
            style={{ background: '#E8A020', color: 'white' }}
          >
            50
          </span>
        </div>
        <span className="text-xs text-slate-400">Zincuenta Sport Club · Murcia</span>
      </header>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 text-center">
        <div className="max-w-lg mx-auto space-y-6">
          {/* Badge */}
          <span
            className="inline-block text-xs font-semibold px-3 py-1 rounded-full"
            style={{ background: '#FDF3DF', color: '#E8A020' }}
          >
            🆓 Completamente gratuito
          </span>

          {/* Headline */}
          <h1 className="text-3xl sm:text-4xl font-black text-[#1A3C5E] leading-tight">
            Tu cuerpo te habla.
            <br />
            <span style={{ color: '#E8A020' }}>¿Sabes qué te dice?</span>
          </h1>

          {/* Subtítulo */}
          <p className="text-lg text-slate-600 leading-relaxed">
            Cuestionario musculoesquelético gratuito en <strong>5 minutos</strong>.
            Descubre el estado de tus articulaciones y recibe un informe
            personalizado con recomendaciones de ejercicio.
          </p>

          {/* CTA principal */}
          <Link
            href="/cuestionario"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all active:scale-95"
            style={{ background: '#E8A020' }}
          >
            Empezar valoración gratis
            <ChevronRight size={20} />
          </Link>

          {/* Puntos de valor */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
            <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-slate-50">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: '#FDF3DF' }}
              >
                <Gift size={20} style={{ color: '#E8A020' }} />
              </div>
              <span className="font-bold text-[#1A3C5E] text-sm">Gratuito</span>
              <span className="text-xs text-slate-500 text-center">
                Sin tarjeta. Sin trampa. 100% gratis.
              </span>
            </div>

            <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-slate-50">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: '#FDF3DF' }}
              >
                <UserCheck size={20} style={{ color: '#E8A020' }} />
              </div>
              <span className="font-bold text-[#1A3C5E] text-sm">Personalizado</span>
              <span className="text-xs text-slate-500 text-center">
                Informe único según tus zonas y respuestas.
              </span>
            </div>

            <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-slate-50">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: '#FDF3DF' }}
              >
                <Stethoscope size={20} style={{ color: '#E8A020' }} />
              </div>
              <span className="font-bold text-[#1A3C5E] text-sm">Clínico</span>
              <span className="text-xs text-slate-500 text-center">
                Basado en criterios fisioterapéuticos.
              </span>
            </div>
          </div>

          {/* Disclaimer clínico */}
          <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100">
            {DISCLAIMER_INICIO}
          </p>
        </div>
      </main>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="px-4 py-4 text-center text-xs text-slate-400 border-t border-slate-100">
        Rezeta 50 · Zincuenta Sport Club · Murcia
      </footer>
    </div>
  )
}
