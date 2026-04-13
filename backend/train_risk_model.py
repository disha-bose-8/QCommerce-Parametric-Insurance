"""
train_risk_model.py
Run from backend/: python train_risk_model.py

Steps:
  1. python generate_synthetic_data.py   ← regenerate dataset with claim history columns
  2. python train_risk_model.py          ← retrain model + save .pkl files
"""

import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import mean_absolute_error, r2_score
import joblib
import os

# ── 1. Load dataset ───────────────────────────────────────────────────────────
data_path = os.path.join("data", "synthetic_worker_data.csv")
df = pd.read_csv(data_path)

print(f"Loaded {len(df)} rows. Columns: {list(df.columns)}")

# ── 2. Encode categorical columns ────────────────────────────────────────────
le_zone  = LabelEncoder()
le_shift = LabelEncoder()

df["zone_id"]  = le_zone.fit_transform(df["zone"])
df["shift_id"] = le_shift.fit_transform(df["shift_type"])

# ── 3. Feature matrix ─────────────────────────────────────────────────────────
# IMPORTANT: this exact column order must match premium_service.py input_df
FEATURE_COLS = [
    "avg_weekly_income",
    "zone_id",
    "shift_id",
    "rain_intensity",
    "traffic_congestion",
    "aqi_level",
    "uv_index",
    "claim_count",           # NEW — individual claim history
    "total_payout_history",  # NEW — cumulative ₹ paid to this worker
]

X = df[FEATURE_COLS]
y = df["actual_loss"]

print(f"\nFeatures ({len(FEATURE_COLS)}): {FEATURE_COLS}")
print(f"Target: actual_loss  |  mean=₹{y.mean():.1f}  std=₹{y.std():.1f}")

# ── 4. Train / test split ─────────────────────────────────────────────────────
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# ── 5. Train Random Forest ────────────────────────────────────────────────────
model = RandomForestRegressor(
    n_estimators=200,    # more trees → more stable predictions
    max_depth=12,        # prevent overfitting on small synthetic dataset
    min_samples_leaf=5,
    random_state=42,
    n_jobs=-1,
)
model.fit(X_train, y_train)

# ── 6. Evaluate ───────────────────────────────────────────────────────────────
y_pred = model.predict(X_test)
mae    = mean_absolute_error(y_test, y_pred)
r2     = r2_score(y_test, y_pred)

print(f"\nModel Performance:")
print(f"  MAE : ₹{mae:.2f}  (mean absolute error on test set)")
print(f"  R²  : {r2:.4f}   (1.0 = perfect)")

# Feature importance summary
importance = pd.Series(model.feature_importances_, index=FEATURE_COLS)
print(f"\nFeature Importances:")
print(importance.sort_values(ascending=False).to_string())

# ── 7. Save model + encoders ──────────────────────────────────────────────────
os.makedirs("app/models", exist_ok=True)

joblib.dump(model,    "app/models/qshield_risk_model.pkl")
joblib.dump(le_zone,  "app/models/zone_encoder.pkl")
joblib.dump(le_shift, "app/models/shift_encoder.pkl")

# Also save feature column list so premium_service.py can validate at load time
joblib.dump(FEATURE_COLS, "app/models/feature_cols.pkl")

print("\n✅ Saved:")
print("   app/models/qshield_risk_model.pkl")
print("   app/models/zone_encoder.pkl")
print("   app/models/shift_encoder.pkl")
print("   app/models/feature_cols.pkl")
print("\nNext: restart the FastAPI server — new .pkl files load automatically.")