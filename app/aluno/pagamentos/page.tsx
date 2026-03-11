import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Badge, Card, SectionHeader, EmptyState } from '@/components/ui'
import UploadComprovante from '@/components/aluno/UploadComprovante'

export default async function AlunoPagamentosPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: aluno } = await supabase
    .from('alunos').select('id, status_pgto').eq('user_id', user.id).single()

  const { data: pagamentos } = await supabase
    .from('pagamentos')
    .select('id, valor, descricao, status, criado_em, motivo_rejeicao')
    .eq('aluno_id', aluno?.id ?? 'none')
    .order('criado_em', { ascending: false })

  return (
    <div className="space-y-5 py-4">
      {/* PIX info */}
      <Card className="border-emerald-900/50 fade-up">
        <p className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider mb-3">Chave PIX da Academia</p>
        <p className="font-display font-black text-emerald-400 text-lg mb-0.5">
          academia@jiujitsutodos.com.br
        </p>
        <p className="text-xs text-zinc-500">R$ 120,00 · vencimento todo dia 5</p>
      </Card>

      {/* Upload */}
      <div className="fade-up-1">
        <UploadComprovante alunoId={aluno?.id ?? ''} userId={user.id} />
      </div>

      {/* Histórico */}
      <div className="fade-up-2">
        <SectionHeader label="Meus pagamentos" />
        {(pagamentos?.length ?? 0) === 0 && <EmptyState icon="💳" message="Nenhum pagamento registrado ainda." />}
        <div className="space-y-2">
          {(pagamentos ?? []).map(p => (
            <Card key={p.id} className="flex items-start gap-3 !py-3">
              <div className="flex-1">
                <p className="text-sm font-semibold text-zinc-200">{p.descricao}</p>
                <p className="text-xs text-zinc-600">{new Date(p.criado_em).toLocaleDateString('pt-BR')}</p>
                {p.status === 'REJEITADO' && p.motivo_rejeicao && (
                  <p className="text-xs text-red-400 mt-1">Motivo: {p.motivo_rejeicao}</p>
                )}
              </div>
              <div className="text-right flex flex-col items-end gap-1">
                <span className="font-display font-black text-emerald-400">
                  R${Number(p.valor).toFixed(2).replace('.', ',')}
                </span>
                <Badge status={p.status} />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
