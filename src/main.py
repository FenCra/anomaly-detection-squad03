from routes.transactions_routes import transactions_router
from routes.anomalies_routes import anomalies_router 
from fastapi import FastAPI
from db.create import criar_base

criar_base()

app = FastAPI()

app.include_router(transactions_router)
app.include_router(anomalies_router)
