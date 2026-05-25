### 🔴 Prioridade Alta

#### ~~1. Rota para Atualizar o Status (Julgamento)~~ ✅ [CONCLUÍDA]
* **O que precisava ser feito:** Criar uma rota de `PATCH` ou `PUT` no caminho `/sql/transactions/{id}`.
* **Status:** Resolvido! A rota `@router.put("/transactions/{id}/fraude")` foi criada no `sql.py` usando `UPDATE transacoes SET is_fraude = ?`.

---

### 🟡 Prioridades Médias

#### 2. Otimização de Carga (Paginação + Rota Exclusiva de Cidades)
* **O que precisamos fazer:** 
  1. Adicionar os parâmetros `skip`, `limit` e `is_fraude` na rota principal `GET /sql/querry/`.
  2. Criar uma nova rota `GET /sql/cidades/` para executar `SELECT DISTINCT cidade FROM transacoes`.
* **Motivo:** Essas duas tarefas devem ser feitas juntas. Hoje, a API devolve o banco inteiro de uma vez só (30 mil linhas), o que pesa no navegador. Se o backend criar apenas a paginação (limit), a tabela do front-end ficará rápida, mas o filtro dinâmico de cidades do front-end vai "quebrar" (pois ele deixará de receber as 30 mil linhas para extrair todos os nomes das cidades). Logo, para poder paginar a tabela principal, precisamos obrigatoriamente de uma pequena rota separada apenas para alimentar o dropdown com as cidades únicas.

#### 3. Rota Própria para os Gráficos do Dashboard
* **O que precisamos fazer:** Criar uma rota agrupada (ex: `GET /sql/dashboard/metrics`) que devolva só as somas e totais (Total Movimentado, Quantidade de Anomalias, etc).
* **Motivo:** Pra conseguir mostrar os gráficos do Dashboard hoje, o Front está baixando as 30 mil linhas e fazendo a conta de matemática linha por linha no JavaScript. Isso pesa muito. Além disso, lidar com o texto puro do banco às vezes dá problema (ex: dias da semana vindo com espaços sobrando e quebrando o gráfico). O ideal é o Back fazer as somas no banco de dados e mandar só o JSON com o resumo pronto.

---

### 🟢 Baixas Prioridades

#### 4. Barra de Pesquisa de Texto Livre
* **O que precisamos fazer:** Adicionar um parâmetro `search` de busca geral na rota `GET /sql/querry/`.
* **Motivo:** Nossa tela tem uma barra de pesquisa pro usuário digitar qualquer coisa e achar a transação. Como a API não processa esse tipo de busca ainda, o Front está quebrando um galho e pesquisando dentro da própria memória do navegador. Seria legal o Back aceitar a palavra e fazer a pesquisa direto nas colunas do banco (conta, cidade, etc).


