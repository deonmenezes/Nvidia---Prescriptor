export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex" style={{ background: '#08101f' }}>
      {/* ── Left branding half ── */}
      <div className="hidden lg:flex lg:w-[52%] flex-col justify-between p-14 relative overflow-hidden">
        {/* Ambient blobs */}
        <div
          className="absolute -top-32 -left-32 h-[520px] w-[520px] rounded-full opacity-20 blur-[80px] pointer-events-none"
          style={{ background: 'radial-gradient(circle, #0d9488, transparent 70%)' }}
        />
        <div
          className="absolute bottom-0 right-0 h-96 w-96 rounded-full opacity-15 blur-[60px] pointer-events-none"
          style={{ background: 'radial-gradient(circle, #0891b2, transparent 70%)' }}
        />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-2xl"
            style={{ background: 'linear-gradient(135deg,#0d9488,#0891b2)', boxShadow: '0 8px 24px rgba(13,148,136,.45)' }}
          >
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <div>
            <p className="text-white font-bold text-lg leading-tight">Prescriptor.ai</p>
            <p className="text-[11px] font-medium" style={{ color: '#14b8a6' }}>Healthcare Platform</p>
          </div>
        </div>

        {/* Hero */}
        <div className="relative z-10 max-w-sm">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11.5px] font-semibold mb-6"
            style={{ background: 'rgba(13,148,136,.15)', color: '#14b8a6', border: '1px solid rgba(13,148,136,.25)' }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-teal-400 pulse-dot" />
            Trusted by 500+ doctors
          </div>
          <h2 className="text-[38px] font-bold text-white leading-[1.18] tracking-tight mb-5">
            Better care,<br />
            <span style={{ background: 'linear-gradient(90deg,#14b8a6,#38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              faster outcomes.
            </span>
          </h2>
          <p className="text-[15px] leading-relaxed mb-8" style={{ color: '#64748b' }}>
            Manage patients, automate medicine reminders, and send
            WhatsApp messages — all in one place.
          </p>

          <div className="space-y-3.5">
            {[
              { icon: '💊', label: 'Automated medicine reminders via WhatsApp' },
              { icon: '📋', label: 'Patient report management and notes' },
              { icon: '📅', label: 'Appointment scheduling and follow-ups' },
              { icon: '💬', label: 'Direct messaging to patients' },
            ].map((f) => (
              <div key={f.label} className="flex items-center gap-3">
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-base"
                  style={{ background: 'rgba(255,255,255,0.06)' }}
                >
                  {f.icon}
                </span>
                <span className="text-[13.5px]" style={{ color: '#94a3b8' }}>{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="relative z-10 text-[11px]" style={{ color: '#3f5068' }}>
          © 2025 Prescriptor.ai · Built for healthcare professionals
        </p>
      </div>

      {/* ── Right form half ── */}
      <div
        className="flex-1 flex items-center justify-center p-6 lg:p-12 relative"
        style={{ background: '#f4f6f9' }}
      >
        {/* Corner accent */}
        <div
          className="absolute top-0 right-0 h-64 w-64 pointer-events-none opacity-40 blur-[60px]"
          style={{ background: 'radial-gradient(circle at top right, rgba(13,148,136,.18), transparent 70%)' }}
        />
        <div className="w-full max-w-[400px] relative z-10">
          {children}
        </div>
      </div>
    </div>
  )
}
