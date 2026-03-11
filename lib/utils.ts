// lib/utils.ts

// ─── Faixas ───────────────────────────────────────────────────────────────────
export const FAIXAS = [
  { nome: 'Branca',  cor: '#e5e7eb', aulasPorGrau: 40 },
  { nome: 'Cinza',   cor: '#9ca3af', aulasPorGrau: 50 },
  { nome: 'Amarela', cor: '#fbbf24', aulasPorGrau: 60 },
  { nome: 'Laranja', cor: '#f97316', aulasPorGrau: 70 },
  { nome: 'Verde',   cor: '#22c55e', aulasPorGrau: 80 },
] as const

export type FaixaIndex = 0 | 1 | 2 | 3 | 4

export function getFaixaInfo(idx: FaixaIndex) {
  return FAIXAS[idx] ?? FAIXAS[0]
}

/** Retorna % de progresso no grau atual (0-100) */
export function calcularProgresso(faixa: number, aulasNoGrau: number): number {
  const limite = FAIXAS[faixa]?.aulasPorGrau ?? 40
  return Math.min(100, Math.round((aulasNoGrau / limite) * 100))
}

/** Quantas aulas faltam para o próximo grau */
export function aulasFaltando(faixa: number, aulasNoGrau: number): number {
  const limite = FAIXAS[faixa]?.aulasPorGrau ?? 40
  return Math.max(0, limite - aulasNoGrau)
}

// ─── QR Code Token ────────────────────────────────────────────────────────────
/** Gera token único para uma sessão de aula */
export function gerarQrToken(aulaId: string): string {
  const timestamp = Date.now()
  return `jjpt:aula:${aulaId}:${timestamp}`
}

/** Parseia token do QR Code do aluno */
export function parsearQrAluno(token: string): { alunoId: string } | null {
  const match = token.match(/^jjpt:aluno:([a-f0-9-]{36})$/)
  if (!match) return null
  return { alunoId: match[1] }
}

// ─── Formatação ───────────────────────────────────────────────────────────────
export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)
}

export function formatarData(data: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(data))
}

export function mesReferencia(data = new Date()): string {
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`
}

// ─── Storage ──────────────────────────────────────────────────────────────────
/** Gera o path do arquivo no bucket comprovantes/{userId}/{timestamp}-{nome} */
export function gerarStoragePath(userId: string, fileName: string): string {
  const ts  = Date.now()
  const ext = fileName.split('.').pop() ?? 'jpg'
  return `${userId}/${ts}.${ext}`
}
