'use client'

import { useState, useEffect } from 'react'
import { Card, Button } from '@/components/ui'

export default function QRCodeAula({ professorId }: { professorId: string }) {
  const [label, setLabel] = useState(`Treino — ${new Date().toLocaleDateString('pt-BR')}`)
  const [qrSrc, setQrSrc]   = useState<string | null>(null)
  const [aulaId, setAulaId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [ativa, setAtiva]    = useState(false)

  async function gerarQR() {
    setLoading(true)
    const res = await fetch('/api/aula', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label, data: new Date().toISOString().split('T')[0], hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) }),
    })
    const data = await res.json()
    setAulaId(data.id)
    setQrSrc(data.qrCodeUrl)
    setAtiva(true)
    setLoading(false)
  }

  async function encerrarAula() {
    if (!aulaId) return
    await fetch(`/api/aula/${aulaId}`, { method: 'PATCH', body: JSON.stringify({ ativa: false }) })
    setAtiva(false)
    setQrSrc(null)
    setAulaId(null)
  }

  return (
    <Card className="text-center space-y-4">
      <p className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider">QR Code da Aula</p>

      {qrSrc ? (
        <>
          <div className="flex justify-center">
            <div className="p-3 bg-white rounded-2xl shadow-[0_0_40px_rgba(220,38,38,0.2)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrSrc} alt="QR Code da aula" width={180} height={180} />
            </div>
          </div>
          <p className="font-display font-bold text-zinc-100">{label}</p>
          <p className="text-xs text-zinc-500">Alunos escaneiam para fazer check-in automático</p>
          <Button variant="danger" onClick={encerrarAula}>Encerrar aula</Button>
        </>
      ) : (
        <>
          <div className="border-2 border-dashed border-zinc-800 rounded-xl p-10 text-zinc-700">
            <div className="text-5xl mb-2">📱</div>
            <p className="text-sm">Gere o QR Code para iniciar a aula</p>
          </div>
          <input
            value={label}
            onChange={e => setLabel(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-200 text-center focus:outline-none focus:border-red-700 transition-colors"
            placeholder="Nome da aula..."
          />
          <Button onClick={gerarQR} loading={loading}>
            Gerar QR Code
          </Button>
        </>
      )}
    </Card>
  )
}
