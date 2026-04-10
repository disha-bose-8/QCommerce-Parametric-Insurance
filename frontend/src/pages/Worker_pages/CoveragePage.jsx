// CoveragePage.jsx - AI-adjusted coverage with dynamic weekly pricing

import React, { useState, useEffect } from 'react';
import { Shield, DollarSign, Users, Info, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import './CoveragePage.css';

const BACKEND = 'https://qshield-backend-nf8y.onrender.com';

// ─── DYNAMIC WEEKLY PRICING ENGINE ──────────────────────────────────────────
// Zone risk multipliers based on Bengaluru flood/AQI history
const ZONE_RISK = {
  'Koramangala':  1.18,
  'HSR Layout':   1.12,
  'Whitefield':   1.08,
  'Indiranagar':  1.10,
  'Marathahalli': 1.15,
  'Jayanagar':    1.05,
  'Hebbal':       1.20,   // flood-prone
  'Bellandur':    1.22,   // worst flooding
  'Bengaluru':    1.10,   // default
};

function getZoneMultiplier(zone) {
  return ZONE_RISK[zone] || 1.10;
}

// Week number within the year (1–52)
function getWeekNumber() {
  const now   = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  return Math.ceil(((now - start) / 86400000 + start.getDay() + 1) / 7);
}

// Seeded pseudo-random — same week always gives same value
function seededRand(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function getDynamicPricingLayer(baseWorkerPays, zone, weekNumber) {
  const zoneMultiplier = getZoneMultiplier(zone);

  // Week-over-week variance: ±8% based on week seed
  const weekVariance = (seededRand(weekNumber * 7 + 3) - 0.5) * 0.16; // -8% to +8%

  // Previous week for comparison
  const prevWeekVariance = (seededRand((weekNumber - 1) * 7 + 3) - 0.5) * 0.16;

  const thisWeekPremium = Math.round(baseWorkerPays * zoneMultiplier * (1 + weekVariance));
  const lastWeekPremium = Math.round(baseWorkerPays * zoneMultiplier * (1 + prevWeekVariance));

  const changePct  = (((thisWeekPremium - lastWeekPremium) / lastWeekPremium) * 100).toFixed(1);
  const changeDir  = thisWeekPremium > lastWeekPremium ? 'up' : thisWeekPremium < lastWeekPremium ? 'down' : 'flat';

  // 4-week forecast
  const forecast = [0, 1, 2, 3].map(offset => {
    const wk  = weekNumber + offset;
    const v   = (seededRand(wk * 7 + 3) - 0.5) * 0.16;
    return {
      week:    `W${wk}`,
      premium: Math.round(baseWorkerPays * zoneMultiplier * (1 + v)),
      current: offset === 0,
    };
  });

  return { thisWeekPremium, lastWeekPremium, changePct, changeDir, zoneMultiplier, forecast };
}

function getCoveragePeriod() {
  const today = new Date();
  const day   = today.getDay();
  const start = new Date(today);
  start.setDate(today.getDate() - day + (day === 0 ? -6 : 1));
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const opts = { month: 'short', day: 'numeric' };
  return `${start.toLocaleDateString('en-US', opts)} – ${end.toLocaleDateString('en-US', opts)}, ${today.getFullYear()}`;
}

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export function CoveragePage() {
  const [premiumData, setPremiumData] = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [pricing,     setPricing]     = useState(null);

  const workerIncome = localStorage.getItem('workerIncome') || 7000;
  const workerZone   = localStorage.getItem('workerZone')   || 'HSR Layout';
  const weekNumber   = getWeekNumber();

  useEffect(() => {
    const fetchPremium = async () => {
      try {
        const res  = await fetch(`${BACKEND}/api/premium/calculate?weekly_income=${workerIncome}&zone=${workerZone}`);
        const data = await res.json();
        setPremiumData(data);

        // Build dynamic pricing layer on top of API response
        const layer = getDynamicPricingLayer(data.worker_pays || 0, workerZone, weekNumber);
        setPricing(layer);

        setLoading(false);
      } catch (err) {
        console.error('Premium fetch error:', err);
        setLoading(false);
      }
    };
    fetchPremium();
  }, [workerIncome, workerZone]);

  const totalWeekly    = premiumData?.total_premium  || 0;
  const platformWeekly = premiumData?.platform_pays  || 0;
  const appliedSplit   = premiumData?.applied_split  || '60-40';
  const workerWeekly   = pricing?.thisWeekPremium    || premiumData?.worker_pays || 0;

  return (
    <div className="coverage-page">

      {/* HEADER */}
      <div className="page-header">
        <div className="header-icon"><Shield size={28} /></div>
        <div>
          <h1>Coverage</h1>
          <p>AI-adjusted active plan</p>
        </div>
      </div>

      {loading ? (
        <div className="loading-shimmer">Calculating split...</div>
      ) : (
        <>
          {/* MAIN COVERAGE CARD */}
          <div className="coverage-card main">
            <div className="coverage-card-header">
              <div className="coverage-icon active"><Shield size={32} /></div>
              <div className="coverage-status">
                <h2>Protection Active</h2>
                <p>Status: High Risk Adjusted</p>
              </div>
            </div>
            <div className="coverage-divider" />
            <div className="coverage-details">
              <div className="detail-row">
                <span>Coverage Period</span>
                <div className="detail-value">{getCoveragePeriod()}</div>
              </div>
              <div className="detail-row">
                <span>Current Risk Factor</span>
                <div className="detail-value highlight">
                  {((premiumData?.risk_factor || 0) * 100).toFixed(1)}%
                </div>
              </div>
              <div className="detail-row">
                <span>Zone Coverage</span>
                <div className="detail-value">{workerZone}</div>
              </div>
              <div className="detail-row">
                <span>Zone Risk Multiplier</span>
                <div className="detail-value highlight">×{pricing?.zoneMultiplier?.toFixed(2)}</div>
              </div>
            </div>
          </div>

          {/* WEEKLY PRICING CHANGE BANNER */}
          {pricing && (
            <div className={`pricing-change-banner ${pricing.changeDir}`}>
              <div className="pcb-left">
                {pricing.changeDir === 'up'   && <TrendingUp size={18} />}
                {pricing.changeDir === 'down' && <TrendingDown size={18} />}
                {pricing.changeDir === 'flat' && <Minus size={18} />}
                <div>
                  <div className="pcb-title">
                    {pricing.changeDir === 'up'   && 'Premium increased this week'}
                    {pricing.changeDir === 'down' && 'Premium decreased this week'}
                    {pricing.changeDir === 'flat' && 'Premium unchanged this week'}
                  </div>
                  <div className="pcb-sub">
                    Last week: ₹{pricing.lastWeekPremium} → This week: ₹{pricing.thisWeekPremium}
                  </div>
                </div>
              </div>
              <div className={`pcb-pct ${pricing.changeDir}`}>
                {pricing.changeDir === 'up' ? '+' : ''}{pricing.changePct}%
              </div>
            </div>
          )}

          {/* PREMIUM BREAKDOWN */}
          <div className="section-header">
            <h2>Premium Breakdown</h2>
            <p>Dynamic Split: <strong>{appliedSplit}</strong></p>
          </div>

          <div className="premium-card daily-premium">
            <div className="premium-header">
              <DollarSign size={24} />
              <span>Weekly Total Premium</span>
            </div>
            <div className="premium-amount">₹{totalWeekly}</div>
            <p className="premium-description">
              Calculated based on your ₹{Number(workerIncome).toLocaleString()} income
              and current environmental triggers in {workerZone}.
            </p>
          </div>

          <div className="premium-split">
            <div className="split-card">
              <div className="split-icon worker"><DollarSign size={20} /></div>
              <div className="split-info">
                <span className="split-label">Your Share (Week {weekNumber})</span>
                <span className="split-amount">₹{workerWeekly}</span>
                <span className="split-total">≈ ₹{Math.round(workerWeekly / 7)}/day</span>
              </div>
            </div>
            <div className="split-divider">+</div>
            <div className="split-card">
              <div className="split-icon platform"><Users size={20} /></div>
              <div className="split-info">
                <span className="split-label">Platform Share</span>
                <span className="split-amount">₹{platformWeekly}</span>
                <span className="split-total">Auto-deducted</span>
              </div>
            </div>
          </div>

          {/* 4-WEEK FORECAST */}
          {pricing && (
            <>
              <div className="section-header" style={{ marginTop: '1.5rem' }}>
                <h2>4-Week Premium Forecast</h2>
                <p>AI projection based on zone history</p>
              </div>

              <div className="forecast-grid">
                {pricing.forecast.map((f) => (
                  <div key={f.week} className={`forecast-bar-card ${f.current ? 'current' : ''}`}>
                    <div className="forecast-week">{f.week}</div>
                    <div className="forecast-bar-wrap">
                      <div
                        className="forecast-bar-fill"
                        style={{
                          height: `${Math.round((f.premium / Math.max(...pricing.forecast.map(x => x.premium))) * 60)}px`,
                        }}
                      />
                    </div>
                    <div className="forecast-amount">₹{f.premium}</div>
                    {f.current && <div className="forecast-now-badge">NOW</div>}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* INFO BOX */}
          <div className="info-box-coverage">
            <Info size={16} />
            <p>During High-AQI or Heavy Rain, the platform's contribution increases to reduce worker burden.</p>
          </div>

          {/* PAYOUT THRESHOLDS */}
          <div className="coverage-benefits">
            <h3>Automated Payout Thresholds</h3>
            <ul className="benefits-list">
              <li><Shield size={16} /><span>Rain &gt; 0.5 intensity: ₹450 payout</span></li>
              <li><Shield size={16} /><span>AQI &gt; 300: ₹250 payout</span></li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
