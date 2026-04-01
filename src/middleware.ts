import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANTE: refresca la sesión — nunca eliminar este await
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // ── Rutas privadas: requieren sesión ──────────────────────────────────────
  const isPrivate =
    pathname.startsWith('/informe') ||
    pathname.startsWith('/prehab/informe') ||
    pathname.startsWith('/perfil') ||
    pathname.startsWith('/admin')

  if (isPrivate && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/registro'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  // ── Rutas admin: verificar rol en user_roles ──────────────────────────────
  if (pathname.startsWith('/admin') && user) {
    const { data: roleRow } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle()

    if (!roleRow) {
      const url = request.nextUrl.clone()
      url.pathname = '/perfil'
      return NextResponse.redirect(url)
    }
  }

  // ── Rutas públicas con sesión activa ──────────────────────────────────────
  // Si el usuario ya está logueado y va a /registro sin datos pendientes, redirigir al perfil
  // Excepción: si viene de prehab (?from=prehab) o del cuestionario (?next=...) permitir el registro
  const fromParam = request.nextUrl.searchParams.get('from')
  const nextParam = request.nextUrl.searchParams.get('next')
  if (pathname === '/registro' && user && !fromParam && !nextParam) {
    const url = request.nextUrl.clone()
    url.pathname = '/perfil'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    // Excluir estáticos, imágenes y API routes de Supabase
    '/((?!_next/static|_next/image|favicon.ico|api/auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
