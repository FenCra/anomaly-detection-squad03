### 🔴 Prioridade Alta

#### 1. Rota para Atualizar o Status (Julgamento)
* **O que precisamos fazer:** Criar uma rota de `PATCH` ou `PUT` no caminho `/sql/transactions/{id}`.
* **Motivo:** O nosso painel já tem os botões de "Confirmar Fraude" e "Aprovar Transação", mas a API hoje só faz leitura e inserção (`GET` e `POST`). A gente precisa dessa rota para que, quando apertarmos o botão na tela, a API receba o comando (ex: `is_fraude: 1`) e atualize isso de verdade lá no SQL Server. Por enquanto o front só finge que mudou os status na tela.

---

### 🟡 Prioridades Médias

#### 2. Paginação no Banco e Filtro de Fraude
* **O que precisamos fazer:** Adicionar os parâmetros `skip`, `limit` e `is_fraude` na nossa rota principal `GET /sql/querry/`.
* **Motivo:** Hoje a API devolve o banco inteiro (as 30 mil linhas) de uma vez só. Se o banco crescer, isso vai travar o navegador. Como não tem paginação pronta no back, o Front está tendo que baixar tudo e dividir as páginas sozinho. Também falta o filtro de fraude pra gente conseguir pedir pro banco trazer só as anomalias quando precisarmos, sem ter que baixar as normais junto.

#### 3. Rota Própria para os Gráficos do Dashboard
* **O que precisamos fazer:** Criar uma rota agrupada (ex: `GET /sql/dashboard/metrics`) que devolva só as somas e totais (Total Movimentado, Quantidade de Anomalias, etc).
* **Motivo:** Pra conseguir mostrar os gráficos do Dashboard hoje, o Front está baixando as 30 mil linhas e fazendo a conta de matemática linha por linha no JavaScript. Isso pesa muito. Além disso, lidar com o texto puro do banco às vezes dá problema (ex: dias da semana vindo com espaços sobrando e quebrando o gráfico). O ideal é o Back fazer as somas no banco de dados e mandar só o JSON com o resumo pronto.

---

### 🟢 Baixas Prioridades

#### 4. Barra de Pesquisa de Texto Livre
* **O que precisamos fazer:** Adicionar um parâmetro `search` de busca geral na rota `GET /sql/querry/`.
* **Motivo:** Nossa tela tem uma barra de pesquisa pro usuário digitar qualquer coisa e achar a transação. Como a API não processa esse tipo de busca ainda, o Front está quebrando um galho e pesquisando dentro da própria memória do navegador. Seria legal o Back aceitar a palavra e fazer a pesquisa direto nas colunas do banco (conta, cidade, etc).
