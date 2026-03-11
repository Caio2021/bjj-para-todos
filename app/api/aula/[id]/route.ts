import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { ativa } = z.object({ ativa: z.boolean() }).parse(await req.json())
  const aula = await prisma.aula.update({ where: { id }, data: { ativa } })
  return NextResponse.json(aula)
}
