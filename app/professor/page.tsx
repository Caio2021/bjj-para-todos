import { redirect } from 'next/navigation'
import { getDevSession } from '@/lib/dev-session'
import { prisma } from '@/lib/prisma'
import { Badge, Avatar, Card, SectionHeader, StatCard, EmptyState } from '@/components/ui'
import ConfirmarCheckinBtn from '@/components/professor/ConfirmarCheckinBtn'

const FAIXAS    = ['Branca','Cinza','Amarela','Laranja','Verde']
const FAIXA_COR = ['#e5e7eb','#9ca3af','#fbbf24','#f97316','#22c55e']
const AULAS_POR_GRAU = [40,50,60,70,80]

export default async function ProfessorPage() {
  const session = await getDevSession()
  if (!session) redirect('/login')

  const alunos = await prisma.aluno.findMany({
    where: { professorId: session.id },
    include: { user: { select: { nome: true, email: true } } },
    orderBy: { criadoEm: 'desc' },
  })

  const alunoIds = alunos.map(a => a.id)

  const checkinsPendentes = await prisma.checkin.findMany({
    where: { alunoId: { in: alunoIds.length ? alunoIds : ['none'] }, confirmado: false },
    orderBy: { criadoEm: 'desc' },
  })

  const pgPendentes = await prisma.pagamento.findMany({
    where: { alunoId: { in: alunoIds.length ? alunoIds : ['none'] }, status: 'PENDENTE' },
    select: { id: true },
  })

  const ativos  = alunos.filter(a => a.status === 'ATIVO').length
  const nomeMap = Object.fromEntries(alunos.map(a => [a.id, a.user.nome]))

  return (
    <div className="space-y-6 py-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 fade-up">
        <StatCard label="Alunos ativos" value={ativos}                         color="text-emerald-400" />
        <StatCard label="Check-ins"     value={checkinsPendentes.length}       color="text-amber-400"  />
        <StatCard label="Pgtos pend."   value={pgPendentes.length}             color="text-red-400"    />
      </div>

      {/* Check-ins pendentes */}
      {checkinsPendentes.length > 0 && (
        <div className="fade-up-1">
          <SectionHeader label={`Check-ins pendentes (${checkinsPendentes.length})`} />
          <div className="space-y-2">
            {checkinsPendentes.map(c => (
              <Card key={c.id} className="flex items-center gap-3 !py-3">
                <Avatar name={nomeMap[c.alunoId] ?? '?'} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-zinc-200 truncate">{nomeMap[c.alunoId]}</p>
                  <p className="text-xs text-zinc-600">
                    {c.data.toISOString().split('T')[0]} · {c.hora ?? ''} {c.aulaLabel ? `· ${c.aulaLabel}` : ''}
                  </p>
                </div>
                <ConfirmarCheckinBtn checkinId={c.id} alunoId={c.alunoId} />
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Lista de alunos */}
      <div className="fade-up-2">
        <SectionHeader
          label={`Alunos (${alunos.length})`}
          action="+ Novo"
          onAction={() => {}}
        />
        <div className="space-y-2">
          {alunos.length === 0 && (
            <EmptyState icon="🥋" message="Nenhum aluno cadastrado ainda." />
          )}
          {alunos.map(a => {
            const cor = FAIXA_COR[a.faixa] ?? '#e5e7eb'
            const pct = Math.min(100, Math.round(a.aulasNoGrau / (AULAS_POR_GRAU[a.faixa] ?? 40) * 100))
            return (
              <Card key={a.id} className="flex items-center gap-3">
                <Avatar name={a.user.nome} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-sm font-semibold text-zinc-100 truncate">{a.user.nome}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                      style={{ color: cor, borderColor: cor + '55', background: cor + '11' }}>
                      {FAIXAS[a.faixa]} · {a.grau}° grau
                    </span>
                    <Badge status={a.statusPgto} />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: cor }} />
                    </div>
                    <span className="text-[10px] text-zinc-600 tabular-nums">{pct}%</span>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
