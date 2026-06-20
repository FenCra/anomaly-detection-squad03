import matplotlib
matplotlib.use('Agg') # OBRIGATÓRIO: Impede crash ao abrir abas do Motor de ML

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from Controllers.anomalia_controller import router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Ou ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)