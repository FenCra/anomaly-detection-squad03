from Services.anomalias_services import (
    AnomaliasService
)

from Services.localizacao_service import (
    LocalizacaoService
)


class PerfilRegras:

    def __init__(self):

        self.anomalias_service = (
            AnomaliasService()
        )

        self.localizacao_service = (
            LocalizacaoService()
        )

    # =====================================================
    # PERFIL BÁSICO
    # =====================================================

    def _perfil_basico(
        self,
        df
    ):

        return {

            "quantidade_transacoes":

                int(len(df)),

            "ticket_medio":

                float(
                    df["valor"]
                    .mean()
                ),

            "ticket_maximo":

                float(
                    df["valor"]
                    .max()
                ),

            "ticket_minimo":

                float(
                    df["valor"]
                    .min()
                ),

            "desvio_padrao":

                float(
                    df["valor"]
                    .std()
                )
        }

    # =====================================================
    # COMPORTAMENTO
    # =====================================================

    def _comportamento(
        self,
        df
    ):

        return {

            "cidade_predominante":

                str(

                    df["cidade"]
                    .mode()
                    .iloc[0]

                ) if not df["cidade"].empty else None,

            "categoria_predominante":

                str(

                    df["categoria"]
                    .mode()
                    .iloc[0]

                ) if not df["categoria"].empty else None,

            "dispositivo_predominante":

                str(

                    df["dispositivo"]
                    .mode()
                    .iloc[0]

                ) if not df["dispositivo"].empty else None
        }

    # =====================================================
    # ASSINATURA FINANCEIRA
    # =====================================================

    def _assinatura_financeira(
        self,
        df
    ):

        media = (

            df["valor"]
            .mean()
        )

        desvio = (

            df["valor"]
            .std()
        )

        return {

            "media":

                float(media),

            "desvio_padrao":

                float(desvio),

            "valor_habitual_min":

                float(
                    media - desvio
                ),

            "valor_habitual_max":

                float(
                    media + desvio
                )
        }

    # =====================================================
    # GERAR PERFIL
    # =====================================================

    def gerar_perfil(
        self,
        df,
        conta: str
    ):

        zscore = (

            self.anomalias_service
            .analisar_zscore(
                conta
            )
        )

        gaussiana = (

            self.anomalias_service
            .analisar_gaussiana(
                conta
            )
        )

        distancia = (

            self.localizacao_service
            .analisar_distancia(
                conta
            )
        )

        ip = (

            self.localizacao_service
            .analisar_ip(
                conta
            )
        )

        velocidade = (

            self.localizacao_service
            .analisar_velocidade(
                conta
            )
        )

        return {

            "conta":

                conta,

            "perfil_basico":

                self._perfil_basico(
                    df
                ),

            "comportamento":

                self._comportamento(
                    df
                ),

            "assinatura_financeira":

                self._assinatura_financeira(
                    df
                ),

            "zscore":

                {

                    "zscore_medio":

                        zscore.get(
                            "zscore_medio"
                        ),

                    "zscore_maximo":

                        zscore.get(
                            "zscore_maximo"
                        ),

                    "percentual_anomalias":

                        zscore.get(
                            "percentual_anomalias"
                        )
                },

            "gaussiana":

                {

                    "score_medio":

                        gaussiana.get(
                            "score_medio"
                        ),

                    "score_maximo":

                        gaussiana.get(
                            "score_maximo"
                        )
                },

            "geo_distancia":

                {

                    "distancia_media":

                        distancia.get(
                            "distancia_media"
                        ),

                    "score_medio":

                        distancia.get(
                            "score_medio"
                        )
                },

            "geo_ip":

                {

                    "redes_unicas":

                        ip.get(
                            "redes_unicas"
                        ),

                    "score_medio":

                        ip.get(
                            "score_medio"
                        )
                },

            "geo_velocidade":

                {

                    "velocidade_media":

                        velocidade.get(
                            "velocidade_media"
                        ),

                    "velocidade_maxima":

                        velocidade.get(
                            "velocidade_maxima"
                        ),

                    "score_medio":

                        velocidade.get(
                            "score_medio"
                        )
                }
        }