from sqlalchemy import Column, Integer, Float, String, Boolean
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Transacao(Base):
    __tablename__ = 'transacoes'
    id = Column(Integer, primary_key=True, autoincrement=True)
    valor = Column(Float, nullable=False)
    data = Column(String, nullable=False)
    hora = Column(String, nullable=False)
    dia_semana = Column(String, nullable=False)
    categoria = Column(String, nullable=False)
    conta = Column(String, nullable=False)
    cidade = Column(String, nullable=False)
    estado = Column(String, nullable=False)
    pais = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    tipo_transacao = Column(String, nullable=False)
    dispositivo = Column(String, nullable=False)
    estabelecimento = Column(String, nullable=False)
    tentativas = Column(Integer, nullable=False)
    ip_origem = Column(String, nullable=False)
    is_fraude = Column(Boolean, nullable=False)


