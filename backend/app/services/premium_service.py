"""
premium_service.py
Loads the trained Random Forest model and computes dynamic weekly premiums.
Column order in input_df MUST match FEATURE_COLS in train_risk_model.py exactly.
"""

import joblib
import pandas as pd
import os

# ── Path Setup ────────────────────────────────────────────────────────────────
MODEL_PATH         = os.path.join("app", "models", "qshield_risk_model.pkl")
ZONE_ENCODER_PATH  = os.path.join("app", "models", "zone_encoder.pkl")
SHIFT_ENCODER_PATH = os.path.join("app", "models", "shift_encoder.pkl")
FEATURE_COLS_PATH  = os.path.join("app", "models", "feature_cols.pkl")

# ── Load the AI "Brain" ───────────────────────────────────────────────────────
try:
    risk_model   = joblib.load(MODEL_PATH)
    le_zone      = joblib.load(ZONE_ENCODER_PATH)
    le_shift     = joblib.load(SHIFT_ENCODER_PATH)
    FEATURE_COLS = joblib.load(FEATURE_COLS_PATH)
    print(f"✅ Risk model loaded. Features: {FEATURE_COLS}")
except Exception as e:
    print(f"⚠️  Model files not found — using fallback flat-rate logic. Error: {e}")
    risk_model   = None
    le_zone      = None
    le_shift     = None
    FEATURE_COLS = [
        "avg_weekly_income", "zone_id", "shift_id",
        "rain_intensity", "traffic_congestion", "aqi_level", "uv_index",
        "claim_count", "total_payout_history",
    ]

DEFAULT_SHIFT = "Peak"


def check_eligibility(active_days: int):
    if active_days >= 4:
        return True, "Eligible for full income protection."
    return False, f"Not eligible. Need {4 - active_days} more active days this week."


def calculate_claim_history_surcharge(
    claim_count: int,
    total_payout_history: float,
    weekly_income: float,
) -> float:
    """
    Additive surcharge on the risk factor based on individual claim history.
      0-1 claims  -> 0.000
      2-3 claims  -> +0.003
      4-5 claims  -> +0.006
      6+ claims   -> +0.010
    Heavy-payout penalty: cumulative payouts > 3x weekly income -> +0.004
    """
    surcharge = 0.0
    if claim_count >= 6:
        surcharge += 0.010
    elif claim_count >= 4:
        surcharge += 0.006
    elif claim_count >= 2:
        surcharge += 0.003
    if weekly_income > 0 and total_payout_history > 3 * weekly_income:
        surcharge += 0.004
    return surcharge


def calculate_ai_risk_factor(
    weekly_income: float,
    zone: str,
    rain_intensity: float,
    traffic_index: float,
    aqi: float,
    uv_index: float,
    claim_count: int = 0,
    total_payout_history: float = 0.0,
) -> float:
    claim_surcharge = calculate_claim_history_surcharge(
        claim_count, total_payout_history, weekly_income
    )

    if risk_model is None or le_zone is None:
        return max(0.02, min(0.03 + claim_surcharge, 0.08))

    try:
        known_zones = list(le_zone.classes_)
        if zone not in known_zones:
            zone = known_zones[0]
        zone_id  = le_zone.transform([zone])[0]
        shift_id = le_shift.transform([DEFAULT_SHIFT])[0]

        input_df = pd.DataFrame([[
            weekly_income,
            zone_id,
            shift_id,
            rain_intensity,
            traffic_index,
            aqi,
            uv_index,
            claim_count,
            total_payout_history,
        ]], columns=FEATURE_COLS)

        predicted_loss = risk_model.predict(input_df)[0]
        dynamic_risk   = predicted_loss / weekly_income if weekly_income > 0 else 0.03

        if aqi > 300:            dynamic_risk += 0.005
        if uv_index >= 11:       dynamic_risk += 0.003
        if traffic_index > 0.85: dynamic_risk += 0.002

        dynamic_risk += claim_surcharge

        return max(0.02, min(dynamic_risk, 0.08))

    except Exception as e:
        print(f"Prediction error: {e}")
        return max(0.02, min(0.03 + claim_surcharge, 0.08))


def calculate_premium(data: dict) -> dict:
    weekly_income        = data.get("weekly_income", 0)
    zone                 = data.get("zone", "Bengaluru")
    rain                 = float(data.get("rain_intensity", 0.0))
    traffic              = float(data.get("traffic", 0.3))
    aqi                  = float(data.get("aqi", 100))
    uv                   = float(data.get("uv_index", 5))
    claim_count          = int(data.get("claim_count", 0))
    total_payout_history = float(data.get("total_payout_history", 0.0))

    if weekly_income <= 0:
        return {"error": "Invalid income"}

    risk_factor = calculate_ai_risk_factor(
        weekly_income, zone, rain, traffic, aqi, uv,
        claim_count, total_payout_history,
    )

    worker_split  = 0.50 if weekly_income < 4000 else 0.60
    total_premium = weekly_income * risk_factor
    worker_pays   = total_premium * worker_split
    platform_pays = total_premium * (1 - worker_split)
    

    # ── Cast everything to plain Python float before returning ────────────────
    # Prevents np.float64 from reaching psycopg2 / Postgres and causing
    # "schema np does not exist" errors on INSERT.
    return {
        "risk_factor":      float(round(risk_factor, 4)),
        "total_premium":    float(round(total_premium, 2)),
        "worker_pays":      float(round(worker_pays, 2)),
        "platform_pays":    float(round(platform_pays, 2)),
        "applied_split":    f"{int(worker_split * 100)}-{int((1 - worker_split) * 100)}",
        "daily_equivalent": float(round(worker_pays / 7, 2)),
        "claim_surcharge":  float(round(
            calculate_claim_history_surcharge(claim_count, total_payout_history, weekly_income), 4
        )),
        "zone": zone,
        "triggers_detected": {
            "rain":     float(rain),
            "traffic":  float(traffic),
            "aqi":      float(aqi),
            "uv_index": float(uv),
        },
    }