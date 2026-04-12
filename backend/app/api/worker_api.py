from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.core.database import get_db
from app.models.models import Worker

router = APIRouter()

PREMIUM_RATE = 0.08  # 8% of weekly income

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
    premium_weekly = round(request.income * PREMIUM_RATE, 2)
    # Seed wallet with 4 weeks of premiums so they can afford payouts
    initial_wallet = round(premium_weekly * 4, 2)

    new_worker = Worker(
        name           = request.name,
        phone          = request.phone,
        zone           = request.zone,
        weekly_income  = request.income,
        platform       = request.platform,
        password       = request.password,
        premium_weekly = premium_weekly,
        wallet_balance = initial_wallet,
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
    }

# ── COLLECT WEEKLY PREMIUM (admin calls this) ─────────────────────────────
@router.post("/collect-premiums")
def collect_weekly_premiums(db: Session = Depends(get_db)):
    workers = db.query(Worker).all()
    collected = []
    skipped   = []

    for w in workers:
        premium = w.premium_weekly or round((w.weekly_income or 0) * PREMIUM_RATE, 2)
        if (w.wallet_balance or 0) >= premium:
            w.wallet_balance = round(w.wallet_balance - premium, 2)
            collected.append({"worker_id": w.id, "name": w.name, "premium_deducted": premium})
        else:
            skipped.append({"worker_id": w.id, "name": w.name, "reason": "insufficient balance"})

    db.commit()
    return {
        "collected": len(collected),
        "skipped":   len(skipped),
        "details":   collected,
        "skipped_details": skipped,
        "total_collected": sum(c["premium_deducted"] for c in collected),
    }