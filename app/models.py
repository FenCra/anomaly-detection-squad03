"""Modelos SQLAlchemy para o banco de dados."""
from sqlalchemy import Column, Integer, String, Float, Date, Time, DateTime
from datetime import datetime
from app.database import Base


class Transaction(Base):
    """Modelo para transação bancária."""
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    valor = Column(Float, nullable=False)
    data = Column(Date, nullable=False)
    hora = Column(Time, nullable=False)
    categoria = Column(String, nullable=False)
    id_conta = Column(String, nullable=False, index=True)
    cidade = Column(String, nullable=False)
    tipo_transacao = Column(String, nullable=False)
    dispositivo = Column(String, nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    criado_em = Column(DateTime, default=datetime.utcnow, nullable=False)
    atualizado_em = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<Transaction(id={self.id}, id_conta={self.id_conta}, valor={self.valor})>"
