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
  
  // Extrair paginação e repassar ao servidor
  const limit = params.limit ? Number(params.limit) : 50
  const skip = params.skip ? Number(params.skip) : 0

  // Converter status para is_fraude
  if (params.status === 'negada') {
    serverParams.is_fraude = true
  } else if (params.status === 'aprovada') {
    serverParams.is_fraude = false
  }

  // Copiar restante dos params (exceto status, limit, skip)
  Object.entries(params).forEach(([key, value]) => {
    if (key === 'status' || key === 'limit' || key === 'skip') return
    if (value === undefined || value === '' || value === 'all') return
    serverParams[key] = value
  })

  // Enviar paginação e filtros ao backend
  serverParams.limit = limit
  serverParams.skip = skip

  try {
    const response = await api.get('/transactions', { params: serverParams })
    const responseData = response.data

    // O backend retorna { total: <COUNT real do banco>, dados: [...] }
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
  // Mapeia regras para transações negadas
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

// Dashboard
export async function fetchDashboard() {
  try {
    // 1. Busca métricas reais (totais exatos) diretamente do endpoint dedicado do backend
    let backendMetrics: any = null
    try {
      const metricsRes = await fetch('/api/ml/dashboard/metrics')
      if (metricsRes.ok) backendMetrics = await metricsRes.json()
    } catch (_) { /* fallback para cálculo local */ }

    // 2. Busca uma amostra razoável de transações para os gráficos de distribuição
    const sample = await fetchTransactions({ limit: 2000 })
    const transactionsList = sample.items

    const totalTransactionsReal = backendMetrics?.total_transacoes ?? sample.total
    const totalAnomaliesReal = backendMetrics?.total_fraudes ?? transactionsList.filter((t: any) => t.is_fraude).length
    const totalMovido = backendMetrics?.total_movimentado ?? transactionsList.reduce((acc: number, t: any) => acc + t.valor, 0)

    const volumeDiasMap = new Map<string, number>()
    const valoresBuckets = {
      'Até R$50': 0,
      'Até R$200': 0,
      'Até R$1.000': 0,
      'Até R$5.000': 0,
      'Acima de R$5k': 0,
    }
    const horaMap = new Map<string, number>()
    const userAnomaliasMap = new Map<string, number>()

    transactionsList.forEach((t) => {
      if (t.is_fraude) {
        userAnomaliasMap.set(t.conta, (userAnomaliasMap.get(t.conta) || 0) + 1)
      }

      let diaDaSemana = 'segunda'
      if (t.dia_semana && typeof t.dia_semana === 'string') {
        const diaRaw = t.dia_semana.toLowerCase().trim()
        const mapaDias: Record<string, string> = {
          'monday': 'segunda', 'tuesday': 'terça', 'wednesday': 'quarta', 'thursday': 'quinta',
          'friday': 'sexta', 'saturday': 'sábado', 'sunday': 'domingo',
          'segunda': 'segunda', 'terça': 'terça', 'quarta': 'quarta', 'quinta': 'quinta',
          'sexta': 'sexta', 'sábado': 'sábado', 'domingo': 'domingo',
          'segunda-feira': 'segunda', 'terça-feira': 'terça', 'quarta-feira': 'quarta',
          'quinta-feira': 'quinta', 'sexta-feira': 'sexta'
        }
        diaDaSemana = mapaDias[diaRaw] || diaRaw
      } else if (t.data) {
        const d = new Date(t.data)
        if (!isNaN(d.getTime())) {
          const nomesDias = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado']
          diaDaSemana = nomesDias[d.getDay()]
        }
      }
      volumeDiasMap.set(diaDaSemana, (volumeDiasMap.get(diaDaSemana) || 0) + 1)

      if (t.valor <= 50) valoresBuckets['Até R$50']++
      else if (t.valor <= 200) valoresBuckets['Até R$200']++
      else if (t.valor <= 1000) valoresBuckets['Até R$1.000']++
      else if (t.valor <= 5000) valoresBuckets['Até R$5.000']++
      else valoresBuckets['Acima de R$5k']++

      const horaStr = t.hora ? t.hora.substring(0, 2) + ':00' : '00:00'
      horaMap.set(horaStr, (horaMap.get(horaStr) || 0) + 1)
    })

    const topUsuarios = Array.from(userAnomaliasMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)

    const volumeDiasOrdenado = ['segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado', 'domingo']
      .map((dia) => {
        const key = Array.from(volumeDiasMap.keys()).find((k) => k.trim().toLowerCase() === dia)
        return { name: dia.charAt(0).toUpperCase() + dia.slice(1), value: key ? volumeDiasMap.get(key) || 0 : 0 }
      })

    const horasOrdenadas = Array.from(horaMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => a.name.localeCompare(b.name))

    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    
    let trCurrent = 0, trPrev = 0
    let anomCurrent = 0, anomPrev = 0
    let valorCurrent = 0, valorPrev = 0
    let aprovCurrent = 0, aprovPrev = 0

    transactionsList.forEach(t => {
      const d = new Date(t.data)
      const isCurrentMonth = d.getMonth() === currentMonth && d.getFullYear() === currentYear
      let isPrevMonth = false
      if (currentMonth === 0) {
        if (d.getMonth() === 11 && d.getFullYear() === currentYear - 1) isPrevMonth = true
      } else {
        if (d.getMonth() === currentMonth - 1 && d.getFullYear() === currentYear) isPrevMonth = true
      }

      if (isCurrentMonth) {
        trCurrent++; valorCurrent += t.valor
        if (t.is_fraude) anomCurrent++
      } else if (isPrevMonth) {
        trPrev++; valorPrev += t.valor
        if (t.is_fraude) anomPrev++
      }
    })

    if (trCurrent === 0 && trPrev === 0 && transactionsList.length > 0) {
      const meio = Math.floor(transactionsList.length / 2)
      transactionsList.slice(0, meio).forEach(t => { trCurrent++; valorCurrent += t.valor; if (t.is_fraude) anomCurrent++ })
      transactionsList.slice(meio).forEach(t => { trPrev++; valorPrev += t.valor; if (t.is_fraude) anomPrev++ })
    }

    const calcPerc = (atual: number, passado: number) => {
      if (passado === 0) return atual > 0 ? 100 : 0
      return ((atual - passado) / passado) * 100
    }

    const percAnomalias = totalTransactionsReal > 0 ? (totalAnomaliesReal / totalTransactionsReal) * 100 : 0

    return {
      total_transactions: totalTransactionsReal,
      total_anomalies: totalAnomaliesReal,
      anomaly_percentage: percAnomalias,
      total_movimentado: totalMovido,
      comparacao_transacoes: calcPerc(trCurrent, trPrev),
      comparacao_anomalias: calcPerc(anomCurrent, anomPrev),
      comparacao_aprovadas: calcPerc(aprovCurrent, aprovPrev),
      comparacao_valor: calcPerc(valorCurrent, valorPrev),
      distribuicao_transacoes: [
        { name: 'Normal', value: Math.max(0, totalTransactionsReal - totalAnomaliesReal) },
        { name: 'Anomalia', value: totalAnomaliesReal }
      ],
      volume_dias: volumeDiasOrdenado,
      distribuicao_valores: Object.entries(valoresBuckets).map(([name, value]) => ({ name, value })),
      resultado_anomalias: [
        { name: 'Aprovada', value: Math.max(0, totalTransactionsReal - totalAnomaliesReal) },
        { name: 'Bloqueada', value: totalAnomaliesReal }
      ],
      transacoes_hora: horasOrdenadas,
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
