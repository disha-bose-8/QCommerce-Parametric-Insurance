from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from pydantic import BaseModel
from app.core.database import get_db
from app.models.models import Payout

router = APIRouter()

class PayoutCreate(BaseModel):
    worker_id: int
    amount: float
    trigger_type: str
    audit_msg: str = "Manual Admin Trigger"

# 1. GET ALL PAYOUTS (Admin Dashboard)
@router.get("/")
def get_all_payouts(db: Session = Depends(get_db)):
    return db.query(Payout).order_by(Payout.created_at.desc()).all()

# 2. GET WORKER HISTORY (Worker Dashboard)
@router.get("/worker/{worker_id}")
def get_worker_payouts(worker_id: int, db: Session = Depends(get_db)):
    return db.query(Payout).filter(Payout.worker_id == worker_id).order_by(Payout.created_at.desc()).all()

# 3. CREATE PAYOUT (JSON body)
@router.post("/create")
def create_payout(payload: PayoutCreate, db: Session = Depends(get_db)):
    try:
        new_payout = Payout(
            worker_id=payload.worker_id,
            amount=payload.amount,
            trigger_type=payload.trigger_type,
            audit_trail=payload.audit_msg,
            status="settled",
            created_at=datetime.utcnow()
        )
        db.add(new_payout)
        db.commit()
        db.refresh(new_payout)
        return new_payout
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database Error: {str(e)}")