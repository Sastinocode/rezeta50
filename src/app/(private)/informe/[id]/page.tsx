// ─────────────────────────────────────────────────────────────────────────────
// Rezeta 50 · /informe/[id] — Informe personal (dark theme Zincuenta)
// ─────────────────────────────────────────────────────────────────────────────

import type { Metadata } from 'next'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { ReportData } from '@/types/database'
import { DISCLAIMER_FOOTER, DISCLAIMER_PROGRAMAS, DISCLAIMER_ROJO } from '@/constants/disclaimers'
import ReportSummary from '@/components/report/ReportSummary'
import ZoneCard from '@/components/report/ZoneCard'
import ProgramCard from '@/components/report/ProgramCard'
import { ChevronLeft, ExternalLink } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Tu informe personalizado',
  robots: { index: false, follow: false },
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date(dateStr))
}

export default async function InformePage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/registro')

  const { data: report, error } = await supabase
    .from('reports')
    .select('id, user_id, created_at, report_data')
    .eq('id', params.id)
    .single()

  if (error || !report) notFound()
  if (report.user_id !== user.id) redirect('/perfil')

  const data             = report.report_data as unknown as ReportData
  const globalScore      = data.global_score      ?? 0
  const globalLevel      = data.global_level      ?? 'atencion'
  const zoneResults      = data.zone_results      ?? []
  const redFlags         = data.red_flags         ?? []
  const programSnapshots = data.program_snapshots ?? []
  const hasRojo          = zoneResults.some((z) => z.level === 'rojo')

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#111111' }}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <header
        className="px-4 py-4 flex items-center gap-3 sticky top-0 z-10"
        style={{ background: 'rgba(17,17,17,0.95)', borderBottom: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)' }}
      >
        <Link
          href="/perfil"
          className="flex items-center gap-1 text-sm transition-colors"
          style={{ color: 'rgba(255,255,255,0.5)' }}
        >
          <ChevronLeft size={16} />
          Mis valoraciones
        </Link>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <span className="text-base font-black text-white tracking-tight">Rezeta</span>
          <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ background: '#F4DF49', color: '#111111' }}>
            50
          </span>
        </div>
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-8 space-y-6">

        {/* ── Título ─────────────────────────────────────────────── */}
        <div>
          <h1 className="text-2xl font-black text-white">Tu informe MSK</h1>
          <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
            {formatDate(report.created_at)}
          </p>
        </div>

        {/* ── Resumen global + body map ───────────────────────────── */}
        <ReportSummary
          globalScore={globalScore}
          globalLevel={globalLevel}
          zoneResults={zoneResults}
          redFlags={redFlags}
        />

        {/* ── Aviso rojo ─────────────────────────────────────────── */}
        {hasRojo && (
          <div
            className="rounded-2xl p-4"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}
          >
            <p className="text-xs leading-relaxed text-red-300">{DISCLAIMER_ROJO}</p>
          </div>
        )}

        {/* ── Detalle por zona ───────────────────────────────────── */}
        {zoneResults.length > 0 && (
          <section className="space-y-3">
            <h2
              className="text-[11px] font-bold tracking-widest uppercase"
              style={{ color: 'rgba(255,255,255,0.35)' }}
            >
              Detalle por zona
            </h2>
            {zoneResults.map((zone, i) => (
              <ZoneCard key={i} result={zone} />
            ))}
          </section>
        )}

        {/* ── Plan recomendado ───────────────────────────────────── */}
        {programSnapshots.length > 0 && (
          <section className="space-y-3">
            <h2
              className="text-[11px] font-bold tracking-widest uppercase"
              style={{ color: 'rgba(255,255,255,0.35)' }}
            >
              Tu plan recomendado
            </h2>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {DISCLAIMER_PROGRAMAS}
            </p>
            {programSnapshots.map((program) => (
              <ProgramCard key={program.id} program={program} />
            ))}
          </section>
        )}

        {/* ── CTA Zincuenta ──────────────────────────────────────── */}
        <section
          className="rounded-2xl p-6 text-center space-y-3"
          style={{
            background: 'rgba(244,223,73,0.06)',
            border: '1px solid rgba(244,223,73,0.2)',
          }}
        >
          <p className="text-base font-black text-white">
            ¿Quieres una valoración presencial?
          </p>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Nuestro equipo en Zincuenta Sport Club puede evaluarte en persona y diseñar un plan totalmente personalizado.
          </p>
          <a
            href="https://zincuenta.es"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all active:scale-95"
            style={{ background: '#F4DF49', color: '#111111' }}
          >
            Visitar Zincuenta
            <ExternalLink size={14} />
          </a>
        </section>

        {/* ── Nueva valoración ───────────────────────────────────── */}
        <div className="text-center pb-4">
          <Link
            href="/cuestionario"
            className="text-sm font-semibold transition-colors"
            style={{ color: 'rgba(255,255,255,0.4)' }}
          >
            + Hacer nueva valoración
          </Link>
        </div>

        {/* ── Disclaimer ─────────────────────────────────────────── */}
        <footer
          className="pt-4 text-center"
          style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
        >
          <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.25)' }}>
            {DISCLAIMER_FOOTER}
          </p>
        </footer>
      </main>
    </div>
  )
}
