import { redirect } from 'next/navigation'
import { getDevSession } from '@/lib/dev-session'
import { prisma } from '@/lib/prisma'
import { BeltCard, StatCard, SectionHeader, Badge, EmptyState } from '@/components/ui'
import CheckinBtn from '@/components/aluno/CheckinBtn'

export default async function AlunoHomePage() {
  const session = await getDevSession()
  if (!session) redirect('/login')

  const aluno = await prisma.aluno.findUnique({
    where: { userId: session.id },
    select: { id: true, faixa: true, grau: true, aulasNoGrau: true, totalAulas: true, status: true, statusPgto: true },
  })

  if (!aluno) {
    return (
      <div className="py-12 text-center space-y-3">
        <div className="text-5xl">🥋</div>
        <h2 className="font-display font-bold text-zinc-200">Aguardando cadastro</h2>
        <p className="text-sm text-zinc-500">Peça ao seu professor para te cadastrar na plataforma.</p>
      </div>
    )
  }

  const checkins = await prisma.checkin.findMany({
    where: { alunoId: aluno.id },
    orderBy: { data: 'desc' },
    take: 6,
    select: { id: true, data: true, hora: true, aulaLabel: true, confirmado: true },
  })

  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const checkinHoje = checkins.find(c => c.data.getTime() === hoje.getTime())
  const confirmados = checkins.filter(c => c.confirmado).length

  return (
    <div className="space-y-5 py-4">
      {/* Belt card */}
      <div className="fade-up">
        <BeltCard
          faixa={aluno.faixa}
          grau={aluno.grau}
          aulasNoGrau={aluno.aulasNoGrau}
          totalAulas={aluno.totalAulas}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 fade-up-1">
        <StatCard label="Total aulas"  value={aluno.totalAulas}  color="text-sky-400"     />
        <StatCard label="Confirmados"  value={confirmados}       color="text-emerald-400" />
        <StatCard label="Pagamento"    value={aluno.statusPgto === 'EM_DIA' ? '✓' : '!'} color={aluno.statusPgto === 'EM_DIA' ? 'text-emerald-400' : 'text-amber-400'} />
      </div>

      {/* Check-in CTA */}
      <div className="fade-up-2">
        <CheckinBtn
          alunoId={aluno.id}
          hojeFeito={!!checkinHoje}
          hojeConfirmado={checkinHoje?.confirmado ?? false}
        />
      </div>

      {/* Histórico */}
      <div className="fade-up-3">
        <SectionHeader label="Últimos check-ins" />
        {checkins.length === 0 && <EmptyState icon="📋" message="Nenhum check-in ainda. Treine muito!" />}
        <div className="space-y-1.5">
          {checkins.map(c => (
            <div key={c.id} className="flex items-center gap-3 px-3 py-2.5 bg-zinc-900 rounded-xl border border-zinc-800">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${c.confirmado ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span className="flex-1 text-sm text-zinc-300">
                {new Date(c.data).toLocaleDateString('pt-BR')} {c.aulaLabel ? `· ${c.aulaLabel}` : ''}
              </span>
              <Badge status={c.confirmado ? 'APROVADO' : 'PENDENTE'} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
