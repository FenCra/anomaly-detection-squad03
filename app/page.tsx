'use client'

import { useEffect, useState } from 'react'
import KPICard from '@/components/KPICard'
import ChartCard from '@/components/ChartCard'
import { fetchDashboard } from '@/lib/api'
import { ActivityIcon, AlertTriangleIcon, CheckCircleIcon, TrendingUpIcon, DollarSignIcon } from '@/components/Icons'

interface DashboardData {
  total_transactions: number
  total_anomalies: number
  anomaly_percentage: number
  total_movimentado: number

  comparacao_transacoes: number
  comparacao_anomalias: number
  comparacao_aprovadas: number
  comparacao_valor: number

  distribuicao_transacoes: Array<{ name: string; value: number }>
  volume_dias: Array<{ name: string; value: number }>
  distribuicao_valores: Array<{ name: string; value: number }>
  resultado_anomalias: Array<{ name: string; value: number }>
  transacoes_hora: Array<{ name: string; value: number }>
  top_usuarios: Array<{ name: string; value: number }>
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const dashboardData = await fetchDashboard()
        setData(dashboardData)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-gray-500">Carregando dados...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="text-red-800">Erro ao carregar dados: {error}</div>
      </div>
    )
  }

  if (!data) {
    return null
  }

  const formatVar = (perc: number, inverseIndicator: boolean = false) => {
    const isPositive = perc >= 0
    let color = isPositive ? 'text-green-600' : 'text-red-600'
    if (inverseIndicator) color = isPositive ? 'text-red-600' : 'text-green-600'

    return {
      text: `${isPositive ? '+' : ''}${perc.toFixed(1)}% vs mês anterior`,
      color
    }
  }

  const varTx = formatVar(data.comparacao_transacoes)
  const varAnomalias = formatVar(data.comparacao_anomalias, true)
  const varAprovadas = formatVar(data.comparacao_aprovadas)
  const varValor = formatVar(data.comparacao_valor)

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard
          title="Transações Deste Mês"
          value={data.total_transactions}
          icon={<ActivityIcon />}
          iconColorClass="text-blue-600"
          comparisonText={varTx.text}
          comparisonColorClass={varTx.color}
        />
        <KPICard
          title="Anomalias Detectadas"
          value={data.total_anomalies}
          icon={<AlertTriangleIcon />}
          iconColorClass="text-red-600"
          comparisonText={varAnomalias.text}
          comparisonColorClass={varAnomalias.color}
        />

        <KPICard
          title="Valor Movimentado"
          value={`R$ ${(data.total_movimentado > 1000 ? (data.total_movimentado / 1000).toFixed(1) + 'K' : data.total_movimentado.toFixed(2)).replace('.', ',')}`} 
          icon={<DollarSignIcon />}
          iconColorClass="text-green-600"
          comparisonText={varValor.text}
          comparisonColorClass={varValor.color}
        />
      </div>

      {/* Gráficos - Linha 1 (Grid de 3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard 
          title="Distribuição de Transações" 
          data={data.distribuicao_transacoes} 
          type="pie" 
          colors={['#10b981', '#ef4444']} 
        />
        <ChartCard 
          title="Volume de Transações" 
          data={data.volume_dias} 
          type="line" 
          colors={['#3b82f6']} 
        />
        <ChartCard 
          title="Distribuição de Valores" 
          data={data.distribuicao_valores} 
          type="bar" 
          colors={['#3b82f6']} 
        />
      </div>

      {/* Gráficos - Linha 2 (Linha Horizontal Completa)*/}
      <div className="w-full">
        <ChartCard 
          title="Resultado das Anomalias" 
          data={data.resultado_anomalias} 
          type="horizontalBar" 
          colors={['#eab308', '#ef4444']} 
          heightClass="h-32" 
        />
      </div>

      {/* Gráficos - Linha 3 (Grid de 2)*/}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartCard 
          title="Transações por Hora" 
          data={data.transacoes_hora} 
          type="line" 
          colors={['#10b981']} 
        />
        <ChartCard 
          title="Top Usuários com Anomalias" 
          data={data.top_usuarios} 
          type="bar" 
          colors={['#ef4444']} 
        />
      </div>
    </div>
  )
}
