import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { SYSTEM_PROMPT } from '@/lib/claude/systemPrompt'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

interface ApiMessage {
  role: 'user' | 'assistant'
  content: string
}

export async function POST(request: NextRequest) {
  let body: { messages: ApiMessage[]; sessionId?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const { messages } = body

  if (!Array.isArray(messages)) {
    return NextResponse.json({ error: 'messages debe ser un array' }, { status: 400 })
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY no configurada' }, { status: 503 })
  }

  // ── Build Anthropic messages ──────────────────────────────────────────────
  // Anthropic requires alternating user/assistant roles, starting with user.
  // If history is empty, we send a silent trigger to get the opening message.
  const anthropicMessages: Anthropic.MessageParam[] = messages.length === 0
    ? [{ role: 'user', content: 'Hola, quiero empezar mi evaluación.' }]
    : messages.map((m) => ({ role: m.role, content: m.content }))

  // ── Streaming response ────────────────────────────────────────────────────
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await anthropic.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 1024,
          system: SYSTEM_PROMPT,
          messages: anthropicMessages,
          stream: true,
        })

        for await (const event of response) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            const data = JSON.stringify({ delta: event.delta.text })
            controller.enqueue(encoder.encode(`data: ${data}\n\n`))
          }
        }

        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Error desconocido'
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: msg })}\n\n`))
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
