import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendWhatsAppMessage } from '@/lib/openclaw'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { patient_ids, message, doctor_id } = await req.json()

    if (!patient_ids?.length || !message) {
      return NextResponse.json({ error: 'patient_ids and message are required' }, { status: 400 })
    }

    // Get patient phone numbers
    const { data: patients, error: pErr } = await supabase
      .from('patients')
      .select('id, full_name, phone')
      .in('id', patient_ids)
      .eq('doctor_id', doctor_id ?? user.id)

    if (pErr || !patients) {
      return NextResponse.json({ error: 'Failed to fetch patients' }, { status: 500 })
    }

    const results = []

    for (const patient of patients) {
      // Send via OpenClaw
      const waResult = await sendWhatsAppMessage(patient.phone, message)

      // Log to DB
      const { data: msg } = await supabase.from('messages').insert({
        patient_id: patient.id,
        doctor_id: doctor_id ?? user.id,
        content: message,
        channel: 'whatsapp',
        direction: 'outbound',
        status: waResult.success ? 'sent' : 'failed',
        sent_at: waResult.success ? new Date().toISOString() : null,
      }).select().single()

      results.push({ patient: patient.full_name, success: waResult.success, error: waResult.error, messageId: msg?.id })
    }

    const allSuccess = results.every((r) => r.success)
    return NextResponse.json({ results, allSuccess })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Internal error' }, { status: 500 })
  }
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('messages')
    .select('*, patients(full_name, phone)')
    .eq('doctor_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
