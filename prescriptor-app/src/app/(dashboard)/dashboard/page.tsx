export const dynamic = 'force-dynamic'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import { formatDate, formatRelative, getStatusColor, getInitials } from '@/lib/utils'
import { Users, Bell, MessageSquare, Calendar, AlertTriangle, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const today = new Date()
  const todayStart = new Date(today.setHours(0, 0, 0, 0)).toISOString()
  const todayEnd   = new Date(today.setHours(23, 59, 59, 999)).toISOString()

  const [
    { count: totalPatients },
    { count: criticalPatients },
    { count: pendingReminders },
    { count: todayAppts },
    { count: msgToday },
    { data: recentPatients },
    { data: upcomingReminders },
    { data: upcomingAppts },
  ] = await Promise.all([
    supabase.from('patients').select('*', { count: 'exact', head: true }).eq('doctor_id', user!.id),
    supabase.from('patients').select('*', { count: 'exact', head: true }).eq('doctor_id', user!.id).eq('status', 'critical'),
    supabase.from('reminders').select('*', { count: 'exact', head: true }).eq('doctor_id', user!.id).eq('status', 'pending'),
    supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('doctor_id', user!.id).gte('scheduled_at', todayStart).lte('scheduled_at', todayEnd),
    supabase.from('messages').select('*', { count: 'exact', head: true }).eq('doctor_id', user!.id).gte('created_at', todayStart),
    supabase.from('patients').select('*').eq('doctor_id', user!.id).order('created_at', { ascending: false }).limit(6),
    supabase.from('reminders').select('*, patients(full_name,phone)').eq('doctor_id', user!.id).eq('status', 'pending').order('scheduled_at').limit(5),
    supabase.from('appointments').select('*, patients(full_name)').eq('doctor_id', user!.id).eq('status', 'scheduled').gte('scheduled_at', new Date().toISOString()).order('scheduled_at').limit(4),
  ])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  const stats = [
    {
      label: 'Total Patients', value: totalPatients ?? 0,
      icon: Users, accent: 'stat-teal',
      iconBg: 'rgba(13,148,136,.1)', iconColor: '#0d9488',
      href: '/patients',
    },
    {
      label: "Today's Appointments", value: todayAppts ?? 0,
      icon: Calendar, accent: 'stat-blue',
      iconBg: 'rgba(59,130,246,.1)', iconColor: '#3b82f6',
      href: '/appointments',
    },
    {
      label: 'Pending Reminders', value: pendingReminders ?? 0,
      icon: Bell, accent: 'stat-amber',
      iconBg: 'rgba(245,158,11,.1)', iconColor: '#f59e0b',
      href: '/reminders',
    },
    {
      label: 'Messages Sent Today', value: msgToday ?? 0,
      icon: MessageSquare, accent: 'stat-purple',
      iconBg: 'rgba(139,92,246,.1)', iconColor: '#8b5cf6',
      href: '/messages',
    },
  ]

  return (
    <div className="animate-fade-up">
      <Header
        title="Dashboard"
        subtitle={`${greeting} · ${formatDate(new Date())}`}
      />

      <main className="p-6 space-y-6">
        {/* Critical alert */}
        {(criticalPatients ?? 0) > 0 && (
          <div
            className="flex items-center gap-3 px-5 py-4 rounded-2xl"
            style={{ background: '#fff1f2', border: '1px solid #fecdd3' }}
          >
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
              style={{ background: '#fee2e2' }}
            >
              <AlertTriangle size={15} style={{ color: '#dc2626' }} />
            </div>
            <div className="flex-1">
              <p className="text-[13.5px] font-semibold" style={{ color: '#991b1b' }}>
                {criticalPatients} critical patient{(criticalPatients ?? 0) > 1 ? 's' : ''} need attention
              </p>
            </div>
            <Link
              href="/patients?status=critical"
              className="flex items-center gap-1 text-[12.5px] font-semibold"
              style={{ color: '#dc2626' }}
            >
              View <ArrowRight size={13} />
            </Link>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {stats.map((s) => (
            <Link
              key={s.label}
              href={s.href}
              className="card card-hover group p-5 transition-all"
              style={{ borderRadius: 14 }}
            >
              <div className={s.accent} style={{ margin: '-1px -1px 0', borderRadius: '14px 14px 0 0', height: 3 }} />
              <div className="flex items-center justify-between mt-4 mb-4">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ background: s.iconBg }}
                >
                  <s.icon size={18} style={{ color: s.iconColor }} />
                </div>
                <ArrowRight
                  size={14}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: '#94a3b8' }}
                />
              </div>
              <p className="text-[30px] font-bold leading-none" style={{ color: '#0f172a' }}>
                {s.value}
              </p>
              <p className="text-[12.5px] mt-1.5" style={{ color: '#94a3b8' }}>{s.label}</p>
            </Link>
          ))}
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Recent patients */}
          <div className="card lg:col-span-2 overflow-hidden" style={{ borderRadius: 14 }}>
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: '1px solid #f0f3f7' }}
            >
              <p className="text-[14px] font-bold" style={{ color: '#0f172a' }}>Recent Patients</p>
              <Link
                href="/patients"
                className="flex items-center gap-1 text-[12px] font-semibold"
                style={{ color: '#0d9488' }}
              >
                View all <ArrowRight size={12} />
              </Link>
            </div>

            {(recentPatients ?? []).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl mb-3"
                  style={{ background: '#f0fdfa' }}
                >
                  <Users size={20} style={{ color: '#0d9488' }} />
                </div>
                <p className="text-[13.5px] font-medium" style={{ color: '#64748b' }}>No patients yet</p>
                <Link
                  href="/patients/new"
                  className="mt-2 text-[12.5px] font-semibold hover:underline"
                  style={{ color: '#0d9488' }}
                >
                  Add your first patient
                </Link>
              </div>
            ) : (
              <div>
                {(recentPatients ?? []).map((p, i) => (
                  <Link
                    key={p.id}
                    href={`/patients/${p.id}`}
                    className="flex items-center gap-3.5 px-5 py-3.5 transition-colors group"
                    style={{
                      borderBottom: i < (recentPatients?.length ?? 0) - 1 ? '1px solid #f8f9fb' : 'none',
                      background: 'transparent',
                    }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = '#fafbfc')}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                  >
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white text-[11px] font-bold"
                      style={{ background: 'linear-gradient(135deg,#0d9488,#0891b2)' }}
                    >
                      {getInitials(p.full_name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13.5px] font-semibold truncate" style={{ color: '#0f172a' }}>
                        {p.full_name}
                      </p>
                      <p className="text-[11.5px]" style={{ color: '#94a3b8' }}>{p.phone}</p>
                    </div>
                    <span className={`badge ${getStatusColor(p.status)}`}>{p.status}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="space-y-5">
            {/* Reminders */}
            <div className="card overflow-hidden" style={{ borderRadius: 14 }}>
              <div
                className="flex items-center justify-between px-5 py-4"
                style={{ borderBottom: '1px solid #f0f3f7' }}
              >
                <p className="text-[14px] font-bold" style={{ color: '#0f172a' }}>Reminders</p>
                <Link href="/reminders" className="text-[12px] font-semibold flex items-center gap-1" style={{ color: '#0d9488' }}>
                  All <ArrowRight size={12} />
                </Link>
              </div>
              <div>
                {(upcomingReminders ?? []).length === 0 ? (
                  <p className="px-5 py-5 text-center text-[12.5px]" style={{ color: '#b0bcc9' }}>
                    No pending reminders
                  </p>
                ) : (upcomingReminders ?? []).map((r, i) => (
                  <div
                    key={r.id}
                    className="px-5 py-3"
                    style={{ borderBottom: i < (upcomingReminders?.length ?? 0) - 1 ? '1px solid #f8f9fb' : 'none' }}
                  >
                    <p className="text-[13px] font-semibold truncate" style={{ color: '#1e293b' }}>{r.title}</p>
                    <p className="text-[11.5px] mt-0.5" style={{ color: '#94a3b8' }}>
                      {(r as { patients?: { full_name?: string } }).patients?.full_name} · {formatRelative(r.scheduled_at)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Appointments */}
            <div className="card overflow-hidden" style={{ borderRadius: 14 }}>
              <div
                className="flex items-center justify-between px-5 py-4"
                style={{ borderBottom: '1px solid #f0f3f7' }}
              >
                <p className="text-[14px] font-bold" style={{ color: '#0f172a' }}>Appointments</p>
                <Link href="/appointments" className="text-[12px] font-semibold flex items-center gap-1" style={{ color: '#0d9488' }}>
                  All <ArrowRight size={12} />
                </Link>
              </div>
              <div>
                {(upcomingAppts ?? []).length === 0 ? (
                  <p className="px-5 py-5 text-center text-[12.5px]" style={{ color: '#b0bcc9' }}>
                    No upcoming appointments
                  </p>
                ) : (upcomingAppts ?? []).map((a, i) => (
                  <div
                    key={a.id}
                    className="px-5 py-3"
                    style={{ borderBottom: i < (upcomingAppts?.length ?? 0) - 1 ? '1px solid #f8f9fb' : 'none' }}
                  >
                    <p className="text-[13px] font-semibold truncate" style={{ color: '#1e293b' }}>{a.title}</p>
                    <p className="text-[11.5px] mt-0.5" style={{ color: '#94a3b8' }}>
                      {(a as { patients?: { full_name?: string } }).patients?.full_name} · {formatRelative(a.scheduled_at)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
