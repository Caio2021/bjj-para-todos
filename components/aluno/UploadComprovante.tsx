'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { FileUpload, Modal, Input, Button, Toast } from '@/components/ui'

export default function UploadComprovante({ alunoId, userId }: { alunoId: string; userId: string }) {
  const router   = useRouter()
  const supabase = createClient()

  const [modal, setModal]     = useState(false)
  const [file, setFile]       = useState<File | null>(null)
  const [desc, setDesc]       = useState(`Mensalidade ${new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`)
  const [loading, setLoading] = useState(false)
  const [toast, setToast]     = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  async function enviar() {
    if (!file || !alunoId) return
    setLoading(true)

    // 1. Upload para Supabase Storage
    const ext  = file.name.split('.').pop() ?? 'jpg'
    const path = `${userId}/${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('comprovantes')
      .upload(path, file, { upsert: false })

    if (uploadError) {
      setToast({ msg: 'Erro no upload. Tente novamente.', type: 'error' })
      setLoading(false)
      return
    }

    // 2. Signed URL (24h)
    const { data: signed } = await supabase.storage
      .from('comprovantes')
      .createSignedUrl(path, 60 * 60 * 24 * 7) // 7 dias

    // 3. Registra no banco via API
    const res = await fetch('/api/pagamento', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        alunoId,
        valor: 120,
        descricao: desc,
        referencia: new Date().toISOString().slice(0, 7),
        arquivoUrl: signed?.signedUrl ?? '',
        arquivoPath: path,
      }),
    })

    setLoading(false)
    if (res.ok) {
      setModal(false)
      setFile(null)
      setToast({ msg: '📬 Comprovante enviado ao professor!', type: 'success' })
      setTimeout(() => setToast(null), 3000)
      router.refresh()
    } else {
      setToast({ msg: 'Erro ao registrar. Tente novamente.', type: 'error' })
    }
  }

  return (
    <>
      <button
        onClick={() => setModal(true)}
        className="w-full border-2 border-dashed border-zinc-800 hover:border-red-800 rounded-2xl py-5 flex flex-col items-center gap-2 transition-colors group"
      >
        <span className="text-2xl">📎</span>
        <span className="text-sm font-bold text-zinc-500 group-hover:text-red-400 transition-colors">
          Enviar comprovante PIX
        </span>
      </button>

      {modal && (
        <Modal title="Enviar Comprovante PIX" onClose={() => setModal(false)}>
          <div className="space-y-4">
            <div className="bg-zinc-900 border border-emerald-900/50 rounded-xl px-4 py-3">
              <p className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider mb-1">Chave PIX</p>
              <p className="font-display font-black text-emerald-400">academia@jiujitsutodos.com.br</p>
              <p className="text-xs text-zinc-500 mt-0.5">R$ 120,00</p>
            </div>

            <Input label="Descrição" value={desc} onChange={setDesc} placeholder="Ex: Mensalidade março/2025" />

            <FileUpload onFile={setFile} />

            <Button onClick={enviar} loading={loading} disabled={!file}>
              Enviar comprovante
            </Button>
          </div>
        </Modal>
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </>
  )
}
