'use client'

import type { ZoneCode, ZoneSide } from '@/types/database'
import { isZoneSelected } from '@/store/questionnaireStore'

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface ZoneSelection { zone_code: ZoneCode; side: ZoneSide }
interface BodyMapProps  { selectedZones: ZoneSelection[]; onToggle: (c: ZoneCode, s: ZoneSide) => void }

// ── Silueta oscura frontal ─────────────────────────────────────────────────────

function FrontSilhouette() {
  return (
    <g>
      {/* Relleno cuerpo */}
      <g fill="#1a2f50" stroke="#253f68" strokeWidth="1">
        <ellipse cx="75" cy="36" rx="18" ry="21" />
        <rect x="68" y="54" width="14" height="14" rx="2" />
        <path d="M50,66 C40,70 36,82 35,96 L34,185 C34,198 52,208 75,210 C98,208 116,198 116,185 L115,96 C114,82 110,70 100,66 Z" />
        <path d="M115,72 C120,74 122,80 122,88 L120,130 C120,138 118,146 116,154 L114,174 C113,178 111,182 109,184 C107,186 105,184 104,182 L102,168 L103,148 L105,110 L107,88 C107,80 109,72 115,72 Z" />
        <path d="M35,72 C29,74 27,80 27,88 L28,130 C28,138 30,146 32,154 L34,174 C35,178 37,182 39,184 C41,186 43,184 44,182 L46,168 L45,148 L43,110 L41,88 C41,80 39,72 35,72 Z" />
        <path d="M78,210 L84,212 L86,295 L88,368 L86,392 L77,396 L73,396 L71,392 L71,368 L73,295 L74,212 Z" />
        <path d="M72,210 L66,212 L64,295 L62,368 L64,392 L73,396 L77,396 L76,392 L76,368 L77,295 L76,212 Z" />
      </g>
      {/* Anatomía — clavículas y esternón */}
      <g stroke="#3d6aaa" strokeWidth="1.2" fill="none" opacity="0.45">
        <path d="M75,68 C82,65 93,63 113,76" />
        <path d="M75,68 C68,65 57,63 37,76" />
        <line x1="75" y1="68" x2="75" y2="140" />
        <path d="M58,82 C53,92 52,108 54,118" opacity="0.35" />
        <path d="M92,82 C97,92 98,108 96,118" opacity="0.35" />
      </g>
    </g>
  )
}

// ── Silueta oscura trasera ─────────────────────────────────────────────────────

function BackSilhouette() {
  return (
    <g>
      {/* Relleno cuerpo */}
      <g fill="#1a2f50" stroke="#253f68" strokeWidth="1">
        <ellipse cx="225" cy="36" rx="18" ry="21" />
        <rect x="218" y="54" width="14" height="14" rx="2" />
        <path d="M200,66 C190,70 186,82 185,96 L184,185 C184,198 202,208 225,210 C248,208 266,198 266,185 L265,96 C264,82 260,70 250,66 Z" />
        <path d="M265,72 C270,74 272,80 272,88 L270,130 C270,138 268,146 266,154 L264,174 C263,178 261,182 259,184 C257,186 255,184 254,182 L252,168 L253,148 L255,110 L257,88 C257,80 259,72 265,72 Z" />
        <path d="M185,72 C179,74 177,80 177,88 L178,130 C178,138 180,146 182,154 L184,174 C185,178 187,182 189,184 C191,186 193,184 194,182 L196,168 L195,148 L193,110 L191,88 C191,80 189,72 185,72 Z" />
        <path d="M228,210 L234,212 L236,295 L238,368 L236,392 L227,396 L223,396 L221,392 L221,368 L223,295 L224,212 Z" />
        <path d="M222,210 L216,212 L214,295 L212,368 L214,392 L223,396 L227,396 L226,392 L226,368 L227,295 L226,212 Z" />
      </g>
      {/* Columna vertebral */}
      <g fill="#3d6aaa" opacity="0.55">
        {[66,78,90,102,114,126,137,148,158,168,180].map((y, i) => (
          <rect key={i} x="221" y={y} width="8" height="6" rx="1" />
        ))}
      </g>
      {/* Escápulas */}
      <g fill="none" stroke="#3d6aaa" strokeWidth="1" opacity="0.35">
        <path d="M204,82 C199,88 197,100 199,112 L210,116 C215,111 216,98 212,86 Z" />
        <path d="M246,82 C251,88 253,100 251,112 L240,116 C235,111 234,98 238,86 Z" />
      </g>
    </g>
  )
}

// ── Punto de zona interactivo ─────────────────────────────────────────────────

function ZoneDot({
  cx, cy, r = 10, zone_code, side, selected, onToggle, label,
}: {
  cx: number; cy: number; r?: number
  zone_code: ZoneCode; side: ZoneSide
  selected: boolean; onToggle: (c: ZoneCode, s: ZoneSide) => void
  label?: string
}) {
  return (
    <g
      onClick={() => onToggle(zone_code, side)}
      style={{ cursor: 'pointer' }}
      role="button"
      aria-label={label}
      aria-pressed={selected}
      className="group"
    >
      {/* Halo exterior al seleccionar */}
      {selected && <circle cx={cx} cy={cy} r={r + 7} fill="rgba(244,223,73,0.12)" />}
      {/* Anillo exterior */}
      <circle
        cx={cx} cy={cy} r={r + 2.5}
        fill="none"
        stroke={selected ? 'rgba(244,223,73,0.4)' : 'rgba(255,255,255,0.12)'}
        strokeWidth="1"
      />
      {/* Círculo principal */}
      <circle
        cx={cx} cy={cy} r={r}
        fill={selected ? '#F4DF49' : 'rgba(255,255,255,0.08)'}
        stroke={selected ? '#F4DF49' : 'rgba(255,255,255,0.28)'}
        strokeWidth={selected ? 0 : 1.5}
        strokeDasharray={selected ? undefined : '2.5 2'}
        style={{ filter: selected ? 'drop-shadow(0 0 8px rgba(244,223,73,0.85))' : undefined }}
      />
      {/* Icono + cuando no está seleccionado */}
      {!selected && (
        <g stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" strokeLinecap="round">
          <line x1={cx - 3} y1={cy} x2={cx + 3} y2={cy} />
          <line x1={cx} y1={cy - 3} x2={cx} y2={cy + 3} />
        </g>
      )}
    </g>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function BodyMap({ selectedZones, onToggle }: BodyMapProps) {
  const sel = (code: ZoneCode, side: ZoneSide) => isZoneSelected(selectedZones, code, side)

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: '#0b1929' }}>
      {/* Leyenda */}
      <div className="flex items-center justify-center gap-5 px-4 py-2.5 border-b border-white/8">
        <span className="flex items-center gap-1.5 text-[11px] font-medium text-white/40">
          <span className="w-2.5 h-2.5 rounded-full border border-dashed border-white/30 inline-block" />
          Sin seleccionar
        </span>
        <span className="flex items-center gap-1.5 text-[11px] font-medium text-white/40">
          <span
            className="w-2.5 h-2.5 rounded-full inline-block"
            style={{ background: '#F4DF49', boxShadow: '0 0 6px rgba(244,223,73,0.7)' }}
          />
          Seleccionada
        </span>
      </div>

      {/* Etiquetas Frente / Espalda */}
      <div className="flex px-4 pt-3 pb-0 text-[10px] font-bold text-white/30 uppercase tracking-widest select-none">
        <div className="flex-1 text-center">Frente</div>
        <div className="flex-1 text-center">Espalda</div>
      </div>

      {/* SVG corporal */}
      <svg
        viewBox="0 0 300 420"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full"
        aria-label="Mapa corporal interactivo"
      >
        {/* Divisor central */}
        <line x1="150" y1="0" x2="150" y2="420" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />

        <FrontSilhouette />
        <BackSilhouette />

        {/* ─── FRENTE ───────────────────────────────────────────── */}
        <ZoneDot cx={37}  cy={76}  r={10} zone_code="shoulder"    side="r" selected={sel('shoulder','r')}    onToggle={onToggle} label="Hombro derecho" />
        <ZoneDot cx={113} cy={76}  r={10} zone_code="shoulder"    side="l" selected={sel('shoulder','l')}    onToggle={onToggle} label="Hombro izquierdo" />
        <ZoneDot cx={29}  cy={133} r={9}  zone_code="elbow"       side="r" selected={sel('elbow','r')}       onToggle={onToggle} label="Codo derecho" />
        <ZoneDot cx={121} cy={133} r={9}  zone_code="elbow"       side="l" selected={sel('elbow','l')}       onToggle={onToggle} label="Codo izquierdo" />
        <ZoneDot cx={29}  cy={173} r={9}  zone_code="wrist"       side="r" selected={sel('wrist','r')}       onToggle={onToggle} label="Muñeca derecha" />
        <ZoneDot cx={121} cy={173} r={9}  zone_code="wrist"       side="l" selected={sel('wrist','l')}       onToggle={onToggle} label="Muñeca izquierda" />
        <ZoneDot cx={58}  cy={218} r={10} zone_code="hip"         side="r" selected={sel('hip','r')}         onToggle={onToggle} label="Cadera derecha" />
        <ZoneDot cx={92}  cy={218} r={10} zone_code="hip"         side="l" selected={sel('hip','l')}         onToggle={onToggle} label="Cadera izquierda" />
        <ZoneDot cx={60}  cy={297} r={11} zone_code="knee"        side="r" selected={sel('knee','r')}        onToggle={onToggle} label="Rodilla derecha" />
        <ZoneDot cx={90}  cy={297} r={11} zone_code="knee"        side="l" selected={sel('knee','l')}        onToggle={onToggle} label="Rodilla izquierda" />
        <ZoneDot cx={60}  cy={370} r={10} zone_code="ankle_foot"  side="r" selected={sel('ankle_foot','r')}  onToggle={onToggle} label="Tobillo derecho" />
        <ZoneDot cx={90}  cy={370} r={10} zone_code="ankle_foot"  side="l" selected={sel('ankle_foot','l')}  onToggle={onToggle} label="Tobillo izquierdo" />

        {/* ─── ESPALDA ──────────────────────────────────────────── */}
        <ZoneDot cx={225} cy={63}  r={10} zone_code="cervical"    side={null} selected={sel('cervical',null)}   onToggle={onToggle} label="Cervical" />
        <ZoneDot cx={225} cy={110} r={13} zone_code="dorsal"      side={null} selected={sel('dorsal',null)}     onToggle={onToggle} label="Dorsal" />
        <ZoneDot cx={225} cy={158} r={12} zone_code="lumbar"      side={null} selected={sel('lumbar',null)}     onToggle={onToggle} label="Lumbar" />
        <ZoneDot cx={187} cy={76}  r={10} zone_code="shoulder"    side="r"    selected={sel('shoulder','r')}    onToggle={onToggle} label="Hombro derecho" />
        <ZoneDot cx={263} cy={76}  r={10} zone_code="shoulder"    side="l"    selected={sel('shoulder','l')}    onToggle={onToggle} label="Hombro izquierdo" />
        <ZoneDot cx={180} cy={133} r={9}  zone_code="elbow"       side="r"    selected={sel('elbow','r')}       onToggle={onToggle} label="Codo derecho" />
        <ZoneDot cx={270} cy={133} r={9}  zone_code="elbow"       side="l"    selected={sel('elbow','l')}       onToggle={onToggle} label="Codo izquierdo" />
        <ZoneDot cx={180} cy={173} r={9}  zone_code="wrist"       side="r"    selected={sel('wrist','r')}       onToggle={onToggle} label="Muñeca derecha" />
        <ZoneDot cx={270} cy={173} r={9}  zone_code="wrist"       side="l"    selected={sel('wrist','l')}       onToggle={onToggle} label="Muñeca izquierda" />
        <ZoneDot cx={208} cy={218} r={10} zone_code="hip"         side="r"    selected={sel('hip','r')}         onToggle={onToggle} label="Cadera derecha" />
        <ZoneDot cx={242} cy={218} r={10} zone_code="hip"         side="l"    selected={sel('hip','l')}         onToggle={onToggle} label="Cadera izquierda" />
        <ZoneDot cx={210} cy={297} r={11} zone_code="knee"        side="r"    selected={sel('knee','r')}        onToggle={onToggle} label="Rodilla derecha" />
        <ZoneDot cx={240} cy={297} r={11} zone_code="knee"        side="l"    selected={sel('knee','l')}        onToggle={onToggle} label="Rodilla izquierda" />
        <ZoneDot cx={210} cy={370} r={10} zone_code="ankle_foot"  side="r"    selected={sel('ankle_foot','r')}  onToggle={onToggle} label="Tobillo derecho" />
        <ZoneDot cx={240} cy={370} r={10} zone_code="ankle_foot"  side="l"    selected={sel('ankle_foot','l')}  onToggle={onToggle} label="Tobillo izquierdo" />

        {/* Indicadores D/I */}
        <text x="75"  y="412" textAnchor="middle" fontSize="7" fill="rgba(255,255,255,0.2)" fontWeight="500">← D    I →</text>
        <text x="225" y="412" textAnchor="middle" fontSize="7" fill="rgba(255,255,255,0.2)" fontWeight="500">← D    I →</text>
      </svg>
    </div>
  )
}
