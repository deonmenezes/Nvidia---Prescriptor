export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import { formatDateTime, getStatusColor, getInitials } from '@/lib/utils'
import MessageComposer from './MessageComposer'
import { MessageSquare } from 'lucide-react'

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ patient?: string }>
}) {
  const { patient: patientId } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: messages }, { data: patients }] = await Promise.all([
    supabase
      .from('messages')
      .select('*, patients(full_name, phone)')
      .eq('doctor_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(50),
    supabase.from('patients').select('id, full_name, phone').eq('doctor_id', user!.id).eq('status', 'active'),
  ])

  const stats = {
    total: messages?.length ?? 0,
    sent: messages?.filter((m) => m.status === 'sent' || m.status === 'delivered').length ?? 0,
    failed: messages?.filter((m) => m.status === 'failed').length ?? 0,
  }

  return (
    <div className="animate-fade-in">
      <Header title="Messages" subtitle="Send WhatsApp messages to patients via OpenClaw" />
      <main className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Sent', value: stats.total, color: 'text-slate-700', bg: 'bg-white', border: 'border-slate-200' },
            { label: 'Delivered', value: stats.sent, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
            { label: 'Failed', value: stats.failed, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
          ].map((s) => (
            <div key={s.label} className={`${s.bg} border ${s.border} rounded-xl p-4`}>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-sm text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Composer */}
        <MessageComposer patients={patients ?? []} defaultPatientId={patientId} />

        {/* History */}
        <div>
          <h2 className="font-semibold text-slate-900 mb-3">Message History</h2>
          {(!messages || messages.length === 0) ? (
            <div className="flex flex-col items-center justify-center bg-white rounded-xl border border-slate-200 py-16">
              <MessageSquare className="h-12 w-12 text-slate-300 mb-3" />
              <p className="text-slate-600 font-medium mb-1">No messages sent yet</p>
              <p className="text-sm text-slate-400">Use the composer above to send your first message</p>
            </div>
          ) : (
            <div className="space-y-2">
              {messages.map((m) => {
                const p = m.patients as { full_name: string; phone: string } | null
                return (
                  <div key={m.id} className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex items-start gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full text-white text-xs font-bold shrink-0" style={{ background: 'linear-gradient(135deg, #0d9488, #0891b2)' }}>
                      {getInitials(p?.full_name ?? '?')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-slate-900">{p?.full_name}</p>
                        <span className="text-xs text-slate-400">{p?.phone}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ml-auto ${getStatusColor(m.status)}`}>{m.status}</span>
                      </div>
                      <p className="text-sm text-slate-600 line-clamp-2">{m.content}</p>
                      <p className="text-xs text-slate-400 mt-1">{formatDateTime(m.created_at)} · WhatsApp</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
