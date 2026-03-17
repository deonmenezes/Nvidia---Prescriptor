export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import Link from 'next/link'
import { Plus, Bell, Calendar } from 'lucide-react'
import { formatRelative, getStatusColor, getReminderTypeIcon } from '@/lib/utils'
import NewReminderModal from './NewReminderModal'

export default async function RemindersPage({
  searchParams,
}: {
  searchParams: Promise<{ patient?: string }>
}) {
  const { patient: patientId } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: reminders }, { data: patients }] = await Promise.all([
    supabase
      .from('reminders')
      .select('*, patients(full_name, phone)')
      .eq('doctor_id', user!.id)
      .order('scheduled_at'),
    supabase.from('patients').select('id, full_name, phone').eq('doctor_id', user!.id).eq('status', 'active'),
  ])

  const pending = reminders?.filter((r) => r.status === 'pending') ?? []
  const sent = reminders?.filter((r) => r.status === 'sent') ?? []

  return (
    <div className="animate-fade-in">
      <Header title="Reminders" subtitle="Schedule and manage patient reminders" />
      <main className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Pending', value: pending.length, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
            { label: 'Sent', value: sent.length, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
            { label: 'Total', value: reminders?.length ?? 0, color: 'text-slate-700', bg: 'bg-white', border: 'border-slate-200' },
          ].map((s) => (
            <div key={s.label} className={`${s.bg} border ${s.border} rounded-xl p-4`}>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-sm text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">All Reminders</h2>
          <NewReminderModal patients={patients ?? []} defaultPatientId={patientId} />
        </div>

        {/* Reminders list */}
        {(!reminders || reminders.length === 0) ? (
          <div className="flex flex-col items-center justify-center bg-white rounded-xl border border-slate-200 py-16">
            <Bell className="h-12 w-12 text-slate-300 mb-3" />
            <p className="text-slate-600 font-medium mb-1">No reminders yet</p>
            <p className="text-sm text-slate-400">Create a reminder to notify patients via WhatsApp</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reminders.map((r) => {
              const p = r.patients as { full_name: string; phone: string } | null
              return (
                <div key={r.id} className="bg-white rounded-xl border border-slate-200 p-4 flex items-start gap-4 hover:border-slate-300 transition-all">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 text-xl shrink-0">
                    {getReminderTypeIcon(r.reminder_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-slate-900">{r.title}</p>
                        <p className="text-sm text-slate-500 mt-0.5">{p?.full_name} · {p?.phone}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${getStatusColor(r.status)}`}>{r.status}</span>
                    </div>
                    <p className="text-sm text-slate-600 mt-1 line-clamp-1">{r.message}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><Calendar size={11} /> {formatRelative(r.scheduled_at)}</span>
                      <span className="capitalize">{r.frequency}</span>
                      {r.send_whatsapp && <span className="text-emerald-600 font-medium">WhatsApp</span>}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
