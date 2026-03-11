'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ConfirmarCheckinBtn({ checkinId, alunoId }: { checkinId: string; alunoId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function confirmar() {
    setLoading(true)
    await fetch('/api/checkin/confirmar', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checkinId }),
    })
    setLoading(false)
    router.refresh()
  }

  return (
    <button
      onClick={confirmar}
      disabled={loading}
      className="flex-shrink-0 bg-emerald-900 hover:bg-emerald-800 text-emerald-300 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
    >
      {loading ? '...' : '✓ Confirmar'}
    </button>
  )
}
