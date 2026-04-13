'use client'

import React, { useState } from 'react'
import { Transaction } from '@/lib/api'
import { AlertCircleIcon, XIcon, CalendarIcon, TagIcon, MapPinIcon, CreditCardIcon, CheckCircleIcon, ShieldAlertIcon } from './Icons'
import axios from 'axios'

interface TransactionModalProps {
  transaction: Transaction
  onClose: () => void
  onJulgamento?: (id: number, isFraude: boolean) => void
}

export default function TransactionModal({ transaction, onClose, onJulgamento }: TransactionModalProps) {
  if (!transaction) return null

  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [julgado, setJulgado] = useState<'fraude' | 'legitima' | null>(null)

  // Status baseado somente em is_fraude (fonte da verdade: backend)
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
      // Falha de Conexão (Exceção do Caso de Uso): notificar sem remover da fila
      setErro('Falha ao salvar julgamento. Verifique a conexão com o servidor e tente novamente.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-semibold text-gray-900">Detalhes da Transação</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <span className="text-gray-700 w-5 h-5 flex items-center justify-center"><XIcon /></span>
          </button>
        </div>

        {/* Conteúdo Principal */}
        <div className="p-6 space-y-6 overflow-y-auto">

          {/* 1. Badge de Status */}
          <div className={`rounded-lg p-4 flex gap-2 items-center border ${statusTheme}`}>
            <span className="w-5 h-5"><AlertCircleIcon /></span>
            <div>
              <p className="font-semibold">Status: {statusStr}</p>
              {transaction.is_fraude && (
                <p className="text-sm mt-0.5 opacity-80">Sinalizada pelo motor de detecção de anomalias</p>
              )}
            </div>
          </div>

          {/* Alerta de Julgamento já Executado */}
          {julgado && (
            <div className={`rounded-lg p-4 border flex items-center gap-2 ${julgado === 'fraude' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`}>
              <span className="w-5 h-5"><CheckCircleIcon /></span>
              <p className="font-semibold">
                {julgado === 'fraude'
                  ? 'Fraude confirmada e registrada com sucesso.'
                  : 'Transação aprovada como legítima com sucesso.'}
              </p>
            </div>
          )}

          {/* Alerta de Erro de Conexão */}
          {erro && (
            <div className="rounded-lg p-4 border border-orange-200 bg-orange-50 text-orange-700 flex items-center gap-2">
              <span className="w-5 h-5"><ShieldAlertIcon /></span>
              <p className="text-sm font-medium">{erro}</p>
            </div>
          )}

          {/* 2. Valor da Transação */}
          <div className="text-center py-4">
            <p className="text-sm text-gray-600 mb-1">Valor da Transação</p>
            <h3 className="text-4xl font-bold text-gray-900">
              R$ {transaction.valor.toFixed(2).replace('.', ',')}
            </h3>
          </div>

          {/* 3. Grade de Detalhes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="flex items-center gap-2 text-gray-600 text-sm">
                <span className="text-gray-400 w-4 h-4"><CalendarIcon /></span> Data e Hora
              </p>
              <p className="text-gray-900 font-medium ml-6">{dataHoraStr}</p>
            </div>

            <div className="space-y-1">
              <p className="flex items-center gap-2 text-gray-600 text-sm">
                <span className="text-gray-400 w-4 h-4"><TagIcon /></span> Categoria
              </p>
              <p className="text-gray-900 font-medium ml-6">{transaction.categoria}</p>
            </div>

            <div className="space-y-1">
              <p className="flex items-center gap-2 text-gray-600 text-sm">
                <span className="text-gray-400 w-4 h-4"><MapPinIcon /></span> Localização
              </p>
              <p className="text-gray-900 font-medium ml-6">{transaction.cidade} - {transaction.estado}</p>
            </div>

            <div className="space-y-1">
              <p className="flex items-center gap-2 text-gray-600 text-sm">
                <span className="text-gray-400 w-4 h-4"><CreditCardIcon /></span> Método de Pagamento
              </p>
              <p className="text-gray-900 font-medium ml-6">{transaction.tipo_transacao}</p>
            </div>
          </div>

          {/* 4. Informações do Comerciante */}
          <div className="border-t border-gray-200 pt-4">
            <p className="text-sm text-gray-600 mb-1">Comerciante</p>
            <p className="text-lg font-semibold text-gray-900">{transaction.estabelecimento || transaction.conta}</p>
          </div>

          {/* 5. Informações Adicionais (apenas quando é anomalia) */}
          {transaction.is_fraude && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Informações Adicionais</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Transação sinalizada como anomalia pelo motor de ML</li>
                <li>• Recomenda-se verificação manual antes de confirmar</li>
                {transaction.tentativas > 1 && (
                  <li>• Detectadas <strong>{transaction.tentativas}</strong> tentativas para esta transação</li>
                )}
              </ul>
            </div>
          )}

        </div>

        {/* Rodapé do Modal — Ações de Julgamento */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-between items-center shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors font-medium"
          >
            Fechar
          </button>

          {/* Botões de Julgamento — só aparecem se ainda não foi julgado */}
          {!julgado && (
            <div className="flex gap-3">
              <button
                id="btn-aprovar-transacao"
                disabled={salvando}
                onClick={() => handleJulgar(false)}
                className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <span className="w-4 h-4"><CheckCircleIcon /></span>
                {salvando ? 'Salvando...' : 'Aprovar Transação'}
              </button>

              <button
                id="btn-confirmar-fraude"
                disabled={salvando}
                onClick={() => handleJulgar(true)}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <span className="w-4 h-4"><ShieldAlertIcon /></span>
                {salvando ? 'Salvando...' : 'Confirmar Fraude'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
