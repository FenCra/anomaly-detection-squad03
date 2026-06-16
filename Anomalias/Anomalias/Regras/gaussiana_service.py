import io

import numpy as np
import pandas as pd

import matplotlib.pyplot as plt

from fastapi.responses import (
    StreamingResponse
)


class GaussianaService:

    # =====================================================
    # ANÁLISE GAUSSIANA
    # =====================================================

    def analisar_gaussiana(
        self,
        df
    ):

        if df.empty:

            return {
                "erro": (
                    "Nenhuma transação encontrada"
                )
            }

        df = df.copy()

        df["valor"] = pd.to_numeric(
            df["valor"],
            errors="coerce"
        )

        df = df.dropna(
            subset=["valor"]
        )

        if df.empty:

            return {
                "erro": (
                    "Valores inválidos"
                )
            }

        media = (
            df["valor"]
            .mean()
        )

        desvio_padrao = (
            df["valor"]
            .std()
        )

        if (

            pd.isna(
                desvio_padrao
            )

            or

            desvio_padrao == 0
        ):

            return {
                "erro": (
                    "Desvio padrão inválido"
                )
            }

        # =====================================================
        # DENSIDADE GAUSSIANA
        # =====================================================

        df["probabilidade"] = (

            1

            /

            (
                desvio_padrao
                * np.sqrt(
                    2 * np.pi
                )
            )

        ) * np.exp(

            -(
                (
                    df["valor"]
                    - media
                ) ** 2
            )

            /

            (
                2
                * desvio_padrao ** 2
            )

        )

        # =====================================================
        # SCORE DE FRAUDE
        # =====================================================

        max_prob = (
            df["probabilidade"]
            .max()
        )

        min_prob = (
            df["probabilidade"]
            .min()
        )

        if max_prob == min_prob:

            df["score_fraude"] = 0

        else:

            df["score_fraude"] = (

                (
                    max_prob
                    - df["probabilidade"]
                )

                /

                (
                    max_prob
                    - min_prob
                )

            )

        # =====================================================
        # CLASSIFICAÇÃO
        # =====================================================

        df["anomalia"] = (
            df["score_fraude"]
            > 0.90
        )

        return {

            "media":
                float(media),

            "desvio_padrao":
                float(desvio_padrao),

            "score_medio":
                float(
                    df["score_fraude"]
                    .mean()
                ),

            "score_maximo":
                float(
                    df["score_fraude"]
                    .max()
                ),

            "score_minimo":
                float(
                    df["score_fraude"]
                    .min()
                ),

            "quantidade_anomalias":
                int(
                    df["anomalia"]
                    .sum()
                ),

            "percentual_anomalias":
                float(

                    (
                        df["anomalia"]
                        .sum()

                        /

                        len(df)

                    ) * 100

                ),

            "dados":
                df.copy()

        }

    # =====================================================
    # GRÁFICO
    # =====================================================

    def grafico_gaussiana(
        self,
        df,
        conta: str
    ):

        resultado = (
            self.analisar_gaussiana(df)
        )

        if "erro" in resultado:

            return resultado

        df = resultado["dados"]

        plt.figure(
            figsize=(12, 6)
        )

        cores = df["anomalia"].map({

            True: "red",

            False: "blue"

        })

        plt.scatter(

            range(
                len(df)
            ),

            df["valor"],

            c=cores,

            s=50

        )

        plt.axhline(

            resultado["media"],

            linestyle="--",

            color="black",

            label="Média"

        )

        plt.title(
            f"Distribuição Gaussiana - Conta {conta}"
        )

        plt.xlabel(
            "Transações"
        )

        plt.ylabel(
            "Valor"
        )

        plt.grid(True)

        plt.legend()

        buf = io.BytesIO()

        plt.savefig(

            buf,

            format="png",

            bbox_inches="tight",

            dpi=300

        )

        buf.seek(0)

        plt.close()

        return StreamingResponse(

            buf,

            media_type="image/png"

        )