from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date
from app.core.database import get_db
from app.models.models import Policy, Worker

router = APIRouter()


@router.post("/create-policy")
def create_policy(worker_id: int, db: Session = Depends(get_db)):

    # get worker
    worker = db.query(Worker).filter(Worker.id == worker_id).first()

    if not worker:
        return {"error": "Worker not found"}

    # calculate premium (5%)
    premium = worker.weekly_income * 0.05

    # create policy
    new_policy = Policy(
        worker_id=worker_id,
        week_start=date.today(),
        premium=premium,
        status="active"
    )

    db.add(new_policy)
    db.commit()

    return {
        "message": "Policy created",
        "premium": premium
    }