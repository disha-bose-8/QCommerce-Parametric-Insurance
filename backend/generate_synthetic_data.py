"""
generate_synthetic_data.py
Run from backend/: python generate_synthetic_data.py
Generates backend/data/synthetic_worker_data.csv
"""

import pandas as pd
import numpy as np
import os

np.random.seed(42)

N = 2000  # number of synthetic worker-weeks

ZONES = ["Koramangala", "Whitefield", "HSR Layout", "Indiranagar", "Jayanagar",
         "Marathahalli", "Yelahanka", "Electronic City"]

SHIFTS = ["Morning", "Peak", "Night"]

ZONE_RISK_MULTIPLIER = {
    "Koramangala":    1.10,
    "Whitefield":     1.05,
    "HSR Layout":     1.00,
    "Indiranagar":    1.08,
    "Jayanagar":      0.95,
    "Marathahalli":   1.03,
    "Yelahanka":      0.92,
    "Electronic City": 1.01,
}

def generate():
    zones      = np.random.choice(ZONES, N)
    shifts     = np.random.choice(SHIFTS, N)
    incomes    = np.random.normal(loc=7000, scale=2000, size=N).clip(2000, 18000)

    rain       = np.random.exponential(scale=3, size=N).clip(0, 80)
    traffic    = np.random.beta(a=2, b=5, size=N)          # 0–1
    aqi        = np.random.normal(loc=120, scale=50, size=N).clip(20, 500)
    uv         = np.random.randint(1, 14, size=N).astype(float)

    # ── Claim history columns (NEW) ─────────────────────────────────────────
    # Most workers have 0–2 claims; a small tail has many (high-risk profile)
    claim_count = np.random.choice(
        [0, 1, 2, 3, 4, 5, 6, 7, 8],
        p=[0.35, 0.25, 0.18, 0.10, 0.05, 0.03, 0.02, 0.01, 0.01],
        size=N,
    )
    # total_payout_history ≈ claim_count × ~₹480 (avg payout) with some noise
    total_payout_history = (
        claim_count * np.random.normal(loc=480, scale=80, size=N)
    ).clip(0)

    # ── Actual loss computation ──────────────────────────────────────────────
    # Base loss = income fraction driven by environmental factors
    zone_mult = np.array([ZONE_RISK_MULTIPLIER[z] for z in zones])

    base_loss = (
        incomes * 0.03                          # base 3% of income
        + rain        * 12                      # ₹12 per mm/hr rainfall
        + traffic     * incomes * 0.015         # traffic impact on earnings
        + (aqi - 100).clip(0) * 1.2             # AQI above 100 adds loss
        + (uv - 8).clip(0)    * 80              # UV above 8 adds loss
    ) * zone_mult

    # ── Claim history surcharge on actual loss ───────────────────────────────
    # High-claim workers statistically incur more losses — teach the model this
    claim_surcharge = (
        np.where(claim_count >= 6, 0.010,
        np.where(claim_count >= 4, 0.006,
        np.where(claim_count >= 2, 0.003, 0.0)))
        * incomes
    )
    # Heavy historical payout penalty
    heavy_payout_mask = total_payout_history > (3 * incomes)
    claim_surcharge   = np.where(heavy_payout_mask, claim_surcharge + incomes * 0.004, claim_surcharge)

    actual_loss = (base_loss + claim_surcharge + np.random.normal(0, 50, N)).clip(0)

    df = pd.DataFrame({
        "zone":                  zones,
        "shift_type":            shifts,
        "avg_weekly_income":     incomes.round(2),
        "rain_intensity":        rain.round(2),
        "traffic_congestion":    traffic.round(4),
        "aqi_level":             aqi.round(1),
        "uv_index":              uv,
        "claim_count":           claim_count,           # NEW
        "total_payout_history":  total_payout_history.round(2),  # NEW
        "actual_loss":           actual_loss.round(2),
    })

    os.makedirs("data", exist_ok=True)
    out = os.path.join("data", "synthetic_worker_data.csv")
    df.to_csv(out, index=False)
    print(f"✅ Generated {N} rows → {out}")
    print(df.describe())
    return df


if __name__ == "__main__":
    generate()