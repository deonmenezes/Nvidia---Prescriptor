import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendWhatsAppMessage } from '@/lib/openclaw'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date().toISOString()

  const { data: reminders, error } = await supabaseAdmin
    .from('reminders')
    .select('*, patients(full_name, phone)')
    .eq('status', 'pending')
    .eq('send_whatsapp', true)
    .lte('scheduled_at', now)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!reminders || reminders.length === 0) {
    await supabaseAdmin.from('cron_logs').insert({ sent: 0, failed: 0, total: 0, details: [] })
    return NextResponse.json({ sent: 0, failed: 0, message: 'No reminders due' })
  }

  const results = []

  for (const reminder of reminders) {
    const patient = reminder.patients as { full_name: string; phone: string } | null
    if (!patient?.phone) {
      results.push({ id: reminder.id, success: false, error: 'No patient phone' })
      continue
    }

    const result = await sendWhatsAppMessage(patient.phone, reminder.message)

    await supabaseAdmin
      .from('reminders')
      .update({ status: result.success ? 'sent' : 'failed', sent_at: result.success ? now : null })
      .eq('id', reminder.id)

    if (result.success) {
      await supabaseAdmin.from('messages').insert({
        patient_id: reminder.patient_id,
        doctor_id: reminder.doctor_id,
        content: reminder.message,
        channel: 'whatsapp',
        direction: 'outbound',
        status: 'sent',
        sent_at: now,
      })
    }

    results.push({ id: reminder.id, patient: patient.full_name, success: result.success, error: result.error })
  }

  const sent = results.filter((r) => r.success).length
  const failed = results.filter((r) => !r.success).length

  await supabaseAdmin.from('cron_logs').insert({ sent, failed, total: reminders.length, details: results })

  return NextResponse.json({ sent, failed, total: reminders.length, results })
}
