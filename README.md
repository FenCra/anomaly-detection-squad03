# Dashboard - Caça às Anomalias 🎯

Um dashboard web moderno para visualizar, gerenciar e analisar detecção de fraudes em transações bancárias em tempo real.

## Requisitos

- **Node.js** 16+ ou 18+
- **npm** ou **yarn**
- **Python** 3.8+
- **SQL Server Express** (gratuito) — veja o guia de instalação abaixo
- **ODBC Driver 17 for SQL Server** — necessário para a conexão Python

> [!IMPORTANT]
> Este projeto foi desenvolvido **exclusivamente para SQL Server** (Microsoft). Tentar rodar com MySQL ou SQLite vai causar erros de incompatibilidade nas queries e nos tipos de dados. Não use MySQL Workbench para este projeto.

## 🗄️ Configurando o Banco de Dados (SQL Server Express)

Se você está rodando o projeto em uma máquina nova ou sem o SQL Server instalado, siga os passos abaixo. O SQL Server Express é **gratuito** e suficiente para o projeto.

### Passo 1 — Instalar o SQL Server Express

1. Acesse: **https://www.microsoft.com/pt-br/sql-server/sql-server-downloads**
2. Baixe a versão **Express** (gratuita).
3. Execute o instalador e escolha a opção **"Básico"** (instalação rápida e automática).
4. Ao finalizar, anote o nome do servidor — por padrão será: `.\SQLEXPRESS`

### Passo 2 — Instalar o SQL Server Management Studio (SSMS)

O SSMS é a interface gráfica para gerenciar o banco (equivalente ao MySQL Workbench, mas para SQL Server).

1. Acesse: **https://aka.ms/ssmsfullsetup**
2. Baixe e instale o SSMS normalmente.

### Passo 3 — Instalar o Driver ODBC

O backend Python usa `pyodbc` para se conectar ao SQL Server. O driver ODBC é o "tradutor" entre os dois.

1. Acesse: **https://learn.microsoft.com/pt-br/sql/connect/odbc/download-odbc-driver-for-sql-server**
2. Baixe e instale o **ODBC Driver 17 for SQL Server**.

### Passo 4 — Criar o banco e a tabela

1. Abra o **SSMS** e conecte-se ao servidor `.\SQLEXPRESS` usando **Autenticação do Windows**.
2. Abra o arquivo `Anomalias/script.sql` no SSMS.
3. Execute o script inteiro (`F5` ou botão "Executar"). Isso criará o banco `banco` e a tabela `transacoes`.

### Passo 5 — Popular o banco com os dados

Com o banco criado, rode o script automatizado que insere os ~30 mil registros:

```bash
cd Anomalias/insertautomatizado
python main.py
```

Aguarde a mensagem `✅ Inserção concluída!`. Isso pode levar alguns minutos dependendo da máquina.

> [!NOTE]
> O script lê o arquivo `transacoes_treino.json` (já incluso no repositório) e insere todos os registros automaticamente via `pyodbc`. Nenhuma configuração extra é necessária se os passos anteriores foram seguidos.

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

_(Nota: Certifique-se de ter o driver ODBC do SQL Server instalado em sua máquina para que a conexão via `pyodbc` funcione corretamente — veja o guia acima)._

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
python -m uvicorn main:app --port 8001 --reload
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

```text
Dashboard/
├── Anomalias/                  # Backend Python (FastAPI & SQL Server)
│   ├── Controllers/            # Controladores das rotas HTTP (REST)
│   ├── Core/                   # Configurações globais e middlewares
│   ├── Repository/             # Lógica de banco de dados e queries SQL
│   ├── Services/               # Regras de negócio e consumo dos modelos de ML
│   ├── insertautomatizado/     # Scripts Python para popular o banco de testes (Seed)
│   ├── main/                   # Sub-rotas e lógicas auxiliares do FastAPI
│   ├── models/                 # Modelos de estrutura de dados (Pydantic/Entidades)
│   ├── main.py                 # Ponto de entrada do servidor Uvicorn (Entrypoint)
│   ├── requirements.txt        # Dependências do Python (pip install)
│   └── script.sql              # Script DDL para criar o banco e tabelas no SSMS
├── app/                        # Frontend Next.js (App Router)
│   ├── ajuda/                  # Manual Operacional e Guia de Prevenção de Fraudes
│   ├── anomalies/              # Listagem dedicada de anomalias pré-filtradas
│   ├── api/                    # BFF (Backend for Frontend) e Proxies Next.js
│   ├── laboratorio/            # (Legado) Antiga página isolada de ML
│   ├── transactions/           # Interface principal de Auditoria e Julgamento
│   ├── layout.tsx              # Layout base com barra de navegação (Header)
│   ├── page.tsx                # Dashboard Inicial (Painel Gerencial)
│   └── globals.css             # Arquivo de importação de estilos Tailwind
├── components/                 # Componentes React Reutilizáveis
│   ├── ChartCard.tsx           # Cartão envelopador de gráficos
│   ├── CreateTransactionModal.tsx # Modal de inserção manual e form validation
│   ├── Icons.tsx               # Biblioteca centralizada de ícones SVG
│   ├── KPICard.tsx             # Componente de visores numéricos (Dashboard)
│   ├── Sidebar.tsx             # Menu lateral interativo de navegação
│   ├── TransactionModal.tsx    # Lightbox principal (Abas de Detalhes + Motor ML)
│   └── TransactionsTable.tsx   # Tabela paginada nativamente (Com filtros avançados)
├── lib/
│   └── api.ts                  # Cliente Axios integrando o front com a API Python
├── tailwind.config.js          # Tokens de design do Tailwind CSS
└── package.json                # Gerenciador de pacotes e scripts do Node.js
```

## 📡 API Endpoints Consumidos

| Método | Exemplo de Endpoint             | Descrição Operacional                                      |
| ------ | ------------------------------- | ---------------------------------------------------------- |
| GET    | `/transacoes/search`            | Listagem global com suporte a filtros e paginação nativa (`skip` e `limit`). |
| PUT    | `/transacoes/{id}/fraude`       | Rota de auditoria que salva o julgamento do analista (fraude confirmada) direto no banco. |
| GET    | `/transacoes/cidades`           | Rota otimizada para alimentar dropdowns de filtros dinâmicos sem baixar milhões de linhas. |
| GET    | `/dashboard/metrics`            | Devolve indicadores prontos e calculados pela própria engine do SQL Server. |
| GET    | `/sql/calculozscore/...`        | Gráficos do laboratório Python (Z-Score, Gaussiana) servidos como PNG por streaming (`Agg`). |
| GET    | `/sql/geo/distancia/`           | Rota que expõe o cruzamento de lat/long indicando viagem física impossível. |

## 🎨 Paleta de Cores

- **Primária:** Azul (#3b82f6) - Confiança/Banco
- **Secundária:** Verde (#10b981) - Sucesso
- **Alerta:** Vermelho (#ef4444) - Fraude
- **Aviso:** Amarelo (#f59e0b) - Atenção
- **Neutro:** Cinza - Fundo/Bordas

## 🚀 Features Implementadas

**Paginação Nativa no Servidor (Server-Side):** A tabela carrega milhões de registros instantaneamente usando as diretivas SQL de paginação, sem pesar o navegador.
**Dashboard Otimizado:** KPIs e gráficos processados diretamente no banco de dados em uma rota própria.
**Auditoria Humana Definitiva:** O analista revisa anomalias sinalizadas pelo ML e sentencia a operação (PUT update via API).
**Laboratório de ML Estável:** 5 modelos matemáticos gerados na nuvem (usando `matplotlib.use('Agg')` anti-crash) e servidos via Streaming.
**Manual Operacional:** Documentação interna (`/ajuda`) traduzindo conceitos de Machine Learning para os auditores em linguagem clara e humana.
**Motor de Regras Inteligente (Anti Cold-Start):** Transações de contas recém-criadas possuem uma proteção lógica que evita falsos positivos por falta de histórico de consumo, protegendo a experiência do novo cliente.
**Filtros e Dropdowns Dinâmicos:** As opções de Categorias, Dispositivos, Contas e Cidades em toda a aplicação (filtros e formulário de criação) são populadas dinamicamente via consultas SQL `DISTINCT`, abandonando informações mockadas em código.
**Relatório Generativo Resiliente:** Integração avançada com IA (Google Gemini 1.5 Flash) contendo um mecanismo de *fallback* e retentativas (retry) automático para contornar instabilidades e erros 503 de sobrecarga da API.

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
