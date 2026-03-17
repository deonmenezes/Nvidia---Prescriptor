'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/settings`,
    })
    if (error) { setError(error.message); setLoading(false); return }
    setSent(true)
    setLoading(false)
  }

  return (
    <div className="animate-fade-up">
      <div
        className="rounded-2xl p-8"
        style={{ background: '#fff', boxShadow: '0 4px 24px rgba(15,23,42,.08), 0 1px 4px rgba(15,23,42,.04)', border: '1px solid #e8ecf1' }}
      >
        <div className="mb-6">
          <h1 className="text-[22px] font-bold" style={{ color: '#0f172a' }}>Reset password</h1>
          <p className="text-[13.5px] mt-1" style={{ color: '#94a3b8' }}>
            Enter your email and we&apos;ll send a reset link
          </p>
        </div>

        {sent ? (
          <div className="flex flex-col items-center py-6 gap-3 text-center">
            <CheckCircle size={36} className="text-emerald-500" />
            <p className="font-semibold text-slate-800">Check your inbox</p>
            <p className="text-[13px] text-slate-500">A password reset link was sent to <strong>{email}</strong></p>
            <Link href="/login" className="mt-2 text-[13px] font-semibold hover:underline" style={{ color: '#0d9488' }}>
              Back to sign in
            </Link>
          </div>
        ) : (
          <>
            {error && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl text-[13px] mb-4" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}>
                <AlertCircle size={15} className="shrink-0 mt-0.5" />{error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[12.5px] font-semibold mb-1.5" style={{ color: '#374151' }}>Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="doctor@hospital.com"
                  className="input-field"
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
                {loading && <Loader2 size={15} className="animate-spin" />}
                {loading ? 'Sending…' : 'Send Reset Link'}
              </button>
            </form>
            <p className="text-center text-[12.5px] mt-5" style={{ color: '#94a3b8' }}>
              <Link href="/login" className="inline-flex items-center gap-1 font-semibold hover:underline" style={{ color: '#0d9488' }}>
                <ArrowLeft size={13} /> Back to sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
