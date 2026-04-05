'use client'

import { useState } from 'react'

export type BodyZone =
  | 'cuello'
  | 'hombro_derecho' | 'hombro_izquierdo'
  | 'codo_derecho' | 'codo_izquierdo'
  | 'espalda_alta'
  | 'lumbar'
  | 'cadera_derecha' | 'cadera_izquierda'
  | 'rodilla_derecha' | 'rodilla_izquierda'
  | 'tobillo_derecho' | 'tobillo_izquierdo'
  | 'pie'

interface ZoneDef {
  id: BodyZone
  label: string
  // front / back  cx  cy  r (circle in SVG viewBox 0 0 200 400)
  view: 'front' | 'back'
  cx: number
  cy: number
  r: number
}

const ZONES: ZoneDef[] = [
  // FRONT
  { id: 'cuello',          label: 'Cuello',           view: 'front', cx: 100, cy: 52,  r: 10 },
  { id: 'hombro_derecho',  label: 'Hombro Der.',      view: 'front', cx: 70,  cy: 80,  r: 11 },
  { id: 'hombro_izquierdo',label: 'Hombro Izq.',      view: 'front', cx: 130, cy: 80,  r: 11 },
  { id: 'codo_derecho',    label: 'Codo Der.',        view: 'front', cx: 58,  cy: 130, r: 9  },
  { id: 'codo_izquierdo',  label: 'Codo Izq.',        view: 'front', cx: 142, cy: 130, r: 9  },
  { id: 'cadera_derecha',  label: 'Cadera Der.',      view: 'front', cx: 82,  cy: 190, r: 11 },
  { id: 'cadera_izquierda',label: 'Cadera Izq.',      view: 'front', cx: 118, cy: 190, r: 11 },
  { id: 'rodilla_derecha', label: 'Rodilla Der.',     view: 'front', cx: 82,  cy: 265, r: 11 },
  { id: 'rodilla_izquierda',label: 'Rodilla Izq.',    view: 'front', cx: 118, cy: 265, r: 11 },
  { id: 'tobillo_derecho', label: 'Tobillo Der.',     view: 'front', cx: 82,  cy: 330, r: 9  },
  { id: 'tobillo_izquierdo',label: 'Tobillo Izq.',    view: 'front', cx: 118, cy: 330, r: 9  },
  { id: 'pie',             label: 'Pie',              view: 'front', cx: 100, cy: 365, r: 10 },
  // BACK
  { id: 'espalda_alta',    label: 'Espalda Alta',     view: 'back',  cx: 100, cy: 95,  r: 14 },
  { id: 'lumbar',          label: 'Lumbar',           view: 'back',  cx: 100, cy: 155, r: 14 },
]

// Simple human silhouette paths (front and back)
const FRONT_BODY = `
  M100,20 C88,20 80,30 80,42 L80,48 C74,50 68,56 68,64 L68,72
  C60,74 55,80 55,87 L55,105 C55,110 58,115 62,117 L62,160
  C58,162 55,168 55,175 L55,210 C55,218 60,225 67,226 L67,290
  C63,292 60,296 60,302 L60,345 C60,350 64,355 70,355
  L76,355 C80,355 83,352 84,349 L84,302 C86,300 90,298 94,298
  L106,298 C110,298 114,300 116,302 L116,349
  C117,352 120,355 124,355 L130,355 C136,355 140,350 140,345
  L140,302 C140,296 137,292 133,290 L133,226
  C140,225 145,218 145,210 L145,175 C145,168 142,162 138,160
  L138,117 C142,115 145,110 145,105 L145,87 C145,80 140,74 132,72
  L132,64 C132,56 126,50 120,48 L120,42 C120,30 112,20 100,20 Z
`

function BodySilhouette({ view }: { view: 'front' | 'back' }) {
  return (
    <ellipse
      cx="100" cy="195" rx="38" ry="175"
      fill="rgba(255,255,255,0.04)"
      stroke="rgba(255,255,255,0.12)"
      strokeWidth="1"
    />
  )
}

interface BodyMapSimpleProps {
  onConfirm: (zones: BodyZone[]) => void
}

export function BodyMapSimple({ onConfirm }: BodyMapSimpleProps) {
  const [selected, setSelected] = useState<Set<BodyZone>>(new Set())
  const [view, setView] = useState<'front' | 'back'>('front')

  function toggle(id: BodyZone) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const frontZones = ZONES.filter((z) => z.view === 'front')
  const backZones  = ZONES.filter((z) => z.view === 'back')
  const visibleZones = view === 'front' ? frontZones : backZones

  return (
    <div className="w-full rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <p className="text-xs text-neutral-400 mb-3 font-medium uppercase tracking-wide text-center">
        Toca las zonas con molestia
      </p>

      {/* Toggle front/back */}
      <div className="flex justify-center mb-4 gap-2">
        {(['front', 'back'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className="px-4 py-1.5 rounded-lg text-xs font-bold transition-all"
            style={{
              background: view === v ? '#1A4731' : 'rgba(255,255,255,0.06)',
              color: view === v ? '#4ade80' : '#9ca3af',
              border: view === v ? '1px solid #1A4731' : '1px solid transparent',
            }}
          >
            {v === 'front' ? 'Frente' : 'Espalda'}
          </button>
        ))}
      </div>

      {/* SVG Body */}
      <div className="flex justify-center">
        <svg viewBox="0 0 200 400" width="160" height="320" className="overflow-visible">
          {/* Silhouette */}
          <BodySilhouette view={view} />

          {/* Head */}
          <ellipse cx="100" cy="28" rx="18" ry="20"
            fill="rgba(255,255,255,0.06)"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="1"
          />

          {/* Zone circles */}
          {visibleZones.map((zone) => {
            const isSelected = selected.has(zone.id)
            return (
              <g key={zone.id} onClick={() => toggle(zone.id)} style={{ cursor: 'pointer' }}>
                <circle
                  cx={zone.cx}
                  cy={zone.cy}
                  r={zone.r + 4}
                  fill="transparent"
                />
                <circle
                  cx={zone.cx}
                  cy={zone.cy}
                  r={zone.r}
                  fill={isSelected ? 'rgba(74,222,128,0.3)' : 'rgba(255,255,255,0.06)'}
                  stroke={isSelected ? '#4ade80' : 'rgba(255,255,255,0.2)'}
                  strokeWidth={isSelected ? 2 : 1}
                  className="transition-all"
                />
                {isSelected && (
                  <circle cx={zone.cx} cy={zone.cy} r={4} fill="#4ade80" />
                )}
              </g>
            )
          })}
        </svg>
      </div>

      {/* Selected zones chips */}
      {selected.size > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3 justify-center">
          {Array.from(selected).map((id) => {
            const z = ZONES.find((z) => z.id === id)!
            return (
              <span
                key={id}
                onClick={() => toggle(id)}
                className="text-xs px-2.5 py-1 rounded-full cursor-pointer font-medium"
                style={{ background: 'rgba(74,222,128,0.15)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.3)' }}
              >
                {z.label} ✕
              </span>
            )
          })}
        </div>
      )}

      <button
        onClick={() => onConfirm(Array.from(selected))}
        disabled={selected.size === 0}
        className="w-full mt-4 py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90 active:scale-95 disabled:opacity-40"
        style={{ background: '#1A4731', color: '#fff' }}
      >
        {selected.size === 0
          ? 'Selecciona al menos una zona'
          : `Confirmar ${selected.size} zona${selected.size > 1 ? 's' : ''}`}
      </button>
    </div>
  )
}
