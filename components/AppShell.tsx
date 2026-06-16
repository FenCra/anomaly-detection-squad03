'use client'

import { useState } from 'react'
import Link from 'next/link'
import Sidebar from './Sidebar'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <>
      {/* ===== HEADER ===== */}
      <header className="h-16 bg-bb-blue flex items-center justify-between px-4 md:px-6 z-40 shrink-0 shadow-md">
        <div className="flex items-center gap-3">
          {/* Botão hambúrguer — visível somente em telas menores que lg */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-blue-700 transition-colors"
            aria-label="Abrir menu de navegação"
          >
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Link href="/ajuda" className="text-white font-medium hover:text-blue-200 transition-colors text-sm">
            Ajuda
          </Link>
        </div>
        <div className="flex items-center">
          <img
            src="/icone_banco_do_brasil_amarelo.png"
            alt="Banco do Brasil"
            className="h-12 w-auto"
          />
        </div>
      </header>

      {/* ===== CORPO (Sidebar + Conteúdo) ===== */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* Overlay escuro ao abrir o menu no mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Conteúdo principal — em telas grandes, recua 256px da sidebar fixa */}
        <div className="flex-1 flex flex-col overflow-hidden lg:ml-64 bg-gray-100">
          <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </>
  )
}
