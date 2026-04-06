from pydantic import BaseModel, Field
from datetime import date, time, datetime
from typing import Optional


class TransactionBase(BaseModel):
    """Schema base com campos comuns para criar/listar transações."""
    valor: float = Field(..., gt=0, description="Valor da transação em reais")
    data: date = Field(..., description="Data da transação")
    hora: time = Field(..., description="Hora da transação")
    categoria: str = Field(..., description="Categoria da transação")
    id_conta: str = Field(..., description="ID da conta/usuário")
    cidade: str = Field(..., description="Cidade da transação")
    tipo_transacao: str = Field(..., description="Tipo: débito, crédito, transferência")
    dispositivo: str = Field(..., description="Dispositivo: celular, web, caixa")
    latitude: Optional[float] = Field(None, description="Latitude (opcional)")
    longitude: Optional[float] = Field(None, description="Longitude (opcional)")


class TransactionCreate(TransactionBase):
    """Schema para criar uma nova transação (POST)."""
    pass


class TransactionUpdate(BaseModel):
    """Schema para atualizar uma transação (PUT/PATCH)."""
    valor: Optional[float] = None
    data: Optional[date] = None
    hora: Optional[time] = None
    categoria: Optional[str] = None
    cidade: Optional[str] = None
    tipo_transacao: Optional[str] = None
    dispositivo: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class TransactionResponse(TransactionBase):
    """Schema para retornar uma transação (GET)."""
    id: int
    criado_em: datetime
    atualizado_em: datetime

    class Config:
        from_attributes = True  # Para conversão automática do ORM


class TransactionListResponse(BaseModel):
    """Schema para retornar lista de transações com paginação."""
    total: int = Field(..., description="Total de transações encontradas")
    items: list[TransactionResponse] = Field(..., description="Lista de transações")
    filtros_aplicados: dict = Field(default_factory=dict, description="Filtros usados na busca")

    class Config:
        from_attributes = True


class AnomalyResponse(BaseModel):
    """Schema para retornar uma anomalia detectada."""
    id: int = Field(..., description="ID da transação")
    id_conta: str = Field(..., description="ID da conta")
    valor: float = Field(..., description="Valor da transação")
    data: str = Field(..., description="Data da transação")
    hora: str = Field(..., description="Hora da transação")
    categoria: str = Field(..., description="Categoria")
    cidade: str = Field(..., description="Cidade")
    dispositivo: str = Field(..., description="Dispositivo usado")
    motivo: str = Field(..., description="Motivo da suspeita")
    regra: str = Field(..., description="Regra de detecção aplicada")
    severidade: str = Field(..., description="Severidade (alta, media, baixa)")


class AnomaliesListResponse(BaseModel):
    """Schema para retornar lista de anomalias."""
    total: int = Field(..., description="Total de anomalias detectadas")
    items: list[AnomalyResponse] = Field(..., description="Lista de anomalias")
    regras_executadas: list[str] = Field(..., description="Regras que foram executadas")

    class Config:
        from_attributes = True
