import { getDevSession } from '@/lib/dev-session'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const schema = z.object({ checkinId: z.string().uuid() })

export async function PATCH(req: Request) {
  const session = await getDevSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.perfil !== 'PROFESSOR') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = schema.safeParse(await req.json())
  if (!body.success) return NextResponse.json({ error: 'Invalid' }, { status: 400 })

  const checkin = await prisma.checkin.update({
    where: { id: body.data.checkinId },
    data: { confirmado: true, confirmedAt: new Date(), confirmedBy: session.id },
  })

  return NextResponse.json(checkin)
}
