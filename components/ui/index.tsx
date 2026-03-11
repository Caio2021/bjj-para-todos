// components/ui/index.tsx — Biblioteca de componentes compartilhados

'use client'

import { useState, useRef } from 'react'

// ─── Badge / Pill ─────────────────────────────────────────────────────────────
const pillMap: Record<string, string> = {
  EM_DIA:    'bg-emerald-950 text-emerald-400 border-emerald-800',
  PENDENTE:  'bg-amber-950 text-amber-400 border-amber-800',
  ATRASADO:  'bg-red-950 text-red-400 border-red-800',
  APROVADO:  'bg-emerald-950 text-emerald-400 border-emerald-800',
  REJEITADO: 'bg-red-950 text-red-400 border-red-800',
  ATIVO:     'bg-emerald-950 text-emerald-400 border-emerald-800',
  INATIVO:   'bg-zinc-800 text-zinc-500 border-zinc-700',
  PROFESSOR: 'bg-red-950 text-red-400 border-red-800',
  ALUNO:     'bg-sky-950 text-sky-400 border-sky-800',
}

const pillLabel: Record<string, string> = {
  EM_DIA: 'Em dia', PENDENTE: 'Pendente', ATRASADO: 'Atrasado',
  APROVADO: 'Aprovado', REJEITADO: 'Rejeitado',
  ATIVO: 'Ativo', INATIVO: 'Inativo',
  PROFESSOR: 'Professor', ALUNO: 'Aluno',
}

export function Badge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${pillMap[status] ?? 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>
      {pillLabel[status] ?? status}
    </span>
  )
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
export function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const s = { sm: 'w-8 h-8 text-xs rounded-lg', md: 'w-10 h-10 text-sm rounded-xl', lg: 'w-14 h-14 text-lg rounded-2xl' }[size]
  const initials = name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
  return (
    <div className={`${s} bg-gradient-to-br from-red-800 to-red-600 flex items-center justify-center font-display font-black text-white flex-shrink-0`}>
      {initials}
    </div>
  )
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, className = '', onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`bg-[#111] border border-[#1f1f1f] rounded-2xl p-4 ${onClick ? 'cursor-pointer card-hover' : ''} ${className}`}
    >
      {children}
    </div>
  )
}

// ─── Button ───────────────────────────────────────────────────────────────────
type BtnVariant = 'primary' | 'ghost' | 'success' | 'danger' | 'outline'
const btnStyles: Record<BtnVariant, string> = {
  primary: 'bg-red-700 hover:bg-red-600 text-white red-glow',
  ghost:   'bg-zinc-800 hover:bg-zinc-700 text-zinc-200',
  success: 'bg-emerald-900 hover:bg-emerald-800 text-emerald-300',
  danger:  'bg-red-950 hover:bg-red-900 text-red-400',
  outline: 'border border-zinc-700 hover:border-zinc-500 text-zinc-400 bg-transparent',
}

export function Button({
  children, onClick, variant = 'primary', disabled, loading, className = '', type = 'button', fullWidth = true,
}: {
  children: React.ReactNode
  onClick?: () => void
  variant?: BtnVariant
  disabled?: boolean
  loading?: boolean
  className?: string
  type?: 'button' | 'submit'
  fullWidth?: boolean
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${fullWidth ? 'w-full' : ''} flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-display font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${btnStyles[variant]} ${className}`}
    >
      {loading ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : children}
    </button>
  )
}

// ─── Input ────────────────────────────────────────────────────────────────────
export function Input({
  label, value, onChange, placeholder, type = 'text', required,
}: {
  label?: string; value: string; onChange: (v: string) => void
  placeholder?: string; type?: string; required?: boolean
}) {
  return (
    <div>
      {label && <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">{label}</label>}
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} required={required}
        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 text-sm placeholder:text-zinc-700 focus:outline-none focus:border-red-700 transition-colors"
      />
    </div>
  )
}

// ─── Modal ────────────────────────────────────────────────────────────────────
export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-[#141414] border border-zinc-800 rounded-2xl w-full max-w-sm max-h-[88vh] overflow-y-auto fade-up">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <span className="font-display font-bold text-base text-zinc-100">{title}</span>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-400 transition-colors text-lg leading-none">×</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

// ─── Toast ────────────────────────────────────────────────────────────────────
export function Toast({ msg, type = 'success' }: { msg: string; type?: 'success' | 'error' }) {
  const bg = type === 'success' ? 'bg-emerald-900 border-emerald-700 text-emerald-300' : 'bg-red-950 border-red-800 text-red-400'
  return (
    <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 ${bg} border rounded-xl px-5 py-3 text-sm font-bold whitespace-nowrap z-50 fade-up shadow-xl`}>
      {msg}
    </div>
  )
}

// ─── Section Header ───────────────────────────────────────────────────────────
export function SectionHeader({ label, action, onAction }: { label: string; action?: string; onAction?: () => void }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <span className="text-[11px] font-bold text-zinc-600 uppercase tracking-[0.08em]">{label}</span>
      {action && <button onClick={onAction} className="text-xs font-bold text-red-500 hover:text-red-400 transition-colors">{action}</button>}
    </div>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────
export function EmptyState({ icon, message }: { icon: string; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <span className="text-4xl mb-3">{icon}</span>
      <p className="text-zinc-600 text-sm">{message}</p>
    </div>
  )
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
export function StatCard({ label, value, color = 'text-zinc-100' }: { label: string; value: string | number; color?: string }) {
  return (
    <Card className="text-center py-4">
      <div className={`font-display text-3xl font-black ${color} leading-none`}>{value}</div>
      <div className="text-[11px] text-zinc-600 font-semibold uppercase tracking-wider mt-1.5">{label}</div>
    </Card>
  )
}

// ─── Belt Progress ────────────────────────────────────────────────────────────
const FAIXAS = [
  { nome: 'Branca',  cor: '#e5e7eb', aulasPorGrau: 40 },
  { nome: 'Cinza',   cor: '#9ca3af', aulasPorGrau: 50 },
  { nome: 'Amarela', cor: '#fbbf24', aulasPorGrau: 60 },
  { nome: 'Laranja', cor: '#f97316', aulasPorGrau: 70 },
  { nome: 'Verde',   cor: '#22c55e', aulasPorGrau: 80 },
]

export function BeltCard({ faixa, grau, aulasNoGrau, totalAulas }: {
  faixa: number; grau: number; aulasNoGrau: number; totalAulas: number
}) {
  const f = FAIXAS[faixa] ?? FAIXAS[0]
  const pct = Math.min(100, Math.round((aulasNoGrau / f.aulasPorGrau) * 100))
  const faltam = Math.max(0, f.aulasPorGrau - aulasNoGrau)

  return (
    <div
      className="rounded-2xl p-6 relative overflow-hidden"
      style={{ background: `linear-gradient(135deg, #111 0%, ${f.cor}18 100%)`, border: `1px solid ${f.cor}33` }}
    >
      {/* Watermark */}
      <div className="absolute right-4 top-2 font-display text-[88px] font-black opacity-[0.05] leading-none select-none pointer-events-none"
        style={{ color: f.cor }}>BJJ</div>

      <div className="relative">
        <p className="text-[11px] font-bold text-zinc-600 uppercase tracking-[0.08em] mb-1">Sua progressão</p>
        <h2 className="font-display text-2xl font-black mb-1" style={{ color: f.cor }}>Faixa {f.nome}</h2>

        {/* Grau dots */}
        <div className="flex gap-1.5 mb-5">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="w-4 h-4 rounded-full border-2 transition-all"
              style={{ backgroundColor: i < grau ? f.cor : 'transparent', borderColor: f.cor }} />
          ))}
        </div>

        {/* Progress bar */}
        <div className="mb-1.5">
          <div className="flex justify-between text-xs text-zinc-500 mb-2">
            <span>{grau}º grau → {grau + 1}º grau</span>
            <span>{aulasNoGrau} / {f.aulasPorGrau} aulas</span>
          </div>
          <div className="h-2.5 bg-zinc-900 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full belt-progress-bar"
              style={{ width: `${pct}%`, background: f.cor, boxShadow: `0 0 8px ${f.cor}88` }}
            />
          </div>
        </div>

        <p className="text-sm text-zinc-400 mt-3">
          <span className="font-display font-bold text-white text-base">{faltam}</span> aulas para o próximo grau
          <span className="ml-3 text-zinc-600">· {totalAulas} total</span>
        </p>
      </div>
    </div>
  )
}

// ─── File Upload ──────────────────────────────────────────────────────────────
export function FileUpload({ onFile, accept = 'image/*,.pdf' }: { onFile: (file: File) => void; accept?: string }) {
  const ref = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState<string | null>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) { setFileName(file.name); onFile(file) }
  }

  return (
    <>
      <input ref={ref} type="file" accept={accept} onChange={handleChange} className="hidden" />
      <div
        onClick={() => ref.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${fileName ? 'border-emerald-700 bg-emerald-950/20' : 'border-zinc-800 hover:border-red-800'}`}
      >
        <div className="text-3xl mb-2">{fileName ? '✅' : '📎'}</div>
        <p className="text-sm font-semibold text-zinc-300">{fileName ?? 'Clique para selecionar'}</p>
        <p className="text-xs text-zinc-600 mt-1">JPG, PNG ou PDF · máx 5 MB</p>
      </div>
    </>
  )
}
