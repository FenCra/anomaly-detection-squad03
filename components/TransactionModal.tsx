'use client'

import React from 'react'
import { Transaction } from '@/lib/api'
import { AlertCircleIcon, XIcon, CalendarIcon, TagIcon, MapPinIcon, CreditCardIcon } from './Icons'

interface TransactionModalProps {
  transaction: Transaction
  onClose: () => void
}

export default function TransactionModal({ transaction, onClose }: TransactionModalProps) {
  if (!transaction) return null

  // Status mapping
  let statusStr = 'Normal'
  let statusTheme = 'bg-green-50 text-green-700 border-green-200'
  if (transaction.is_fraude) {
    statusStr = 'Anomalia'
    statusTheme = 'bg-red-50 text-red-700 border-red-200'
  } else if (transaction.tentativas && transaction.tentativas > 1) {
    statusStr = 'Suspeita'
    statusTheme = 'bg-yellow-50 text-yellow-700 border-yellow-200'
  }

  const dataHoraStr = `${new Date(transaction.data).toLocaleDateString('pt-BR')} às ${transaction.hora || '00:00'}`

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
            </div>
          </div>

          {/* 2. Valor da Transação */}
          <div className="text-center py-4">
            <p className="text-sm text-gray-600 mb-1">Valor da Transação</p>
            <h3 className="text-4xl font-bold text-gray-900">
              R$ {transaction.valor.toFixed(2)}
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

          {/* 5. Informações Adicionais (Condicional) */}
          {(statusStr === 'Anomalia' || statusStr === 'Suspeita') && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Informações Adicionais</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                {statusStr === 'Anomalia' ? (
                  <>
                    <li>• Transação marcada como anomalia pelo sistema</li>
                    <li>• Recomenda-se verificação manual</li>
                    <li>• Padrão de compra fora do comum detectado</li>
                  </>
                ) : (
                  <>
                    <li>• Transação marcada como suspeita</li>
                    <li>• Monitoramento ativo em andamento</li>
                    <li>• Pode requerer ação futura</li>
                  </>
                )}
              </ul>
            </div>
          )}

        </div>

        {/* Rodapé do Modal */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end shrink-0">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors font-medium"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
