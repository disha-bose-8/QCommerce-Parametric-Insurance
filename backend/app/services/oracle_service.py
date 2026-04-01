import httpx
import os

# Config for your existing keys
KEYS = {
    "weather": os.getenv("OPENWEATHER_API_KEY"),
    "aqi": os.getenv("AQICN_API_KEY"),
    "news": os.getenv("NEWSAPI_KEY"),
    "uptime": os.getenv("UPTIMEROBOT_API_KEY")
}

async def check_all_sensors(zone="Bengaluru"):
    results = []
    async with httpx.AsyncClient() as client:
        # 1. WEATHER CHECK
        w_url = f"https://api.openweathermap.org/data/2.5/weather?q={zone}&appid={KEYS['weather']}&units=metric"
        w_resp = await client.get(w_url)
        w_data = w_resp.json()
        
        # SAFETY CHECK: Make sure 'main' exists in the dictionary
        if w_resp.status_code == 200 and isinstance(w_data, dict):
            # Use .get() to avoid crashing if 'rain' is missing
            rain_info = w_data.get("rain", {})
            rain_val = rain_info.get("1h", 0) if isinstance(rain_info, dict) else 0
            
            if rain_val > 0.5:
                results.append({"type": "Heavy Rain", "val": rain_val})
            
            temp = w_data.get("main", {}).get("temp", 0)
            if temp > 38:
                results.append({"type": "Extreme Heat", "val": temp})

        # 2. AQI CHECK
        a_url = f"https://api.waqi.info/feed/{zone}/?token={KEYS['aqi']}"
        a_resp = await client.get(a_url)
        a_data = a_resp.json()
        
        if a_resp.status_code == 200 and a_data.get("status") == "ok":
            # Accessing nested data safely
            aqi_val = a_data.get("data", {}).get("aqi", 0)
            if aqi_val > 200:
                results.append({"type": "Severe AQI", "val": aqi_val})
                
    return results