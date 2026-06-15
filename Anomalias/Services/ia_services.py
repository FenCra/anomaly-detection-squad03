import joblib
import pandas as pd
import shap


class IAService:

    def __init__(self):

        self.modelo = joblib.load(
            "modelo_fraude_treinado.pkl"
        )

        self.preprocessor = (
            self.modelo.named_steps[
                "preprocessor"
            ]
        )

        self.classificador = (
            self.modelo.named_steps[
                "classifier"
            ]
        )

        self.explainer = (
            shap.TreeExplainer(
                self.classificador
            )
        )

        features_num = (

            self.preprocessor
            .transformers_[0][2]

        )

        features_cat = (

            self.preprocessor
            .named_transformers_["cat"]
            .get_feature_names_out(

                self.preprocessor
                .transformers_[1][2]

            )

        )

        self.features = (

            list(features_num)

            +

            list(features_cat)

        )

    # ===================================================
    # PREVISÃO
    # ===================================================

    def analisar(
        self,
        transacao
    ):

        df = pd.DataFrame(

            [transacao.__dict__]

        )

        df["hora_int"] = (

            pd.to_datetime(

                df["hora"],
                format="%H:%M"

            )

            .dt.hour

        )

        df = df.drop(

            columns=[

                "id",
                "hora"

            ],

            errors="ignore"

        )

        previsao = (

            self.modelo
            .predict(df)[0]

        )

        probabilidade = (

            self.modelo
            .predict_proba(df)[0][1]

        )

        motivos = []

        if previsao == 1:

            linha = (

                self.preprocessor
                .transform(df)

            )

            shap_values = (

                self.explainer
                .shap_values(
                    linha
                )

            )

            if isinstance(
                shap_values,
                list
            ):

                valores = (
                    shap_values[1][0]
                )

            elif len(
                shap_values.shape
            ) == 3:

                valores = (
                    shap_values[
                        0,
                        :,
                        1
                    ]
                )

            else:

                valores = (
                    shap_values[0]
                )

            pesos = dict(

                zip(

                    self.features,

                    valores

                )

            )

            top = sorted(

                pesos.items(),

                key=lambda x: x[1],

                reverse=True

            )[:3]

            motivos = [

                item[0]

                for item in top

            ]

        return {

            "fraude":

                bool(
                    previsao
                ),

            "probabilidade":

                round(
                    probabilidade * 100,
                    2
                ),

            "motivos":

                motivos

        }