# AI-Powered Parametric Income Protection
## For Q-Commerce Delivery Partners


---

## Problem

Q-commerce delivery partners earn on a daily basis, and their income depends directly on order volume and uninterrupted operations. Even a single disruption-day can significantly affect their weekly earnings.

Their income is especially vulnerable to:

- Heavy rainfall
- Extreme heat
- Severe AQI
- Government-declared curfews
- Platform outages

Today, delivery partners absorb the full financial impact of these external disruptions.

We propose an AI-driven, weekly parametric income protection system that automatically compensates verified income loss events without manual claims.

This model strictly follows hackathon requirements:

- Weekly pricing structure
- Loss-of-income-only coverage
- Automated parametric triggering

---

## Target Persona

**Q-Commerce Delivery Partner** (Zepto / Blinkit / Swiggy Instamart)

- Earns daily wages tied to order volume
- Operates in hyperlocal urban zones
- Highly exposed to environmental conditions
- Plans finances week-to-week

---

## Persona-Based Scenario

> A Q-commerce delivery partner operating in a hyperlocal zone begins the week with active coverage. On Tuesday, rainfall in the zone exceeds 80mm within 24 hours. Simultaneously, order volume drops by 30% compared to the rolling 4-week weekday average.
>
> The system automatically validates both conditions, classifies the day as a disruption-day, and credits one daily baseline payout to the worker. No manual claim submission is required.

---

## Coverage Model

- Weekly micro-policy (Monday–Sunday)
- Premium calculated before the coverage week begins
- Payout issued per verified disruption-day
- Maximum payout capped at 2 disruption-days per week
- No stacking of multiple triggers on the same day
- Coverage scope: loss of income only — no health, vehicle repair, or accident claims

---

## Application Workflow

1. Worker registers and links earnings data
2. System calculates rolling 4-week baseline income
3. AI estimates weekly disruption probabilities
4. Weekly premium is calculated and displayed
5. Premium is auto-deducted before the coverage week begins
6. Real-time monitoring of environmental and platform triggers
7. If conditions are met, payout is automatically processed
8. Worker dashboard updates with payout details and coverage status

---

## Parametric Trigger Design

### Environmental Triggers (Dual Validation Required)

A disruption-day is activated only when **both** conditions are met simultaneously:

1. An environmental threshold is crossed
2. Zone order volume drops ≥ 25% compared to the rolling 4-week weekday average

| Trigger | Threshold | Source |
|---|---|---|
| Heavy Rain | ≥ 80mm / 24h | OpenWeatherMap API |
| Extreme Heat | ≥ 42°C sustained | OpenWeatherMap API |
| Severe AQI | AQI ≥ 350 | CPCB / OpenAQ API |

### Social & Technical Triggers (Single Validation)

| Trigger | Threshold | Source |
|---|---|---|
| Official Curfew | Government restriction ≥ 6 hours | Govt feed (mocked) |
| Platform Outage | App/server downtime ≥ 3 hours | Platform status API (mocked) |

---

## Payout Model

- Baseline income = Rolling 4-week average weekly income
- Daily baseline = Weekly income ÷ 7
- Each verified disruption-day = 1 daily baseline payout
- Maximum weekly payout = 2 disruption-days

**Example:**

| Parameter | Value |
|---|---|
| Weekly income | ₹5,600 |
| Daily baseline | ₹800 |
| Rain disruption-day payout | ₹800 |
| Maximum weekly payout | ₹1,600 (2 days) |

---

## AI-Based Weekly Premium Calculation

Phase 1 uses a rule-based approximation for disruption probability. Phase 2 will introduce a trained ML model (logistic regression baseline, with XGBoost as a target) using features such as historical weather patterns, zone AQI trends, and order volume data.

The premium calculation incorporates:

- Daily income baseline
- Probability of disruption
- Expected number of trigger-days within the week

### Formula

```
Expected Loss  =  Daily Income × Probability × Trigger Days
Premium        =  Expected Loss + 20% sustainability buffer
```

**Where:**
- **Daily Income** = Rolling 4-week weekly baseline ÷ 7
- **Probability** = Likelihood of disruption occurring on a given day
- **Trigger Days** = Total potential exposure days within the week (maximum 7)

**Example:**

| Variable | Value |
|---|---|
| Daily Income | ₹800 |
| Rain probability (per day) | 20% |
| Trigger Days | 7 |
| Expected Loss | 800 × 0.20 × 7 = ₹1,120 |
| 20% Buffer | ₹224 |
| **Weekly Premium** | **₹1,344** |

---

## 60–40 Co-Pay Model

- Worker contributes **60%** of premium
- Platform (Zepto/Blinkit) contributes **40%** of premium

This shared model ensures adoption stability, risk pooling balance, and financial sustainability.

---

## AI & Fraud Controls

**Proof-of-Disruption Engine** — multi-signal validation before any disruption-day is confirmed:

- Weather API data
- Satellite rainfall verification
- Traffic slowdown indicators
- Platform order density drop
- Official curfew/event data
- Disruption confirmed only when multiple signals align

**Additional Safety Controls:**

- Weekly payout cap (max 2 days)
- No stacking of multiple triggers per day
- Zone locking for coverage week
- Minimum prior activity requirement
- No manual claim submissions
- Z-score anomaly detection on claim frequency per worker vs zone baseline

---

## Analytics Dashboard

### Worker Dashboard

| Metric | Description |
|---|---|
| Active Coverage Status | Policy active/inactive with current week period shown |
| Premium Paid | This week's total with 60/40 co-pay breakdown |
| Earnings Protected | Cumulative payout received — current week + historical |
| Disruption-Day Log | List of triggered days with trigger type and payout amount |
| Remaining Payout Capacity | 0 / 1 / 2 days left this week |
| Zone Risk Forecast | AI-predicted disruption probability for the next 3 days |

### Admin / Insurer Dashboard

| Metric | Description |
|---|---|
| Active Policies | Total enrolled workers and weekly premium pool size |
| Loss Ratio (weekly) | Total payouts ÷ total premiums collected |
| Disruption Frequency by Zone | Heatmap of trigger events across city zones |
| Fraud Flags | Workers with anomalous claim patterns vs zone baseline |
| Predictive Payout Forecast | Next-week expected claims based on weather outlook |
| Premium Adequacy Tracker | Expected loss vs actual loss per zone |

---

## System Architecture

| Layer | Technology | Responsibility |
|---|---|---|
| Frontend | React (Web) | Worker and Admin dashboards |
| Backend | FastAPI (Python) | Policy engine, trigger validation, payout orchestration |
| Database | PostgreSQL | Workers, policies, payouts, trigger event logs |
| AI / ML Layer | Python — scikit-learn | Risk modeling and anomaly detection |
| Weather API | OpenWeatherMap (free tier / mocked) | Real-time and historical weather data |
| Order Data API | Platform API (mocked) | Zone-level order volume feed |
| Payments | Razorpay Test Mode | Simulated payout disbursement |

### Platform Choice Justification

We chose a web-first architecture for Phase 1 due to faster development cycles, easier API integration, and simplified dashboard management. The backend architecture is platform-agnostic and can support mobile applications in subsequent phases.

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React (Web Dashboard) |
| Backend | FastAPI (Python) |
| Database | PostgreSQL |
| AI Layer | Python (scikit-learn) |
| External APIs | Weather API (mocked), Platform Order API (mocked) |
| Payments | Razorpay Test Mode (simulated payout) |

---

## Business Viability

- **Revenue model:** Premium pool — insurer retains surplus after payouts and costs
- **Weekly exposure cap** limits worst-case loss per policy to 2 disruption-days
- **Probability-based pricing** ensures premiums reflect actual risk per zone
- **Scalable zone-based deployment** allows actuarial tuning per geography
- **B2B2C approach:** Platforms subsidise 40% of premium as a worker retention benefit

---

## Development Roadmap

| Phase | Timeline | What We Build |
|---|---|---|
| **Phase 1 — Seed** | Mar 4–20 | System design document, premium formula, trigger definitions, basic web prototype with mock data, worker and admin dashboard (static) |
| **Phase 2 — Scale** | Mar 21–Apr 4 | Worker registration flow, live policy creation, dynamic premium engine, 3–5 real API triggers connected, claims automation, Razorpay sandbox payouts |
| **Phase 3 — Soar** | Apr 5–17 | Advanced fraud detection, full analytics dashboard, predictive payout forecasting, mobile-responsive UI, 5-minute demo video, final pitch deck (PDF) |

---

## Repo Structure

```
QCommerce-Parametric-Insurance/
├── README.md
├── docs/phase1/              ← Idea document PDF
├── frontend/src/             ← React web app
├── backend/app/              ← FastAPI service
├── ml/                       ← Risk model and notebooks
├── mocks/                    ← Mock API JSON files
└── docker-compose.yml
```

---

## Core Value Proposition

> A financially sustainable, AI-powered parametric income stabiliser designed specifically for Q-commerce delivery workers — protecting weekly earnings from measurable external disruptions with zero manual friction.

---
