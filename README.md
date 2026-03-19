# QShield — AI-Powered Parametric Income Protection
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

Phase 1 uses a rule-based seasonal probability model to estimate disruption likelihood per zone — monsoon months get higher weight, known high-risk zones get a modifier. Phase 2 replaces this with a logistic regression model trained on historical weather, AQI, and order volume data, with XGBoost as the target architecture.

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

---

## Getting Started - Adversarial Defense & Anti-Spoofing Strategy

### The Threat Model

A coordinated syndicate of workers uses GPS-spoofing apps to fake their location inside a declared weather disruption zone while remaining safely at home — triggering mass false payouts and draining the liquidity pool.

### Why Our Architecture Is Already Harder To Exploit

The most important thing to note: **ShieldPay never triggers a payout based on a worker's GPS location.** Triggers are zone-level, not worker-level. The system asks "is it raining heavily in Zone X?" — not "is this worker standing in rain?" This eliminates the most basic form of GPS spoofing entirely. A worker cannot fake their way into a payout by spoofing their coordinates because their coordinates are never the trigger input.

What a bad actor would actually need to fake is a zone-wide order volume collapse — which requires manipulating platform-level data across hundreds of orders simultaneously, not just their own GPS.

---

### 1. The Differentiation — Genuine Worker vs. Bad Actor

Our AI/ML layer differentiates between a genuinely stranded worker and a bad actor using **behavioral fingerprinting** across three dimensions:

**Activity pattern before the disruption event**
A genuine worker shows a natural trailing-off of completed orders as conditions worsen — order velocity drops gradually as the weather escalates. A spoofing worker shows an abrupt flat-zero from the start of the disruption window with no gradual decline, because they were never working to begin with.

**Device and session signals**
- App session activity during the claimed disruption window — is the delivery app open and actively pinging? A genuine worker stuck in rain will have an active session with GPS drift consistent with being stationary in one location. A spoofer's GPS trace is often suspiciously perfect — fixed coordinates with no natural drift, or coordinates that jump in ways inconsistent with how someone actually moves in a storm.
- Battery drain and network signal patterns — extreme weather correlates with poor network signal. A worker reporting to be in a flood zone with a perfect 5-bar LTE signal is an anomaly worth flagging.

**Zone-level cross-validation**
Environmental triggers require a dual validation: the weather API must confirm the threshold AND zone-wide order volume must drop ≥ 25% vs the 4-week rolling baseline. A syndicate cannot fake the weather API. They can attempt to suppress orders by coordinating refusals — but a sudden coordinated refusal spike across a zone from a cluster of workers is itself a detectable anomaly, not a cover.

---

### 2. The Data — What We Analyze To Detect A Fraud Ring

Beyond GPS coordinates, our fraud detection layer analyzes the following signals:

| Signal | What It Catches |
|---|---|
| Claim timing correlation | Multiple workers in the same zone submitting within seconds of each other — genuine disruptions cause spread-out responses, not synchronized ones |
| Historical claim rate per worker vs zone baseline | Z-score anomaly detection — workers whose claim rate is statistically improbable compared to peers in the same zone |
| Order activity gap before disruption | Workers with zero delivery activity in the 2 hours before a disruption event are flagged — genuine workers are typically mid-shift when weather hits |
| Device GPS drift pattern | Spoofed GPS coordinates show unnatural precision and lack the micro-movement noise of a real device being carried |
| Social graph clustering | Workers who consistently claim on the same days, in the same zones, with no history of independent claim patterns — suggests coordination |
| Enrollment timing vs forecast | Workers who enroll just before a high-probability disruption forecast (surge enrolments 24–48 hours before a rain event) trigger elevated scrutiny |

The Z-score anomaly model is already part of our existing fraud controls layer — this simply extends it with the above features.

---

### 3. The UX Balance — Flagging Without Penalizing Honest Workers

False positives are a real risk. A genuine worker in a flood zone may have poor GPS signal, inconsistent app activity, and unusual behavior — precisely because they are in a genuine emergency. Our system handles this with a **tiered response, not a binary block**:

**Tier 1 — Auto-approved (low anomaly score)**
All signals align. Payout is processed automatically within minutes. No friction for the worker.

**Tier 2 — Soft flag (moderate anomaly score)**
Payout is held for up to 24 hours pending a lightweight passive review — no action required from the worker. The system checks if zone-level signals continue to corroborate the claim over the next few hours. If they do, payout auto-releases. The worker sees "Payout under verification — expected within 24 hours" in their dashboard, not a rejection.

**Tier 3 — Hard flag (high anomaly score)**
Payout is held and the worker receives a non-accusatory prompt: "We need to verify your activity for this disruption day. Please confirm you were active in [Zone X] on [Date]." One-tap confirmation with a passive check of app session logs. If confirmed, payout releases. If the worker cannot be verified, the claim is escalated to manual review — not auto-rejected.

**The key principle:** the system never accuses a worker or denies a payout without evidence. A genuine network drop in bad weather is a known edge case — the 24-hour soft hold exists precisely to give the system time to gather corroborating signals before making a decision. Honest workers lose at most 24 hours. Bad actors are caught by the pattern across multiple claims over time, not by a single-event block.

---

### What This Means For The Liquidity Pool

A coordinated syndicate of 500 workers would need to:
1. All be enrolled with ≥ 3 active days last week (can't mass-enroll day-of)
2. Trigger a real zone-level order volume collapse (requires platform-side manipulation, not just GPS)
3. Maintain individually natural behavioral fingerprints across all 500 accounts simultaneously
4. Not trigger the social graph clustering detector by claiming in sync

This raises the cost of a coordinated attack from "download a GPS spoofer" to "orchestrate a platform-level data manipulation while maintaining individual behavioral cover across 500 accounts." That is not a realistic attack surface for a Telegram syndicate.


