from sqlalchemy import create_engine

DATABASE_URL = "sqlite:///../data/banco.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

def pegar_sessao():
    with engine.begin() as conn:
        yield conn