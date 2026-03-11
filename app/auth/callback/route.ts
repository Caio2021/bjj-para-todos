import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createServerClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('perfil')
          .eq('id', user.id)
          .single()

        if (profile?.perfil === 'PROFESSOR') {
          return NextResponse.redirect(`${origin}/professor`)
        }
        return NextResponse.redirect(`${origin}/aluno`)
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`)
}
