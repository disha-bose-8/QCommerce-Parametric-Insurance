# backend/app/services/triggers.py

# httpx is like the requests library but works with FastAPI's async style
import httpx

# we need the API keys from our config
from app.core.config import settings

from datetime import datetime, timezone, timedelta

# --- thresholds ---
RAIN_THRESHOLD = 20.0      # mm per hour — IMD definition of heavy rain
HEAT_THRESHOLD = 42.0      # degrees celsius
AQI_THRESHOLD = 350        # hazardous per CPCB
ORDER_DROP_PCT = 25.0      # zone orders must drop by 25% to confirm env trigger


# checks rain using OpenWeatherMap
async def check_rain(lat: float, lon: float) -> dict:
    
    url = "https://api.openweathermap.org/data/2.5/weather"
    params = {
        "lat": lat,
        "lon": lon,
        "appid": settings.OPENWEATHER_API_KEY,
        "units": "metric",
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params, timeout=10)
        data = response.json()
    
    # rainfall in last 1 hour — key won't exist if no rain so we default to 0
    rain_mm = data.get("rain", {}).get("1h", 0.0)
    triggered = rain_mm >= RAIN_THRESHOLD
    
    return {
        "trigger_type": "heavy_rain",
        "triggered": triggered,
        "raw_value": rain_mm,
        "threshold": RAIN_THRESHOLD,
        "unit": "mm/hr",
        "source": "openweathermap",
    }


# checks temperature using OpenWeatherMap
async def check_heat(lat: float, lon: float) -> dict:
    
    url = "https://api.openweathermap.org/data/2.5/weather"
    params = {
        "lat": lat,
        "lon": lon,
        "appid": settings.OPENWEATHER_API_KEY,
        "units": "metric",
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params, timeout=10)
        data = response.json()
    
    temp = data["main"]["temp"]
    triggered = temp >= HEAT_THRESHOLD
    
    return {
        "trigger_type": "extreme_heat",
        "triggered": triggered,
        "raw_value": temp,
        "threshold": HEAT_THRESHOLD,
        "unit": "celsius",
        "source": "openweathermap",
    }


# checks AQI using AQICN — one simple call by city name
async def check_aqi(city: str) -> dict:
    
    url = f"https://api.waqi.info/feed/{city}/"
    params = {"token": settings.AQICN_API_KEY}
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params, timeout=10)
        data = response.json()
    
    # add this line temporarily to see what the API is returning
    print(data)
    
    aqi_value = 0.0
    if data.get("status") == "ok":
        aqi_value = float(data["data"]["aqi"])
    
    triggered = aqi_value >= AQI_THRESHOLD
    
    return {
        "trigger_type": "severe_aqi",
        "triggered": triggered,
        "raw_value": aqi_value,
        "threshold": AQI_THRESHOLD,
        "unit": "AQI",
        "source": "aqicn",
    }


# for environmental triggers we need BOTH the env condition AND a 25% order drop
def dual_validate(env_result: dict, current_orders: int, baseline_orders: float) -> dict:
    
    # calculate how much orders dropped vs baseline
    if baseline_orders > 0:
        drop_pct = (baseline_orders - current_orders) / baseline_orders * 100
    else:
        drop_pct = 0.0
    
    # both must be true for disruption day to be confirmed
    order_drop_triggered = drop_pct >= ORDER_DROP_PCT
    confirmed = env_result["triggered"] and order_drop_triggered
    
    env_result["order_drop_pct"] = round(drop_pct, 2)
    env_result["order_drop_triggered"] = order_drop_triggered
    env_result["confirmed"] = confirmed
    
    return env_result


async def check_curfew(zone: str) -> dict:
    
    # search NewsAPI for recent curfew/bandh/strike news for this zone
    url = "https://newsapi.org/v2/everything"
    params = {
        "q": f"curfew OR bandh OR strike {zone}",  # search these keywords + city name
        "apiKey": settings.NEWSAPI_KEY,
        "language": "en",
        "sortBy": "publishedAt",  # most recent first
        "pageSize": 5,            # only need a few results
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params, timeout=10)
        data = response.json()
    
    articles = data.get("articles", [])
    
    # check if any article is from the last 24 hours
    
    cutoff = datetime.now(timezone.utc) - timedelta(hours=24)
    
    recent_articles = []
    for article in articles:
        published = article.get("publishedAt", "")
        if published:
            # parse the date string from NewsAPI
            pub_date = datetime.fromisoformat(published.replace("Z", "+00:00"))
            if pub_date >= cutoff:
                recent_articles.append(article)
    
    triggered = len(recent_articles) > 0
    
    # grab headline that triggered it as proof
    headline = recent_articles[0]["title"] if recent_articles else None
    
    return {
        "trigger_type": "curfew",
        "triggered": triggered,
        "confirmed": triggered,
        "source": "newsapi",
        "headline": headline,
        "articles_found": len(recent_articles),
        "detail": f"Recent curfew/strike news found in {zone}" if triggered else f"No recent curfew/strike news for {zone}",
    }


async def check_platform_outage(platform: str) -> dict:
    
    # UptimeRobot API — checks if the platform is currently down
    url = "https://api.uptimerobot.com/v2/getMonitors"
    
    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    
    # UptimeRobot uses POST with form data, not GET
    data = {
        "api_key": settings.UPTIMEROBOT_API_KEY,
        "format": "json",
        "logs": "1",          # include downtime logs
        "log_limit": "5",     # last 5 logs
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(url, data=data, headers=headers, timeout=10)
        result = response.json()
    
    # find the monitor matching our platform name
    monitors = result.get("monitors", [])
    platform_monitor = None
    for monitor in monitors:
        if platform.lower() in monitor["friendly_name"].lower():
            platform_monitor = monitor
            break
    
    if not platform_monitor:
        return {
            "trigger_type": "platform_outage",
            "triggered": False,
            "confirmed": False,
            "source": "uptimerobot",
            "detail": f"No monitor found for {platform}",
        }
    
    # UptimeRobot status: 2 = up, 8 = seems down, 9 = down
    status = platform_monitor.get("status", 2)
    triggered = status in [8, 9]
    
    status_labels = {2: "up", 8: "seems down", 9: "down"}
    
    return {
        "trigger_type": "platform_outage",
        "triggered": triggered,
        "confirmed": triggered,
        "raw_value": status,
        "source": "uptimerobot",
        "platform": platform,
        "status": status_labels.get(status, "unknown"),
        "detail": f"{platform} is {status_labels.get(status, 'unknown')}",
    }

