'use client'

import { useState } from 'react'

type FormState = 'idle' | 'loading' | 'success' | 'error'

export function WaitlistForm() {
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [type, setType] = useState<'paciente' | 'profesional'>('paciente')
  const [state, setState] = useState<FormState>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setState('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, type }),
      })

      const data = await res.json()

      if (!res.ok) {
        setErrorMsg(data.error ?? 'Error inesperado')
        setState('error')
      } else {
        setState('success')
      }
    } catch {
      setErrorMsg('Error de conexión. Inténtalo de nuevo.')
      setState('error')
    }
  }

  if (state === 'success') {
    return (
      <div className="text-center py-6">
        <div
          className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-4"
          style={{ background: 'rgba(26,71,49,0.3)', border: '2px solid #1A4731' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <p className="text-white font-bold text-lg mb-1">Ya estás apuntado</p>
        <p className="text-neutral-400 text-sm">Te avisamos cuando abramos</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="nombre" className="block text-sm font-medium text-neutral-300 mb-1.5">
          Nombre
        </label>
        <input
          id="nombre"
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Tu nombre"
          required
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-neutral-500 focus:outline-none focus:border-green-600 transition-colors text-sm"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-neutral-300 mb-1.5">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          required
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-neutral-500 focus:outline-none focus:border-green-600 transition-colors text-sm"
        />
      </div>

      <div>
        <p className="text-sm font-medium text-neutral-300 mb-2">Soy…</p>
        <div className="grid grid-cols-2 gap-3">
          {(['paciente', 'profesional'] as const).map((opt) => (
            <label
              key={opt}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border cursor-pointer transition-all text-sm font-medium"
              style={{
                background: type === opt ? 'rgba(26,71,49,0.5)' : 'rgba(255,255,255,0.04)',
                borderColor: type === opt ? '#1A4731' : 'rgba(255,255,255,0.1)',
                color: type === opt ? '#4ade80' : '#9ca3af',
              }}
            >
              <input
                type="radio"
                name="type"
                value={opt}
                checked={type === opt}
                onChange={() => setType(opt)}
                className="sr-only"
              />
              {opt === 'paciente' ? '🙋 Paciente' : '🩺 Profesional'}
            </label>
          ))}
        </div>
      </div>

      {state === 'error' && (
        <p className="text-sm text-red-400 bg-red-900/20 border border-red-800/30 rounded-lg px-3 py-2">
          {errorMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={state === 'loading'}
        className="w-full py-3.5 rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-60"
        style={{ background: '#1A4731', color: '#fff' }}
      >
        {state === 'loading' ? 'Enviando…' : 'Apuntarme a la lista →'}
      </button>
    </form>
  )
}
