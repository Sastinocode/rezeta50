import { WaitlistForm } from '@/components/waitlist-form'

const GREEN = '#1A4731'
const GREEN_LIGHT = '#4ade80'

// ── Iconos SVG inline ─────────────────────────────────────────────────────────
function IconClipboard() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={GREEN_LIGHT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <line x1="9" y1="12" x2="15" y2="12" /><line x1="9" y1="16" x2="13" y2="16" />
    </svg>
  )
}
function IconChart() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={GREEN_LIGHT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
      <line x1="2" y1="20" x2="22" y2="20" />
    </svg>
  )
}
function IconTarget() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={GREEN_LIGHT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
    </svg>
  )
}

const STEPS = [
  { icon: <IconClipboard />, step: '01', title: 'Cuestionario', desc: 'Responde 5 minutos de preguntas sobre tu cuerpo, historial y objetivos de movimiento.' },
  { icon: <IconChart />,     step: '02', title: 'MoveScore',    desc: 'El algoritmo evalúa tu perfil y genera una puntuación por categorías: movilidad, fuerza, equilibrio y resistencia.' },
  { icon: <IconTarget />,    step: '03', title: 'Solución',     desc: 'Recibe un plan personalizado: programa de ejercicios, recomendaciones de profesional o acceso al marketplace.' },
]

const FAQS = [
  { q: '¿Es gratuito?', a: 'El cuestionario y el informe básico son 100 % gratuitos. Los planes de entrenamiento avanzados y las consultas con profesionales tienen precio.' },
  { q: '¿Quién puede usar Move?', a: 'Cualquier persona que quiera mejorar su salud musculoesquelética, prevenir lesiones o recuperarse de una. También fisioterapeutas y entrenadores que quieran usarlo con sus pacientes.' },
  { q: '¿Cuándo lanza?', a: 'Estamos en fase de desarrollo. Los primeros en la lista de espera tendrán acceso anticipado y precio especial de lanzamiento.' },
  { q: '¿Es un diagnóstico médico?', a: 'No. Move es una herramienta de orientación preventiva. Ante dolor intenso o limitación funcional, siempre consulta a un profesional sanitario.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen text-white" style={{ background: '#0d0d0d' }}>

      {/* ── Header ────────────────────────────────────────────────────── */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-white/8 max-w-5xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-xl font-black tracking-tight" style={{ color: GREEN_LIGHT }}>Move</span>
          <span className="text-xs font-medium text-neutral-500">by Zincuenta</span>
        </div>
        <a
          href="#waitlist"
          className="text-sm font-semibold px-4 py-2 rounded-lg border transition-colors"
          style={{ borderColor: GREEN, color: GREEN_LIGHT }}
        >
          Lista de espera
        </a>
      </header>

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section className="px-6 py-20 text-center max-w-3xl mx-auto">
        <span
          className="inline-block text-xs font-bold px-3 py-1 rounded-full mb-6 tracking-widest uppercase"
          style={{ background: 'rgba(26,71,49,0.4)', color: GREEN_LIGHT, border: `1px solid ${GREEN}` }}
        >
          Próximamente
        </span>
        <h1 className="text-4xl sm:text-6xl font-black leading-tight mb-5">
          Conoce tu cuerpo.<br />
          <span style={{ color: GREEN_LIGHT }}>Muévete mejor.</span>
        </h1>
        <p className="text-lg text-neutral-400 leading-relaxed max-w-xl mx-auto mb-10">
          Move analiza tu perfil de movimiento y te conecta con el plan de ejercicios o el profesional que necesitas exactamente.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="#waitlist"
            className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl font-bold text-sm transition-all hover:opacity-90 active:scale-95"
            style={{ background: GREEN, color: '#fff' }}
          >
            Hacer mi cuestionario gratis →
          </a>
          <a
            href="#profesional"
            className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl font-semibold text-sm border transition-all hover:bg-white/5"
            style={{ borderColor: 'rgba(255,255,255,0.12)', color: '#d1d5db' }}
          >
            Soy profesional
          </a>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ─────────────────────────────────────────────── */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-black mb-2">Cómo funciona</h2>
          <p className="text-neutral-400 text-sm">Tres pasos, cinco minutos, resultados reales</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {STEPS.map((s) => (
            <div
              key={s.step}
              className="rounded-2xl p-6 border"
              style={{ background: 'rgba(26,71,49,0.08)', borderColor: 'rgba(26,71,49,0.35)' }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(26,71,49,0.4)' }}>
                  {s.icon}
                </div>
                <span className="text-xs font-black text-neutral-600 tracking-widest">{s.step}</span>
              </div>
              <h3 className="text-lg font-black mb-2" style={{ color: GREEN_LIGHT }}>{s.title}</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PARA QUIÉN ES ─────────────────────────────────────────────── */}
      <section id="profesional" className="px-6 py-16 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-black mb-2">¿Para quién es Move?</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Pacientes */}
          <div className="rounded-2xl p-7 border" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.1)' }}>
            <div className="text-3xl mb-4">🙋</div>
            <h3 className="text-xl font-black mb-3">Pacientes y deportistas</h3>
            <ul className="space-y-2.5">
              {[
                'Tienes dolor o molestias y no sabes por dónde empezar',
                'Quieres prevenir lesiones antes de que ocurran',
                'Buscas un plan de ejercicios adaptado a tu estado real',
                'Quieres saber si necesitas un fisio o puedes hacerlo solo',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-neutral-300">
                  <span className="mt-0.5 flex-shrink-0 text-green-500">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Profesionales */}
          <div
            className="rounded-2xl p-7 border"
            style={{ background: 'rgba(26,71,49,0.1)', borderColor: `${GREEN}60` }}
          >
            <div className="text-3xl mb-4">🩺</div>
            <h3 className="text-xl font-black mb-3">Fisioterapeutas y entrenadores</h3>
            <ul className="space-y-2.5">
              {[
                'Evalúa a tus pacientes o clientes en 5 minutos con datos objetivos',
                'Genera informes automáticos de MoveScore',
                'Conéctate con usuarios que buscan exactamente tu perfil',
                'Amplía tu cartera de clientes sin esfuerzo de marketing',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-neutral-300">
                  <span className="mt-0.5 flex-shrink-0" style={{ color: GREEN_LIGHT }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── WAITLIST ──────────────────────────────────────────────────── */}
      <section id="waitlist" className="px-6 py-16">
        <div
          className="max-w-md mx-auto rounded-3xl p-8 border"
          style={{ background: 'rgba(26,71,49,0.12)', borderColor: `${GREEN}50` }}
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black mb-2">Acceso anticipado</h2>
            <p className="text-neutral-400 text-sm leading-relaxed">
              Sé de los primeros en probarlo. Precio especial para los 200 primeros.
            </p>
          </div>
          <WaitlistForm />
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────── */}
      <section className="px-6 py-16 max-w-2xl mx-auto">
        <h2 className="text-2xl font-black text-center mb-10">Preguntas frecuentes</h2>
        <div className="space-y-4">
          {FAQS.map((faq) => (
            <div
              key={faq.q}
              className="rounded-2xl p-6 border"
              style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}
            >
              <p className="font-bold text-white mb-2">{faq.q}</p>
              <p className="text-sm text-neutral-400 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────── */}
      <footer className="px-6 py-10 border-t border-white/8 text-center">
        <p className="text-base font-bold mb-1" style={{ color: GREEN_LIGHT }}>Move</p>
        <p className="text-sm text-neutral-500">Muévete con intención. Recupera con precisión.</p>
        <p className="text-xs text-neutral-700 mt-4">
          © {new Date().getFullYear()} Zincuenta Sport Club · Murcia
        </p>
      </footer>

    </div>
  )
}
