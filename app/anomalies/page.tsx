'use client'

import { useEffect, useState } from 'react'
import { fetchAnomalies, Anomaly } from '@/lib/api'
import KPICard from '@/components/KPICard'
import ChartCard from '@/components/ChartCard'
import TransactionModal from '@/components/TransactionModal'
import { fetchTransaction, Transaction } from '@/lib/api'

const RULES = ['valor_anomalo', 'cidade_incomum', 'burst_transacoes']

export default function AnomaliesPage() {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRule, setSelectedRule] = useState<string | null>(null)
  const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(null)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)

  useEffect(() => {
    const loadAnomalies = async () => {
      try {
        const response = await fetchAnomalies(selectedRule ? { regra: selectedRule } : {})
        setAnomalies(response.items)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadAnomalies()
  }, [selectedRule])

  const handleAnomalyClick = async (anomaly: Anomaly) => {
    try {
      const transaction = await fetchTransaction(anomaly.id)
      setSelectedTransaction(transaction)
      setShowModal(true)
    } catch (err) {
      console.error('Error fetching transaction:', err)
    }
  }

  const severityDistribution = [
    { name: 'Alta', value: anomalies.filter((a) => a.severidade === 'alta').length },
    { name: 'Média', value: anomalies.filter((a) => a.severidade === 'media').length },
    { name: 'Baixa', value: anomalies.filter((a) => a.severidade === 'baixa').length },
  ]

  const ruleDistribution = RULES.map((rule) => ({
    name: rule,
    value: anomalies.filter((a) => a.regra === rule).length,
  }))

  const severityBadge = (severity: string) => {
    const badges: Record<string, { color: string; icon: string }> = {
      alta: { color: 'bg-red-100 text-red-800', icon: '🔴' },
      media: { color: 'bg-yellow-100 text-yellow-800', icon: '🟡' },
      baixa: { color: 'bg-green-100 text-green-800', icon: '🟢' },
    }
    const badge = badges[severity] || badges.baixa
    return (
      <span className={`inline-block px-3 py-1 ${badge.color} rounded-full text-xs font-medium`}>
        {badge.icon} {severity.toUpperCase()}
      </span>
    )
  }

  const paginatedAnomalies = anomalies.slice(currentPage * pageSize, (currentPage + 1) * pageSize)
  const totalPages = Math.ceil(anomalies.length / pageSize)

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Carregando anomalias...</div>
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Erro: {error}</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Detecção de Anomalias</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total de Anomalias"
          value={anomalies.length.toLocaleString('pt-BR')}
          icon={<div className="w-full h-full bg-red-100 text-red-500 flex items-center justify-center">⚠️</div>}
        />
        <KPICard
          title="Alta Severidade"
          value={anomalies.filter((a) => a.severidade === 'alta').length}
          icon={<div className="w-full h-full bg-red-100 text-red-600 flex items-center justify-center">🔴</div>}
        />
        <KPICard
          title="Média Severidade"
          value={anomalies.filter((a) => a.severidade === 'media').length}
          icon={<div className="w-full h-full bg-yellow-100 text-yellow-600 flex items-center justify-center">🟡</div>}
        />
        <KPICard
          title="Baixa Severidade"
          value={anomalies.filter((a) => a.severidade === 'baixa').length}
          icon={<div className="w-full h-full bg-green-100 text-green-600 flex items-center justify-center">🟢</div>}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Distribuição por Severidade" data={severityDistribution} type="pie" />
        <ChartCard title="Distribuição por Regra" data={ruleDistribution} type="bar" />
      </div>

      {/* Filtro por Regra */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtrar por Regra</h3>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedRule(null)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedRule === null
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
            }`}
          >
            Todas
          </button>
          {RULES.map((rule) => (
            <button
              key={rule}
              onClick={() => setSelectedRule(rule)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedRule === rule
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }`}
            >
              {rule}
            </button>
          ))}
        </div>
      </div>

      {/* Tabela de Anomalias */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <p className="text-sm text-gray-600">
            Mostrando <strong>{Math.min(pageSize, paginatedAnomalies.length)}</strong> de{' '}
            <strong>{anomalies.length}</strong> anomalias
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">ID</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Conta</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Valor</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Data</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Hora</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Categoria</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Cidade</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Motivo</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Regra</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Severidade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedAnomalies.map((anomaly) => (
                <tr
                  key={anomaly.id}
                  onClick={() => handleAnomalyClick(anomaly)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 text-gray-900">#{anomaly.id}</td>
                  <td className="px-4 py-3 text-gray-900 font-medium">{anomaly.conta}</td>
                  <td className="px-4 py-3 text-gray-900 font-semibold">
                    R$ {anomaly.valor.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {new Date(anomaly.data).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{anomaly.hora}</td>
                  <td className="px-4 py-3">
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {anomaly.categoria}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{anomaly.cidade}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{anomaly.motivo}</td>
                  <td className="px-4 py-3 text-gray-600">{anomaly.regra}</td>
                  <td className="px-4 py-3">{severityBadge(anomaly.severidade)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        {totalPages > 1 && (
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
                className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
              >
                ⏮
              </button>
              <button
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
              >
                ◀
              </button>
              <span className="text-sm text-gray-600">
                Página {currentPage + 1} de {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage >= totalPages - 1}
                className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
              >
                ▶
              </button>
              <button
                onClick={() => setCurrentPage(totalPages - 1)}
                disabled={currentPage >= totalPages - 1}
                className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
              >
                ⏭
              </button>
            </div>
          </div>
        )}
      </div>

      {showModal && selectedTransaction && (
        <TransactionModal
          transaction={selectedTransaction}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}
