# Caça às Anomalias - API FastAPI

API para detecção de anomalias em transações bancárias. Implementada com FastAPI, SQLAlchemy e SQLite.

## 🚀 Início Rápido

### 1. Instalar Dependências

```bash
pip install -r requirements.txt
```

### 2. Criar Banco de Dados

```bash
python scripts/create_db.py
```

### 3. Popular com Dados de Teste

```bash
python scripts/populate_db.py
```

### 4. Rodar a API

```bash
python -m uvicorn app.main:app --reload --port 8000
```

### 5. Acessar

Abra no navegador: **http://localhost:8000/docs**

---

## 📋 Endpoints Disponíveis

### Transações

- **GET /transactions** - Lista transações com filtros
- **GET /transactions/{id}** - Busca uma transação específica
- **POST /transactions** - Cria nova transação

### Anomalias

- **GET /anomalies** - Detecta anomalias
- **GET /anomalies?regra=valor_anomalo** - Detecta por regra específica

### Saúde

- **GET /health** - Health check da API

---

## 🔍 Filtros Disponíveis (GET /transactions)

```bash
# Categoria
GET /transactions?categoria=Alimentacao

# Cidade
GET /transactions?cidade=Sao Paulo

# Valor
GET /transactions?valor_min=100&valor_max=5000

# Tipo de transação
GET /transactions?tipo_transacao=debito

# Dispositivo
GET /transactions?dispositivo=celular

# Data
GET /transactions?data_inicio=2024-01-01&data_fim=2024-12-31

# ID da conta
GET /transactions?id_conta=CONTA_00001

# Combinações
GET /transactions?categoria=Alimentacao&cidade=Sao Paulo&valor_min=50&limit=10
```

---

## 🛡️ Regras de Detecção de Anomalias

### 1. **Valor Anômalo** (`valor_anomalo`)
Detecta transações com valor acima de (média + 2 × desvio padrão) por usuário.

### 2. **Cidade Incomum** (`cidade_incomum`)
Detecta transações em cidades não vistas anteriormente pela conta.

### 3. **Burst de Transações** (`burst_transacoes`)
Detecta 5+ transações no mesmo dia para uma conta.

---

## 📊 Exemplo de Uso

### Criar uma transação

```bash
curl -X POST http://localhost:8000/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "id_conta": "CONTA_00001",
    "valor": 250.50,
    "data": "2024-04-06",
    "hora": "14:30:00",
    "categoria": "Alimentacao",
    "cidade": "Sao Paulo",
    "tipo_transacao": "debito",
    "dispositivo": "celular"
  }'
```

### Listar com filtro

```bash
curl "http://localhost:8000/transactions?categoria=Alimentacao&cidade=Sao Paulo&limit=5"
```

### Detectar anomalias

```bash
curl http://localhost:8000/anomalies
```

---

## 🗄️ Estrutura do Banco

### Tabela: transactions

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | INTEGER | PK |
| valor | FLOAT | Valor da transação |
| data | DATE | Data |
| hora | TIME | Hora |
| categoria | STRING | Categoria |
| id_conta | STRING | ID da conta (usuário) |
| cidade | STRING | Cidade |
| tipo_transacao | STRING | debito/credito/transferencia |
| dispositivo | STRING | celular/web/caixa/smartwatch |
| latitude | FLOAT | Latitude (opcional) |
| longitude | FLOAT | Longitude (opcional) |
| criado_em | DATETIME | Data/hora criação |
| atualizado_em | DATETIME | Data/hora atualização |

---

## 📁 Estrutura do Projeto

```
caça-anomalias/
├── app/
│   ├── __init__.py
│   ├── main.py              # API FastAPI
│   ├── database.py          # Configuração SQLite
│   ├── models.py            # Modelo Transaction
│   ├── schemas.py           # Schemas Pydantic
│   ├── crud.py              # Operações banco
│   └── anomalies.py         # Regras de detecção
│
├── scripts/
│   ├── create_db.py         # Criar banco
│   └── populate_db.py       # Popular com dados
│
├── requirements.txt
├── .gitignore
└── README.md
```

---

## ✅ Testes Recomendados

1. **Criar e Persistir**
   ```bash
   # POST criar
   curl -X POST http://localhost:8000/transactions ...
   
   # Reiniciar API (Ctrl+C + rodar novamente)
   
   # GET verificar
   curl http://localhost:8000/transactions/1
   ```

2. **Filtros**
   ```bash
   curl "http://localhost:8000/transactions?categoria=Alimentacao&limit=10"
   ```

3. **Anomalias**
   ```bash
   curl http://localhost:8000/anomalies
   ```

---

## 🛠️ Tecnologias

- **FastAPI** - Framework web
- **SQLAlchemy** - ORM
- **SQLite** - Banco de dados
- **Pydantic** - Validação de dados
- **Uvicorn** - Servidor ASGI

---

## 📝 Notas

- O banco é salvo como `caça_anomalias.db` no diretório raiz
- Os dados são persistentes entre reinicializações
- A API inclui documentação automática em `/docs` (Swagger)
- Dados de teste gerados aleatoriamente (30k transações)

---

Desenvolvido para a entrega parcial do projeto **Caça às Anomalias**.
