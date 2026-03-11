import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import ProfNav from '@/components/professor/ProfNav'

export default async function ProfessorLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users').select('nome, perfil').eq('id', user.id).single()

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col max-w-[430px] mx-auto">
      <header className="px-5 pt-6 pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <div className="w-6 h-6 bg-red-700 rounded-lg flex items-center justify-center">
                <span className="font-display text-[11px] font-black text-white">JJ</span>
              </div>
              <span className="text-[11px] font-bold text-zinc-600 uppercase tracking-[0.1em]">Professor</span>
            </div>
            <h1 className="font-display text-lg font-black text-zinc-50">
              {profile?.nome?.split(' ')[0] ?? 'Professor'}
            </h1>
          </div>
          <form action="/api/auth/signout" method="POST">
            <button className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-400 px-3 py-1.5 rounded-lg transition-colors font-semibold">
              Sair
            </button>
          </form>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pb-28">
        {children}
      </main>

      <ProfNav />
    </div>
  )
}
