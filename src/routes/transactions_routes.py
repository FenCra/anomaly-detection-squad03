from fastapi import APIRouter, HTTPException, Depends
from model.schemas import TransacaoSchema
from db.session import pegar_sessao
from typing import List, Optional
import pandas as pd

transactions_router = APIRouter(prefix="/transactions", tags=["transactions"])

@transactions_router.get("")
async def listar_todos_dados(cidade : Optional[str] = None, 
                             tipo_transacao : Optional[str] = None,
                             conta : Optional[str] = None,
                             valor_min : Optional[float] = None,
                             valor_max : Optional[float] = None,
                             is_fraude : Optional[bool] = None,
                             tentativas : Optional[float] = None,
                             session = Depends(pegar_sessao)):
    
    """ 
    Rota padrão que lista dados do banco.

    Args:
        cidade: Cidade procurada.

        tipo_trasacao: Tipo de transação desejada

        valor_min: Valor minimo que será filtrado trazendo os que forem maior

        valor_max: Valor maxímo que será filtrando trazendo os que forem menor

        is_fraude: Se é fraude ou não em verdadeiro e falso
        
        tentativas: Quantas vezes tentaram fazer a transação
    
    Returns:
        Sem parâmetro retorna todos os dados.
        Com parâmetro retorna todos os dados filtrados pelos parâmetros passados.
    """
    try:

        busca = "SELECT * FROM transacoes"
        df = pd.read_sql_query(sql=busca, con=session)  
        df_filtrado =  df.copy()  
        
        #Para adicionar mais filtros adicione como parâmetro o filtro com o mesmo nome que está na tabela. Depois adicione no dicionario filtros_exatos o filtro e a chave com o mesmo nome.
        filtros_exatos = {
            'cidade': cidade,
            'conta': conta,
            'tipo_transacao': tipo_transacao,
            'is_fraude': is_fraude,
            'tentativas': tentativas
        }
        
        for coluna, valor_recebido in filtros_exatos.items():
            if valor_recebido is not None:
                df_filtrado = df_filtrado[df_filtrado[coluna] == valor_recebido]
        
        if valor_min is not None:
            df_filtrado = df_filtrado[df_filtrado['valor'] >= valor_min]
        
        if valor_max is not None:
            df_filtrado = df_filtrado[df_filtrado['valor'] <= valor_max]
       
        return df_filtrado.to_dict(orient="records")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao acessar o banco: {str(e)}")

@transactions_router.get("/{id}")
async def listar_dados_id(id, session = Depends(pegar_sessao)):
    """
    Lista os dados de uma transação conforme o id passado
    
    Args:
        id: id da transação almejada

    Returns:
        Todos os dados da transação desse id
    """
    try:
        busca = f"SELECT * FROM transacoes WHERE id = {id}"
        df = pd.read_sql_query(sql=busca, con=session, params={"id": id})

        return df.to_dict(orient="records")
    except Exception:
        raise HTTPException(status_code=500, detail=f"Erro ao acessar o banco: {str(Exception)}")

@transactions_router.post("")
async def criar_transacao(transacao_schema: List[TransacaoSchema], session = Depends(pegar_sessao)):
    """
    Cria uma nova transação e adiciona ao banco de dados
    """

    data = [transacao.model_dump() for transacao in transacao_schema]
    df = pd.DataFrame(data)

    try:
        df.to_sql('transacoes', con=session, if_exists='append', index=False)
        return df.to_dict(orient='records')
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao acessar o banco: {str(e)}")