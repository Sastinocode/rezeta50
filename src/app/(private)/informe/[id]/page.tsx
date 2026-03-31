// ─────────────────────────────────────────────────────────────────────────────
// Rezeta 50 · /informe/[id] — Pantalla de informe personal
// Server Component protegido (layout.tsx verifica sesión)
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
  description: 'Tu informe musculoesquelético personalizado con semáforo de riesgo y programas de ejercicio recomendados.',
  robots: { index: false, follow: false },
}

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

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function InformePage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createClient()

  // 1. Verificar sesión
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/registro')

  // 2. Fetch del report
  const { data: report, error } = await supabase
    .from('reports')
    .select('id, user_id, created_at, report_data')
    .eq('id', params.id)
    .single()

  if (error || !report) notFound()

  // 3. Verificar pertenencia
  if (report.user_id !== user.id) redirect('/perfil')

  // 4. Parsear report_data
  const data = report.report_data as unknown as ReportData

  const globalScore     = data.global_score    ?? 0
  const globalLevel     = data.global_level    ?? 'atencion'
  const zoneResults     = data.zone_results    ?? []
  const redFlags        = data.red_flags        ?? []
  const programSnapshots = data.program_snapshots ?? []

  const hasRojo = zoneResults.some((z) => z.level === 'rojo')

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="px-4 py-4 bg-white border-b border-slate-100 flex items-center gap-3">
        <Link
          href="/perfil"
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-[#1A3C5E] transition-colors"
        >
          <ChevronLeft size={16} />
          Mis valoraciones
        </Link>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <span className="text-base font-black text-[#1A3C5E] tracking-tight">Rezeta</span>
          <span
            className="text-xs font-bold px-1.5 py-0.5 rounded"
            style={{ background: '#E8A020', color: 'white' }}
          >
            50
          </span>
        </div>
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-8 space-y-8">
        {/* Título */}
        <div>
          <h1 className="text-2xl font-black text-[#1A3C5E]">Tu informe MSK</h1>
          <p className="text-xs text-slate-400 mt-1">
            Generado el {formatDate(report.created_at)}
          </p>
        </div>

        {/* ── Resumen global ─────────────────────────────────────── */}
        <section>
          <ReportSummary
            globalScore={globalScore}
            globalLevel={globalLevel}
            zoneResults={zoneResults}
            redFlags={redFlags}
          />
        </section>

        {/* Disclaimer rojo si aplica */}
        {hasRojo && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
            <p className="text-xs text-red-700">{DISCLAIMER_ROJO}</p>
          </div>
        )}

        {/* ── Detalle por zona ───────────────────────────────────── */}
        {zoneResults.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
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
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              Tu plan recomendado
            </h2>
            <p className="text-xs text-slate-500">{DISCLAIMER_PROGRAMAS}</p>
            <div className="space-y-3">
              {programSnapshots.map((program) => (
                <ProgramCard key={program.id} program={program} />
              ))}
            </div>
          </section>
        )}

        {/* ── CTA presencial ─────────────────────────────────────── */}
        <section className="rounded-2xl border-2 border-dashed border-[#E8A020]/40 bg-[#FDF3DF]/50 p-5 text-center space-y-3">
          <p className="text-sm font-bold text-[#1A3C5E]">
            ¿Quieres una valoración presencial en Zincuenta?
          </p>
          <p className="text-xs text-slate-500">
            Nuestro equipo de profesionales puede evaluarte en persona y diseñar un plan totalmente personalizado.
          </p>
          <a
            href="https://zincuenta.es"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
            style={{ background: '#1A3C5E' }}
          >
            Visitar Zincuenta
            <ExternalLink size={14} />
          </a>
        </section>

        {/* ── CTA nueva valoración ───────────────────────────────── */}
        <div className="text-center">
          <Link
            href="/cuestionario"
            className="text-sm font-semibold text-[#E8A020] hover:underline"
          >
            + Hacer nueva valoración
          </Link>
        </div>

        {/* ── Disclaimer footer ──────────────────────────────────── */}
        <footer className="pt-4 border-t border-slate-200">
          <p className="text-[11px] text-slate-400 leading-relaxed text-center">
            {DISCLAIMER_FOOTER}
          </p>
        </footer>
      </main>
    </div>
  )
}
