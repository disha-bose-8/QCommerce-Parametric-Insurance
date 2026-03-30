from fastapi import APIRouter, HTTPException
from app.services.premium_service import calculate_premium, check_eligibility

router = APIRouter()

@router.get("/calculate")
def get_premium(
    weekly_income: float, 
    zone: str, 
    rain_intensity: float = 0.0, 
    traffic: float = 0.3, 
    aqi: int = 100,
    uv_index: float = 5.0
):
    """
    Unified Multi-Factor AI Risk Engine.
    Calculates premiums based on Income, Location, Rain, Traffic, AQI, and UV.
    """
    try:
        # Validate inputs
        if weekly_income <= 0:
            raise HTTPException(status_code=400, detail="Weekly income must be greater than zero.")

        # Bundle parameters for the Service Layer
        data = {
            "weekly_income": weekly_income,
            "zone": zone,
            "rain_intensity": rain_intensity,
            "traffic": traffic,
            "aqi": aqi,
            "uv_index": uv_index
        }
        
        # Execute calculation via the ML Service
        result = calculate_premium(data)
        
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
            
        return result
        
    except Exception as e:
        # Catch-all for AI model loading errors or missing zone encoders
        raise HTTPException(status_code=500, detail=f"Risk Engine Error: {str(e)}")

@router.get("/eligibility")
def get_eligibility(active_days: int):
    """
    Checks if a worker meets the 'Active Days' threshold for full coverage.
    """
    eligible, message = check_eligibility(active_days)
    return {"eligible": eligible, "message": message}