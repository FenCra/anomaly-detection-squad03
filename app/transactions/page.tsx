'use client'

import { useState, useEffect } from 'react'
import { fetchTransactions, Transaction } from '@/lib/api'
import TransactionModal from '@/components/TransactionModal'
import CreateTransactionModal from '@/components/CreateTransactionModal'

import { SearchIcon, CalendarIcon, ChevronLeftIcon, ChevronRightIcon, ChevronsLeftIcon, ChevronsRightIcon } from '@/components/Icons'

const CATEGORIES = [
  'Alimentacao',
  'Transporte',
  'Saude',
  'Educacao',
  'Compras',
  'Lazer',
  'Utilidades',
  'Investimento',
]

const CITIES = [
  'Sao Paulo',
  'Rio de Janeiro',
  'Belo Horizonte',
  'Curitiba',
  'Salvador',
  'Brasilia',
  'Manaus',
  'Recife',
  'Porto Alegre',
  'Fortaleza',
  'Campinas',
]

const TRANSACTION_TYPES = ['debito', 'credito', 'transferencia']
const DEVICES = ['celular', 'web', 'caixa', 'smartwatch']

interface Filters {
  categoria?: string
  cidade?: string
  valor_min?: number
  valor_max?: number
  tipo_transacao?: string
  dispositivo?: string
  data_inicio?: string
  data_fim?: string
  conta?: string
  search?: string
  status?: string
  is_fraude?: boolean
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<Filters>({})
  const [showFilters, setShowFilters] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)

  const handleFilterChange = (key: keyof Filters, value: any) => {
    const newFilters = { ...filters, [key]: value }
    if (value === '' || value === 'all' || value === undefined) {
      delete newFilters[key]
    }
    setFilters(newFilters)
    setCurrentPage(0)
    loadTransactions(newFilters)
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFilterChange('search', e.target.value)
  }

  const loadTransactions = async (newFilters?: Filters) => {
    setLoading(true)
    try {
      const params = {
        limit: pageSize,
        skip: currentPage * pageSize,
        ...newFilters,
      }

      Object.keys(params).forEach((key) => {
        if (params[key as keyof typeof params] === undefined || params[key as keyof typeof params] === '') {
          delete params[key as keyof typeof params]
        }
      })

      const data = await fetchTransactions(params)
      setTransactions(data.items)
      setTotal(data.total)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTransactions(filters)
  }, [currentPage, pageSize])

  const handleFilter = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setCurrentPage(0)
    loadTransactions(filters)
    setShowFilters(false)
  }

  const handleClearFilters = () => {
    setFilters({})
    setCurrentPage(0)
    loadTransactions({})
  }

  const handleCreateSuccess = () => {
    setShowCreateModal(false)
    loadTransactions(filters)
  }

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-full shadow-sm p-2 flex flex-wrap items-center gap-3">
        {/* Search Bar */}
        <div className="flex-1 min-w-[200px] relative px-4 flex items-center">
          <input
            type="text"
            placeholder="Procure uma transação..."
            value={filters.search || ''}
            onChange={handleSearch}
            className="w-full bg-transparent outline-none text-gray-700 text-sm font-medium placeholder-gray-500 py-2"
          />
          <span className="text-gray-400 absolute right-4"><SearchIcon /></span>
        </div>

        {/* Vertical Divider */}
        <div className="w-px h-8 bg-gray-200 hidden md:block"></div>

        {/* Filter Selects & Pills */}
        <div className="flex flex-wrap items-center gap-2 pr-2">
          
          <div className="relative">
            <select
              className="appearance-none px-5 py-2.5 bg-gray-50 border border-gray-100 rounded-full text-sm font-bold text-gray-700 hover:bg-gray-100 cursor-pointer outline-none focus:ring-2 focus:ring-blue-100 pr-8"
              value={filters.categoria || 'all'}
              onChange={(e) => handleFilterChange('categoria', e.target.value)}
            >
              <option value="all">Categoria</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-xs text-gray-400">▼</span>
          </div>
          
          <div className="relative">
            <select
              className="appearance-none px-5 py-2.5 bg-gray-50 border border-gray-100 rounded-full text-sm font-bold text-gray-700 hover:bg-gray-100 cursor-pointer outline-none focus:ring-2 focus:ring-blue-100 pr-8"
              value={filters.valor_max?.toString() || 'all'}
              onChange={(e) => handleFilterChange('valor_max', e.target.value)}
            >
              <option value="all">Faixa de valor</option>
              <option value="50">Até R$50</option>
              <option value="200">Até R$200</option>
              <option value="1000">Até R$1.000</option>
              <option value="5000">Até R$5.000</option>
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-xs text-gray-400">▼</span>
          </div>
          
          <div className="relative">
            <select
              className="appearance-none px-5 py-2.5 bg-gray-50 border border-gray-100 rounded-full text-sm font-bold text-gray-700 hover:bg-gray-100 cursor-pointer outline-none focus:ring-2 focus:ring-blue-100 pr-8"
              value={filters.cidade || 'all'}
              onChange={(e) => handleFilterChange('cidade', e.target.value)}
            >
              <option value="all">Localização</option>
              {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-xs text-gray-400">▼</span>
          </div>
          
          <div className="relative">
            <select
              className="appearance-none px-5 py-2.5 bg-gray-50 border border-gray-100 rounded-full text-sm font-bold text-gray-700 hover:bg-gray-100 cursor-pointer outline-none focus:ring-2 focus:ring-blue-100 pr-8"
              value={filters.status || 'all'}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="all">Status</option>
              <option value="aprovada">Aprovada</option>
              <option value="normal">Normal</option>
              <option value="bloqueada">Bloqueada</option>
              <option value="anomalia">Anomalia (Revisão)</option>
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-xs text-gray-400">▼</span>
          </div>
          
          <button className="px-5 py-2.5 bg-gray-50 border border-gray-100 rounded-full text-sm font-bold text-gray-700 hover:bg-gray-100 flex items-center gap-2">
            Período
            <span className="text-gray-400 w-4 h-4"><CalendarIcon /></span>
          </button>
          
          <button 
            onClick={() => handleFilterChange('is_fraude', filters.is_fraude ? undefined : true)}
            className={`px-5 py-2.5 border rounded-full text-sm font-bold transition-colors ${
              filters.is_fraude 
                ? 'bg-red-100 border-red-200 text-red-700 hover:bg-red-200' 
                : 'bg-gray-50 border-gray-100 text-gray-700 hover:bg-gray-100'
            }`}
          >
            Somente Anomalias
          </button>
        </div>
      </div>

      {/* Resultados */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <p className="text-sm text-gray-600">
            Mostrando <strong>{Math.min(pageSize, transactions.length)}</strong> de{' '}
            <strong>{total}</strong> transações
          </p>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Carregando...</div>
        ) : transactions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Nenhuma transação encontrada</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-300 border-b border-gray-400">
                  <tr>
                    <th className="px-6 py-4 text-left font-bold text-gray-800 uppercase text-xs tracking-wider">Data/Hora</th>
                    <th className="px-6 py-4 text-left font-bold text-gray-800 uppercase text-xs tracking-wider">Comerciante</th>
                    <th className="px-6 py-4 text-left font-bold text-gray-800 uppercase text-xs tracking-wider">Categoria</th>
                    <th className="px-6 py-4 text-left font-bold text-gray-800 uppercase text-xs tracking-wider">Valor</th>
                    <th className="px-6 py-4 text-left font-bold text-gray-800 uppercase text-xs tracking-wider">Localização</th>
                    <th className="px-6 py-4 text-left font-bold text-gray-800 uppercase text-xs tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white border-x border-b border-gray-200">
                  {transactions.map((transaction) => {
                    const isFraude = transaction.is_fraude
                    const statusText = isFraude ? 'Anomalia' : 'Aprovada'
                    
                    let statusClass = 'bg-green-400 text-white'
                    if (isFraude) statusClass = 'bg-yellow-500 text-white text-[10px]'
                    
                    return (
                    <tr
                      key={transaction.id}
                      onClick={() => {
                        setSelectedTransaction(transaction)
                        setShowModal(true)
                      }}
                      className="hover:bg-gray-100 cursor-pointer transition-colors"
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
                        <span className={`inline-block w-32 text-center px-4 py-2 rounded-full text-xs font-bold shadow-sm ${statusClass}`}>
                          {statusText}
                        </span>
                      </td>
                    </tr>
                  )})}
                </tbody>
              </table>
            </div>

            {/* Paginação */}
            <div className="px-4 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <label className="text-sm text-gray-600">
                  Itens por página:
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(parseInt(e.target.value))
                      setCurrentPage(0)
                    }}
                    className="ml-2 px-2 py-1 border border-gray-300 rounded"
                  >
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                  </select>
                </label>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(0)}
                  disabled={currentPage === 0}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center p-2 text-gray-500"
                >
                  <ChevronsLeftIcon />
                </button>
                <button
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center p-2 text-gray-500"
                >
                  <ChevronLeftIcon />
                </button>
                <span className="text-sm text-gray-600">
                  Página {currentPage + 1} de {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                  disabled={currentPage >= totalPages - 1}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center p-2 text-gray-500"
                >
                  <ChevronRightIcon />
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages - 1)}
                  disabled={currentPage >= totalPages - 1}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center p-2 text-gray-500"
                >
                  <ChevronsRightIcon />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {showModal && selectedTransaction && (
        <TransactionModal
          transaction={selectedTransaction as unknown as Transaction}
          onClose={() => setShowModal(false)}
        />
      )}

      {showCreateModal && (
        <CreateTransactionModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}
    </div>
  )
}
