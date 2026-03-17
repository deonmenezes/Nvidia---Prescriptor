import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient as createAdminClient } from '@supabase/supabase-js'

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    // Create the redirect response first so we can attach cookies to it
    const response = NextResponse.redirect(`${origin}${next}`)

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            // Write session cookies onto the redirect response
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options)
            })
          },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Auto-create doctors row on first Google login (use admin client to bypass RLS)
      const { data: existing } = await supabaseAdmin
        .from('doctors')
        .select('id')
        .eq('id', data.user.id)
        .single()

      if (!existing) {
        const name =
          data.user.user_metadata?.full_name ??
          data.user.user_metadata?.name ??
          data.user.email?.split('@')[0] ??
          'Doctor'

        await supabaseAdmin.from('doctors').insert({
          id: data.user.id,
          full_name: name,
          email: data.user.email ?? '',
          avatar_url: data.user.user_metadata?.avatar_url ?? null,
        })
      }

      return response
    }
  }

  return NextResponse.redirect(`${origin}/login?error=oauth_failed`)
}
