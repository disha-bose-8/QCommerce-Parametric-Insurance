from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date

from app.core.database import get_db
from app.models.models import Payout

router = APIRouter()

@router.get("/")
def get_all_payouts(db: Session = Depends(get_db)):
    return db.query(Payout).all()

@router.post("/create")
def create_payout(worker_id: int, amount: float, trigger_type: str, db: Session = Depends(get_db)):
    from datetime import date

    payout = Payout(
        worker_id=worker_id,
        date=date.today(),
        amount=amount,
        trigger_type=trigger_type
    )

    db.add(payout)
    db.commit()
    db.refresh(payout)

    return payout