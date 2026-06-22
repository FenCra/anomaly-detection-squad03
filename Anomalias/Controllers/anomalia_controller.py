from fastapi import APIRouter
from fastapi import Query

from Models.Transacao_model import Transacao

from Models.Transacao_create_model import (
    TransacaoCreate
)
from Services.anomalias_services import (
    AnomaliasService
)
from Regras.anomalias_estatistica_services import (
    AnomaliasEstatisticaService)

from Services.transacao_services import (
    TransacaoService
)

from Services.localizacao_service import (
    LocalizacaoService
)

from Regras.gaussiana_service import (
    GaussianaService
)

from Regras.zscore_service import (
    ZScoreService
)

from Services.perfil_service import (
    PerfilService
)

from Services.relatorio_services import (
    RelatorioService
) 


router = APIRouter(
    prefix="/api/v1",
    tags=["Transações"]
)


transacao_service = TransacaoService()

localizacao_service = LocalizacaoService()

anomalias_service = AnomaliasService()

estatistica_service = AnomaliasEstatisticaService()
  
gaussiana_service = GaussianaService()

zscore_service = ZScoreService()

perfil_service = PerfilService()

relatorio_service = RelatorioService()

# =========================================================
# ROTAS ESTÁTICAS (devem vir ANTES das rotas com {conta})
# =========================================================

@router.get("/transacoes/contas")
def listar_contas():

    return transacao_service.listar_contas()


@router.get("/transacoes/cidades")
def listar_cidades():

    return (
        transacao_service
        .listar_cidades()
    )


@router.get("/transacoes/categorias")
def listar_categorias():
    return transacao_service.listar_categorias()

@router.get("/transacoes/tipos")
def listar_tipos_transacao():
    return transacao_service.listar_tipos_transacao()

@router.get("/transacoes/dispositivos")
def listar_dispositivos():
    return transacao_service.listar_dispositivos()


@router.get("/transacoes/search")
def buscar_transacoes(

    categoria: str = Query(None),
    cidade: str = Query(None),
    valor_min: float = Query(None),
    valor_max: float = Query(None),
    tipo_transacao: str = Query(None),
    dispositivo: str = Query(None),
    data_inicio: str = Query(None),
    data_fim: str = Query(None),
    conta: str = Query(None),
    is_fraude: bool = Query(None),
    search: str = Query(None),
    skip: int = Query(0),
    limit: int = Query(50)
):

    return transacao_service.buscar_transacoes(
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


# =========================================================
# ROTAS DINÂMICAS COM {conta}
# =========================================================

@router.get("/transacoes")
def listar_transacoes():

    return transacao_service.listar_transacoes()


@router.get("/transacoes/{conta}")
def buscar_transacao_por_conta(
    conta: str
):

    return transacao_service.buscar_transacao_por_conta(
        conta
    )


@router.post("/transacoes")
def criar_transacao(
    transacao: TransacaoCreate
):
    return transacao_service.criar_transacao(
        transacao
    )


@router.put("/transacoes/{id}/fraude")
def atualizar_status_fraude(
    id: int,
    is_fraude: bool
):

    return (
        transacao_service
        .atualizar_status_fraude(
            id,
            is_fraude
        )
    )


@router.delete("/transacoes/{id}")
def deletar_transacao(
    id: int
):

    return (
        transacao_service
        .deletar_transacao(id)
    )


# =========================================================
# PERFIL — Bug corrigido: nome duplicado removido,
# barra inicial adicionada em /transacoes/perfil/{conta}
# =========================================================



@router.get("/transacoes/perfil/{conta}")
def perfil_comportamental(
    conta: str
):
    return (

        perfil_service
        .perfil_comportamental(
            conta
        )
    )


# =========================================================
# ZSCORE / GAUSSIANA
# =========================================================

@router.get("/zscore/{conta}")
def calcular_zscore(
    conta: str
):

    return (
        anomalias_service
        .zscore_por_conta(conta)
    )


@router.get("/gaussiana/{conta}")
def gaussiana(
    conta: str
):

    return (
        anomalias_service
        .gaussiana_por_conta(conta)
    )


# =========================================================
# GEO
# =========================================================

@router.get("/distancia/{conta}")
def geo_distancia(
    conta: str
):

    return (
        localizacao_service
        .geo_distancia(conta)
    )


@router.get("/ip/{conta}")
def geo_ip(
    conta: str
):

    return (
        localizacao_service
        .geo_ip(conta)
    )


@router.get("/velocidade/{conta}")
def geo_velocidade(
    conta: str
):

    return (
        localizacao_service
        .geo_velocidade(conta)
    )


# =========================================================
# DASHBOARD / ESTATÍSTICAS
# =========================================================

@router.get("/dashboard/metrics")
def dashboard_metrics():

    return (
        transacao_service
        .dashboard_metrics()
    )


@router.get("/analytics/fraud/cities")
def cidades_mais_anomalas():

    return (
        estatistica_service
        .cidades_mais_anomalas()
    )


@router.get("/analytics/fraud/count")
def numero_de_fraudes():

    return (
        estatistica_service
        .numero_de_fraudes()
    )


@router.get("/analytics/fraud/types")
def tipos_de_fraude():

    return (
        estatistica_service
        .fraudes_por_tipo()
    )


@router.get("/analytics/fraud/hours")
def horario_de_fraudes():

    return (
        estatistica_service
        .horario_fraudes()
    )


@router.get("/analytics/fraud/attempts")
def numero_de_tentativas():

    return (
        estatistica_service
        .numero_de_tentativas()
    )


@router.get("/relatorio")
def relatorio_genai():
    return relatorio_service.relatorio_gerado()

# =========================================================
# DASHBOARD GLOBAL AGGREGATIONS
# =========================================================

@router.get("/analytics/global/volume_dias")
def buscar_volume_dias():
    return transacao_service.buscar_volume_dias()

@router.get("/analytics/global/distribuicao_valores")
def buscar_distribuicao_valores():
    return transacao_service.buscar_distribuicao_valores()

@router.get("/analytics/global/transacoes_hora")
def buscar_transacoes_hora_global():
    return transacao_service.buscar_transacoes_hora_global()

@router.get("/analytics/global/top_usuarios")
def buscar_top_usuarios_anomalias():
    return transacao_service.buscar_top_usuarios_anomalias()