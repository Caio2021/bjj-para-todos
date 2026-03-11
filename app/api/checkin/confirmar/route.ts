import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const schema = z.object({ checkinId: z.string().uuid() })

export async function PATCH(req: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verifica que é professor
  const profile = await prisma.user.findUnique({ where: { id: user.id }, select: { perfil: true } })
  if (profile?.perfil !== 'PROFESSOR') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = schema.safeParse(await req.json())
  if (!body.success) return NextResponse.json({ error: 'Invalid' }, { status: 400 })

  // Confirma o checkin (o trigger do banco vai incrementar aulas automaticamente)
  const checkin = await prisma.checkin.update({
    where: { id: body.data.checkinId },
    data: { confirmado: true, confirmedAt: new Date(), confirmedBy: user.id },
  })

  return NextResponse.json(checkin)
}
