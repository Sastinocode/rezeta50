'use client'

import type { ZoneCode, ZoneSide } from '@/types/database'
import { isZoneSelected } from '@/store/questionnaireStore'

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface ZoneSelection {
  zone_code: ZoneCode
  side: ZoneSide
}

interface BodyMapProps {
  selectedZones: ZoneSelection[]
  onToggle: (zone_code: ZoneCode, side: ZoneSide) => void
}

// ── Colores ───────────────────────────────────────────────────────────────────

const COLOR_DEFAULT = '#d1d5db'   // gray-300
const COLOR_HOVER   = '#fde68a'   // amber-200
const COLOR_SELECTED = '#E8A020'  // rezeta accent
const COLOR_BODY     = '#f1f5f9'  // slate-100
const COLOR_BODY_STR = '#cbd5e1'  // slate-300

// ── Componente zona clicable ──────────────────────────────────────────────────

interface ZoneShapeProps {
  zone_code: ZoneCode
  side: ZoneSide
  selected: boolean
  onToggle: (zone_code: ZoneCode, side: ZoneSide) => void
  children: React.ReactNode   // el shape SVG (ellipse, rect, path)
  label?: string
}

function ZoneShape({ zone_code, side, selected, onToggle, children, label }: ZoneShapeProps) {
  return (
    <g
      onClick={() => onToggle(zone_code, side)}
      style={{ cursor: 'pointer' }}
      role="button"
      aria-label={label}
      aria-pressed={selected}
    >
      <g
        fill={selected ? COLOR_SELECTED : COLOR_DEFAULT}
        stroke={selected ? '#B87A10' : '#9ca3af'}
        strokeWidth="1"
        opacity={selected ? 1 : 0.85}
        className="transition-all duration-150 hover:opacity-100"
        style={{
          filter: selected ? 'drop-shadow(0 0 3px rgba(232,160,32,0.5))' : undefined,
        }}
      >
        {children}
      </g>
    </g>
  )
}

// ── Silueta corporal (sólo visual, no clicable) ───────────────────────────────

// Frente — centro x=75
function FrontSilhouette() {
  return (
    <g fill={COLOR_BODY} stroke={COLOR_BODY_STR} strokeWidth="1.2">
      {/* Cabeza */}
      <ellipse cx="75" cy="36" rx="18" ry="21" />
      {/* Cuello */}
      <rect x="68" y="54" width="14" height="14" rx="2" />
      {/* Torso */}
      <path d="M50,66 C40,70 36,82 35,96 L34,185 C34,198 52,208 75,210 C98,208 116,198 116,185 L115,96 C114,82 110,70 100,66 Z" />
      {/* Brazo izquierdo (del paciente = derecha en imagen) */}
      <path d="M115,72 C120,74 122,80 122,88 L120,130 C120,138 118,146 116,154 L114,174 C113,178 111,182 109,184 C107,186 105,184 104,182 L102,168 L103,148 L105,110 L107,88 C107,80 109,72 115,72 Z" />
      {/* Brazo derecho (del paciente = izquierda en imagen) */}
      <path d="M35,72 C29,74 27,80 27,88 L28,130 C28,138 30,146 32,154 L34,174 C35,178 37,182 39,184 C41,186 43,184 44,182 L46,168 L45,148 L43,110 L41,88 C41,80 39,72 35,72 Z" />
      {/* Pierna izquierda (del paciente = derecha en imagen) */}
      <path d="M78,210 L82,212 L84,295 L86,365 L84,392 L75,396 L73,396 L71,392 L70,365 L72,295 L74,212 Z" />
      {/* Pierna derecha (del paciente = izquierda en imagen) */}
      <path d="M72,210 L68,212 L66,295 L64,365 L66,392 L75,396 L73,396 L71,392 L70,365 L72,295 L74,212 Z" />
    </g>
  )
}

// Espalda — centro x=225
function BackSilhouette() {
  return (
    <g fill={COLOR_BODY} stroke={COLOR_BODY_STR} strokeWidth="1.2">
      {/* Cabeza */}
      <ellipse cx="225" cy="36" rx="18" ry="21" />
      {/* Cuello */}
      <rect x="218" y="54" width="14" height="14" rx="2" />
      {/* Torso */}
      <path d="M200,66 C190,70 186,82 185,96 L184,185 C184,198 202,208 225,210 C248,208 266,198 266,185 L265,96 C264,82 260,70 250,66 Z" />
      {/* Brazo izquierdo espalda */}
      <path d="M265,72 C270,74 272,80 272,88 L270,130 C270,138 268,146 266,154 L264,174 C263,178 261,182 259,184 C257,186 255,184 254,182 L252,168 L253,148 L255,110 L257,88 C257,80 259,72 265,72 Z" />
      {/* Brazo derecho espalda */}
      <path d="M185,72 C179,74 177,80 177,88 L178,130 C178,138 180,146 182,154 L184,174 C185,178 187,182 189,184 C191,186 193,184 194,182 L196,168 L195,148 L193,110 L191,88 C191,80 189,72 185,72 Z" />
      {/* Pierna izquierda espalda */}
      <path d="M228,210 L232,212 L234,295 L236,365 L234,392 L225,396 L223,396 L221,392 L220,365 L222,295 L224,212 Z" />
      {/* Pierna derecha espalda */}
      <path d="M222,210 L218,212 L216,295 L214,365 L216,392 L225,396 L223,396 L221,392 L220,365 L222,295 L224,212 Z" />
    </g>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function BodyMap({ selectedZones, onToggle }: BodyMapProps) {
  const sel = (code: ZoneCode, side: ZoneSide) =>
    isZoneSelected(selectedZones, code, side)

  return (
    <div className="w-full">
      {/* Etiquetas frente/espalda */}
      <div className="flex mb-1 text-xs font-medium text-slate-500 select-none">
        <div className="flex-1 text-center">FRENTE</div>
        <div className="flex-1 text-center">ESPALDA</div>
      </div>

      {/* SVG container — escala al ancho del padre, mínimo 280px */}
      <svg
        viewBox="0 0 300 420"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full max-w-sm mx-auto"
        style={{ minWidth: 280 }}
        aria-label="Mapa corporal interactivo"
      >
        {/* Divisor central */}
        <line x1="150" y1="0" x2="150" y2="420" stroke="#e2e8f0" strokeWidth="1" />

        {/* ─── FRENTE (izquierda) ─────────────────────────────── */}
        <FrontSilhouette />

        {/* HOMBRO D (paciente derecho = imagen izquierda) */}
        <ZoneShape
          zone_code="shoulder" side="r"
          selected={sel('shoulder', 'r')}
          onToggle={onToggle}
          label="Hombro derecho"
        >
          <ellipse cx="37" cy="76" rx="15" ry="10" />
        </ZoneShape>

        {/* HOMBRO I (paciente izquierdo = imagen derecha) */}
        <ZoneShape
          zone_code="shoulder" side="l"
          selected={sel('shoulder', 'l')}
          onToggle={onToggle}
          label="Hombro izquierdo"
        >
          <ellipse cx="113" cy="76" rx="15" ry="10" />
        </ZoneShape>

        {/* CODO D */}
        <ZoneShape
          zone_code="elbow" side="r"
          selected={sel('elbow', 'r')}
          onToggle={onToggle}
          label="Codo derecho"
        >
          <ellipse cx="30" cy="133" rx="11" ry="13" />
        </ZoneShape>

        {/* CODO I */}
        <ZoneShape
          zone_code="elbow" side="l"
          selected={sel('elbow', 'l')}
          onToggle={onToggle}
          label="Codo izquierdo"
        >
          <ellipse cx="120" cy="133" rx="11" ry="13" />
        </ZoneShape>

        {/* MUÑECA D */}
        <ZoneShape
          zone_code="wrist" side="r"
          selected={sel('wrist', 'r')}
          onToggle={onToggle}
          label="Muñeca/mano derecha"
        >
          <ellipse cx="30" cy="172" rx="10" ry="12" />
        </ZoneShape>

        {/* MUÑECA I */}
        <ZoneShape
          zone_code="wrist" side="l"
          selected={sel('wrist', 'l')}
          onToggle={onToggle}
          label="Muñeca/mano izquierda"
        >
          <ellipse cx="120" cy="172" rx="10" ry="12" />
        </ZoneShape>

        {/* CADERA D */}
        <ZoneShape
          zone_code="hip" side="r"
          selected={sel('hip', 'r')}
          onToggle={onToggle}
          label="Cadera derecha"
        >
          <ellipse cx="58" cy="218" rx="14" ry="11" />
        </ZoneShape>

        {/* CADERA I */}
        <ZoneShape
          zone_code="hip" side="l"
          selected={sel('hip', 'l')}
          onToggle={onToggle}
          label="Cadera izquierda"
        >
          <ellipse cx="92" cy="218" rx="14" ry="11" />
        </ZoneShape>

        {/* RODILLA D */}
        <ZoneShape
          zone_code="knee" side="r"
          selected={sel('knee', 'r')}
          onToggle={onToggle}
          label="Rodilla derecha"
        >
          <ellipse cx="60" cy="295" rx="13" ry="16" />
        </ZoneShape>

        {/* RODILLA I */}
        <ZoneShape
          zone_code="knee" side="l"
          selected={sel('knee', 'l')}
          onToggle={onToggle}
          label="Rodilla izquierda"
        >
          <ellipse cx="90" cy="295" rx="13" ry="16" />
        </ZoneShape>

        {/* TOBILLO D */}
        <ZoneShape
          zone_code="ankle_foot" side="r"
          selected={sel('ankle_foot', 'r')}
          onToggle={onToggle}
          label="Tobillo/pie derecho"
        >
          <ellipse cx="60" cy="371" rx="12" ry="17" />
        </ZoneShape>

        {/* TOBILLO I */}
        <ZoneShape
          zone_code="ankle_foot" side="l"
          selected={sel('ankle_foot', 'l')}
          onToggle={onToggle}
          label="Tobillo/pie izquierdo"
        >
          <ellipse cx="90" cy="371" rx="12" ry="17" />
        </ZoneShape>

        {/* ─── ETIQUETAS FRENTE ──────────────────────────────── */}
        <text x="75" y="412" textAnchor="middle" fontSize="7" fill="#94a3b8">
          ← D  &nbsp;&nbsp; I →
        </text>

        {/* ─── ESPALDA (derecha) ─────────────────────────────── */}
        <BackSilhouette />

        {/* CERVICAL */}
        <ZoneShape
          zone_code="cervical" side={null}
          selected={sel('cervical', null)}
          onToggle={onToggle}
          label="Cervical"
        >
          <ellipse cx="225" cy="63" rx="13" ry="10" />
        </ZoneShape>

        {/* DORSAL */}
        <ZoneShape
          zone_code="dorsal" side={null}
          selected={sel('dorsal', null)}
          onToggle={onToggle}
          label="Dorsal"
        >
          <rect x="208" y="82" width="34" height="50" rx="5" />
        </ZoneShape>

        {/* LUMBAR */}
        <ZoneShape
          zone_code="lumbar" side={null}
          selected={sel('lumbar', null)}
          onToggle={onToggle}
          label="Lumbar"
        >
          <rect x="210" y="138" width="30" height="40" rx="5" />
        </ZoneShape>

        {/* HOMBRO D espalda */}
        <ZoneShape
          zone_code="shoulder" side="r"
          selected={sel('shoulder', 'r')}
          onToggle={onToggle}
          label="Hombro derecho"
        >
          <ellipse cx="187" cy="76" rx="15" ry="10" />
        </ZoneShape>

        {/* HOMBRO I espalda */}
        <ZoneShape
          zone_code="shoulder" side="l"
          selected={sel('shoulder', 'l')}
          onToggle={onToggle}
          label="Hombro izquierdo"
        >
          <ellipse cx="263" cy="76" rx="15" ry="10" />
        </ZoneShape>

        {/* CODO D espalda */}
        <ZoneShape
          zone_code="elbow" side="r"
          selected={sel('elbow', 'r')}
          onToggle={onToggle}
          label="Codo derecho"
        >
          <ellipse cx="180" cy="133" rx="11" ry="13" />
        </ZoneShape>

        {/* CODO I espalda */}
        <ZoneShape
          zone_code="elbow" side="l"
          selected={sel('elbow', 'l')}
          onToggle={onToggle}
          label="Codo izquierdo"
        >
          <ellipse cx="270" cy="133" rx="11" ry="13" />
        </ZoneShape>

        {/* MUÑECA D espalda */}
        <ZoneShape
          zone_code="wrist" side="r"
          selected={sel('wrist', 'r')}
          onToggle={onToggle}
          label="Muñeca/mano derecha"
        >
          <ellipse cx="180" cy="172" rx="10" ry="12" />
        </ZoneShape>

        {/* MUÑECA I espalda */}
        <ZoneShape
          zone_code="wrist" side="l"
          selected={sel('wrist', 'l')}
          onToggle={onToggle}
          label="Muñeca/mano izquierda"
        >
          <ellipse cx="270" cy="172" rx="10" ry="12" />
        </ZoneShape>

        {/* CADERA D espalda */}
        <ZoneShape
          zone_code="hip" side="r"
          selected={sel('hip', 'r')}
          onToggle={onToggle}
          label="Cadera derecha"
        >
          <ellipse cx="208" cy="218" rx="14" ry="11" />
        </ZoneShape>

        {/* CADERA I espalda */}
        <ZoneShape
          zone_code="hip" side="l"
          selected={sel('hip', 'l')}
          onToggle={onToggle}
          label="Cadera izquierda"
        >
          <ellipse cx="242" cy="218" rx="14" ry="11" />
        </ZoneShape>

        {/* RODILLA D espalda */}
        <ZoneShape
          zone_code="knee" side="r"
          selected={sel('knee', 'r')}
          onToggle={onToggle}
          label="Rodilla derecha"
        >
          <ellipse cx="210" cy="295" rx="13" ry="16" />
        </ZoneShape>

        {/* RODILLA I espalda */}
        <ZoneShape
          zone_code="knee" side="l"
          selected={sel('knee', 'l')}
          onToggle={onToggle}
          label="Rodilla izquierda"
        >
          <ellipse cx="240" cy="295" rx="13" ry="16" />
        </ZoneShape>

        {/* TOBILLO D espalda */}
        <ZoneShape
          zone_code="ankle_foot" side="r"
          selected={sel('ankle_foot', 'r')}
          onToggle={onToggle}
          label="Tobillo/pie derecho"
        >
          <ellipse cx="210" cy="371" rx="12" ry="17" />
        </ZoneShape>

        {/* TOBILLO I espalda */}
        <ZoneShape
          zone_code="ankle_foot" side="l"
          selected={sel('ankle_foot', 'l')}
          onToggle={onToggle}
          label="Tobillo/pie izquierdo"
        >
          <ellipse cx="240" cy="371" rx="12" ry="17" />
        </ZoneShape>

        {/* ─── ETIQUETAS ESPALDA ─────────────────────────────── */}
        <text x="225" y="412" textAnchor="middle" fontSize="7" fill="#94a3b8">
          ← D  &nbsp;&nbsp; I →
        </text>
      </svg>

      {/* Leyenda */}
      <div className="flex items-center justify-center gap-4 mt-2 text-xs text-slate-500 select-none">
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-full bg-gray-300 border border-gray-400" />
          Sin seleccionar
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-full bg-[#E8A020] border border-[#B87A10]" />
          Seleccionada
        </span>
      </div>
    </div>
  )
}
