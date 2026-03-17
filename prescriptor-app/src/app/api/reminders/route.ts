import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendWhatsAppMessage } from '@/lib/openclaw'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { data, error } = await supabase.from('reminders').insert({ ...body, doctor_id: user.id }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

/**
 * PATCH /api/reminders/:id — trigger send a reminder immediately
 */
export async function PATCH(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json()

  const { data: reminder, error: rErr } = await supabase
    .from('reminders')
    .select('*, patients(full_name, phone)')
    .eq('id', id)
    .eq('doctor_id', user.id)
    .single()

  if (rErr || !reminder) return NextResponse.json({ error: 'Reminder not found' }, { status: 404 })

  const patient = reminder.patients as { full_name: string; phone: string } | null
  if (!patient) return NextResponse.json({ error: 'Patient not found' }, { status: 404 })

  if (reminder.send_whatsapp) {
    const result = await sendWhatsAppMessage(patient.phone, reminder.message)

    await supabase.from('reminders').update({
      status: result.success ? 'sent' : 'failed',
    }).eq('id', id)

    if (result.success) {
      await supabase.from('messages').insert({
        patient_id: reminder.patient_id,
        doctor_id: user.id,
        content: reminder.message,
        channel: 'whatsapp',
        direction: 'outbound',
        status: 'sent',
        sent_at: new Date().toISOString(),
      })
    }

    return NextResponse.json({ success: result.success, error: result.error })
  }

  return NextResponse.json({ success: true, note: 'No WhatsApp send requested' })
}
