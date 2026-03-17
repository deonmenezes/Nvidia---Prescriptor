'use client'

import Header from '@/components/layout/Header'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Save, User, Shield, Bell } from 'lucide-react'
import type { Doctor } from '@/types'

export default function SettingsPage() {
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [form, setForm] = useState({ full_name: '', phone: '', specialization: '', license_number: '', hospital: '' })
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('doctors').select('*').eq('id', user.id).single()
      if (data) {
        setDoctor(data)
        setForm({ full_name: data.full_name ?? '', phone: data.phone ?? '', specialization: data.specialization ?? '', license_number: data.license_number ?? '', hospital: data.hospital ?? '' })
      }
    }
    load()
  }, [supabase])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('doctors').update(form).eq('id', user!.id)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    setLoading(false)
  }

  const cls = "w-full px-4 py-2.5 rounded-lg border border-slate-200 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 bg-white"
  const s = { '--tw-ring-color': '#0d9488' } as React.CSSProperties

  return (
    <div className="animate-fade-in">
      <Header title="Settings" subtitle="Manage your account and preferences" />
      <main className="p-6 max-w-2xl space-y-6">
        {/* Profile */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100 bg-slate-50">
            <User className="h-4 w-4 text-slate-500" />
            <h2 className="font-semibold text-slate-900">Doctor Profile</h2>
          </div>
          <form onSubmit={handleSave} className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                <input value={form.full_name} onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))} className={cls} style={s} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone</label>
                <input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} placeholder="+27 83..." className={cls} style={s} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Specialization</label>
                <input value={form.specialization} onChange={(e) => setForm((p) => ({ ...p, specialization: e.target.value }))} placeholder="Cardiology" className={cls} style={s} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">License Number</label>
                <input value={form.license_number} onChange={(e) => setForm((p) => ({ ...p, license_number: e.target.value }))} placeholder="MP123456" className={cls} style={s} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Hospital / Practice</label>
                <input value={form.hospital} onChange={(e) => setForm((p) => ({ ...p, hospital: e.target.value }))} placeholder="City General" className={cls} style={s} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button type="submit" disabled={loading} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-white text-sm font-semibold disabled:opacity-60" style={{ background: 'linear-gradient(135deg, #0d9488, #0891b2)' }}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save size={15} />}
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              {saved && <span className="text-sm text-emerald-600 font-medium">Saved!</span>}
            </div>
          </form>
        </div>

        {/* OpenClaw config */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100 bg-slate-50">
            <Shield className="h-4 w-4 text-slate-500" />
            <h2 className="font-semibold text-slate-900">OpenClaw WhatsApp Integration</h2>
          </div>
          <div className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 pulse-dot" />
              <p className="text-sm text-slate-600">OpenClaw is configured via environment variables.</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4 space-y-2 text-sm font-mono text-slate-600">
              <p>OPENCLAW_API_URL=<span className="text-teal-600">http://localhost:3000</span></p>
              <p>OPENCLAW_API_KEY=<span className="text-teal-600">(configured)</span></p>
            </div>
            <p className="text-xs text-slate-400 mt-3">Edit <code className="bg-slate-100 px-1 py-0.5 rounded">.env.local</code> to update OpenClaw settings. Restart the dev server after changes.</p>
          </div>
        </div>

        {/* Notification prefs placeholder */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100 bg-slate-50">
            <Bell className="h-4 w-4 text-slate-500" />
            <h2 className="font-semibold text-slate-900">Notification Preferences</h2>
          </div>
          <div className="p-5 space-y-3">
            {[
              { label: 'Email notifications for critical patients', default: true },
              { label: 'WhatsApp confirmation on message delivery', default: true },
              { label: 'Daily appointment summary', default: false },
            ].map((pref) => (
              <label key={pref.label} className="flex items-center justify-between gap-4 cursor-pointer group">
                <span className="text-sm text-slate-700">{pref.label}</span>
                <input type="checkbox" defaultChecked={pref.default} className="rounded" />
              </label>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
