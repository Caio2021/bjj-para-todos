import { NextResponse } from 'next/server'
import QRCode from 'qrcode'

export async function GET(_req: Request, { params }: { params: Promise<{ alunoId: string }> }) {
  const { alunoId } = await params
  const qrBuffer = await QRCode.toBuffer(`jjpt:aluno:${alunoId}`, {
    width: 200,
    margin: 1,
    color: { dark: '#111111', light: '#ffffff' },
  })

  return new NextResponse(qrBuffer as unknown as BodyInit, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
