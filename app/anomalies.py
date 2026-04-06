"""Regras de detecção de anomalias."""
from sqlalchemy.orm import Session
from app.models import Transaction
import statistics

class AnomalyDetector:
    """Detector de anomalias em transações."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def detect_all(self, regra: str = None):
        """Detecta anomalias usando todas as regras."""
        anomalias = []
        if regra is None or regra == "valor_anomalo":
            anomalias.extend(self.regra_valor_anomalo())
        if regra is None or regra == "cidade_incomum":
            anomalias.extend(self.regra_cidade_incomum())
        if regra is None or regra == "burst_transacoes":
            anomalias.extend(self.regra_burst_transacoes())
        return anomalias
    
    def regra_valor_anomalo(self):
        """Valor acima da média + 2x desvio padrão."""
        anomalias = []
        contas = self.db.query(Transaction.id_conta).distinct().all()
        for (conta,) in contas:
            trans = self.db.query(Transaction).filter(Transaction.id_conta == conta).all()
            if len(trans) < 2:
                continue
            valores = [t.valor for t in trans]
            media = statistics.mean(valores)
            desvio = statistics.stdev(valores) if len(valores) > 1 else 0
            limite = media + (2 * desvio) if desvio > 0 else media * 2
            for t in trans:
                if t.valor > limite:
                    anomalias.append({
                        "id": t.id, "id_conta": t.id_conta, "valor": t.valor,
                        "data": str(t.data), "hora": str(t.hora), "categoria": t.categoria,
                        "cidade": t.cidade, "dispositivo": t.dispositivo,
                        "motivo": f"Valor {t.valor:.2f} acima do limite esperado ({limite:.2f})",
                        "regra": "valor_anomalo", "severidade": "alta"
                    })
        return anomalias
    
    def regra_cidade_incomum(self):
        """Transação em cidade não visto antes."""
        anomalias = []
        contas = self.db.query(Transaction.id_conta).distinct().all()
        for (conta,) in contas:
            trans = self.db.query(Transaction).filter(Transaction.id_conta == conta).order_by(Transaction.data, Transaction.hora).all()
            cidades = set()
            for t in trans:
                if t.cidade not in cidades:
                    if len(cidades) > 0:
                        anomalias.append({
                            "id": t.id, "id_conta": t.id_conta, "valor": t.valor,
                            "data": str(t.data), "hora": str(t.hora), "categoria": t.categoria,
                            "cidade": t.cidade, "dispositivo": t.dispositivo,
                            "motivo": f"Transação em cidade incomum: {t.cidade}",
                            "regra": "cidade_incomum", "severidade": "media"
                        })
                    cidades.add(t.cidade)
        return anomalias
    
    def regra_burst_transacoes(self):
        """5+ transações no mesmo dia."""
        anomalias = []
        contas = self.db.query(Transaction.id_conta).distinct().all()
        for (conta,) in contas:
            trans = self.db.query(Transaction).filter(Transaction.id_conta == conta).order_by(Transaction.data).all()
            if len(trans) < 5:
                continue
            for i in range(len(trans) - 4):
                t = trans[i]
                proximas = trans[i+1:i+5]
                if all(p.data == t.data for p in proximas):
                    anomalias.append({
                        "id": t.id, "id_conta": t.id_conta, "valor": t.valor,
                        "data": str(t.data), "hora": str(t.hora), "categoria": t.categoria,
                        "cidade": t.cidade, "dispositivo": t.dispositivo,
                        "motivo": "Burst de transações: 5+ transações no mesmo dia",
                        "regra": "burst_transacoes", "severidade": "alta"
                    })
        return anomalias
