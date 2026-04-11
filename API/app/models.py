"""Modelos SQLAlchemy para o banco de dados."""
from sqlalchemy import Column, Integer, String, Float, Date, Time, DateTime, Boolean
from datetime import datetime
from app.database import Base


class Transaction(Base):
    """Modelo para transação bancária."""
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    valor = Column(Float, nullable=False)
    data = Column(Date, nullable=False)
    hora = Column(Time, nullable=False)
    dia_semana = Column(String, nullable=False)
    categoria = Column(String, nullable=False)
    conta = Column(String, nullable=False, index=True)
    cidade = Column(String, nullable=False)
    estado = Column(String, nullable=False)
    pais = Column(String, nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    tipo_transacao = Column(String, nullable=False)
    dispositivo = Column(String, nullable=False)
    estabelecimento = Column(String, nullable=True)
    tentativas = Column(Integer, nullable=False, default=1)
    ip_origem = Column(String, nullable=True)
    is_fraude = Column(Boolean, nullable=False, default=False)
    criado_em = Column(DateTime, default=datetime.utcnow, nullable=False)
    atualizado_em = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<Transaction(id={self.id}, conta={self.conta}, valor={self.valor})>"
