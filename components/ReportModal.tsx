'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import ReactMarkdown from 'react-markdown'

interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ReportModal({ isOpen, onClose }: ReportModalProps) {
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isOpen) {
      setLoading(true)
      setError(null)
      setReport(null)

      fetch('/api/ml/relatorio')
        .then(async (res) => {
          if (!res.ok) {
            throw new Error(`Erro na API: ${res.status}`)
          }
          const textData = await res.text()
          // Tenta fazer parse, pois a rota Next.js retorna Buffer que pode ter sido convertido ou não
          try {
            const jsonData = JSON.parse(textData)
            return jsonData.relatorio || jsonData.relatorio_markdown || JSON.stringify(jsonData, null, 2)
          } catch (e) {
            return textData
          }
        })
        .then((data) => {
          setReport(data)
          setLoading(false)
        })
        .catch((err) => {
          setError(err.message || 'Erro ao gerar o relatório.')
          setLoading(false)
        })
    }
  }, [isOpen])

  if (!isOpen || !mounted) return null

  const handlePrint = () => {
    window.print()
  }

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 sm:p-6 print:p-0 print:bg-white print:block">
      {/* Container principal do modal */}
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col max-h-full overflow-hidden print:shadow-none print:w-full print:max-w-none print:h-auto print:overflow-visible">
        
        {/* Cabeçalho */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 print:hidden">
          <h2 className="text-xl font-bold text-gray-800">Relatório de Análise (IA Generativa)</h2>
          <div className="flex gap-2">
            {!loading && report && (
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-bb-blue text-white font-semibold rounded-lg hover:bg-bb-blue/90 transition-colors"
              >
                Imprimir / PDF
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Corpo com scroll */}
        <div id="report-modal-content" className="p-6 overflow-y-auto flex-1 bg-gray-50 print:bg-white print:overflow-visible print:p-0 print:absolute print:left-0 print:top-0 print:w-full">
          
          {/* Título apenas para a impressão */}
          <h1 className="hidden print:block text-2xl font-bold mb-4">Relatório de Análise Geral de Anomalias</h1>
          
          {loading && (
            <div className="flex flex-col items-center justify-center h-64 space-y-4 print:hidden">
              <div className="w-10 h-10 border-4 border-bb-yellow border-t-bb-blue rounded-full animate-spin"></div>
              <p className="text-gray-600 font-medium text-center">
                A IA está processando todo o banco de dados...<br/>
                Isso pode levar alguns segundos.
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-800 p-4 rounded-lg print:hidden">
              <p className="font-bold">Ocorreu um erro:</p>
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && report && (
            <div className="bg-white p-6 sm:p-8 rounded-lg border border-gray-200 shadow-sm print:border-none print:shadow-none print:p-0">
              <div className="text-sm md:text-base break-words">
                <ReactMarkdown
                  components={{
                    h1: ({node, ...props}) => <h1 className="text-2xl font-bold mt-8 mb-4 text-gray-900" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-xl font-bold mt-6 mb-3 text-gray-800" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-lg font-bold mt-5 mb-2 text-bb-blue" {...props} />,
                    p: ({node, ...props}) => <p className="mb-4 text-gray-700 leading-relaxed text-justify" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-1" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-4 text-gray-700 space-y-1" {...props} />,
                    li: ({node, ...props}) => <li {...props} />,
                    strong: ({node, ...props}) => <strong className="font-[800] text-gray-900" {...props} />,
                    b: ({node, ...props}) => <b className="font-[800] text-gray-900" {...props} />,
                    em: ({node, ...props}) => <em className="italic text-gray-800" {...props} />,
                    blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-bb-yellow pl-4 italic text-gray-600 mb-4" {...props} />
                  }}
                >
                  {report}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}
