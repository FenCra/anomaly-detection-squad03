'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'

import { DashboardIcon, TransactionsIcon, FlaskIcon } from './Icons'

const menuItems = [
  { href: '/', label: 'Dashboard', icon: DashboardIcon },
  { href: '/transactions', label: 'Transações', icon: TransactionsIcon },
  { href: '/laboratorio', label: 'Laboratório ML', icon: FlaskIcon },
]

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
      <aside className={clsx(
        "w-64 bg-gray-50 border-r border-gray-200 fixed h-full flex flex-col z-50 lg:z-10 pt-4 top-0 lg:top-16 transition-transform duration-300 shadow-xl lg:shadow-none",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Cabeçalho do Mobile (Logo e Botão Fechar) */}
        <div className="flex items-center justify-between px-6 mb-4 lg:hidden">
          <img src="/icone_banco_do_brasil_amarelo.png" alt="Banco do Brasil" className="h-8 w-auto filter invert brightness-0" />
          <button onClick={onClose} className="p-2 -mr-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-200 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="flex-1 px-4 mt-6">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  // Fecha a sidebar no mobile ao clicar em um link
                  if (window.innerWidth < 1024) onClose();
                }}
                className={clsx(
                  'flex items-center gap-3 px-4 py-3 mb-2 rounded-lg transition-colors font-semibold text-sm',
                  isActive
                    ? 'bg-blue-100 text-bb-blue'
                    : 'text-gray-600 hover:bg-gray-200'
                )}
              >
                <span className={clsx("flex items-center", isActive ? 'text-bb-blue' : 'text-gray-400')}>
                  <Icon />
                </span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* User Profile Footer */}
        <div className="p-6 border-t border-gray-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-300 shrink-0"></div>
          <div className="overflow-hidden">
            <div className="flex items-center gap-1">
              <span className="font-bold text-gray-900 text-sm truncate">Analista_03</span>
              <span className="text-bb-blue text-xs"></span>
            </div>
            <p className="text-xs text-gray-500 truncate">usersquad3@gmail.com</p>
          </div>
        </div>
      </aside>
  )
}
