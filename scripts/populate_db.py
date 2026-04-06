"""Script para popular banco de dados com dados de teste."""
import sys
sys.path.insert(0, '.')

from app.database import SessionLocal
from app.models import Transaction
from datetime import datetime, timedelta
import random

CATEGORIAS = ["Alimentacao", "Transporte", "Saude", "Educacao", "Compras", "Lazer", "Utilidades"]
CIDADES = ["Sao Paulo", "Rio de Janeiro", "Belo Horizonte", "Curitiba", "Salvador", "Brasilia", "Manaus", "Recife"]
TIPOS = ["debito", "credito", "transferencia"]
DISPOSITIVOS = ["celular", "web", "caixa", "smartwatch"]

def gerar_transacoes(total=30000):
    """Gera transações aleatórias."""
    db = SessionLocal()
    
    print(f"[*] Gerando {total} transacoes de teste...")
    
    contas = [f"CONTA_{i:05d}" for i in range(100)]  # 100 contas
    data_inicio = datetime(2024, 1, 1)
    
    for idx in range(total):
        if idx % 1000 == 0:
            print(f"   OK {idx}/{total} transacoes criadas")
        
        conta = random.choice(contas)
        valor = round(random.uniform(10, 5000), 2)
        data = data_inicio + timedelta(days=random.randint(0, 365))
        hora = datetime.strptime(f"{random.randint(0, 23):02d}:{random.randint(0, 59):02d}:00", "%H:%M:%S").time()
        categoria = random.choice(CATEGORIAS)
        cidade = random.choice(CIDADES)
        tipo = random.choice(TIPOS)
        dispositivo = random.choice(DISPOSITIVOS)
        
        transacao = Transaction(
            valor=valor,
            data=data.date(),
            hora=hora,
            categoria=categoria,
            id_conta=conta,
            cidade=cidade,
            tipo_transacao=tipo,
            dispositivo=dispositivo,
            latitude=random.uniform(-30, 5),
            longitude=random.uniform(-75, -35)
        )
        
        db.add(transacao)
    
    print("[*] Salvando transacoes no banco...")
    db.commit()
    print("[OK] Banco populado com sucesso!")
    
    total_bd = db.query(Transaction).count()
    print(f"[DB] Total de transacoes no banco: {total_bd}")
    
    db.close()

if __name__ == "__main__":
    gerar_transacoes(30000)
