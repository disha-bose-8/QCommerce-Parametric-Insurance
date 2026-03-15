from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.premium_api import router as premium_router
from app.api.triggers_api import router as triggers_router

app = FastAPI()

# allow requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(premium_router, prefix="/api/premium")
app.include_router(triggers_router, prefix="/api/triggers")

#testing
@app.get("/")

def root():
    return {"status": "ok", "service": "ShieldPay API","env": settings.ENVIRONMENT}