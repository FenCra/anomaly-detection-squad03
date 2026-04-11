'use client'

import { useEffect, useState } from 'react'
import { fetchTransactions, Transaction } from '@/lib/api'
import TransactionModal from './TransactionModal'

interface TransactionsTableProps {
  limit?: number
  showPagination?: boolean
}

export default function TransactionsTable({ limit = 10, showPagination = false }: TransactionsTableProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const data = await fetchTransactions({ limit, skip: 0 })
        setTransactions(data.items)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadTransactions()
  }, [limit])

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Carregando transações...</div>
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Erro: {error}</div>
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left font-bold text-gray-800 uppercase text-xs tracking-wider">Data/Hora</th>
              <th className="px-6 py-4 text-left font-bold text-gray-800 uppercase text-xs tracking-wider">Comerciante</th>
              <th className="px-6 py-4 text-left font-bold text-gray-800 uppercase text-xs tracking-wider">Categoria</th>
              <th className="px-6 py-4 text-left font-bold text-gray-800 uppercase text-xs tracking-wider">Valor</th>
              <th className="px-6 py-4 text-left font-bold text-gray-800 uppercase text-xs tracking-wider">Localização</th>
              <th className="px-6 py-4 text-left font-bold text-gray-800 uppercase text-xs tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {transactions.map((transaction) => {
              const isFraude = transaction.is_fraude
              const statusClass = isFraude ? 'bg-red-500 text-white' : 'bg-green-400 text-white'
              const statusText = isFraude ? 'Negada' : 'Aprovada'
              
              return (
              <tr
                key={transaction.id}
                onClick={() => {
                  setSelectedTransaction(transaction)
                  setShowModal(true)
                }}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <td className="px-6 py-4 text-gray-600">
                  {new Date(transaction.data).toLocaleDateString('pt-BR')} {transaction.hora}
                </td>
                <td className="px-6 py-4 text-gray-900">
                  {transaction.estabelecimento}
                </td>
                <td className="px-6 py-4 text-gray-700">{transaction.categoria}</td>
                <td className="px-6 py-4 text-gray-900 font-medium">
                  R${transaction.valor.toFixed(2).replace('.', ',')}
                </td>
                <td className="px-6 py-4 text-gray-600">{transaction.cidade}</td>
                <td className="px-6 py-4">
                  <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold ${statusClass}`}>
                    {statusText}
                  </span>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>

      {showModal && selectedTransaction && (
        <TransactionModal
          transaction={selectedTransaction}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}
