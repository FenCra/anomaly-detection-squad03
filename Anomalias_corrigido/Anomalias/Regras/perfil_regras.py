from Regras.zscore_service import ZScoreService
from Regras.gaussiana_service import GaussianaService
from Services.localizacao_service import LocalizacaoService
import pandas as pd


class PerfilRegras:

    def __init__(self):
        self.zscore_service = ZScoreService()
        self.gaussiana_service = GaussianaService()
        self.localizacao_service = LocalizacaoService()

    # =====================================================
    # PERFIL BÁSICO
    # =====================================================

    def _perfil_basico(self, df):

        if df is None or df.empty:
            return {
                "quantidade_transacoes": 0,
                "ticket_medio": 0,
                "ticket_maximo": 0,
                "ticket_minimo": 0,
                "desvio_padrao": 0
            }

        return {
            "quantidade_transacoes": int(len(df)),
            "ticket_medio": round(float(df["valor"].mean()), 2),
            "ticket_maximo": round(float(df["valor"].max()), 2),
            "ticket_minimo": round(float(df["valor"].min()), 2),
            "desvio_padrao": round(float(df["valor"].std()), 2)
        }

    # =====================================================
    # COMPORTAMENTO (CORRIGIDO - HORA SEGURA)
    # =====================================================

    def _comportamento(self, df):

        if df is None or df.empty:
            return {
                "cidade_predominante": None,
                "categoria_predominante": None,
                "dispositivo_predominante": None,
                "horario_predominante": None
            }

        def safe_mode(series):
            m = series.mode()
            return m.iloc[0] if not m.empty else None

        # =====================================================
        # CORREÇÃO DEFINITIVA DA HORA (SEU ERRO RESOLVIDO)
        # =====================================================

        df = df.copy()

        df["hora"] = pd.to_datetime(df["hora"], errors="coerce")

        horario_series = df["hora"].dt.hour

        horario_mode = horario_series.mode()
        horario = horario_mode.iloc[0] if not horario_mode.empty else None

        return {
            "cidade_predominante": safe_mode(df["cidade"]),
            "categoria_predominante": safe_mode(df["categoria"]),
            "dispositivo_predominante": safe_mode(df["dispositivo"]),
            "horario_predominante": f"{int(horario)}h" if horario is not None else None
        }

    # =====================================================
    # ASSINATURA FINANCEIRA
    # =====================================================

    def _assinatura_financeira(self, df):

        if df is None or df.empty:
            return {
                "media": 0,
                "desvio_padrao": 0,
                "valor_habitual_min": 0,
                "valor_habitual_max": 0
            }

        media = df["valor"].mean()
        desvio = df["valor"].std()

        return {
            "media": round(float(media), 2),
            "desvio_padrao": round(float(desvio), 2),
            "valor_habitual_min": round(float(media - desvio), 2),
            "valor_habitual_max": round(float(media + desvio), 2)
        }

    # =====================================================
    # GERAR PERFIL
    # =====================================================

    def gerar_perfil(self, df, conta: str):

        if df is None or df.empty:
            return {
                "conta": conta,
                "erro": "Sem dados suficientes para gerar perfil"
            }

        zscore = self.zscore_service.analisar_zscore(df)
        gaussiana = self.gaussiana_service.analisar_gaussiana(df)

        distancia = self.localizacao_service.analisar_distancia(conta)
        ip = self.localizacao_service.analisar_ip(conta)
        velocidade = self.localizacao_service.analisar_velocidade(conta)

        return {
            "conta": conta,

            "perfil_basico": self._perfil_basico(df),

            "comportamento": self._comportamento(df),

            "assinatura_financeira": self._assinatura_financeira(df),

            "zscore": {
                "zscore_medio": round(zscore.get("zscore_medio") or 0, 2),
                "zscore_maximo": round(zscore.get("zscore_maximo") or 0, 2),
                "percentual_anomalias": f"{round(zscore.get('percentual_anomalias') or 0, 2)}%"
            },

            "gaussiana": {
                "score_medio": round(gaussiana.get("score_medio") or 0, 2),
                "score_maximo": round(gaussiana.get("score_maximo") or 0, 2)
            },

            "geo_distancia": {
                "distancia_media": round(distancia.get("distancia_media") or 0, 2)
            },

            "geo_ip": {
                "ip_predominante": ip.get("ip_predominante")
            },

            "geo_velocidade": {
                "velocidade_media": round(velocidade.get("velocidade_media") or 0, 2),
                "velocidade_maxima": round(velocidade.get("velocidade_maxima") or 0, 2)
            }
        }