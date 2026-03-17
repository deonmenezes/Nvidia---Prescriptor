'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Users, Bell, MessageSquare,
  FileText, Calendar, Settings, LogOut, Stethoscope,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { getInitials } from '@/lib/utils'
import type { Doctor } from '@/types'

const nav = [
  { label: 'Dashboard',    href: '/dashboard',    icon: LayoutDashboard },
  { label: 'Patients',     href: '/patients',     icon: Users },
  { label: 'Reminders',    href: '/reminders',    icon: Bell,           badge: 3 },
  { label: 'Messages',     href: '/messages',     icon: MessageSquare },
  { label: 'Reports',      href: '/reports',      icon: FileText },
  { label: 'Appointments', href: '/appointments', icon: Calendar },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [doctor, setDoctor] = useState<Doctor | null>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('doctors').select('*').eq('id', user.id).single()
      setDoctor(data)
    }
    load()
  }, [supabase])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside
      className="fixed inset-y-0 left-0 z-50 flex flex-col"
      style={{ width: 248, background: '#0b1120', borderRight: '1px solid rgba(255,255,255,0.06)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
          style={{ background: 'linear-gradient(135deg,#0d9488,#0891b2)', boxShadow: '0 4px 14px rgba(13,148,136,.4)' }}
        >
          <Stethoscope size={17} className="text-white" />
        </div>
        <div>
          <p className="text-white font-bold text-[15px] leading-tight tracking-tight">Prescriptor</p>
          <p className="text-[11px] font-medium" style={{ color: '#14b8a6' }}>Doctor&apos;s Portal</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
        <p
          className="text-[10px] font-semibold uppercase tracking-[0.12em] px-3 mb-3"
          style={{ color: '#3f5068' }}
        >
          Navigation
        </p>

        {nav.map(({ label, href, icon: Icon, badge }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium transition-all group ${
                active ? 'nav-active' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
              style={active ? { borderRadius: 10 } : {}}
            >
              <Icon
                size={17}
                className={`shrink-0 ${active ? '' : 'text-slate-500 group-hover:text-slate-300'}`}
              />
              <span className="flex-1">{label}</span>
              {badge && (
                <span
                  className="flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold text-white leading-none"
                  style={{ background: '#f59e0b' }}
                >
                  {badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-3" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        {/* Doctor card */}
        {doctor && (
          <div
            className="flex items-center gap-3 px-3 py-3 rounded-xl mb-2 mt-3"
            style={{ background: 'rgba(255,255,255,0.04)' }}
          >
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white text-xs font-bold"
              style={{ background: 'linear-gradient(135deg,#0d9488,#0891b2)' }}
            >
              {getInitials(doctor.full_name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12.5px] font-semibold text-white leading-tight truncate">
                Dr. {doctor.full_name.split(' ')[0]}
              </p>
              <p className="text-[11px] text-slate-500 truncate">{doctor.specialization ?? 'Doctor'}</p>
            </div>
            <div className="h-2 w-2 rounded-full bg-emerald-400 shrink-0" />
          </div>
        )}

        <Link
          href="/settings"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium transition-all ${
            pathname === '/settings' ? 'nav-active' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <Settings size={17} className="shrink-0 text-slate-500" />
          Settings
        </Link>

        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium text-slate-400 hover:text-red-400 transition-all group"
          style={{ background: 'transparent' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.07)' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
        >
          <LogOut size={17} className="shrink-0 text-slate-500 group-hover:text-red-400" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
