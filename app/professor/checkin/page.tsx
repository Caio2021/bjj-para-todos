import { createServerClient } from '@/lib/supabase/server'
import QRCodeAula from '@/components/professor/QRCodeAula'
import CheckinManualList from '@/components/professor/CheckinManualList'

export default async function ProfCheckinPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: alunos } = await supabase
    .from('alunos')
    .select(`id, users!alunos_user_id_fkey (nome)`)
    .eq('professor_id', user!.id)
    .eq('status', 'ATIVO')
    .order('criado_em')

  return (
    <div className="space-y-6 py-4">
      <QRCodeAula professorId={user!.id} />
      <CheckinManualList alunos={(alunos ?? []).map(a => ({
        id: a.id,
        nome: (a.users as any)?.nome ?? '?',
      }))} />
    </div>
  )
}
