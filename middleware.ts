import { NextResponse, type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const perfil = request.cookies.get('dev_perfil')?.value
  const path   = request.nextUrl.pathname

  // Sem sessão → login
  if (!perfil) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Aluno tentando acessar rota de professor
  if (path.startsWith('/professor') && perfil !== 'PROFESSOR') {
    const url = request.nextUrl.clone()
    url.pathname = '/aluno'
    return NextResponse.redirect(url)
  }

  // Professor tentando acessar rota de aluno
  if (path.startsWith('/aluno') && perfil !== 'ALUNO') {
    const url = request.nextUrl.clone()
    url.pathname = '/professor'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/professor/:path*',
    '/aluno/:path*',
  ],
}
