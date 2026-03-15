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
    
    result = await check_heat(lat, lon)
    result = dual_validate(result, current_orders, baseline_orders)
    
    return result


# checks AQI for a city
# example: GET /api/triggers/aqi?city=Chennai&current_orders=70&baseline_orders=100
@router.get("/aqi")
async def trigger_aqi(city: str, current_orders: int, baseline_orders: float):
    
    result = await check_aqi(city)
    result = dual_validate(result, current_orders, baseline_orders)
    
    return result


# checks curfew for a zone — mocked
@router.get("/curfew")
def trigger_curfew(zone: str):
    return check_curfew(zone)


# checks platform outage — mocked
@router.get("/outage")
def trigger_outage(platform: str):
    return check_platform_outage(platform)