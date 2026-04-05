// Admin layout — no auth guard for MVP
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: '#0d0d0d', color: '#fff' }}>
      <div className="max-w-5xl mx-auto px-4 py-8">{children}</div>
    </div>
  )
}
