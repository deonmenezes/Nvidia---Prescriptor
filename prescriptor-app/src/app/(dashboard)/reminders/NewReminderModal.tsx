'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, X, Loader2, Bell } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Patient {
  id: string
  full_name: string
  phone: string
}

interface Props {
  patients: Patient[]
  defaultPatientId?: string
}

export default function NewReminderModal({ patients, defaultPatientId }: Props) {
  const [open, setOpen] = useState(!!defaultPatientId)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    patient_id: defaultPatientId ?? '',
    title: '',
    message: '',
    reminder_type: 'medicine',
    frequency: 'once',
    scheduled_at: '',
    is_recurring: false,
    send_whatsapp: true,
    send_sms: false,
  })
  const router = useRouter()
  const supabase = createClient()

  function update(k: keyof typeof form, v: string | boolean) {
    setForm((p) => ({ ...p, [k]: v }))
  }

  const TEMPLATES = [
    { label: '💊 Take Medicine', message: 'Hi, this is a reminder to take your prescribed medication. Please take it at the scheduled time.' },
    { label: '📅 Appointment', message: 'Hi, you have a medical appointment scheduled. Please confirm your attendance.' },
    { label: '🩺 Check-up', message: 'Hi, it\'s time for your regular check-up. Please contact us to schedule an appointment.' },
    { label: '📊 Test Results', message: 'Hi, your test results are ready. Please contact us to discuss the results with the doctor.' },
  ]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()

    const { error: err } = await supabase.from('reminders').insert({
      ...form,
      doctor_id: user!.id,
      status: 'pending',
    })

    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    setOpen(false)
    setForm({ patient_id: '', title: '', message: '', reminder_type: 'medicine', frequency: 'once', scheduled_at: '', is_recurring: false, send_whatsapp: true, send_sms: false })
    router.refresh()
  }

  const inputCls = "w-full px-3 py-2.5 rounded-lg border border-slate-200 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 bg-white"
  const s = { '--tw-ring-color': '#0d9488' } as React.CSSProperties

  return (
    <>
      <button onClick={() => setOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ background: 'linear-gradient(135deg, #0d9488, #0891b2)' }}>
        <Plus size={16} /> New Reminder
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-amber-500" />
                <h2 className="font-bold text-slate-900">New Reminder</h2>
              </div>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Patient *</label>
                <select value={form.patient_id} onChange={(e) => update('patient_id', e.target.value)} required className={inputCls} style={s}>
                  <option value="">Select patient...</option>
                  {patients.map((p) => <option key={p.id} value={p.id}>{p.full_name} — {p.phone}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Title *</label>
                <input value={form.title} onChange={(e) => update('title', e.target.value)} required placeholder="e.g. Take morning medication" className={inputCls} style={s} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Type</label>
                  <select value={form.reminder_type} onChange={(e) => update('reminder_type', e.target.value)} className={inputCls} style={s}>
                    <option value="medicine">💊 Medicine</option>
                    <option value="appointment">📅 Appointment</option>
                    <option value="checkup">🩺 Check-up</option>
                    <option value="custom">🔔 Custom</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Frequency</label>
                  <select value={form.frequency} onChange={(e) => update('frequency', e.target.value)} className={inputCls} style={s}>
                    <option value="once">Once</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Scheduled Date & Time *</label>
                <input type="datetime-local" value={form.scheduled_at} onChange={(e) => update('scheduled_at', e.target.value)} required className={inputCls} style={s} />
              </div>

              {/* Message templates */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Quick Templates</label>
                <div className="grid grid-cols-2 gap-2">
                  {TEMPLATES.map((t) => (
                    <button key={t.label} type="button" onClick={() => update('message', t.message)} className="text-left px-3 py-2 rounded-lg text-xs border border-slate-200 hover:border-teal-400 hover:bg-teal-50 text-slate-600 transition-colors">
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Message *</label>
                <textarea value={form.message} onChange={(e) => update('message', e.target.value)} required rows={3} placeholder="Write your reminder message here..." className={`${inputCls} resize-none`} style={s} />
              </div>

              {/* Send channels */}
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input type="checkbox" checked={form.send_whatsapp} onChange={(e) => update('send_whatsapp', e.target.checked)} className="rounded" />
                  Send via WhatsApp
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input type="checkbox" checked={form.send_sms} onChange={(e) => update('send_sms', e.target.checked)} className="rounded" />
                  Send via SMS
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-white text-sm font-semibold disabled:opacity-60" style={{ background: 'linear-gradient(135deg, #0d9488, #0891b2)' }}>
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {loading ? 'Saving...' : 'Schedule Reminder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
