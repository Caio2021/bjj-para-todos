import { redirect } from 'next/navigation'
import { getDevSession } from '@/lib/dev-session'
import { prisma } from '@/lib/prisma'
import QRCodeAula from '@/components/professor/QRCodeAula'
import CheckinManualList from '@/components/professor/CheckinManualList'

export default async function ProfCheckinPage() {
  const session = await getDevSession()
  if (!session) redirect('/login')

  const alunos = await prisma.aluno.findMany({
    where: { professorId: session.id, status: 'ATIVO' },
    include: { user: { select: { nome: true } } },
    orderBy: { criadoEm: 'asc' },
  })

  return (
    <div className="space-y-6 py-4">
      <QRCodeAula professorId={session.id} />
      <CheckinManualList alunos={alunos.map(a => ({ id: a.id, nome: a.user.nome }))} />
    </div>
  )
}
