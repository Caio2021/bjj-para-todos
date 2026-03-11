import { createServerClient } from '@/lib/supabase/server'
import { Avatar, Badge, Card, SectionHeader, EmptyState } from '@/components/ui'
import RevisarPagamentoBtn from '@/components/professor/RevisarPagamentoBtn'

export default async function ProfPagamentosPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: alunos } = await supabase
    .from('alunos').select('id').eq('professor_id', user!.id)
  const ids = (alunos ?? []).map(a => a.id)

  const { data: pagamentos } = await supabase
    .from('pagamentos')
    .select(`
      id, valor, descricao, status, arquivo_url, arquivo_path, criado_em,
      alunos!pagamentos_aluno_id_fkey (
        id,
        users!alunos_user_id_fkey (nome)
      )
    `)
    .in('aluno_id', ids.length ? ids : ['none'])
    .order('criado_em', { ascending: false })

  const pendentes = (pagamentos ?? []).filter(p => p.status === 'PENDENTE')
  const outros    = (pagamentos ?? []).filter(p => p.status !== 'PENDENTE')

  return (
    <div className="space-y-6 py-4">
      {/* Pendentes */}
      <div className="fade-up">
        <SectionHeader label={`Aguardando aprovação (${pendentes.length})`} />
        {pendentes.length === 0 && <EmptyState icon="🎉" message="Nenhum comprovante pendente." />}
        <div className="space-y-3">
          {pendentes.map(p => {
            const nome = (p.alunos as any)?.users?.nome ?? '?'
            return (
              <Card key={p.id} className="space-y-3">
                <div className="flex items-start gap-3">
                  <Avatar name={nome} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="font-semibold text-sm text-zinc-100">{nome}</span>
                      <Badge status={p.status} />
                    </div>
                    <p className="text-xs text-zinc-500">{p.descricao} · {new Date(p.criado_em).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <span className="font-display font-black text-lg text-emerald-400">
                    R${Number(p.valor).toFixed(2).replace('.', ',')}
                  </span>
                </div>

                {/* Comprovante */}
                <a
                  href={p.arquivo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 hover:border-zinc-700 transition-colors"
                >
                  <div className="w-9 h-9 bg-zinc-800 rounded-lg flex items-center justify-center text-lg">🖼</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-zinc-300 truncate">{p.arquivo_path.split('/').pop()}</p>
                    <p className="text-[11px] text-zinc-600">Comprovante PIX · clique para ver</p>
                  </div>
                  <svg className="w-4 h-4 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>

                <RevisarPagamentoBtn pagamentoId={p.id} alunoId={(p.alunos as any)?.id} />
              </Card>
            )
          })}
        </div>
      </div>

      {/* Histórico */}
      {outros.length > 0 && (
        <div className="fade-up-1">
          <SectionHeader label="Histórico" />
          <div className="space-y-2">
            {outros.map(p => {
              const nome = (p.alunos as any)?.users?.nome ?? '?'
              return (
                <Card key={p.id} className="flex items-center gap-3 !py-3">
                  <Avatar name={nome} size="sm" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-zinc-200">{nome}</p>
                    <p className="text-xs text-zinc-600">{p.descricao}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-400">R${Number(p.valor).toFixed(2).replace('.', ',')}</p>
                    <Badge status={p.status} />
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
