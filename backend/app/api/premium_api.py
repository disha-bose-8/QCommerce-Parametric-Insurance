# app/api/premium_api.py
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Premium
from app.services.premium_service import calculate_premium, check_eligibility

router = APIRouter()

@router.get("/calculate")
def get_premium(
    weekly_income: float, 
    zone: str, 
    rain_intensity: float = 0.0, 
    traffic: float = 0.3, 
    aqi: int = 100,
    uv_index: float = 5.0,
    db: Session = Depends(get_db) # Added DB dependency
):
    try:
        if weekly_income <= 0:
            raise HTTPException(status_code=400, detail="Weekly income must be > 0")

        # 1. Bundle data for the ML Service
        data = {
            "weekly_income": weekly_income,
            "zone": zone,
            "rain_intensity": rain_intensity,
            "traffic": traffic,
            "aqi": aqi,
            "uv_index": uv_index
        }
        
        # 2. Execute calculation
        result = calculate_premium(data)
        
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
            
        # 3. 🔥 SAVE TO SUPABASE (The Persistence piece)
        # This ensures the Admin Dashboard can see the history of calculations
        new_record = Premium(
            weekly_income=weekly_income,
            zone=zone,
            risk_factor=result.get("risk_factor", 0.0),
            total_premium=result.get("total_premium", 0.0),
            worker_pays=result.get("worker_pays", 0.0),
            platform_pays=result.get("platform_pays", 0.0)
        )

        db.add(new_record)
        db.commit()
        
        return result # Return the full JSON for the Frontend
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Risk Engine Error: {str(e)}")

@router.get("/eligibility")
def get_eligibility(active_days: int):
    eligible, message = check_eligibility(active_days)
    return {"eligible": eligible, "message": message}