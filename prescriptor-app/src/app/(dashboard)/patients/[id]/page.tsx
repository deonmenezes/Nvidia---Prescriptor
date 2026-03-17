export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import { notFound } from 'next/navigation'
import { formatDate, formatDateTime, formatRelative, getStatusColor } from '@/lib/utils'
import { Phone, Mail, Calendar, Pill, MessageSquare, Bell, FileText, ArrowLeft, Edit } from 'lucide-react'
import Link from 'next/link'

export default async function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: patient }, { data: reminders }, { data: messages }, { data: reports }, { data: appointments }] = await Promise.all([
    supabase.from('patients').select('*').eq('id', id).eq('doctor_id', user!.id).single(),
    supabase.from('reminders').select('*').eq('patient_id', id).order('scheduled_at', { ascending: false }).limit(5),
    supabase.from('messages').select('*').eq('patient_id', id).order('created_at', { ascending: false }).limit(5),
    supabase.from('reports').select('*').eq('patient_id', id).order('created_at', { ascending: false }).limit(5),
    supabase.from('appointments').select('*').eq('patient_id', id).order('scheduled_at', { ascending: false }).limit(5),
  ])

  if (!patient) notFound()

  return (
    <div className="animate-fade-in">
      <Header title={patient.full_name} subtitle="Patient profile" />
      <main className="p-6 space-y-6 max-w-5xl">
        <Link href="/patients" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
          <ArrowLeft size={15} /> Back to patients
        </Link>

        {/* Patient header card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full text-white text-xl font-bold" style={{ background: 'linear-gradient(135deg, #0d9488, #0891b2)' }}>
                {patient.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{patient.full_name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getStatusColor(patient.status)}`}>{patient.status}</span>
                  {patient.blood_type && <span className="text-xs px-2 py-0.5 bg-red-50 text-red-600 rounded-full font-medium">Blood: {patient.blood_type}</span>}
                </div>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Link href={`/messages?patient=${patient.id}`} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-medium hover:bg-emerald-100">
                <MessageSquare size={14} /> Message
              </Link>
              <Link href={`/reminders?patient=${patient.id}`} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-50 text-amber-700 text-sm font-medium hover:bg-amber-100">
                <Bell size={14} /> Reminder
              </Link>
              <Link href={`/patients/${patient.id}/edit`} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200">
                <Edit size={14} /> Edit
              </Link>
            </div>
          </div>

          {/* Contact info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Phone size={15} className="text-slate-400 shrink-0" />
              <span>{patient.phone}</span>
            </div>
            {patient.email && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Mail size={15} className="text-slate-400 shrink-0" />
                <span className="truncate">{patient.email}</span>
              </div>
            )}
            {patient.date_of_birth && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Calendar size={15} className="text-slate-400 shrink-0" />
                <span>DOB: {formatDate(patient.date_of_birth)}</span>
              </div>
            )}
            {patient.gender && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span className="text-slate-400 text-xs">Gender:</span>
                <span className="capitalize">{patient.gender}</span>
              </div>
            )}
          </div>

          {/* Conditions & allergies */}
          {((patient.conditions && (patient.conditions as string[]).length > 0) || (patient.allergies && (patient.allergies as string[]).length > 0)) && (
            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100">
              {patient.conditions && (patient.conditions as string[]).length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Conditions</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(patient.conditions as string[]).map((c: string) => (
                      <span key={c} className="text-xs px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full">{c}</span>
                    ))}
                  </div>
                </div>
              )}
              {patient.allergies && (patient.allergies as string[]).length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Allergies</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(patient.allergies as string[]).map((a: string) => (
                      <span key={a} className="text-xs px-2.5 py-1 bg-red-50 text-red-600 rounded-full">{a}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {patient.notes && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Notes</p>
              <p className="text-sm text-slate-600">{patient.notes}</p>
            </div>
          )}
        </div>

        {/* Activity grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Reminders */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Bell size={16} className="text-amber-500" />
                <h3 className="font-semibold text-slate-900">Reminders</h3>
              </div>
              <Link href={`/reminders/new?patient=${patient.id}`} className="text-xs font-medium px-2.5 py-1 rounded-lg text-teal-700 bg-teal-50 hover:bg-teal-100">+ Add</Link>
            </div>
            <div className="divide-y divide-slate-50">
              {(!reminders || reminders.length === 0) && (
                <p className="px-5 py-6 text-center text-sm text-slate-400">No reminders scheduled</p>
              )}
              {(reminders ?? []).map((r) => (
                <div key={r.id} className="px-5 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{r.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{formatRelative(r.scheduled_at)}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${getStatusColor(r.status)}`}>{r.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <MessageSquare size={16} className="text-emerald-500" />
                <h3 className="font-semibold text-slate-900">Messages</h3>
              </div>
              <Link href={`/messages?patient=${patient.id}`} className="text-xs font-medium px-2.5 py-1 rounded-lg text-teal-700 bg-teal-50 hover:bg-teal-100">+ Send</Link>
            </div>
            <div className="divide-y divide-slate-50">
              {(!messages || messages.length === 0) && (
                <p className="px-5 py-6 text-center text-sm text-slate-400">No messages sent yet</p>
              )}
              {(messages ?? []).map((m) => (
                <div key={m.id} className="px-5 py-3">
                  <p className="text-sm text-slate-700 line-clamp-2">{m.content}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-400">{formatDateTime(m.created_at)}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${getStatusColor(m.status)}`}>{m.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reports */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-blue-500" />
                <h3 className="font-semibold text-slate-900">Reports</h3>
              </div>
              <Link href={`/reports/new?patient=${patient.id}`} className="text-xs font-medium px-2.5 py-1 rounded-lg text-teal-700 bg-teal-50 hover:bg-teal-100">+ Upload</Link>
            </div>
            <div className="divide-y divide-slate-50">
              {(!reports || reports.length === 0) && (
                <p className="px-5 py-6 text-center text-sm text-slate-400">No reports uploaded</p>
              )}
              {(reports ?? []).map((r) => (
                <div key={r.id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{r.title}</p>
                    <p className="text-xs text-slate-400">{r.report_type} · {formatDate(r.created_at)}</p>
                  </div>
                  {r.file_url && (
                    <a href={r.file_url} target="_blank" rel="noreferrer" className="text-xs text-teal-600 hover:underline">View</a>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Appointments */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Pill size={16} className="text-purple-500" />
                <h3 className="font-semibold text-slate-900">Appointments</h3>
              </div>
              <Link href={`/appointments/new?patient=${patient.id}`} className="text-xs font-medium px-2.5 py-1 rounded-lg text-teal-700 bg-teal-50 hover:bg-teal-100">+ Schedule</Link>
            </div>
            <div className="divide-y divide-slate-50">
              {(!appointments || appointments.length === 0) && (
                <p className="px-5 py-6 text-center text-sm text-slate-400">No appointments scheduled</p>
              )}
              {(appointments ?? []).map((a) => (
                <div key={a.id} className="px-5 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{a.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{formatRelative(a.scheduled_at)} · {a.duration_minutes}min</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${getStatusColor(a.status)}`}>{a.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
