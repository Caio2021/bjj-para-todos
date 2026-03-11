'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Modal } from '@/components/ui'

export default function CheckinBtn({ alunoId, hojeFeito, hojeConfirmado }: {
  alunoId: string; hojeFeito: boolean; hojeConfirmado: boolean
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [modal, setModal]     = useState(false)

  async function fazerCheckin() {
    setLoading(true)
    const res = await fetch('/api/checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alunoId }),
    })
    setLoading(false)
    if (res.ok) { setModal(true); router.refresh() }
  }

  if (hojeFeito) {
    return (
      <div className={`w-full py-4 rounded-2xl border text-sm font-bold text-center ${hojeConfirmado ? 'bg-emerald-950 border-emerald-800 text-emerald-400' : 'bg-amber-950/40 border-amber-900 text-amber-400'}`}>
        {hojeConfirmado ? '✓ Presença confirmada hoje!' : '⏳ Check-in enviado — aguardando professor'}
      </div>
    )
  }

  return (
    <>
      <button
        onClick={fazerCheckin}
        disabled={loading}
        className="w-full bg-red-700 hover:bg-red-600 disabled:opacity-60 text-white font-display font-bold py-4 rounded-2xl transition-all active:scale-[0.98] text-sm red-glow flex items-center justify-center gap-2"
      >
        {loading
          ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          : <>📍 Fazer Check-in de Hoje</>
        }
      </button>

      {modal && (
        <Modal title="Check-in enviado! 📍" onClose={() => setModal(false)}>
          <div className="text-center space-y-3">
            <div className="text-5xl">✅</div>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Seu check-in foi registrado e aguarda confirmação do professor. Bom treino! 🥋
            </p>
            <button onClick={() => setModal(false)} className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold py-3 rounded-xl text-sm transition-colors mt-2">
              Fechar
            </button>
          </div>
        </Modal>
      )}
    </>
  )
}
