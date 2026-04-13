from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.core.database import get_db
from app.models.models import Worker
from app.services.premium_service import calculate_premium

router = APIRouter()

PREMIUM_RATE = 0.08  # fallback flat rate if dynamic pricing fails


class RegisterRequest(BaseModel):
    name:     str
    phone:    str
    zone:     str
    income:   float
    platform: str
    password: str


class LoginRequest(BaseModel):
    name:     str
    password: str


@router.post("/register")
def register_worker(request: RegisterRequest, db: Session = Depends(get_db)):
    # ── Dynamic pricing via AI risk model ────────────────────────────────────
    try:
        pricing = calculate_premium({
            "weekly_income":  request.income,
            "zone":           request.zone,
            "rain_intensity": 0.0,   # no live sensor at registration time — use defaults
            "traffic":        0.3,
            "aqi":            100,
            "uv_index":       5,
        })
        # worker_pays is the worker's share of the weekly premium
        premium_weekly = float(round(pricing.get("worker_pays", request.income * PREMIUM_RATE), 2))
    except Exception as e:
        print(f"⚠️ Dynamic pricing failed at registration, using flat rate: {e}")
        premium_weekly = float(round(request.income * PREMIUM_RATE, 2))

    # Seed wallet with 4 weeks of premiums so they can afford initial deductions
    initial_wallet = float(round(premium_weekly * 4, 2))

    new_worker = Worker(
    name           = request.name,
    phone          = request.phone,
    zone           = request.zone,
    weekly_income  = request.income,
    platform       = request.platform,
    password       = request.password,
    premium_weekly = float(premium_weekly),   # cast numpy → Python float
    wallet_balance = float(initial_wallet),   # cast numpy → Python float
    claim_count    = 0,
    total_payout_received = 0.0,
)
    db.add(new_worker)
    db.commit()
    db.refresh(new_worker)
    return {
        "message":        "User registered successfully",
        "worker_id":      new_worker.id,
        "premium_weekly": premium_weekly,
        "wallet_balance": new_worker.wallet_balance,
    }


@router.post("/login")
def login_worker(request: LoginRequest, db: Session = Depends(get_db)):
    worker = db.query(Worker).filter(Worker.name == request.name).first()
    if not worker:
        return {"error": "User not found"}
    if worker.password != request.password:
        return {"error": "Incorrect password"}
    return {
        "message":        "Login successful",
        "worker_id":      worker.id,
        "name":           worker.name,
        "zone":           worker.zone,
        "platform":       worker.platform,
        "weekly_income":  worker.weekly_income,
        "premium_weekly": worker.premium_weekly or round((worker.weekly_income or 0) * PREMIUM_RATE, 2),
        "wallet_balance": worker.wallet_balance or 0.0,
    }


@router.get("/all")
def get_all_workers(db: Session = Depends(get_db)):
    workers = db.query(Worker).all()
    return [
        {
            "id":             w.id,
            "name":           w.name,
            "zone":           w.zone,
            "platform":       w.platform,
            "weekly_income":  w.weekly_income,
            "premium_weekly": w.premium_weekly or round((w.weekly_income or 0) * PREMIUM_RATE, 2),
            "wallet_balance": w.wallet_balance or 0.0,
        }
        for w in workers
    ]


@router.get("/{worker_id}")
def get_worker(worker_id: int, db: Session = Depends(get_db)):
    worker = db.query(Worker).filter(Worker.id == worker_id).first()
    if not worker:
        return {"error": "Worker not found"}
    return {
        "id":             worker.id,
        "name":           worker.name,
        "zone":           worker.zone,
        "platform":       worker.platform,
        "weekly_income":  worker.weekly_income,
        "phone":          worker.phone,
        "premium_weekly": worker.premium_weekly or round((worker.weekly_income or 0) * PREMIUM_RATE, 2),
        "wallet_balance": worker.wallet_balance or 0.0,
        "claim_count":            worker.claim_count or 0,           
        "total_payout_received":  worker.total_payout_received or 0.0, 
    }


# ── COLLECT WEEKLY PREMIUM (admin calls this) ─────────────────────────────────
@router.post("/collect-premiums")
def collect_weekly_premiums(db: Session = Depends(get_db)):
    workers   = db.query(Worker).all()
    collected = []
    skipped   = []

    for w in workers:
        # ── Re-calculate premium dynamically using AI risk model ────────────
        # This means the premium collected this week reflects the worker's
        # actual risk profile (zone, income tier) rather than a frozen flat 8%.
        try:
            pricing = calculate_premium({
                "weekly_income":  w.weekly_income or 0,
                "zone":           w.zone or "Bengaluru",
                "rain_intensity": 0.0,
                "traffic":        0.3,
                "aqi":            100,
                "uv_index":       5,
                # Pass claim history so risk model can penalise high-claim workers
                "claim_count":          getattr(w, "claim_count", 0),
                "total_payout_history": getattr(w, "total_payout_received", 0.0),
            })
            premium = float(round(pricing.get("worker_pays", (w.weekly_income or 0) * PREMIUM_RATE), 2))
        except Exception as e:
            print(f"⚠️ Dynamic pricing failed for worker {w.id}, using stored rate: {e}")
            premium = float(round((w.weekly_income or 0) * PREMIUM_RATE, 2))

        # Update stored premium_weekly to keep DB in sync with dynamic price
        w.premium_weekly = premium

        if (w.wallet_balance or 0) >= premium:
            w.wallet_balance = round(w.wallet_balance - premium, 2)
            collected.append({
                "worker_id":       w.id,
                "name":            w.name,
                "premium_deducted": premium,
            })
        else:
            skipped.append({
                "worker_id": w.id,
                "name":      w.name,
                "reason":    "insufficient balance",
            })

    db.commit()
    return {
        "collected":         len(collected),
        "skipped":           len(skipped),
        "details":           collected,
        "skipped_details":   skipped,
        "total_collected":   sum(c["premium_deducted"] for c in collected),
    }