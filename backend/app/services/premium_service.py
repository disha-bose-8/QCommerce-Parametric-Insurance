import joblib
import pandas as pd
import os

# 1. Path Setup - Adjusted to match your VS Code structure
MODEL_PATH = os.path.join("app", "models", "qshield_risk_model.pkl")
ZONE_ENCODER_PATH = os.path.join("app", "models", "zone_encoder.pkl")

# 2. Load the AI "Brain"
try:
    # We use a try-block so the server doesn't crash if files are missing
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

def calculate_ai_risk_factor(weekly_income, zone, rain_intensity, traffic_index=0.3, aqi=100):
    if risk_model is None or le_zone is None:
        return 0.03 

    try:
        zone_id = le_zone.transform([zone])[0]
        
        # Now feeding ALL features the AI was trained on
        input_df = pd.DataFrame([[
            weekly_income, 
            zone_id, 
            1, # Shift ID
            rain_intensity, 
            traffic_index,
            aqi
        ]], columns=['avg_weekly_income', 'zone_id', 'shift_id', 'rain_intensity', 'traffic_congestion', 'aqi_level'])
        
        # The AI now weighs Traffic and AQI alongside Rain
        predicted_loss = risk_model.predict(input_df)[0]
        
        # Logic: If AQI is hazardous (>300), we force a 'Safety Surcharge'
        dynamic_risk = predicted_loss / weekly_income
        if aqi > 300:
            dynamic_risk += 0.005 

        return max(0.02, min(dynamic_risk, 0.06)) # Bumped max to 6% for extreme risk
    except:
        return 0.03

def calculate_premium(data):
    weekly_income = data["weekly_income"]
    zone = data["zone"]
    rain_intensity = data.get("rain_intensity", 0.0)

    risk_factor = calculate_ai_risk_factor(weekly_income, zone, rain_intensity)
    
    # Unicorn Feature: Income-based split
    worker_split = 0.50 if weekly_income < 4000 else 0.60
    
    total_premium = weekly_income * risk_factor
    worker_pays = total_premium * worker_split
    
    return {
        "risk_factor": round(risk_factor, 4),
        "total_premium": round(total_premium, 2),
        "worker_pays": round(worker_pays, 2),
        "platform_pays": round(total_premium - worker_pays, 2),
        "applied_split": f"{int(worker_split*100)}-{int(100 - worker_split*100)}",
        "daily_equivalent": round(worker_pays / 7, 2)
    }

# def calculate_risk_factor(zone, month, past_disruptions, claim_free_weeks):
#     """
#     Determines the parametric risk percentage based on environmental 
#     and behavioral factors.
#     """
#     risk = 0.03  # Base 3% [cite: 98, 119]

#     # 1. Seasonal Risk (Monsoon context)
#     # Higher probability of rain disruptions in India [cite: 10, 25]
#     if month.lower() in ["june", "july", "august", "september"]:
#         risk += 0.01

#     # 2. Hyper-local Zone Risk
#     # High-density urban zones have higher disruption impact 
#     high_risk_zones = ["Bangalore-Urban", "Mumbai", "Delhi"]
#     if zone in high_risk_zones:
#         risk += 0.005

#     # 3. Anomaly/Behavior Modifier
#     # Frequent past disruptions increase the risk profile [cite: 38]
#     if past_disruptions >= 2:
#         risk += 0.005

#     # 4. FEATURE ADDED: No-Claim Bonus (Loyalty Discount)
#     # Rewards consistent workers with a 0.5% reduction after 4 clean weeks
#     if claim_free_weeks >= 4:
#         risk -= 0.005 

#     # Strictly bound between 2% and 5% to maintain business viability [cite: 98]
#     return max(0.02, min(risk, 0.05))


# def calculate_premium(data):
#     """
#     Calculates the final weekly split between the worker and the platform.
#     """
#     weekly_income = data["weekly_income"]
#     zone = data["zone"]
#     month = data["month"]
#     past_disruptions = data.get("past_disruptions", 0)
#     claim_free_weeks = data.get("claim_free_weeks", 0)

#     if weekly_income <= 0:
#         raise ValueError("Invalid income data provided.")

#     # 5. FEATURE ADDED: Dynamic Co-Pay (Monsoon & Income Tiers)
#     # Traditionally 60-40, but adjusted for high-risk or low-earning scenarios [cite: 85, 119]
#     if weekly_income < 4000:
#         worker_split = 0.50  # Lower burden for low earners
#     elif month.lower() in ["june", "july", "august"]:
#         worker_split = 0.55  # Platform covers more during high-risk seasons
#     else:
#         worker_split = 0.60  # Standard hackathon requirement [cite: 85]

#     risk_factor = calculate_risk_factor(zone, month, past_disruptions, claim_free_weeks)
    
#     total_premium = weekly_income * risk_factor
#     worker_pays = total_premium * worker_split
#     platform_pays = total_premium * (1 - worker_split)

#     return {
#         "risk_factor": round(risk_factor, 4),
#         "total_premium": round(total_premium, 2),
#         "worker_pays": round(worker_pays, 2),
#         "platform_pays": round(platform_pays, 2),
#         "applied_split": f"{int(worker_split*100)}-{int((1-worker_split)*100)}",
#         "daily_equivalent": round(worker_pays / 7, 2)
#     }