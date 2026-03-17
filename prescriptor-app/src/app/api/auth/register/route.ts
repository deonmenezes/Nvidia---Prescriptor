import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const { user_id, full_name, email, specialization, license_number, hospital } = await request.json()

  if (!user_id || !email) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Check if doctor row already exists (e.g. duplicate call)
  const { data: existing } = await supabaseAdmin
    .from('doctors')
    .select('id')
    .eq('id', user_id)
    .single()

  if (existing) {
    return NextResponse.json({ ok: true })
  }

  const { error } = await supabaseAdmin.from('doctors').insert({
    id: user_id,
    full_name: full_name ?? email.split('@')[0],
    email,
    specialization: specialization ?? null,
    license_number: license_number ?? null,
    hospital: hospital ?? null,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
