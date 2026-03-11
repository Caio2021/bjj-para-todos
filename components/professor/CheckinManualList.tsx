'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Avatar, Card, SectionHeader, Toast } from '@/components/ui'

export default function CheckinManualList({ alunos }: { alunos: { id: string; nome: string }[] }) {
  const router  = useRouter()
  const [toast, setToast]     = useState<string | null>(null)
  const [loading, setLoading] = useState<string | null>(null)

  async function registrar(alunoId: string, nome: string) {
    setLoading(alunoId)
    const res = await fetch('/api/checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alunoId, confirmarImediatamente: true }),
    })
    setLoading(null)
    if (res.ok) {
      setToast(`✓ Check-in de ${nome.split(' ')[0]} registrado!`)
      setTimeout(() => setToast(null), 2500)
      router.refresh()
    }
  }

  return (
    <>
      <div>
        <SectionHeader label="Check-in manual" />
        <div className="space-y-2">
          {alunos.map(a => (
            <Card key={a.id} className="flex items-center gap-3 !py-3">
              <Avatar name={a.nome} size="sm" />
              <span className="flex-1 text-sm font-semibold text-zinc-200">{a.nome}</span>
              <button
                onClick={() => registrar(a.id, a.nome)}
                disabled={loading === a.id}
                className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-lg font-bold transition-colors disabled:opacity-50"
              >
                {loading === a.id ? '...' : '+ Check-in'}
              </button>
            </Card>
          ))}
        </div>
      </div>
      {toast && <Toast msg={toast} />}
    </>
  )
}
