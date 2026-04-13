import joblib
import pandas as pd
import os

# ── Path Setup ────────────────────────────────────────────────────────────────
MODEL_PATH        = os.path.join("app", "models", "qshield_risk_model.pkl")
ZONE_ENCODER_PATH = os.path.join("app", "models", "zone_encoder.pkl")

# ── Load the AI "Brain" ───────────────────────────────────────────────────────
try:
    risk_model = joblib.load(MODEL_PATH)
    le_zone    = joblib.load(ZONE_ENCODER_PATH)
except Exception as e:
    print(f"⚠️ Warning: Model files not found. Using fallback logic. Error: {e}")
    risk_model = None
    le_zone    = None


def check_eligibility(active_days: int):
    """Checks if a worker has worked enough days to qualify for coverage."""
    if active_days >= 4:
        return True, "Eligible for full income protection."
    return False, f"Not eligible. Need {4 - active_days} more active days this week."


def calculate_claim_history_surcharge(claim_count: int, total_payout_history: float, weekly_income: float) -> float:
    """
    Returns an additive surcharge to the risk factor based on the worker's
    individual claim history. High-claim workers pay a higher premium.

    Surcharge tiers:
      - 0–1 claims            → 0.000 (no surcharge — baseline)
      - 2–3 claims            → +0.003
      - 4–5 claims            → +0.006
      - 6+ claims             → +0.010 (high-frequency claimant)
    Additionally, if total_payout_history > 3× weekly_income (heavy historical
    payouts), add another +0.004 to reflect elevated loss exposure.
    """
    surcharge = 0.0

    if claim_count >= 6:
        surcharge += 0.010
    elif claim_count >= 4:
        surcharge += 0.006
    elif claim_count >= 2:
        surcharge += 0.003

    # Heavy historical payout penalty
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
    """
    Predicts risk factor using the Random Forest model and applies:
    - Safety surcharges for extreme environmental triggers
    - Individual claim history surcharge (new)
    """
    if risk_model is None or le_zone is None:
        # Fallback: flat base + claim surcharge
        base = 0.03
        base += calculate_claim_history_surcharge(claim_count, total_payout_history, weekly_income)
        return max(0.02, min(base, 0.08))

    try:
        # Convert text zone to categorical ID
        zone_id = le_zone.transform([zone])[0]

        # Match exact column names/order used during ML training
        input_df = pd.DataFrame([[
            weekly_income,
            zone_id,
            1,              # Default Shift (Peak)
            rain_intensity,
            traffic_index,
            aqi,
            uv_index,
        ]], columns=[
            'avg_weekly_income', 'zone_id', 'shift_id',
            'rain_intensity', 'traffic_congestion', 'aqi_level', 'uv_index',
        ])

        # Get AI predicted loss
        predicted_loss = risk_model.predict(input_df)[0]
        dynamic_risk   = predicted_loss / weekly_income

        # ── Environmental trigger surcharges ──────────────────────────────────
        if aqi > 300:
            dynamic_risk += 0.005   # Hazardous Air
        if uv_index >= 11:
            dynamic_risk += 0.003   # Extreme Heat / UV
        if traffic_index > 0.85:
            dynamic_risk += 0.002   # Gridlock Efficiency Loss

        # ── Individual claim history surcharge ────────────────────────────────
        dynamic_risk += calculate_claim_history_surcharge(claim_count, total_payout_history, weekly_income)

        # Clamp: 2% floor (minimum viable coverage), 8% ceiling (business viability)
        # Upper bound raised from 6% → 8% to accommodate high-claim workers
        return max(0.02, min(dynamic_risk, 0.08))

    except Exception as e:
        print(f"Prediction error: {e}")
        return 0.03


def calculate_premium(data: dict) -> dict:
    """
    Calculates final premium split based on AI risk and Income Tiers.
    Now also accepts claim_count and total_payout_history for individual risk pricing.
    """
    weekly_income        = data.get("weekly_income", 0)
    zone                 = data.get("zone", "Bengaluru")
    rain                 = data.get("rain_intensity", 0.0)
    traffic              = data.get("traffic", 0.3)
    aqi                  = data.get("aqi", 100)
    uv                   = data.get("uv_index", 5)
    # Individual claim history inputs
    claim_count          = int(data.get("claim_count", 0))
    total_payout_history = float(data.get("total_payout_history", 0.0))

    if weekly_income <= 0:
        return {"error": "Invalid income"}

    # Get the AI-driven risk factor (now includes claim history)
    risk_factor = calculate_ai_risk_factor(
        weekly_income, zone, rain, traffic, aqi, uv,
        claim_count, total_payout_history,
    )

    # ── 60-40 Split Logic ─────────────────────────────────────────────────────
    # Platform pays a larger share for low-income / vulnerable workers
    if weekly_income < 4000:
        worker_split = 0.50   # 50-50 for vulnerable workers
    else:
        worker_split = 0.60   # Standard 60-40

    total_premium  = weekly_income * risk_factor
    worker_pays    = total_premium * worker_split
    platform_pays  = total_premium * (1 - worker_split)

    return {
        "risk_factor":      round(risk_factor, 4),
        "total_premium":    round(total_premium, 2),
        "worker_pays":      round(worker_pays, 2),
        "platform_pays":    round(platform_pays, 2),
        "applied_split":    f"{int(worker_split * 100)}-{int((1 - worker_split) * 100)}",
        "daily_equivalent": round(worker_pays / 7, 2),
        "claim_surcharge":  round(
            calculate_claim_history_surcharge(claim_count, total_payout_history, weekly_income), 4
        ),
        "triggers_detected": {
            "rain":    rain,
            "traffic": traffic,
            "aqi":     aqi,
            "uv":      uv,
        },
    }