import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Valoración corporal',
  description:
    'Responde el cuestionario musculoesquelético de Rezeta 50. Selecciona tus zonas de molestia y recibe un informe personalizado con semáforo de riesgo.',
  robots: { index: true, follow: true },
}

export default function CuestionarioLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
