"""API FastAPI para Caça às Anomalias."""
from fastapi import FastAPI, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import date
from app.database import engine, get_db, init_db
from app.models import Base
from app import crud, schemas
from app.anomalies import AnomalyDetector

# Criar tabelas
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Caça às Anomalias",
    description="API de detecção de anomalias em transações bancárias",
    version="1.0.0"
)

@app.on_event("startup")
def startup():
    """Inicializar banco de dados."""
    init_db()

@app.get("/", tags=["Root"])
async def root():
    """Endpoint raiz da API."""
    return {
        "mensagem": "API Caça às Anomalias",
        "versao": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health", tags=["Health"])
async def health():
    """Health check da API."""
    return {"status": "ok"}

@app.get("/transactions", response_model=schemas.TransactionListResponse, tags=["Transactions"])
async def list_transactions(
    categoria: str = Query(None, description="Filtrar por categoria"),
    cidade: str = Query(None, description="Filtrar por cidade"),
    valor_min: float = Query(None, description="Valor mínimo"),
    valor_max: float = Query(None, description="Valor máximo"),
    tipo_transacao: str = Query(None, description="Tipo de transação"),
    dispositivo: str = Query(None, description="Dispositivo utilizado"),
    data_inicio: date = Query(None, description="Data início"),
    data_fim: date = Query(None, description="Data fim"),
    id_conta: str = Query(None, description="ID da conta"),
    skip: int = Query(0, description="Pular N registros"),
    limit: int = Query(100, description="Limitar a N registros"),
    db: Session = Depends(get_db)
):
    """Lista transações com filtros opcionais."""
    transactions, total = crud.get_transactions(
        db=db,
        categoria=categoria,
        cidade=cidade,
        valor_min=valor_min,
        valor_max=valor_max,
        tipo_transacao=tipo_transacao,
        dispositivo=dispositivo,
        data_inicio=data_inicio,
        data_fim=data_fim,
        id_conta=id_conta,
        skip=skip,
        limit=limit
    )
    
    filtros_aplicados = {
        "categoria": categoria,
        "cidade": cidade,
        "valor_min": valor_min,
        "valor_max": valor_max,
        "tipo_transacao": tipo_transacao,
        "dispositivo": dispositivo,
        "data_inicio": str(data_inicio) if data_inicio else None,
        "data_fim": str(data_fim) if data_fim else None,
        "id_conta": id_conta,
        "skip": skip,
        "limit": limit
    }
    
    return {
        "total": total,
        "items": transactions,
        "filtros_aplicados": filtros_aplicados
    }

@app.get("/transactions/{transaction_id}", response_model=schemas.TransactionResponse, tags=["Transactions"])
async def get_transaction(transaction_id: int, db: Session = Depends(get_db)):
    """Busca uma transação específica por ID."""
    transaction = crud.get_transaction(db, transaction_id)
    if not transaction:
        raise HTTPException(status_code=404, detail="Transação não encontrada")
    return transaction

@app.post("/transactions", response_model=schemas.TransactionResponse, tags=["Transactions"])
async def create_transaction(transaction: schemas.TransactionCreate, db: Session = Depends(get_db)):
    """Cria uma nova transação."""
    return crud.create_transaction(db, transaction)

@app.get("/anomalies", response_model=schemas.AnomaliesListResponse, tags=["Anomalies"])
async def detect_anomalies(
    regra: str = Query(None, description="Filtrar por regra específica"),
    db: Session = Depends(get_db)
):
    """Detecta anomalias nas transações."""
    detector = AnomalyDetector(db)
    anomalias = detector.detect_all(regra=regra)
    
    regras_executadas = []
    if regra is None or regra == "valor_anomalo":
        regras_executadas.append("valor_anomalo")
    if regra is None or regra == "cidade_incomum":
        regras_executadas.append("cidade_incomum")
    if regra is None or regra == "burst_transacoes":
        regras_executadas.append("burst_transacoes")
    
    return {
        "total": len(anomalias),
        "items": anomalias,
        "regras_executadas": regras_executadas
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
