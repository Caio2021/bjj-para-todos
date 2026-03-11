import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card } from '@/components/ui'

export default async function AlunoQRPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('users').select('nome').eq('id', user.id).single()
  const { data: aluno }   = await supabase.from('alunos').select('id, faixa').eq('user_id', user.id).single()

  const FAIXAS = ['Branca','Cinza','Amarela','Laranja','Verde']
  const qrValue = `jjpt:aluno:${aluno?.id ?? user.id}`

  // Gera URL do QR via API route
  const qrUrl = `/api/qr/aluno/${aluno?.id ?? user.id}`

  return (
    <div className="space-y-5 py-4">
      <Card className="text-center space-y-5 py-8 fade-up">
        <p className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider">Meu QR Code de Check-in</p>

        <div className="flex justify-center">
          <div className="p-4 bg-white rounded-2xl shadow-[0_0_50px_rgba(220,38,38,0.25)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrUrl} alt="Meu QR Code" width={180} height={180} />
          </div>
        </div>

        <div>
          <p className="font-display font-bold text-lg text-zinc-100">{profile?.nome}</p>
          <p className="text-sm text-zinc-500 mt-0.5">Faixa {FAIXAS[aluno?.faixa ?? 0]}</p>
        </div>
      </Card>

      <Card className="flex gap-3 items-start fade-up-1">
        <div className="text-2xl">💡</div>
        <div>
          <p className="font-semibold text-sm text-zinc-200 mb-1">Como funciona</p>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Mostre este QR Code ao professor no início da aula. Ele escaneia e sua presença é registrada automaticamente, contando para o progresso da sua faixa.
          </p>
        </div>
      </Card>
    </div>
  )
}
