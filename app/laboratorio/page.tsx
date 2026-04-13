'use client'

import { useState } from 'react'
import { ShieldAlertIcon } from '@/components/Icons'

// Gráficos disponíveis na API de ML (Pasta Anomalias)
const ML_GRAFICOS = [
  {
    id: 'distribuicao-fraudes',
    titulo: 'Distribuição de Fraudes vs Normais',
    descricao: 'Comparativo geral entre transações fraudulentas e legítimas na base de dados.',
    endpoint: '/api/ml/numerodefraudes',
  },
  {
    id: 'cidades-anomalas',
    titulo: 'Top 10 Cidades com Mais Anomalias',
    descricao: 'Ranking das cidades com maior concentração de fraudes detectadas pelo motor.',
    endpoint: '/api/ml/cidadesmaisanomalas',
  },
  {
    id: 'tipos-fraude',
    titulo: 'Tipos de Transação com Mais Fraudes',
    descricao: 'Distribuição dos tipos de transação (débito, crédito, transferência) que mais concentram anomalias.',
    endpoint: '/api/ml/fraudes/tipos',
  },
  {
    id: 'horario-fraudes',
    titulo: 'Horários com Mais Fraudes',
    descricao: 'Análise temporal das fraudes por hora do dia, identificando janelas de maior risco.',
    endpoint: '/api/ml/horariofraudes',
  },
  {
    id: 'tentativas-anomalas',
    titulo: 'Tentativas em Transações Anômalas',
    descricao: 'Relação entre número de tentativas e valor das transações marcadas como fraude com 2+ tentativas.',
    endpoint: '/api/ml/numerodetentativas',
  },
  {
    id: 'zscore',
    titulo: 'Análise Z-Score (Dispersão Estatística)',
    descricao: 'Visualização do modelo Z-Score aplicado à base, identificando outliers por desvio padrão.',
    endpoint: '/api/ml/calculozscore',
  },
  {
    id: 'gaussiana',
    titulo: 'Distribuição Gaussiana dos Valores',
    descricao: 'Curva de distribuição normal aplicada aos valores de transação para identificar anomalias estatísticas.',
    endpoint: '/api/ml/calculogaussiana',
  },
]

function GraficoCard({ titulo, descricao, endpoint, id }: {
  titulo: string
  descricao: string
  endpoint: string
  id: string
}) {
  const [erro, setErro] = useState(false)
  const [carregando, setCarregando] = useState(true)

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
      <div className="p-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900 text-sm">{titulo}</h3>
        <p className="text-xs text-gray-500 mt-1">{descricao}</p>
      </div>
      <div className="p-4 flex items-center justify-center min-h-[300px] bg-gray-50 relative">
        {carregando && !erro && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center gap-2 text-gray-400">
              <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              <span className="text-xs">Gerando gráfico...</span>
            </div>
          </div>
        )}
        {erro ? (
          <div className="flex flex-col items-center gap-3 text-center p-6">
            <span className="text-orange-400 w-10 h-10">
              <ShieldAlertIcon />
            </span>
            <div>
              <p className="font-medium text-gray-700 text-sm">Motor de ML indisponível</p>
              <p className="text-xs text-gray-400 mt-1">
                Certifique-se que a API da pasta <code className="bg-gray-100 px-1 rounded">Anomalias</code> está rodando na porta <strong>8001</strong>.
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Comando: <code className="bg-gray-100 px-1 rounded">uvicorn main:app --port 8001</code>
              </p>
            </div>
            <button
              onClick={() => { setErro(false); setCarregando(true) }}
              className="text-xs text-blue-600 hover:underline mt-1"
            >
              Tentar novamente
            </button>
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            id={`grafico-${id}`}
            src={endpoint}
            alt={titulo}
            className={`max-w-full h-auto rounded transition-opacity duration-300 ${carregando ? 'opacity-0' : 'opacity-100'}`}
            onLoad={() => setCarregando(false)}
            onError={() => { setErro(true); setCarregando(false) }}
          />
        )}
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
              Visualizações estatísticas geradas em tempo real pelo Motor de Detecção de Anomalias (Z-Score e Gaussiana).
              Os gráficos são processados pelo servidor de ML e devolvidos como imagens científicas.
            </p>
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-lg text-xs text-purple-700 font-medium">
              <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
              API de ML: <code className="font-mono">http://localhost:8001</code>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {ML_GRAFICOS.map((grafico) => (
          <GraficoCard key={grafico.id} {...grafico} />
        ))}
      </div>
    </div>
  )
}
