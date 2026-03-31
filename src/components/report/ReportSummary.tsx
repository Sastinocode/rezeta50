// ─────────────────────────────────────────────────────────────────────────────
// Rezeta 50 · ReportSummary — encabezado del informe con semáforo global
// ─────────────────────────────────────────────────────────────────────────────

import type { GlobalLevel, ZoneLevel, ZoneResult, RedFlagResult } from '@/types/database'
import { AlertTriangle, Info } from 'lucide-react'

// ── Configuración visual por nivel global ─────────────────────────────────────

const GLOBAL_CONFIG: Record<GlobalLevel, {
  bg: string
  ring: string
  label: string
  headline: string
  subtext: string
}> = {
  preventivo: {
    bg:       '#22c55e',
    ring:     '#16a34a',
    label:    'Preventivo',
    headline: '¡Tu estado musculoesquelético es muy bueno!',
    subtext:  'No se detectan zonas con afectación relevante. El trabajo preventivo te ayudará a mantenerte así.',
  },
  atencion: {
    bg:       '#f59e0b',
    ring:     '#d97706',
    label:    'Atención',
    headline: 'Hay zonas que merecen atención.',
    subtext:  'Se han detectado molestias moderadas. Con el programa adecuado puedes mejorar tu situación.',
  },
  rehabilitador: {
    bg:       '#f97316',
    ring:     '#ea580c',
    label:    'Rehabilitador',
    headline: 'Tu cuerpo necesita un programa de recuperación.',
    subtext:  'Varias zonas muestran afectación significativa. Te recomendamos iniciar un programa de rehabilitación.',
  },
  derivacion: {
    bg:       '#ef4444',
    ring:     '#dc2626',
    label:    'Derivación',
    headline: 'Recomendamos valoración profesional urgente.',
    subtext:  'Tu valoración indica afectación importante en varias zonas. Consulta con un médico o fisioterapeuta antes de iniciar ejercicio.',
  },
}

// ── Colors por ZoneLevel para el body map ─────────────────────────────────────

const ZONE_COLORS: Record<ZoneLevel, string> = {
  verde: '#22c55e',
  ambar: '#f59e0b',
  rojo:  '#ef4444',
}
const COLOR_BODY     = '#f1f5f9'
const COLOR_BODY_STR = '#cbd5e1'
const COLOR_INACTIVE = '#e2e8f0'

// ── Componente body map estático ──────────────────────────────────────────────

interface ZoneColorMap {
  zone_code: string
  side: string | null
  level: ZoneLevel
}

function getZoneColor(
  zoneMap: ZoneColorMap[],
  zone_code: string,
  side: string | null
): string {
  const match = zoneMap.find(
    (z) => z.zone_code === zone_code && z.side === side
  )
  return match ? ZONE_COLORS[match.level] : COLOR_INACTIVE
}

function getZoneStroke(
  zoneMap: ZoneColorMap[],
  zone_code: string,
  side: string | null
): string {
  const match = zoneMap.find(
    (z) => z.zone_code === zone_code && z.side === side
  )
  if (!match) return '#cbd5e1'
  return match.level === 'verde' ? '#16a34a'
    : match.level === 'ambar' ? '#d97706'
    : '#dc2626'
}

function StaticBodyMap({ zoneResults }: { zoneResults: ZoneResult[] }) {
  const zm: ZoneColorMap[] = zoneResults.map((z) => ({
    zone_code: z.zone_code,
    side:      z.side,
    level:     z.level,
  }))

  const fill   = (code: string, side: string | null) => getZoneColor(zm, code, side)
  const stroke = (code: string, side: string | null) => getZoneStroke(zm, code, side)
  const sw     = (code: string, side: string | null) =>
    zm.find((z) => z.zone_code === code && z.side === side) ? '1.5' : '0.8'

  return (
    <div className="w-full">
      <div className="flex mb-1 text-xs font-medium text-slate-400 select-none">
        <div className="flex-1 text-center">FRENTE</div>
        <div className="flex-1 text-center">ESPALDA</div>
      </div>

      <svg
        viewBox="0 0 300 420"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full max-w-xs mx-auto"
        aria-label="Mapa corporal con zonas evaluadas"
      >
        {/* Divisor */}
        <line x1="150" y1="0" x2="150" y2="420" stroke="#e2e8f0" strokeWidth="1" />

        {/* ─── SILUETA FRENTE ─────────────────────────────────── */}
        <g fill={COLOR_BODY} stroke={COLOR_BODY_STR} strokeWidth="1.2">
          <ellipse cx="75" cy="36" rx="18" ry="21" />
          <rect x="68" y="54" width="14" height="14" rx="2" />
          <path d="M50,66 C40,70 36,82 35,96 L34,185 C34,198 52,208 75,210 C98,208 116,198 116,185 L115,96 C114,82 110,70 100,66 Z" />
          <path d="M115,72 C120,74 122,80 122,88 L120,130 C120,138 118,146 116,154 L114,174 C113,178 111,182 109,184 C107,186 105,184 104,182 L102,168 L103,148 L105,110 L107,88 C107,80 109,72 115,72 Z" />
          <path d="M35,72 C29,74 27,80 27,88 L28,130 C28,138 30,146 32,154 L34,174 C35,178 37,182 39,184 C41,186 43,184 44,182 L46,168 L45,148 L43,110 L41,88 C41,80 39,72 35,72 Z" />
          <path d="M78,210 L82,212 L84,295 L86,365 L84,392 L75,396 L73,396 L71,392 L70,365 L72,295 L74,212 Z" />
          <path d="M72,210 L68,212 L66,295 L64,365 L66,392 L75,396 L73,396 L71,392 L70,365 L72,295 L74,212 Z" />
        </g>

        {/* HOMBRO D (paciente) */}
        <ellipse cx="37" cy="76" rx="15" ry="10" fill={fill('shoulder','r')} stroke={stroke('shoulder','r')} strokeWidth={sw('shoulder','r')} opacity="0.9" />
        {/* HOMBRO I */}
        <ellipse cx="113" cy="76" rx="15" ry="10" fill={fill('shoulder','l')} stroke={stroke('shoulder','l')} strokeWidth={sw('shoulder','l')} opacity="0.9" />
        {/* CODO D */}
        <ellipse cx="30" cy="133" rx="11" ry="13" fill={fill('elbow','r')} stroke={stroke('elbow','r')} strokeWidth={sw('elbow','r')} opacity="0.9" />
        {/* CODO I */}
        <ellipse cx="120" cy="133" rx="11" ry="13" fill={fill('elbow','l')} stroke={stroke('elbow','l')} strokeWidth={sw('elbow','l')} opacity="0.9" />
        {/* MUÑECA D */}
        <ellipse cx="30" cy="172" rx="10" ry="12" fill={fill('wrist','r')} stroke={stroke('wrist','r')} strokeWidth={sw('wrist','r')} opacity="0.9" />
        {/* MUÑECA I */}
        <ellipse cx="120" cy="172" rx="10" ry="12" fill={fill('wrist','l')} stroke={stroke('wrist','l')} strokeWidth={sw('wrist','l')} opacity="0.9" />
        {/* CADERA D */}
        <ellipse cx="58" cy="218" rx="14" ry="11" fill={fill('hip','r')} stroke={stroke('hip','r')} strokeWidth={sw('hip','r')} opacity="0.9" />
        {/* CADERA I */}
        <ellipse cx="92" cy="218" rx="14" ry="11" fill={fill('hip','l')} stroke={stroke('hip','l')} strokeWidth={sw('hip','l')} opacity="0.9" />
        {/* RODILLA D */}
        <ellipse cx="60" cy="295" rx="13" ry="16" fill={fill('knee','r')} stroke={stroke('knee','r')} strokeWidth={sw('knee','r')} opacity="0.9" />
        {/* RODILLA I */}
        <ellipse cx="90" cy="295" rx="13" ry="16" fill={fill('knee','l')} stroke={stroke('knee','l')} strokeWidth={sw('knee','l')} opacity="0.9" />
        {/* TOBILLO D */}
        <ellipse cx="60" cy="371" rx="12" ry="17" fill={fill('ankle_foot','r')} stroke={stroke('ankle_foot','r')} strokeWidth={sw('ankle_foot','r')} opacity="0.9" />
        {/* TOBILLO I */}
        <ellipse cx="90" cy="371" rx="12" ry="17" fill={fill('ankle_foot','l')} stroke={stroke('ankle_foot','l')} strokeWidth={sw('ankle_foot','l')} opacity="0.9" />

        <text x="75" y="412" textAnchor="middle" fontSize="7" fill="#94a3b8">← D  &nbsp;&nbsp; I →</text>

        {/* ─── SILUETA ESPALDA ─────────────────────────────────── */}
        <g fill={COLOR_BODY} stroke={COLOR_BODY_STR} strokeWidth="1.2">
          <ellipse cx="225" cy="36" rx="18" ry="21" />
          <rect x="218" y="54" width="14" height="14" rx="2" />
          <path d="M200,66 C190,70 186,82 185,96 L184,185 C184,198 202,208 225,210 C248,208 266,198 266,185 L265,96 C264,82 260,70 250,66 Z" />
          <path d="M265,72 C270,74 272,80 272,88 L270,130 C270,138 268,146 266,154 L264,174 C263,178 261,182 259,184 C257,186 255,184 254,182 L252,168 L253,148 L255,110 L257,88 C257,80 259,72 265,72 Z" />
          <path d="M185,72 C179,74 177,80 177,88 L178,130 C178,138 180,146 182,154 L184,174 C185,178 187,182 189,184 C191,186 193,184 194,182 L196,168 L195,148 L193,110 L191,88 C191,80 189,72 185,72 Z" />
          <path d="M228,210 L232,212 L234,295 L236,365 L234,392 L225,396 L223,396 L221,392 L220,365 L222,295 L224,212 Z" />
          <path d="M222,210 L218,212 L216,295 L214,365 L216,392 L225,396 L223,396 L221,392 L220,365 L222,295 L224,212 Z" />
        </g>

        {/* CERVICAL */}
        <ellipse cx="225" cy="63" rx="13" ry="10" fill={fill('cervical',null)} stroke={stroke('cervical',null)} strokeWidth={sw('cervical',null)} opacity="0.9" />
        {/* DORSAL */}
        <rect x="208" y="82" width="34" height="50" rx="5" fill={fill('dorsal',null)} stroke={stroke('dorsal',null)} strokeWidth={sw('dorsal',null)} opacity="0.9" />
        {/* LUMBAR */}
        <rect x="210" y="138" width="30" height="40" rx="5" fill={fill('lumbar',null)} stroke={stroke('lumbar',null)} strokeWidth={sw('lumbar',null)} opacity="0.9" />
        {/* HOMBRO D espalda */}
        <ellipse cx="187" cy="76" rx="15" ry="10" fill={fill('shoulder','r')} stroke={stroke('shoulder','r')} strokeWidth={sw('shoulder','r')} opacity="0.9" />
        {/* HOMBRO I espalda */}
        <ellipse cx="263" cy="76" rx="15" ry="10" fill={fill('shoulder','l')} stroke={stroke('shoulder','l')} strokeWidth={sw('shoulder','l')} opacity="0.9" />
        {/* CODO D espalda */}
        <ellipse cx="180" cy="133" rx="11" ry="13" fill={fill('elbow','r')} stroke={stroke('elbow','r')} strokeWidth={sw('elbow','r')} opacity="0.9" />
        {/* CODO I espalda */}
        <ellipse cx="270" cy="133" rx="11" ry="13" fill={fill('elbow','l')} stroke={stroke('elbow','l')} strokeWidth={sw('elbow','l')} opacity="0.9" />
        {/* MUÑECA D espalda */}
        <ellipse cx="180" cy="172" rx="10" ry="12" fill={fill('wrist','r')} stroke={stroke('wrist','r')} strokeWidth={sw('wrist','r')} opacity="0.9" />
        {/* MUÑECA I espalda */}
        <ellipse cx="270" cy="172" rx="10" ry="12" fill={fill('wrist','l')} stroke={stroke('wrist','l')} strokeWidth={sw('wrist','l')} opacity="0.9" />
        {/* CADERA D espalda */}
        <ellipse cx="208" cy="218" rx="14" ry="11" fill={fill('hip','r')} stroke={stroke('hip','r')} strokeWidth={sw('hip','r')} opacity="0.9" />
        {/* CADERA I espalda */}
        <ellipse cx="242" cy="218" rx="14" ry="11" fill={fill('hip','l')} stroke={stroke('hip','l')} strokeWidth={sw('hip','l')} opacity="0.9" />
        {/* RODILLA D espalda */}
        <ellipse cx="210" cy="295" rx="13" ry="16" fill={fill('knee','r')} stroke={stroke('knee','r')} strokeWidth={sw('knee','r')} opacity="0.9" />
        {/* RODILLA I espalda */}
        <ellipse cx="240" cy="295" rx="13" ry="16" fill={fill('knee','l')} stroke={stroke('knee','l')} strokeWidth={sw('knee','l')} opacity="0.9" />
        {/* TOBILLO D espalda */}
        <ellipse cx="210" cy="371" rx="12" ry="17" fill={fill('ankle_foot','r')} stroke={stroke('ankle_foot','r')} strokeWidth={sw('ankle_foot','r')} opacity="0.9" />
        {/* TOBILLO I espalda */}
        <ellipse cx="240" cy="371" rx="12" ry="17" fill={fill('ankle_foot','l')} stroke={stroke('ankle_foot','l')} strokeWidth={sw('ankle_foot','l')} opacity="0.9" />

        <text x="225" y="412" textAnchor="middle" fontSize="7" fill="#94a3b8">← D  &nbsp;&nbsp; I →</text>
      </svg>

      {/* Leyenda */}
      <div className="flex items-center justify-center gap-3 mt-2 text-xs text-slate-500 select-none flex-wrap">
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-full bg-green-500" /> Verde
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-full bg-amber-400" /> Ámbar
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-full bg-red-500" /> Rojo
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-full bg-slate-200" /> No evaluada
        </span>
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
    <div className="space-y-5">
      {/* Score global + titular */}
      <div className="flex items-center gap-5">
        {/* Círculo de score */}
        <div
          className="w-20 h-20 rounded-full flex flex-col items-center justify-center flex-shrink-0 text-white shadow-md"
          style={{ background: cfg.bg, boxShadow: `0 0 0 4px ${cfg.ring}30` }}
        >
          <span className="text-2xl font-black leading-none">{globalScore}</span>
          <span className="text-xs font-semibold opacity-90">/100</span>
        </div>

        <div className="flex-1 min-w-0">
          <div
            className="inline-block text-xs font-bold px-2 py-0.5 rounded-full text-white mb-1"
            style={{ background: cfg.bg }}
          >
            {cfg.label}
          </div>
          <h2 className="text-base font-bold text-[#1A3C5E] leading-snug">{cfg.headline}</h2>
          <p className="text-xs text-slate-500 mt-0.5">{cfg.subtext}</p>
        </div>
      </div>

      {/* Red flags */}
      {redFlags.length > 0 && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 space-y-2">
          <div className="flex items-center gap-2 text-red-700 font-bold text-sm">
            <AlertTriangle size={16} />
            Avisos importantes
          </div>
          <ul className="space-y-1.5">
            {redFlags.map((flag, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-red-700">
                <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-red-100 flex items-center justify-center text-[10px] font-bold">
                  {flag.id.replace('RF-', '!')}
                </span>
                <span>{flag.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Info si no hay red flags pero nivel alto */}
      {redFlags.length === 0 && (globalLevel === 'rehabilitador' || globalLevel === 'derivacion') && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 flex items-start gap-2">
          <Info size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-700">
            Tu valoración indica un nivel de afectación significativo. Consulta con un profesional antes de iniciar cualquier programa.
          </p>
        </div>
      )}

      {/* Body map */}
      <StaticBodyMap zoneResults={zoneResults} />
    </div>
  )
}
