from fastapi import APIRouter

router = APIRouter()

@router.post("/premium/calculate")
def get_premium(
    weekly_income: float,
    zone: str,
    month: str,
    past_disruptions: int
):
    from app.services.premium_service import calculate_premium

    data = {
        "weekly_income": weekly_income,
        "zone": zone,
        "month": month,
        "past_disruptions": past_disruptions
    }

    return calculate_premium(data)