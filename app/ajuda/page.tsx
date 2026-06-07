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
              <h1 className="text-3xl font-black tracking-tight">Manual e Ajuda</h1>
            </div>
            <p className="text-blue-100 text-lg max-w-3xl font-medium leading-relaxed">
              Bem-vindo ao Sistema Inteligente de Detecção de Anomalias. Preparamos este manual com uma linguagem clara e direta para guiar você pelas funcionalidades e análises de segurança do nosso banco.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 text-center">
              <p className="text-xs text-blue-200 uppercase font-bold tracking-wider mb-1">Versão do Sistema</p>
              <p className="text-xl font-black">v2.0.0-stable</p>
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
              <a href="#introducao" className="flex items-center gap-3 p-3 rounded-xl hover:bg-yellow-50 text-gray-700 hover:text-yellow-700 transition-all font-semibold text-sm group">
                <span className="w-5 h-5 text-gray-400 group-hover:text-yellow-600 transition-colors"><HelpCircleIcon /></span> 
                1. Introdução ao Sistema
              </a>
              <a href="#seu-papel" className="flex items-center gap-3 p-3 rounded-xl hover:bg-orange-50 text-gray-700 hover:text-orange-700 transition-all font-semibold text-sm group">
                <span className="w-5 h-5 text-gray-400 group-hover:text-orange-600 transition-colors"><BookOpenIcon /></span> 
                2. O Seu Papel
              </a>
              <a href="#dashboard" className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 text-gray-700 hover:text-bb-blue transition-all font-semibold text-sm group">
                <span className="w-5 h-5 text-gray-400 group-hover:text-bb-blue transition-colors"><ActivityIcon /></span> 
                3. Visão Geral (Painel)
              </a>
              <a href="#transacoes" className="flex items-center gap-3 p-3 rounded-xl hover:bg-green-50 text-gray-700 hover:text-green-700 transition-all font-semibold text-sm group">
                <span className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors"><CreditCardIcon /></span> 
                4. Análise de Transações
              </a>
              <a href="#ml" className="flex items-center gap-3 p-3 rounded-xl hover:bg-purple-50 text-gray-700 hover:text-purple-700 transition-all font-semibold text-sm group">
                <span className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors"><ShieldAlertIcon /></span> 
                5. Como o Sistema Analisa
              </a>
            </nav>
          </div>
          
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 text-sm text-gray-500">
            <p className="font-medium text-gray-700 mb-1 flex items-center gap-2">
              <BookOpenIcon /> Precisa de suporte técnico?
            </p>
            Entre em contato com a equipe de desenvolvimento (Squad 03) para relatar instabilidades na página ou realizar a manutenção técnica dos servidores.
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
              <p>Este sistema foi criado para ajudar a proteger as contas dos nossos clientes e garantir a segurança do banco contra fraudes financeiras. Ele funciona como uma ferramenta de monitoramento contínuo: todos os dias, milhares de transações são realizadas com cartões de crédito, e seria impossível revisar cada uma delas manualmente.</p>
              <p>É aqui que o nosso sistema entra. Ele analisa cada compra registrada em tempo real, cruzando os dados e aplicando métodos estatísticos para identificar se há algo fora do normal, como um cartão que pode ter sido roubado ou clonado, poupando tempo valioso de auditoria.</p>
            </div>
          </section>

          <section id="seu-papel" className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm shadow-gray-200/40 scroll-mt-8">
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3 mb-6">
              <span className="w-8 h-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center"><BookOpenIcon /></span> 
              2. O Seu Papel: Analista de Prevenção
            </h2>
            <div className="space-y-5 text-gray-600 text-base leading-relaxed">
              <p>O sistema é muito inteligente, mas <strong>ele não bloqueia as transações sozinho</strong>. Nós evitamos fazer bloqueios automáticos porque uma compra fora do padrão pode ser apenas um cliente que está viajando ou fazendo uma compra incomum, porém legítima. Um bloqueio incorreto gera um grande transtorno ao cliente.</p>
              <p>Em vez de bloquear, o sistema apenas sinaliza as compras que ele achou suspeitas com um alerta visual em vermelho. O seu papel como Analista de Prevenção é olhar para essas transações sinalizadas, conferir os detalhes (como o local da compra, o horário e o valor) e dar o veredito final. O sistema aguardará a sua resposta para prosseguir, exigindo que você escolha entre aprovar a transação ou confirmar que de fato é uma fraude.</p>
            </div>
          </section>

          <section id="dashboard" className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm shadow-gray-200/40 scroll-mt-8">
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3 mb-6">
              <span className="w-8 h-8 rounded-full bg-blue-50 text-bb-blue flex items-center justify-center"><ActivityIcon /></span> 
              3. Visão Geral (Painel Inicial)
            </h2>
            <div className="space-y-5 text-gray-600 text-base leading-relaxed">
              <p>A aba de Visão Geral (Dashboard) é o painel de instrumentos do seu ambiente de trabalho. Ela reúne os principais indicadores e os apresenta de forma clara para que você compreenda a situação atual do sistema com apenas um olhar.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <h4 className="font-bold text-gray-900 mb-2">Totais e Comparações</h4>
                  <p className="text-sm">Os painéis grandes mostram exatamente quantas transações ocorreram no mês, o valor total movimentado e quantas fraudes foram contidas. Os percentuais ao lado indicam a diferença em relação ao mês anterior — por exemplo, uma diminuição no número de fraudes é um resultado positivo.</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <h4 className="font-bold text-gray-900 mb-2">Gráficos Direcionais</h4>
                  <p className="text-sm">Os gráficos coloridos servem para resumir informações, como os dias e horários em que as compras mais acontecem, ou qual é a faixa de valores mais comum nas transações. Para ler números exatos, basta repousar o ponteiro do mouse sobre os gráficos.</p>
                </div>
              </div>
            </div>
          </section>

          <section id="transacoes" className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm shadow-gray-200/40 scroll-mt-8">
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3 mb-6">
              <span className="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center"><CreditCardIcon /></span> 
              4. Análise e Histórico de Transações
            </h2>
            <div className="space-y-5 text-gray-600 text-base leading-relaxed">
              <p>A interface de Transações é a tabela onde todas as compras ficam registradas. Para não tornar o sistema lento, a tabela não mostra tudo de uma vez; ela divide as informações em várias páginas que você pode navegar facilmente.</p>
              <ul className="list-disc pl-5 space-y-3">
                <li><strong>Filtros precisos:</strong> Você pode usar a busca ou os botões de filtro na parte superior para encontrar transações específicas. É possível, por exemplo, visualizar apenas as transações de uma cidade, de uma conta específica, ou separar as compras negadas das aprovadas.</li>
                <li><strong>Alertas Visuais:</strong> Transações marcadas com uma borda avermelhada forte e com o selo de "Anomalia" 🔴 representam compras suspeitas identificadas pelo sistema. Elas exigem a sua avaliação prioritária.</li>
                <li><strong>Ficha de Detalhes:</strong> Se você clicar em qualquer compra na tabela, abrirá uma tela de Detalhes (Modal). Nessa tela, estão todas as informações coletadas, como o local exato, a hora e o número de IP da internet usada pelo cliente.</li>
              </ul>
            </div>
          </section>

          <section id="ml" className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm shadow-gray-200/40 scroll-mt-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-100 rounded-bl-full -z-10 opacity-30 pointer-events-none"></div>
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3 mb-6">
              <span className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center"><ShieldAlertIcon /></span> 
              5. Como o Sistema Analisa (Inteligência)
            </h2>
            <div className="space-y-5 text-gray-600 text-base leading-relaxed">
              <p>Nós não programamos regras fixas, como "barrar compras acima de mil reais", porque isso limitaria os clientes com maior poder de compra. O sistema utiliza análises estatísticas para aprender os costumes diários de cada usuário, e então, alerta quando percebe um desvio muito agressivo no comportamento.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="border border-purple-100 bg-white rounded-xl p-5 shadow-sm">
                  <h4 className="font-black text-purple-800 text-lg mb-2">Gasto fora do padrão (Z-Score)</h4>
                  <p className="text-sm">O sistema memoriza a média de valores que o cliente costuma gastar. Se a transação atual tiver um valor exageradamente alto em comparação a todo o histórico de vida dele, o sistema emite um alerta de fraude por desvio financeiro.</p>
                </div>
                <div className="border border-purple-100 bg-white rounded-xl p-5 shadow-sm">
                  <h4 className="font-black text-purple-800 text-lg mb-2">Padrão de rotina (Gaussiana)</h4>
                  <p className="text-sm">A maioria das nossas compras diárias se concentra numa mesma faixa de valor. Essa análise gera uma curva gráfica onde o "pico" representa os gastos normais. As compras que ficarem nas extremidades da curva serão sinalizadas como muito suspeitas.</p>
                </div>
                <div className="border border-purple-100 bg-white rounded-xl p-5 shadow-sm">
                  <h4 className="font-black text-purple-800 text-lg mb-2">Distância física impossível</h4>
                  <p className="text-sm">O sistema cruza as localizações de compras seguidas no mesmo cartão. Se houver um uso presencial em São Paulo e, dez minutos depois, outra compra presencial no Japão, a ferramenta detecta que a viagem física seria impossível, tratando como clonagem evidente.</p>
                </div>
                <div className="border border-purple-100 bg-white rounded-xl p-5 shadow-sm">
                  <h4 className="font-black text-purple-800 text-lg mb-2">Análise de redes de internet (IP)</h4>
                  <p className="text-sm">Toda vez que uma solicitação bancária é feita na internet, ela deixa um rastro chamado endereço IP. O sistema mapeia os endereços IP que o cliente usa na rotina. Se uma transação tentar aprovação a partir de uma rede em outro país sem aviso, ela gerará suspeita.</p>
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
                    <h4 className="font-bold text-purple-900">Dicas para Uso Diário</h4>
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
