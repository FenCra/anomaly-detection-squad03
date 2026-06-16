#aqui é o service para fazer o crud transacoes

from Repository.transacao_repository import (
    TransacaoRepository
)

class TransacaoService:

    def __init__(self):

        self.repository = (
            TransacaoRepository()
        )

    # =====================================================
    # TRANSAÇÕES
    # =====================================================

    def listar_transacoes(self):

        return (
            self.repository
            .get_transacoes()
        )

    def buscar_transacao_por_conta(
        self,
        conta: str
    ):

        return (
            self.repository
            .get_transacao_por_conta(
                conta
            )
        )

    def listar_contas(self):

        return (
            self.repository
            .get_contas()
        )
    
    def dashboard_metrics(self):

       return (
           self.repository
           .dashboard_metrics()
        )

    def buscar_volume_dias(self):
        return self.repository.buscar_volume_dias()

    def buscar_distribuicao_valores(self):
        return self.repository.buscar_distribuicao_valores()

    def buscar_transacoes_hora_global(self):
        return self.repository.buscar_transacoes_hora_global()

    def buscar_top_usuarios_anomalias(self):
        return self.repository.buscar_top_usuarios_anomalias()

    def criar_transacao(
        self,
        transacao
    ):

        return (
            self.repository
            .inserir_transacao(
                transacao
            )
        )
    
    def atualizar_status_fraude(
        self,
        id: int,
        is_fraude: bool
    ):

        return (
            self.repository
            .update_status_fraude(
                id,
                is_fraude
            )
        )

    # =====================================================
    # DELETAR TRANSAÇÃO
    # =====================================================

    def deletar_transacao(
        self,
        id: int
    ):

        return (
            self.repository
            .delete_transacao(id)
        )
    
    
    def listar_cidades(
        self 
    ):

        return (
           self.repository
           .get_cidades()
        )


    # =====================================================
    # FILTROS
    # =====================================================

    def buscar_transacoes(
        self,
        conta=None,
        categoria=None,
        cidade=None,
        valor_min=None,
        valor_max=None,
        tipo_transacao=None,
        dispositivo=None,
        data_inicio=None,
        data_fim=None,
        is_fraude=None,
        search=None,
        skip=0,
        limit=50
    ):

        return self.repository.query_transacoes(
            conta=conta,
            categoria=categoria,
            cidade=cidade,
            valor_min=valor_min,
            valor_max=valor_max,
            tipo_transacao=tipo_transacao,
            dispositivo=dispositivo,
            data_inicio=data_inicio,
            data_fim=data_fim,
            is_fraude=is_fraude,
            search=search,
            skip=skip,
            limit=limit
        )
