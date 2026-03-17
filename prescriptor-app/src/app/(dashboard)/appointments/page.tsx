export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import { formatDate, formatDateTime, getStatusColor, getInitials } from '@/lib/utils'
import { Calendar } from 'lucide-react'
import NewAppointmentModal from './NewAppointmentModal'

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ patient?: string }>
}) {
  const { patient: defaultPatientId } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: appointments }, { data: patients }] = await Promise.all([
    supabase
      .from('appointments')
      .select('*, patients(full_name, phone)')
      .eq('doctor_id', user!.id)
      .order('scheduled_at'),
    supabase.from('patients').select('id, full_name, phone').eq('doctor_id', user!.id),
  ])

  const today = new Date().toISOString()
  const upcoming = appointments?.filter((a) => a.scheduled_at >= today && a.status === 'scheduled') ?? []
  const past = appointments?.filter((a) => a.scheduled_at < today || a.status !== 'scheduled') ?? []

  const typeIcon: Record<string, string> = {
    checkup: '🩺', followup: '📋', emergency: '🚨', diagnosis: '🔬', procedure: '⚕️',
  }

  return (
    <div className="animate-fade-in">
      <Header title="Appointments" subtitle="Manage patient appointments and schedules" />
      <main className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex gap-4 text-sm">
            <span className="font-semibold text-slate-900">{upcoming.length} upcoming</span>
            <span className="text-slate-400">{past.length} past</span>
          </div>
          <NewAppointmentModal patients={patients ?? []} defaultPatientId={defaultPatientId} />
        </div>

        {/* Upcoming */}
        <div>
          <h2 className="font-semibold text-slate-900 mb-3">Upcoming</h2>
          {upcoming.length === 0 ? (
            <div className="flex flex-col items-center justify-center bg-white rounded-xl border border-slate-200 py-10">
              <Calendar className="h-10 w-10 text-slate-300 mb-2" />
              <p className="text-sm text-slate-400">No upcoming appointments</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.map((a) => {
                const p = a.patients as { full_name: string; phone: string } | null
                return (
                  <div key={a.id} className="bg-white rounded-xl border border-slate-200 p-4 flex items-start gap-4 hover:shadow-md transition-all">
                    <div className="text-2xl shrink-0">{typeIcon[a.appointment_type] ?? '📅'}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-slate-900">{a.title}</p>
                          {p && (
                            <div className="flex items-center gap-2 mt-0.5">
                              <div className="flex h-5 w-5 items-center justify-center rounded-full text-white text-xs font-bold" style={{ background: 'linear-gradient(135deg, #0d9488, #0891b2)', fontSize: '9px' }}>
                                {getInitials(p.full_name)}
                              </div>
                              <span className="text-sm text-slate-600">{p.full_name}</span>
                            </div>
                          )}
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${getStatusColor(a.status)}`}>{a.status}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                        <span>📅 {formatDateTime(a.scheduled_at)}</span>
                        <span>⏱ {a.duration_minutes} min</span>
                        <span className="capitalize">{a.appointment_type}</span>
                      </div>
                      {a.description && <p className="text-sm text-slate-500 mt-1.5 line-clamp-1">{a.description}</p>}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Past */}
        {past.length > 0 && (
          <div>
            <h2 className="font-semibold text-slate-500 mb-3 text-sm uppercase tracking-wide">Past Appointments</h2>
            <div className="space-y-2">
              {past.slice(0, 10).map((a) => {
                const p = a.patients as { full_name: string } | null
                return (
                  <div key={a.id} className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex items-center gap-3 opacity-70">
                    <span className="text-lg">{typeIcon[a.appointment_type] ?? '📅'}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-700">{a.title}</p>
                      <p className="text-xs text-slate-400">{p?.full_name} · {formatDate(a.scheduled_at)}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(a.status)}`}>{a.status}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
