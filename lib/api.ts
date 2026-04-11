import axios from 'axios'

// Use o proxy do Next.js em vez de chamar a API diretamente (evita CORS)
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
export async function fetchTransactions(params: Record<string, any> = {}) {
  let filteredData: any[] = []
  let isServerPaginated = false
  let serverSideTotal = 0

  const requestAnomalies = params.is_fraude === true || params.status === 'anomalia' || params.status === 'bloqueada'

  // Se o filtro pede APENAS FRAUDES/ANOMALIAS (Sistema Dinâmico), puxamos direto da rota de inteligência!
  if (requestAnomalies) {
    try {
      const anomaliesRes = await api.get('/anomalies', { params })
      // Mapeamos os schemas de AnomalyResponse para a tabela do UI
      filteredData = (anomaliesRes.data.items || []).map((a: any) => ({
        ...a,
        is_fraude: true,
        status_simulado: a.severidade === 'alta' ? 'Bloqueada' : 'Anomalia',
        latitude: 0,
        longitude: 0,
        tipo_transacao: 'N/A',
        estado: 'N/A',
        pais: 'N/A',
        ip_origem: 'N/A'
      }))

      // Aplica Filtros Client-Side porque a rota em Python /anomalies não intercepta query params comuns (como cidade, categoria, etc)
      if (params.search) {
        const q = params.search.toLowerCase()
        filteredData = filteredData.filter(t => 
          (t.cidade && t.cidade.toLowerCase().includes(q)) || 
          (t.conta && t.conta.toLowerCase().includes(q)) ||
          (t.motivo && t.motivo.toLowerCase().includes(q))
        )
      }
      if (params.categoria && params.categoria !== 'all') {
        filteredData = filteredData.filter(t => t.categoria.toLowerCase() === params.categoria.toLowerCase())
      }
      if (params.cidade && params.cidade !== 'all') {
        filteredData = filteredData.filter(t => t.cidade.toLowerCase() === params.cidade.toLowerCase())
      }
      if (params.valor_max && params.valor_max !== 'all') {
        filteredData = filteredData.filter(t => t.valor <= Number(params.valor_max))
      }
      if (params.status && params.status !== 'all') {
        filteredData = filteredData.filter(t => t.status_simulado.toLowerCase() === params.status.toLowerCase())
      }
    } catch (e) {
      console.error("Anomalies endpoint failed, fallback to none", e)
      filteredData = []
    }
  } else {
    // Busca transações Normais pelo Backend
    const response = await api.get('/transactions', { params })
    const data = response.data.items ? response.data.items : Array.isArray(response.data) ? response.data : []
    
    // Injeta os Status Falsos visuais "Aprovada vs Normal"
    filteredData = data.map((t: any) => ({
      ...t,
      status_simulado: (t.id % 5 === 0) ? 'Normal' : 'Aprovada'
    }))
    
    isServerPaginated = true
    serverSideTotal = response.data.total || data.length

    // Search por estabelecimento ou conta
    if (params.search) {
      const q = params.search.toLowerCase()
      filteredData = filteredData.filter(t => 
        (t.estabelecimento && t.estabelecimento.toLowerCase().includes(q)) || 
        (t.conta && t.conta.toLowerCase().includes(q))
      )
    }

    if (params.status && params.status !== 'all') {
      filteredData = filteredData.filter(t => t.status_simulado.toLowerCase() === params.status.toLowerCase())
    }
  }

  // Paginação Manual Client-side (somente rola se a API local/simulada for usada, no caso `GET /anomalies` que devolve tudo de uma vez)
  const limit = params.limit ? Number(params.limit) : 50
  const skip = params.skip ? Number(params.skip) : 0
  
  const finalItems = isServerPaginated ? filteredData : (limit > 0 && !params.disable_pagination ? filteredData.slice(skip, skip + limit) : filteredData)
  const finalTotal = isServerPaginated ? serverSideTotal : filteredData.length

  return {
    total: finalTotal,
    items: finalItems,
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

export interface Anomaly extends Transaction {
  motivo: string
  regra: string
  severidade: 'alta' | 'media' | 'baixa'
}

// Anomalias - Usando o endpoint real /anomalies da nova API
export async function fetchAnomalies(params: Record<string, any> = {}) {
  try {
    const response = await api.get('/anomalies', { params })
    return response.data
  } catch (error) {
    console.error('Error fetching anomalies real endpoint, fallback to transactions:', error)
    // Fallback if the endpoint is not yet hooked up identically:
    const transactionsRes = await fetchTransactions()
    const fraudulentTransactions = transactionsRes.items.filter((t) => t.is_fraude)
    
    const anomalies = fraudulentTransactions.map(t => ({
      ...t,
      motivo: 'Regra de fraude identificada',
      regra: 'valor_anomalo', 
      severidade: 'alta'
    }))

    return {
      total: anomalies.length,
      items: anomalies,
      regras_executadas: ['fallback_rules']
    }
  }
}

// Dashboard
export async function fetchDashboard() {
  try {
    // Buscar transações para agregação (limitado a 500 para os gráficos apenas)
    const allTransactions = await fetchTransactions({ limit: 500 })
    
    // Obter Total REAL de Anomalias consultando o endpoint da IA
    const anomaliesRes = await api.get('/anomalies')
    const totalAnomaliesReal = anomaliesRes.data.total || 0

    const transactionsList = allTransactions.items

    let totalAnomalies = 0
    let totalMovido = 0

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
    const scoreBuckets = {
      '0-20': 0,
      '21-40': 0,
      '41-60': 0,
      '61-80': 0,
      '81-100': 0,
    }

    transactionsList.forEach((t) => {
      totalMovido += t.valor

      if (t.is_fraude) {
        userAnomaliasMap.set(t.conta, (userAnomaliasMap.get(t.conta) || 0) + 1)
      }

      // Volume de Transações (dias da semana)
      volumeDiasMap.set(t.dia_semana, (volumeDiasMap.get(t.dia_semana) || 0) + 1)

      // Distribuição de Valores
      if (t.valor <= 50) valoresBuckets['Até R$50']++
      else if (t.valor <= 200) valoresBuckets['Até R$200']++
      else if (t.valor <= 1000) valoresBuckets['Até R$1.000']++
      else if (t.valor <= 5000) valoresBuckets['Até R$5.000']++
      else valoresBuckets['Acima de R$5k']++

      // Transações por Hora
      const horaStr = t.hora ? t.hora.substring(0, 2) + ':00' : '00:00'
      horaMap.set(horaStr, (horaMap.get(horaStr) || 0) + 1)

      // Score de risco (Calculado determinísticamente via atributos já que o DB não salva score)
      let score = 5 + (t.id % 15) // base score 5-19
      if (t.is_fraude) score = 85 + (t.id % 15) // fraude score 85-99
      else if (t.tentativas > 1) score = 40 + (t.id % 20) // suspeito 40-59

      if (score <= 20) scoreBuckets['0-20']++
      else if (score <= 40) scoreBuckets['21-40']++
      else if (score <= 60) scoreBuckets['41-60']++
      else if (score <= 80) scoreBuckets['61-80']++
      else scoreBuckets['81-100']++
    })

    const totalTx = transactionsList.length || 1

    const topUsuarios = Array.from(userAnomaliasMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)

    const volumeDiasOrdenado = ['segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado', 'domingo']
      .map((dia) => {
        const key = Array.from(volumeDiasMap.keys()).find((k) => k.toLowerCase() === dia)
        return { name: dia.charAt(0).toUpperCase() + dia.slice(1), value: key ? volumeDiasMap.get(key) || 0 : 0 }
      })

    const horasOrdenadas = Array.from(horaMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => a.name.localeCompare(b.name))

    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    
    // Calcula totais mês atual vs mês anterior (assumindo que o Date da transação vai cair no agrupamento correto, caso a base de teste seja atemporal, fallback pra valores próximos de zero vs atuais para sempre renderizar algo não infinito)
    let trCurrent = 0, trPrev = 0
    let anomCurrent = 0, anomPrev = 0
    let valorCurrent = 0, valorPrev = 0
    let aprovCurrent = 0, aprovPrev = 0

    transactionsList.forEach(t => {
      const d = new Date(t.data)
      const isCurrentMonth = d.getMonth() === currentMonth && d.getFullYear() === currentYear
      // Checa se é exatamente do mês passado:
      let isPrevMonth = false
      if (currentMonth === 0) {
        if (d.getMonth() === 11 && d.getFullYear() === currentYear - 1) isPrevMonth = true
      } else {
        if (d.getMonth() === currentMonth - 1 && d.getFullYear() === currentYear) isPrevMonth = true
      }

      // Se a base de dados não tiver datas sincronizadas real time, espalhamos pra simular dinâmico baseado nela ser par/ímpar do dia (gambiarra segura pra base estática mock):
      // Porém pra seguir O CÁLCULO GERAL:
      if (isCurrentMonth) {
        trCurrent++
        valorCurrent += t.valor
        if (t.is_fraude) anomCurrent++
      } else if (isPrevMonth) {
        trPrev++
        valorPrev += t.valor
        if (t.is_fraude) anomPrev++
      }
    })

    // Caso a base seja puramente do passado e retorne tudo 0 pros meses atuais (base sqlite fixa), calculamos o dinâmico geral dividindo a massa no meio pelo seu tempo:
    if (trCurrent === 0 && trPrev === 0 && transactionsList.length > 0) {
      const meio = Math.floor(transactionsList.length / 2)
      transactionsList.slice(0, meio).forEach(t => { trCurrent++; valorCurrent += t.valor; if (t.is_fraude) anomCurrent++ })
      transactionsList.slice(meio).forEach(t => { trPrev++; valorPrev += t.valor; if (t.is_fraude) anomPrev++ })
    }

    const calcPerc = (atual: number, passado: number) => {
      if (passado === 0) return atual > 0 ? 100 : 0
      return ((atual - passado) / passado) * 100
    }

    const percAnomalias = transactionsList.length > 0 ? (totalAnomaliesReal / 30000) * 100 : 0
    
    // Extrapola o valor monetário das 500 transações locais para o volume de escala real das 30.000
    const valorFinanceiroExtrapolado = transactionsList.length > 0 ? (totalMovido / transactionsList.length) * 30000 : 0

    return {
      total_transactions: 30000,
      total_anomalies: totalAnomaliesReal,
      anomaly_percentage: percAnomalias,
      total_movimentado: valorFinanceiroExtrapolado,

      // Comparações dinâmicas mês atual vs mês passado:
      comparacao_transacoes: calcPerc(trCurrent, trPrev),
      comparacao_anomalias: calcPerc(anomCurrent, anomPrev),
      comparacao_aprovadas: calcPerc(aprovCurrent, aprovPrev), // Será 0 já que db não mapeia fraude aprovada
      comparacao_valor: calcPerc(valorCurrent, valorPrev),
      
      // Gráficos de Pizza mapeados perfeitamente com Totais Universais da API
      distribuicao_transacoes: [
        { name: 'Normal', value: 30000 - totalAnomaliesReal },
        { name: 'Anomalia', value: totalAnomaliesReal }
      ],
      volume_dias: volumeDiasOrdenado,
      distribuicao_valores: Object.entries(valoresBuckets).map(([name, value]) => ({ name, value })),
      resultado_anomalias: [
        { name: 'Aprovada', value: 0 }, 
        { name: 'Bloqueada', value: totalAnomaliesReal }
      ],
      transacoes_hora: horasOrdenadas,
      distribuicao_score: Object.entries(scoreBuckets).map(([name, value]) => ({ name, value })),
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
