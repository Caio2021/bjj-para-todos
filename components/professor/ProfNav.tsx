'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { href: '/professor',            label: 'Alunos',    icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
    </svg>
  )},
  { href: '/professor/checkin',    label: 'Check-in',  icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/>
      <path strokeLinecap="round" d="M14 14h3m0 0h3m-3 0v3m0-3V14"/>
    </svg>
  )},
  { href: '/professor/pagamentos', label: 'Pgtos',     icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
    </svg>
  )},
]

export default function ProfNav() {
  const path = usePathname()
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-[#0f0f0f]/95 backdrop-blur border-t border-zinc-900 flex px-2 py-2 z-40">
      {tabs.map(t => {
        const active = t.href === '/professor' ? path === t.href : path.startsWith(t.href)
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
