import io
import matplotlib.pyplot as plt
from fastapi.responses import StreamingResponse

from Core.conexao import get_connection
import pandas as pd


class TransacaoRepository:

    def get_transacoes(self):

        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT TOP 100 * FROM transacoes")

        colunas = [col[0] for col in cursor.description]

        dados = [
            dict(zip(colunas, row))
            for row in cursor.fetchall()
        ]

        conn.close()

        return {
            "mensagem": "Retornando as 100 primeiras transações do banco",
            "transacoes": dados
        }

    def get_transacao_por_conta(self, conta: str):

        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute(
            "SELECT * FROM transacoes WHERE conta = ?",
            (conta,)
        )

        rows = cursor.fetchall()

        if rows:

            colunas = [col[0] for col in cursor.description]

            resultados = [dict(zip(colunas, row)) for row in rows]

            conn.close()

            return {
                "conta": conta,
                "total_transacoes": len(resultados),
                "transacoes": resultados
            }

        conn.close()

        return {
            "erro": "Transação não encontrada"
        }

    def get_contas(self):

        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute(
            "SELECT TOP 100 conta FROM transacoes"
        )

        contas = [row[0] for row in cursor.fetchall()]

        conn.close()

        return {
            "mensagem": "Retornando as 100 primeiras contas",
            "contas": contas
        }

    def inserir_transacao(self, transacao):

        conn = get_connection()
        cursor = conn.cursor()

        try:
            cursor.execute(
                """
                INSERT INTO transacoes (
                    id,
                    valor,
                    data,
                    hora,
                    dia_semana,
                    categoria,
                    conta,
                    cidade,
                    estado,
                    pais,
                    latitude,
                    longitude,
                    tipo_transacao,
                    dispositivo,
                    estabelecimento,
                    tentativas,
                    ip_origem,
                    is_fraude
                )
                VALUES (
                   ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
                )
                """,
                (
                    transacao.id,
                    transacao.valor,
                    transacao.data,
                    transacao.hora,
                    transacao.dia_semana,
                    transacao.categoria,
                    transacao.conta,
                    transacao.cidade,
                    transacao.estado,
                    transacao.pais,
                    transacao.latitude,
                    transacao.longitude,
                    transacao.tipo_transacao,
                    transacao.dispositivo,
                    transacao.estabelecimento,
                    transacao.tentativas,
                    transacao.ip_origem,
                    int(transacao.is_fraude)
                )
            )

            conn.commit()

            return {
                "mensagem": "Transação inserida com sucesso",
                "is_fraude": transacao.is_fraude,
                "motivos": transacao.motivos
            }

        except Exception as e:
            conn.rollback()
            return {"erro": str(e)}

        finally:
            conn.close()

    def update_status_fraude(
        self,
        id: int,
        is_fraude: bool
    ):

        conn = get_connection()
        cursor = conn.cursor()

        try:

            cursor.execute(
                """
                UPDATE transacoes
                SET is_fraude = ?
                WHERE id = ?
                """,
                (
                    int(is_fraude),
                    id
                )
            )

            conn.commit()

            return {
                "mensagem": "Status de fraude atualizado com sucesso"
            }

        except Exception as e:
            conn.rollback()
            return {
                "erro": str(e)
            }

        finally:
            conn.close()

    def delete_transacao(
        self,
        id: int
    ):

        conn = get_connection()
        cursor = conn.cursor()

        try:

            cursor.execute(
                """
                DELETE FROM transacoes
                WHERE id = ?
                """,
                (id,)
            )

            conn.commit()

            return {
                "mensagem": "Transação deletada com sucesso"
            }

        except Exception as e:
            conn.rollback()
            return {
                "erro": str(e)
            }

        finally:
            conn.close()

    def get_cidades(self):

        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT DISTINCT cidade
            FROM transacoes
            WHERE cidade IS NOT NULL
            ORDER BY cidade
            """
        )

        cidades = [row[0] for row in cursor.fetchall()]

        conn.close()

        return {
            "total": len(cidades),
            "cidades": cidades
        }

    def dashboard_metrics(self):

        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT
                COUNT(*) as total_transacoes_global,
                SUM(CASE WHEN is_fraude = 1 THEN 1 ELSE 0 END) as total_fraudes_global,
                SUM(valor) as total_movimentado_global,

                -- Mês Atual
                SUM(CASE WHEN MONTH(data) = MONTH(GETDATE()) AND YEAR(data) = YEAR(GETDATE()) THEN 1 ELSE 0 END) as transacoes_mes,
                SUM(CASE WHEN MONTH(data) = MONTH(GETDATE()) AND YEAR(data) = YEAR(GETDATE()) AND is_fraude = 1 THEN 1 ELSE 0 END) as fraudes_mes,
                SUM(CASE WHEN MONTH(data) = MONTH(GETDATE()) AND YEAR(data) = YEAR(GETDATE()) THEN valor ELSE 0 END) as valor_mes,

                -- Mês Anterior
                SUM(CASE WHEN MONTH(data) = MONTH(DATEADD(month, -1, GETDATE())) AND YEAR(data) = YEAR(DATEADD(month, -1, GETDATE())) THEN 1 ELSE 0 END) as transacoes_mes_ant,
                SUM(CASE WHEN MONTH(data) = MONTH(DATEADD(month, -1, GETDATE())) AND YEAR(data) = YEAR(DATEADD(month, -1, GETDATE())) AND is_fraude = 1 THEN 1 ELSE 0 END) as fraudes_mes_ant,
                SUM(CASE WHEN MONTH(data) = MONTH(DATEADD(month, -1, GETDATE())) AND YEAR(data) = YEAR(DATEADD(month, -1, GETDATE())) THEN valor ELSE 0 END) as valor_mes_ant
            FROM transacoes
        """)

        row = cursor.fetchone()
        conn.close()

        def calc_perc(atual, anterior):
            atual_f = float(atual) if atual else 0.0
            anterior_f = float(anterior) if anterior else 0.0
            if anterior_f == 0.0:
                return 100.0 if atual_f > 0 else 0.0
            return ((atual_f - anterior_f) / anterior_f) * 100.0

        return {
            "total_transacoes_global": row.total_transacoes_global or 0,
            "total_fraudes_global": row.total_fraudes_global or 0,
            "total_movimentado_global": row.total_movimentado_global or 0,

            "total_transacoes": row.transacoes_mes or 0,
            "total_fraudes": row.fraudes_mes or 0,
            "total_movimentado": row.valor_mes or 0,

            "comparacao_transacoes": calc_perc(row.transacoes_mes, row.transacoes_mes_ant),
            "comparacao_anomalias": calc_perc(row.fraudes_mes, row.fraudes_mes_ant),
            "comparacao_valor": calc_perc(row.valor_mes, row.valor_mes_ant)
        }

    def query_transacoes(
        self,
        categoria=None,
        cidade=None,
        valor_min=None,
        valor_max=None,
        tipo_transacao=None,
        dispositivo=None,
        data_inicio=None,
        data_fim=None,
        conta=None,
        is_fraude=None,
        search=None,
        skip=0,
        limit=50
    ):

        conn = get_connection()
        cursor = conn.cursor()

        query = "SELECT * FROM transacoes WHERE 1=1"
        count_query = "SELECT COUNT(*) FROM transacoes WHERE 1=1"
        params = []

        if categoria:
            query += " AND categoria = ?"
            count_query += " AND categoria = ?"
            params.append(categoria)

        if cidade:
            query += " AND cidade = ?"
            count_query += " AND cidade = ?"
            params.append(cidade)

        if valor_min is not None:
            query += " AND valor >= ?"
            count_query += " AND valor >= ?"
            params.append(valor_min)

        if valor_max is not None:
            query += " AND valor <= ?"
            count_query += " AND valor <= ?"
            params.append(valor_max)

        if tipo_transacao:
            query += " AND tipo_transacao = ?"
            count_query += " AND tipo_transacao = ?"
            params.append(tipo_transacao)

        if dispositivo:
            query += " AND dispositivo = ?"
            count_query += " AND dispositivo = ?"
            params.append(dispositivo)

        if data_inicio:
            query += " AND data >= ?"
            count_query += " AND data >= ?"
            params.append(data_inicio)

        if data_fim:
            query += " AND data <= ?"
            count_query += " AND data <= ?"
            params.append(data_fim)

        if conta:
            query += " AND conta = ?"
            count_query += " AND conta = ?"
            params.append(conta)
            
        if is_fraude is not None:
            query += " AND is_fraude = ?"
            count_query += " AND is_fraude = ?"
            params.append(1 if is_fraude else 0)
            
        if search:
            query += " AND (conta LIKE ? OR cidade LIKE ? OR estabelecimento LIKE ?)"
            count_query += " AND (conta LIKE ? OR cidade LIKE ? OR estabelecimento LIKE ?)"
            params.extend([f"%{search}%", f"%{search}%", f"%{search}%"])

        # Primeiro, obtemos o total de itens para o frontend (paginação)
        cursor.execute(count_query, params)
        total_items = cursor.fetchone()[0]

        # Segundo, aplicamos a paginação
        query += " ORDER BY data DESC, hora DESC OFFSET ? ROWS FETCH NEXT ? ROWS ONLY"
        params.extend([skip, limit])

        cursor.execute(query, params)

        colunas = [col[0] for col in cursor.description]

        dados = [
            dict(zip(colunas, row))
            for row in cursor.fetchall()
        ]

        conn.close()

        return {
            "total": total_items,
            "dados": dados
        }

    def buscar_valores_por_conta(self, conta: str):

        conn = get_connection()

        query = """
            SELECT
                valor,
                data,
                hora
            FROM transacoes
            WHERE conta = ?
            ORDER BY data, hora
        """

        df = pd.read_sql(
            query,
            conn,
            params=[conta]
        )

        conn.close()

        return df

    def buscar_localizacao_por_conta(self, conta: str):

        conn = get_connection()

        query = """
            SELECT
                latitude,
                longitude
            FROM transacoes
            WHERE conta = ?
        """

        df = pd.read_sql(
            query,
            conn,
            params=[conta]
        )

        conn.close()

        return df

    def buscar_ips_por_conta(self, conta: str):

        conn = get_connection()

        query = """
            SELECT
                ip_origem
            FROM transacoes
            WHERE conta = ?
        """

        df = pd.read_sql(
            query,
            conn,
            params=[conta]
        )

        conn.close()

        return df

    def buscar_velocidade_geografica(self, conta: str):

        conn = get_connection()

        query = """
            SELECT
                data,
                hora,
                latitude,
                longitude
            FROM transacoes
            WHERE conta = ?
            ORDER BY data, hora
        """

        df = pd.read_sql(
            query,
            conn,
            params=[conta]
        )

        conn.close()

        return df

    def buscar_cidades_mais_anomalas(self):

        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT TOP 10
                cidade,
                COUNT(*) as total
            FROM transacoes
            WHERE is_fraude = 1
            GROUP BY cidade
            ORDER BY total DESC
        """)

        dados = cursor.fetchall()

        conn.close()

        return dados

    def buscar_numero_de_fraudes(self):

        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT
                is_fraude,
                COUNT(*)
            FROM transacoes
            GROUP BY is_fraude
        """)

        dados = dict(cursor.fetchall())

        conn.close()

        return dados

    def buscar_fraudes_por_tipo(self):

        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT TOP 10
                tipo_transacao,
                COUNT(*) as total
            FROM transacoes
            WHERE is_fraude = 1
            GROUP BY tipo_transacao
            ORDER BY total DESC
        """)

        dados = cursor.fetchall()

        conn.close()

        return dados

    def buscar_horario_fraudes(self):

        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT
                DATEPART(HOUR, hora) as hora,
                COUNT(*) as total
            FROM transacoes
            WHERE is_fraude = 1
            GROUP BY DATEPART(HOUR, hora)
            ORDER BY hora ASC
        """)

        dados = cursor.fetchall()

        conn.close()

        return dados

    def buscar_numero_de_tentativas(self):

        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT
                tentativas,
                COUNT(*) as total
            FROM transacoes
            WHERE is_fraude = 1
            AND tentativas >= 2
            GROUP BY tentativas
            ORDER BY tentativas ASC
        """)

        dados = cursor.fetchall()

        conn.close()

        return dados

    def buscar_volume_dias(self):
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT TOP 30
                CAST(data AS VARCHAR) as data,
                COUNT(*) as total
            FROM transacoes
            GROUP BY CAST(data AS VARCHAR)
            ORDER BY data DESC
        """)
        dados = cursor.fetchall()
        conn.close()
        
        # Reverte para ficar em ordem cronológica (do mais antigo pro mais recente)
        dados.reverse()
        return [{"name": row[0], "value": row[1]} for row in dados]

    def buscar_distribuicao_valores(self):
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT 
                CASE 
                    WHEN valor <= 50 THEN 'Até 50'
                    WHEN valor <= 200 THEN '51 a 200'
                    WHEN valor <= 1000 THEN '201 a 1000'
                    ELSE 'Acima de 1000'
                END as faixa,
                COUNT(*) as total
            FROM transacoes
            GROUP BY 
                CASE 
                    WHEN valor <= 50 THEN 'Até 50'
                    WHEN valor <= 200 THEN '51 a 200'
                    WHEN valor <= 1000 THEN '201 a 1000'
                    ELSE 'Acima de 1000'
                END
        """)
        dados = cursor.fetchall()
        conn.close()
        return [{"name": row[0], "value": row[1]} for row in dados]

    def buscar_transacoes_hora_global(self):
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT 
                DATEPART(HOUR, hora) as hora,
                COUNT(*) as total
            FROM transacoes
            GROUP BY DATEPART(HOUR, hora)
            ORDER BY hora ASC
        """)
        dados = cursor.fetchall()
        conn.close()
        return [{"name": f"{row[0]:02d}:00", "value": row[1]} for row in dados]

    def buscar_top_usuarios_anomalias(self):
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT TOP 5
                conta,
                SUM(CASE WHEN is_fraude = 1 THEN 1 ELSE 0 END) as total_anomalias
            FROM transacoes
            GROUP BY conta
            ORDER BY total_anomalias DESC
        """)
        dados = cursor.fetchall()
        conn.close()
        return [{"name": row[0], "value": row[1]} for row in dados]