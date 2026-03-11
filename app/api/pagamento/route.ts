import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { uploadPagamentoSchema } from '@/lib/validations'

export async function POST(req: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = uploadPagamentoSchema.safeParse(await req.json())
  if (!body.success) return NextResponse.json({ error: body.error.flatten() }, { status: 400 })

  // Verifica que o aluno pertence ao usuário logado
  const aluno = await prisma.aluno.findFirst({
    where: { id: body.data.alunoId, userId: user.id },
  })
  if (!aluno) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const pagamento = await prisma.pagamento.create({
    data: {
      alunoId:    body.data.alunoId,
      valor:      body.data.valor,
      descricao:  body.data.descricao,
      referencia: body.data.referencia,
      arquivoUrl: body.data.arquivoUrl,
      arquivoPath: body.data.arquivoPath,
    },
  })

  // Atualiza status do aluno para PENDENTE
  await prisma.aluno.update({
    where: { id: aluno.id },
    data: { statusPgto: 'PENDENTE' },
  })

  return NextResponse.json(pagamento, { status: 201 })
}
