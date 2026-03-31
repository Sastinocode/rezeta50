import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Crea tu cuenta',
  description:
    'Crea tu cuenta gratuita en Rezeta 50 para ver tu informe musculoesquelético personalizado.',
  robots: { index: false, follow: false },
}

export default function RegistroLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
