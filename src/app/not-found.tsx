import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Página no encontrada',
  robots: { index: false },
}

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 text-center">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8">
        <span className="text-xl font-black text-[#111111] tracking-tight">Rezeta</span>
        <span
          className="text-xs font-bold px-1.5 py-0.5 rounded"
          style={{ background: '#F4DF49', color: '#111111' }}
        >
          50
        </span>
      </div>

      {/* Semáforo de error */}
      <div className="flex gap-3 mb-6">
        <div className="w-5 h-5 rounded-full bg-slate-200" />
        <div className="w-5 h-5 rounded-full bg-slate-200" />
        <div className="w-5 h-5 rounded-full bg-red-400" />
      </div>

      <h1 className="text-6xl font-black text-[#111111] mb-2">404</h1>
      <p className="text-lg font-semibold text-slate-700 mb-1">Página no encontrada</p>
      <p className="text-sm text-slate-500 mb-8 max-w-xs">
        Esta página no existe o ha sido movida. Vuelve al inicio para continuar tu valoración.
      </p>

      <Link
        href="/"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-white text-sm transition-all active:scale-95"
        style={{ background: '#F4DF49' }}
      >
        Volver al inicio →
      </Link>
    </div>
  )
}
