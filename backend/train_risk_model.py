import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
import joblib
import os

# 1. Load the data you just generated
data_path = os.path.join('data', 'synthetic_worker_data.csv')
df = pd.read_csv(data_path)

# 2. Preprocessing: AI only understands numbers
# We convert 'Zone' and 'Shift' into numeric codes
le_zone = LabelEncoder()
le_shift = LabelEncoder()
df['zone_id'] = le_zone.fit_transform(df['zone'])
df['shift_id'] = le_shift.fit_transform(df['shift_type'])

# 3. Define Features (Inputs) and Target (What we want to predict)
# We want to predict 'actual_loss' using income, zone, shift, and rain
X = df[['avg_weekly_income', 'zone_id', 'shift_id', 'rain_intensity', 'traffic_congestion']]
y = df['actual_loss']

# 4. Train the Model
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# 5. Save the "Brain" and the Encoders to your 'models' folder
os.makedirs('app/models', exist_ok=True)
joblib.dump(model, 'app/models/qshield_risk_model.pkl')
joblib.dump(le_zone, 'app/models/zone_encoder.pkl')
joblib.dump(le_shift, 'app/models/shift_encoder.pkl')

print("Success! AI Risk Model trained and saved in backend/app/models/")