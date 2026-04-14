# QShield 🛡️
### AI-Powered Parametric Income Protection for Gig Workers

> Automatically detects when a delivery worker can't work due to rain, heat, AQI, curfew, or platform outage - and pays them instantly. No forms. No waiting. No manual claims.

**Live Demo:** https://qshield.vercel.app
**Backend API + Swagger:** https://qshield-backend-nf8y.onrender.com/docs
**Built for:** Guidewire DEVTrails University Hackathon 2026 

---

## What is QShield?

QShield is a weekly insurance product for Q-commerce delivery workers (Zepto, Blinkit, Swiggy Instamart). When something outside a worker's control stops them from working, QShield automatically detects it and sends money to their wallet — no human involved.

This is called **parametric insurance**: instead of asking "did you lose income?", the system asks "did this measurable event happen?" If yes, it pays out immediately.

Each worker gets a **personalised weekly premium** calculated by an AI model — not a flat rate. Workers who claim more pay higher premiums over time, just like real insurance.

---

## The Problem

Delivery workers earn daily. One disruption day can mean no food on the table. They have zero protection against:

- Heavy rainfall that makes roads undeliverable
- Extreme heat that makes outdoor work dangerous
- Hazardous air quality (AQI spikes)
- Government-declared curfews
- Platform outages that take the app offline

Traditional insurance doesn't work for gig workers - too expensive, too slow, and requires manual claims they don't have time to file.

---

## How It Works - Full Flow

| Step | What Happens | Who Does It |
|------|-------------|-------------|
| 1. Register | Worker signs up with name, zone, income, platform | Worker |
| 2. Premium Set | AI model calculates weekly premium based on zone + income + claim history | System (AI) |
| 3. Wallet Funded | Wallet seeded with 4 weeks of premiums on signup | System |
| 4. Live Monitoring | Sensors poll rain, heat, AQI, curfew, outage every 30 seconds | Oracle |
| 5. Trigger Fires | A threshold is breached (e.g. rain >= 20mm/hr) | Oracle |
| 6. Auto Payout | System instantly creates a payout — no human involved | System |
| 7. Worker Notified | Worker sees payout receipt and wallet update on dashboard | Frontend |
| 8. Premium Collected | Admin collects weekly premiums — amount is dynamic per worker | Admin |

---

## Where AI Is Used

### 1. Random Forest Risk Model (Dynamic Pricing)

A `RandomForestRegressor` trained on 2,000 synthetic worker-week records. It predicts the expected weekly income loss for a given worker, then uses that to calculate their personalised premium.

**9 input features:**

| Feature | What It Represents |
|---------|-------------------|
| `avg_weekly_income` | How much the worker earns |
| `zone_id` | Which zone they operate in (label encoded) |
| `shift_id` | Morning / Peak / Night |
| `rain_intensity` | Current rainfall in mm/hr |
| `traffic_congestion` | 0–1 congestion index |
| `aqi_level` | Current AQI reading |
| `uv_index` | UV level |
| `claim_count` | How many payouts this worker has received (feeds into surcharge) |
| `total_payout_history` | Total ₹ paid out to this worker ever |

**What it outputs:**
- Predicted income loss in ₹
- Dynamic risk factor (clamped 2%–8% of weekly income)
- Worker premium = `risk_factor × income × 60%`
- Platform premium = `risk_factor × income × 40%`

**Claim history surcharge logic** — workers who claim more pay more:

| Claim Count | Surcharge Added to Risk Factor |
|-------------|-------------------------------|
| 0–1 claims | +0.000 |
| 2–3 claims | +0.003 |
| 4–5 claims | +0.006 |
| 6+ claims | +0.010 |
| Payouts > 3× weekly income | +0.004 additional |

**Model performance:** R² = 0.86 · MAE = ₹51 on test set

---

### 2. Fraud Detection Engine

Every payout is scored in real time before being surfaced to the admin. Four signals are checked:

| Signal | Fraud Score Added |
|--------|-----------------|
| GPS coordinates outside Bengaluru bounds | +60 |
| Rain/AQI/heat > 3σ above historical average | +30 to +40 |
| Multiple payouts within 2-minute window (different trigger types) | +50 |
| Payout amount above expected range (> ₹2000) | +25 |

- Score ≥ 80 → **HIGH** risk
- Score ≥ 40 → **MEDIUM** risk
- Flagged payouts shown on Admin dashboard for review

---

### 3. AI Risk Forecast Module (Admin Dashboard)

Runs the pricing model for every zone using live sensor data and displays a zone-level table with risk tier (LOW / MEDIUM / HIGH), predicted premium per worker, and 60-40 split breakdown. Updates on demand.

---

## The Oracle — Real-Time Sensor System

The Oracle polls live APIs every 15-30 seconds and decides whether a trigger threshold has been breached. It is what makes QShield truly parametric.

| Trigger | Threshold | Source | Type |
|---------|-----------|--------|------|
| Heavy Rain | ≥ 20 mm/hr | OpenWeatherMap API | Environmental |
| Extreme Heat | ≥ 42°C | OpenWeatherMap API | Environmental |
| Severe AQI | ≥ 350 | OpenAQ API | Environmental |
| Platform Outage | App downtime ≥ 3hrs | Status API (mocked) | Technical |
| Government Curfew | Active during 10am–10pm | Govt feed (mocked) | Social |

When a trigger fires → backend calls `POST /api/payout/create` for every eligible worker in the zone automatically.

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React (Vite), Plain CSS | Worker and Admin dashboards, live 30s polling |
| Backend | FastAPI (Python 3.11) | REST API, policy engine, payout orchestration |
| Database | PostgreSQL (Supabase) | Workers, payouts, policies, premiums tables |
| ORM | SQLAlchemy | Database models and queries |
| AI / ML | scikit-learn RandomForestRegressor | Dynamic premium pricing |
| Data | pandas, numpy | Feature engineering, synthetic data generation |
| Model Storage | joblib (.pkl files) | Save/load trained model |
| Weather | OpenWeatherMap API | Live rain, heat, UV data |
| AQI | OpenAQ API | Live air quality readings |
| Frontend Hosting | Vercel | Auto-deploys from GitHub |
| Backend Hosting | Render | FastAPI server, auto-deploys from GitHub |
| Database Hosting | Supabase | Managed PostgreSQL |
| API Docs | Swagger UI (/docs) | Built into FastAPI |

---

## Python Packages

| Package | Why |
|---------|-----|
| `fastapi` | Web framework for all API endpoints |
| `uvicorn` | ASGI server to run FastAPI |
| `sqlalchemy` | ORM for PostgreSQL |
| `psycopg2` | PostgreSQL driver |
| `pydantic` | Request/response validation |
| `scikit-learn` | RandomForestRegressor for the pricing model |
| `pandas` | Data manipulation and feature DataFrames |
| `numpy` | Numerical operations |
| `joblib` | Save and load .pkl model files |
| `httpx` / `requests` | Fetch live weather and AQI data |
| `python-dotenv` | Environment variable management |

---

## What Was Built, Phase by Phase

### Phase 1: Core Foundation
- Worker registration and login
- Policy creation (weekly coverage periods)
- Oracle trigger system - rain, heat, AQI, curfew, outage endpoints
- Worker dashboard showing coverage status and sensor readings
- Admin dashboard with worker list

### Phase 2: Automation
- Zero-touch automated payouts - oracle fires, payout creates, no human needed
- Payout cooldown - one payout per worker per trigger type per day (409 if duplicate)
- Wallet system - workers have a balance, premiums deducted from it
- Collect Premiums - admin deducts weekly premiums from all workers in one click
- Loss ratio on admin dashboard (total payouts ÷ total premiums)
- Polling-based UI - both dashboards refresh live data every 15–30s
- Animated UPI payment receipt modal shown to worker on settlement

### Phase 3: AI and Intelligence
- Random Forest model trained on 9 features including claim history
- Dynamic premium pricing - personalised per worker, not flat 8%
- Claim count tracking - every payout increments `claim_count` in DB
- Claim history surcharge - 6+ claims adds +1% risk factor
- AI Risk Forecast module on admin panel — zone-level risk tiers from live model
- Fraud detection engine - scores every payout, flags suspicious ones
- Wallet balance display on worker dashboard with transaction log
- Active Trigger column in Zone Table - derived from live oracle data
- Worker premium column reads actual DB value, not a client-side estimate

---

## Project Structure

```
QCommerce-Parametric-Insurance/
├── backend/
│   ├── app/
│   │   ├── api/              # worker_api.py, payout_api.py, premium_api.py, trigger routes
│   │   ├── models/           # models.py (SQLAlchemy), qshield_risk_model.pkl
│   │   ├── services/         # premium_service.py (AI pricing engine)
│   │   └── core/             # database.py
│   ├── data/                 # synthetic_worker_data.csv
│   ├── generate_synthetic_data.py
│   └── train_risk_model.py
└── frontend/
    └── src/
        ├── pages/            # AdminDashboard.jsx, HomePage.jsx, LoginPage.jsx
        ├── components/       # Admin_components/, Worker_components/
        └── services/         # api.js
```

---

## How to Run Locally

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

pip install -r requirements.txt
```

Create a `.env` file:
```
DATABASE_URL=postgresql://user:password@host/dbname
```

Train the AI model (only needed once):
```bash
python generate_synthetic_data.py
python train_risk_model.py
```

Start the server:
```bash
uvicorn app.main:app --reload
```

API docs: http://localhost:8000/docs

---

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

---

### Database — Adding New Columns

If you have an existing `workers` table, run these in your Postgres client (Supabase SQL editor):

```sql
ALTER TABLE workers ADD COLUMN IF NOT EXISTS claim_count INTEGER DEFAULT 0;
ALTER TABLE workers ADD COLUMN IF NOT EXISTS total_payout_received FLOAT DEFAULT 0.0;
```

---

## Testing the Full AI Pipeline

### Step 1: Register a worker
```bash
POST /api/worker/register
{
  "name": "TestWorker", "phone": "9999999999",
  "zone": "Koramangala", "income": 7000,
  "platform": "Swiggy", "password": "test123"
}
```
✅ `premium_weekly` should be ~₹171, not ₹560. If it's ₹171, the AI model is pricing correctly.

### Step 2: Build claim history (6 payouts, different trigger types)
```bash
POST /api/payout/create
{ "worker_id": <id>, "amount": 500, "trigger_type": "RAIN", "audit_msg": "test" }
# Repeat with HEAT, AQI, OUTAGE, CURFEW, then one more
```

### Step 3: Verify claim history updated
```bash
GET /api/worker/<id>
# Should show: "claim_count": 6, "total_payout_received": 3000
```

### Step 4: Collect premiums and verify surcharge
```bash
POST /api/worker/collect-premiums
# premium_deducted for your worker should now be > 171.27
# The +1% claim surcharge on 6 claims = ~₹42 more per week
```

---

## Key Accomplishments

| Feature | Why It Matters |
|---------|---------------|
| Zero-touch payouts | Oracle detects threshold breach and fires payout with no human in the loop |
| Dynamic AI pricing | Random Forest gives each worker a personalised premium based on 9 features |
| Claim history pricing | Workers who claim more pay higher premiums similar real insurance |
| Live fraud scoring | Every payout scored in real time against 4 signals, flagged to admin |
| Zone-level AI forecast | Admin sees predicted risk tier per zone from live model output |
| 60-40 co-pay model | Platform subsidises 40% of premium - financially modelled and enforced |
| Low-income protection | Workers earning < ₹4000/week get a 50-50 split instead of 60-40 |
| Full-stack end-to-end | React + FastAPI + PostgreSQL + ML model + live APIs are all connected |

---

## Known Limitations

- Premium deductions are not logged as separate DB records, only payout history is stored. A `premium_history` table would make the worker activity log more complete.
- Collect Premiums is manual (admin clicks a button). A scheduled job using APScheduler would automate this every Monday.
- The model was trained on synthetic data. Real-world accuracy would improve significantly with actual Bengaluru order and weather history.
- Curfew and outage triggers are mocked. Production versions would connect to government APIs and real platform status feeds.

---

## Note on "Zero-Touch"

The payout trigger is fully automated — no human initiates it. However, the premium collection step is currently manual (admin clicks Collect Premiums). A production deployment would automate this with a weekly scheduled job. The README previously described this as fully zero-touch, which was aspirational — the current implementation is zero-touch for payouts, manual for premium collection.

---

*Built by Team Zephyr*
*Guidewire DEVTrails University Hackathon 2026*
