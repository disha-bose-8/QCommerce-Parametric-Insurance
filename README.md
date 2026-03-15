# ShieldPay — AI-Powered Parametric Income Protection
### For Q-Commerce Delivery Partners

> An AI-driven, weekly parametric income protection system that automatically compensates gig workers for verified income loss events — with zero manual claims.

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

**Q-Commerce Delivery Partner (Zepto / Blinkit / Swiggy Instamart)**

- Earns daily wages tied to order volume
- Operates in hyperlocal urban zones
- Highly exposed to environmental conditions
- Plans finances week-to-week

---

## Persona-Based Scenario

A Q-commerce delivery partner operating in a hyperlocal zone begins the week with active coverage. On Tuesday, rainfall in the zone exceeds 20mm/hour (IMD heavy rain threshold). Simultaneously, order volume drops by 30% compared to the rolling 4-week weekday average.

The system automatically validates both conditions, classifies the day as a disruption-day, and credits one daily payout to the worker. No manual claim submission is required.

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
2. System calculates rolling 4-week baseline income (weekday and weekend baselines tracked separately)
3. Eligibility check: ≥ 3 active delivery days in the prior week
4. AI estimates weekly disruption probabilities
5. Weekly premium is calculated and displayed
6. Premium is auto-deducted before the coverage week begins
7. Real-time monitoring of environmental and platform triggers
8. If conditions are met, payout is automatically processed
9. Worker dashboard updates with payout details and coverage status

---

## Parametric Trigger Design

### Environmental Triggers — Dual Validation Required

A disruption-day is activated only when both conditions are met simultaneously:

1. An environmental threshold is crossed
2. Zone order volume drops ≥ 25% compared to the rolling 4-week baseline (weekday and weekend baselines tracked separately)

| Trigger | Threshold | Rationale | Source |
|---|---|---|---|
| Heavy Rain | ≥ 20mm/hour | IMD "heavy rain" definition — operationally disrupts deliveries | OpenWeatherMap API |
| Extreme Heat | ≥ 42°C sustained | Dangerous outdoor working conditions | OpenWeatherMap API |
| Severe AQI | AQI ≥ 350 | Hazardous per CPCB classification | CPCB / OpenAQ API |

### Social & Technical Triggers — Single Validation

| Trigger | Threshold | Source |
|---|---|---|
| Official Curfew | Government restriction covering peak delivery hours (10am–10pm) | Govt feed (mocked) |
| Platform Outage | App/server downtime ≥ 3 hours | Platform status API (mocked) |

---

## Payout Model

| Parameter | Value |
|---|---|
| Baseline income | Rolling 4-week average weekly income |
| Daily baseline | Weekly income ÷ 7 |
| Per disruption-day payout | 50% of daily baseline |
| Maximum weekly payout | 2 disruption-days |

**Example:**

| Parameter | Value |
|---|---|
| Weekly income | ₹5,600 |
| Daily baseline | ₹800 |
| Per disruption-day payout | ₹400 |
| Maximum weekly payout | ₹800 (2 days) |

---

## Premium Model

Premiums are priced at **3–5% of weekly income** — the industry benchmark for accessible gig worker parametric coverage.

```
Affordable Premium  =  Weekly Income × 5%
Worker pays (60%)   =  Premium × 0.60
Platform pays (40%) =  Premium × 0.40
```

**Example:**

| Parameter | Value |
|---|---|
| Weekly income | ₹5,600 |
| Total weekly premium | ₹280 |
| Worker contribution (60%) | ₹168/week ≈ ₹24/day |
| Platform contribution (40%) | ₹112/week |

### 60–40 Co-Pay Model

Worker contributes 60% of premium, platform (Zepto/Blinkit) contributes 40%. This shared model ensures adoption stability, risk pooling balance, and financial sustainability. Platforms benefit by reducing worker churn during disruption events.

---

## AI-Based Weekly Premium Calculation

Phase 1 uses a rule-based approximation for disruption probability. Phase 2 will introduce a trained ML model (logistic regression baseline, with XGBoost as a target) using features such as historical weather patterns, zone AQI trends, and order volume data.

The premium calculation is grounded in the **3–5% of weekly income** benchmark for parametric gig worker coverage, ensuring the premium is always affordable relative to earnings.

---

## AI & Fraud Controls

**Proof-of-Disruption Engine** — multi-signal validation before any disruption-day is confirmed:

- Weather API data
- Satellite rainfall verification
- Traffic slowdown indicators
- Platform order density drop
- Official curfew/event data

Disruption confirmed only when multiple signals align.

**Additional Safety Controls:**

- Weekly payout cap (max 2 days)
- No stacking of multiple triggers per day
- Zone locking for coverage week
- Minimum prior activity requirement: ≥ 3 active delivery days in the prior week
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
| Frontend | React (Vite) | Worker and Admin dashboards |
| Backend | FastAPI (Python) | Policy engine, trigger validation, payout orchestration |
| Database | PostgreSQL | Workers, policies, payouts, trigger event logs |
| AI / ML Layer | Python — scikit-learn | Risk modelling and anomaly detection |
| Weather API | OpenWeatherMap (free tier / mocked) | Real-time and historical weather data |
| Order Data API | Platform API (mocked) | Zone-level order volume feed |
| Payments | Razorpay Test Mode | Simulated payout disbursement |

---

## Platform Choice Justification

We chose a web-first architecture for Phase 1 due to faster development cycles, easier API integration, and simplified dashboard management. The backend architecture is platform-agnostic and can support mobile applications in subsequent phases.

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite) |
| Backend | FastAPI (Python 3.11+) |
| Database | PostgreSQL 15 |
| AI Layer | Python — scikit-learn, pandas |
| External APIs | OpenWeatherMap, OpenAQ, Razorpay (all mocked in Phase 1) |

---

## Business Viability

- Revenue model: Premium pool — insurer retains surplus after payouts and costs
- Weekly exposure cap limits worst-case loss per policy to 2 disruption-days
- Probability-based pricing ensures premiums reflect actual risk per zone
- Scalable zone-based deployment allows actuarial tuning per geography
- B2B2C approach: Platforms subsidise 40% of premium as a worker retention benefit

---

## Development Roadmap

| Phase | Timeline | What We Build |
|---|---|---|
| Phase 1 — Seed | Mar 4–20 | System design, premium formula, trigger definitions, basic web prototype with mock data, worker and admin dashboard |
| Phase 2 — Scale | Mar 21–Apr 4 | Worker registration, live policy creation, dynamic premium engine, 3–5 real API triggers, claims automation, Razorpay sandbox |
| Phase 3 — Soar | Apr 5–17 | Advanced fraud detection, full analytics, predictive forecasting, mobile-responsive UI, demo video, pitch deck |

---

## Core Value Proposition

> A financially sustainable, AI-powered parametric income stabiliser designed specifically for Q-commerce delivery workers — protecting weekly earnings from measurable external disruptions with zero manual friction.

