import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  let body: { sessionId: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const { sessionId } = body
  if (!sessionId) return NextResponse.json({ error: 'sessionId requerido' }, { status: 400 })

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ ok: true, skipped: true })
  }

  const supabase = createServiceClient()

  // Upsert — idempotent on page reload
  const { error } = await supabase.from('move_sessions').upsert({
    id: sessionId,
    session_token: sessionId,
    status: 'in_progress',
    started_at: new Date().toISOString(),
  } as never, { onConflict: 'id', ignoreDuplicates: true })

  if (error) console.error('[session] upsert error:', error.message)

  return NextResponse.json({ ok: true })
}
