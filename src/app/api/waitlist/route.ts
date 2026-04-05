import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const { nombre, email, type } = body as Record<string, string>

  // ── Validación ──────────────────────────────────────────────────────────────
  if (!nombre || typeof nombre !== 'string' || nombre.trim().length < 2) {
    return NextResponse.json({ error: 'El nombre es obligatorio (mínimo 2 caracteres)' }, { status: 400 })
  }
  if (!email || typeof email !== 'string' || !EMAIL_RE.test(email.trim())) {
    return NextResponse.json({ error: 'El email no tiene un formato válido' }, { status: 400 })
  }
  if (!type || !['paciente', 'profesional'].includes(type)) {
    return NextResponse.json({ error: 'El tipo debe ser "paciente" o "profesional"' }, { status: 400 })
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Servidor no configurado aún' }, { status: 503 })
  }

  // ── Inserción ───────────────────────────────────────────────────────────────
  const supabase = createServiceClient()

  const { error } = await supabase.from('waitlist').insert({
    name: nombre.trim(),
    email: email.trim().toLowerCase(),
    plan_interest: type === 'profesional' ? 'pro' : 'free',
    source: type,
    status: 'waiting',
  } as never)

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Este email ya está en la lista' }, { status: 409 })
    }
    console.error('[waitlist] supabase error:', error.message)
    return NextResponse.json({ error: 'Error al guardar. Inténtalo de nuevo.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
