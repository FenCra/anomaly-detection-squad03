'use client'

import { useState, useEffect } from 'react'
import { HelpCircleIcon, ShieldAlertIcon, ActivityIcon, CreditCardIcon, BookOpenIcon, ChevronLeftIcon, ChevronRightIcon } from '@/components/Icons'

export default function Ajuda() {
  const dicas = [
    {
      titulo: "O Lightbox Interativo",
      texto: "Os gráficos exportados não são imagens estáticas, eles contêm muitos micro-dados. Dentro do Modal da Transação, na aba 'Motor de ML', clique em qualquer gráfico gerado para abri-lo em Tela Cheia Escurecida. Use a tecla Esc para fechar."
    },
    {
      titulo: "Filtros Combinados",
      texto: "Na tabela de Transações, você pode pesquisar por uma cidade ou estado usando o campo de texto enquanto mantém uma Conta específica selecionada no dropdown. O cruzamento de dados acontece instantaneamente no front-end."
    },
    {
      titulo: "Identificação Rápida de Risco",
      texto: "Transações reprovadas pelo modelo Gaussiano ou de Z-Score recebem a badge de 'Anomalia' e são coloridas de vermelho. Sempre priorize auditar estas linhas primeiro durante o expediente."
    },
    {
      titulo: "Geolocalização Impossível",
      texto: "Se nosso motor disparar um alerta de Geo-Distância, ele detectou que o mesmo cartão foi passado em locais fisicamente distantes num curto espaço de tempo (ex: RJ e NY em 5 minutos). Trate como fraude certa."
    }
  ]

  const [dicaAtiva, setDicaAtiva] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  // Rotação automática das dicas a cada 10 segundos
  useEffect(() => {
    if (isPaused) return
    const timer = setInterval(() => {
      setDicaAtiva((prev) => (prev === dicas.length - 1 ? 0 : prev + 1))
    }, 10000)
    return () => clearInterval(timer)
  }, [dicas.length, isPaused])

  const nextDica = () => setDicaAtiva((p) => (p === dicas.length - 1 ? 0 : p + 1))
  const prevDica = () => setDicaAtiva((p) => (p === 0 ? dicas.length - 1 : p - 1))

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      
      {/* Header Full-Width */}
      <div className="bg-gradient-to-br from-bb-blue to-blue-900 rounded-2xl p-8 text-white shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                <HelpCircleIcon />
              </span>
              <h1 className="text-3xl font-black tracking-tight">Central de Ajuda & Documentação</h1>
            </div>
            <p className="text-blue-100 text-lg max-w-3xl font-medium leading-relaxed">
              Tudo o que você precisa saber para operar o sistema de Caça às Anomalias. 
              Entenda o monitoramento transacional e decifre nosso motor estatístico de Machine Learning.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 text-center">
              <p className="text-xs text-blue-200 uppercase font-bold tracking-wider mb-1">Versão do Sistema</p>
              <p className="text-xl font-black">v1.0.0-stable</p>
            </div>
          </div>
        </div>
        {/* Abstract Background Decoration */}
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
          <svg width="400" height="400" viewBox="0 0 100 100" fill="currentColor">
            <circle cx="50" cy="50" r="50" />
          </svg>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Menu Lateral Sticky (Fixado durante o scroll) */}
        <div className="col-span-1 sticky top-8 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm shadow-gray-200/40">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 px-1">Navegação Rápida</h3>
            <nav className="flex flex-col gap-1.5">
              <a href="#dashboard" className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 text-gray-700 hover:text-bb-blue transition-all font-semibold text-sm group">
                <span className="w-5 h-5 text-gray-400 group-hover:text-bb-blue transition-colors"><ActivityIcon /></span> 
                1. Visão Geral
              </a>
              <a href="#transacoes" className="flex items-center gap-3 p-3 rounded-xl hover:bg-green-50 text-gray-700 hover:text-green-700 transition-all font-semibold text-sm group">
                <span className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors"><CreditCardIcon /></span> 
                2. Histórico e Auditoria
              </a>
              <a href="#ml" className="flex items-center gap-3 p-3 rounded-xl hover:bg-purple-50 text-gray-700 hover:text-purple-700 transition-all font-semibold text-sm group">
                <span className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors"><ShieldAlertIcon /></span> 
                3. Motor Analítico (ML)
              </a>
            </nav>
          </div>
          
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 text-sm text-gray-500">
            <p className="font-medium text-gray-700 mb-1 flex items-center gap-2">
              <BookOpenIcon /> Precisa de suporte técnico?
            </p>
            Entre em contato com o Squad 03 de Engenharia de Dados para manutenção das bases ou ajustes nos parâmetros do ML.
          </div>
        </div>

        {/* Conteúdo Principal Full-Width Restante */}
        <div className="col-span-1 lg:col-span-3 space-y-8">
          
          <section id="dashboard" className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm shadow-gray-200/40 scroll-mt-8">
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3 mb-6">
              <span className="w-8 h-8 rounded-full bg-blue-50 text-bb-blue flex items-center justify-center"><ActivityIcon /></span> 
              1. Visão Geral (Dashboard)
            </h2>
            <div className="space-y-5 text-gray-600 text-base leading-relaxed">
              <p>O <strong>Dashboard</strong> é a sua central de comando gerencial. Ele compila KPIs (Indicadores-Chave de Performance) processados em tempo real com base no volume atual de dados inseridos na base SQL Server.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <h4 className="font-bold text-gray-900 mb-2">Métricas de Comparação</h4>
                  <p className="text-sm">Os percentuais nos cards principais (verde/vermelho) indicam o crescimento ou a redução em relação ao volume do mês anterior. Uma redução no número de anomalias, por exemplo, é lida pelo sistema como um avanço positivo.</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <h4 className="font-bold text-gray-900 mb-2">Gráficos Direcionais</h4>
                  <p className="text-sm">Os gráficos de rosca e de barras possuem tooltips interativos flutuantes. Para isolar dados específicos, basta passar o cursor do mouse pelas seções coloridas.</p>
                </div>
              </div>
            </div>
          </section>

          <section id="transacoes" className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm shadow-gray-200/40 scroll-mt-8">
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3 mb-6">
              <span className="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center"><CreditCardIcon /></span> 
              2. Histórico e Auditoria de Transações
            </h2>
            <div className="space-y-5 text-gray-600 text-base leading-relaxed">
              <p>A interface de <strong>Transações</strong> foi desenhada para facilitar auditorias rápidas. A tabela renderiza grandes volumes de dados de forma paginada e permite buscas por texto livre instantâneas no front-end.</p>
              <ul className="list-disc pl-5 space-y-3">
                <li><strong>Filtro Específico por Conta:</strong> Utilizando o seletor superior, o analista pode isolar todo o histórico de um único cliente, enviando uma requisição direta à API.</li>
                <li><strong>Alertas Visuais:</strong> Transações marcadas com uma borda avermelhada forte 🔴 representam bloqueios do nosso motor. Elas falharam nos parâmetros de segurança e exigem intervenção humana (aprovação ou confirmação da fraude).</li>
                <li><strong>Modal de Profundidade:</strong> Um simples clique na linha da tabela revela a modal de auditoria, contendo todas as variáveis: lojista, horário exato, número de tentativas de débito e IP do pagador.</li>
              </ul>
            </div>
          </section>

          <section id="ml" className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm shadow-gray-200/40 scroll-mt-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-100 rounded-bl-full -z-10 opacity-30 pointer-events-none"></div>
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3 mb-6">
              <span className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center"><ShieldAlertIcon /></span> 
              3. Motor Analítico (Machine Learning)
            </h2>
            <div className="space-y-5 text-gray-600 text-base leading-relaxed">
              <p>O cérebro anti-fraude opera em um Backend construído com Python (FastAPI + Pandas + SciPy). Os modelos não usam regras fixas de `IF/ELSE`, mas sim estatística preditiva para apontar discrepâncias no comportamento padrão das contas.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="border border-purple-100 bg-white rounded-xl p-5 shadow-sm">
                  <h4 className="font-black text-purple-800 text-lg mb-2">Análise Z-Score</h4>
                  <p className="text-sm">Mede quantos "desvios padrões" um valor está longe da média daquele usuário. Valores com <strong>Z {'>'} 3</strong> são estatisticamente anômalos (menos de 0,3% de chance de ocorrerem naturalmente).</p>
                </div>
                <div className="border border-purple-100 bg-white rounded-xl p-5 shadow-sm">
                  <h4 className="font-black text-purple-800 text-lg mb-2">Curva Gaussiana</h4>
                  <p className="text-sm">Distribuição normal (formato de sino) das compras da conta. O analista consegue visualizar graficamente se o valor cobrado está na base da curva (gasto rotineiro) ou na "cauda" extremidade (suspeita forte).</p>
                </div>
                <div className="border border-purple-100 bg-white rounded-xl p-5 shadow-sm">
                  <h4 className="font-black text-purple-800 text-lg mb-2">Geo-Distância Inviável</h4>
                  <p className="text-sm">Rastreia o `(Latitude, Longitude)` de compras consecutivas do mesmo cartão. Se houver uma compra em SP e outra em Miami 10 minutos depois, a distância temporal vs física é calculada e travada por limite humano.</p>
                </div>
                <div className="border border-purple-100 bg-white rounded-xl p-5 shadow-sm">
                  <h4 className="font-black text-purple-800 text-lg mb-2">Análise de Redes (IP)</h4>
                  <p className="text-sm">Cruza o Endereço de IP da solicitação bancária atual com a base histórica de IPs que o cliente normalmente usa (sua casa, roteador do celular, escritório).</p>
                </div>
              </div>

              {/* Carrossel Interativo de Dicas */}
              <div 
                className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 rounded-2xl p-5 mt-8 shadow-sm transition-all"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-purple-200 text-purple-700 flex items-center justify-center">
                      <ActivityIcon />
                    </span>
                    <h4 className="font-bold text-purple-900">Dicas de Produtividade</h4>
                  </div>
                  <div className="flex gap-1">
                    {dicas.map((_, i) => (
                      <button 
                        key={i} 
                        onClick={() => setDicaAtiva(i)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${i === dicaAtiva ? 'w-5 bg-purple-600' : 'w-2 bg-purple-300 hover:bg-purple-400'}`}
                        title={`Ir para dica ${i + 1}`}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="min-h-[70px] relative">
                  <p className="text-sm text-purple-900 font-bold mb-1">{dicas[dicaAtiva].titulo}</p>
                  <p className="text-sm text-purple-800/90 leading-relaxed animate-in fade-in zoom-in-95 duration-300">
                    {dicas[dicaAtiva].texto}
                  </p>
                </div>

                <div className="flex justify-end gap-2 mt-4">
                  <button onClick={prevDica} className="p-2 rounded-lg hover:bg-purple-200 text-purple-700 transition-colors shadow-sm bg-white/50 border border-purple-200/50" title="Dica Anterior">
                    <span className="w-4 h-4 block"><ChevronLeftIcon /></span>
                  </button>
                  <button onClick={nextDica} className="p-2 rounded-lg hover:bg-purple-200 text-purple-700 transition-colors shadow-sm bg-white/50 border border-purple-200/50" title="Próxima Dica">
                    <span className="w-4 h-4 block"><ChevronRightIcon /></span>
                  </button>
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}
