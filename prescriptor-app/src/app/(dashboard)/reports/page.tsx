export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import { formatDate, getInitials } from '@/lib/utils'
import { FileText, Upload } from 'lucide-react'
import Link from 'next/link'
import UploadReportModal from './UploadReportModal'

export default async function ReportsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: reports }, { data: patients }] = await Promise.all([
    supabase
      .from('reports')
      .select('*, patients(full_name)')
      .eq('doctor_id', user!.id)
      .order('created_at', { ascending: false }),
    supabase.from('patients').select('id, full_name').eq('doctor_id', user!.id),
  ])

  const typeColors: Record<string, string> = {
    lab: 'bg-blue-50 text-blue-700',
    xray: 'bg-purple-50 text-purple-700',
    mri: 'bg-indigo-50 text-indigo-700',
    general: 'bg-slate-100 text-slate-600',
    prescription: 'bg-teal-50 text-teal-700',
  }

  return (
    <div className="animate-fade-in">
      <Header title="Reports" subtitle="Patient medical reports and analysis" />
      <main className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">{reports?.length ?? 0} reports</p>
          <UploadReportModal patients={patients ?? []} />
        </div>

        {(!reports || reports.length === 0) ? (
          <div className="flex flex-col items-center justify-center bg-white rounded-xl border border-slate-200 py-16">
            <Upload className="h-12 w-12 text-slate-300 mb-3" />
            <p className="text-slate-600 font-medium mb-1">No reports yet</p>
            <p className="text-sm text-slate-400">Upload patient reports to track medical history</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {reports.map((r) => {
              const p = r.patients as { full_name: string } | null
              return (
                <div key={r.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 hover:shadow-md transition-all">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 shrink-0">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 truncate">{r.title}</p>
                      {p && (
                        <p className="text-sm text-slate-500 truncate">{p.full_name}</p>
                      )}
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${typeColors[r.report_type] ?? 'bg-slate-100 text-slate-600'}`}>
                      {r.report_type}
                    </span>
                  </div>

                  {r.description && <p className="text-sm text-slate-600 line-clamp-2 mb-3">{r.description}</p>}

                  {r.analysis && (
                    <div className="bg-teal-50 rounded-lg p-3 mb-3">
                      <p className="text-xs font-semibold text-teal-700 mb-1">Analysis</p>
                      <p className="text-xs text-teal-600 line-clamp-3">{r.analysis}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-slate-400">{formatDate(r.created_at)}</span>
                    {r.file_url && (
                      <a href={r.file_url} target="_blank" rel="noreferrer" className="text-xs font-medium text-teal-600 hover:underline flex items-center gap-1">
                        <FileText size={11} /> View File
                      </a>
                    )}
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
