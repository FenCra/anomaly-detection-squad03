import type { Metadata } from 'next'
import './globals.css'
import Sidebar from '@/components/Sidebar'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Dashboard - Caça às Anomalias',
  description: 'Sistema de detecção de fraudes em transações bancárias',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="flex flex-col h-screen bg-bb-bg overflow-hidden font-sans">
        {/* Header (Top Bar) */}
        <header className="h-16 bg-bb-blue flex items-center justify-between px-6 z-20 shrink-0 shadow-md">
          <div className="flex gap-6 text-white font-medium">
            <Link href="/ajuda" className="cursor-pointer hover:text-blue-200 transition-colors">Ajuda</Link>
          </div>
          <div className="flex items-center">
            <img 
              src="/icone_banco_do_brasil_amarelo.png" 
              alt="Banco do Brasil" 
              className="h-12 w-auto"
            />
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden relative">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden ml-64 bg-gray-100">
            <main className="flex-1 overflow-auto p-8">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  )
}
