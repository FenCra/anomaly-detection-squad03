import pandas as pd
import io
import base64
import json
import os
import time
from dotenv import load_dotenv
load_dotenv()
import traceback
from fastapi import HTTPException
from google import genai
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns

from Core.conexao import get_connection

plt.rcParams['font.family'] = 'sans-serif'
plt.rcParams['font.sans-serif'] = ['Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif']
plt.rcParams['font.size'] = 11        
plt.rcParams['axes.titlesize'] = 14    
plt.rcParams['axes.labelsize'] = 12

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    raise RuntimeError("GOOGLE_API_KEY não encontrada. Defina-a no arquivo .env")
client = genai.Client(api_key=GOOGLE_API_KEY)


class RelatorioService:

    # ==========================================
    # ORQUESTRADOR PRINCIPAL (Chamado pela Rota)
    # ==========================================
    def relatorio_gerado(self):
        """
        Orquestra o fluxo completo: Busca no banco -> Processa JSON -> Chama IA.
        Assim, a rota (controller) fica 100% limpa.
        """
        try:
            df_transacoes = self.extrair_dados_banco()
            
            if df_transacoes.empty:
                raise HTTPException(status_code=404, detail="Nenhum dado encontrado no banco de dados.")
            
            dados_json = self.processar_dados_json(df_transacoes)
            relatorio_markdown = self.gerar_relatorio_com_ia(dados_json)
            
            return {"relatorio": relatorio_markdown}

        except HTTPException as he:
            raise he 
        except Exception as e:
            print("🚨 ERRO INTERNO NA GERAÇÃO DO RELATÓRIO:")
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")

    # ==========================================
    # MÉTODOS DE SUPORTE
    # ==========================================
    def extrair_dados_banco(self, query=None):
        if query is None:
            query = """
                SELECT id, data, dia_semana, is_fraude, valor, categoria, 
                       hora, conta, dispositivo, tentativas, cidade, estado 
                FROM transacoes
            """
        
        print("Conectando ao SQL Server para extração de dados...")
        try:
            conn = get_connection()
            df = pd.read_sql_query(query, conn)
            return df
        except Exception as e:
            print(f"Erro ao extrair dados do banco de dados: {e}")
            raise e
        finally:
            if 'conn' in locals():
                conn.close()

    def processar_dados_json(self, df):
        print("Processando métricas e estruturando JSON para a IA...")
        
        if df.empty:
            print("Atenção: O DataFrame fornecido está vazio.")
            return json.dumps({}, ensure_ascii=False)
            
        df_fraudes = df[df['is_fraude'] == 1]
        
        total_transacoes = len(df)
        total_fraudes = len(df_fraudes)
        percentual = round((total_fraudes / total_transacoes) * 100, 2) if total_transacoes > 0 else 0
        valor_total_fraudes = df_fraudes['valor'].sum()
        
        top_categorias = df_fraudes['categoria'].value_counts().head(3).index.tolist()
        
        df_fraudes = df_fraudes.copy()
        df_fraudes['hora_int'] = df_fraudes['hora'].apply(lambda h: h.hour)
        faixas = pd.cut(df_fraudes['hora_int'], bins=[0, 6, 12, 18, 24], labels=['00h-06h', '06h-12h', '12h-18h', '18h-24h'], right=False)
        
        faixa_critica = faixas.value_counts().idxmax() if not faixas.empty else "N/A"
        pct_faixa = round((faixas.value_counts().max() / total_fraudes) * 100, 1) if total_fraudes > 0 else 0
        
        contas_agrupadas = df_fraudes.groupby('conta').agg(
            total_fraude=('valor', 'sum'),
            qtd_fraudes=('id', 'count'),
            media_fraude=('valor', 'mean')
        ).sort_values(by='total_fraude', ascending=False).head(2).reset_index()
        
        lista_contas = []
        for _, row in contas_agrupadas.iterrows():
            conta_real = str(row['conta'])
            lista_contas.append({
                "conta_mascarada": f"***{conta_real[-4:]}",
                "valor_total_exposto": float(row['total_fraude']),
                "quantidade_operacoes": int(row['qtd_fraudes'])
            })
        
        if not df_fraudes.empty:
            pior_transacao = df_fraudes.loc[df_fraudes['valor'].idxmax()]
            exemplo_xai = {
                "id_transacao": int(pior_transacao['id']),
                "valor": float(pior_transacao['valor']),
                "categoria": str(pior_transacao['categoria']),
                "dispositivo": str(pior_transacao['dispositivo']),
                "tentativas": int(pior_transacao['tentativas']),
                "cidade_estado": f"{pior_transacao['cidade']} - {pior_transacao['estado']}"
            }
        else:
            exemplo_xai = {}

        dados_consolidados = {
            "periodo": f"{df['data'].min()} a {df['data'].max()}",
            "total_transacoes": int(total_transacoes),
            "total_anomalias": int(total_fraudes),
            "percentual_anomalias": float(percentual),
            "volume_financeiro_em_risco": float(valor_total_fraudes),
            "categorias_mais_atacadas": top_categorias,
            "horario_critico": f"{faixa_critica} ({pct_faixa}% dos casos)",
            "contas_criticas": lista_contas,
            "exemplo_xai_transacao": exemplo_xai
        }
        
        return json.dumps(dados_consolidados, ensure_ascii=False, indent=2)

    def gerar_relatorio_com_ia(self, dados_json):
        print("Enviando resumo estruturado para a Inteligência Artificial...\n")
        
        prompt = f"""
        Você é um sistema especialista em análise financeira e detecção de fraudes.
        Sua função é gerar as seções analíticas de um relatório técnico com base estritamente nos dados extraídos abaixo.

        DADOS EXTRAÍDOS DO SISTEMA:
        {dados_json}

        INSTRUÇÕES DE FORMATAÇÃO:
        Retorne a resposta formatada em Markdown, utilizando EXATAMENTE os 5 tópicos abaixo. Não crie tabelas. Não invente dados.

        ### 1. Resumo Executivo
        Escreva um parágrafo objetivo contendo o volume de transações, o período analisado, o total e o percentual de anomalias detectadas. Mencione o volume financeiro total em risco e liste as categorias comerciais mais atacadas.

        ### 2. Análise Inteligente
        Destaque a faixa de horário crítica identificada nos dados e explique como essa concentração afeta a segurança das operações.

        ### 3. Explicação do Ranking de Risco
        Cite as contas bancárias (IDs) mais críticas listadas nos dados. Como não usamos um score numérico, explique a severidade focando no volume financeiro exposto e na quantidade de operações fraudulentas que essas contas sofreram.

        ### 4. Explicação da Anomalia (XAI) 
        Utilize os dados da transação de exemplo (XAI) para demonstrar as anomalias. Cite o ID, o valor transacionado e evidencie os vetores de risco (como o dispositivo usado, categoria, e o número de tentativas) para justificar a classificação de fraude.

        ### 5. Recomendações Automáticas 
        Gere 3 recomendações de segurança táticas e acionáveis, baseadas nas categorias e nos horários apontados nos dados.
        """
        
        try:
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt
            )
            return response.text
        except Exception as e:
            if "429" in str(e):
                print("Limite da API atingido. Aguardando 10 segundos para tentar novamente...")
                time.sleep(10)
                response = client.models.generate_content(
                    model='gemini-2.5-flash',
                    contents=prompt
                )
                return response.text
            else:
                raise e

    def fig_to_base64(self, fig):
        fig.tight_layout() 
        img_buffer = io.BytesIO()
        fig.savefig(img_buffer, format='png', bbox_inches='tight', dpi=120) 
        img_buffer.seek(0)
        base64_img = base64.b64encode(img_buffer.read()).decode('utf-8')
        plt.close(fig)
        return base64_img

    def gerar_graficos_dashboard(self, df):
        if df.empty:
            print("Atenção: O DataFrame fornecido está vazio. Não foi possível gerar gráficos.")
            return {}

        df_fraudes = df[df['is_fraude'] == 1]
        graficos_b64 = {}
        sns.set_theme(style="whitegrid")

        # Gráfico 1
        fig1, ax1 = plt.subplots(figsize=(6, 4))
        contagem = df['is_fraude'].value_counts().rename(index={0: 'Normal', 1: 'Fraude'})
        sns.barplot(x=contagem.index, y=contagem.values, hue=contagem.index, palette=['#2ecc71', '#e74c3c'], legend=False, ax=ax1)
        ax1.set_title('Total de Transações: Normais x Fraudes')
        ax1.set_ylabel('Quantidade')
        graficos_b64['grafico_proporcao'] = self.fig_to_base64(fig1)

        # Gráfico 2
        fig2, ax2 = plt.subplots(figsize=(8, 4))
        evolucao = df_fraudes.groupby('data').size().reset_index(name='qtd_fraudes')
        sns.lineplot(data=evolucao, x='data', y='qtd_fraudes', marker='o', color='#e74c3c', ax=ax2)
        ax2.set_title('Evolução Diária de Fraudes')
        ax2.set_xlabel('Data')
        ax2.set_ylabel('Número de Fraudes')
        plt.xticks(rotation=45)
        graficos_b64['grafico_evolucao'] = self.fig_to_base64(fig2)

        # Gráfico 3
        fig3, ax3 = plt.subplots(figsize=(8, 4))
        sns.histplot(df_fraudes['valor'], bins=20, kde=True, color='#e67e22', ax=ax3)
        ax3.set_title('Distribuição de Valores das Fraudes')
        ax3.set_xlabel('Valor da Transação (R$)')
        ax3.set_ylabel('Frequência')
        graficos_b64['grafico_distribuicao'] = self.fig_to_base64(fig3)

        # Gráfico 4
        fig4, ax4 = plt.subplots(figsize=(8, 4))
        df_fraudes = df_fraudes.copy() 
        df_fraudes['hora_int'] = df_fraudes['hora'].apply(lambda h: h.hour)
        faixas = ['00h-06h', '06h-12h', '12h-18h', '18h-24h']
        df_fraudes['faixa_hora'] = pd.cut(df_fraudes['hora_int'], bins=[0, 6, 12, 18, 24], labels=faixas, right=False)
        contagem_hora = df_fraudes['faixa_hora'].value_counts().reindex(faixas)
        sns.barplot(x=contagem_hora.index, y=contagem_hora.values, hue=contagem_hora.index, palette='magma', legend=False, ax=ax4)
        ax4.set_title('Fraudes por Faixa de Horário')
        ax4.set_ylabel('Quantidade')
        graficos_b64['grafico_horarios'] = self.fig_to_base64(fig4)

        # Gráfico 5
        fig5, ax5 = plt.subplots(figsize=(8, 5))
        dias_pt = {'Monday': 'Seg', 'Tuesday': 'Ter', 'Wednesday': 'Qua', 'Thursday': 'Qui', 'Friday': 'Sex', 'Saturday': 'Sáb', 'Sunday': 'Dom'}
        df_fraudes['dia_pt'] = df_fraudes['dia_semana'].map(dias_pt)
        ordem_dias = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
        heatmap_data = pd.crosstab(df_fraudes['dia_pt'], df_fraudes['faixa_hora'])
        heatmap_data = heatmap_data.reindex(ordem_dias).fillna(0) 
        sns.heatmap(heatmap_data, cmap='YlOrRd', annot=True, fmt='g', ax=ax5)
        ax5.set_title('Heatmap de Atividade Suspeita')
        ax5.set_ylabel('Dia da Semana')
        ax5.set_xlabel('Faixa de Horário')
        graficos_b64['grafico_heatmap'] = self.fig_to_base64(fig5)

        return graficos_b64