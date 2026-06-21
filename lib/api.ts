import axios from 'axios'

const API_URL = '/api'

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
})

export interface Transaction {
  id: number
  valor: number
  data: string
  hora: string
  dia_semana: string
  categoria: string
  conta: string
  cidade: string
  estado: string
  pais: string
  latitude: number
  longitude: number
  tipo_transacao: string
  dispositivo: string
  estabelecimento: string
  tentativas: number
  ip_origem: string
  is_fraude: boolean
}

export interface TransactionsResponse {
  total: number
  items: Transaction[]
}

// Transações
export async function fetchTransactions(params: Record<string, any> = {}): Promise<TransactionsResponse> {
  const serverParams: Record<string, any> = {}
  const limit = params.limit ? Number(params.limit) : 50
  const skip = params.skip ? Number(params.skip) : 0

  if (params.status === 'negada') {
    serverParams.is_fraude = true
  } else if (params.status === 'aprovada') {
    serverParams.is_fraude = false
  }

  Object.entries(params).forEach(([key, value]) => {
    if (key === 'status' || key === 'limit' || key === 'skip') return
    if (value === undefined || value === '' || value === 'all') return
    serverParams[key] = value
  })

  serverParams.limit = limit
  serverParams.skip = skip

  try {
    const response = await api.get('/transactions', { params: serverParams })
    const responseData = response.data
    let data: any[] = responseData.dados || responseData.transacoes || []
    const serverTotal: number = responseData.total ?? data.length

    return { total: serverTotal, items: data }
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return { total: 0, items: [] }
  }
}

export async function fetchTransaction(id: number) {
  const response = await api.get<Transaction>(`/transactions/${id}`)
  return response.data
}

export async function createTransaction(data: Partial<Transaction>) {
  const response = await api.post<Transaction>('/transactions', data)
  return response.data
}

export async function patchTransaction(id: number, payload: Partial<Pick<Transaction, 'is_fraude'>>): Promise<Transaction> {
  const response = await api.patch<Transaction>(`/transactions/${id}`, payload)
  return response.data
}

export async function deleteTransaction(id: number): Promise<void> {
  await api.delete(`/transactions/${id}`)
}

export interface Anomaly extends Transaction {
  motivo: string
  regra: string
  severidade: 'alta' | 'media' | 'baixa'
}

export async function fetchAnomalies(params: Record<string, any> = {}) {

  const res = await fetchTransactions({ ...params, status: 'negada' })
  return {
    total: res.total,
    items: res.items.map((t: any) => ({
      ...t,
      motivo: 'Regra de fraude identificada',
      regra: 'valor_anomalo', 
      severidade: 'alta'
    })),
    regras_executadas: ['motor_ml', 'zscore', 'gaussiana']
  }
}

// Dashboard e Analytics
export async function fetchDashboard() {
  try {
    // Busca métricas gerais e agregações globais usando a proxy /api/ml/
    const [metricsRes, diasRes, valoresRes, horasRes, topUsuariosRes] = await Promise.all([
      fetch('/api/ml/dashboard/metrics'),
      fetch('/api/ml/analytics/global/volume_dias'),
      fetch('/api/ml/analytics/global/distribuicao_valores'),
      fetch('/api/ml/analytics/global/transacoes_hora'),
      fetch('/api/ml/analytics/global/top_usuarios')
    ])

    const backendMetrics = metricsRes.ok ? await metricsRes.json() : { total_transacoes: 0, total_fraudes: 0, total_movimentado: 0 }
    const volumeDias = diasRes.ok ? await diasRes.json() : []
    const distribuicaoValores = valoresRes.ok ? await valoresRes.json() : []
    const transacoesHora = horasRes.ok ? await horasRes.json() : []
    const topUsuarios = topUsuariosRes.ok ? await topUsuariosRes.json() : []

    const totalTransactionsReal = backendMetrics.total_transacoes || 0
    const totalAnomaliesGlobal = backendMetrics.total_fraudes_global || 0
    const totalMovidoGlobal = backendMetrics.total_movimentado_global || 0

    const totalTransactionsGlobal = backendMetrics.total_transacoes_global || 0

    const percAnomalias = totalTransactionsGlobal > 0 ? (totalAnomaliesGlobal / totalTransactionsGlobal) * 100 : 0

    // Ocultar top usuários na visão global
    return {
      total_transactions: totalTransactionsReal,
      total_anomalies: totalAnomaliesGlobal,
      anomaly_percentage: percAnomalias,
      total_movimentado: totalMovidoGlobal,
      total_transactions_global: totalTransactionsGlobal,
      
      comparacao_transacoes: backendMetrics.comparacao_transacoes || 0,
      comparacao_anomalias: 0,
      comparacao_aprovadas: 0,
      comparacao_valor: 0,
      
      distribuicao_transacoes: [
        { name: 'Normal', value: Math.max(0, totalTransactionsGlobal - totalAnomaliesGlobal) },
        { name: 'Anomalia', value: totalAnomaliesGlobal }
      ],
      volume_dias: volumeDias,
      distribuicao_valores: distribuicaoValores,
      resultado_anomalias: [
        { name: 'Aprovada', value: Math.max(0, totalTransactionsGlobal - totalAnomaliesGlobal) },
        { name: 'Bloqueada', value: totalAnomaliesGlobal }
      ],
      transacoes_hora: transacoesHora,
      top_usuarios: topUsuarios,
    }
  } catch (error) {
    console.error('Error fetching dashboard:', error)
    throw error
  }
}



// Health check
export async function checkHealth() {
  const response = await api.get('/health')
  return response.data
}
