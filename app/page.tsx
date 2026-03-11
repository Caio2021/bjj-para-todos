import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'

export default async function RootPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('perfil')
    .eq('id', user.id)
    .single()

  if (profile?.perfil === 'PROFESSOR') redirect('/professor')
  if (profile?.perfil === 'ALUNO') redirect('/aluno')

  redirect('/login')
}
