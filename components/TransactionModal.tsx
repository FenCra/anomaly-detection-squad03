'use client'

import React, { useState, useEffect } from 'react'
import { Transaction } from '@/lib/api'
import { AlertCircleIcon, XIcon, CalendarIcon, TagIcon, MapPinIcon, CreditCardIcon, CheckCircleIcon, ShieldAlertIcon } from './Icons'
import axios from 'axios'

interface TransactionModalProps {
  transaction: Transaction
  onClose: () => void
  onJulgamento?: (id: number, isFraude: boolean) => void
}

function MLChart({ title, endpoint, delay }: { title: string; endpoint: string; delay: number }) {
  const [src, setSrc] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setSrc(endpoint)
    }, delay)
    return () => clearTimeout(timer)
  }, [endpoint, delay])

  useEffect(() => {
    if (!lightboxOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [lightboxOpen])

  const imagemPronta = !carregando && !erro && src

  return (
    <>
      <div className="border border-gray-200 rounded-xl overflow-hidden flex flex-col bg-white shadow-sm">
        <div className="p-3 bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-700 flex items-center justify-between">
          <span>{title}</span>
          {imagemPronta && (
            <button
              onClick={() => setLightboxOpen(true)}
              title="Abrir em tela cheia"
              className="text-gray-400 hover:text-purple-600 transition-colors"
            >
              {/* Ícone de expandir */}
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
          )}
        </div>
        <div
          className={`p-4 flex items-center justify-center min-h-[200px] bg-white relative ${imagemPronta ? 'cursor-zoom-in group' : ''}`}
          onClick={() => { if (imagemPronta) setLightboxOpen(true) }}
        >
          {carregando && !erro && (
            <div className="flex flex-col items-center gap-2 text-gray-400">
              <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              <span className="text-[10px]">Processando...</span>
            </div>
          )}
          {erro ? (
            <div className="text-center p-4">
              <span className="text-orange-400 w-6 h-6 mx-auto block mb-2"><ShieldAlertIcon /></span>
              <span className="text-xs text-gray-500">Erro ao carregar o gráfico.</span>
            </div>
          ) : src ? (
            <div className="relative w-full">
              <img
                src={src}
                alt={title}
                style={{ display: carregando ? 'none' : 'block' }}
                className="w-full h-auto rounded"
                onLoad={() => setCarregando(false)}
                onError={() => { setErro(true); setCarregando(false) }}
              />
              {/* Overlay de hover com ícone de lupa */}
              {imagemPronta && (
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded transition-all flex items-center justify-center pointer-events-none">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-full p-2 shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0zm-2 0h-4m2-2v4" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {/* Lightbox Overlay */}
      {lightboxOpen && src && (
        <div
          className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-sm flex items-center justify-center p-6"
          onClick={() => setLightboxOpen(false)}
        >
          <div
            className="relative max-w-6xl w-full max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Barra superior do lightbox */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-white font-bold text-base bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm">
                {title}
              </span>
              <button
                onClick={() => setLightboxOpen(false)}
                className="bg-white/10 hover:bg-white/25 text-white rounded-full p-2 transition-colors backdrop-blur-sm"
                title="Fechar (Esc)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Imagem ampliada */}
            <div className="overflow-auto rounded-xl bg-white shadow-2xl flex items-center justify-center">
              <img
                src={src}
                alt={title}
                className="w-full h-auto rounded-xl"
              />
            </div>
            <p className="text-white/50 text-xs text-center mt-3">Clique fora da imagem ou pressione <kbd className="bg-white/10 px-1.5 py-0.5 rounded font-mono">Esc</kbd> para fechar</p>
          </div>
        </div>
      )}
    </>
  )
}

export default function TransactionModal({ transaction, onClose, onJulgamento }: TransactionModalProps) {
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [julgado, setJulgado] = useState<'fraude' | 'legitima' | null>(null)
  const [activeTab, setActiveTab] = useState<'detalhes' | 'analise'>('detalhes')

  if (!transaction) return null
  const statusStr = transaction.is_fraude ? 'Negada / Anomalia' : 'Aprovada'
  const statusTheme = transaction.is_fraude
    ? 'bg-red-50 text-red-700 border-red-200'
    : 'bg-green-50 text-green-700 border-green-200'

  const dataHoraStr = `${new Date(transaction.data).toLocaleDateString('pt-BR')} às ${transaction.hora || '00:00'}`

  // Ação de Julgamento: dispara PATCH /transactions/{id}
  const handleJulgar = async (confirmarFraude: boolean) => {
    setSalvando(true)
    setErro(null)
    try {
      await axios.patch(`/api/transactions/${transaction.id}`, {
        is_fraude: confirmarFraude,
      })
      setJulgado(confirmarFraude ? 'fraude' : 'legitima')
      onJulgamento?.(transaction.id, confirmarFraude)
    } catch (e: any) {
      setErro('Falha ao salvar julgamento. Verifique a conexão com o servidor e tente novamente.')
    } finally {
      setSalvando(false)
    }
  }

  const mlCharts = [
    { title: 'Análise Z-Score da Conta', endpoint: `/api/ml/calculozscore/${transaction.conta}` },
    { title: 'Curva Gaussiana da Conta', endpoint: `/api/ml/calculogaussiana/${transaction.conta}` },
    { title: 'Análise Geo Distância', endpoint: `/api/ml/geo/distancia/${transaction.conta}` },
    { title: 'Análise Geo Velocidade', endpoint: `/api/ml/geo/velocidade/${transaction.conta}` },
    { title: 'Risco de IP', endpoint: `/api/ml/geo/ip/${transaction.conta}` },
  ]

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho com Tabs */}
        <div className="bg-gray-50 border-b border-gray-200 shrink-0">
          <div className="p-6 pb-0 flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Análise de Transação</h2>
              <p className="text-sm text-gray-500 mt-1">ID da Transação: {transaction.id} • Conta: {transaction.conta}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors bg-white shadow-sm border border-gray-200"
            >
              <span className="text-gray-700 w-5 h-5 flex items-center justify-center"><XIcon /></span>
            </button>
          </div>
          
          <div className="flex gap-6 px-6 mt-6">
            <button
              onClick={() => setActiveTab('detalhes')}
              className={`pb-3 font-semibold text-sm transition-colors border-b-2 ${
                activeTab === 'detalhes' ? 'border-purple-600 text-purple-700' : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              Detalhes da Operação
            </button>
            <button
              onClick={() => setActiveTab('analise')}
              className={`pb-3 font-semibold text-sm transition-colors border-b-2 flex items-center gap-2 ${
                activeTab === 'analise' ? 'border-purple-600 text-purple-700' : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              <span className="w-4 h-4"><ShieldAlertIcon /></span>
              Motor de Análise (ML)
            </button>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="p-6 overflow-y-auto bg-gray-50/50 flex-1">
          
          {activeTab === 'detalhes' && (
            <div className="space-y-6">
              {/* 1. Badge de Status */}
              <div className={`rounded-xl p-4 flex gap-3 items-center border shadow-sm ${statusTheme}`}>
                <span className="w-6 h-6 shrink-0"><AlertCircleIcon /></span>
                <div>
                  <p className="font-bold text-lg">Status: {statusStr}</p>
                  {transaction.is_fraude && (
                    <p className="text-sm mt-0.5 opacity-90 font-medium">Transação bloqueada automaticamente pelo motor estatístico.</p>
                  )}
                </div>
              </div>

              {/* Alerta de Julgamento */}
              {julgado && (
                <div className={`rounded-xl p-4 border shadow-sm flex items-center gap-3 ${julgado === 'fraude' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-green-50 border-green-200 text-green-800'}`}>
                  <span className="w-6 h-6"><CheckCircleIcon /></span>
                  <p className="font-bold">
                    {julgado === 'fraude'
                      ? 'Veredito: Fraude confirmada.'
                      : 'Veredito: Transação aprovada como legítima.'}
                  </p>
                </div>
              )}

              {erro && (
                <div className="rounded-xl p-4 border border-orange-200 bg-orange-50 text-orange-800 flex items-center gap-3 shadow-sm">
                  <span className="w-6 h-6"><ShieldAlertIcon /></span>
                  <p className="text-sm font-bold">{erro}</p>
                </div>
              )}

              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <div className="text-center pb-6 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Valor Solicitado</p>
                  <h3 className="text-5xl font-black text-gray-900 tracking-tight">
                    R$ {transaction.valor.toFixed(2).replace('.', ',')}
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 pt-6">
                  <div>
                    <p className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">
                      <span className="w-4 h-4"><CalendarIcon /></span> Data e Hora
                    </p>
                    <p className="text-gray-900 font-semibold text-lg">{dataHoraStr}</p>
                  </div>
                  <div>
                    <p className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">
                      <span className="w-4 h-4"><TagIcon /></span> Categoria
                    </p>
                    <p className="text-gray-900 font-semibold text-lg">{transaction.categoria}</p>
                  </div>
                  <div>
                    <p className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">
                      <span className="w-4 h-4"><MapPinIcon /></span> Localização
                    </p>
                    <p className="text-gray-900 font-semibold text-lg">{transaction.cidade} - {transaction.estado}</p>
                  </div>
                  <div>
                    <p className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">
                      <span className="w-4 h-4"><CreditCardIcon /></span> Método
                    </p>
                    <p className="text-gray-900 font-semibold text-lg capitalize">{transaction.tipo_transacao}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Comerciante / Destino</p>
                <p className="text-2xl font-bold text-gray-900">{transaction.estabelecimento || transaction.conta}</p>
              </div>

              {transaction.is_fraude && transaction.tentativas > 1 && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex gap-3 items-center">
                  <span className="w-6 h-6 text-orange-600 shrink-0"><AlertCircleIcon /></span>
                  <p className="text-orange-900 text-sm font-medium">
                    Detectadas <strong className="font-black text-orange-700">{transaction.tentativas} tentativas</strong> consecutivas para esta transação.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'analise' && (
            <div className="space-y-6">
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-5">
                <h3 className="font-bold text-purple-900 text-lg mb-2 flex items-center gap-2">
                  <span className="w-5 h-5"><ShieldAlertIcon /></span> Perfil Comportamental da Conta
                </h3>
                <p className="text-sm text-purple-800">
                  Estes gráficos são gerados <strong>em tempo real</strong> pelo motor de Inteligência Artificial processando o histórico completo da conta <strong className="font-mono bg-purple-100 px-1 rounded">{transaction.conta}</strong>. Utilize estas métricas estatísticas, geográficas e de velocidade para embasar seu veredito final.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {mlCharts.map((chart, idx) => (
                  <MLChart key={idx} title={chart.title} endpoint={chart.endpoint} delay={idx * 600} />
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Rodapé */}
        <div className="p-6 border-t border-gray-200 bg-white flex justify-between items-center shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors font-bold"
          >
            Sair
          </button>

          {!julgado && (
            <div className="flex gap-4">
              <button
                disabled={salvando}
                onClick={() => handleJulgar(false)}
                className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-sm transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <span className="w-5 h-5"><CheckCircleIcon /></span>
                {salvando ? 'Processando...' : 'Aprovar Operação'}
              </button>

              <button
                disabled={salvando}
                onClick={() => handleJulgar(true)}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-sm transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <span className="w-5 h-5"><ShieldAlertIcon /></span>
                {salvando ? 'Processando...' : 'Confirmar Fraude'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
