"""Operações CRUD para transações."""
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from app.models import Transaction
from app.schemas import TransactionCreate
from datetime import date


def get_transaction(db: Session, transaction_id: int):
    """Busca uma transação por ID."""
    return db.query(Transaction).filter(Transaction.id == transaction_id).first()


def get_transactions(
    db: Session,
    categoria: str = None,
    cidade: str = None,
    valor_min: float = None,
    valor_max: float = None,
    tipo_transacao: str = None,
    dispositivo: str = None,
    data_inicio: date = None,
    data_fim: date = None,
    conta: str = None,
    skip: int = 0,
    limit: int = 100
):
    """Lista transações com filtros opcionais."""
    query = db.query(Transaction)

    # Aplicar filtros
    if categoria:
        query = query.filter(Transaction.categoria.ilike(f"%{categoria}%"))
    if cidade:
        query = query.filter(Transaction.cidade.ilike(f"%{cidade}%"))
    if valor_min is not None:
        query = query.filter(Transaction.valor >= valor_min)
    if valor_max is not None:
        query = query.filter(Transaction.valor <= valor_max)
    if tipo_transacao:
        query = query.filter(Transaction.tipo_transacao.ilike(f"%{tipo_transacao}%"))
    if dispositivo:
        query = query.filter(Transaction.dispositivo.ilike(f"%{dispositivo}%"))
    if data_inicio:
        query = query.filter(Transaction.data >= data_inicio)
    if data_fim:
        query = query.filter(Transaction.data <= data_fim)
    if conta:
        query = query.filter(Transaction.conta == conta)

    # Paginação
    total = query.count()
    transactions = query.offset(skip).limit(limit).all()

    return transactions, total


def create_transaction(db: Session, transaction: TransactionCreate):
    """Cria uma nova transação."""
    db_transaction = Transaction(**transaction.model_dump())
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction


def delete_transaction(db: Session, transaction_id: int):
    """Deleta uma transação por ID."""
    db_transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if db_transaction:
        db.delete(db_transaction)
        db.commit()
    return db_transaction
