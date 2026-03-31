import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://rezeta50.vercel.app'),
  title: {
    default: 'Rezeta 50 · Cuestionario musculoesquelético gratuito',
    template: '%s · Rezeta 50',
  },
  description:
    'Cuestionario musculoesquelético gratuito. Descubre el estado de tus articulaciones y recibe un informe personalizado con semáforo de riesgo y programas de ejercicio.',
  keywords: [
    'valoración musculoesquelética',
    'cuestionario dolor',
    'fisioterapia',
    'ejercicio terapéutico',
    'Zincuenta Sport Club',
    'Murcia',
  ],
  authors: [{ name: 'Zincuenta Sport Club' }],
  openGraph: {
    title: 'Rezeta 50 · Cuestionario musculoesquelético gratuito',
    description:
      'Marca tus zonas de dolor, responde el cuestionario y recibe tu informe personalizado con semáforo de riesgo.',
    type: 'website',
    locale: 'es_ES',
    siteName: 'Rezeta 50',
    images: [{ url: '/og-image.svg', width: 1200, height: 630, alt: 'Rezeta 50' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rezeta 50 · Cuestionario musculoesquelético gratuito',
    description: 'Descubre qué zonas de tu cuerpo necesitan atención. Informe personalizado gratis.',
    images: ['/og-image.svg'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans min-h-screen bg-background text-foreground antialiased`}>
        {children}
      </body>
    </html>
  )
}
