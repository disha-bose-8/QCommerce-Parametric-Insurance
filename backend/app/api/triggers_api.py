# backend/app/api/triggers_api.py

# APIRouter lets us group all trigger related routes together
from fastapi import APIRouter

# import all the trigger functions we just wrote
from app.services.triggers import (
    check_rain,
    check_heat,
    check_aqi,
    check_curfew,
    check_platform_outage,
    dual_validate,
)

router = APIRouter()


# checks rain at a given location
# example: GET /api/triggers/rain?lat=13.0827&lon=80.2707&current_orders=70&baseline_orders=100
@router.get("/rain")
async def trigger_rain(lat: float, lon: float, current_orders: int, baseline_orders: float):
    
    # first check the weather
    result = await check_rain(lat, lon)
    
    # then validate against order drop
    result = dual_validate(result, current_orders, baseline_orders)
    
    return result


# checks heat at a given location
@router.get("/heat")
async def trigger_heat(lat: float, lon: float, current_orders: int, baseline_orders: float):
    
    raw_result = await check_heat(lat, lon)
    validated = dual_validate(raw_result, current_orders, baseline_orders)

    # 🔥 PRESERVE UV
    validated["uv_index"] = raw_result.get("uv_index", 0)

    return validated


# checks AQI for a city
# example: GET /api/triggers/aqi?city=Chennai&current_orders=70&baseline_orders=100
@router.get("/aqi")
async def trigger_aqi(city: str, current_orders: int, baseline_orders: float):
    
    result = await check_aqi(city)
    result = dual_validate(result, current_orders, baseline_orders)
    
    return result


# checks curfew for a zone
@router.get("/curfew")
async def trigger_curfew(zone: str):
    return await check_curfew(zone)

# demo simulate fake curfew/strike for a zone
@router.get("/curfew/simulate")
def simulate_curfew(zone: str):
    return {
        "trigger_type": "curfew",
        "triggered": True,
        "confirmed": True,
        "source": "newsapi_simulated",
        "headline": f"Bandh declared in {zone} — all essential services affected",
        "articles_found": 1,
        "detail": f"Simulated curfew active in {zone} for demo purposes",
    }


# checks platform outage
@router.get("/outage")
async def trigger_outage(platform: str):
    return await check_platform_outage(platform)

# demo simulates a fake platform outage 

@router.get("/outage/simulate")
def simulate_outage(platform: str):
    return {
        "trigger_type": "platform_outage",
        "triggered": True,
        "confirmed": True,
        "source": "uptimerobot_simulated",
        "platform": platform,
        "status": "down",
        "detail": f"{platform} has been down for 3+ hours — payout triggered",
    }