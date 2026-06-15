from Repository.transacao_repository import (
    TransacaoRepository
)

from Regras.geo_services import (
    GeoServices
)

from Regras.geo_services_graficos import (
    GeoGraficoService
)


class LocalizacaoService:

    def __init__(self):

        self.repository = (
            TransacaoRepository()
        )

        self.geo_service = (
            GeoServices()
        )

        self.geo_grafico_service = (
            GeoGraficoService()
        )

    # =====================================================
    # DISTÂNCIA
    # =====================================================

    def analisar_distancia(
        self,
        conta: str
    ):

        df = (

            self.repository
            .buscar_localizacao_por_conta(
                conta
            )
        )

        return (

            self.geo_service
            .analisar_distancia(
                df
            )
        )

    def geo_distancia(
        self,
        conta: str
    ):

        resultado = (

            self.analisar_distancia(
                conta
            )
        )

        return (

            self.geo_grafico_service
            .grafico_distancia(
                resultado,
                conta
            )
        )

    # =====================================================
    # GEO IP
    # =====================================================

    def analisar_ip(
        self,
        conta: str
    ):

        df = (

            self.repository
            .buscar_ips_por_conta(
                conta
            )
        )

        return (

            self.geo_service
            .analisar_ip(
                df
            )
        )

    def geo_ip(
        self,
        conta: str
    ):

        resultado = (

            self.analisar_ip(
                conta
            )
        )

        return (

            self.geo_grafico_service
            .grafico_ip(
                resultado,
                conta
            )
        )

    # =====================================================
    # GEO VELOCIDADE
    # =====================================================

    def analisar_velocidade(
        self,
        conta: str
    ):

        df = (

            self.repository
            .buscar_velocidade_geografica(
                conta
            )
        )

        return (

            self.geo_service
            .analisar_velocidade(
                df
            )
        )

    def geo_velocidade(
        self,
        conta: str
    ):

        resultado = (

            self.analisar_velocidade(
                conta
            )
        )

        return (

            self.geo_grafico_service
            .grafico_velocidade(
                resultado,
                conta
            )
        )