from Core.conexao import (
    get_connection
)

import pandas as pd


class PerfilRepository:

    def buscar_historico_conta(
        self,
        conta: str
    ):

        conn = get_connection()

        query = """

            SELECT *

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