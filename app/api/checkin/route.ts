import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const schema = z.object({
  alunoId:                z.string().uuid().optional(),
  aulaLabel:              z.string().max(100).optional(),
  qrToken:                z.string().optional(),
  confirmarImediatamente: z.boolean().optional().default(false),
})

export async function POST(req: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = schema.safeParse(await req.json())
  if (!body.success) return NextResponse.json({ error: body.error.flatten() }, { status: 400 })

  // Determina o alunoId: se professor faz checkin manual, usa o alunoId do body
  // Se aluno faz checkin próprio, busca pelo userId
  let alunoId = body.data.alunoId
  if (!alunoId) {
    const aluno = await prisma.aluno.findUnique({ where: { userId: user.id } })
    if (!aluno) return NextResponse.json({ error: 'Aluno não encontrado' }, { status: 404 })
    alunoId = aluno.id
  }

  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  // Verifica se já fez check-in hoje
  const jaFez = await prisma.checkin.findUnique({
    where: { alunoId_data: { alunoId, data: hoje } },
  })
  if (jaFez) return NextResponse.json({ error: 'Check-in já realizado hoje', checkin: jaFez }, { status: 409 })

  const confirmado = body.data.confirmarImediatamente === true
  const checkin = await prisma.checkin.create({
    data: {
      alunoId,
      data: hoje,
      hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      aulaLabel: body.data.aulaLabel,
      qrToken:   body.data.qrToken,
      confirmado,
      confirmedAt:  confirmado ? new Date() : null,
      confirmedBy:  confirmado ? user.id : null,
    },
  })

  return NextResponse.json(checkin, { status: 201 })
}
