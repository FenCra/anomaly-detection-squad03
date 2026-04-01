from fastapi import APIRouter, Depends

anomalies_router = APIRouter(prefix="/anomalies", tags=["anomalies"])

@anomalies_router.get("/")
async def detectar_suspeitos():
    pass