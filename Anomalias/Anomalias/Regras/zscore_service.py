import io

import numpy as np
import pandas as pd

import matplotlib.pyplot as plt

from fastapi.responses import (
    StreamingResponse
)


class ZScoreService:

    def analisar_zscore(
        self,
        df
    ):

        if df.empty:

            return {
                "erro": (
                    "Nenhuma transação encontrada"
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

        df = df.copy()

        df["zscore"] = (

            (df["valor"] - media)

            / desvio_padrao
        )

        df["score_anomalia"] = (
            np.abs(
                df["zscore"]
            )
        )

        df["anomalia"] = (
            df["score_anomalia"] > 2
        )

        return {

            "media":
                float(media),

            "desvio_padrao":
                float(desvio_padrao),

            "zscore_medio":
                float(
                    df["zscore"]
                    .abs()
                    .mean()
                ),

            "zscore_maximo":
                float(
                    df["zscore"]
                    .abs()
                    .max()
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

    def grafico_zscore(
        self,
        df,
        conta: str
    ):

        resultado = (
            self.analisar_zscore(df)
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

            range(len(df)),

            df["valor"],

            c=cores
        )

        plt.title(
            f"Z-Score - Conta {conta}"
        )

        plt.xlabel(
            "Transações"
        )

        plt.ylabel(
            "Valor"
        )

        plt.grid(True)

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