# 🎯 BRIEFING PARA CRIAR DASHBOARD - API Caça às Anomalias

## CONTEXTO DO PROJETO

Você tem uma **API FastAPI funcional** chamada "Caça às Anomalias" que detecta fraudes em transações bancárias.

**Objetivo**: Criar um **Dashboard Web** para visualizar e gerenciar transações, aplicar filtros e detectar anomalias em tempo real.

---

## 📊 O QUE O DASHBOARD PRECISA FAZER

### 1️⃣ PÁGINA PRINCIPAL - DASHBOARD

**Componentes esperados**:

- **Cards de Resumo (KPIs)**:
  - Total de Transações: ~90.000
  - Total de Anomalias Detectadas: ~765
  - % de Anomalias: ~0.85%
  - Transações de Hoje

- **Gráficos**:
  - Distribuição de transações por categoria (Pizza/Donut)
  - Distribuição por cidade (Mapa ou Tabela)
  - Distribuição por dispositivo (Coluna)
  - Distribuição por tipo de transação (Barra)
  - Anomalias ao longo do tempo (Timeline/Linha)

- **Tabela de Últimas Transações**:
  - ID | Conta | Valor | Data | Hora | Categoria | Cidade | Dispositivo
  - Paginação (10, 25, 50 por página)
  - Ordenação por colunas

---

### 2️⃣ PÁGINA DE TRANSAÇÕES (Listagem)

**Funcionalidades**:

- **Filtros Avançados** (lado esquerdo ou modal):
  - ✅ Categoria (dropdown com opções: Alimentacao, Transporte, Saude, etc)
  - ✅ Cidade (dropdown com todas as cidades)
  - ✅ Valor Mín/Máx (input type range ou dois inputs)
  - ✅ Tipo de Transação (dropdown: debito, credito, transferencia)
  - ✅ Dispositivo (dropdown: celular, web, caixa, smartwatch)
  - ✅ Data Início/Fim (date picker)
  - ✅ ID da Conta (text input)
  - Botões: "Aplicar Filtros" | "Limpar Filtros"

- **Tabela de Transações**:
  - Colunas: ID | Conta | Valor | Data | Hora | Categoria | Cidade | Tipo | Dispositivo
  - Paginação dinâmica (mostar páginas disponíveis)
  - Ordenação por colunas
  - Busca/Filtro por texto
  - Ação: Clicar em linha para ver detalhes

- **Toolbar**:
  - Indicador: "X transações encontradas"
  - Botão: "Nova Transação" (abre modal para POST)
  - Botão: "Exportar (CSV/JSON)"
  - Filtros aplicados em chips removíveis

---

### 3️⃣ PÁGINA DE ANOMALIAS (Detecção)

**Funcionalidades**:

- **Filtro por Regra** (3 regras disponíveis):
  - ⚠️ Valor Anômalo (Severidade: ALTA)
  - ⚠️ Cidade Incomum (Severidade: MÉDIA)
  - ⚠️ Burst de Transações (Severidade: ALTA)
  - Opção: Mostrar todas ou filtrar por regra específica

- **Cards de Estatísticas**:
  - Total de Anomalias Encontradas
  - Por Regra (contagem de cada)
  - Por Severidade (Contagem de Alta/Média/Baixa)

- **Tabela de Anomalias**:
  - Colunas: ID | Conta | Valor | Data | Hora | Categoria | Cidade | Motivo | Regra | Severidade
  - Badge de severidade com cores:
    - 🔴 ALTA = Vermelho
    - 🟡 MÉDIA = Amarelo
    - 🟢 BAIXA = Verde
  - Paginação
  - Ordenação
  - Clicar em linha para ver detalhes da transação original

- **Gráficos**:
  - Distribuição por Severidade (Pizza)
  - Distribuição por Regra (Barra)
  - Timeline de anomalias detectadas

---

### 4️⃣ PÁGINA DE DETALHES DA TRANSAÇÃO

**Funcionalidades**:

- Modal ou página dedicated mostrando:
  - Todos os campos da transação
  - Data/Hora de criação e última atualização
  - Se for uma anomalia, mostrar:
    - Motivo da suspeita
    - Regra aplicada
    - Severidade
  - Botão: "Fechar" ou "Voltar"

---

### 5️⃣ MODAL DE CRIAR TRANSAÇÃO

**Funcionalidades**:

- Formulário com campos:
  - ID da Conta (text input)
  - Valor (number input, deve ser > 0)
  - Data (date picker)
  - Hora (time picker)
  - Categoria (dropdown)
  - Cidade (dropdown)
  - Tipo de Transação (dropdown)
  - Dispositivo (dropdown)
  - Latitude (number, opcional)
  - Longitude (number, opcional)

- Validações:
  - Campos obrigatórios
  - Valor > 0
  - Data válida
  - Mostrar erro se POST falhar

- Botões: "Cancelar" | "Salvar"

---

## 🔌 API ENDPOINTS A CONSUMIR

### Base URL
```
http://localhost:8000
```

### Endpoints

#### 1. GET /transactions
```
GET /transactions?categoria=Alimentacao&cidade=Sao Paulo&valor_min=50&valor_max=500&limit=10&skip=0

Response:
{
  "total": 1234,
  "items": [
    {
      "id": 1,
      "valor": 125.50,
      "data": "2024-04-06",
      "hora": "14:30:00",
      "categoria": "Alimentacao",
      "id_conta": "CONTA_00001",
      "cidade": "Sao Paulo",
      "tipo_transacao": "debito",
      "dispositivo": "celular",
      "latitude": -23.55,
      "longitude": -46.63,
      "criado_em": "2026-04-06T14:35:10.308773",
      "atualizado_em": "2026-04-06T14:35:10.308773"
    }
  ],
  "filtros_aplicados": {...}
}
```

#### 2. GET /transactions/{id}
```
GET /transactions/1

Response: [objeto transaction único]
```

#### 3. POST /transactions
```
POST /transactions
Content-Type: application/json

{
  "id_conta": "CONTA_00001",
  "valor": 250.50,
  "data": "2024-04-06",
  "hora": "15:30:00",
  "categoria": "Alimentacao",
  "cidade": "Porto Alegre",
  "tipo_transacao": "debito",
  "dispositivo": "celular"
}

Response: [objeto transaction criado com ID]
```

#### 4. GET /anomalies
```
GET /anomalies
GET /anomalies?regra=valor_anomalo

Response:
{
  "total": 765,
  "items": [
    {
      "id": 27561,
      "id_conta": "CONTA_00000",
      "valor": 4370.87,
      "data": "2024-01-04",
      "hora": "02:17:00",
      "categoria": "Utilidades",
      "cidade": "Brasilia",
      "dispositivo": "smartwatch",
      "motivo": "Valor 4370.87 acima do limite esperado (2500.00)",
      "regra": "valor_anomalo",
      "severidade": "alta"
    }
  ],
  "regras_executadas": ["valor_anomalo", "cidade_incomum", "burst_transacoes"]
}
```

#### 5. GET /health
```
GET /health

Response:
{
  "status": "ok",
  "message": "API funcionando normalmente"
}
```

---

## 📊 DADOS DISPONÍVEIS

### Categorias
- Alimentacao
- Transporte
- Saude
- Educacao
- Compras
- Lazer
- Utilidades
- Investimento

### Cidades
- Sao Paulo, Rio de Janeiro, Belo Horizonte, Curitiba, Salvador, Brasilia, Manaus, Recife, Porto Alegre, Fortaleza, Campinas

### Tipos de Transação
- debito, credito, transferencia

### Dispositivos
- celular, web, caixa, smartwatch

### Severidades
- alta (vermelho/🔴)
- media (amarelo/🟡)
- baixa (verde/🟢)

---

## 🎨 UX/UI RECOMENDAÇÕES

### Paleta de Cores
- **Primária**: Azul (confiança/banco)
- **Secundária**: Verde (sucesso)
- **Alerta**: Vermelho (fraude)
- **Aviso**: Amarelo (atenção)
- **Neutro**: Cinza

### Layout
- **Sidebar** (esquerda): Menu de navegação
- **Top Bar** (topo): Logo, título página, user profile
- **Main Content**: Conteúdo responsivo
- **Footer** (opcional): Informações da API

### Navegação
- Home/Dashboard
- Transações
- Anomalias
- (Opcional) Configurações

### Responsividade
- Desktop (1920px)
- Tablet (768px)
- Mobile (320px)

---

## ⚙️ REQUISITOS TÉCNICOS

### Framework Web (VOCÊ ESCOLHE)
Opções recomendadas:
- **React** (JavaScript/TypeScript) - Mais popular, muitas bibliotecas
- **Vue** (JavaScript) - Mais simples, bom para aprender
- **Angular** (TypeScript) - Mais robusto, para apps grandes
- **Next.js** (React) - Full-stack, SSR

### Bibliotecas Úteis
- **HTTP Client**: axios, fetch, use-query
- **Gráficos**: Chart.js, D3.js, Recharts, Plotly
- **Tabelas**: DataTable, TanStack Table
- **Formulários**: React Hook Form, Formik
- **UI Components**: Material-UI, Tailwind, Bootstrap
- **Date Picker**: React DatePicker, Day.js
- **Notificações**: React Toastify, Notifications

### Autenticação (Não necessário para MVP)
- A API não tem autenticação
- Se adicionar depois: JWT, OAuth2

### State Management (Opcional)
- Context API (React nativo)
- Redux (mais complexo)
- Zustand (simples)
- TanStack Query (perfeito para queries de API)

---

## 📋 CHECKLIST DE FUNCIONALIDADES

### Essencial (MVP)
- [ ] Dashboard com KPIs
- [ ] Listagem de transações com filtros
- [ ] Tabela responsiva
- [ ] Página de anomalias
- [ ] Criar nova transação
- [ ] Detalhes de transação

### Muito Bom
- [ ] Gráficos e visualizações
- [ ] Paginação eficiente
- [ ] Loading states
- [ ] Error handling
- [ ] Validação de formulários
- [ ] Search/filtering em tempo real

### Nice-to-Have
- [ ] Exportar dados (CSV)
- [ ] Dark mode
- [ ] Responsive mobile
- [ ] PWA (Progressive Web App)
- [ ] Histórico de transações por conta

---

## 🚀 INSTRUÇÕES PARA IA (COPILOT)

Quando usar este briefing com uma IA, forneça como contexto:

```
Preciso criar um DASHBOARD WEB para uma API que gerencia transações bancárias
e detecta fraudes.

A API está documentada neste briefing. Ela tem:
- 90.000 transações
- 3 regras de detecção de anomalias
- 7+ filtros para transações
- Endpoints: GET /transactions, POST /transactions, GET /anomalies

Quero um dashboard que:
1. Mostre KPIs na home
2. Permita listar e filtrar transações
3. Mostre anomalias detectadas
4. Deixe criar novas transações

As páginas são:
- Dashboard (home)
- Transações (listagem com filtros)
- Anomalias (detecção)
- Detalhes (modal)

Use [FRAMEWORK A ESCOLHER] e consuma a API HTTP em localhost:8000.

Aqui está a documentação completa da API:
[INSERIR TODO O CONTEÚDO DESTE ARQUIVO]
```

---

## 📞 CONTATO/DÚVIDAS SOBRE A API

- **Documentação Interativa**: http://localhost:8000/docs (Swagger)
- **ReDoc**: http://localhost:8000/redoc
- **Banco de Dados**: caça_anomalias.db (SQLite)
- **Código Fonte**: /app (FastAPI)

---

## 🎁 INFORMAÇÕES EXTRAS

### Como Rodar a API Localmente
```bash
# Instalar dependências
pip install -r requirements.txt

# Criar banco (primeira vez)
python scripts/create_db.py
python scripts/populate_db.py

# Rodar API
python -m uvicorn app.main:app --reload --port 8000

# Acessar documentação
http://localhost:8000/docs
```

### Estrutura da API
```
app/
├── main.py          # Endpoints FastAPI
├── database.py      # Configuração SQLite
├── models.py        # Modelo Transaction
├── schemas.py       # Validação Pydantic
├── crud.py          # Operações CRUD
└── anomalies.py     # Regras de detecção
```

---

Este briefing é autoexplicativo e pronto para usar com qualquer IA!
