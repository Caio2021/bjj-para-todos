import { getDevSession } from '@/lib/dev-session'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import QRCode from 'qrcode'
import { z } from 'zod'
import { randomUUID } from 'crypto'

const schema = z.object({
  label: z.string().min(1),
  data:  z.string(),
  hora:  z.string(),
})

export async function POST(req: Request) {
  const session = await getDevSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = schema.safeParse(await req.json())
  if (!body.success) return NextResponse.json({ error: 'Invalid' }, { status: 400 })

  const qrToken = `jjpt:aula:${randomUUID()}`

  const aula = await prisma.aula.create({
    data: {
      label:     body.data.label,
      data:      new Date(body.data.data),
      hora:      body.data.hora,
      qrToken,
      criadoPor: session.id,
    },
  })

  const qrCodeUrl = await QRCode.toDataURL(qrToken, {
    width: 200,
    margin: 1,
    color: { dark: '#111111', light: '#ffffff' },
  })

  return NextResponse.json({ ...aula, qrCodeUrl }, { status: 201 })
}

export async function GET() {
  const session = await getDevSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const aulas = await prisma.aula.findMany({
    where: { criadoPor: session.id },
    orderBy: { criadoEm: 'desc' },
    take: 10,
  })

  return NextResponse.json(aulas)
}
