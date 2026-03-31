'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useQuestionnaireStore } from '@/store/questionnaireStore'
import { saveQuestionnaire } from '@/lib/questionnaire/save'
import { cn } from '@/lib/utils'
import { Loader2, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'

// ── Esquemas Zod ──────────────────────────────────────────────────────────────

const registerSchema = z.object({
  email: z.string().email('Email no válido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  rgpd: z.literal(true, { errorMap: () => ({ message: 'Debes aceptar la política de privacidad' }) }),
})

const loginSchema = z.object({
  email: z.string().email('Email no válido'),
  password: z.string().min(1, 'Introduce tu contraseña'),
})

type RegisterData = z.infer<typeof registerSchema>
type LoginData = z.infer<typeof loginSchema>

// ── Input con icono ───────────────────────────────────────────────────────────

function InputField({
  label, type, placeholder, error, showToggle, onToggle, ...props
}: {
  label: string
  type: string
  placeholder: string
  error?: string
  showToggle?: boolean
  onToggle?: () => void
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1">{label}</label>
      <div className="relative">
        <input
          {...props}
          type={type}
          placeholder={placeholder}
          className={cn(
            'w-full px-4 py-3 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2',
            error
              ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
              : 'border-slate-300 focus:border-[#F4DF49] focus:ring-[#F4DF49]/20',
            showToggle && 'pr-10'
          )}
        />
        {showToggle && (
          <button
            type="button"
            onClick={onToggle}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {type === 'password' ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
        )}
      </div>
      {error && (
        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
          <AlertCircle size={12} /> {error}
        </p>
      )}
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function RegistroPage() {
  const router = useRouter()
  const supabase = createClient()
  const storeState = useQuestionnaireStore()

  const [tab, setTab] = useState<'register' | 'login'>('register')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingPhase, setLoadingPhase] = useState<'auth' | 'saving' | 'report'>('auth')
  const [serverError, setServerError] = useState('')

  // ── Formulario Registro ──────────────────────────────────────────────────

  const registerForm = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '', rgpd: undefined as unknown as true },
  })

  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  // ── Handler registro ─────────────────────────────────────────────────────

  const handleRegister = async (data: RegisterData) => {
    setLoading(true)
    setLoadingPhase('auth')
    setServerError('')
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      })
      if (error) throw error
      if (!authData.user) throw new Error('No se pudo crear la cuenta')

      // Guardar cuestionario y generar informe
      setLoadingPhase('saving')
      const reportId = await saveQuestionnaire(authData.user.id, storeState)
      setLoadingPhase('report')
      storeState.reset()
      router.push(`/informe/${reportId}`)
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
        email: data.email,
        password: data.password,
      })
      if (error) throw error
      if (!authData.user) throw new Error('No se pudo iniciar sesión')

      // Si hay cuestionario pendiente, guardarlo
      if (storeState.selectedZones.length > 0 && storeState.currentStep === 'complete') {
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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="px-4 py-4 border-b border-slate-100 bg-white flex items-center gap-2">
        <span className="text-xl font-black text-[#111111] tracking-tight">Rezeta</span>
        <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ background: '#F4DF49', color: '#111111' }}>
          50
        </span>
      </header>

      <main className="flex-1 flex items-start justify-center pt-8 px-4 pb-12">
        <div className="w-full max-w-sm">

          {/* Headline contextual */}
          <div className="text-center mb-6">
            <div className="text-4xl mb-3">🎉</div>
            <h1 className="text-2xl font-black text-[#111111] leading-tight">
              Tu valoración está lista.
            </h1>
            <p className="text-slate-500 text-sm mt-2">
              Crea tu cuenta gratis para ver tus resultados.
            </p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

            {/* Tabs */}
            <div className="flex border-b border-slate-200">
              {(['register', 'login'] as const).map((t) => (
                <button
                  key={t}
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
              {/* Error de servidor */}
              {serverError && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 flex items-start gap-2">
                  <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                  {serverError}
                </div>
              )}

              {/* ── FORMULARIO REGISTRO ── */}
              {tab === 'register' && (
                <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                  <InputField
                    label="Email"
                    type="email"
                    placeholder="tu@email.com"
                    error={registerForm.formState.errors.email?.message}
                    {...registerForm.register('email')}
                  />

                  <InputField
                    label="Contraseña"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Mínimo 8 caracteres"
                    error={registerForm.formState.errors.password?.message}
                    showToggle
                    onToggle={() => setShowPassword((v) => !v)}
                    {...registerForm.register('password')}
                  />

                  {/* RGPD */}
                  <div>
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        {...registerForm.register('rgpd')}
                        className="mt-0.5 w-4 h-4 rounded border-slate-300 accent-[#F4DF49] flex-shrink-0"
                      />
                      <span className="text-xs text-slate-600 leading-relaxed">
                        Acepto la{' '}
                        <span className="underline text-[#111111]">Política de Privacidad</span>
                        {' '}y el tratamiento de mis datos de salud con fines de orientación preventiva.
                      </span>
                    </label>
                    {registerForm.formState.errors.rgpd && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle size={12} />
                        {registerForm.formState.errors.rgpd.message}
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
                        {loadingPhase === 'auth' && 'Creando cuenta…'}
                        {loadingPhase === 'saving' && 'Guardando valoración…'}
                        {loadingPhase === 'report' && 'Generando informe…'}
                      </>
                    ) : (
                      'Crear mi cuenta y ver el informe →'
                    )}
                  </button>
                </form>
              )}

              {/* ── FORMULARIO LOGIN ── */}
              {tab === 'login' && (
                <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                  <InputField
                    label="Email"
                    type="email"
                    placeholder="tu@email.com"
                    error={loginForm.formState.errors.email?.message}
                    {...loginForm.register('email')}
                  />

                  <InputField
                    label="Contraseña"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Tu contraseña"
                    error={loginForm.formState.errors.password?.message}
                    showToggle
                    onToggle={() => setShowPassword((v) => !v)}
                    {...loginForm.register('password')}
                  />

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-xl font-bold text-white transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                    style={{ background: '#111111' }}
                  >
                    {loading ? (
                      <><Loader2 size={18} className="animate-spin" /> Accediendo…</>
                    ) : (
                      'Acceder a mi cuenta →'
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Nota sobre email confirmation */}
          <p className="text-center text-xs text-slate-400 mt-4 px-2">
            Sin spam. Sin confirmación de email. Acceso inmediato.
          </p>
        </div>
      </main>
    </div>
  )
}
