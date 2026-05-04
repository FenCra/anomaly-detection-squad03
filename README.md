# Dashboard - Caça às Anomalias 🎯

Um dashboard web moderno para visualizar, gerenciar e analisar detecção de fraudes em transações bancárias em tempo real.

## Requisitos

- **Node.js** 16+ ou 18+
- **npm** ou **yarn**
- **API FastAPI** rodando em `http://localhost:8000`

## Instalação

1. **Instalar dependências:**
```bash
npm install
# ou
yarn install
```

2. **Configurar variáveis de ambiente:**

O arquivo `.env.local` já está configurado com:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Se a API estiver em outro endereço, atualize este valor.

## Como Executar

### Modo Desenvolvimento
```bash
npm run dev
# ou
yarn dev
```

Acess a aplicação em: `http://localhost:3000`

### Build para Produção
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
- **Listagem completa** de todas as transações
- **Filtros Avançados:**
  - Categoria
  - Cidade
  - Valor Mín/Máx
  - Tipo de Transação
  - Dispositivo
  - Data Início/Fim
  - ID da Conta

- **Paginação dinâmica** (10, 25, 50 itens por página)
- **Clicar em linha** para ver detalhes
- **Botão Nova Transação** para criar registro

### ⚠️ Anomalias
- **Filtro por Regra:**
  - Valor Anômalo
  - Cidade Incomum
  - Burst de Transações

- **Cards de Estatísticas** com contagem por:
  - Severidade (Alta/Média/Baixa)
  - Regra

- **Gráficos:**
  - Distribuição por Severidade (Pizza)
  - Distribuição por Regra (Barra)

- **Tabela de Anomalias** com badges de severidade coloridas

### 📝 Detalhes da Transação
- Modal com todas as informações
- Campos de localização (Latitude/Longitude)
- Data de criação e atualização

### ➕ Criar Transação
- Modal com formulário completo
- Validações de campos obrigatórios
- Confirmação de sucesso

## 🛠️ Stack Técnico

- **Framework:** Next.js 14 (React 18)
- **Styling:** Tailwind CSS
- **Gráficos:** Recharts
- **Formulários:** React Hook Form
- **HTTP Client:** Axios
- **Data:** date-fns
- **Linguagem:** TypeScript

## 📋 Estrutura de Pastas

```
Dashboard/
├── app/
│   ├── layout.tsx          # Layout principal
│   ├── page.tsx            # Dashboard (home)
│   ├── globals.css         # Estilos globais
│   ├── transactions/
│   │   └── page.tsx        # Página de Transações
│   └── anomalies/
│       └── page.tsx        # Página de Anomalias
├── components/
│   ├── Sidebar.tsx         # Menu de navegação
│   ├── KPICard.tsx         # Card de KPI
│   ├── ChartCard.tsx       # Card com gráfico
│   ├── TransactionsTable.tsx # Tabela de transações
│   ├── TransactionModal.tsx # Modal de detalhes
│   └── CreateTransactionModal.tsx # Modal de criar
├── lib/
│   └── api.ts              # Cliente da API
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── .env.local
```

## 📡 API Endpoints Consumidos

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/transactions` | Listar transações com filtros |
| GET | `/transactions/{id}` | Detalhes de uma transação |
| POST | `/transactions` | Criar nova transação |
| GET | `/anomalies` | Listar anomalias detectadas |
| GET | `/health` | Verificar status da API |

## 🎨 Paleta de Cores

- **Primária:** Azul (#3b82f6) - Confiança/Banco
- **Secundária:** Verde (#10b981) - Sucesso
- **Alerta:** Vermelho (#ef4444) - Fraude
- **Aviso:** Amarelo (#f59e0b) - Atenção
- **Neutro:** Cinza - Fundo/Bordas

## 🚀 Features Implementadas

✅ Dashboard com KPIs
✅ Listagem e filtros de transações
✅ Detecção e listagem de anomalias
✅ Criar nova transação
✅ Detalhes de transação (modal)
✅ Gráficos e visualizações
✅ Paginação
✅ Responsividade
✅ Validação de formulários
✅ Tratamento de erros

## 📝 Notas

- A API deve estar rodando em `http://localhost:8000`
- O projeto usa TypeScript para type-safety
- Todas as requisições HTTP são tratadas com try/catch
- O estado é gerenciado com hooks do React (useState/useEffect)

## 🐛 Troubleshooting

**Erro: "Cannot fetch from API"**
- Verifique se a API FastAPI está rodando em `http://localhost:8000`
- Verifique o valor de `NEXT_PUBLIC_API_URL` em `.env.local`

**Erro: "Port 3000 is already in use"**
```bash
npm run dev -- -p 3001
```

---

**Desenvolvido com ❤️ para detecção de fraudes em tempo real**


