from pydantic import BaseModel, Field

class TransacaoSchema(BaseModel):
    valor: float = Field(gt=0)
    data: str = Field(min_length=1, default="0000-00-00")
    hora: str = Field(min_length=1, default="00:00")
    dia_semana: str = Field(min_length=1)
    categoria: str = Field(min_length=1)
    conta: str = Field(min_length=1)
    cidade: str = Field(min_length=1)
    estado: str = Field(min_length=1)
    pais: str = Field(min_length=1)
    latitude: float 
    longitude: float
    tipo_transacao: str = Field(min_length=1)
    dispositivo: str = Field(min_length=1)
    estabelecimento: str = Field(min_length=1)
    tentativas: int = Field(gt=0)
    ip_origem: str = Field(min_length=1)
    is_fraude: bool

    class Config:
        from_attributes = True