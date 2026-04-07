"""
Lógica de filtros para o endpoint GET /transactions.
Suporta combinação de múltiplos filtros via query parameters.
"""
from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.models import Transaction
from datetime import date
from typing import Optional, List


class TransactionFilters:
    """Classe para aplicar filtros a queries de transações."""

    def __init__(self, db: Session):
        self.db = db
        self.query = db.query(Transaction)
        self.filtros_aplicados = {}

    def categoria(self, categoria: Optional[str]) -> "TransactionFilters":
        """Filtrar por categoria."""
        if categoria:
            self.query = self.query.filter(Transaction.categoria == categoria)
            self.filtros_aplicados["categoria"] = categoria
        return self

    def cidade(self, cidade: Optional[str]) -> "TransactionFilters":
        """Filtrar por cidade."""
        if cidade:
            self.query = self.query.filter(Transaction.cidade == cidade)
            self.filtros_aplicados["cidade"] = cidade
        return self

    def valor_min(self, valor_min: Optional[float]) -> "TransactionFilters":
        """Filtrar por valor mínimo."""
        if valor_min is not None and valor_min > 0:
            self.query = self.query.filter(Transaction.valor >= valor_min)
            self.filtros_aplicados["valor_min"] = valor_min
        return self

    def valor_max(self, valor_max: Optional[float]) -> "TransactionFilters":
        """Filtrar por valor máximo."""
        if valor_max is not None and valor_max > 0:
            self.query = self.query.filter(Transaction.valor <= valor_max)
            self.filtros_aplicados["valor_max"] = valor_max
        return self

    def tipo_transacao(self, tipo_transacao: Optional[str]) -> "TransactionFilters":
        """Filtrar por tipo de transação (débito, crédito, transferência)."""
        if tipo_transacao:
            self.query = self.query.filter(Transaction.tipo_transacao == tipo_transacao)
            self.filtros_aplicados["tipo_transacao"] = tipo_transacao
        return self

    def dispositivo(self, dispositivo: Optional[str]) -> "TransactionFilters":
        """Filtrar por dispositivo (celular, web, caixa)."""
        if dispositivo:
            self.query = self.query.filter(Transaction.dispositivo == dispositivo)
            self.filtros_aplicados["dispositivo"] = dispositivo
        return self

    def data_inicio(self, data_inicio: Optional[date]) -> "TransactionFilters":
        """Filtrar transações a partir de uma data específica."""
        if data_inicio:
            self.query = self.query.filter(Transaction.data >= data_inicio)
            self.filtros_aplicados["data_inicio"] = str(data_inicio)
        return self

    def data_fim(self, data_fim: Optional[date]) -> "TransactionFilters":
        """Filtrar transações até uma data específica."""
        if data_fim:
            self.query = self.query.filter(Transaction.data <= data_fim)
            self.filtros_aplicados["data_fim"] = str(data_fim)
        return self

    def conta(self, conta: Optional[str]) -> "TransactionFilters":
        """Filtrar por ID da conta."""
        if conta:
            self.query = self.query.filter(Transaction.conta == conta)
            self.filtros_aplicados["conta"] = conta
        return self

    def get_total(self) -> int:
        """Contar total de registros que atendem aos filtros."""
        return self.query.count()

    def get_results(self, skip: int = 0, limit: int = 100) -> List[Transaction]:
        """Retornar os resultados com paginação."""
        return self.query.offset(skip).limit(limit).all()

    def get_all(self) -> List[Transaction]:
        """Retornar todos os resultados sem paginação."""
        return self.query.all()


def aplicar_filtros(
    db: Session,
    categoria: Optional[str] = None,
    cidade: Optional[str] = None,
    valor_min: Optional[float] = None,
    valor_max: Optional[float] = None,
    tipo_transacao: Optional[str] = None,
    dispositivo: Optional[str] = None,
    data_inicio: Optional[date] = None,
    data_fim: Optional[date] = None,
    conta: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
) -> dict:
    """
    Função auxiliar para aplicar todos os filtros de uma vez.

    Retorna um dicionário com:
    - items: lista de transações
    - total: total de registros que atendem aos filtros
    - filtros_aplicados: dicionário com filtros utilizados
    """
    filtro = TransactionFilters(db)

    filtro.categoria(categoria)
    filtro.cidade(cidade)
    filtro.valor_min(valor_min)
    filtro.valor_max(valor_max)
    filtro.tipo_transacao(tipo_transacao)
    filtro.dispositivo(dispositivo)
    filtro.data_inicio(data_inicio)
    filtro.data_fim(data_fim)
    filtro.conta(conta)

    total = filtro.get_total()
    items = filtro.get_results(skip, limit)

    return {
        "items": items,
        "total": total,
        "filtros_aplicados": filtro.filtros_aplicados,
    }
