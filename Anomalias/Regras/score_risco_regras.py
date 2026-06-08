class ScoreRiscoRegras:

    def calcular_score(

        self,

        perfil

    ):

        score = 0

        motivos = []

        # ==========================
        # ZSCORE
        # ==========================

        if perfil["zscore_maximo"] > 2:

            score += 20

            motivos.append(
                "valor fora do padrão"
            )

        # ==========================
        # GAUSSIANA
        # ==========================

        if perfil["score_gaussiano"] > 0.7:

            score += 15

            motivos.append(
                "baixa probabilidade estatística"
            )

        # ==========================
        # IP
        # ==========================

        if perfil["score_ip"] > 0.5:

            score += 10

            motivos.append(
                "rede incomum"
            )

        # ==========================
        # DISTÂNCIA
        # ==========================

        if perfil["score_distancia"] > 0.6:

            score += 15

            motivos.append(
                "localização incomum"
            )

        # ==========================
        # VELOCIDADE
        # ==========================

        if perfil["score_velocidade"] > 0.7:

            score += 25

            motivos.append(
                "deslocamento suspeito"
            )

        return {

            "score": score,

            "motivos": motivos
        }