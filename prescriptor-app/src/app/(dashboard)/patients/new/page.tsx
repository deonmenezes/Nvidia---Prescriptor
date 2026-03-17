'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Header from '@/components/layout/Header'
import { ArrowLeft, Loader2, Plus, X } from 'lucide-react'
import Link from 'next/link'

export default function NewPatientPage() {
  const [form, setForm] = useState({
    full_name: '', phone: '', email: '',
    date_of_birth: '', gender: '', blood_type: '',
    status: 'active', notes: '',
  })
  const [conditions, setConditions] = useState<string[]>([])
  const [allergies, setAllergies] = useState<string[]>([])
  const [condInput, setCondInput] = useState('')
  const [allerInput, setAllerInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  function update(k: keyof typeof form, v: string) {
    setForm((p) => ({ ...p, [k]: v }))
  }

  function addTag(list: string[], set: (v: string[]) => void, val: string) {
    const trimmed = val.trim()
    if (trimmed && !list.includes(trimmed)) set([...list, trimmed])
  }

  function removeTag(list: string[], set: (v: string[]) => void, val: string) {
    set(list.filter((t) => t !== val))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()

    const { error: err } = await supabase.from('patients').insert({
      ...form,
      doctor_id: user!.id,
      conditions,
      allergies,
      date_of_birth: form.date_of_birth || null,
    })

    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    router.push('/patients')
  }

  const inputCls = "w-full px-4 py-2.5 rounded-lg border border-slate-200 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent bg-white"
  const style = { '--tw-ring-color': '#0d9488' } as React.CSSProperties

  return (
    <div className="animate-fade-in">
      <Header title="Add New Patient" subtitle="Create a new patient record" />
      <main className="p-6 max-w-2xl">
        <Link href="/patients" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6">
          <ArrowLeft size={15} /> Back to patients
        </Link>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name *</label>
                <input value={form.full_name} onChange={(e) => update('full_name', e.target.value)} required placeholder="Jane Doe" className={inputCls} style={style} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone *</label>
                <input value={form.phone} onChange={(e) => update('phone', e.target.value)} required placeholder="+27 83 123 4567" className={inputCls} style={style} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="patient@email.com" className={inputCls} style={style} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Date of Birth</label>
                <input type="date" value={form.date_of_birth} onChange={(e) => update('date_of_birth', e.target.value)} className={inputCls} style={style} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Gender</label>
                <select value={form.gender} onChange={(e) => update('gender', e.target.value)} className={inputCls} style={style}>
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Blood Type</label>
                <select value={form.blood_type} onChange={(e) => update('blood_type', e.target.value)} className={inputCls} style={style}>
                  <option value="">Unknown</option>
                  {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
                <select value={form.status} onChange={(e) => update('status', e.target.value)} className={inputCls} style={style}>
                  <option value="active">Active</option>
                  <option value="critical">Critical</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Conditions */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Medical Conditions</label>
              <div className="flex gap-2 mb-2">
                <input value={condInput} onChange={(e) => setCondInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(conditions, setConditions, condInput); setCondInput('') } }} placeholder="e.g. Diabetes" className={`${inputCls} flex-1`} style={style} />
                <button type="button" onClick={() => { addTag(conditions, setConditions, condInput); setCondInput('') }} className="px-3 py-2 rounded-lg text-teal-700 bg-teal-50 hover:bg-teal-100 text-sm font-medium"><Plus size={16} /></button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {conditions.map((c) => (
                  <span key={c} className="flex items-center gap-1 text-xs px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full">
                    {c} <button type="button" onClick={() => removeTag(conditions, setConditions, c)}><X size={11} /></button>
                  </span>
                ))}
              </div>
            </div>

            {/* Allergies */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Allergies</label>
              <div className="flex gap-2 mb-2">
                <input value={allerInput} onChange={(e) => setAllerInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(allergies, setAllergies, allerInput); setAllerInput('') } }} placeholder="e.g. Penicillin" className={`${inputCls} flex-1`} style={style} />
                <button type="button" onClick={() => { addTag(allergies, setAllergies, allerInput); setAllerInput('') }} className="px-3 py-2 rounded-lg text-teal-700 bg-teal-50 hover:bg-teal-100 text-sm font-medium"><Plus size={16} /></button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {allergies.map((a) => (
                  <span key={a} className="flex items-center gap-1 text-xs px-2.5 py-1 bg-red-50 text-red-600 rounded-full">
                    {a} <button type="button" onClick={() => removeTag(allergies, setAllergies, a)}><X size={11} /></button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes</label>
              <textarea value={form.notes} onChange={(e) => update('notes', e.target.value)} rows={3} placeholder="Additional notes about the patient..." className={`${inputCls} resize-none`} style={style} />
            </div>

            <div className="flex gap-3 pt-2">
              <Link href="/patients" className="flex-1 py-2.5 text-center rounded-lg border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50">
                Cancel
              </Link>
              <button type="submit" disabled={loading} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-white text-sm font-semibold disabled:opacity-60" style={{ background: 'linear-gradient(135deg, #0d9488, #0891b2)' }}>
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? 'Saving...' : 'Add Patient'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
