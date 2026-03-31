'use client'

import { useState, useEffect, useCallback } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface AuthState {
  user: User | null
  session: Session | null
  isAdmin: boolean
  loading: boolean
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAuth() {
  const supabase = createClient()

  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    isAdmin: false,
    loading: true,
  })

  // Comprueba el rol admin en la tabla user_roles
  const checkAdmin = useCallback(
    async (userId: string): Promise<boolean> => {
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle()
      return data !== null
    },
    [supabase]
  )

  useEffect(() => {
    // Sesión inicial
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const user = session?.user ?? null
      const isAdmin = user ? await checkAdmin(user.id) : false
      setState({ user, session, isAdmin, loading: false })
    })

    // Listener de cambios de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const user = session?.user ?? null
        const isAdmin = user ? await checkAdmin(user.id) : false
        setState({ user, session, isAdmin, loading: false })
      }
    )

    return () => subscription.unsubscribe()
  }, [checkAdmin, supabase])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [supabase])

  return { ...state, signOut }
}
