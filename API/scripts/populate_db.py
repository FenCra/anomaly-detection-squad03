"""Script para popular banco de dados com dados de teste."""
import sys
sys.path.insert(0, '.')

from app.database import SessionLocal
from app.models import Transaction
from datetime import datetime, timedelta
import random

CATEGORIAS = ["Alimentacao", "Transporte", "Saude", "Educacao", "Compras", "Lazer", "Utilidades"]
CIDADES = ["Sao Paulo", "Rio de Janeiro", "Belo Horizonte", "Curitiba", "Salvador", "Brasilia", "Manaus", "Recife"]
ESTADOS = ["SP", "RJ", "MG", "PR", "BA", "DF", "AM", "PE"]
PAIS = "Brasil"
TIPOS = ["debito", "credito", "transferencia"]
DISPOSITIVOS = ["celular", "web", "caixa", "smartwatch"]
ESTABELECIMENTOS = ["Supermercado", "Restaurante", "Farmácia", "Loja", "Posto de Combustível", "Banco", "Cinema", "Academia"]
DIAS_SEMANA = ["segunda", "terca", "quarta", "quinta", "sexta", "sabado", "domingo"]
IPS = ["192.168." + str(random.randint(0, 255)) + "." + str(random.randint(0, 255)) for _ in range(50)]

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
        dia_semana = DIAS_SEMANA[data.weekday()]
        categoria = random.choice(CATEGORIAS)
        cidade = random.choice(CIDADES)
        estado = random.choice(ESTADOS)
        pais = PAIS
        tipo = random.choice(TIPOS)
        dispositivo = random.choice(DISPOSITIVOS)
        estabelecimento = random.choice(ESTABELECIMENTOS) if random.random() > 0.2 else None
        tentativas = random.randint(1, 3)
        ip_origem = random.choice(IPS)
        is_fraude = random.random() < 0.05  # 5% de fraudes

        transacao = Transaction(
            valor=valor,
            data=data.date(),
            hora=hora,
            dia_semana=dia_semana,
            categoria=categoria,
            conta=conta,
            cidade=cidade,
            estado=estado,
            pais=pais,
            tipo_transacao=tipo,
            dispositivo=dispositivo,
            latitude=random.uniform(-30, 5),
            longitude=random.uniform(-75, -35),
            estabelecimento=estabelecimento,
            tentativas=tentativas,
            ip_origem=ip_origem,
            is_fraude=is_fraude
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
