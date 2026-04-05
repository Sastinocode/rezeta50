import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { calculateMoveScore, type MoveChatPayload } from '@/lib/scoring/calculateMoveScore'
import { getSemaforo } from '@/lib/scoring/semaforo'
import { hasRedFlags } from '@/lib/scoring/redflags'

export async function POST(request: NextRequest) {
  let body: MoveChatPayload & { sessionId: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const { sessionId, ...payload } = body

  if (!sessionId || typeof sessionId !== 'string') {
    return NextResponse.json({ error: 'sessionId requerido' }, { status: 400 })
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Servidor no configurado' }, { status: 503 })
  }

  // ── Calculate score ──────────────────────────────────────────────────────
  const result = calculateMoveScore(payload)
  const redFlag = hasRedFlags(payload)

  const finalScore = redFlag.hasFlag ? 100 : result.score
  const semaforo = getSemaforo(finalScore)

  // ── Persist ──────────────────────────────────────────────────────────────
  const supabase = createServiceClient()

  // Update session
  await supabase
    .from('move_sessions')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      metadata: {
        movescore: finalScore,
        semaforo: semaforo.color,
        nivel_urgencia: payload.nivel_urgencia,
        zonas_afectadas: payload.zonas_afectadas,
        red_flags: redFlag.hasFlag ? redFlag.reasons : null,
        factors: result.factors,
      },
    } as never)
    .eq('id', sessionId)

  // Insert score record
  const { data: scoreRow, error: scoreError } = await supabase
    .from('move_scores')
    .insert({
      session_id: sessionId,
      category: 'overall',
      score: finalScore,
      max_score: 100,
      details: {
        semaforo: semaforo.color,
        zone: result.zone,
        red_flags: redFlag.hasFlag ? redFlag.reasons : null,
        factors: result.factors,
        payload_summary: {
          nivel_urgencia: payload.nivel_urgencia,
          impacto_vida_diaria: payload.impacto_vida_diaria,
          zonas: (payload.zonas_afectadas ?? []).map((z) => z.zona),
        },
      },
    } as never)
    .select('id')
    .single()

  if (scoreError) {
    console.error('[score] insert error:', scoreError.message)
    return NextResponse.json({ error: 'Error guardando resultado' }, { status: 500 })
  }

  return NextResponse.json({
    scoreId: (scoreRow as { id: string }).id,
    score: finalScore,
    semaforo: semaforo.color,
    zone: result.zone,
    redFlag: redFlag.hasFlag,
  })
}
