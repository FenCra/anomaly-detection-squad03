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
export async function fetchTransactions(params: Record<string, any> = {}) {
  let filteredData: any[] = []
  let isServerPaginated = false
  let serverSideTotal = 0

  // 'negada' → GET /anomalies (tudo de uma vez, paginação client-side)
  // 'aprovada' → GET /transactions em batch grande + filtro + paginação client-side (API não tem filtro is_fraude=false)
  const requestAnomalies = params.is_fraude === true || params.status === 'negada'
  const requestAprovada = params.status === 'aprovada'

  if (requestAnomalies) {
    // Rota de Anomalias: GET /anomalies (traz tudo de uma vez, sem paginação server-side)
    try {
      const anomaliesRes = await api.get('/anomalies')
      filteredData = (anomaliesRes.data.items || []).map((a: any) => ({
        ...a,
        is_fraude: true,
        latitude: 0,
        longitude: 0,
        tipo_transacao: a.tipo_transacao || 'N/A',
        estado: a.estado || 'N/A',
        pais: a.pais || 'N/A',
        ip_origem: a.ip_origem || 'N/A',
      }))

      // Filtros client-side para /anomalies (endpoint não aceita query params complexos)
      if (params.search) {
        const q = params.search.toLowerCase()
        filteredData = filteredData.filter(t =>
          (t.cidade && t.cidade.toLowerCase().includes(q)) ||
          (t.conta && t.conta.toLowerCase().includes(q)) ||
          (t.estabelecimento && t.estabelecimento.toLowerCase().includes(q)) ||
          (t.motivo && t.motivo.toLowerCase().includes(q))
        )
      }
      if (params.categoria && params.categoria !== 'all') {
        filteredData = filteredData.filter(t => t.categoria?.toLowerCase() === params.categoria.toLowerCase())
      }
      if (params.cidade && params.cidade !== 'all') {
        filteredData = filteredData.filter(t => t.cidade?.toLowerCase().includes(params.cidade.toLowerCase()))
      }
      if (params.valor_min) filteredData = filteredData.filter(t => t.valor >= Number(params.valor_min))
      if (params.valor_max && params.valor_max !== 'all') filteredData = filteredData.filter(t => t.valor <= Number(params.valor_max))
    } catch (e) {
      console.error('Anomalies endpoint failed:', e)
      filteredData = []
    }
  } else if (requestAprovada) {
    // Filtro 'Aprovada': busca batch grande e filtra client-side (API não suporta is_fraude=false ainda)
    // Isso garante que o total e a paginação reflitam apenas transações não-fraude
    try {
      const batchRes = await api.get('/transactions', { params: { limit: 2000, skip: 0 } })
      const batchData = batchRes.data.items || []
      filteredData = batchData.filter((t: any) => !t.is_fraude)

      if (params.search) {
        const q = params.search.toLowerCase()
        filteredData = filteredData.filter((t: any) =>
          (t.estabelecimento && t.estabelecimento.toLowerCase().includes(q)) ||
          (t.conta && t.conta.toLowerCase().includes(q))
        )
      }
      if (params.categoria && params.categoria !== 'all') {
        filteredData = filteredData.filter((t: any) => t.categoria?.toLowerCase() === params.categoria.toLowerCase())
      }
      if (params.cidade && params.cidade !== 'all') {
        filteredData = filteredData.filter((t: any) => t.cidade?.toLowerCase().includes(params.cidade.toLowerCase()))
      }
      if (params.valor_min) filteredData = filteredData.filter((t: any) => t.valor >= Number(params.valor_min))
      if (params.valor_max && params.valor_max !== 'all') filteredData = filteredData.filter((t: any) => t.valor <= Number(params.valor_max))
    } catch (e) {
      console.error('Approved transactions batch failed:', e)
      filteredData = []
    }
  } else {
    // Rota Principal: GET /transactions — filtros delegados ao servidor (SQL WHERE via crud.py)
    // A API já aceita: categoria, cidade, valor_min, valor_max, tipo_transacao, dispositivo,
    // data_inicio, data_fim, conta, skip, limit. Enviamos direto sem reprocessar client-side.
    const serverParams: Record<string, any> = {}
    if (params.limit)          serverParams.limit = params.limit
    if (params.skip)           serverParams.skip = params.skip
    if (params.categoria && params.categoria !== 'all') serverParams.categoria = params.categoria
    if (params.cidade && params.cidade !== 'all')       serverParams.cidade = params.cidade
    if (params.valor_min)      serverParams.valor_min = params.valor_min
    if (params.valor_max && params.valor_max !== 'all') serverParams.valor_max = params.valor_max
    if (params.tipo_transacao && params.tipo_transacao !== 'all') serverParams.tipo_transacao = params.tipo_transacao
    if (params.dispositivo && params.dispositivo !== 'all') serverParams.dispositivo = params.dispositivo
    if (params.data_inicio)    serverParams.data_inicio = params.data_inicio
    if (params.data_fim)       serverParams.data_fim = params.data_fim
    if (params.conta)          serverParams.conta = params.conta

    const response = await api.get('/transactions', { params: serverParams })
    const data = response.data.items ? response.data.items : Array.isArray(response.data) ? response.data : []

    filteredData = [...data]
    isServerPaginated = true
    serverSideTotal = response.data.total || data.length

    // Search client-side (API não suporta campo de busca livre ainda)
    if (params.search) {
      const q = params.search.toLowerCase()
      filteredData = filteredData.filter(t =>
        (t.estabelecimento && t.estabelecimento.toLowerCase().includes(q)) ||
        (t.conta && t.conta.toLowerCase().includes(q))
      )
    }
  }


  // Paginação:
  // - Transações normais (server-side): API cuida do skip/limit diretamente
  // - Anomalias e Aprovadas (client-side): paginamos o array filtrado aqui
  const limit = params.limit ? Number(params.limit) : 50
  const skip = params.skip ? Number(params.skip) : 0

  const finalItems = isServerPaginated
    ? filteredData
    : filteredData.slice(skip, skip + limit)
  const finalTotal = isServerPaginated ? serverSideTotal : filteredData.length

  return { total: finalTotal, items: finalItems }
}

export async function fetchTransaction(id: number) {
  const response = await api.get<Transaction>(`/transactions/${id}`)
  return response.data
}

export async function createTransaction(data: Partial<Transaction>) {
  const response = await api.post<Transaction>('/transactions', data)
  return response.data
}

// Julgamento de Transação 
// Dispara PATCH /transactions/{id} para registrar o veredito do analista no banco de dados.
export async function patchTransaction(id: number, payload: Partial<Pick<Transaction, 'is_fraude'>>) {
  const response = await api.patch<Transaction>(`/transactions/${id}`, payload)
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
    // Busca amostra de 1000 para maior precisão dos gráficos de barras e pizza
    // O total de transações real vem do campo `total` da API (COUNT(*) do banco)
    const allTransactions = await fetchTransactions({ limit: 1000 })
    const totalTransactionsReal = allTransactions.total || 0

    const anomaliesRes = await api.get('/anomalies')
    const totalAnomaliesReal = anomaliesRes.data.total || 0

    const transactionsList = allTransactions.items
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

    const percAnomalias = totalTransactionsReal > 0 ? (totalAnomaliesReal / totalTransactionsReal) * 100 : 0

    // Valor movimentado: extrapolado da amostra de 1000 para o total real do banco
    // (estimativa proporcional — endpoint /dashboard/metrics no backend tornaria isso exato)
    const valorExtrapolado = transactionsList.length > 0
      ? (totalMovido / transactionsList.length) * totalTransactionsReal
      : 0

    return {
      total_transactions: totalTransactionsReal,
      total_anomalies: totalAnomaliesReal,
      anomaly_percentage: percAnomalias,
      total_movimentado: valorExtrapolado,

      // Comparações dinâmicas mês atual vs mês passado:
      comparacao_transacoes: calcPerc(trCurrent, trPrev),
      comparacao_anomalias: calcPerc(anomCurrent, anomPrev),
      comparacao_aprovadas: calcPerc(aprovCurrent, aprovPrev),
      comparacao_valor: calcPerc(valorCurrent, valorPrev),
      
      // Gráficos de Pizza sem mocks
      distribuicao_transacoes: [
        { name: 'Normal', value: Math.max(0, totalTransactionsReal - totalAnomaliesReal) },
        { name: 'Anomalia', value: totalAnomaliesReal }
      ],
      volume_dias: volumeDiasOrdenado,
      distribuicao_valores: Object.entries(valoresBuckets).map(([name, value]) => ({ name, value })),
      resultado_anomalias: [
        { name: 'Aprovada', value: 0 }, 
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
