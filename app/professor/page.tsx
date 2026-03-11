import { createServerClient } from '@/lib/supabase/server'
import { Badge, Avatar, Card, SectionHeader, StatCard, EmptyState } from '@/components/ui'
import ConfirmarCheckinBtn from '@/components/professor/ConfirmarCheckinBtn'
import Link from 'next/link'

const FAIXAS = ['Branca','Cinza','Amarela','Laranja','Verde']
const FAIXA_COR = ['#e5e7eb','#9ca3af','#fbbf24','#f97316','#22c55e']
const AULAS_POR_GRAU = [40,50,60,70,80]

export default async function ProfessorPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Busca alunos do professor
  const { data: alunos } = await supabase
    .from('alunos')
    .select(`
      id, faixa, grau, aulas_no_grau, total_aulas, status, status_pgto,
      users!alunos_user_id_fkey (nome, email, avatar_url)
    `)
    .eq('professor_id', user!.id)
    .order('criado_em', { ascending: false })

  // Checkins pendentes de confirmação
  const alunoIds = (alunos ?? []).map(a => a.id)
  const { data: checkinsPendentes } = await supabase
    .from('checkins')
    .select(`id, data, hora, aula_label, aluno_id`)
    .in('aluno_id', alunoIds.length ? alunoIds : ['none'])
    .eq('confirmado', false)
    .order('criado_em', { ascending: false })

  // Pagamentos pendentes
  const { data: pgPendentes } = await supabase
    .from('pagamentos')
    .select('id')
    .in('aluno_id', alunoIds.length ? alunoIds : ['none'])
    .eq('status', 'PENDENTE')

  const ativos   = (alunos ?? []).filter(a => a.status === 'ATIVO').length
  const nomeMap  = Object.fromEntries((alunos ?? []).map(a => [a.id, (a.users as any)?.nome ?? '?']))

  return (
    <div className="space-y-6 py-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 fade-up">
        <StatCard label="Alunos ativos"   value={ativos}                          color="text-emerald-400" />
        <StatCard label="Check-ins"       value={checkinsPendentes?.length ?? 0}  color="text-amber-400"   />
        <StatCard label="Pgtos pend."     value={pgPendentes?.length ?? 0}         color="text-red-400"    />
      </div>

      {/* Check-ins pendentes */}
      {(checkinsPendentes?.length ?? 0) > 0 && (
        <div className="fade-up-1">
          <SectionHeader label={`Check-ins pendentes (${checkinsPendentes!.length})`} />
          <div className="space-y-2">
            {checkinsPendentes!.map(c => (
              <Card key={c.id} className="flex items-center gap-3 !py-3">
                <Avatar name={nomeMap[c.aluno_id] ?? '?'} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-zinc-200 truncate">{nomeMap[c.aluno_id]}</p>
                  <p className="text-xs text-zinc-600">{c.data} · {c.hora ?? ''} {c.aula_label ? `· ${c.aula_label}` : ''}</p>
                </div>
                <ConfirmarCheckinBtn checkinId={c.id} alunoId={c.aluno_id} />
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Lista de alunos */}
      <div className="fade-up-2">
        <SectionHeader
          label={`Alunos (${alunos?.length ?? 0})`}
          action="+ Novo"
          onAction={() => {}}
        />
        <div className="space-y-2">
          {(alunos?.length ?? 0) === 0 && (
            <EmptyState icon="🥋" message="Nenhum aluno cadastrado ainda." />
          )}
          {(alunos ?? []).map(a => {
            const nome = (a.users as any)?.nome ?? '?'
            const cor  = FAIXA_COR[a.faixa] ?? '#e5e7eb'
            const pct  = Math.min(100, Math.round(a.aulas_no_grau / (AULAS_POR_GRAU[a.faixa] ?? 40) * 100))
            return (
              <Card key={a.id} className="flex items-center gap-3">
                <Avatar name={nome} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-sm font-semibold text-zinc-100 truncate">{nome}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                      style={{ color: cor, borderColor: cor + '55', background: cor + '11' }}>
                      {FAIXAS[a.faixa]} · {a.grau}° grau
                    </span>
                    <Badge status={a.status_pgto} />
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
