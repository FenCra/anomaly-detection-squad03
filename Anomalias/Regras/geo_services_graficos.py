import io

import matplotlib.pyplot as plt

from fastapi.responses import (
    StreamingResponse
)


class GeoGraficoService:

    # =====================================================
    # DISTÂNCIA
    # =====================================================

    def grafico_distancia(
        self,
        resultado,
        conta: str
    ):

        if "erro" in resultado:

            return resultado

        df = resultado["dados"]

        fig, ax = plt.subplots(
            figsize=(12, 6)
        )

        scatter = ax.scatter(

            range(len(df)),

            df["distancia"],

            c=df["score"],

            cmap="coolwarm"
        )

        ax.set_title(
            f"Distância Geográfica - Conta {conta}"
        )

        ax.set_xlabel(
            "Transações"
        )

        ax.set_ylabel(
            "Distância (km)"
        )

        cbar = plt.colorbar(
            scatter,
            ax=ax
        )

        cbar.set_label(
            "Score"
        )

        buf = io.BytesIO()

        fig.savefig(
            buf,
            format="png",
            dpi=300,
            bbox_inches="tight"
        )

        buf.seek(0)

        plt.close(fig)

        return StreamingResponse(
            buf,
            media_type="image/png"
        )

    # =====================================================
    # IP
    # =====================================================

    def grafico_ip(
        self,
        resultado,
        conta: str
    ):

        if "erro" in resultado:

            return resultado

        df = resultado["dados"]

        fig, ax = plt.subplots(
            figsize=(12, 6)
        )

        scatter = ax.scatter(

            range(len(df)),

            df["score_normalizado"],

            c=df["score_normalizado"],

            cmap="coolwarm"
        )

        ax.set_title(
            f"Anomalia de IP - Conta {conta}"
        )

        ax.set_xlabel(
            "Transações"
        )

        ax.set_ylabel(
            "Score de Anomalia"
        )

        cbar = plt.colorbar(
            scatter,
            ax=ax
        )

        cbar.set_label(
            "Score"
        )

        buf = io.BytesIO()

        fig.savefig(
            buf,
            format="png",
            dpi=300,
            bbox_inches="tight"
        )

        buf.seek(0)

        plt.close(fig)

        return StreamingResponse(
            buf,
            media_type="image/png"
        )

    # =====================================================
    # VELOCIDADE
    # =====================================================

    def grafico_velocidade(
        self,
        resultado,
        conta: str
    ):

        if "erro" in resultado:

            return resultado

        df = resultado["dados"]

        fig, ax = plt.subplots(
            figsize=(12, 6)
        )

        scatter = ax.scatter(

            range(len(df)),

            df["velocidade"],

            c=df["score"],

            cmap="coolwarm"
        )

        ax.axhline(
            900,
            linestyle="--"
        )

        ax.set_title(
            f"Velocidade Geográfica - Conta {conta}"
        )

        ax.set_xlabel(
            "Transações"
        )

        ax.set_ylabel(
            "Velocidade (km/h)"
        )

        cbar = plt.colorbar(
            scatter,
            ax=ax
        )

        cbar.set_label(
            "Score de Anomalia"
        )

        buf = io.BytesIO()

        fig.savefig(
            buf,
            format="png",
            dpi=300,
            bbox_inches="tight"
        )

        buf.seek(0)

        plt.close(fig)

        return StreamingResponse(
            buf,
            media_type="image/png"
        )