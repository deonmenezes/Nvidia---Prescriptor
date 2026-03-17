'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Send, Loader2, CheckCircle, XCircle } from 'lucide-react'
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

const QUICK_MESSAGES = [
  { label: '💊 Medicine reminder', text: 'Hi, this is a reminder from Dr. to take your prescribed medication as scheduled. Please do not skip your dose.' },
  { label: '📅 Appointment confirm', text: 'Hi, this is a reminder about your upcoming appointment. Please confirm by replying YES or contact us to reschedule.' },
  { label: '🩺 Check-up due', text: 'Hi, your regular check-up is due. Please contact us to schedule a convenient time for your visit.' },
  { label: '✅ Test results ready', text: 'Hi, your test results are ready. Please contact us at your earliest convenience to discuss the results with the doctor.' },
  { label: '🚨 Urgent follow-up', text: 'Hi, the doctor needs to see you urgently for a follow-up. Please contact us immediately or visit the clinic as soon as possible.' },
  { label: '💙 Wellness check', text: 'Hi, we are checking in on your health progress. How are you feeling? Please reply or call us if you need any assistance.' },
]

export default function MessageComposer({ patients, defaultPatientId }: Props) {
  const [selectedPatients, setSelectedPatients] = useState<string[]>(defaultPatientId ? [defaultPatientId] : [])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const router = useRouter()
  const supabase = createClient()

  function togglePatient(id: string) {
    setSelectedPatients((prev) => prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id])
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!message.trim() || selectedPatients.length === 0) return
    setLoading(true)
    setResult(null)

    const { data: { user } } = await supabase.auth.getUser()

    try {
      // Call our API route that handles OpenClaw + DB insert
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_ids: selectedPatients,
          message: message.trim(),
          doctor_id: user!.id,
        }),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error ?? 'Failed to send')

      setResult({ type: 'success', text: `Message sent to ${selectedPatients.length} patient${selectedPatients.length > 1 ? 's' : ''} successfully!` })
      setMessage('')
      setSelectedPatients([])
      router.refresh()
    } catch (err) {
      setResult({ type: 'error', text: err instanceof Error ? err.message : 'Failed to send message' })
    } finally {
      setLoading(false)
    }
  }

  const inputCls = "w-full px-3 py-2.5 rounded-lg border border-slate-200 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 bg-white"
  const s = { '--tw-ring-color': '#0d9488' } as React.CSSProperties

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-100">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
          <Send className="h-4 w-4 text-emerald-600" />
        </div>
        <div>
          <h2 className="font-semibold text-slate-900">Compose WhatsApp Message</h2>
          <p className="text-xs text-slate-400">Sent via OpenClaw on your local machine</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500 pulse-dot" />
          <span className="text-xs text-emerald-600 font-medium">OpenClaw Connected</span>
        </div>
      </div>

      <form onSubmit={handleSend} className="space-y-4">
        {result && (
          <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${result.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {result.type === 'success' ? <CheckCircle size={15} /> : <XCircle size={15} />}
            {result.text}
          </div>
        )}

        {/* Patient multi-select */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Recipients ({selectedPatients.length} selected)
          </label>
          <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100">
            {patients.length === 0 && (
              <p className="px-3 py-3 text-sm text-slate-400">No active patients</p>
            )}
            {patients.map((p) => (
              <label key={p.id} className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedPatients.includes(p.id)}
                  onChange={() => togglePatient(p.id)}
                  className="rounded"
                />
                <span className="text-sm text-slate-800 font-medium">{p.full_name}</span>
                <span className="text-xs text-slate-400 ml-auto">{p.phone}</span>
              </label>
            ))}
          </div>
          {patients.length > 0 && (
            <button type="button" onClick={() => setSelectedPatients(selectedPatients.length === patients.length ? [] : patients.map(p => p.id))} className="text-xs text-teal-600 hover:underline mt-1">
              {selectedPatients.length === patients.length ? 'Deselect all' : 'Select all'}
            </button>
          )}
        </div>

        {/* Quick templates */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Quick Templates</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {QUICK_MESSAGES.map((q) => (
              <button key={q.label} type="button" onClick={() => setMessage(q.text)} className="text-left px-3 py-2 rounded-lg text-xs border border-slate-200 hover:border-teal-400 hover:bg-teal-50 text-slate-600 transition-colors leading-snug">
                {q.label}
              </button>
            ))}
          </div>
        </div>

        {/* Message input */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium text-slate-700">Message</label>
            <span className="text-xs text-slate-400">{message.length} chars</span>
          </div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={4}
            placeholder="Type your WhatsApp message here..."
            className={`${inputCls} resize-none`}
            style={s}
          />
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => { setMessage(''); setSelectedPatients([]) }}
            className="px-4 py-2.5 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50"
          >
            Clear
          </button>
          <button
            type="submit"
            disabled={loading || !message.trim() || selectedPatients.length === 0}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, #0d9488, #0891b2)' }}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send size={15} />}
            {loading ? 'Sending...' : `Send to ${selectedPatients.length || '...'} Patient${selectedPatients.length !== 1 ? 's' : ''}`}
          </button>
        </div>
      </form>
    </div>
  )
}
