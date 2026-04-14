# policy_api.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date, timedelta
from app.core.database import get_db
from app.models.models import Policy, Worker

router = APIRouter()


@router.post("/create-policy")
def create_policy(worker_id: int, db: Session = Depends(get_db)):
    worker = db.query(Worker).filter(Worker.id == worker_id).first()
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")

    # Prevent duplicate active policy for the same week
    week_start = date.today()
    existing = db.query(Policy).filter(
        Policy.worker_id == worker_id,
        Policy.week_start == week_start,
        Policy.status == "active",
    ).first()

    if existing:
        return {
            "message": "Policy already active for this week",
            "policy_id": existing.id,
            "worker_id": worker_id,
            "week_start": str(existing.week_start),
            "week_end": str(existing.week_start + timedelta(days=6)),
            "premium": existing.premium,
            "status": existing.status,
        }

    premium = round(worker.weekly_income * 0.05, 2)

    new_policy = Policy(
        worker_id=worker_id,
        week_start=week_start,
        premium=premium,
        status="active",
    )
    db.add(new_policy)
    db.commit()
    db.refresh(new_policy)

    return {
        "message": "Policy created successfully",
        "policy_id": new_policy.id,
        "worker_id": worker_id,
        "worker_name": worker.name,
        "zone": worker.zone,
        "platform": worker.platform,
        "week_start": str(week_start),
        "week_end": str(week_start + timedelta(days=6)),
        "premium": premium,
        "coverage": round(worker.weekly_income * 0.5, 2),   # max payout = 50% weekly income
        "status": "active",
    }


@router.get("/policy/{worker_id}")
def get_policy(worker_id: int, db: Session = Depends(get_db)):
    """Used by the onboarding screen to show the active policy after creation."""
    policy = db.query(Policy).filter(
        Policy.worker_id == worker_id,
        Policy.status == "active",
    ).order_by(Policy.id.desc()).first()

    if not policy:
        raise HTTPException(status_code=404, detail="No active policy found")

    worker = db.query(Worker).filter(Worker.id == worker_id).first()

    return {
        "policy_id": policy.id,
        "worker_id": worker_id,
        "worker_name": worker.name if worker else "Unknown",
        "week_start": str(policy.week_start),
        "week_end": str(policy.week_start + timedelta(days=6)),
        "premium": policy.premium,
        "coverage": round((worker.weekly_income if worker else 0) * 0.5, 2),
        "status": policy.status,
    }