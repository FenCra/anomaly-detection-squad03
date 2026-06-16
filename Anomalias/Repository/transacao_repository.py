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

           colunas = [ col[0] for col in cursor.description]

           resultados = [ dict(zip(colunas, row)) for row in rows]

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

            cursor.execute("""
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
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
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
            ))

            conn.commit()

            return {
                "msg": "Transação inserida com sucesso"
            }

        except Exception as e:

            conn.rollback()

            return {
                "erro": str(e)
            }

        finally:
            conn.close()

    # =========================================================
    # UPDATE STATUS FRAUDE
    # =========================================================

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
                "mensagem":
                "Status de fraude atualizado com sucesso"
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
                "mensagem":
                "Transação deletada com sucesso"
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

        cidades = [
            row[0]
            for row in cursor.fetchall()
        ]

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
                COUNT(*) as total_transacoes,
                SUM(valor) as total_movimentado,
                SUM(
                    CASE
                        WHEN is_fraude = 1
                        THEN 1
                        ELSE 0
                    END
                ) as total_fraudes
            FROM transacoes
        """)

        row = cursor.fetchone()

        conn.close()

        return {
            "total_transacoes": row[0],
            "total_movimentado": float(row[1] or 0),
            "total_fraudes": row[2]
        }


    # =========================================================
    # AGREGAÇÕES GLOBAIS (DASHBOARD)
    # =========================================================

    def buscar_volume_dias(self):
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT
                dia_semana,
                COUNT(*) as total
            FROM transacoes
            GROUP BY dia_semana
        """)
        dados = [{"name": row[0], "value": row[1]} for row in cursor.fetchall()]
        conn.close()
        return dados

    def buscar_distribuicao_valores(self):
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT
                CASE 
                    WHEN valor <= 50 THEN 'Até R$50'
                    WHEN valor <= 200 THEN 'Até R$200'
                    WHEN valor <= 1000 THEN 'Até R$1.000'
                    WHEN valor <= 5000 THEN 'Até R$5.000'
                    ELSE 'Acima de R$5k'
                END as faixa,
                COUNT(*) as total
            FROM transacoes
            GROUP BY
                CASE 
                    WHEN valor <= 50 THEN 'Até R$50'
                    WHEN valor <= 200 THEN 'Até R$200'
                    WHEN valor <= 1000 THEN 'Até R$1.000'
                    WHEN valor <= 5000 THEN 'Até R$5.000'
                    ELSE 'Acima de R$5k'
                END
        """)
        dados = cursor.fetchall()
        
        # Ordenação manual para o frontend
        ordem = ['Até R$50', 'Até R$200', 'Até R$1.000', 'Até R$5.000', 'Acima de R$5k']
        dict_dados = {row[0]: row[1] for row in dados}
        resultado = [{"name": faixa, "value": dict_dados.get(faixa, 0)} for faixa in ordem]
        
        conn.close()
        return resultado

    def buscar_transacoes_hora_global(self):
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT
                DATEPART(HOUR, hora) as hora_int,
                COUNT(*) as total
            FROM transacoes
            GROUP BY DATEPART(HOUR, hora)
            ORDER BY hora_int ASC
        """)
        # Transforma 9 em '09:00'
        dados = []
        for row in cursor.fetchall():
            h_str = str(row[0]).zfill(2) + ":00"
            dados.append({"name": h_str, "value": row[1]})
            
        conn.close()
        return dados

    def buscar_top_usuarios_anomalias(self):
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT TOP 5 conta, COUNT(*) as total
            FROM transacoes
            WHERE is_fraude = 1
            GROUP BY conta
            ORDER BY total DESC
        """)
        dados = [{"name": row[0], "value": row[1]} for row in cursor.fetchall()]
        conn.close()
        return dados


    def query_transacoes(
        self,
        conta=None,
        categoria=None,
        cidade=None,
        valor_min=None,
        valor_max=None,
        tipo_transacao=None,
        dispositivo=None,
        data_inicio=None,
        data_fim=None,
        is_fraude=None,
        search=None,
        skip: int = 0,
        limit: int = 50
    ):

        conn = get_connection()
        cursor = conn.cursor()

        query = "SELECT * FROM transacoes WHERE 1=1"

        params = []

        if conta:
            query += " AND conta = ?"
            params.append(conta)

        if categoria:
            query += " AND categoria = ?"
            params.append(categoria)

        if cidade:
            query += " AND cidade = ?"
            params.append(cidade)

        if valor_min is not None:
            query += " AND valor >= ?"
            params.append(valor_min)

        if valor_max is not None:
            query += " AND valor <= ?"
            params.append(valor_max)

        if tipo_transacao:
            query += " AND tipo_transacao = ?"
            params.append(tipo_transacao)

        if dispositivo:
            query += " AND dispositivo = ?"
            params.append(dispositivo)

        if data_inicio:
            query += " AND data >= ?"
            params.append(data_inicio)

        if data_fim:
            query += " AND data <= ?"
            params.append(data_fim)

        if is_fraude is not None:
            query += " AND is_fraude = ?"
            params.append(1 if is_fraude else 0)

        if search:
            query += " AND (conta LIKE ? OR cidade LIKE ? OR estabelecimento LIKE ?)"
            like_val = f"%{search}%"
            params.extend([like_val, like_val, like_val])

        # Get total before pagination
        count_query = query.replace("SELECT *", "SELECT COUNT(*)")
        cursor.execute(count_query, params)
        total = cursor.fetchone()[0]

        # Add pagination
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
            "total": total,
            "dados": dados
        }
    


    def buscar_valores_por_conta(
            self,
            conta: str
        ):

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



    def buscar_localizacao_por_conta(
            self,
            conta: str
        ):

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



        # =====================================================
        # GEO IP
        # =====================================================

    def buscar_ips_por_conta(
            self,
            conta: str
        ):

            conn = get_connection()

            query = """
                SELECT ip_origem
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

        # =====================================================
        # GEO VELOCIDADE
        # =====================================================

    def buscar_velocidade_geografica(
            self,
            conta: str
        ):

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

        # =====================================================
        # ESTATÍSTICAS
        # =====================================================

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

            dados = dict(
                cursor.fetchall()
            )

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

















































































  