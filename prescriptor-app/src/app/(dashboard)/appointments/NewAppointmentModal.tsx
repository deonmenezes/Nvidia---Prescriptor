'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, X, Loader2, Calendar } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Patient { id: string; full_name: string; phone: string }
interface Props { patients: Patient[]; defaultPatientId?: string }

export default function NewAppointmentModal({ patients, defaultPatientId }: Props) {
  const [open, setOpen] = useState(!!defaultPatientId)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    patient_id: defaultPatientId ?? '',
    title: '', description: '',
    appointment_type: 'checkup',
    scheduled_at: '',
    duration_minutes: 30,
    notes: '',
  })
  const router = useRouter()
  const supabase = createClient()

  function update(k: keyof typeof form, v: string | number) {
    setForm((p) => ({ ...p, [k]: v }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { data: { user } } = await supabase.auth.getUser()
    const { error: err } = await supabase.from('appointments').insert({ ...form, doctor_id: user!.id, status: 'scheduled' })
    if (err) { setError(err.message); setLoading(false); return }
    setOpen(false)
    router.refresh()
  }

  const cls = "w-full px-3 py-2.5 rounded-lg border border-slate-200 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 bg-white"
  const s = { '--tw-ring-color': '#0d9488' } as React.CSSProperties

  return (
    <>
      <button onClick={() => setOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ background: 'linear-gradient(135deg, #0d9488, #0891b2)' }}>
        <Plus size={16} /> Schedule Appointment
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                <h2 className="font-bold text-slate-900">Schedule Appointment</h2>
              </div>
              <button onClick={() => setOpen(false)}><X size={18} className="text-slate-400" /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Patient *</label>
                <select value={form.patient_id} onChange={(e) => update('patient_id', e.target.value)} required className={cls} style={s}>
                  <option value="">Select patient...</option>
                  {patients.map((p) => <option key={p.id} value={p.id}>{p.full_name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Title *</label>
                <input value={form.title} onChange={(e) => update('title', e.target.value)} required placeholder="e.g. Follow-up consultation" className={cls} style={s} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Type</label>
                  <select value={form.appointment_type} onChange={(e) => update('appointment_type', e.target.value)} className={cls} style={s}>
                    <option value="checkup">Check-up</option>
                    <option value="followup">Follow-up</option>
                    <option value="emergency">Emergency</option>
                    <option value="diagnosis">Diagnosis</option>
                    <option value="procedure">Procedure</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Duration (min)</label>
                  <select value={form.duration_minutes} onChange={(e) => update('duration_minutes', Number(e.target.value))} className={cls} style={s}>
                    {[15, 30, 45, 60, 90, 120].map((d) => <option key={d} value={d}>{d} min</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Date & Time *</label>
                <input type="datetime-local" value={form.scheduled_at} onChange={(e) => update('scheduled_at', e.target.value)} required className={cls} style={s} />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                <textarea value={form.description} onChange={(e) => update('description', e.target.value)} rows={2} className={`${cls} resize-none`} style={s} />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium">Cancel</button>
                <button type="submit" disabled={loading} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-white text-sm font-semibold disabled:opacity-60" style={{ background: 'linear-gradient(135deg, #0d9488, #0891b2)' }}>
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {loading ? 'Saving...' : 'Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
