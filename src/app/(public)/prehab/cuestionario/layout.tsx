import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'PREHAB · Prevención de lesiones deportivas',
  description:
    'Cuestionario de prevención deportiva Rezeta 50. Evalúa tu perfil atlético, carga de entrenamiento e historial de lesiones para anticiparte a los riesgos.',
  robots: { index: true, follow: true },
}

export default function PrehabLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
