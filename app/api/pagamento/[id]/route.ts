import { getDevSession } from '@/lib/dev-session'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { revisarPagamentoSchema } from '@/lib/validations'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getDevSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.perfil !== 'PROFESSOR') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = revisarPagamentoSchema.safeParse(await req.json())
  if (!body.success) return NextResponse.json({ error: 'Invalid' }, { status: 400 })

  const pagamento = await prisma.pagamento.findFirst({
    where: { id, aluno: { professorId: session.id } },
    include: { aluno: { include: { user: true } } },
  })
  if (!pagamento) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const updated = await prisma.pagamento.update({
    where: { id },
    data: {
      status:         body.data.acao,
      revisadoPor:    session.id,
      revisadoEm:     new Date(),
      motivoRejeicao: body.data.motivoRejeicao,
    },
  })

  if (body.data.acao === 'APROVADO') {
    await prisma.aluno.update({
      where: { id: pagamento.alunoId },
      data: { statusPgto: 'EM_DIA' },
    })
  }

  // Notificação por email (opcional — requer RESEND_API_KEY)
  try {
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: process.env.EMAIL_FROM ?? 'noreply@jiujitsutodos.com.br',
      to: pagamento.aluno.user.email,
      subject: body.data.acao === 'APROVADO'
        ? '✅ Pagamento aprovado — JJPT'
        : '❌ Comprovante rejeitado — JJPT',
      html: body.data.acao === 'APROVADO'
        ? `<p>Olá ${pagamento.aluno.user.nome}! Seu pagamento de <strong>R$${pagamento.valor}</strong> foi aprovado. 🥋</p>`
        : `<p>Olá ${pagamento.aluno.user.nome}, seu comprovante foi rejeitado. Motivo: ${body.data.motivoRejeicao ?? 'não informado'}. Por favor envie novamente.</p>`,
    })
  } catch {
    // Email falhou mas não bloqueia a resposta
  }

  return NextResponse.json(updated)
}
