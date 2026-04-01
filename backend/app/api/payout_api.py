from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.core.database import get_db
from app.models.models import Payout

router = APIRouter()

# 1. GET ALL PAYOUTS (Admin Dashboard)
@router.get("/")
def get_all_payouts(db: Session = Depends(get_db)):
    # Using .all() here is fine for the demo
    return db.query(Payout).order_by(Payout.created_at.desc()).all()

# 2. GET WORKER HISTORY (Worker Dashboard)
@router.get("/worker/{worker_id}")
def get_worker_payouts(worker_id: int, db: Session = Depends(get_db)):
    return db.query(Payout).filter(Payout.worker_id == worker_id).order_by(Payout.created_at.desc()).all()

# 3. MANUAL OVERRIDE (The Demo Trigger)
@router.post("/create")
def create_payout(
    worker_id: int, 
    amount: float, 
    trigger_type: str, 
    audit_msg: str = "Manual Admin Trigger", 
    db: Session = Depends(get_db)
):
    try:
        new_payout = Payout(
            worker_id=worker_id,
            amount=amount,
            trigger_type=trigger_type,
            audit_trail=audit_msg, # This matches Step 1 & 2's 'audit_trail'
            status="settled",      # This matches Step 1 & 2's 'status'
            created_at=datetime.utcnow() # Always use utcnow for DB consistency
        )

        db.add(new_payout)
        db.commit()
        db.refresh(new_payout)
        return new_payout
    except Exception as e:
        db.rollback()
        # This will now tell you EXACTLY what is wrong if it fails again
        raise HTTPException(status_code=500, detail=f"Database Error: {str(e)}")