'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { createTransaction } from '@/lib/api'

const CATEGORIES = [
  'Alimentacao',
  'Transporte',
  'Saude',
  'Educacao',
  'Compras',
  'Lazer',
  'Utilidades',
  'Investimento',
]

const CITIES = [
  'Sao Paulo',
  'Rio de Janeiro',
  'Belo Horizonte',
  'Curitiba',
  'Salvador',
  'Brasilia',
  'Manaus',
  'Recife',
  'Porto Alegre',
  'Fortaleza',
  'Campinas',
]

const TRANSACTION_TYPES = ['debito', 'credito', 'transferencia']
const DEVICES = ['celular', 'web', 'caixa', 'smartwatch']

interface CreateTransactionFormData {
  conta: string
  valor: number
  data: string
  hora: string
  categoria: string
  cidade: string
  tipo_transacao: string
  dispositivo: string
  latitude?: number
  longitude?: number
}

interface CreateTransactionModalProps {
  onClose: () => void
  onSuccess: () => void
}

export default function CreateTransactionModal({ onClose, onSuccess }: CreateTransactionModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateTransactionFormData>({
    defaultValues: {
      data: new Date().toISOString().split('T')[0],
      hora: new Date().toTimeString().split(' ')[0],
    },
  })

  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const onSubmit = async (data: CreateTransactionFormData) => {
    try {
      setError(null)
      // Injeta default values para campos exigidos pelo back-end que não estão no formulário frontend
      const payload = {
        ...data,
        dia_semana: new Date(data.data).toLocaleDateString('pt-BR', { weekday: 'long' }),
        estado: 'SP',
        pais: 'Brasil',
        estabelecimento: 'Estabelecimento Padrão',
        tentativas: 1,
        ip_origem: '192.168.0.1',
        is_fraude: false,
        latitude: data.latitude || -23.5505,
        longitude: data.longitude || -46.6333
      }
      
      await createTransaction(payload as any)
      setSuccess(true)
      setTimeout(() => {
        onSuccess()
      }, 1500)
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
        <div className="sticky top-0 bg-gray-100 border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Nova Transação</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {success ? (
          <div className="p-6 text-center">
            <div className="text-4xl mb-4">✅</div>
            <p className="text-green-600 font-semibold">Transação criada com sucesso!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Conta *</label>
                <input
                  type="text"
                  {...register('conta', { required: 'Campo obrigatório' })}
                  placeholder="CONTA_00001"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {errors.conta && (
                  <p className="text-red-500 text-xs mt-1">{errors.conta.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Valor *</label>
                <input
                  type="number"
                  step="0.01"
                  {...register('valor', {
                    required: 'Campo obrigatório',
                    min: { value: 0.01, message: 'Deve ser maior que 0' },
                  })}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {errors.valor && (
                  <p className="text-red-500 text-xs mt-1">{errors.valor.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data *</label>
                <input
                  type="date"
                  {...register('data', { required: 'Campo obrigatório' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {errors.data && (
                  <p className="text-red-500 text-xs mt-1">{errors.data.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hora *</label>
                <input
                  type="time"
                  {...register('hora', { required: 'Campo obrigatório' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {errors.hora && (
                  <p className="text-red-500 text-xs mt-1">{errors.hora.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Categoria *</label>
                <select
                  {...register('categoria', { required: 'Campo obrigatório' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Selecione...</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                {errors.categoria && (
                  <p className="text-red-500 text-xs mt-1">{errors.categoria.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cidade *</label>
                <select
                  {...register('cidade', { required: 'Campo obrigatório' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Selecione...</option>
                  {CITIES.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
                {errors.cidade && (
                  <p className="text-red-500 text-xs mt-1">{errors.cidade.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Transação *</label>
                <select
                  {...register('tipo_transacao', { required: 'Campo obrigatório' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Selecione...</option>
                  {TRANSACTION_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                {errors.tipo_transacao && (
                  <p className="text-red-500 text-xs mt-1">{errors.tipo_transacao.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dispositivo *</label>
                <select
                  {...register('dispositivo', { required: 'Campo obrigatório' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Selecione...</option>
                  {DEVICES.map((device) => (
                    <option key={device} value={device}>
                      {device}
                    </option>
                  ))}
                </select>
                {errors.dispositivo && (
                  <p className="text-red-500 text-xs mt-1">{errors.dispositivo.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Latitude (opcional)</label>
                <input
                  type="number"
                  step="0.0001"
                  {...register('latitude')}
                  placeholder="-23.55"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Longitude (opcional)</label>
                <input
                  type="number"
                  step="0.0001"
                  {...register('longitude')}
                  placeholder="-46.63"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3 -mx-6 -mb-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
