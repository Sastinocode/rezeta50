import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('sessionId')

  if (!sessionId) {
    return NextResponse.json({ scores: [] })
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ scores: [] })
  }

  const supabase = createServiceClient()

  const { data } = await supabase
    .from('move_scores')
    .select('id, score, details, created_at')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })

  return NextResponse.json({ scores: data ?? [] })
}
