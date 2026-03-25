from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.premium_api import router as premium_router
from app.api.triggers_api import router as triggers_router
from app.core.database import engine
from app.models.models import Base
from app.api.worker_api import router as worker_router
from app.api.policy_api import router as policy_router
from app.api.payout_api import router as payout_router

app = FastAPI()
app.include_router(worker_router, prefix="/api/worker")
app.include_router(policy_router, prefix="/api/policy")
app.include_router(payout_router, prefix="/api/payout")

#create table
Base.metadata.create_all(bind=engine)

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
    return {"status": "ok", "service": "QShield API","env": settings.ENVIRONMENT}