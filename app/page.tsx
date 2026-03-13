import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function RootPage() {
  const cookieStore = await cookies()
  const perfil = cookieStore.get('dev_perfil')?.value

  if (!perfil)             redirect('/login')
  if (perfil === 'PROFESSOR') redirect('/professor')
  if (perfil === 'ALUNO')     redirect('/aluno')

  redirect('/login')
}
