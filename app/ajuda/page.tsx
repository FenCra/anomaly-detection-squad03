'use client'

import { useState, useEffect } from 'react'
import { HelpCircleIcon, ShieldAlertIcon, ActivityIcon, CreditCardIcon, BookOpenIcon, ChevronLeftIcon, ChevronRightIcon } from '@/components/Icons'

export default function Ajuda() {
  const dicas = [
    {
      titulo: "O Lightbox Interativo",
      texto: "Os gráficos exportados não são imagens estáticas, eles contêm micro-dados. Dentro do Modal da Transação, na aba 'Motor de ML', basta clicar em qualquer gráfico gerado para abri-lo em Tela Cheia Escurecida. O uso da tecla Esc fecha a visualização."
    },
    {
      titulo: "Filtros Combinados",
      texto: "Na tabela de Transações, é possível pesquisar por uma cidade ou estado usando o campo de texto enquanto se mantém uma Conta específica selecionada no seletor principal. O cruzamento de dados acontece instantaneamente na interface."
    },
    {
      titulo: "Identificação Rápida de Risco",
      texto: "Transações reprovadas pelo modelo Gaussiano ou de Z-Score recebem a marcação de 'Anomalia' e são destacadas com a cor vermelha. Recomenda-se priorizar a auditoria destas linhas primeiro durante o fluxo de trabalho."
    },
    {
      titulo: "Geolocalização Impossível",
      texto: "Se o sistema disparar um alerta de Geo-Distância, significa que o mesmo cartão foi passado em locais fisicamente distantes num curto espaço de tempo (ex: Rio de Janeiro e Nova York em 5 minutos). O cenário é tratado estatisticamente como fraude confirmada."
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
              <h1 className="text-3xl font-black tracking-tight">Manual e Documentação</h1>
            </div>
            <p className="text-blue-100 text-lg max-w-3xl font-medium leading-relaxed">
              Sistema Inteligente de Detecção de Anomalias. Este manual apresenta de forma descritiva e direta as orientações necessárias sobre as funcionalidades operacionais e os parâmetros de segurança aplicados às transações financeiras.
            </p>
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
              <a href="#introducao" className="flex items-center gap-3 p-3 rounded-xl hover:bg-yellow-50 text-gray-700 hover:text-yellow-700 transition-all font-semibold text-sm group">
                <span className="w-5 h-5 text-gray-400 group-hover:text-yellow-600 transition-colors"><HelpCircleIcon /></span> 
                1. Introdução ao Sistema
              </a>
              <a href="#seu-papel" className="flex items-center gap-3 p-3 rounded-xl hover:bg-orange-50 text-gray-700 hover:text-orange-700 transition-all font-semibold text-sm group">
                <span className="w-5 h-5 text-gray-400 group-hover:text-orange-600 transition-colors"><BookOpenIcon /></span> 
                2. O Papel do Analista
              </a>
              <a href="#dashboard" className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 text-gray-700 hover:text-bb-blue transition-all font-semibold text-sm group">
                <span className="w-5 h-5 text-gray-400 group-hover:text-bb-blue transition-colors"><ActivityIcon /></span> 
                3. Visão Geral do Painel
              </a>
              <a href="#transacoes" className="flex items-center gap-3 p-3 rounded-xl hover:bg-green-50 text-gray-700 hover:text-green-700 transition-all font-semibold text-sm group">
                <span className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors"><CreditCardIcon /></span> 
                4. Análise de Transações
              </a>
              <a href="#ml" className="flex items-center gap-3 p-3 rounded-xl hover:bg-purple-50 text-gray-700 hover:text-purple-700 transition-all font-semibold text-sm group">
                <span className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors"><ShieldAlertIcon /></span> 
                5. Análise Estatística
              </a>
            </nav>
          </div>
          
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 text-sm text-gray-500">
            <p className="font-medium text-gray-700 mb-1 flex items-center gap-2">
              <BookOpenIcon /> Suporte Técnico
            </p>
            É recomendado relatar instabilidades na interface ou solicitar manutenção técnica diretamente aos desenvolvedores responsáveis (Squad 03).
          </div>
        </div>

        {/* Conteúdo Principal Full-Width Restante */}
        <div className="col-span-1 lg:col-span-3 space-y-8 pb-20">
          
          <section id="introducao" className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm shadow-gray-200/40 scroll-mt-8">
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3 mb-6">
              <span className="w-8 h-8 rounded-full bg-yellow-50 text-yellow-600 flex items-center justify-center"><HelpCircleIcon /></span> 
              1. Introdução ao Sistema
            </h2>
            <div className="space-y-5 text-gray-600 text-base leading-relaxed">
              <p>A finalidade da plataforma é auxiliar na proteção das contas financeiras e na prevenção de fraudes. O software opera como uma ferramenta de monitoramento contínuo: frente a milhares de transações registradas diariamente, a revisão manual de cada operação torna-se inviável e suscetível a falhas.</p>
              <p>Para solucionar essa volumetria, a aplicação processa as transações em tempo real. Os dados recebidos são cruzados com históricos e perfis de consumo, aplicando modelos estatísticos para identificar comportamentos atípicos. Esse processo otimiza a auditoria operacional, destacando apenas os casos que apresentam real probabilidade de fraude ou clonagem.</p>
            </div>
          </section>

          <section id="seu-papel" className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm shadow-gray-200/40 scroll-mt-8">
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3 mb-6">
              <span className="w-8 h-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center"><BookOpenIcon /></span> 
              2. O Papel do Analista de Prevenção
            </h2>
            <div className="space-y-5 text-gray-600 text-base leading-relaxed">
              <p>O software não executa o bloqueio de transações de forma automatizada. A ausência de bloqueios autônomos tem o objetivo de evitar falsos positivos — ou seja, cenários nos quais compras legítimas, realizadas durante viagens ou fora da rotina, acabem retidas. Intervenções sistêmicas incorretas geram desgastes severos no relacionamento com o cliente.</p>
              <p>O fluxo de trabalho baseia-se na sinalização visual das movimentações classificadas como suspeitas. Cabe ao Analista de Prevenção realizar a vistoria dos dados marcados, revisando informações cruciais como o local da operação, o horário e o valor faturado. O sistema permanecerá aguardando a deliberação do analista, que detém a responsabilidade final de confirmar a incidência de fraude ou emitir a aprovação da compra avaliada.</p>
            </div>
          </section>

          <section id="dashboard" className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm shadow-gray-200/40 scroll-mt-8">
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3 mb-6">
              <span className="w-8 h-8 rounded-full bg-blue-50 text-bb-blue flex items-center justify-center"><ActivityIcon /></span> 
              3. Visão Geral do Painel
            </h2>
            <div className="space-y-5 text-gray-600 text-base leading-relaxed">
              <p>O Painel Inicial (Dashboard) funciona como o centro de monitoramento gerencial do ambiente. Ele agrupa os principais indicadores operacionais e os dispõe graficamente para fornecer um diagnóstico rápido da saúde do sistema.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <h4 className="font-bold text-gray-900 mb-2">Indicadores Principais</h4>
                  <p className="text-sm">Os visores numéricos exibem o volume de transações processadas no mês atual, o capital total movimentado e a quantidade de fraudes detectadas. Os percentuais anexados demonstram a variação em relação ao mês anterior, servindo de métrica direta de desempenho.</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <h4 className="font-bold text-gray-900 mb-2">Representações Gráficas</h4>
                  <p className="text-sm">Os gráficos sumarizam as informações da base de dados, ilustrando a distribuição de transações por horários e as faixas monetárias mais frequentes. O posicionamento do cursor sobre as áreas coloridas revela os quantitativos consolidados correspondentes.</p>
                </div>
              </div>
            </div>
          </section>

          <section id="transacoes" className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm shadow-gray-200/40 scroll-mt-8">
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3 mb-6">
              <span className="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center"><CreditCardIcon /></span> 
              4. Análise de Transações
            </h2>
            <div className="space-y-5 text-gray-600 text-base leading-relaxed">
              <p>A aba de Transações contém a tabela contínua de registros globais. O carregamento ocorre de forma fragmentada (paginação), mantendo o desempenho da interface independentemente do tamanho da base de dados.</p>
              <ul className="list-disc pl-5 space-y-3">
                <li><strong>Mecanismos de Busca:</strong> A ferramenta permite realizar pesquisas granulares através dos parâmetros da barra superior. É viável isolar resultados por localidade, conta específica, datas ou por status final de aprovação.</li>
                <li><strong>Sinalização Visual:</strong> Operações classificadas estatisticamente como suspeitas recebem uma marcação de borda avermelhada e um selo descritivo de anomalia. Esses itens exigem auditoria prioritária.</li>
                <li><strong>Detalhamento Operacional:</strong> A seleção de qualquer registro da tabela expande um painel de detalhes (Modal). Este painel compila os atributos técnicos da solicitação, englobando a geolocalização do pagamento, fuso horário e o endereço de rede (IP).</li>
              </ul>
            </div>
          </section>

          <section id="ml" className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm shadow-gray-200/40 scroll-mt-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-100 rounded-bl-full -z-10 opacity-30 pointer-events-none"></div>
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3 mb-6">
              <span className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center"><ShieldAlertIcon /></span> 
              5. Análise Estatística (Identificação de Padrões)
            </h2>
            <div className="space-y-5 text-gray-600 text-base leading-relaxed">
              <p>A arquitetura evita a imposição de tetos monetários fixos, dado que limites rígidos impactariam negativamente os usuários com maior capacidade financeira. Em vez disso, a modelagem utiliza análise estatística contínua para mapear o padrão financeiro de cada conta de forma individualizada, sinalizando apenas os desvios matemáticos expressivos.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="border border-purple-100 bg-white rounded-xl p-5 shadow-sm">
                  <h4 className="font-black text-purple-800 text-lg mb-2">Análise Z-Score</h4>
                  <p className="text-sm">O modelo afere a média de valores movimentados pela conta. Se uma transação apresentar um montante excessivamente discrepante em relação à rotina estabelecida por aquele cliente específico, o cálculo emite um alerta de desvio estatístico.</p>
                </div>
                <div className="border border-purple-100 bg-white rounded-xl p-5 shadow-sm">
                  <h4 className="font-black text-purple-800 text-lg mb-2">Curva Gaussiana</h4>
                  <p className="text-sm">Os pagamentos cotidianos de um usuário mantêm uma certa previsibilidade. A modelagem concentra esses pagamentos comuns no centro de um gráfico de distribuição. Transações isoladas que caem nas extremidades desta distribuição são tratadas pelo algoritmo como ocorrências raras e potencialmente fraudulentas.</p>
                </div>
                <div className="border border-purple-100 bg-white rounded-xl p-5 shadow-sm">
                  <h4 className="font-black text-purple-800 text-lg mb-2">Parâmetro de Geo-Distância</h4>
                  <p className="text-sm">O sistema monitora o tempo e o deslocamento geográfico (Latitude e Longitude) entre usos seguidos de um mesmo cartão. Autorizações físicas provenientes de cidades distantes em um intervalo de tempo insuficiente para o deslocamento humano geram sinalização imediata de clonagem.</p>
                </div>
                <div className="border border-purple-100 bg-white rounded-xl p-5 shadow-sm">
                  <h4 className="font-black text-purple-800 text-lg mb-2">Mapeamento de IP</h4>
                  <p className="text-sm">Requisições processadas em ambiente digital contêm o endereço de origem da rede de internet (IP). A aplicação armazena os endereços rotineiramente utilizados. Caso uma requisição parta de rotas de rede internacionais sem registro prévio, a análise classificará o evento como possível acesso indevido.</p>
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
                    <h4 className="font-bold text-purple-900">Dicas e Atalhos Operacionais</h4>
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
