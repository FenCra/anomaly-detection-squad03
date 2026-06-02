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
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [contasDisponiveis, setContasDisponiveis] = useState<string[]>([])
  const [cidadesDisponiveis, setCidadesDisponiveis] = useState<string[]>([])

  useEffect(() => {
    // Buscar contas
    fetch('/api/ml/transacoes/contas')
      .then(res => res.json())
      .then(data => {
        if (data.contas && Array.isArray(data.contas)) {
          const contasUnicas = Array.from(new Set(data.contas)) as string[]
          setContasDisponiveis(contasUnicas)
        }
      })
      .catch(err => console.error("Falha ao buscar contas:", err))

    fetchTransactions({ limit: 30000 })
      .then(res => {
        if (res.items && Array.isArray(res.items)) {
          const cidadesUnicas = Array.from(new Set(res.items.map(t => t.cidade).filter(Boolean))) as string[]
          setCidadesDisponiveis(cidadesUnicas.sort())
        }
      })
      .catch(err => console.error("Falha ao buscar cidades dinamicamente:", err))
  }, [])

  const loadTransactions = async (activeFilters: Filters, page: number, size: number) => {
    setLoading(true)
    setError(null)
    try {
      const params: Record<string, any> = {
        limit: size,
        skip: page * size,
        ...activeFilters,
      }

      Object.keys(params).forEach((key) => {
        if (params[key] === undefined || params[key] === '' || params[key] === 'all') {
          delete params[key]
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

  const handleFilterChange = (key: keyof Filters, value: any) => {
    const newFilters = { ...filters, [key]: value }
    if (value === '' || value === 'all' || value === undefined) {
      delete newFilters[key]
    }
    setFilters(newFilters)
    setCurrentPage(0)
    loadTransactions(newFilters, 0, pageSize)
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFilterChange('search', e.target.value)
  }

  const goToPage = (page: number) => {
    setCurrentPage(page)
    loadTransactions(filters, page, pageSize)
  }

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    setCurrentPage(0)
    loadTransactions(filters, 0, newSize)
  }

  useEffect(() => {
    loadTransactions(filters, 0, pageSize)
  }, [])

  const handleFilter = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setCurrentPage(0)
    loadTransactions(filters, 0, pageSize)
    setShowFilters(false)
  }

  const handleClearFilters = () => {
    setFilters({})
    setCurrentPage(0)
    loadTransactions({}, 0, pageSize)
  }

  const handleCreateSuccess = () => {
    setShowCreateModal(false)
    loadTransactions(filters, currentPage, pageSize)
  }

  const totalPages = Math.ceil(total / pageSize) || 1

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 flex flex-wrap items-center gap-3">
        {/* Search Bar */}
        <div className="flex-1 min-w-[200px] relative px-4 flex items-center">
          <input
            type="text"
            placeholder="Procure uma transação..."
            value={filters.search || ''}
            onChange={handleSearch}
            className="w-full bg-transparent outline-none text-gray-700 text-sm font-medium placeholder-gray-400 py-2"
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
              value={filters.conta || 'all'}
              onChange={(e) => handleFilterChange('conta', e.target.value)}
            >
              <option value="all">Todas as Contas</option>
              {contasDisponiveis.map(c => <option key={c} value={c}>Conta {c}</option>)}
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-xs text-gray-400">▼</span>
          </div>

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
              {cidadesDisponiveis.map(c => <option key={c} value={c}>{c}</option>)}
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
              <option value="negada">Negada</option>
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-xs text-gray-400">▼</span>
          </div>
          
          <div className="relative">
            <button
              onClick={() => setShowDatePicker((v) => !v)}
              className={`px-5 py-2.5 border rounded-full text-sm font-bold flex items-center gap-2 transition-colors ${
                filters.data_inicio || filters.data_fim
                  ? 'bg-blue-100 border-blue-200 text-blue-700 hover:bg-blue-200'
                  : 'bg-gray-50 border-gray-100 text-gray-700 hover:bg-gray-100'
              }`}
            >
              {filters.data_inicio || filters.data_fim
                ? `${filters.data_inicio || '...'} → ${filters.data_fim || '...'}`
                : 'Período'}
              <span className="text-gray-400 w-4 h-4"><CalendarIcon /></span>
            </button>

            {showDatePicker && (
              <div className="absolute top-full mt-2 left-0 z-50 bg-white border border-gray-200 rounded-2xl shadow-xl p-4 w-72">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Filtrar por período</p>
                <div className="flex flex-col gap-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">De</label>
                    <input
                      type="date"
                      value={filters.data_inicio || ''}
                      onChange={(e) => handleFilterChange('data_inicio', e.target.value || undefined)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Até</label>
                    <input
                      type="date"
                      value={filters.data_fim || ''}
                      onChange={(e) => handleFilterChange('data_fim', e.target.value || undefined)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer"
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => {
                      handleFilterChange('data_inicio', undefined)
                      handleFilterChange('data_fim', undefined)
                      setShowDatePicker(false)
                    }}
                    className="flex-1 py-2 text-xs font-semibold text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    Limpar
                  </button>
                  <button
                    onClick={() => setShowDatePicker(false)}
                    className="flex-1 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    Aplicar
                  </button>
                </div>
              </div>
            )}
          </div>
          
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
      <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/40 border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-900">Histórico de Transações</h2>
          <p className="text-sm font-medium text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm">
            Mostrando <strong>{currentPage * pageSize + transactions.length}</strong> de{' '}
            <strong>{total}</strong>
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
                <thead className="bg-gray-50/80 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left font-bold text-gray-800 uppercase text-xs tracking-wider">Data/Hora</th>
                    <th className="px-6 py-4 text-left font-bold text-gray-800 uppercase text-xs tracking-wider">Comerciante</th>
                    <th className="px-6 py-4 text-left font-bold text-gray-800 uppercase text-xs tracking-wider">Categoria</th>
                    <th className="px-6 py-4 text-left font-bold text-gray-800 uppercase text-xs tracking-wider">Valor</th>
                    <th className="px-6 py-4 text-left font-bold text-gray-800 uppercase text-xs tracking-wider">Localização</th>
                    <th className="px-6 py-4 text-left font-bold text-gray-800 uppercase text-xs tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 bg-white">
                  {transactions.map((transaction) => {
                    const isFraude = transaction.is_fraude
                    const statusClass = isFraude ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'
                    const statusText = isFraude ? 'Negada / Fraude' : 'Aprovada'
                    
                    return (
                    <tr
                      key={transaction.id}
                      onClick={() => {
                        setSelectedTransaction(transaction)
                        setShowModal(true)
                      }}
                      className="hover:bg-gray-50/80 cursor-pointer transition-colors group"
                    >
                      <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                        {new Date(transaction.data).toLocaleDateString('pt-BR')} <span className="text-gray-400 text-xs ml-1">{transaction.hora}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-900 font-semibold group-hover:text-blue-600 transition-colors">
                        {transaction.estabelecimento}
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md text-xs font-medium">{transaction.categoria}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-900 font-semibold">
                        R$ {transaction.valor.toFixed(2).replace('.', ',')}
                      </td>
                      <td className="px-6 py-4 text-gray-600">{transaction.cidade}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center justify-center w-32 px-3 py-1.5 rounded-xl text-xs font-bold border ${statusClass}`}>
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
                    onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
                    className="ml-2 px-2 py-1 border border-gray-300 rounded"
                  >
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                  </select>
                </label>
                <span className="text-sm text-gray-500">
                  {total} resultado{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => goToPage(0)}
                  disabled={currentPage === 0}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center p-2 text-gray-500"
                >
                  <ChevronsLeftIcon />
                </button>
                <button
                  onClick={() => goToPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center p-2 text-gray-500"
                >
                  <ChevronLeftIcon />
                </button>
                <span className="text-sm text-gray-600">
                  Página {currentPage + 1} de {totalPages}
                </span>
                <button
                  onClick={() => goToPage(Math.min(totalPages - 1, currentPage + 1))}
                  disabled={currentPage >= totalPages - 1}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center p-2 text-gray-500"
                >
                  <ChevronRightIcon />
                </button>
                <button
                  onClick={() => goToPage(totalPages - 1)}
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
