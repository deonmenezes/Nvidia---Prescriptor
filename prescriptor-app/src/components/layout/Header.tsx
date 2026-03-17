'use client'

import { Bell, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Doctor } from '@/types'
import { getInitials } from '@/lib/utils'

interface HeaderProps {
  title: string
  subtitle?: string
}

export default function Header({ title, subtitle }: HeaderProps) {
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('doctors').select('*').eq('id', user.id).single()
      setDoctor(data)
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <header
      className="sticky top-0 z-40 flex h-[60px] items-center justify-between px-6"
      style={{
        background: 'rgba(244,246,249,0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid #e8ecf1',
      }}
    >
      {/* Title */}
      <div>
        <h1 className="text-[17px] font-bold leading-tight" style={{ color: '#0f172a' }}>{title}</h1>
        {subtitle && <p className="text-[11.5px] mt-0.5" style={{ color: '#94a3b8' }}>{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2.5">
        {/* Search */}
        <div className="relative hidden md:flex items-center">
          <Search size={14} className="absolute left-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search patients…"
            className="input-field pl-8 pr-4 py-2 text-[13px] w-52 rounded-lg"
            style={{ background: '#eef0f4', border: '1px solid transparent' }}
          />
        </div>

        {/* Notifications */}
        <button
          className="relative flex h-9 w-9 items-center justify-center rounded-xl transition-colors"
          style={{ background: '#eef0f4' }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = '#e2e6ec')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = '#eef0f4')}
        >
          <Bell size={16} style={{ color: '#475569' }} />
          <span
            className="absolute top-2 right-2 h-2 w-2 rounded-full ring-2 ring-white pulse-dot"
            style={{ background: '#0d9488' }}
          />
        </button>

        {/* Divider */}
        <div className="h-7 w-px" style={{ background: '#e2e8f0' }} />

        {/* Doctor pill */}
        <div className="flex items-center gap-2.5 cursor-pointer pl-0.5">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-white text-[12px] font-bold"
            style={{ background: 'linear-gradient(135deg,#0d9488,#0891b2)' }}
          >
            {doctor ? getInitials(doctor.full_name) : '?'}
          </div>
          <div className="hidden sm:block">
            <p className="text-[13px] font-semibold leading-tight" style={{ color: '#0f172a' }}>
              {doctor ? `Dr. ${doctor.full_name.split(' ')[0]}` : 'Doctor'}
            </p>
            <p className="text-[11px]" style={{ color: '#94a3b8' }}>
              {doctor?.specialization ?? 'General Practice'}
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
