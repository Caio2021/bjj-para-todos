import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

async function escolherPerfil(formData: FormData) {
  'use server'
  const perfil = formData.get('perfil') as string
  if (perfil !== 'PROFESSOR' && perfil !== 'ALUNO') return

  const cookieStore = await cookies()
  cookieStore.set('dev_perfil', perfil, { path: '/', maxAge: 60 * 60 * 24 * 30 })
  redirect(perfil === 'PROFESSOR' ? '/professor' : '/aluno')
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-5">
      {/* Background grid */}
      <div
        className="fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative w-full max-w-sm fade-up">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-700 mb-4 red-glow-lg">
            <span className="font-display text-2xl font-black text-white">JJ</span>
          </div>
          <h1 className="font-display text-3xl font-black text-zinc-50 mb-1">
            Jiu-Jitsu para Todos
          </h1>
          <p className="text-zinc-500 text-sm">Escolha como deseja entrar</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 space-y-4">
          <form action={escolherPerfil}>
            <button
              name="perfil"
              value="PROFESSOR"
              className="w-full bg-red-700 hover:bg-red-600 text-white font-bold py-4 rounded-xl transition-colors red-glow text-sm mb-3"
            >
              Entrar como Professor
            </button>
            <button
              name="perfil"
              value="ALUNO"
              className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-bold py-4 rounded-xl transition-colors text-sm"
            >
              Entrar como Aluno
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
