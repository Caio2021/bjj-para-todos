import { redirect } from 'next/navigation'
import { getDevSession } from '@/lib/dev-session'
import { prisma } from '@/lib/prisma'
import { Badge, Card, SectionHeader, EmptyState } from '@/components/ui'
import UploadComprovante from '@/components/aluno/UploadComprovante'

export default async function AlunoPagamentosPage() {
  const session = await getDevSession()
  if (!session) redirect('/login')

  const aluno = await prisma.aluno.findUnique({
    where: { userId: session.id },
    select: { id: true, statusPgto: true },
  })

  const pagamentos = await prisma.pagamento.findMany({
    where: { alunoId: aluno?.id ?? 'none' },
    orderBy: { criadoEm: 'desc' },
    select: { id: true, valor: true, descricao: true, status: true, criadoEm: true, motivoRejeicao: true },
  })

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
        <UploadComprovante alunoId={aluno?.id ?? ''} userId={session.id} />
      </div>

      {/* Histórico */}
      <div className="fade-up-2">
        <SectionHeader label="Meus pagamentos" />
        {pagamentos.length === 0 && <EmptyState icon="💳" message="Nenhum pagamento registrado ainda." />}
        <div className="space-y-2">
          {pagamentos.map(p => (
            <Card key={p.id} className="flex items-start gap-3 !py-3">
              <div className="flex-1">
                <p className="text-sm font-semibold text-zinc-200">{p.descricao}</p>
                <p className="text-xs text-zinc-600">{new Date(p.criadoEm).toLocaleDateString('pt-BR')}</p>
                {p.status === 'REJEITADO' && p.motivoRejeicao && (
                  <p className="text-xs text-red-400 mt-1">Motivo: {p.motivoRejeicao}</p>
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
