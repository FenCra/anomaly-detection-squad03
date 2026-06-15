from Regras.zscore_service import (
    ZScoreService
)

from Regras.gaussiana_service import (
    GaussianaService
)

from Services.localizacao_service import (
    LocalizacaoService
)


class PerfilRegras:

    def __init__(self):

        self.zscore_service = ZScoreService()

        self.gaussiana_service = GaussianaService()

        self.localizacao_service = LocalizacaoService()

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
                round(
                    float(
                        df["valor"].mean()
                    ),
                    2
                ),

            "ticket_maximo":
                round(
                    float(
                        df["valor"].max()
                    ),
                    2
                ),

            "ticket_minimo":
                round(
                    float(
                        df["valor"].min()
                    ),
                    2
                ),

            "desvio_padrao":
                round(
                    float(
                        df["valor"].std()
                    ),
                    2
                )
        }

    # =====================================================
    # COMPORTAMENTO
    # =====================================================

    def _comportamento(
        self,
        df
    ):

        horario = (
            df["hora"]
            .astype(str)
            .str[:2]
            .mode()
            .iloc[0]
        )

        return {

            "cidade_predominante":
                str(
                    df["cidade"]
                    .mode()
                    .iloc[0]
                ),

            "categoria_predominante":
                str(
                    df["categoria"]
                    .mode()
                    .iloc[0]
                ),

            "dispositivo_predominante":
                str(
                    df["dispositivo"]
                    .mode()
                    .iloc[0]
                ),

            "horario_predominante":
                f"{horario}h"
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
                round(
                    float(media),
                    2
                ),

            "desvio_padrao":
                round(
                    float(desvio),
                    2
                ),

            "valor_habitual_min":
                round(
                    float(
                        media - desvio
                    ),
                    2
                ),

            "valor_habitual_max":
                round(
                    float(
                        media + desvio
                    ),
                    2
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
            self.zscore_service
            .analisar_zscore(
                df
            )
        )

        gaussiana = (
            self.gaussiana_service
            .analisar_gaussiana(
                df
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

            "zscore": {

                "zscore_medio":
                    round(
                        zscore.get(
                            "zscore_medio"
                        ),
                        2
                    ),

                "zscore_maximo":
                    round(
                        zscore.get(
                            "zscore_maximo"
                        ),
                        2
                    ),

                "percentual_anomalias":
                    f"{round(zscore.get('percentual_anomalias'), 2)}%"

            },

            "gaussiana": {

                "score_medio":
                    round(
                        gaussiana.get(
                            "score_medio"
                        ),
                        2
                    ),

                "score_maximo":
                    round(
                        gaussiana.get(
                            "score_maximo"
                        ),
                        2
                    )

            },

            "geo_distancia": {

                "distancia_media":
                    round(
                        distancia.get(
                            "distancia_media"
                        ),
                        2
                    )

            },

            "geo_ip": {

                "ip_predominante":
                    ip.get(
                        "ip_predominante"
                    )

            },

            "geo_velocidade": {

                "velocidade_media":
                    round(
                        velocidade.get(
                            "velocidade_media"
                        ),
                        2
                    ),

                "velocidade_maxima":
                    round(
                        velocidade.get(
                            "velocidade_maxima"
                        ),
                        2
                    )

            }

        }