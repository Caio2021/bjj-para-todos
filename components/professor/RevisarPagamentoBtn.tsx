'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Modal, Input } from '@/components/ui'

export default function RevisarPagamentoBtn({ pagamentoId, alunoId }: { pagamentoId: string; alunoId: string }) {
  const router  = useRouter()
  const [modal, setModal]   = useState<'rejeitar' | null>(null)
  const [motivo, setMotivo] = useState('')
  const [loading, setLoading] = useState<'aprovar' | 'rejeitar' | null>(null)

  async function revisar(acao: 'APROVADO' | 'REJEITADO') {
    setLoading(acao === 'APROVADO' ? 'aprovar' : 'rejeitar')
    await fetch(`/api/pagamento/${pagamentoId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ acao, motivoRejeicao: motivo || undefined }),
    })
    setLoading(null)
    setModal(null)
    router.refresh()
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        <Button variant="success" loading={loading === 'aprovar'} onClick={() => revisar('APROVADO')}>
          ✓ Aprovar
        </Button>
        <Button variant="danger" loading={loading === 'rejeitar'} onClick={() => setModal('rejeitar')}>
          ✗ Rejeitar
        </Button>
      </div>

      {modal === 'rejeitar' && (
        <Modal title="Rejeitar comprovante" onClose={() => setModal(null)}>
          <div className="space-y-4">
            <p className="text-sm text-zinc-400">Informe o motivo da rejeição para notificar o aluno.</p>
            <Input
              label="Motivo (opcional)"
              value={motivo}
              onChange={setMotivo}
              placeholder="Ex: comprovante ilegível, valor incorreto..."
            />
            <Button variant="danger" loading={loading === 'rejeitar'} onClick={() => revisar('REJEITADO')}>
              Confirmar rejeição
            </Button>
          </div>
        </Modal>
      )}
    </>
  )
}
