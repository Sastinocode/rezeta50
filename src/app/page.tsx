import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, Shield, Zap } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Rezeta 50 · Valoración musculoesquelética y prevención de lesiones',
  description:
    'Cuestionarios gratuitos de readaptación y prevención deportiva. Descubre el estado de tus articulaciones y tu perfil atlético con informes personalizados.',
  alternates: { canonical: 'https://rezeta50.vercel.app/' },
}

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#111111' }}>

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
        <div className="max-w-2xl mx-auto space-y-4 mb-16">
          <p className="text-white/40 text-sm font-medium tracking-widest uppercase">
            Zincuenta Sport Club
          </p>
          <h1 className="text-4xl sm:text-6xl font-black text-white leading-tight tracking-tight">
            Tu cuerpo.
            <br />
            <span style={{ color: '#F4DF49' }}>Tu ventaja.</span>
          </h1>
          <p className="text-lg text-white/55 leading-relaxed max-w-lg mx-auto">
            Cuestionarios gratuitos desarrollados por fisioterapeutas.
            Elige tu módulo y recibe un informe personalizado en 5 minutos.
          </p>
        </div>

        {/* ── Módulos ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl w-full mx-auto px-2">

          {/* ── REHAB ── */}
          <div
            className="relative flex flex-col rounded-3xl overflow-hidden border transition-all duration-300 hover:scale-[1.02]"
            style={{
              background: 'rgba(255,255,255,0.03)',
              borderColor: 'rgba(255,255,255,0.12)',
            }}
          >
            {/* Badge */}
            <div className="px-6 pt-6">
              <span
                className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full tracking-wide uppercase"
                style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' }}
              >
                <Shield size={11} />
                Readaptación MSK
              </span>
            </div>

            <div className="px-6 pt-4 pb-2 flex-1">
              <h2 className="text-2xl font-black text-white leading-tight mb-3">
                REHAB
              </h2>
              <p className="text-sm text-white/50 leading-relaxed mb-5">
                Evalúa el estado de tus articulaciones y zonas musculares.
                Identifica patologías potenciales y recibe un plan de readaptación.
              </p>

              <ul className="space-y-2 mb-6">
                {[
                  'Mapa corporal de dolor',
                  'Evaluación por zonas',
                  'Semáforo de riesgo MSK',
                  'Programa de readaptación',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-xs text-white/60">
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: '#f87171', boxShadow: '0 0 6px rgba(239,68,68,0.5)' }}
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="px-6 pb-6">
              <Link
                href="/cuestionario"
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm transition-all hover:opacity-90 active:scale-95"
                style={{ background: 'rgba(239,68,68,0.85)', color: '#fff' }}
              >
                Empezar REHAB <ChevronRight size={16} />
              </Link>
            </div>
          </div>

          {/* ── PREHAB ── */}
          <div
            className="relative flex flex-col rounded-3xl overflow-hidden border transition-all duration-300 hover:scale-[1.02]"
            style={{
              background: 'rgba(244,223,73,0.04)',
              borderColor: 'rgba(244,223,73,0.25)',
              boxShadow: '0 0 40px rgba(244,223,73,0.06)',
            }}
          >
            {/* Badge */}
            <div className="px-6 pt-6">
              <span
                className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full tracking-wide uppercase"
                style={{ background: 'rgba(244,223,73,0.15)', color: '#F4DF49', border: '1px solid rgba(244,223,73,0.3)' }}
              >
                <Zap size={11} />
                Prevención deportiva
              </span>
            </div>

            <div className="px-6 pt-4 pb-2 flex-1">
              <h2 className="text-2xl font-black text-white leading-tight mb-3">
                PREHAB
              </h2>
              <p className="text-sm text-white/50 leading-relaxed mb-5">
                Analiza tu perfil atlético, carga de entrenamiento e historial.
                Anticipa lesiones antes de que ocurran con un plan preventivo personalizado.
              </p>

              <ul className="space-y-2 mb-6">
                {[
                  'Perfil deportivo completo',
                  'Análisis de carga de entrenamiento',
                  'Historial y molestias actuales',
                  'Athlete Health Score (AHS)',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-xs text-white/60">
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: '#F4DF49', boxShadow: '0 0 6px rgba(244,223,73,0.5)' }}
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="px-6 pb-6">
              <Link
                href="/prehab/cuestionario"
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-black text-sm transition-all hover:opacity-90 active:scale-95"
                style={{ background: '#F4DF49', color: '#111111' }}
              >
                Empezar PREHAB <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </div>

        {/* ── Disclaimer ─────────────────────────────────────────── */}
        <p className="text-xs text-white/25 leading-relaxed max-w-sm mx-auto mt-12 px-4 text-center">
          Herramienta de orientación preventiva. No sustituye el diagnóstico clínico.
          Ante dolor intenso o limitación funcional, consulta con un profesional sanitario.
        </p>
      </main>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="px-4 py-4 text-center text-xs text-white/25 border-t border-white/10">
        Rezeta 50 · Zincuenta Sport Club · Murcia
      </footer>
    </div>
  )
}
