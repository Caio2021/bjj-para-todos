import { cookies } from 'next/headers'
import { prisma } from './prisma'

export type DevSession = {
  id: string
  nome: string
  email: string
  perfil: 'PROFESSOR' | 'ALUNO'
}

/**
 * Lê a sessão dev do cookie `dev_perfil`.
 * Busca o primeiro usuário com aquele perfil no banco (Prisma, sem RLS).
 */
export async function getDevSession(): Promise<DevSession | null> {
  const cookieStore = await cookies()
  const perfil = cookieStore.get('dev_perfil')?.value as 'PROFESSOR' | 'ALUNO' | undefined
  if (!perfil) return null

  const user = await prisma.user.findFirst({ where: { perfil } })
  if (!user) return null

  return { id: user.id, nome: user.nome, email: user.email, perfil: user.perfil }
}
