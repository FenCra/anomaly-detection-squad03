# Dashboard - Caça às Anomalias 🎯

Um dashboard web moderno para visualizar, gerenciar e analisar detecção de fraudes em transações bancárias em tempo real.

## Requisitos

- **Node.js** 16+ ou 18+
- **npm** ou **yarn**
- **Python** 3.8+ (para o Backend)
- **API FastAPI** rodando em `http://localhost:8001`

## Instalação

### 1. Frontend
1. **Instalar dependências:**
```bash
npm install
# ou
yarn install
```

2. **Configurar variáveis de ambiente:**

O arquivo `.env.local` já está configurado com:
```
NEXT_PUBLIC_API_URL=http://localhost:8001
```

Se a API estiver em outro endereço, atualize este valor.

### 2. Backend (API de Anomalias)

1. **Instalar dependências do Python:**
Navegue até a pasta `Anomalias` e execute:
```bash
cd Anomalias
pip install -r requirements.txt
```
*(Nota: Certifique-se de ter o driver ODBC do SQL Server instalado em sua máquina para que a conexão via `pyodbc` funcione corretamente).*

## Como Executar

### Executando o Frontend (Modo Desenvolvimento)
```bash
npm run dev
# ou
yarn dev
```

Acesse a aplicação em: `http://localhost:3000`

### Executando o Backend (FastAPI)
Navegue até a pasta `Anomalias` (se já não estiver nela) e execute:
```bash
cd Anomalias
python -m uvicorn main.main:app --port 8001 --reload
```

A API do backend estará disponível em: `http://localhost:8001`

### Build do Frontend para Produção
```bash
npm run build
npm start
```

## 📊 Funcionalidades

### 📈 Dashboard (Home)
- **KPI Cards** mostrando:
  - Total de Transações
  - Anomalias Detectadas
  - Taxa de Anomalias
  - Transações de Hoje

- **Gráficos** com distribuição por:
  - Categoria (Pizza)
  - Dispositivo (Barra)
  - Tipo de Transação (Barra)
  - Cidade (Horizontal)

- **Tabela de Últimas Transações** com paginação

### 💳 Transações
- **Listagem completa** de todas as transações (com visual Premium)
- **Filtros Avançados:**
  - Categoria e Cidade
  - Valor Mín/Máx e Tipo de Transação
  - Dispositivo e Data Início/Fim
  - **Filtro Dinâmico de Conta Bancária** (com pesquisa exata de histórico)

- **Paginação dinâmica** (10, 25, 50 itens por página)
- **Clicar em linha** para ver detalhes

### 📝 Detalhes da Transação (Modal)
- Aba de **Detalhes** com todas as informações e dados do comerciante
- Aba **Motor de Análise (ML)** carregando 5 modelos estatísticos exclusivos para o histórico do cliente da transação:
  - Distribuição Z-Score
  - Distribuição Gaussiana
  - Anomalia por Distância Geográfica
  - Anomalia por Velocidade de Locomoção
  - Risco de IP

### 🧪 Laboratório de Machine Learning
- Análise global de toda a base de dados utilizando o motor Python.
- Gráficos renderizados via Matplotlib e trafegados via Streaming para o Front-end.
- Modelos macro para identificar: Cidades Mais Anômalas, Tipos de Fraude, Horários Críticos, e Z-Score/Gaussiana Globais.

### ➕ Criar Transação
- Modal com formulário completo
- Validações de campos obrigatórios
- Confirmação de sucesso

## 🛠️ Stack Técnico

**Frontend:**
- **Framework:** Next.js 14 (React 18)
- **Styling:** Tailwind CSS (Padrão Fintech Premium)
- **Gráficos:** Recharts
- **HTTP Client:** Axios
- **Linguagem:** TypeScript

**Backend (Anomalias ML):**
- **Framework:** FastAPI / Uvicorn
- **Linguagem:** Python 3.8+
- **Database:** SQL Server (via `pyodbc`)
- **Machine Learning & Math:** Pandas, Numpy, Scipy
- **Renderização de Gráficos:** Matplotlib (`Agg` backend), Seaborn

## 📋 Estrutura de Pastas

```
Dashboard/
├── Anomalias/              # Backend Python (FastAPI & ML)
│   ├── main/               # Rotas e configurações do servidor
│   ├── models/             # Lógica matemática (Gaussiana, Z-Score, Geo, etc)
│   └── script.sql          # Estrutura do Banco de Dados
├── app/
│   ├── layout.tsx          # Layout principal
│   ├── page.tsx            # Dashboard (home)
│   ├── api/ml/             # Proxy Next.js para a API Python
│   ├── transactions/       # Página de Transações
│   └── laboratorio/        # Página do Laboratório de ML
├── components/
│   ├── Sidebar.tsx         # Menu de navegação
│   ├── KPICard.tsx         # Card de KPI
│   ├── TransactionsTable.tsx # Tabela de transações
│   ├── TransactionModal.tsx  # Modal (com Abas e Gráficos ML)
│   └── CreateTransactionModal.tsx
├── lib/
│   └── api.ts              # Cliente da API Principal
├── .agents/rules/          # Regras do Cursor AI (Design System)
├── tailwind.config.js
└── package.json
```

## 📡 API Endpoints Consumidos

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/sql/querry/` | Listar todas as transações (com parâmetros de filtro) |
| GET | `/sql/transactions/{conta}` | Histórico completo de transações de uma conta específica |
| GET | `/sql/contas/` | Obter lista de contas bancárias disponíveis |
| POST | `/sql/transactions/` | Inserir nova transação manualmente |
| GET | `/sql/calculozscore/{conta}` | Imagem do gráfico Z-Score do cliente ou base |
| GET | `/sql/calculogaussiana/{conta}`| Imagem do gráfico de Distribuição Normal (Sino) |
| GET | `/sql/geo/distancia/` | Imagem da análise de distância e velocidade geográfica |

## 🎨 Paleta de Cores

- **Primária:** Azul (#3b82f6) - Confiança/Banco
- **Secundária:** Verde (#10b981) - Sucesso
- **Alerta:** Vermelho (#ef4444) - Fraude
- **Aviso:** Amarelo (#f59e0b) - Atenção
- **Neutro:** Cinza - Fundo/Bordas

## 🚀 Features Implementadas

✅ Design System (Fintech) em modais e tabelas
✅ Integração completa com Motor Python FastAPI
✅ Laboratório de ML com 5 gráficos em tempo real (Matplotlib via StreamingResponse)
✅ Filtro de Contas Bancárias extraído do SQL Server
✅ Dashboard com KPIs calculados localmente
✅ Paginação dinâmica do lado do cliente
✅ Tratamento rigoroso de erros de servidor e concorrência (Agg Backend)

## 📝 Notas

- A API deve estar rodando em `http://localhost:8001`
- O projeto usa TypeScript para type-safety
- Todas as requisições HTTP são tratadas com try/catch
- O estado é gerenciado com hooks do React (useState/useEffect)

## 🐛 Troubleshooting

**Erro: "Cannot fetch from API"**
- Verifique se a API FastAPI está rodando em `http://localhost:8001`
- Verifique o valor de `NEXT_PUBLIC_API_URL` em `.env.local`

**Erro: "Port 3000 is already in use"**
```bash
npm run dev -- -p 3001
```

---

**Desenvolvido com ❤️ para detecção de fraudes em tempo real**


