import joblib
import pandas as pd
import os

# 1. Path Setup
MODEL_PATH = os.path.join("app", "models", "qshield_risk_model.pkl")
ZONE_ENCODER_PATH = os.path.join("app", "models", "zone_encoder.pkl")

# 2. Load the AI "Brain"
try:
    risk_model = joblib.load(MODEL_PATH)
    le_zone = joblib.load(ZONE_ENCODER_PATH)
except Exception as e:
    print(f"⚠️ Warning: Model files not found. Using fallback logic. Error: {e}")
    risk_model = None
    le_zone = None

def check_eligibility(active_days: int):
    """Checks if a worker has worked enough days to qualify for coverage."""
    if active_days >= 4:
        return True, "Eligible for full income protection."
    return False, f"Not eligible. Need {4 - active_days} more active days this week."

def calculate_ai_risk_factor(weekly_income, zone, rain_intensity, traffic_index, aqi, uv_index):
    """
    Predicts risk factor using the Random Forest model and applies 
    safety surcharges for extreme triggers.
    """
    if risk_model is None or le_zone is None:
        return 0.03 # Base fallback

    try:
        # Convert text zone to categorical ID
        zone_id = le_zone.transform([zone])[0]
        
        # Match the exact column names/order used during ML Training
        input_df = pd.DataFrame([[
            weekly_income, 
            zone_id, 
            1,              # Default Shift (Peak)
            rain_intensity, 
            traffic_index,
            aqi,
            uv_index
        ]], columns=['avg_weekly_income', 'zone_id', 'shift_id', 'rain_intensity', 'traffic_congestion', 'aqi_level', 'uv_index'])
        
        # Get AI predicted loss
        predicted_loss = risk_model.predict(input_df)[0]
        dynamic_risk = predicted_loss / weekly_income
        
        # --- Automated Trigger Surcharges (Parametric Logic) ---
        # If any factor is in the "Danger Zone", we bump the risk factor
        if aqi > 300:
            dynamic_risk += 0.005 # Hazardous Air Surcharge
        if uv_index >= 11:
            dynamic_risk += 0.003 # Extreme Heat/UV Surcharge
        if traffic_index > 0.85:
            dynamic_risk += 0.002 # Gridlock Efficiency Surcharge

        # Clamp between 2% and 6% for business viability
        return max(0.02, min(dynamic_risk, 0.06))
    except Exception as e:
        print(f"Prediction error: {e}")
        return 0.03

def calculate_premium(data):
    """
    Calculates final split based on AI risk and Income Tiers.
    """
    weekly_income = data.get("weekly_income", 0)
    zone = data.get("zone", "Bengaluru")
    
    # Extract triggers from data dictionary (provided by API or Weather Oracle)
    rain = data.get("rain_intensity", 0.0)
    traffic = data.get("traffic", 0.3)
    aqi = data.get("aqi", 100)
    uv = data.get("uv_index", 5)

    if weekly_income <= 0:
        return {"error": "Invalid income"}

    # Get the AI-driven risk factor
    risk_factor = calculate_ai_risk_factor(weekly_income, zone, rain, traffic, aqi, uv)
    
    # 60-40 Split Logic (Unicorn Feature: Platform pays more for low earners)
    if weekly_income < 4000:
        worker_split = 0.50  # 50-50 for vulnerable workers
    else:
        worker_split = 0.60  # Standard 60-40
    
    total_premium = weekly_income * risk_factor
    worker_pays = total_premium * worker_split
    platform_pays = total_premium * (1 - worker_split)
    
    return {
        "risk_factor": round(risk_factor, 4),
        "total_premium": round(total_premium, 2),
        "worker_pays": round(worker_pays, 2),
        "platform_pays": round(platform_pays, 2),
        "applied_split": f"{int(worker_split*100)}-{int((1-worker_split)*100)}",
        "daily_equivalent": round(worker_pays / 7, 2),
        "triggers_detected": {
            "rain": rain,
            "traffic": traffic,
            "aqi": aqi,
            "uv": uv
        }
    }