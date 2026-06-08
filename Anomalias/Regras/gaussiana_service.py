import io

import numpy as np
import pandas as pd

import matplotlib.pyplot as plt

from fastapi.responses import (
    StreamingResponse
)


class GaussianaService:

    # =====================================================
    # DISTRIBUIÇÃO GAUSSIANA
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

        mu = (
            df["valor"]
            .mean()
        )

        sigma = (
            df["valor"]
            .std()
        )

        if (

            pd.isna(
                sigma
            )

            or

            sigma == 0
        ):

            sigma = 1

        df["log_prob"] = (

            -(
                (
                    df["valor"] - mu
                ) ** 2
            )

            /

            (
                2 * sigma ** 2
            )
        )

        max_prob = (
            df["log_prob"]
            .max()
        )

        min_prob = (
            df["log_prob"]
            .min()
        )

        if max_prob == min_prob:

            df["score_fraude"] = 0

        else:

            df["score_fraude"] = (

                (
                    max_prob
                    - df["log_prob"]
                )

                /

                (
                    max_prob
                    - min_prob
                )
            )

        return {

            "media":
                float(mu),

            "desvio_padrao":
                float(sigma),

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

            "dados":
                df.copy()
        }

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

        X = np.arange(
            len(df)
        )

        Y = (
            df["valor"]
            .to_numpy()
        )

        plt.style.use(
            "seaborn-v0_8-whitegrid"
        )

        fig, ax = plt.subplots(
            figsize=(12, 6)
        )

        scatter = ax.scatter(

            X,

            Y,

            c=df["score_fraude"],

            cmap="coolwarm"
        )

        ax.axhline(
            resultado["media"],
            linestyle="--"
        )

        ax.set_title(
            f"Distribuição Gaussiana - Conta {conta}"
        )

        ax.set_xlabel(
            "Transações"
        )

        ax.set_ylabel(
            "Valor"
        )

        cbar = plt.colorbar(
            scatter,
            ax=ax
        )

        cbar.set_label(
            "Score de Fraude"
        )

        buf = io.BytesIO()

        fig.savefig(
            buf,
            format="png",
            bbox_inches="tight",
            dpi=300
        )

        buf.seek(0)

        plt.close(fig)

        return StreamingResponse(
            buf,
            media_type="image/png"
        )