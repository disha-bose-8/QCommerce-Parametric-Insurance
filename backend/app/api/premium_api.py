from fastapi import APIRouter, HTTPException
from app.services.premium_service import calculate_premium, check_eligibility

router = APIRouter()

@router.get("/calculate")
def get_premium(
    weekly_income: float, 
    zone: str, 
    rain_intensity: float = 0.0, 
    traffic: float = 0.3, 
    aqi: int = 100
):
    """
    Unified Multi-Factor AI Risk Engine.
    Inputs: Income, Location, Rain, Traffic, and Air Quality (AQI).
    """
    try:
        data = {
            "weekly_income": weekly_income,
            "zone": zone,
            "rain_intensity": rain_intensity,
            "traffic": traffic,
            "aqi": aqi
        }
        
        # This now sends all 5 features to the AI model
        result = calculate_premium(data)
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Risk Engine Error: {str(e)}")

@router.get("/eligibility")
def get_eligibility(active_days: int):
    eligible, message = check_eligibility(active_days)
    return {"eligible": eligible, "message": message}