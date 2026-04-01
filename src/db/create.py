from model.models import Base
from sqlalchemy import text
from db.session import engine
import pandas as pd
import os

def criar_base():
    if not os.path.exists('../data'):
        os.makedirs('../data')
    
    Base.metadata.create_all(bind=engine)
    
    with engine.connect() as conn:
        result = conn.execute(text("SELECT COUNT(*) FROM transacoes")).scalar()

        if result == 0:
            print("Tabela vazia. Inserindo dados de treino...")
            df = pd.read_json('../data/transacoes_treino.json')
            
            df.to_sql('transacoes', con=engine, if_exists='append', index=False, chunksize=1000)
            print("Dados inseridos com sucesso!")
        else:
            print("A tabela já contém dados. Inserção abortada.")