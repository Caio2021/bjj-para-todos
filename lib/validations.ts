// lib/validations.ts
// Schemas Zod — compartilhados entre API Routes e componentes

import { z } from 'zod'

// ─── Auth ────────────────────────────────────────────────────────────────────
export const signUpSchema = z.object({
  email:  z.string().email('Email inválido'),
  nome:   z.string().min(3, 'Nome muito curto').max(80),
  perfil: z.enum(['PROFESSOR', 'ALUNO']),
  senha:  z.string().min(8, 'Mínimo 8 caracteres').optional(),
})

// ─── Aluno ───────────────────────────────────────────────────────────────────
export const cadastrarAlunoSchema = z.object({
  nome:   z.string().min(3).max(80),
  email:  z.string().email(),
})

export const atualizarFaixaSchema = z.object({
  alunoId:    z.string().uuid(),
  faixa:      z.number().int().min(0).max(4),
  grau:       z.number().int().min(0).max(4),
  aulasNoGrau: z.number().int().min(0).default(0),
})

// ─── Checkin ─────────────────────────────────────────────────────────────────
export const checkinSchema = z.object({
  aulaLabel: z.string().max(100).optional(),
  qrToken:   z.string().max(200).optional(),
  hora:      z.string().regex(/^\d{2}:\d{2}$/).optional(),
})

export const confirmarCheckinSchema = z.object({
  checkinId: z.string().uuid(),
})

// ─── Pagamento ───────────────────────────────────────────────────────────────
export const uploadPagamentoSchema = z.object({
  alunoId:    z.string().uuid(),
  valor:      z.number().positive('Valor inválido'),
  descricao:  z.string().min(3).max(100),
  referencia: z.string().regex(/^\d{4}-\d{2}$/, 'Formato: YYYY-MM').optional(),
  arquivoUrl:  z.string().url(),
  arquivoPath: z.string().min(1),
})

export const revisarPagamentoSchema = z.object({
  acao:            z.enum(['APROVADO', 'REJEITADO']),
  motivoRejeicao:  z.string().max(500).optional(),
})

// ─── Aula (QR) ───────────────────────────────────────────────────────────────
export const criarAulaSchema = z.object({
  label: z.string().min(3).max(100),
  data:  z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  hora:  z.string().regex(/^\d{2}:\d{2}$/),
})

// ─── Types inferidos ─────────────────────────────────────────────────────────
export type SignUpInput          = z.infer<typeof signUpSchema>
export type CadastrarAlunoInput  = z.infer<typeof cadastrarAlunoSchema>
export type CheckinInput         = z.infer<typeof checkinSchema>
export type UploadPagamentoInput = z.infer<typeof uploadPagamentoSchema>
export type RevisarPagamentoInput = z.infer<typeof revisarPagamentoSchema>
export type CriarAulaInput       = z.infer<typeof criarAulaSchema>
