'use client'

import { Suspense, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useQuestionnaireStore } from '@/store/questionnaireStore'
import { usePrehabStore } from '@/store/prehabStore'
import { saveQuestionnaire } from '@/lib/questionnaire/save'
import { cn } from '@/lib/utils'
import { Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react'

// ── Esquemas Zod ──────────────────────────────────────────────────────────────

const registerSchema = z.object({
  email:    z.string().min(1, 'El email es obligatorio').email('Email no válido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  rgpd:     z.literal(true, { errorMap: () => ({ message: 'Debes aceptar la política de privacidad' }) }),
})

const loginSchema = z.object({
  email:    z.string().min(1, 'El email es obligatorio').email('Email no válido'),
  password: z.string().min(1, 'Introduce tu contraseña'),
})

type RegisterData = z.infer<typeof registerSchema>
type LoginData    = z.infer<typeof loginSchema>

// ── Helper: guardar prehab y redirigir ────────────────────────────────────────

async function savePrehab(
  userId: string,
  prehabState: ReturnType<typeof usePrehabStore.getState>
): Promise<string> {
  const res = await fetch('/api/generate-prehab-report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sport:        prehabState.sport,
      ageRange:     prehabState.ageRange,
      level:        prehabState.level,
      season:       prehabState.season,
      trainingDays: prehabState.trainingDays,
      intensity:    prehabState.intensity,
      sessionHours: prehabState.sessionHours,
      goals:        prehabState.goals,
      injuryZones:  prehabState.injuryZones,
      sorenessZones: prehabState.sorenessZones,
    }),
  })

  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.error ?? 'Error generando informe PREHAB')
  }

  const { report_id } = await res.json()
  return report_id as string
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function RegistroPage() {
  return (
    <Suspense>
      <RegistroForm />
    </Suspense>
  )
}

function RegistroForm() {
  const router        = useRouter()
  const searchParams  = useSearchParams()
  const fromPrehab    = searchParams.get('from') === 'prehab'

  const supabase      = createClient()
  const storeState    = useQuestionnaireStore()
  const prehabState   = usePrehabStore()

  const [tab,          setTab]          = useState<'register' | 'login'>('register')
  const [showPassword, setShowPassword] = useState(false)
  const [loading,      setLoading]      = useState(false)
  const [loadingPhase, setLoadingPhase] = useState<'auth' | 'saving' | 'report'>('auth')
  const [serverError,  setServerError]  = useState('')
  const [emailPending, setEmailPending] = useState('')

  // ── Formularios ──────────────────────────────────────────────────────────

  const {
    register:    reg,
    handleSubmit: handleReg,
    formState:   { errors: regErrors },
  } = useForm<RegisterData>({
    resolver:      zodResolver(registerSchema),
    mode:          'onBlur',
    defaultValues: { email: '', password: '' },
  })

  const {
    register:    log,
    handleSubmit: handleLog,
    formState:   { errors: logErrors },
  } = useForm<LoginData>({
    resolver:      zodResolver(loginSchema),
    mode:          'onBlur',
    defaultValues: { email: '', password: '' },
  })

  // ── CSS helpers ──────────────────────────────────────────────────────────

  const inputCls = (error?: string) => cn(
    'w-full px-4 py-3 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2',
    error
      ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
      : 'border-slate-300 focus:border-[#F4DF49] focus:ring-[#F4DF49]/20'
  )

  // ── Lógica post-auth ─────────────────────────────────────────────────────

  const postAuth = async (userId: string) => {
    if (fromPrehab) {
      setLoadingPhase('saving')
      const reportId = await savePrehab(userId, prehabState)
      setLoadingPhase('report')
      prehabState.reset()
      router.push(`/prehab/informe/${reportId}`)
    } else {
      setLoadingPhase('saving')
      const reportId = await saveQuestionnaire(userId, storeState)
      setLoadingPhase('report')
      storeState.reset()
      router.push(`/informe/${reportId}`)
    }
  }

  // ── Handler registro ─────────────────────────────────────────────────────

  const handleRegister = async (data: RegisterData) => {
    setLoading(true)
    setLoadingPhase('auth')
    setServerError('')
    setEmailPending('')
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email:    data.email,
        password: data.password,
      })
      if (error) throw error
      if (!authData.user) throw new Error('No se pudo crear la cuenta')

      if (!authData.session) {
        setEmailPending(data.email)
        return
      }

      await postAuth(authData.user.id)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error inesperado'
      if (msg.includes('already registered') || msg.includes('User already registered')) {
        setServerError('Este email ya está registrado. Usa la pestaña "Ya tengo cuenta".')
      } else {
        setServerError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  // ── Handler login ────────────────────────────────────────────────────────

  const handleLogin = async (data: LoginData) => {
    setLoading(true)
    setServerError('')
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email:    data.email,
        password: data.password,
      })
      if (error) throw error
      if (!authData.user) throw new Error('No se pudo iniciar sesión')

      if (fromPrehab) {
        setLoadingPhase('saving')
        const reportId = await savePrehab(authData.user.id, prehabState)
        setLoadingPhase('report')
        prehabState.reset()
        router.push(`/prehab/informe/${reportId}`)
      } else if (storeState.selectedZones.length > 0 && storeState.currentStep === 'complete') {
        const reportId = await saveQuestionnaire(authData.user.id, storeState)
        storeState.reset()
        router.push(`/informe/${reportId}`)
      } else {
        router.push('/perfil')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error inesperado'
      if (msg.includes('Invalid login credentials')) {
        setServerError('Email o contraseña incorrectos.')
      } else {
        setServerError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="px-4 py-4 border-b border-slate-100 bg-white flex items-center gap-2">
        <span className="text-xl font-black text-[#111111] tracking-tight">Rezeta</span>
        <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ background: '#F4DF49', color: '#111111' }}>
          50
        </span>
        {fromPrehab && (
          <span className="text-xs text-slate-400 ml-1 font-medium">PREHAB</span>
        )}
      </header>

      <main className="flex-1 flex items-start justify-center pt-8 px-4 pb-12">
        <div className="w-full max-w-sm">

          <div className="text-center mb-6">
            <div className="text-4xl mb-3">{fromPrehab ? '⚡' : '🎉'}</div>
            <h1 className="text-2xl font-black text-[#111111] leading-tight">
              {fromPrehab ? 'Tu Athlete Health Score está listo.' : 'Tu valoración está lista.'}
            </h1>
            <p className="text-slate-500 text-sm mt-2">
              {fromPrehab
                ? 'Crea tu cuenta gratis para ver tu informe PREHAB.'
                : 'Crea tu cuenta gratis para ver tus resultados.'}
            </p>
          </div>

          {/* Email pendiente */}
          {emailPending && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-center space-y-2">
              <div className="text-2xl">📬</div>
              <p className="text-sm font-bold text-amber-800">Confirma tu email</p>
              <p className="text-xs text-amber-700">
                Enviamos un enlace a <strong>{emailPending}</strong>. Ábrelo y vuelve aquí para ver tu informe.
              </p>
            </div>
          )}

          {!emailPending && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

              {/* Tabs */}
              <div className="flex border-b border-slate-200">
                {(['register', 'login'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => { setTab(t); setServerError('') }}
                    className={cn(
                      'flex-1 py-3.5 text-sm font-semibold transition-all',
                      tab === t
                        ? 'text-[#111111] border-b-2 border-[#F4DF49] bg-white'
                        : 'text-slate-400 hover:text-slate-600'
                    )}
                  >
                    {t === 'register' ? 'Crear cuenta' : 'Ya tengo cuenta'}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {serverError && (
                  <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 flex items-start gap-2">
                    <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                    {serverError}
                  </div>
                )}

                {/* ── REGISTRO ── */}
                {tab === 'register' && (
                  <form onSubmit={handleReg(handleRegister)} className="space-y-4" noValidate>

                    {/* Email */}
                    <div>
                      <label htmlFor="reg-email" className="block text-sm font-semibold text-slate-700 mb-1">
                        Email
                      </label>
                      <input
                        id="reg-email"
                        type="email"
                        autoComplete="email"
                        placeholder="tu@email.com"
                        className={inputCls(regErrors.email?.message)}
                        {...reg('email')}
                      />
                      {regErrors.email && (
                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                          <AlertCircle size={12} /> {regErrors.email.message}
                        </p>
                      )}
                    </div>

                    {/* Contraseña */}
                    <div>
                      <label htmlFor="reg-password" className="block text-sm font-semibold text-slate-700 mb-1">
                        Contraseña
                      </label>
                      <div className="relative">
                        <input
                          id="reg-password"
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                          placeholder="Mínimo 8 caracteres"
                          className={cn(inputCls(regErrors.password?.message), 'pr-10')}
                          {...reg('password')}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      {regErrors.password && (
                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                          <AlertCircle size={12} /> {regErrors.password.message}
                        </p>
                      )}
                    </div>

                    {/* RGPD */}
                    <div>
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          className="mt-0.5 w-4 h-4 rounded border-slate-300 accent-[#F4DF49] flex-shrink-0"
                          {...reg('rgpd')}
                        />
                        <span className="text-xs text-slate-600 leading-relaxed">
                          Acepto la <span className="underline text-[#111111]">Política de Privacidad</span> y el
                          tratamiento de mis datos de salud con fines de orientación preventiva.
                        </span>
                      </label>
                      {regErrors.rgpd && (
                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                          <AlertCircle size={12} /> {regErrors.rgpd.message}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 rounded-xl font-bold text-[#111111] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                      style={{ background: '#F4DF49' }}
                    >
                      {loading ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          {loadingPhase === 'auth'   && 'Creando cuenta…'}
                          {loadingPhase === 'saving' && 'Guardando datos…'}
                          {loadingPhase === 'report' && 'Generando informe…'}
                        </>
                      ) : (
                        'Crear mi cuenta y ver el informe →'
                      )}
                    </button>
                  </form>
                )}

                {/* ── LOGIN ── */}
                {tab === 'login' && (
                  <form onSubmit={handleLog(handleLogin)} className="space-y-4" noValidate>

                    {/* Email */}
                    <div>
                      <label htmlFor="log-email" className="block text-sm font-semibold text-slate-700 mb-1">
                        Email
                      </label>
                      <input
                        id="log-email"
                        type="email"
                        autoComplete="email"
                        placeholder="tu@email.com"
                        className={inputCls(logErrors.email?.message)}
                        {...log('email')}
                      />
                      {logErrors.email && (
                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                          <AlertCircle size={12} /> {logErrors.email.message}
                        </p>
                      )}
                    </div>

                    {/* Contraseña */}
                    <div>
                      <label htmlFor="log-password" className="block text-sm font-semibold text-slate-700 mb-1">
                        Contraseña
                      </label>
                      <div className="relative">
                        <input
                          id="log-password"
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="current-password"
                          placeholder="Tu contraseña"
                          className={cn(inputCls(logErrors.password?.message), 'pr-10')}
                          {...log('password')}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      {logErrors.password && (
                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                          <AlertCircle size={12} /> {logErrors.password.message}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 rounded-xl font-bold text-white transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                      style={{ background: '#111111' }}
                    >
                      {loading
                        ? <><Loader2 size={18} className="animate-spin" /> Accediendo…</>
                        : 'Acceder a mi cuenta →'
                      }
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}

          {!emailPending && (
            <p className="text-center text-xs text-slate-400 mt-4 px-2">
              Sin spam. Sin confirmación de email. Acceso inmediato.
            </p>
          )}
        </div>
      </main>
    </div>
  )
}
