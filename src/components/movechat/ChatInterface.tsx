'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ProgressBar } from './ProgressBar'
import { MessageBubble } from './MessageBubble'
import { BodyMapSimple, type BodyZone } from './BodyMapSimple'
import { PainSlider } from './PainSlider'

// ── Types ─────────────────────────────────────────────────────────────────────

type EmbedType = 'body_map' | 'pain_slider'

interface EmbedPayload {
  type: EmbedType
  zoneName?: string
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  text: string
  embed?: EmbedPayload
  interacted?: boolean // true once the user has responded to an embed
}

interface ChatInterfaceProps {
  sessionId: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function detectEmbed(text: string): EmbedPayload | null {
  if (text.includes('[SHOW_BODY_MAP]')) return { type: 'body_map' }
  const sliderMatch = text.match(/\[SHOW_PAIN_SLIDER:([^\]]+)\]/)
  if (sliderMatch) return { type: 'pain_slider', zoneName: sliderMatch[1] }
  return null
}

function cleanText(text: string): string {
  return text
    .replace(/\[SHOW_BODY_MAP\]/g, '')
    .replace(/\[SHOW_PAIN_SLIDER:[^\]]+\]/g, '')
    .replace(/###JSON###[\s\S]*###JSON###/g, '')
    .trim()
}

function extractStep(text: string): number | null {
  if (text.includes('PASO 1') || text.toLowerCase().includes('bienvenid')) return 1
  if (text.includes('PASO 2') || text.includes('[SHOW_BODY_MAP]')) return 2
  if (text.includes('PASO 3') || text.includes('[SHOW_PAIN_SLIDER')) return 3
  if (text.includes('PASO 4') || text.toLowerCase().includes('cuánto tiempo')) return 4
  if (text.includes('PASO 5') || text.toLowerCase().includes('actividad física')) return 5
  if (text.includes('PASO 6') || text.toLowerCase().includes('vida diaria')) return 6
  if (text.includes('PASO 7') || text.toLowerCase().includes('objetivo')) return 7
  return null
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ChatInterface({ sessionId }: ChatInterfaceProps) {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [streamingText, setStreamingText] = useState('')
  const [isComplete, setIsComplete] = useState(false)
  const [moveScore, setMoveScore] = useState<number | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const hasStarted = useRef(false)

  // ── Auto-scroll ──────────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingText])

  // ── Start conversation on mount ──────────────────────────────────────────
  useEffect(() => {
    if (hasStarted.current) return
    hasStarted.current = true
    sendToAPI([])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Send to Claude API ───────────────────────────────────────────────────
  const sendToAPI = useCallback(async (history: Message[], userText?: string) => {
    setIsLoading(true)
    setStreamingText('')

    const apiMessages = history.map((m) => ({
      role: m.role,
      content: m.text,
    }))
    if (userText) {
      apiMessages.push({ role: 'user', content: userText })
    }

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages, sessionId }),
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      if (!res.body) throw new Error('No stream body')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        // Parse SSE lines
        for (const line of chunk.split('\n')) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') break
            try {
              const parsed = JSON.parse(data)
              const delta = parsed.delta ?? ''
              fullText += delta
              setStreamingText(fullText)
            } catch { /* ignore parse errors */ }
          }
        }
      }

      // Finalise message
      const embed = detectEmbed(fullText)
      const cleaned = cleanText(fullText)
      const detectedStep = extractStep(fullText)
      if (detectedStep) setCurrentStep(detectedStep)

      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        text: cleaned,
        embed: embed ?? undefined,
      }

      setMessages((prev) => [...prev, assistantMsg])
      setStreamingText('')

      // Check for JSON completion
      if (fullText.includes('###JSON###')) {
        const jsonMatch = fullText.match(/###JSON###\s*([\s\S]*?)\s*###JSON###/)
        if (jsonMatch) {
          try {
            const scoreData = JSON.parse(jsonMatch[1])
            setMoveScore(scoreData.movescore_estimado ?? null)
            setIsComplete(true)
            setCurrentStep(7)
            // POST to /api/score and redirect to results page
            fetch('/api/score', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ sessionId, ...scoreData }),
            })
              .then((r) => r.json())
              .then((data) => {
                if (data.scoreId) {
                  setTimeout(() => router.push(`/results/${data.scoreId}`), 1800)
                }
              })
              .catch(console.error)
          } catch { /* malformed JSON */ }
        }
      }
    } catch (err) {
      console.error('[ChatInterface] API error:', err)
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          text: 'Vaya, algo salió mal. Inténtalo de nuevo.',
        },
      ])
    } finally {
      setIsLoading(false)
      setStreamingText('')
    }
  }, [sessionId])

  // ── Handle text submit ───────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      text: input.trim(),
    }
    const newHistory = [...messages, userMsg]
    setMessages(newHistory)
    setInput('')
    await sendToAPI(newHistory, input.trim())
  }

  // ── Handle body map confirm ──────────────────────────────────────────────
  function handleBodyMapConfirm(zones: BodyZone[]) {
    markLastEmbedInteracted()
    const zonesText = zones.length > 0
      ? `Tengo molestias en: ${zones.map((z) => z.replace(/_/g, ' ')).join(', ')}`
      : 'No tengo zonas con dolor específico'
    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', text: zonesText }
    const newHistory = [...messages, userMsg]
    setMessages(newHistory)
    sendToAPI(newHistory, zonesText)
  }

  // ── Handle pain slider confirm ───────────────────────────────────────────
  function handlePainSliderConfirm(value: number, zoneName?: string) {
    markLastEmbedInteracted()
    const text = zoneName
      ? `Intensidad del dolor en ${zoneName}: ${value}/10`
      : `Intensidad del dolor: ${value}/10`
    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', text }
    const newHistory = [...messages, userMsg]
    setMessages(newHistory)
    sendToAPI(newHistory, text)
  }

  function markLastEmbedInteracted() {
    setMessages((prev) => {
      const idx = [...prev].reverse().findIndex((m) => m.embed && !m.interacted)
      if (idx === -1) return prev
      const realIdx = prev.length - 1 - idx
      return prev.map((m, i) => i === realIdx ? { ...m, interacted: true } : m)
    })
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full">
      {/* Progress bar */}
      <div className="flex-shrink-0 border-b border-white/8">
        <ProgressBar currentStep={currentStep} />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} role={msg.role} text={msg.text}>
            {msg.embed && !msg.interacted && (
              <>
                {msg.embed.type === 'body_map' && (
                  <BodyMapSimple onConfirm={handleBodyMapConfirm} />
                )}
                {msg.embed.type === 'pain_slider' && (
                  <PainSlider
                    zoneName={msg.embed.zoneName}
                    onConfirm={(v) => handlePainSliderConfirm(v, msg.embed!.zoneName)}
                  />
                )}
              </>
            )}
          </MessageBubble>
        ))}

        {/* Streaming bubble */}
        {streamingText && (
          <MessageBubble
            role="assistant"
            text={cleanText(streamingText)}
            isStreaming
          />
        )}

        {/* Loading dots */}
        {isLoading && !streamingText && (
          <MessageBubble role="assistant" text="">
            <div className="flex gap-1 px-4 py-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full animate-bounce"
                  style={{ background: '#4ade80', animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </MessageBubble>
        )}

        {/* MoveScore result */}
        {isComplete && moveScore !== null && (
          <div
            className="mx-auto mt-4 rounded-2xl p-6 text-center max-w-sm"
            style={{ background: 'rgba(26,71,49,0.2)', border: '1px solid #1A4731' }}
          >
            <p className="text-xs text-neutral-400 uppercase tracking-widest mb-2">Tu MoveScore</p>
            <p className="text-6xl font-black mb-1" style={{ color: '#4ade80' }}>{moveScore}</p>
            <p className="text-sm text-neutral-400">/100</p>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {!isComplete && (
        <form
          onSubmit={handleSubmit}
          className="flex-shrink-0 border-t border-white/8 px-4 py-3 flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu respuesta…"
            disabled={isLoading}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-green-700 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-4 py-3 rounded-xl font-bold text-sm disabled:opacity-40 transition-all active:scale-95"
            style={{ background: '#1A4731', color: '#fff' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </form>
      )}
    </div>
  )
}
