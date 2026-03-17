export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import { Clock, CheckCircle, XCircle, Activity, Zap } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import TriggerCronButton from './TriggerCronButton'

export default async function CronPage() {
  const supabase = await createClient()

  const { data: logs } = await supabase
    .from('cron_logs')
    .select('*')
    .order('ran_at', { ascending: false })
    .limit(20)

  const { data: pendingReminders } = await supabase
    .from('reminders')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pending')

  const totalSent = logs?.reduce((sum, l) => sum + (l.sent ?? 0), 0) ?? 0
  const totalFailed = logs?.reduce((sum, l) => sum + (l.failed ?? 0), 0) ?? 0
  const lastRun = logs?.[0]?.ran_at

  return (
    <div className="animate-fade-up">
      <Header title="Cron Jobs" subtitle="Automated reminder scheduling" />
      <main className="p-6 space-y-6 max-w-4xl">

        {/* Status banner */}
        <div
          className="flex items-center gap-3 px-5 py-4 rounded-2xl"
          style={{ background: 'linear-gradient(135deg, #0d9488, #0891b2)', color: '#fff' }}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: 'rgba(255,255,255,0.15)' }}>
            <Activity size={18} />
          </div>
          <div className="flex-1">
            <p className="font-bold text-[14px]">Auto-send cron is active</p>
            <p className="text-[12px] opacity-80">Runs every minute · checks for due reminders and sends via WhatsApp</p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
            <span className="text-[12px] font-semibold opacity-90">Live</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Runs', value: logs?.length ?? 0, icon: Clock, color: '#6366f1', bg: 'rgba(99,102,241,.08)' },
            { label: 'Sent', value: totalSent, icon: CheckCircle, color: '#10b981', bg: 'rgba(16,185,129,.08)' },
            { label: 'Failed', value: totalFailed, icon: XCircle, color: '#ef4444', bg: 'rgba(239,68,68,.08)' },
            { label: 'Pending Now', value: (pendingReminders as unknown as { count: number })?.count ?? 0, icon: Zap, color: '#f59e0b', bg: 'rgba(245,158,11,.08)' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl mb-3" style={{ background: s.bg }}>
                <s.icon size={16} style={{ color: s.color }} />
              </div>
              <p className="text-[26px] font-bold text-slate-900">{s.value}</p>
              <p className="text-[12px] text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Schedule info + manual trigger */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="font-semibold text-slate-900 mb-1">Schedule Configuration</p>
              <div className="flex items-center gap-3 text-[13px] text-slate-600">
                <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-teal-700">* * * * *</span>
                <span>Every minute</span>
                {lastRun && <span className="text-slate-400">Last ran: {formatDateTime(lastRun)}</span>}
              </div>
            </div>
            <TriggerCronButton />
          </div>
        </div>

        {/* Run history */}
        <div>
          <h2 className="font-semibold text-slate-900 mb-3">Run History</h2>
          {(!logs || logs.length === 0) ? (
            <div className="flex flex-col items-center justify-center bg-white rounded-xl border border-slate-200 py-12">
              <Clock className="h-10 w-10 text-slate-300 mb-2" />
              <p className="text-sm text-slate-400">No runs yet — cron will fire within the next minute</p>
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => (
                <div key={log.id} className="bg-white rounded-xl border border-slate-200 px-5 py-3.5 flex items-center gap-4">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: log.sent > 0 ? 'rgba(16,185,129,.1)' : log.failed > 0 ? 'rgba(239,68,68,.1)' : 'rgba(100,116,139,.08)' }}
                  >
                    {log.sent > 0
                      ? <CheckCircle size={15} className="text-emerald-500" />
                      : log.failed > 0
                        ? <XCircle size={15} className="text-red-500" />
                        : <Clock size={15} className="text-slate-400" />
                    }
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] font-medium text-slate-900">
                      {log.total === 0
                        ? 'No reminders due'
                        : `${log.sent} sent · ${log.failed} failed · ${log.total} total`}
                    </p>
                    <p className="text-[11.5px] text-slate-400">{formatDateTime(log.ran_at)}</p>
                  </div>
                  <span
                    className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                    style={
                      log.failed > 0
                        ? { background: '#fef2f2', color: '#dc2626' }
                        : log.sent > 0
                          ? { background: '#f0fdf4', color: '#16a34a' }
                          : { background: '#f8fafc', color: '#94a3b8' }
                    }
                  >
                    {log.failed > 0 ? 'partial' : log.sent > 0 ? 'success' : 'idle'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
