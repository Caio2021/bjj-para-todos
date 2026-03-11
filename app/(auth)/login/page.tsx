'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-5">
      {/* Background grid */}
      <div className="fixed inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="relative w-full max-w-sm fade-up">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-700 mb-4 red-glow-lg">
            <span className="font-display text-2xl font-black text-white">JJ</span>
          </div>
          <h1 className="font-display text-3xl font-black text-zinc-50 mb-1">
            Jiu-Jitsu para Todos
          </h1>
          <p className="text-zinc-500 text-sm">Entre com seu e-mail para continuar</p>
        </div>

        {sent ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
            <div className="text-5xl mb-4">📬</div>
            <h2 className="font-display font-bold text-lg text-zinc-100 mb-2">
              Verifique seu e-mail
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Enviamos um link de acesso para <strong className="text-zinc-200">{email}</strong>.
              Clique no link para entrar.
            </p>
            <button
              onClick={() => setSent(false)}
              className="mt-6 text-sm text-red-400 hover:text-red-300 transition-colors"
            >
              Usar outro e-mail
            </button>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 text-sm placeholder:text-zinc-700 focus:outline-none focus:border-red-700 transition-colors"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-950/50 border border-red-900 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full bg-red-700 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors red-glow text-sm"
            >
              {loading ? 'Enviando...' : 'Entrar com magic link'}
            </button>

            <p className="text-center text-xs text-zinc-600">
              Não tem conta?{' '}
              <Link href="/cadastro" className="text-red-400 hover:text-red-300 transition-colors">
                Cadastre-se
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
