from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Premium
from ..services.premium_service import calculate_premium

router = APIRouter()

@router.post("/premium/calculate")
def get_premium(
    weekly_income: float,
    zone: str,
    month: str,
    past_disruptions: int,
    db: Session = Depends(get_db)
):
    data = {
        "weekly_income": weekly_income,
        "zone": zone,
        "month": month,
        "past_disruptions": past_disruptions
    }

    result = calculate_premium(data)

    # 🔥 SAVE TO DATABASE (JUST LIKE PAYOUT)
    premium = Premium(
        weekly_income=weekly_income,
        zone=zone,
        month=month,
        risk_factor=result["risk_factor"],
        total_premium=result["total_premium"],
        worker_pays=result["worker_pays"],
        platform_pays=result["platform_pays"]
    )

    db.add(premium)
    db.commit()
    db.refresh(premium)

    return premium