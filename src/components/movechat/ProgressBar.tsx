'use client'

const STEPS = [
  'Bienvenida',
  'Cuerpo',
  'Dolor',
  'Historial',
  'Actividad',
  'Impacto',
  'Objetivo',
]

interface ProgressBarProps {
  currentStep: number // 1–7
}

export function ProgressBar({ currentStep }: ProgressBarProps) {
  return (
    <div className="w-full px-4 py-3">
      <div className="flex items-center justify-between gap-1">
        {STEPS.map((label, i) => {
          const step = i + 1
          const done = step < currentStep
          const active = step === currentStep
          return (
            <div key={label} className="flex flex-col items-center flex-1 min-w-0">
              {/* Dot + line */}
              <div className="flex items-center w-full">
                {/* Left line */}
                <div
                  className="h-px flex-1 transition-colors"
                  style={{ background: i === 0 ? 'transparent' : done || active ? '#1A4731' : 'rgba(255,255,255,0.1)' }}
                />
                {/* Circle */}
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 transition-all"
                  style={{
                    background: done ? '#1A4731' : active ? '#4ade80' : 'rgba(255,255,255,0.08)',
                    color: done ? '#4ade80' : active ? '#0d0d0d' : 'rgba(255,255,255,0.3)',
                    border: active ? '2px solid #4ade80' : 'none',
                  }}
                >
                  {done ? (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <polyline points="2 5 4 7 8 3" stroke="#4ade80" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    step
                  )}
                </div>
                {/* Right line */}
                <div
                  className="h-px flex-1 transition-colors"
                  style={{ background: i === STEPS.length - 1 ? 'transparent' : done ? '#1A4731' : 'rgba(255,255,255,0.1)' }}
                />
              </div>
              {/* Label */}
              <span
                className="text-[9px] font-medium mt-1 truncate w-full text-center"
                style={{ color: active ? '#4ade80' : done ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)' }}
              >
                {label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
