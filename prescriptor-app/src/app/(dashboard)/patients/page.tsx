export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import Link from 'next/link'
import { Plus, Phone, Users } from 'lucide-react'
import { getStatusColor, getInitials, formatDate } from '@/lib/utils'

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>
}) {
  const { q, status } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let query = supabase.from('patients').select('*').eq('doctor_id', user!.id).order('created_at', { ascending: false })
  if (status && status !== 'all') query = query.eq('status', status)
  if (q) query = query.ilike('full_name', `%${q}%`)

  const { data: patients } = await query

  const statusCounts = {
    all: patients?.length ?? 0,
    active: patients?.filter((p) => p.status === 'active').length ?? 0,
    critical: patients?.filter((p) => p.status === 'critical').length ?? 0,
    inactive: patients?.filter((p) => p.status === 'inactive').length ?? 0,
  }

  return (
    <div className="animate-fade-up">
      <Header title="Patients" subtitle="Manage your patient records" />

      <main className="p-6">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2 flex-1 w-full sm:w-auto">
            {/* Search */}
            <form className="relative flex-1 max-w-xs">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                name="q"
                defaultValue={q}
                placeholder="Search patients…"
                className="input-field pl-9 text-[13px] py-2.5 rounded-xl"
                style={{ background: '#fff' }}
              />
            </form>
          </div>

          <Link
            href="/patients/new"
            className="btn-primary shrink-0"
          >
            <Plus size={15} />
            Add Patient
          </Link>
        </div>

        {/* Status tabs */}
        <div className="flex items-center gap-1 mb-5 p-1 rounded-xl w-fit" style={{ background: '#eef0f4' }}>
          {(['all', 'active', 'critical', 'inactive'] as const).map((s) => (
            <Link
              key={s}
              href={`/patients${s !== 'all' ? `?status=${s}` : ''}`}
              className="px-3.5 py-1.5 rounded-lg text-[12.5px] font-semibold transition-all capitalize"
              style={
                (status ?? 'all') === s
                  ? { background: '#fff', color: '#0f172a', boxShadow: '0 1px 4px rgba(15,23,42,.08)' }
                  : { color: '#64748b' }
              }
            >
              {s} <span className="ml-1 opacity-60">{statusCounts[s]}</span>
            </Link>
          ))}
        </div>

        {/* Grid */}
        {(!patients || patients.length === 0) ? (
          <div
            className="card flex flex-col items-center justify-center py-16"
            style={{ borderRadius: 16 }}
          >
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl mb-3"
              style={{ background: '#f0fdfa' }}
            >
              <Users size={24} style={{ color: '#0d9488' }} />
            </div>
            <p className="font-semibold text-[14px]" style={{ color: '#374151' }}>No patients found</p>
            <p className="text-[12.5px] mt-1 mb-4" style={{ color: '#94a3b8' }}>
              {q ? 'Try a different search' : 'Add your first patient to get started'}
            </p>
            {!q && (
              <Link href="/patients/new" className="btn-primary">
                <Plus size={14} /> Add Patient
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {patients.map((p) => (
              <Link
                key={p.id}
                href={`/patients/${p.id}`}
                className="card card-hover group p-5 transition-all"
                style={{ borderRadius: 14 }}
              >
                <div className="flex items-start gap-3.5 mb-4">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white font-bold text-[12px]"
                    style={{ background: 'linear-gradient(135deg,#0d9488,#0891b2)' }}
                  >
                    {getInitials(p.full_name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[14px] truncate leading-tight" style={{ color: '#0f172a' }}>
                      {p.full_name}
                    </p>
                    <span className={`badge mt-1 ${getStatusColor(p.status)}`}>{p.status}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[12.5px]" style={{ color: '#64748b' }}>
                    <Phone size={12} className="shrink-0" />
                    <span>{p.phone}</span>
                  </div>
                  {p.date_of_birth && (
                    <div className="flex items-center gap-2 text-[12.5px]" style={{ color: '#94a3b8' }}>
                      <span>DOB: {formatDate(p.date_of_birth)}</span>
                    </div>
                  )}
                  {p.conditions && (p.conditions as string[]).length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {(p.conditions as string[]).slice(0, 2).map((c: string) => (
                        <span
                          key={c}
                          className="text-[11px] px-2.5 py-0.5 rounded-full font-medium"
                          style={{ background: 'rgba(59,130,246,.08)', color: '#3b82f6' }}
                        >
                          {c}
                        </span>
                      ))}
                      {(p.conditions as string[]).length > 2 && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full font-medium" style={{ background: '#f1f5f9', color: '#94a3b8' }}>
                          +{(p.conditions as string[]).length - 2}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
