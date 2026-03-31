// ─────────────────────────────────────────────────────────────────────────────
// Rezeta 50 · ReportSummary — hero del informe con nivel global + body map
// ─────────────────────────────────────────────────────────────────────────────

import type { GlobalLevel, ZoneLevel, ZoneResult, RedFlagResult } from '@/types/database'
import { AlertTriangle } from 'lucide-react'

// ── Config visual por nivel global ────────────────────────────────────────────

const GLOBAL_CONFIG: Record<GlobalLevel, {
  color: string
  glow: string
  bgCard: string
  border: string
  label: string
  icon: string
  headline: string
  subtext: string
}> = {
  preventivo: {
    color:   '#22c55e',
    glow:    'rgba(34,197,94,0.25)',
    bgCard:  'rgba(34,197,94,0.08)',
    border:  'rgba(34,197,94,0.3)',
    label:   'Preventivo',
    icon:    '✓',
    headline: '¡Tu estado musculoesquelético es muy bueno!',
    subtext:  'No se detectan zonas con afectación relevante. El trabajo preventivo te ayudará a mantenerte así.',
  },
  atencion: {
    color:   '#f59e0b',
    glow:    'rgba(245,158,11,0.25)',
    bgCard:  'rgba(245,158,11,0.08)',
    border:  'rgba(245,158,11,0.3)',
    label:   'Atención',
    icon:    '!',
    headline: 'Hay zonas que merecen atención.',
    subtext:  'Se detectaron molestias moderadas. Con el programa adecuado puedes mejorar tu situación.',
  },
  rehabilitador: {
    color:   '#f97316',
    glow:    'rgba(249,115,22,0.25)',
    bgCard:  'rgba(249,115,22,0.08)',
    border:  'rgba(249,115,22,0.3)',
    label:   'Rehabilitador',
    icon:    '↑',
    headline: 'Tu cuerpo necesita un programa de recuperación.',
    subtext:  'Varias zonas muestran afectación significativa. Inicia un programa de rehabilitación.',
  },
  derivacion: {
    color:   '#ef4444',
    glow:    'rgba(239,68,68,0.25)',
    bgCard:  'rgba(239,68,68,0.08)',
    border:  'rgba(239,68,68,0.3)',
    label:   'Derivación',
    icon:    '⚠',
    headline: 'Recomendamos valoración profesional.',
    subtext:  'Tu valoración indica afectación importante. Consulta con un médico o fisioterapeuta.',
  },
}

// ── Colores de zona para el body map ─────────────────────────────────────────

const ZONE_COLORS: Record<ZoneLevel, { fill: string; stroke: string; glow: string }> = {
  verde: { fill: '#22c55e', stroke: '#16a34a', glow: 'rgba(34,197,94,0.6)'  },
  ambar: { fill: '#f59e0b', stroke: '#d97706', glow: 'rgba(245,158,11,0.6)' },
  rojo:  { fill: '#ef4444', stroke: '#dc2626', glow: 'rgba(239,68,68,0.6)'  },
}
const INACTIVE_FILL   = '#1e3a5f'
const INACTIVE_STROKE = '#253f68'
const BODY_FILL       = '#1a2f50'
const BODY_STROKE     = '#253f68'

// ── Helpers body map ─────────────────────────────────────────────────────────

interface ZM { zone_code: string; side: string | null; level: ZoneLevel }

function zFill(zm: ZM[], code: string, side: string | null) {
  const m = zm.find((z) => z.zone_code === code && z.side === side)
  return m ? ZONE_COLORS[m.level].fill : INACTIVE_FILL
}
function zStroke(zm: ZM[], code: string, side: string | null) {
  const m = zm.find((z) => z.zone_code === code && z.side === side)
  return m ? ZONE_COLORS[m.level].stroke : INACTIVE_STROKE
}
function zSW(zm: ZM[], code: string, side: string | null) {
  return zm.find((z) => z.zone_code === code && z.side === side) ? '2' : '0.8'
}
function zFilter(zm: ZM[], code: string, side: string | null) {
  const m = zm.find((z) => z.zone_code === code && z.side === side)
  return m ? `drop-shadow(0 0 5px ${ZONE_COLORS[m.level].glow})` : undefined
}

// ── Static Body Map ───────────────────────────────────────────────────────────

function StaticBodyMap({ zoneResults }: { zoneResults: ZoneResult[] }) {
  const zm: ZM[] = zoneResults.map((z) => ({ zone_code: z.zone_code, side: z.side, level: z.level }))
  const f  = (c: string, s: string | null) => zFill(zm, c, s)
  const st = (c: string, s: string | null) => zStroke(zm, c, s)
  const sw = (c: string, s: string | null) => zSW(zm, c, s)
  const fi = (c: string, s: string | null) => zFilter(zm, c, s)

  return (
    <div
      className="rounded-2xl p-4"
      style={{ background: '#0b1929' }}
    >
      <div className="flex mb-2 text-[10px] font-bold tracking-widest uppercase select-none"
           style={{ color: 'rgba(255,255,255,0.3)' }}>
        <div className="flex-1 text-center">Frente</div>
        <div className="flex-1 text-center">Espalda</div>
      </div>

      <svg
        viewBox="0 0 300 420"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full max-w-xs mx-auto"
        aria-label="Mapa corporal con resultados"
      >
        {/* Divisor */}
        <line x1="150" y1="0" x2="150" y2="420" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />

        {/* ─── SILUETA FRENTE ─── */}
        <g fill={BODY_FILL} stroke={BODY_STROKE} strokeWidth="1">
          <ellipse cx="75" cy="36" rx="18" ry="21" />
          <rect x="68" y="54" width="14" height="14" rx="2" />
          <path d="M50,66 C40,70 36,82 35,96 L34,185 C34,198 52,208 75,210 C98,208 116,198 116,185 L115,96 C114,82 110,70 100,66 Z" />
          <path d="M115,72 C120,74 122,80 122,88 L120,130 C120,138 118,146 116,154 L114,174 C113,178 111,182 109,184 C107,186 105,184 104,182 L102,168 L103,148 L105,110 L107,88 C107,80 109,72 115,72 Z" />
          <path d="M35,72 C29,74 27,80 27,88 L28,130 C28,138 30,146 32,154 L34,174 C35,178 37,182 39,184 C41,186 43,184 44,182 L46,168 L45,148 L43,110 L41,88 C41,80 39,72 35,72 Z" />
          <path d="M78,210 L82,212 L84,295 L86,365 L84,392 L75,396 L73,396 L71,392 L70,365 L72,295 L74,212 Z" />
          <path d="M72,210 L68,212 L66,295 L64,365 L66,392 L75,396 L73,396 L71,392 L70,365 L72,295 L74,212 Z" />
        </g>

        {/* Zonas frente */}
        <ellipse cx="37" cy="76" rx="15" ry="10" fill={f('shoulder','r')} stroke={st('shoulder','r')} strokeWidth={sw('shoulder','r')} style={{ filter: fi('shoulder','r') }} opacity="0.95" />
        <ellipse cx="113" cy="76" rx="15" ry="10" fill={f('shoulder','l')} stroke={st('shoulder','l')} strokeWidth={sw('shoulder','l')} style={{ filter: fi('shoulder','l') }} opacity="0.95" />
        <ellipse cx="30" cy="133" rx="11" ry="13" fill={f('elbow','r')} stroke={st('elbow','r')} strokeWidth={sw('elbow','r')} style={{ filter: fi('elbow','r') }} opacity="0.95" />
        <ellipse cx="120" cy="133" rx="11" ry="13" fill={f('elbow','l')} stroke={st('elbow','l')} strokeWidth={sw('elbow','l')} style={{ filter: fi('elbow','l') }} opacity="0.95" />
        <ellipse cx="30" cy="172" rx="10" ry="12" fill={f('wrist','r')} stroke={st('wrist','r')} strokeWidth={sw('wrist','r')} style={{ filter: fi('wrist','r') }} opacity="0.95" />
        <ellipse cx="120" cy="172" rx="10" ry="12" fill={f('wrist','l')} stroke={st('wrist','l')} strokeWidth={sw('wrist','l')} style={{ filter: fi('wrist','l') }} opacity="0.95" />
        <ellipse cx="58" cy="218" rx="14" ry="11" fill={f('hip','r')} stroke={st('hip','r')} strokeWidth={sw('hip','r')} style={{ filter: fi('hip','r') }} opacity="0.95" />
        <ellipse cx="92" cy="218" rx="14" ry="11" fill={f('hip','l')} stroke={st('hip','l')} strokeWidth={sw('hip','l')} style={{ filter: fi('hip','l') }} opacity="0.95" />
        <ellipse cx="60" cy="295" rx="13" ry="16" fill={f('knee','r')} stroke={st('knee','r')} strokeWidth={sw('knee','r')} style={{ filter: fi('knee','r') }} opacity="0.95" />
        <ellipse cx="90" cy="295" rx="13" ry="16" fill={f('knee','l')} stroke={st('knee','l')} strokeWidth={sw('knee','l')} style={{ filter: fi('knee','l') }} opacity="0.95" />
        <ellipse cx="60" cy="371" rx="12" ry="17" fill={f('ankle_foot','r')} stroke={st('ankle_foot','r')} strokeWidth={sw('ankle_foot','r')} style={{ filter: fi('ankle_foot','r') }} opacity="0.95" />
        <ellipse cx="90" cy="371" rx="12" ry="17" fill={f('ankle_foot','l')} stroke={st('ankle_foot','l')} strokeWidth={sw('ankle_foot','l')} style={{ filter: fi('ankle_foot','l') }} opacity="0.95" />
        <text x="75" y="412" textAnchor="middle" fontSize="7" fill="rgba(255,255,255,0.2)">← D &nbsp; I →</text>

        {/* ─── SILUETA ESPALDA ─── */}
        <g fill={BODY_FILL} stroke={BODY_STROKE} strokeWidth="1">
          <ellipse cx="225" cy="36" rx="18" ry="21" />
          <rect x="218" y="54" width="14" height="14" rx="2" />
          <path d="M200,66 C190,70 186,82 185,96 L184,185 C184,198 202,208 225,210 C248,208 266,198 266,185 L265,96 C264,82 260,70 250,66 Z" />
          <path d="M265,72 C270,74 272,80 272,88 L270,130 C270,138 268,146 266,154 L264,174 C263,178 261,182 259,184 C257,186 255,184 254,182 L252,168 L253,148 L255,110 L257,88 C257,80 259,72 265,72 Z" />
          <path d="M185,72 C179,74 177,80 177,88 L178,130 C178,138 180,146 182,154 L184,174 C185,178 187,182 189,184 C191,186 193,184 194,182 L196,168 L195,148 L193,110 L191,88 C191,80 189,72 185,72 Z" />
          <path d="M228,210 L232,212 L234,295 L236,365 L234,392 L225,396 L223,396 L221,392 L220,365 L222,295 L224,212 Z" />
          <path d="M222,210 L218,212 L216,295 L214,365 L216,392 L225,396 L223,396 L221,392 L220,365 L222,295 L224,212 Z" />
        </g>

        {/* Zonas espalda */}
        <ellipse cx="225" cy="63" rx="13" ry="10" fill={f('cervical',null)} stroke={st('cervical',null)} strokeWidth={sw('cervical',null)} style={{ filter: fi('cervical',null) }} opacity="0.95" />
        <rect x="208" y="82" width="34" height="50" rx="5" fill={f('dorsal',null)} stroke={st('dorsal',null)} strokeWidth={sw('dorsal',null)} style={{ filter: fi('dorsal',null) }} opacity="0.95" />
        <rect x="210" y="138" width="30" height="40" rx="5" fill={f('lumbar',null)} stroke={st('lumbar',null)} strokeWidth={sw('lumbar',null)} style={{ filter: fi('lumbar',null) }} opacity="0.95" />
        <ellipse cx="187" cy="76" rx="15" ry="10" fill={f('shoulder','r')} stroke={st('shoulder','r')} strokeWidth={sw('shoulder','r')} style={{ filter: fi('shoulder','r') }} opacity="0.95" />
        <ellipse cx="263" cy="76" rx="15" ry="10" fill={f('shoulder','l')} stroke={st('shoulder','l')} strokeWidth={sw('shoulder','l')} style={{ filter: fi('shoulder','l') }} opacity="0.95" />
        <ellipse cx="180" cy="133" rx="11" ry="13" fill={f('elbow','r')} stroke={st('elbow','r')} strokeWidth={sw('elbow','r')} style={{ filter: fi('elbow','r') }} opacity="0.95" />
        <ellipse cx="270" cy="133" rx="11" ry="13" fill={f('elbow','l')} stroke={st('elbow','l')} strokeWidth={sw('elbow','l')} style={{ filter: fi('elbow','l') }} opacity="0.95" />
        <ellipse cx="180" cy="172" rx="10" ry="12" fill={f('wrist','r')} stroke={st('wrist','r')} strokeWidth={sw('wrist','r')} style={{ filter: fi('wrist','r') }} opacity="0.95" />
        <ellipse cx="270" cy="172" rx="10" ry="12" fill={f('wrist','l')} stroke={st('wrist','l')} strokeWidth={sw('wrist','l')} style={{ filter: fi('wrist','l') }} opacity="0.95" />
        <ellipse cx="208" cy="218" rx="14" ry="11" fill={f('hip','r')} stroke={st('hip','r')} strokeWidth={sw('hip','r')} style={{ filter: fi('hip','r') }} opacity="0.95" />
        <ellipse cx="242" cy="218" rx="14" ry="11" fill={f('hip','l')} stroke={st('hip','l')} strokeWidth={sw('hip','l')} style={{ filter: fi('hip','l') }} opacity="0.95" />
        <ellipse cx="210" cy="295" rx="13" ry="16" fill={f('knee','r')} stroke={st('knee','r')} strokeWidth={sw('knee','r')} style={{ filter: fi('knee','r') }} opacity="0.95" />
        <ellipse cx="240" cy="295" rx="13" ry="16" fill={f('knee','l')} stroke={st('knee','l')} strokeWidth={sw('knee','l')} style={{ filter: fi('knee','l') }} opacity="0.95" />
        <ellipse cx="210" cy="371" rx="12" ry="17" fill={f('ankle_foot','r')} stroke={st('ankle_foot','r')} strokeWidth={sw('ankle_foot','r')} style={{ filter: fi('ankle_foot','r') }} opacity="0.95" />
        <ellipse cx="240" cy="371" rx="12" ry="17" fill={f('ankle_foot','l')} stroke={st('ankle_foot','l')} strokeWidth={sw('ankle_foot','l')} style={{ filter: fi('ankle_foot','l') }} opacity="0.95" />
        <text x="225" y="412" textAnchor="middle" fontSize="7" fill="rgba(255,255,255,0.2)">← D &nbsp; I →</text>
      </svg>

      {/* Leyenda */}
      <div className="flex items-center justify-center gap-4 mt-3 text-[10px] font-medium select-none flex-wrap"
           style={{ color: 'rgba(255,255,255,0.45)' }}>
        {[
          { color: '#22c55e', glow: 'rgba(34,197,94,0.5)',  label: 'Verde'     },
          { color: '#f59e0b', glow: 'rgba(245,158,11,0.5)', label: 'Ámbar'     },
          { color: '#ef4444', glow: 'rgba(239,68,68,0.5)',  label: 'Rojo'      },
          { color: '#1e3a5f', glow: 'none',                 label: 'No evaluada' },
        ].map(({ color, glow, label }) => (
          <span key={label} className="flex items-center gap-1.5">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full"
              style={{ background: color, boxShadow: glow !== 'none' ? `0 0 6px ${glow}` : undefined }}
            />
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}

// ── ReportSummary ─────────────────────────────────────────────────────────────

interface ReportSummaryProps {
  globalScore: number
  globalLevel: GlobalLevel
  zoneResults: ZoneResult[]
  redFlags: RedFlagResult[]
}

export default function ReportSummary({
  globalScore,
  globalLevel,
  zoneResults,
  redFlags,
}: ReportSummaryProps) {
  const cfg = GLOBAL_CONFIG[globalLevel]

  return (
    <div className="space-y-4">
      {/* ── Hero: nivel global ──────────────────────────────────── */}
      <div
        className="rounded-2xl p-6 text-center space-y-4"
        style={{
          background: cfg.bgCard,
          border: `1px solid ${cfg.border}`,
          boxShadow: `0 0 40px ${cfg.glow}`,
        }}
      >
        {/* Score circular */}
        <div className="flex justify-center">
          <div
            className="w-24 h-24 rounded-full flex flex-col items-center justify-center"
            style={{
              background: `radial-gradient(circle, ${cfg.color}22 0%, ${cfg.color}08 100%)`,
              border: `3px solid ${cfg.color}`,
              boxShadow: `0 0 30px ${cfg.glow}, inset 0 0 20px ${cfg.color}10`,
            }}
          >
            <span className="text-3xl font-black leading-none" style={{ color: cfg.color }}>
              {globalScore}
            </span>
            <span className="text-[10px] font-semibold" style={{ color: `${cfg.color}99` }}>
              /100
            </span>
          </div>
        </div>

        {/* Badge nivel */}
        <div>
          <span
            className="inline-block text-xs font-bold px-3 py-1 rounded-full mb-2"
            style={{ background: cfg.color, color: '#111111' }}
          >
            {cfg.label}
          </span>
          <h2 className="text-lg font-black text-white leading-snug">{cfg.headline}</h2>
          <p className="text-xs mt-1.5" style={{ color: 'rgba(255,255,255,0.55)' }}>
            {cfg.subtext}
          </p>
        </div>
      </div>

      {/* ── Red flags ──────────────────────────────────────────── */}
      {redFlags.length > 0 && (
        <div
          className="rounded-2xl p-4 space-y-2"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}
        >
          <div className="flex items-center gap-2 font-bold text-sm text-red-400">
            <AlertTriangle size={15} />
            Avisos importantes
          </div>
          <ul className="space-y-1.5">
            {redFlags.map((flag, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-red-300">
                <span
                  className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black"
                  style={{ background: 'rgba(239,68,68,0.3)', color: '#fca5a5' }}
                >
                  !
                </span>
                <span>{flag.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Body map ───────────────────────────────────────────── */}
      <StaticBodyMap zoneResults={zoneResults} />
    </div>
  )
}
