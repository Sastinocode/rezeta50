'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const SESSION_KEY = 'movechat_session_id'

interface ScoreEntry {
  id: string
  score: number
  created_at: string
  details: {
    semaforo?: string
    zone?: string
  } | null
}

export default function DashboardPage() {
  const [scores, setScores] = useState<ScoreEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [sessionId, setSessionId] = useState<string | null>(null)

  useEffect(() => {
    const id = localStorage.getItem(SESSION_KEY)
    setSessionId(id)

    if (!id) {
      setLoading(false)
      return
    }

    fetch(`/api/dashboard?sessionId=${id}`)
      .then((r) => r.json())
      .then((data) => {
        setScores(data.scores ?? [])
      })
      .catch(() => setScores([]))
      .finally(() => setLoading(false))
  }, [])

  const semaforoColor = (color?: string) => {
    if (color === 'verde') return '#4ade80'
    if (color === 'rojo') return '#f87171'
    return '#fbbf24'
  }

  return (
    <div
      className="min-h-screen px-4 py-8 max-w-lg mx-auto"
      style={{ background: '#0d0d0d', color: '#fff' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Link href="/" className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors">
          ← Inicio
        </Link>
        <p className="text-xs text-neutral-500">Move by Zincuenta</p>
      </div>

      <h1 className="text-2xl font-black mb-1">Tu historial</h1>
      <p className="text-sm text-neutral-400 mb-8">MoveScores registrados en este dispositivo</p>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full animate-bounce"
                style={{ background: '#4ade80', animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      ) : scores.length === 0 ? (
        <div className="text-center py-16 space-y-4">
          <p className="text-6xl">📊</p>
          <p className="text-neutral-300 font-semibold">Sin historial todavía</p>
          <p className="text-sm text-neutral-500">Completa tu primera evaluación para ver tu MoveScore aquí.</p>
          <Link
            href="/chat"
            className="inline-block mt-4 px-6 py-3 rounded-2xl text-sm font-bold transition-all active:scale-95"
            style={{ background: '#1A4731', color: '#fff' }}
          >
            Hacer mi evaluación →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {scores.map((s) => {
            const semColor = semaforoColor(s.details?.semaforo)
            return (
              <Link
                key={s.id}
                href={`/results/${s.id}`}
                className="flex items-center justify-between p-4 rounded-2xl transition-all hover:opacity-80"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div>
                  <p className="text-sm font-bold capitalize">
                    {s.details?.zone?.replace(/_/g, ' ') ?? 'Evaluación general'}
                  </p>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {new Date(s.created_at).toLocaleDateString('es-ES', {
                      day: '2-digit', month: 'short', year: 'numeric',
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black" style={{ color: semColor }}>{s.score}</p>
                  <p className="text-[10px] text-neutral-500">/ 100</p>
                </div>
              </Link>
            )
          })}

          <div className="pt-4">
            <Link
              href="/chat"
              className="block w-full py-3 rounded-2xl text-center text-sm font-bold transition-all active:scale-95"
              style={{ background: '#1A4731', color: '#fff' }}
            >
              Nueva evaluación →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
