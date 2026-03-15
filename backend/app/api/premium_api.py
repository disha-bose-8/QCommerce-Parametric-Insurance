
from fastapi import APIRouter
from app.services.premium import calculate_premium, check_eligibility

router = APIRouter()

@router.get("/calculate")
def get_premium(weekly_income: float):

    result = calculate_premium(weekly_income)
    return result

@router.get("/eligibility")
def get_eligibility(active_days: int):

    eligible, message = check_eligibility(active_days)
    return {"eligible": eligible, "message": message}