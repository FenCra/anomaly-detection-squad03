'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'

import { DashboardIcon, TransactionsIcon } from './Icons'

const menuItems = [
  { href: '/', label: 'Dashboard', icon: DashboardIcon },
  { href: '/transactions', label: 'Transações', icon: TransactionsIcon },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
      <aside className="w-64 bg-gray-50 border-r border-gray-200 fixed h-full flex flex-col z-10 pt-4 top-16">
        <nav className="flex-1 px-4 mt-6">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
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
              <span className="font-bold text-gray-900 text-sm truncate">Usuário_1</span>
              <span className="text-bb-blue text-xs">✔️</span>
            </div>
            <p className="text-xs text-gray-500 truncate">usersquad3@gmail.com</p>
          </div>
        </div>
      </aside>
  )
}
