import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BeltCard, StatCard, SectionHeader, Badge, EmptyState } from '@/components/ui'
import CheckinBtn from '@/components/aluno/CheckinBtn'

export default async function AlunoHomePage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: aluno } = await supabase
    .from('alunos')
    .select('id, faixa, grau, aulas_no_grau, total_aulas, status, status_pgto')
    .eq('user_id', user.id)
    .single()

  if (!aluno) {
    return (
      <div className="py-12 text-center space-y-3">
        <div className="text-5xl">🥋</div>
        <h2 className="font-display font-bold text-zinc-200">Aguardando cadastro</h2>
        <p className="text-sm text-zinc-500">Peça ao seu professor para te cadastrar na plataforma.</p>
      </div>
    )
  }

  // Checkins recentes
  const { data: checkins } = await supabase
    .from('checkins')
    .select('id, data, hora, aula_label, confirmado')
    .eq('aluno_id', aluno.id)
    .order('data', { ascending: false })
    .limit(6)

  // Check-in hoje?
  const hoje = new Date().toISOString().split('T')[0]
  const checkinHoje = (checkins ?? []).find(c => c.data === hoje)

  const confirmados = (checkins ?? []).filter(c => c.confirmado).length

  return (
    <div className="space-y-5 py-4">
      {/* Belt card */}
      <div className="fade-up">
        <BeltCard
          faixa={aluno.faixa}
          grau={aluno.grau}
          aulasNoGrau={aluno.aulas_no_grau}
          totalAulas={aluno.total_aulas}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 fade-up-1">
        <StatCard label="Total aulas"   value={aluno.total_aulas}  color="text-sky-400"     />
        <StatCard label="Confirmados"   value={confirmados}        color="text-emerald-400" />
        <StatCard label="Pagamento"     value={aluno.status_pgto === 'EM_DIA' ? '✓' : '!'} color={aluno.status_pgto === 'EM_DIA' ? 'text-emerald-400' : 'text-amber-400'} />
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
        {(checkins?.length ?? 0) === 0 && <EmptyState icon="📋" message="Nenhum check-in ainda. Treine muito!" />}
        <div className="space-y-1.5">
          {(checkins ?? []).map(c => (
            <div key={c.id} className="flex items-center gap-3 px-3 py-2.5 bg-zinc-900 rounded-xl border border-zinc-800">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${c.confirmado ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span className="flex-1 text-sm text-zinc-300">{new Date(c.data + 'T12:00').toLocaleDateString('pt-BR')} {c.aula_label ? `· ${c.aula_label}` : ''}</span>
              <Badge status={c.confirmado ? 'APROVADO' : 'PENDENTE'} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
