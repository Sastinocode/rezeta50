'use client'

import type { ReactNode } from 'react'

export type MessageRole = 'user' | 'assistant'

interface MessageBubbleProps {
  role: MessageRole
  text?: string
  children?: ReactNode   // for embedded components (body map, slider)
  isStreaming?: boolean
}

export function MessageBubble({ role, text, children, isStreaming }: MessageBubbleProps) {
  const isUser = role === 'user'

  return (
    <div className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {/* Avatar — Claude only */}
      {!isUser && (
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mr-2 mt-0.5 text-xs font-black"
          style={{ background: '#1A4731', color: '#4ade80' }}
        >
          M
        </div>
      )}

      <div className={`max-w-[85%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-2`}>
        {/* Text bubble */}
        {text && (
          <div
            className="px-4 py-3 rounded-2xl text-sm leading-relaxed"
            style={
              isUser
                ? {
                    background: '#1A4731',
                    color: '#e2ffe4',
                    borderBottomRightRadius: 4,
                  }
                : {
                    background: 'rgba(255,255,255,0.07)',
                    color: '#e5e7eb',
                    borderBottomLeftRadius: 4,
                    border: '1px solid rgba(255,255,255,0.06)',
                  }
            }
          >
            {text}
            {isStreaming && (
              <span className="inline-block ml-1 animate-pulse text-green-400">▋</span>
            )}
          </div>
        )}

        {/* Embedded component (body map, slider, etc.) */}
        {children && (
          <div className={`w-full ${isUser ? '' : ''}`}>
            {children}
          </div>
        )}
      </div>

      {/* Avatar — User only */}
      {isUser && (
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ml-2 mt-0.5 text-xs font-black"
          style={{ background: 'rgba(255,255,255,0.1)', color: '#9ca3af' }}
        >
          Tú
        </div>
      )}
    </div>
  )
}
