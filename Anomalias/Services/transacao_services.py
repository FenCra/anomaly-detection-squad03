from Repository.transacao_repository import (
    TransacaoRepository
)

from Regras.perfil_regras import (
    PerfilRegras
)

from Regras.score_risco_regras import (
    ScoreService
)

from Services.ia_services import (
    IAService
)


class TransacaoService:

    def __init__(self):

        self.repository = (
            TransacaoRepository()
        )

        self.perfil_service = (
            PerfilRegras()
        )

        self.score_service = (
            ScoreService()
        )

        self.ia_service = (
            IAService()
        )

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

    # =====================================================
    # CRIAR TRANSAÇÃO
    # =====================================================

    def criar_transacao(
        self,
        transacao
    ):

        # ==========================================
        # GERA O PERFIL
        # ==========================================

        perfil = (

            self.perfil_service
            .perfil_comportamental(
                transacao.conta
            )

        )

        # ==========================================
        # SCORE HEURÍSTICO
        # ==========================================

        score = (

            self.score_service
            .calcular_score(
                perfil,
                transacao
            )

        )

        # ==========================================
        # IA
        # ==========================================

        resultado_ia = (

            self.ia_service
            .analisar(
                transacao
            )

        )

        # ==========================================
        # DECISÃO FINAL
        # ==========================================

        origem = "NORMAL"

        motivos = []

        transacao.is_fraude = False

        # ==========================================
        # REGRAS HEURÍSTICAS
        # ==========================================

        if score["score"] >= 80:

            transacao.is_fraude = True

            origem = "REGRAS"

            motivos.extend(
                score["motivos"]
            )

        # ==========================================
        # INTELIGÊNCIA ARTIFICIAL
        # ==========================================

        if resultado_ia["fraude"]:

            transacao.is_fraude = True

            if origem == "NORMAL":

                origem = "IA"

            else:

                origem = "REGRAS + IA"

            motivos.extend(
                resultado_ia["motivos"]
            )

        # ==========================================
        # APROVADA
        # ==========================================

        if not transacao.is_fraude:

            motivos.append(
                "Transação dentro do perfil esperado"
            )

        # Remove motivos repetidos

        motivos = list(
            dict.fromkeys(
                motivos
            )
        )

        transacao.motivo = "; ".join(
            motivos
        )

        self.repository.inserir_transacao(
            transacao
        )

        return {

            "status":

                "BLOQUEADA"

                if transacao.is_fraude

                else

                "APROVADA",

            "origem":

                origem,

            "score":

                score["score"],

            "classificacao":

                score["classificacao"],

            "probabilidade_ia":

                resultado_ia["probabilidade"],

            "motivos":

                motivos

        }

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
            .delete_transacao(
                id
            )
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

        categoria=None,

        cidade=None,

        valor_min=None,

        valor_max=None,

        tipo_transacao=None,

        dispositivo=None,

        data_inicio=None,

        data_fim=None

    ):

        return (

            self.repository
            .query_transacoes(

                categoria=categoria,

                cidade=cidade,

                valor_min=valor_min,

                valor_max=valor_max,

                tipo_transacao=tipo_transacao,

                dispositivo=dispositivo,

                data_inicio=data_inicio,

                data_fim=data_fim

            )

        )