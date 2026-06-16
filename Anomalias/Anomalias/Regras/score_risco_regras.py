import pandas as pd

class ScoreService:

    def calcular_score(self, perfil: dict, transacao):

        score = 0
        motivos = []

        # =====================================================
        # PROTEÇÃO GERAL DO PERFIL
        # =====================================================

        if not perfil:
           perfil = {}

        # =====================================================
        # ASSINATURA FINANCEIRA (SAFE)
        # =====================================================

        assinatura = perfil.get("assinatura_financeira", {})

        valor_habitual_max = assinatura.get("valor_habitual_max", 0)

        if getattr(transacao, "valor", 0) > valor_habitual_max:
            score += 30
            motivos.append("Valor acima do padrão financeiro")

        # =====================================================
        # COMPORTAMENTO (SAFE)
        # =====================================================

        comportamento = perfil.get("comportamento", {})

        # -------- HORÁRIO --------

        horario_predominante = (
            str(comportamento.get("horario_predominante", "00h"))
            .replace("h", "")
        )

        hora_transacao = str(pd.to_datetime(transacao.hora, errors="coerce").hour)

        if hora_transacao != horario_predominante:
            score += 15
            motivos.append("Horário incomum")

        # -------- CIDADE --------

        cidade_pred = (comportamento.get("cidade_predominante") or "").lower()
        cidade_trans = (getattr(transacao, "cidade", "") or "").lower()

        if cidade_trans and cidade_trans != cidade_pred:
            score += 20
            motivos.append("Cidade incomum")

        # -------- DISPOSITIVO --------

        dispositivo_pred = (comportamento.get("dispositivo_predominante") or "").lower()
        dispositivo_trans = (getattr(transacao, "dispositivo", "") or "").lower()

        if dispositivo_trans and dispositivo_trans != dispositivo_pred:
            score += 20
            motivos.append("Dispositivo diferente do habitual")

        # -------- CATEGORIA --------

        categoria_pred = (comportamento.get("categoria_predominante") or "").lower()
        categoria_trans = (getattr(transacao, "categoria", "") or "").lower()

        if categoria_trans and categoria_trans != categoria_pred:
            score += 10
            motivos.append("Categoria incomum")

        # =====================================================
        # TENTATIVAS
        # =====================================================

        if getattr(transacao, "tentativas", 0) >= 3:
            score += 40
            motivos.append("Múltiplas tentativas")

        # =====================================================
        # PAÍS
        # =====================================================

        pais = (getattr(transacao, "pais", "") or "").lower()

        if pais and pais != "brasil":
            score += 35
            motivos.append("Transação internacional")

        # =====================================================
        # CLASSIFICAÇÃO FINAL
        # =====================================================

        if score <= 30:
            classificacao = "BAIXO"
        elif score <= 60:
            classificacao = "MÉDIO"
        else:
            classificacao = "ALTO"

        return {
            "score": score,
            "classificacao": classificacao,
            "motivos": motivos
        }