from Repository.perfil_repository import (
    PerfilRepository
)

from Regras.perfil_regras import (
    PerfilRegras
)


class PerfilService:

    def __init__(self):

        self.repository = (
            PerfilRepository()
        )

        self.perfil_regras = (
            PerfilRegras()
        )

    def perfil_comportamental(
        self,
        conta: str
    ):

        df = (

            self.repository
            .buscar_historico_conta(
                conta
            )
        )

        return (

            self.perfil_regras
            .gerar_perfil(
                df,
                conta
            )
        )