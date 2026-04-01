import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import engine
from app.models.models import Base
from app.services.oracle_service import check_all_sensors
from app.services.payout_service import settle_all_active_workers

# Import Routers
from app.api.worker_api import router as worker_router
from app.api.policy_api import router as policy_router
from app.api.payout_api import router as payout_router
from app.api.premium_api import router as premium_router
from app.api.triggers_api import router as triggers_router


# 1. ORACLE BACKGROUND TASK
async def oracle_polling_loop():
    while True:
        try:
            print("🚀 Oracle Hub: Polling all live sensors...")
            # This checks everything: Rain, AQI, Strikes, Heat
            active_triggers = await check_all_sensors(zone="Bengaluru")
            
            for trigger in active_triggers:
                # AUTOMATIC SETTLEMENT logic
                settle_all_active_workers(
                    zone="Bengaluru", 
                    trigger_type=trigger["type"], 
                    raw_value=trigger["val"]
                )
        except Exception as e:
            print(f"❌ Oracle Hub Error: {e}")
        
        # Check every 10 mins (600s) to stay within API rate limits
        await asyncio.sleep(600)

# 2. LIFESPAN MANAGER (Starts the loop on server startup)
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Start the background Oracle
    oracle_task = asyncio.create_task(oracle_polling_loop())
    yield
    # Shutdown: Clean up
    oracle_task.cancel()

# 3. APP INITIALIZATION
app = FastAPI(lifespan=lifespan)

# Create DB Tables (Supabase/Postgres)
Base.metadata.create_all(bind=engine)

# 4. MIDDLEWARE (Updated for flexibility)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "*"], # Added "*" for deployment ease
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 5. ROUTERS
app.include_router(worker_router, prefix="/api/worker")
app.include_router(policy_router, prefix="/api/policy")
app.include_router(payout_router, prefix="/api/payout")
app.include_router(premium_router, prefix="/api/premium")
app.include_router(triggers_router, prefix="/api/triggers")

@app.get("/")
def root():
    return {
        "status": "ok", 
        "service": "QShield API",
        "env": settings.ENVIRONMENT,
        "oracle_active": True
    }