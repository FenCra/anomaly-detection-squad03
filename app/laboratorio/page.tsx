'use client'

import { useState, useEffect } from 'react'
import { ShieldAlertIcon } from '@/components/Icons'

const ML_GRAFICOS = [
  {
    id: 'distribuicao-fraudes',
    titulo: 'Distribuição de Fraudes vs Normais',
    descricao: 'Comparativo geral entre transações fraudulentas e legítimas na base de dados.',
    endpoint: '/api/ml/analytics/fraud/count',
  },
  {
    id: 'cidades-anomalas',
    titulo: 'Top 10 Cidades com Mais Anomalias',
    descricao: 'Ranking das cidades com maior concentração de fraudes detectadas pelo motor.',
    endpoint: '/api/ml/analytics/fraud/cities',
  },
  {
    id: 'tipos-fraude',
    titulo: 'Tipos de Transação com Mais Fraudes',
    descricao: 'Distribuição dos tipos de transação (débito, crédito, transferência) que mais concentram anomalias.',
    endpoint: '/api/ml/analytics/fraud/types',
  },
  {
    id: 'horario-fraudes',
    titulo: 'Horários com Mais Fraudes',
    descricao: 'Análise temporal das fraudes por hora do dia, identificando janelas de maior risco.',
    endpoint: '/api/ml/analytics/fraud/hours',
  },
  {
    id: 'tentativas-anomalas',
    titulo: 'Tentativas em Transações Anômalas',
    descricao: 'Relação entre número de tentativas e valor das transações marcadas como fraude com 2+ tentativas.',
    endpoint: '/api/ml/analytics/fraud/attempts',
  },
]

function GraficoCard({ titulo, descricao, endpoint, id, delay }: {
  titulo: string
  descricao: string
  endpoint: string
  id: string
  delay: number
}) {
  const [erro, setErro] = useState(false)
  const [carregando, setCarregando] = useState(true)
  const [src, setSrc] = useState<string | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setSrc(endpoint)
    }, delay)
    return () => clearTimeout(timer)
  }, [endpoint, delay])

  const retry = () => {
    setErro(false)
    setCarregando(true)
    setSrc(null)
    setTimeout(() => setSrc(endpoint), 100)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
      <div className="p-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900 text-sm">{titulo}</h3>
        <p className="text-xs text-gray-500 mt-1">{descricao}</p>
      </div>
      <div className="p-4 bg-gray-50 relative overflow-x-auto">
        {carregando && !erro && (
          <div className="flex items-center justify-center min-h-[300px]">
            <div className="flex flex-col items-center gap-2 text-gray-400">
              <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              <span className="text-xs">Gerando gráfico...</span>
            </div>
          </div>
        )}
        {erro ? (
          <div className="flex flex-col items-center gap-3 text-center p-6 min-h-[300px] justify-center">
            <span className="text-orange-400 w-10 h-10">
              <ShieldAlertIcon />
            </span>
            <div>
              <p className="font-medium text-gray-700 text-sm">Motor de ML indisponível</p>
              <p className="text-xs text-gray-400 mt-1">
                Certifique-se que a API da pasta <code className="bg-gray-100 px-1 rounded">Anomalias</code> está rodando na porta <strong>8001</strong>.
              </p>
            </div>
            <button onClick={retry} className="text-xs text-blue-600 hover:underline mt-1">
              Tentar novamente
            </button>
          </div>
        ) : src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            id={`grafico-${id}`}
            src={src}
            alt={titulo}
            style={{ display: carregando ? 'none' : 'block' }}
            className="w-full h-auto rounded"
            onLoad={() => setCarregando(false)}
            onError={() => { setErro(true); setCarregando(false) }}
          />
        ) : null}
      </div>
    </div>
  )
}

export default function LaboratorioPage() {
  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center shrink-0 text-purple-600">
            <ShieldAlertIcon />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Laboratório de Machine Learning</h1>
            <p className="text-sm text-gray-500 mt-1">
              Visualizações estatísticas agregadas geradas em tempo real pelo Motor de Detecção de Anomalias.
              Os gráficos são processados pelo servidor de ML e devolvidos como imagens científicas sobre a base completa de transações.
              Para análises individuais por conta (Z-Score e Gaussiana), abra o modal de detalhes de uma transação.
            </p>
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-lg text-xs text-purple-700 font-medium">
              <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
              API de ML: <code className="font-mono">http://localhost:8001</code>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Gráficos — delay escalonado para não sobrecarregar o backend síncrono */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {ML_GRAFICOS.map((grafico, index) => (
          <GraficoCard key={grafico.id} {...grafico} delay={index * 800} />
        ))}
      </div>
    </div>
  )
}
