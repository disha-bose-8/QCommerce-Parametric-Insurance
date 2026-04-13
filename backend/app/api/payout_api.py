from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from pydantic import BaseModel
from app.core.database import get_db
from app.models.models import Payout, Worker

router = APIRouter()


class PayoutCreate(BaseModel):
    worker_id:    int
    amount:       float
    trigger_type: str
    audit_msg:    str = "Manual Admin Trigger"


# 1. GET ALL PAYOUTS
@router.get("/")
def get_all_payouts(db: Session = Depends(get_db)):
    return db.query(Payout).order_by(Payout.created_at.desc()).all()


# 2. GET WORKER HISTORY
@router.get("/worker/{worker_id}")
def get_worker_payouts(worker_id: int, db: Session = Depends(get_db)):
    return (
        db.query(Payout)
        .filter(Payout.worker_id == worker_id)
        .order_by(Payout.created_at.desc())
        .all()
    )


# 3. CREATE PAYOUT
@router.post("/create")
def create_payout(payload: PayoutCreate, db: Session = Depends(get_db)):
    # Cooldown: one payout per worker per trigger type per day
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    existing = (
        db.query(Payout)
        .filter(
            Payout.worker_id    == payload.worker_id,
            Payout.trigger_type == payload.trigger_type,
            Payout.created_at   >= today_start,
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=409,
            detail=f"Worker {payload.worker_id} already received a {payload.trigger_type} payout today",
        )

    try:
        new_payout = Payout(
            worker_id    = payload.worker_id,
            amount       = payload.amount,
            trigger_type = payload.trigger_type,
            audit_trail  = payload.audit_msg,
            status       = "settled",
            created_at   = datetime.utcnow(),
        )
        db.add(new_payout)

        # ── Increment claim history on worker record ──────────────────────────
        # This feeds into dynamic pricing — high-claim workers pay more premium
        worker = db.query(Worker).filter(Worker.id == payload.worker_id).first()
        if worker:
            worker.claim_count           = (worker.claim_count           or 0) + 1
            worker.total_payout_received = (worker.total_payout_received or 0.0) + payload.amount

        db.commit()
        db.refresh(new_payout)
        return new_payout

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database Error: {str(e)}")