'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'
import Link from 'next/link'

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  )
}

export default function RegisterPage() {
  const [form, setForm] = useState({
    full_name: '', email: '', password: '',
    specialization: '', license_number: '', hospital: '',
  })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  function update(k: keyof typeof form, v: string) {
    setForm((p) => ({ ...p, [k]: v }))
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: authErr } = await supabase.auth.signUp({ email: form.email, password: form.password })
    if (authErr || !data.user) { setError(authErr?.message ?? 'Registration failed'); setLoading(false); return }

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: data.user.id,
        full_name: form.full_name,
        email: form.email,
        specialization: form.specialization,
        license_number: form.license_number,
        hospital: form.hospital,
      }),
    })
    const json = await res.json()
    if (!res.ok) { setError(json.error ?? 'Failed to save profile'); setLoading(false); return }

    router.push('/dashboard')
    router.refresh()
  }

  async function handleGoogleRegister() {
    setGoogleLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    })
    if (error) { setError(error.message); setGoogleLoading(false) }
  }

  const inputBase = 'input-field'
  const label = 'block text-[12.5px] font-semibold mb-1.5'
  const labelColor = { color: '#374151' }

  return (
    <div className="animate-fade-up">
      <div
        className="rounded-2xl p-8"
        style={{ background: '#fff', boxShadow: '0 4px 24px rgba(15,23,42,.08), 0 1px 4px rgba(15,23,42,.04)', border: '1px solid #e8ecf1' }}
      >
        <div className="mb-6">
          <h1 className="text-[22px] font-bold" style={{ color: '#0f172a' }}>Create account</h1>
          <p className="text-[13.5px] mt-1" style={{ color: '#94a3b8' }}>Set up your doctor profile to get started</p>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl text-[13px] mb-4" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}>
            <AlertCircle size={15} className="shrink-0 mt-0.5" />{error}
          </div>
        )}

        {/* Google button */}
        <button
          type="button"
          onClick={handleGoogleRegister}
          disabled={googleLoading || loading}
          className="w-full flex items-center justify-center gap-3 py-2.5 rounded-xl text-[13.5px] font-semibold transition-all disabled:opacity-50 mb-5"
          style={{ background: '#fff', border: '1.5px solid #e2e8f0', color: '#374151', boxShadow: '0 1px 3px rgba(15,23,42,.06)' }}
          onMouseEnter={(e) => { if (!googleLoading) (e.currentTarget as HTMLElement).style.background = '#f8fafc' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#fff' }}
        >
          {googleLoading ? <Loader2 size={16} className="animate-spin" /> : <GoogleIcon />}
          {googleLoading ? 'Redirecting…' : 'Sign up with Google'}
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px" style={{ background: '#e8ecf1' }} />
          <span className="text-[11.5px] font-medium" style={{ color: '#b0bcc9' }}>or sign up with email</span>
          <div className="flex-1 h-px" style={{ background: '#e8ecf1' }} />
        </div>

        <form onSubmit={handleRegister} className="space-y-4">

          <div>
            <label className={label} style={labelColor}>Full Name</label>
            <input value={form.full_name} onChange={(e) => update('full_name', e.target.value)} required placeholder="Dr. Jane Smith" className={inputBase} />
          </div>

          <div>
            <label className={label} style={labelColor}>Email address</label>
            <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} required placeholder="doctor@hospital.com" className={inputBase} />
          </div>

          <div>
            <label className={label} style={labelColor}>Password</label>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} value={form.password} onChange={(e) => update('password', e.target.value)} required placeholder="••••••••" className={`${inputBase} pr-11`} />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: '#9ca3af' }}>
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label} style={labelColor}>Specialization</label>
              <input value={form.specialization} onChange={(e) => update('specialization', e.target.value)} placeholder="Cardiology" className={inputBase} />
            </div>
            <div>
              <label className={label} style={labelColor}>License No.</label>
              <input value={form.license_number} onChange={(e) => update('license_number', e.target.value)} placeholder="MP123456" className={inputBase} />
            </div>
          </div>

          <div>
            <label className={label} style={labelColor}>Hospital / Practice</label>
            <input value={form.hospital} onChange={(e) => update('hospital', e.target.value)} placeholder="City General Hospital" className={inputBase} />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 mt-1">
            {loading && <Loader2 size={15} className="animate-spin" />}
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-[12.5px] mt-5" style={{ color: '#94a3b8' }}>
          Already have an account?{' '}
          <Link href="/login" className="font-semibold hover:underline" style={{ color: '#0d9488' }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
