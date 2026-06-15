class ScoreService:

    def calcular_score(
        self,
        perfil: dict,
        transacao
    ):

        score = 0

        motivos = []

        # ==========================================
        # ASSINATURA FINANCEIRA
        # ==========================================

        assinatura = (
            perfil["assinatura_financeira"]
        )

        if (
            transacao.valor >
            assinatura["valor_habitual_max"]
        ):

            score += 30

            motivos.append(
                "Valor acima do padrão financeiro"
            )

        # ==========================================
        # HORÁRIO
        # ==========================================

        horario_habitual = (

            perfil["comportamento"]
            ["horario_predominante"]
            .replace("h", "")
        )

        hora_transacao = (
            str(transacao.hora)[:2]
        )

        if (
            hora_transacao
            !=
            horario_habitual
        ):

            score += 15

            motivos.append(
                "Horário incomum"
            )

        # ==========================================
        # CIDADE
        # ==========================================

        if (

            transacao.cidade.lower()

            !=

            perfil["comportamento"][
                "cidade_predominante"
            ].lower()

        ):

            score += 20

            motivos.append(
                "Cidade incomum"
            )

        # ==========================================
        # DISPOSITIVO
        # ==========================================

        if (

            transacao.dispositivo.lower()

            !=

            perfil["comportamento"][
                "dispositivo_predominante"
            ].lower()

        ):

            score += 20

            motivos.append(
                "Dispositivo diferente do habitual"
            )

        # ==========================================
        # CATEGORIA
        # ==========================================

        if (

            transacao.categoria.lower()

            !=

            perfil["comportamento"][
                "categoria_predominante"
            ].lower()

        ):

            score += 10

            motivos.append(
                "Categoria incomum"
            )

        # ==========================================
        # MUITAS TENTATIVAS
        # ==========================================

        if (
            transacao.tentativas >= 3
        ):

            score += 40

            motivos.append(
                "Múltiplas tentativas"
            )

        # ==========================================
        # PAÍS DIFERENTE
        # ==========================================

        if (

            hasattr(
                transacao,
                "pais"
            )

            and

            transacao.pais.lower()

            !=

            "brasil"

        ):

            score += 35

            motivos.append(
                "Transação internacional"
            )

        # ==========================================
        # CLASSIFICAÇÃO
        # ==========================================

        if score <= 30:

            classificacao = (
                "BAIXO"
            )

        elif score <= 60:

            classificacao = (
                "MÉDIO"
            )

        else:

            classificacao = (
                "ALTO"
            )

        return {

            "score":
                score,

            "classificacao":
                classificacao,

            "motivos":
                motivos

        }