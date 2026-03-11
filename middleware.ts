import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options as Parameters<typeof supabaseResponse.cookies.set>[2])
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname

  // Não logado → redireciona para login
  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Busca perfil do usuário
  const { data: profile } = await supabase
    .from('users')
    .select('perfil')
    .eq('id', user.id)
    .single()

  const perfil = profile?.perfil

  // Aluno tentando acessar rota de professor → redireciona
  if (path.startsWith('/professor') && perfil !== 'PROFESSOR') {
    const url = request.nextUrl.clone()
    url.pathname = '/aluno'
    return NextResponse.redirect(url)
  }

  // Professor tentando acessar rota de aluno → redireciona
  if (path.startsWith('/aluno') && perfil !== 'ALUNO') {
    const url = request.nextUrl.clone()
    url.pathname = '/professor'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/professor/:path*',
    '/aluno/:path*',
  ],
}
