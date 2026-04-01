// ─────────────────────────────────────────────────────────────────────────────
// Informe PREHAB — Athlete Health Score
// ─────────────────────────────────────────────────────────────────────────────

import { notFound } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'
import type { PrehabReportData, PrehabRiskZone, PrehabRecommendation } from '@/app/api/generate-prehab-report/route'

// ── Supabase ──────────────────────────────────────────────────────────────────

function createClient() {
  const cookieStore = cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch { /* */ }
        },
      },
    }
  )
}

// ── Constantes visuales ───────────────────────────────────────────────────────

const RISK_CONFIG = {
  bajo: {
    color: '#22c55e',
    glow: 'rgba(34,197,94,0.3)',
    bg: 'rgba(34,197,94,0.08)',
    border: 'rgba(34,197,94,0.25)',
    label: 'Riesgo Bajo',
    headline: 'Perfil atlético saludable',
    subtext: 'Tu Athlete Health Score indica un bajo riesgo de lesión. Mantén tus buenos hábitos de entrenamiento y prevención.',
  },
  moderado: {
    color: '#f59e0b',
    glow: 'rgba(245,158,11,0.3)',
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.25)',
    label: 'Riesgo Moderado',
    headline: 'Atención preventiva recomendada',
    subtext: 'Tu perfil presenta factores de riesgo que conviene gestionar. Sigue las recomendaciones para reducir tu exposición a lesiones.',
  },
  alto: {
    color: '#ef4444',
    glow: 'rgba(239,68,68,0.3)',
    bg: 'rgba(239,68,68,0.08)',
    border: 'rgba(239,68,68,0.25)',
    label: 'Riesgo Elevado',
    headline: 'Intervención preventiva urgente',
    subtext: 'Tu Athlete Health Score es bajo. Hay varios factores combinados que aumentan significativamente tu riesgo de lesión.',
  },
}

const ZONE_RISK = {
  alto:     { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.25)',  dot: '#ef4444' },
  moderado: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)', dot: '#f59e0b' },
  bajo:     { color: '#22c55e', bg: 'rgba(34,197,94,0.1)',  border: 'rgba(34,197,94,0.25)',  dot: '#22c55e' },
}

const CAT_ICON: Record<string, string> = {
  carga:       '⚡',
  movilidad:   '🔄',
  fuerza:      '💪',
  recuperacion:'🛌',
  prevencion:  '🛡️',
}

const SPORT_LABELS: Record<string, string> = {
  futbol: 'Fútbol', padel: 'Pádel', running: 'Running', natacion: 'Natación',
  ciclismo: 'Ciclismo', gym: 'Gym / Fitness', crossfit: 'CrossFit',
  tenis: 'Tenis', baloncesto: 'Baloncesto', otro: 'Otro deporte',
}

const LEVEL_LABELS: Record<string, string> = {
  amateur: 'Amateur', semipro: 'Semiprofesional', elite: 'Elite / Profesional',
}

const SEASON_LABELS: Record<string, string> = {
  pre: 'Pre-temporada', in: 'En temporada', post: 'Post-temporada', off: 'Fuera de temporada',
}

const DAYS_LABELS: Record<string, string> = {
  '1-2': '1-2 días/sem', '3-4': '3-4 días/sem', '5-6': '5-6 días/sem', '7+': '7+ días/sem',
}

const HOURS_LABELS: Record<string, string> = {
  '<1': '< 1h/sesión', '1-2': '1-2h/sesión', '>2': '> 2h/sesión',
}

const GOAL_LABELS: Record<string, string> = {
  prevention: 'Prevención', flexibility: 'Flexibilidad', strength: 'Fuerza',
  speed: 'Velocidad', stress: 'Estrés', performance: 'Rendimiento',
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function PrehabInformePage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) notFound()

  const { data: report } = await supabase
    .from('reports')
    .select('report_data')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (!report) notFound()

  const data = report.report_data as unknown as PrehabReportData
  if (data?.module !== 'prehab') notFound()

  const cfg = RISK_CONFIG[data.riskLevel]
  const goals = data.goals as Record<string, number>

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#111111', color: '#fff' }}>

      {/* ── Header ───────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-10 px-4 sm:px-6 py-4 flex items-center justify-between border-b border-white/10"
        style={{ background: 'rgba(17,17,17,0.92)', backdropFilter: 'blur(8px)' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-xl font-black text-white">Rezeta</span>
          <span className="text-xs font-black px-1.5 py-0.5 rounded" style={{ background: '#F4DF49', color: '#111111' }}>50</span>
          <span className="text-xs text-white/30 font-medium ml-1">PREHAB</span>
        </div>
        <a
          href="/"
          className="text-xs text-white/40 hover:text-white/70 transition-colors font-medium"
        >
          Inicio
        </a>
      </header>

      <main className="flex-1 px-4 sm:px-6 py-8 max-w-2xl mx-auto w-full space-y-8">

        {/* ── HERO: Athlete Health Score ────────────────────── */}
        <section
          className="rounded-3xl p-6 sm:p-8 text-center relative overflow-hidden"
          style={{
            background: cfg.bg,
            border: `1px solid ${cfg.border}`,
            boxShadow: `0 0 60px ${cfg.glow}`,
          }}
        >
          {/* Score circular */}
          <div
            className="w-32 h-32 rounded-full flex flex-col items-center justify-center mx-auto mb-5"
            style={{
              border: `4px solid ${cfg.color}`,
              boxShadow: `0 0 40px ${cfg.glow}, inset 0 0 30px ${cfg.color}18`,
              background: 'rgba(0,0,0,0.3)',
            }}
          >
            <span className="text-4xl font-black" style={{ color: cfg.color }}>
              {data.athleteHealthScore}
            </span>
            <span className="text-xs text-white/40 font-medium">/ 100</span>
          </div>

          <span
            className="inline-block text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-wide mb-3"
            style={{ background: cfg.color, color: '#111111' }}
          >
            {cfg.label}
          </span>

          <h1 className="text-2xl font-black text-white mb-2">{cfg.headline}</h1>
          <p className="text-sm text-white/55 leading-relaxed max-w-sm mx-auto">{cfg.subtext}</p>

          {/* Etiqueta AHS */}
          <p className="text-xs text-white/25 mt-4 uppercase tracking-widest font-medium">
            Athlete Health Score
          </p>
        </section>

        {/* ── Perfil de atleta ───────────────────────────────── */}
        <section>
          <h2 className="text-xs font-bold text-white/35 uppercase tracking-widest mb-3">
            Perfil del atleta
          </h2>
          <div
            className="grid grid-cols-2 sm:grid-cols-3 gap-3 rounded-2xl p-4"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            {[
              { label: 'Deporte',    value: SPORT_LABELS[data.sport] ?? data.sport },
              { label: 'Nivel',      value: LEVEL_LABELS[data.profile.level] ?? data.profile.level },
              { label: 'Temporada',  value: SEASON_LABELS[data.profile.season] ?? data.profile.season },
              { label: 'Edad',       value: data.profile.ageRange + ' años' },
              { label: 'Frecuencia', value: DAYS_LABELS[data.trainingLoad.days] ?? data.trainingLoad.days },
              { label: 'Sesión',     value: HOURS_LABELS[data.trainingLoad.hours] ?? data.trainingLoad.hours },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <p className="text-xs text-white/30 mb-0.5">{label}</p>
                <p className="text-sm font-bold text-white">{value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Intensidad de entrenamiento ────────────────────── */}
        <section>
          <h2 className="text-xs font-bold text-white/35 uppercase tracking-widest mb-3">
            Carga de entrenamiento
          </h2>
          <div
            className="p-4 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white/60">Intensidad media</span>
              <span className="text-sm font-bold text-white">{data.trainingLoad.intensity} / 5</span>
            </div>
            <div
              className="h-2 rounded-full overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.08)' }}
            >
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${(data.trainingLoad.intensity / 5) * 100}%`,
                  background: data.trainingLoad.intensity <= 2
                    ? '#22c55e'
                    : data.trainingLoad.intensity <= 3
                    ? '#f59e0b'
                    : '#ef4444',
                  boxShadow: `0 0 8px ${data.trainingLoad.intensity <= 2 ? 'rgba(34,197,94,0.5)' : data.trainingLoad.intensity <= 3 ? 'rgba(245,158,11,0.5)' : 'rgba(239,68,68,0.5)'}`,
                }}
              />
            </div>
          </div>
        </section>

        {/* ── Zonas de riesgo ────────────────────────────────── */}
        {data.riskZones.length > 0 && (
          <section>
            <h2 className="text-xs font-bold text-white/35 uppercase tracking-widest mb-3">
              Zonas de mayor riesgo
            </h2>
            <div className="space-y-2">
              {(data.riskZones as PrehabRiskZone[]).map((zone) => {
                const zCfg = ZONE_RISK[zone.risk]
                return (
                  <div
                    key={`${zone.code}-${zone.side}`}
                    className="flex items-start gap-3 p-4 rounded-2xl"
                    style={{ background: zCfg.bg, border: `1px solid ${zCfg.border}` }}
                  >
                    <span
                      className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                      style={{ background: zCfg.dot, boxShadow: `0 0 6px ${zCfg.dot}` }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-white">{zone.label}</span>
                        <span
                          className="text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: `${zCfg.color}20`, color: zCfg.color }}
                        >
                          {zone.risk}
                        </span>
                      </div>
                      <p className="text-xs text-white/40 leading-relaxed">
                        {zone.reasons.join(' · ')}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* ── Objetivos ──────────────────────────────────────── */}
        {Object.keys(goals).length > 0 && (
          <section>
            <h2 className="text-xs font-bold text-white/35 uppercase tracking-widest mb-3">
              Tus objetivos prioritarios
            </h2>
            <div className="space-y-2">
              {Object.entries(goals)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 4)
                .map(([key, val]) => (
                  <div
                    key={key}
                    className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                  >
                    <div
                      className="h-1.5 rounded-full overflow-hidden flex-1"
                      style={{ background: 'rgba(255,255,255,0.07)' }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(val / 5) * 100}%`,
                          background: '#F4DF49',
                          boxShadow: '0 0 6px rgba(244,223,73,0.4)',
                        }}
                      />
                    </div>
                    <span className="text-xs text-white/60 w-24 text-right flex-shrink-0">
                      {GOAL_LABELS[key] ?? key}
                    </span>
                    <span className="text-xs font-bold text-white/80 w-6 text-right flex-shrink-0">
                      {val}/5
                    </span>
                  </div>
                ))}
            </div>
          </section>
        )}

        {/* ── Recomendaciones ────────────────────────────────── */}
        {data.recommendations.length > 0 && (
          <section>
            <h2 className="text-xs font-bold text-white/35 uppercase tracking-widest mb-3">
              Plan de prevención personalizado
            </h2>
            <div className="space-y-3">
              {(data.recommendations as PrehabRecommendation[]).map((rec, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl"
                  style={{
                    background: i === 0
                      ? 'rgba(244,223,73,0.06)'
                      : 'rgba(255,255,255,0.03)',
                    border: i === 0
                      ? '1px solid rgba(244,223,73,0.2)'
                      : '1px solid rgba(255,255,255,0.07)',
                  }}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-lg flex-shrink-0">
                      {CAT_ICON[rec.category] ?? '💡'}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-white mb-1">{rec.title}</p>
                      <p className="text-xs text-white/50 leading-relaxed">{rec.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── CTA: REHAB ─────────────────────────────────────── */}
        {data.riskZones.some((z) => z.risk === 'alto') && (
          <section
            className="rounded-3xl p-6 text-center"
            style={{
              background: 'rgba(239,68,68,0.06)',
              border: '1px solid rgba(239,68,68,0.2)',
            }}
          >
            <p className="text-sm font-bold text-white mb-1">¿Tienes dolor activo?</p>
            <p className="text-xs text-white/50 mb-4">
              Algunas de tus zonas de riesgo requieren valoración clínica. Completa también el cuestionario REHAB para un análisis musculoesquelético detallado.
            </p>
            <a
              href="/cuestionario"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90"
              style={{ background: 'rgba(239,68,68,0.85)', color: '#fff' }}
            >
              Ir al cuestionario REHAB →
            </a>
          </section>
        )}

        {/* ── CTA Zincuenta ─────────────────────────────────── */}
        <section
          className="rounded-3xl p-6 sm:p-8 text-center"
          style={{
            background: 'rgba(244,223,73,0.06)',
            border: '1px solid rgba(244,223,73,0.2)',
          }}
        >
          <span
            className="inline-block text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-wide mb-4"
            style={{ background: '#F4DF49', color: '#111111' }}
          >
            Zincuenta Sport Club
          </span>
          <h3 className="text-xl font-black text-white mb-2">
            Trabaja con nuestros especialistas
          </h3>
          <p className="text-sm text-white/50 mb-5 leading-relaxed">
            Nuestros fisioterapeutas y preparadores físicos pueden diseñar un plan de prevención completamente personalizado basado en tu AHS.
          </p>
          <a
            href="https://zincuenta.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl font-black text-sm transition-all hover:opacity-90 active:scale-95"
            style={{ background: '#F4DF49', color: '#111111' }}
          >
            Contactar con Zincuenta →
          </a>
        </section>

        {/* ── Disclaimer ─────────────────────────────────────── */}
        <p className="text-xs text-white/20 text-center leading-relaxed pb-4">
          El Athlete Health Score es una herramienta de orientación preventiva. No sustituye el diagnóstico clínico ni la valoración por un profesional sanitario cualificado.
        </p>
      </main>
    </div>
  )
}
