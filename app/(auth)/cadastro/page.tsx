'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function CadastroPage() {
  const router = useRouter()
  const supabase = createClient()

  const [form, setForm] = useState({ nome: '', email: '', perfil: 'ALUNO' as 'ALUNO' | 'PROFESSOR' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleCadastro(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithOtp({
      email: form.email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: { nome: form.nome, perfil: form.perfil },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push(`/login?cadastro=ok&email=${encodeURIComponent(form.email)}`)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-5">
      <div className="fixed inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="relative w-full max-w-sm fade-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-700 mb-4 red-glow">
            <span className="font-display text-xl font-black text-white">JJ</span>
          </div>
          <h1 className="font-display text-2xl font-black text-zinc-50 mb-1">Criar conta</h1>
          <p className="text-zinc-500 text-sm">Jiu-Jitsu para Todos</p>
        </div>

        <form onSubmit={handleCadastro} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 space-y-5">
          {/* Nome */}
          <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Nome completo</label>
            <input
              type="text"
              value={form.nome}
              onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
              placeholder="Seu nome"
              required
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 text-sm placeholder:text-zinc-700 focus:outline-none focus:border-red-700 transition-colors"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">E-mail</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="seu@email.com"
              required
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 text-sm placeholder:text-zinc-700 focus:outline-none focus:border-red-700 transition-colors"
            />
          </div>

          {/* Perfil */}
          <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Perfil</label>
            <div className="grid grid-cols-2 gap-2">
              {(['ALUNO', 'PROFESSOR'] as const).map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, perfil: p }))}
                  className={`py-3 rounded-xl border text-sm font-bold transition-all ${
                    form.perfil === p
                      ? 'bg-red-700 border-red-600 text-white red-glow'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-600'
                  }`}
                >
                  {p === 'ALUNO' ? '🥋 Aluno' : '👨‍🏫 Professor'}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-950/50 border border-red-900 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !form.nome || !form.email}
            className="w-full bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors text-sm"
          >
            {loading ? 'Criando conta...' : 'Criar conta'}
          </button>

          <p className="text-center text-xs text-zinc-600">
            Já tem conta?{' '}
            <Link href="/login" className="text-red-400 hover:text-red-300 transition-colors">
              Entrar
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
