'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Upload, X, Loader2, FileText } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Patient { id: string; full_name: string }
interface Props { patients: Patient[] }

export default function UploadReportModal({ patients }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    patient_id: '', title: '', description: '',
    report_type: 'general', analysis: '', file_url: '',
  })
  const router = useRouter()
  const supabase = createClient()

  function update(k: keyof typeof form, v: string) {
    setForm((p) => ({ ...p, [k]: v }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    const { error: err } = await supabase.from('reports').insert({ ...form, doctor_id: user!.id })

    if (err) { setError(err.message); setLoading(false); return }

    setOpen(false)
    setForm({ patient_id: '', title: '', description: '', report_type: 'general', analysis: '', file_url: '' })
    router.refresh()
  }

  const cls = "w-full px-3 py-2.5 rounded-lg border border-slate-200 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 bg-white"
  const s = { '--tw-ring-color': '#0d9488' } as React.CSSProperties

  return (
    <>
      <button onClick={() => setOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ background: 'linear-gradient(135deg, #0d9488, #0891b2)' }}>
        <Upload size={16} /> Upload Report
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-500" />
                <h2 className="font-bold text-slate-900">Upload Report</h2>
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
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Report Title *</label>
                <input value={form.title} onChange={(e) => update('title', e.target.value)} required placeholder="e.g. Blood Work Results — March 2025" className={cls} style={s} />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Report Type</label>
                <select value={form.report_type} onChange={(e) => update('report_type', e.target.value)} className={cls} style={s}>
                  <option value="general">General</option>
                  <option value="lab">Lab Results</option>
                  <option value="xray">X-Ray</option>
                  <option value="mri">MRI/CT Scan</option>
                  <option value="prescription">Prescription</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                <textarea value={form.description} onChange={(e) => update('description', e.target.value)} rows={2} placeholder="Brief description of the report..." className={`${cls} resize-none`} style={s} />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Doctor&apos;s Analysis / Notes</label>
                <textarea value={form.analysis} onChange={(e) => update('analysis', e.target.value)} rows={3} placeholder="Your analysis and notes on this report..." className={`${cls} resize-none`} style={s} />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">File URL (optional)</label>
                <input value={form.file_url} onChange={(e) => update('file_url', e.target.value)} placeholder="https://... or leave blank" className={cls} style={s} />
                <p className="text-xs text-slate-400 mt-1">Paste a link to the uploaded report file (Google Drive, OneDrive, etc.)</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium">Cancel</button>
                <button type="submit" disabled={loading} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-white text-sm font-semibold disabled:opacity-60" style={{ background: 'linear-gradient(135deg, #0d9488, #0891b2)' }}>
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {loading ? 'Saving...' : 'Save Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
