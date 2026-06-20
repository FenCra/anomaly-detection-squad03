import pandas as pd
import numpy as np

from math import (
    radians,
    sin,
    cos,
    sqrt,
    atan2
)


class GeoServices:

    
    def haversine(
        self,
        lat1,
        lon1,
        lat2,
        lon2
    ):

        R = 6371

        dlat = radians(
            lat2 - lat1
        )

        dlon = radians(
            lon2 - lon1
        )

        a = (

            sin(dlat / 2) ** 2

            +

            cos(
                radians(lat1)
            )

            *

            cos(
                radians(lat2)
            )

            *

            sin(dlon / 2) ** 2
        )

        c = 2 * atan2(
            sqrt(a),
            sqrt(1 - a)
        )

        return R * c

    # =====================================================
    # DISTÂNCIA
    # =====================================================

    def analisar_distancia(
        self,
        df
    ):

        df = df.dropna()

        if len(df) < 3:

            return {
                "erro":
                "Poucas transações"
            }

        df = df.copy()

        lat_media = (
            df["latitude"]
            .mean()
        )

        lon_media = (
            df["longitude"]
            .mean()
        )

        df["distancia"] = df.apply(

            lambda row:

            self.haversine(

                lat_media,

                lon_media,

                row["latitude"],

                row["longitude"]
            ),

            axis=1
        )

        distancia_max = (
            df["distancia"]
            .max()
        )

        if distancia_max == 0:

            df["score"] = 0

        else:

            df["score"] = (

                df["distancia"]

                /

                distancia_max
            )

        return {

            "distancia_media":

                float(
                    df["distancia"]
                    .mean()
                ),

            "distancia_maxima":

                float(
                    df["distancia"]
                    .max()
                ),

            "distancia_minima":

                float(
                    df["distancia"]
                    .min()
                ),

            "score_medio":

                float(
                    df["score"]
                    .mean()
                ),

            "dados":
                df
        }

    # =====================================================
    # GEO IP
    # =====================================================

    def analisar_ip(
        self,
        df
    ):

        df = df.dropna(
            subset=["ip_origem"]
        )

        if len(df) < 2:

            return {
                "erro":
                "Poucas transações"
            }

        df = df.copy()

        df["rede"] = (

            df["ip_origem"]

            .astype(str)

            .str.split(".")

            .str[:2]

            .str.join(".")
        )

        freq = (

            df["rede"]

            .value_counts(
                normalize=True
            )
        )

        df["frequencia"] = (
            df["rede"]
            .map(freq)
        )

        df["score"] = (
            1 - df["frequencia"]
        )

        score_max = (
            df["score"]
            .max()
        )

        score_min = (
            df["score"]
            .min()
        )

        if score_max == score_min:

            df["score_normalizado"] = 0

        else:

            df["score_normalizado"] = (

                (
                    df["score"]
                    - score_min
                )

                /

                (
                    score_max
                    - score_min
                )
            )

        return {

            "quantidade_redes":

                int(
                    df["rede"]
                    .nunique()
                ),

            "rede_predominante":

                (
                    df["rede"]
                    .mode()[0]
                ),

            "score_medio":

                float(
                    df["score_normalizado"]
                    .mean()
                ),

            "score_maximo":

                float(
                    df["score_normalizado"]
                    .max()
                ),

            "dados":
                df
        }

    # =====================================================
    # GEO VELOCIDADE
    # =====================================================

    def analisar_velocidade(
        self,
        df
    ):

        df = df.dropna(

            subset=[
                "latitude",
                "longitude",
                "data",
                "hora"
            ]
        )

        if len(df) < 2:

            return {
                "erro": (
                    "A conta precisa ter pelo menos 2 transações"
                )
            }

        df = df.copy()

        df["datetime"] = pd.to_datetime(

            df["data"].astype(str)

            + " "

            + df["hora"].astype(str),

            errors="coerce"
        )

        df["lat_ant"] = (
            df["latitude"]
            .shift(1)
        )

        df["lon_ant"] = (
            df["longitude"]
            .shift(1)
        )

        df["distancia_km"] = df.apply(

            lambda row:

            self.haversine(

                row["lat_ant"],

                row["lon_ant"],

                row["latitude"],

                row["longitude"]

            )

            if pd.notnull(
                row["lat_ant"]
            )

            else 0,

            axis=1
        )

        df["tempo_horas"] = (

            df["datetime"]

            .diff()

            .dt.total_seconds()

            / 3600
        )

        df["tempo_horas"] = (

            df["tempo_horas"]

            .replace(
                0,
                np.nan
            )
        )

        df["velocidade"] = (

            df["distancia_km"]

            /

            df["tempo_horas"]
        )

        df["velocidade"] = (

            df["velocidade"]

            .replace(
                [np.inf, -np.inf],
                np.nan
            )

            .fillna(0)
        )

        vel_max = (
            df["velocidade"]
            .max()
        )

        if vel_max == 0:

            df["score"] = 0

        else:

            df["score"] = (

                df["velocidade"]

                /

                vel_max
            )

        return {

            "velocidade_media":

                float(
                    df["velocidade"]
                    .mean()
                ),

            "velocidade_maxima":

                float(
                    df["velocidade"]
                    .max()
                ),

            "velocidade_minima":

                float(
                    df["velocidade"]
                    .min()
                ),

            "score_medio":

                float(
                    df["score"]
                    .mean()
                ),

            "dados":
                df
        }