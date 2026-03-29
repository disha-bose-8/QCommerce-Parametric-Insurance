import pandas as pd
import numpy as np

def generate_qshield_data(rows=10000):
    np.random.seed(42)
    
    # Core Fields
    data = {
        'worker_id': range(1, rows + 1),
        'platform': np.random.choice(['Zepto', 'Blinkit', 'SwiggyInstamart'], rows),
        'zone': np.random.choice(['Koramangala', 'HSR Layout', 'Indiranagar', 'Whitefield'], rows),
        'avg_weekly_income': np.random.normal(7000, 1500, rows).clip(3500, 12000),
        'shift_type': np.random.choice(['Morning', 'Evening', 'Night'], rows, p=[0.4, 0.4, 0.2]),
        'claim_free_weeks': np.random.randint(0, 10, rows),
        
        # Environmental Inputs (Simulated from 0.0 to 1.0)
        'rain_intensity': np.random.uniform(0, 1, rows),
        'traffic_congestion': np.random.uniform(0, 1, rows),
        'aqi_level': np.random.randint(50, 450, rows)
    }
    
    df = pd.DataFrame(data)

    # Target Variable: 'actual_loss' (What the AI will learn to predict)
    # Logic: Higher loss if rain is high AND shift is Evening (peak hours)
    df['actual_loss'] = (df['avg_weekly_income'] * 0.15 * df['rain_intensity'])
    df.loc[df['shift_type'] == 'Evening', 'actual_loss'] *= 1.2 
    df['actual_loss'] = df['actual_loss'].round(2)

    return df

# Create the file
df = generate_qshield_data()
# Updated path to save directly into your existing data folder
df.to_csv('data/synthetic_worker_data.csv', index=False)
print("File created inside backend/data/ successfully!")