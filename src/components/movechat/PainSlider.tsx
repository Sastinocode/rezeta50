'use client'

import { useState } from 'react'

interface PainSliderProps {
  zoneName?: string
  initialValue?: number
  onConfirm: (value: number) => void
}

function painColor(value: number): string {
  if (value <= 3) return '#4ade80'   // green
  if (value <= 6) return '#facc15'   // yellow
  if (value <= 8) return '#f97316'   // orange
  return '#ef4444'                    // red
}

function painLabel(value: number): string {
  if (value <= 2) return 'Sin dolor relevante'
  if (value <= 4) return 'Molestia leve'
  if (value <= 6) return 'Dolor moderado'
  if (value <= 8) return 'Dolor intenso'
  return 'Dolor muy severo'
}

export function PainSlider({ zoneName, initialValue = 5, onConfirm }: PainSliderProps) {
  const [value, setValue] = useState(initialValue)
  const color = painColor(value)

  return (
    <div className="w-full rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
      {zoneName && (
        <p className="text-xs text-neutral-400 mb-3 font-medium uppercase tracking-wide">
          Intensidad — {zoneName}
        </p>
      )}

      {/* Big number */}
      <div className="flex items-center justify-center mb-4">
        <span
          className="text-6xl font-black transition-colors leading-none"
          style={{ color }}
        >
          {value}
        </span>
        <span className="text-neutral-600 text-xl ml-1 mt-4">/10</span>
      </div>

      {/* Label */}
      <p className="text-center text-sm font-medium mb-5 transition-colors" style={{ color }}>
        {painLabel(value)}
      </p>

      {/* Gradient track + input */}
      <div className="relative mb-5">
        <div
          className="h-3 rounded-full w-full"
          style={{ background: 'linear-gradient(to right, #4ade80, #facc15, #f97316, #ef4444)' }}
        />
        <input
          type="range"
          min={1}
          max={10}
          step={1}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-3"
          style={{ WebkitAppearance: 'none' }}
        />
        {/* Thumb indicator */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 border-white shadow-lg transition-all pointer-events-none"
          style={{
            left: `calc(${((value - 1) / 9) * 100}% - 10px)`,
            background: color,
          }}
        />
      </div>

      {/* Scale labels */}
      <div className="flex justify-between text-xs text-neutral-600 mb-5 px-1">
        <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
        <span>6</span><span>7</span><span>8</span><span>9</span><span>10</span>
      </div>

      <button
        onClick={() => onConfirm(value)}
        className="w-full py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90 active:scale-95"
        style={{ background: '#1A4731', color: '#fff' }}
      >
        Confirmar — {value}/10
      </button>
    </div>
  )
}
