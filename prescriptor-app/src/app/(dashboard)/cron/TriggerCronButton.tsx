'use client'

import { useState } from 'react'
import { Loader2, Play } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function TriggerCronButton() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const router = useRouter()

  async function trigger() {
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/cron/send-reminders', {
        headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET}` },
      })
      const data = await res.json()
      if (res.ok) {
        setResult(`Sent: ${data.sent ?? 0} · Failed: ${data.failed ?? 0}`)
        router.refresh()
      } else {
        setResult(`Error: ${data.error}`)
      }
    } catch {
      setResult('Failed to trigger')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      {result && (
        <span className="text-[12.5px] text-slate-500">{result}</span>
      )}
      <button
        onClick={trigger}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-60"
        style={{ background: 'linear-gradient(135deg, #0d9488, #0891b2)' }}
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
        {loading ? 'Running…' : 'Run Now'}
      </button>
    </div>
  )
}
