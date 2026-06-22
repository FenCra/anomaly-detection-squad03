from Repository.transacao_repository import (
    TransacaoRepository
)

from Services.perfil_service import (
    PerfilService
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
            PerfilService()
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

    def listar_categorias(self):
        return self.repository.get_categorias()

    def listar_tipos_transacao(self):
        return self.repository.get_tipos_transacao()

    def listar_dispositivos(self):
        return self.repository.get_dispositivos()

    def dashboard_metrics(self):

        return (
            self.repository
            .dashboard_metrics()
        )

    def criar_transacao(
        self,
        transacao
    ):

        perfil = (
            self.perfil_service
            .perfil_comportamental(
                transacao.conta
            )
        )

        score = (
            self.score_service
            .calcular_score(
                perfil,
                transacao
            )
        )

        resultado_ia = (
            self.ia_service
            .analisar(
                transacao
            )
        )

        origem = "NORMAL"
        motivos = []
        transacao.is_fraude = False

        if score["score"] >= 80:
            transacao.is_fraude = True
            origem = "REGRAS"
            motivos.extend(score["motivos"])

        if resultado_ia["fraude"]:
            transacao.is_fraude = True
            if origem == "NORMAL":
                origem = "IA"
            else:
                origem = "REGRAS + IA"
            motivos.extend(resultado_ia["motivos"])

        if not transacao.is_fraude:
            motivos.append("Transação dentro do perfil esperado")

        motivos = list(dict.fromkeys(motivos))
        transacao.motivos = "; ".join(motivos)

        resultado_insert = self.repository.inserir_transacao(transacao)
        print(resultado_insert)
        
        return {
            "status": "BLOQUEADA" if transacao.is_fraude else "APROVADA",
            "origem": origem,
            "score": score["score"],
            "classificacao": score["classificacao"],
            "probabilidade_ia": resultado_ia["probabilidade"],
            "motivos": motivos
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

    def deletar_transacao(
        self,
        id: int
    ):

        return (
            self.repository
            .delete_transacao(id)
        )

    def listar_cidades(self):

        return (
            self.repository
            .get_cidades()
        )

    def buscar_transacoes(
        self,
        categoria=None,
        cidade=None,
        valor_min=None,
        valor_max=None,
        tipo_transacao=None,
        dispositivo=None,
        data_inicio=None,
        data_fim=None,
        conta=None,
        is_fraude=None,
        search=None,
        skip=0,
        limit=50
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
                data_fim=data_fim,
                conta=conta,
                is_fraude=is_fraude,
                search=search,
                skip=skip,
                limit=limit
            )
        )

    def buscar_volume_dias(self):
        return self.repository.buscar_volume_dias()

    def buscar_distribuicao_valores(self):
        return self.repository.buscar_distribuicao_valores()

    def buscar_transacoes_hora_global(self):
        return self.repository.buscar_transacoes_hora_global()

    def buscar_top_usuarios_anomalias(self):
        return self.repository.buscar_top_usuarios_anomalias()