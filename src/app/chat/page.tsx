'use client'

import { useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { ChatInterface } from '@/components/movechat/ChatInterface'

const SESSION_KEY = 'movechat_session_id'

export default function ChatPage() {
  const [sessionId, setSessionId] = useState<string | null>(null)

  useEffect(() => {
    // Retrieve or generate session ID
    let id = localStorage.getItem(SESSION_KEY)
    if (!id) {
      id = uuidv4()
      localStorage.setItem(SESSION_KEY, id)
    }
    setSessionId(id)

    // Insert session into Supabase (fire-and-forget)
    fetch('/api/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: id }),
    }).catch(() => { /* non-critical */ })
  }, [])

  if (!sessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0d0d0d' }}>
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
    )
  }

  return (
    <div
      className="flex flex-col min-h-screen max-w-lg mx-auto"
      style={{ background: '#0d0d0d' }}
    >
      {/* Header */}
      <header
        className="flex-shrink-0 px-4 py-3 flex items-center justify-between border-b border-white/8"
        style={{ background: 'rgba(13,13,13,0.95)', backdropFilter: 'blur(8px)' }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black"
            style={{ background: '#1A4731', color: '#4ade80' }}
          >
            M
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-tight">MoveCoach</p>
            <p className="text-[10px] text-green-500 font-medium">● En línea</p>
          </div>
        </div>
        <button
          onClick={() => {
            localStorage.removeItem(SESSION_KEY)
            window.location.reload()
          }}
          className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
        >
          Nueva sesión
        </button>
      </header>

      {/* Chat */}
      <div className="flex-1 flex flex-col min-h-0">
        <ChatInterface sessionId={sessionId} />
      </div>
    </div>
  )
}
