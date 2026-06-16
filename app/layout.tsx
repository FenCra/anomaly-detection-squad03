import type { Metadata } from 'next'
import './globals.css'
import AppShell from '@/components/AppShell'

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
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  )
}
