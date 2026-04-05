'use client'

import { useEffect, useRef } from 'react'
import type { SemaforoColor } from '@/lib/scoring/semaforo'
import { SEMAFORO_COLORS } from '@/lib/scoring/semaforo'

interface ScoreGaugeProps {
  score: number         // 0-100
  semaforo: SemaforoColor
  animate?: boolean
}

// SVG semicircle gauge parameters
const CX = 100
const CY = 100
const R  = 80
const STROKE = 14

// Convert score (0-100) to dash offset for the semicircle
// Arc length = π * R (half circle)
const ARC_LENGTH = Math.PI * R

function scoreToOffset(score: number): number {
  const fraction = Math.min(Math.max(score, 0), 100) / 100
  return ARC_LENGTH * (1 - fraction)
}

export function ScoreGauge({ score, semaforo, animate = true }: ScoreGaugeProps) {
  const colors = SEMAFORO_COLORS[semaforo]
  const numberRef = useRef<HTMLSpanElement>(null)
  const arcRef = useRef<SVGCircleElement>(null)

  useEffect(() => {
    if (!animate) {
      if (numberRef.current) numberRef.current.textContent = String(score)
      return
    }

    const duration = 1200
    const start = performance.now()
    const targetOffset = scoreToOffset(score)
    const startOffset = ARC_LENGTH // empty

    function tick(now: number) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)

      // Animate arc
      if (arcRef.current) {
        const offset = startOffset + (targetOffset - startOffset) * eased
        arcRef.current.style.strokeDashoffset = String(offset)
      }

      // Animate number
      if (numberRef.current) {
        numberRef.current.textContent = String(Math.round(score * eased))
      }

      if (progress < 1) requestAnimationFrame(tick)
    }

    requestAnimationFrame(tick)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [score])

  return (
    <div className="flex flex-col items-center gap-2">
      <svg
        width="200"
        height="110"
        viewBox="0 0 200 110"
        fill="none"
        aria-label={`MoveScore: ${score} de 100`}
      >
        {/* Background track (grey) */}
        <circle
          cx={CX}
          cy={CY}
          r={R}
          stroke="#333"
          strokeWidth={STROKE}
          fill="none"
          strokeDasharray={`${ARC_LENGTH} ${ARC_LENGTH}`}
          strokeDashoffset={0}
          strokeLinecap="round"
          transform="rotate(-180, 100, 100)"
          style={{ transformOrigin: '100px 100px' }}
        />

        {/* Coloured arc */}
        <circle
          ref={arcRef}
          cx={CX}
          cy={CY}
          r={R}
          stroke={colors.text}
          strokeWidth={STROKE}
          fill="none"
          strokeDasharray={`${ARC_LENGTH} ${ARC_LENGTH}`}
          strokeDashoffset={animate ? ARC_LENGTH : scoreToOffset(score)}
          strokeLinecap="round"
          transform="rotate(-180, 100, 100)"
          style={{
            transformOrigin: '100px 100px',
            transition: animate ? undefined : undefined,
            filter: `drop-shadow(0 0 6px ${colors.text}66)`,
          }}
        />

        {/* Score number overlay */}
        <foreignObject x="50" y="55" width="100" height="50">
          <div
            // @ts-expect-error xmlns needed for SVG foreignObject
            xmlns="http://www.w3.org/1999/xhtml"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              lineHeight: 1,
            }}
          >
            <span
              ref={numberRef}
              style={{
                fontSize: '2.5rem',
                fontWeight: 900,
                color: colors.text,
                fontFamily: 'inherit',
              }}
            >
              {animate ? '0' : score}
            </span>
            <span style={{ fontSize: '0.65rem', color: '#888', letterSpacing: '0.1em' }}>
              / 100
            </span>
          </div>
        </foreignObject>
      </svg>
    </div>
  )
}
