"""Script para criar banco de dados e tabelas."""
import sys
sys.path.insert(0, '.')

from app.database import engine, Base, SessionLocal
from app.models import Transaction

def create_db():
    """Cria todas as tabelas no banco de dados."""
    print("[*] Criando banco de dados e tabelas...")
    Base.metadata.create_all(bind=engine)
    print("[OK] Banco de dados criado com sucesso!")
    print("[DB] Arquivo: caça_anomalias.db")

if __name__ == "__main__":
    create_db()
