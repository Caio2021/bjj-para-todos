'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { href: '/aluno',            label: 'Início',   icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg> },
  { href: '/aluno/qr',         label: 'Meu QR',   icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path strokeLinecap="round" d="M14 14h3m0 0h3m-3 0v3m0-3V14"/></svg> },
  { href: '/aluno/pagamentos', label: 'Pgtos',    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/></svg> },
]

export default function AlunoNav() {
  const path = usePathname()
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-[#0f0f0f]/95 backdrop-blur border-t border-zinc-900 flex px-2 py-2 z-40">
      {tabs.map(t => {
        const active = t.href === '/aluno' ? path === t.href : path.startsWith(t.href)
        return (
          <Link key={t.href} href={t.href}
            className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl transition-colors ${active ? 'text-red-500' : 'text-zinc-600 hover:text-zinc-400'}`}>
            {t.icon}
            <span className="text-[10px] font-bold">{t.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
