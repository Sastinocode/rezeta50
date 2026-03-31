// ─────────────────────────────────────────────────────────────────────────────
// Rezeta 50 · Navbar — Server Component
// Solo aparece en rutas (private) y admin. NO en landing ni cuestionario.
// ─────────────────────────────────────────────────────────────────────────────

import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { LogOut, User, LayoutDashboard } from 'lucide-react'

export default async function Navbar() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  // Comprobar rol admin
  let isAdmin = false
  if (user) {
    const { data: roleRow } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle()
    isAdmin = !!roleRow
  }

  return (
    <header className="w-full bg-white border-b border-slate-100 px-4 py-3">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <span className="text-lg font-black text-[#111111] tracking-tight">Rezeta</span>
          <span
            className="text-xs font-bold px-1.5 py-0.5 rounded"
            style={{ background: '#F4DF49', color: '#111111' }}
          >
            50
          </span>
        </Link>

        {/* Navegación */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {user ? (
            <>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-lg text-[#111111] hover:bg-slate-100 transition-colors"
                >
                  <LayoutDashboard size={14} />
                  <span className="hidden sm:inline">Admin</span>
                </Link>
              )}
              <Link
                href="/perfil"
                className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <User size={14} />
                <span className="hidden sm:inline">Mi perfil</span>
              </Link>
              <form action="/api/auth/signout" method="POST">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-lg text-slate-500 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={14} />
                  <span className="hidden sm:inline">Salir</span>
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/registro"
              className="text-xs sm:text-sm font-bold px-4 py-2 rounded-xl text-white transition-all"
              style={{ background: '#F4DF49' }}
            >
              Iniciar sesión
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
