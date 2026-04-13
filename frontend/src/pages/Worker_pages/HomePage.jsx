// HomePage.jsx - Worker Dashboard

import React, { useState, useEffect, useRef } from 'react';
import {
  Shield, TrendingUp, MapPin, Bell, Loader2,
  Globe, Sun, Activity, CheckCircle, AlertTriangle, X, Wallet, CreditCard,
} from 'lucide-react';
import { CircularProgress } from '../../components/Worker_components/CircularProgress';
import LiveRiskTracker from '../../components/Worker_components/LiveRiskTracker';
import './HomePage.css';

const BACKEND = 'https://qshield-backend-nf8y.onrender.com';

// ─── FRAUD HELPERS ────────────────────────────────────────────────────────────

const CITY_BOUNDS = { latMin: 12.83, latMax: 13.14, lonMin: 77.46, lonMax: 77.75 };
const HISTORICAL_BASELINES = {
  rain: { avgMM: 3.2, stdDev: 2.1 },
  aqi:  { avgAQI: 95, stdDev: 30 },
  heat: { avgTemp: 31, stdDev: 3 },
};

function isGPSSpoofed(lat, lon) {
  return (
    lat < CITY_BOUNDS.latMin || lat > CITY_BOUNDS.latMax ||
    lon < CITY_BOUNDS.lonMin || lon > CITY_BOUNDS.lonMax
  );
}

function isWeatherAnomaly(triggerData) {
  const flags = [];
  const rain = triggerData.rain?.raw_value || 0;
  const aqi  = triggerData.aqi?.raw_value  || 0;
  const heat = triggerData.heat?.raw_value || 0;
  if (rain > HISTORICAL_BASELINES.rain.avgMM + 3 * HISTORICAL_BASELINES.rain.stdDev)
    flags.push(`Rain ${rain}mm far exceeds April historical avg`);
  if (aqi > HISTORICAL_BASELINES.aqi.avgAQI + 3 * HISTORICAL_BASELINES.aqi.stdDev)
    flags.push(`AQI ${aqi} far exceeds historical avg`);
  if (heat > HISTORICAL_BASELINES.heat.avgTemp + 3 * HISTORICAL_BASELINES.heat.stdDev)
    flags.push(`Temp ${heat}°C far exceeds April avg`);
  return flags;
}

// ─── PAYOUT MODAL ─────────────────────────────────────────────────────────────

function PayoutModal({ amount, workerName, upiId, onClose }) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 1200);
    const t2 = setTimeout(() => setStage(2), 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const stages = [
    { label: 'Initiating Transfer...', icon: '⚡', color: '#f59e0b' },
    { label: 'Processing via UPI...',  icon: '🔄', color: '#3b82f6' },
    { label: 'Amount Credited!',       icon: '✅', color: '#00ff88' },
  ];
  const current = stages[stage];

  return (
    <div className="modal-overlay">
      <div className="payout-modal">
        <button className="modal-close" onClick={onClose}><X size={18} /></button>
        <div className="modal-brand">
          <span className="brand-r">Q</span>
          <span className="brand-pay">Shield Pay</span>
        </div>
        <div className="modal-amount">₹{amount.toLocaleString()}</div>
        <div className="modal-label">Parametric Settlement</div>
        <div className="modal-progress-track">
          {stages.map((s, i) => (
            <div key={i} className={`modal-step ${i <= stage ? 'done' : ''} ${i === stage ? 'active' : ''}`}>
              <div className="step-dot" style={{ borderColor: i <= stage ? current.color : '#334155' }}>
                {i < stage  && <CheckCircle size={14} color="#00ff88" />}
                {i === stage && <span className="dot-pulse" style={{ background: current.color }} />}
              </div>
              <span className="step-label">{s.label}</span>
            </div>
          ))}
        </div>
        <div className="modal-status" style={{ color: current.color }}>
          <span className="modal-stage-icon">{current.icon}</span>
          {current.label}
        </div>
        {stage === 2 && (
          <div className="modal-upi-block">
            <div className="upi-row"><span className="upi-key">UPI ID</span><span className="upi-val">{upiId}</span></div>
            <div className="upi-row"><span className="upi-key">Ref No.</span><span className="upi-val">QSH{Date.now().toString().slice(-8)}</span></div>
            <div className="upi-row"><span className="upi-key">Mode</span><span className="upi-val">IMPS / UPI</span></div>
            <div className="success-stamp">SETTLED ✓</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── WALLET CARD ──────────────────────────────────────────────────────────────

function WalletCard({ walletBalance, premiumWeekly, payoutHistory }) {
  // Derive recent premium deductions from payout history: negative "PREMIUM" entries
  // Since the backend deducts from wallet on collect-premiums (not logged as payouts),
  // we show the current balance + weekly premium cost as a deduction preview.
  const premiumDeductions = payoutHistory.filter(p =>
    p.trigger_type === 'PREMIUM' || p.notes?.includes?.('premium')
  );

  return (
    <div className="wallet-card">
      <div className="wallet-header">
        <Wallet size={20} color="#00ff88" />
        <h3>Wallet Balance</h3>
      </div>

      <div className="wallet-balance-row">
        <span className="wallet-amount">₹{walletBalance.toLocaleString()}</span>
        <span className="wallet-label">Available</span>
      </div>

      <div className="wallet-premium-row">
        <CreditCard size={15} color="#f59e0b" />
        <span className="wallet-premium-label">Weekly Premium</span>
        <span className="wallet-premium-value" style={{ color: '#f59e0b' }}>
          − ₹{premiumWeekly.toLocaleString()}
        </span>
      </div>

      <div className="wallet-after-row">
        <span className="wallet-after-label">Balance after next deduction</span>
        <span className="wallet-after-value">
          ₹{Math.max(0, walletBalance - premiumWeekly).toLocaleString()}
        </span>
      </div>

      {/* Premium deduction history */}
      <div className="premium-deduction-log">
        <div className="deduction-log-title">Recent Activity</div>
        {payoutHistory.length === 0 ? (
          <div className="deduction-empty">No transactions yet</div>
        ) : (
          payoutHistory.slice(0, 5).map((p, i) => {
            const isPremium = p.trigger_type === 'PREMIUM';
            const date      = new Date(p.created_at).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'short',
            });
            return (
              <div key={p.id || i} className="deduction-row">
                <div className="deduction-left">
                  <span className={`deduction-icon ${isPremium ? 'deduction-out' : 'deduction-in'}`}>
                    {isPremium ? '↓' : '↑'}
                  </span>
                  <div>
                    <span className="deduction-type">
                      {isPremium ? 'Premium Deducted' : `Payout — ${p.trigger_type}`}
                    </span>
                    <span className="deduction-date">{date}</span>
                  </div>
                </div>
                <span
                  className="deduction-amount"
                  style={{ color: isPremium ? '#ef4444' : '#00ff88' }}
                >
                  {isPremium ? '−' : '+'}₹{(p.amount || 0).toLocaleString()}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

const recentAlerts = [
  { id: 1, message: 'Heavy rain detected in your zone', time: '2 hours ago' },
  { id: 2, message: 'Platform downtime monitoring',     time: '5 hours ago' },
];

export function HomePage() {
  const [riskData,     setRiskData]     = useState(null);
  const [triggerData,  setTriggerData]  = useState({ rain: null, heat: null, aqi: null, curfew: null, outage: null });
  const [loading,      setLoading]      = useState(true);
  const [showModal,    setShowModal]    = useState(false);
  const [fraudFlags,   setFraudFlags]   = useState([]);
  const [todayPayout,  setTodayPayout]  = useState(null);
  // Wallet state — initialised from localStorage (set at login)
  const [walletBalance, setWalletBalance] = useState(
    Number(localStorage.getItem('walletBalance')) || 0
  );
  const [payoutHistory, setPayoutHistory] = useState([]);

  const lastTriggerTime = useRef(null);

  // ── Worker data from localStorage ──
  const workerId     = Number(localStorage.getItem('workerId'))    || null;
  const workerName   = localStorage.getItem('workerName')          || 'Worker';
  const workerZone   = localStorage.getItem('workerZone')          || 'Bengaluru';
  const workerIncome = Number(localStorage.getItem('workerIncome')) || 7000;
  const premiumWeekly = Number(localStorage.getItem('premiumWeekly')) || Math.round(workerIncome * 0.08);
  const upiId        = localStorage.getItem('upiId')               || `${workerName.toLowerCase()}@upi`;

  const payoutAmount = Math.round(workerIncome / 7 * 0.5);

  const LAT = 12.9716;
  const LON = 77.5946;
  const BASELINE_ORDERS = 100;
  const CURRENT_ORDERS  = 60;

  // ── Fetch latest wallet balance from backend ──
  const refreshWallet = async () => {
    if (!workerId) return;
    try {
      const res  = await fetch(`${BACKEND}/api/worker/${workerId}`);
      const data = await res.json();
      if (data?.wallet_balance !== undefined) {
        const newBalance = data.wallet_balance;
        setWalletBalance(newBalance);
        localStorage.setItem('walletBalance', newBalance);
        // Also refresh premium_weekly in case it changed via dynamic pricing
        if (data.premium_weekly) {
          localStorage.setItem('premiumWeekly', data.premium_weekly);
        }
      }
    } catch (e) {
      console.error('Wallet refresh error:', e);
    }
  };

  // ── Fetch payout history for this worker ──
  const fetchPayoutHistory = async () => {
    if (!workerId) return;
    try {
      const res  = await fetch(`${BACKEND}/api/payout/worker/${workerId}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setPayoutHistory(data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
        const today = new Date().toDateString();
        const found = data.find(p => new Date(p.created_at).toDateString() === today);
        if (found) setTodayPayout(found);
      }
    } catch (e) {
      console.error('Payout history error:', e);
    }
  };

  // ── FETCH SENSOR DATA ──
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [premiumRes, rainRes, heatRes, aqiRes, curfewRes, outageRes] = await Promise.all([
          fetch(`${BACKEND}/api/premium/calculate?weekly_income=${workerIncome}&zone=${workerZone}`),
          fetch(`${BACKEND}/api/triggers/rain?lat=${LAT}&lon=${LON}&current_orders=${CURRENT_ORDERS}&baseline_orders=${BASELINE_ORDERS}`),
          fetch(`${BACKEND}/api/triggers/heat?lat=${LAT}&lon=${LON}&current_orders=${CURRENT_ORDERS}&baseline_orders=${BASELINE_ORDERS}`),
          fetch(`${BACKEND}/api/triggers/aqi?city=${workerZone}&current_orders=${CURRENT_ORDERS}&baseline_orders=${BASELINE_ORDERS}`),
          fetch(`${BACKEND}/api/triggers/curfew?zone=${workerZone}`),
          fetch(`${BACKEND}/api/triggers/outage?platform=Zepto`),
        ]);
        const [premium, rain, heat, aqi, curfew, outage] = await Promise.all([
          premiumRes.json(), rainRes.json(), heatRes.json(),
          aqiRes.json(), curfewRes.json(), outageRes.json(),
        ]);
        setRiskData(premium);
        setTriggerData({ rain, heat, aqi, curfew, outage });
        setLoading(false);
      } catch (err) {
        console.error('Fetch error:', err);
        setLoading(false);
      }
    };

    fetchAll();
    fetchPayoutHistory();
    refreshWallet();

    const interval = setInterval(() => {
      fetchAll();
      // Refresh wallet every 30s to catch admin premium collections
      refreshWallet();
    }, 30000);
    return () => clearInterval(interval);
  }, [workerIncome, workerZone]);

  // ── FRAUD DETECTION ──
  useEffect(() => {
    if (loading) return;
    const flags = [];
    if (isGPSSpoofed(LAT, LON)) flags.push('GPS coordinates outside Bengaluru bounds');
    flags.push(...isWeatherAnomaly(triggerData));
    setFraudFlags(flags);
  }, [triggerData, loading]);

  // ── AUTO PAYOUT ──
  useEffect(() => {
    const isTriggered = Object.values(triggerData).some(t => t?.confirmed);
    if (!isTriggered) return;
    if (!workerId) return;
    if (lastTriggerTime.current && Date.now() - lastTriggerTime.current < 60000) return;
    if (todayPayout) return;

    const triggerPayout = async () => {
      const triggeredType = Object.entries(triggerData).find(([, v]) => v?.confirmed)?.[0]?.toUpperCase() || 'AUTO';
      try {
        await fetch(`${BACKEND}/api/payout/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            worker_id:    workerId,
            amount:       payoutAmount,
            trigger_type: triggeredType,
            audit_trail:  'Oracle auto-trigger: threshold breached',
          }),
        });
        lastTriggerTime.current = Date.now();
        setShowModal(true);
        // Refresh both payout history and wallet after settlement
        fetchPayoutHistory();
        refreshWallet();
      } catch (err) {
        console.error('Payout error:', err);
      }
    };

    triggerPayout();
  }, [triggerData]);

  const isTriggered = todayPayout !== null || Object.values(triggerData).some(t => t?.confirmed);

  return (
    <div className="home-page">

      {showModal && (
        <PayoutModal
          amount={payoutAmount}
          workerName={workerName}
          upiId={upiId}
          onClose={() => setShowModal(false)}
        />
      )}

      {fraudFlags.length > 0 && (
        <div className="fraud-warning-banner">
          <AlertTriangle size={16} />
          <span>Anomaly detected — claim under review. Contact support if incorrect.</span>
        </div>
      )}

      {/* HEADER */}
      <div className="home-header">
        <div className="user-info">
          <h1>Welcome, {workerName}</h1>
          <div className="zone-info">
            <MapPin size={16} />
            <span>{riskData?.zone || workerZone}</span>
          </div>
        </div>
        <button className="notification-btn">
          <Bell size={24} />
          <span className="notification-badge">2</span>
        </button>
      </div>

      {/* STATUS CARDS */}
      <div className="status-cards-container">
        <div className={`coverage-status-card ${riskData?.risk_factor > 0.05 ? 'danger-pulse' : ''}`}>
          <div className="status-header">
            <Shield size={24} color={riskData?.risk_factor > 0.05 ? '#ef4444' : '#00ff88'} />
            <div>
              <h3>Shield Protection</h3>
              <p>Risk Adjusted: {riskData?.risk_factor > 0 ? (riskData.risk_factor * 100).toFixed(1) : '1.2'}%</p>
            </div>
          </div>
          <div className={`status-badge ${riskData?.risk_factor > 0.05 ? 'risk' : 'active'}`}>
            {riskData?.risk_factor > 0.05 ? 'HIGH RISK' : 'SECURE'}
          </div>
        </div>

        <div className="earnings-card">
          <div className="earnings-header">
            <TrendingUp size={20} />
            <span>{isTriggered ? '🚨 Claim Detected' : 'Projected Payout'}</span>
          </div>
          <div className="earnings-amount">
            ₹{isTriggered ? payoutAmount : Math.round(riskData?.daily_equivalent || payoutAmount)}
          </div>
          <div className="payout-subtext">
            {isTriggered
              ? todayPayout ? 'Settled Today ✓' : 'Autonomous Settlement Initialized'
              : `✓ Live Coverage for ${workerZone}`}
          </div>
          {isTriggered && (
            <button className="replay-modal-btn" onClick={() => setShowModal(true)}>
              View Payment Receipt
            </button>
          )}
        </div>
      </div>

      {/* ── WALLET CARD ── */}
      <WalletCard
        walletBalance={walletBalance}
        premiumWeekly={premiumWeekly}
        payoutHistory={payoutHistory}
      />

      {/* WEEKLY COVERAGE CARD */}
      <div className="weekly-coverage-card">
        <div className="wc-left">
          <Shield size={20} color="#00ff88" />
          <div>
            <div className="wc-title">Weekly Coverage Active</div>
            <div className="wc-sub">Capped at 2 disruption-days / week</div>
          </div>
        </div>
        <div className="wc-right">
          <div className="wc-amount">₹{(payoutAmount * 2).toLocaleString()}</div>
          <div className="wc-label">Max Payout / Week</div>
        </div>
      </div>

      {/* OPERATIONAL STATUS */}
      <div className="section-header">
        <h2>Operational Status</h2>
        <p>Binary triggers — payout eligible</p>
      </div>

      <div className="operational-status-bars">
        <div className="status-bar-row">
          <div className="bar-label-group"><Globe size={18} /><span>Platform Status</span></div>
          <span className={triggerData.outage?.confirmed ? 'text-red' : 'text-green'}>
            {triggerData.outage?.confirmed ? 'OUTAGE' : 'ONLINE'}
          </span>
        </div>
        <div className="status-bar-row">
          <div className="bar-label-group"><Activity size={18} /><span>City Restrictions</span></div>
          <span className={triggerData.curfew?.confirmed ? 'text-red' : 'text-green'}>
            {triggerData.curfew?.confirmed ? 'CURFEW ACTIVE' : 'STABLE'}
          </span>
        </div>
        <div className="status-bar-row">
          <div className="bar-label-group">
            <Sun size={18} /><span>UV Exposure</span>
            <span className="display-only-badge">Display Only</span>
          </div>
          <span className={riskData?.triggers_detected?.uv_index > 7 ? 'text-red' : 'text-green'}>
            Index: {riskData?.triggers_detected?.uv_index || 0}
          </span>
        </div>
      </div>

      {/* SENSORS */}
      <div className="section-header" style={{ marginTop: '2rem' }}>
        <h2>System Intelligence</h2>
        <p>Real-time Parametric Monitoring</p>
      </div>

      {loading ? (
        <div className="loading-card">
          <Loader2 className="animate-spin" />
          <p>Connecting to Multi-Sensor Oracle...</p>
        </div>
      ) : (
        <>
          <LiveRiskTracker triggerData={triggerData} />

          <div className="section-header">
            <h2>Environmental Sensors</h2>
            <p>Threshold: Rain ≥20mm | AQI ≥350 | Heat ≥42°C</p>
          </div>

          <div className="triggers-grid">
            {[
              {
                id: 1, label: 'Rainfall',
                sublabel: `${triggerData.rain?.raw_value || 0} mm/hr`,
                percentage: Math.min(Math.round(((triggerData.rain?.raw_value || 0) / 20) * 100), 100),
                triggered: triggerData.rain?.confirmed,
              },
              {
                id: 2, label: 'Air Quality',
                sublabel: `AQI: ${triggerData.aqi?.raw_value || 0}`,
                percentage: Math.min(Math.round(((triggerData.aqi?.raw_value || 0) / 350) * 100), 100),
                triggered: triggerData.aqi?.confirmed,
              },
              {
                id: 3, label: 'Heat',
                sublabel: `${triggerData.heat?.raw_value || 0}°C`,
                percentage: Math.min(Math.round(((triggerData.heat?.raw_value || 0) / 42) * 100), 100),
                triggered: triggerData.heat?.confirmed,
              },
              {
                id: 4, label: 'Platform',
                sublabel: triggerData.outage?.status || 'checking...',
                percentage: triggerData.outage?.confirmed ? 100 : 0,
                triggered: triggerData.outage?.confirmed,
              },
            ].map((trigger) => (
              <div key={trigger.id} className={`trigger-card ${trigger.triggered ? 'danger-pulse' : ''}`}>
                <span className="payout-badge">💰 Covered</span>
                <CircularProgress percentage={trigger.percentage} size={80} strokeWidth={6} />
                <div className="trigger-info">
                  <h4>{trigger.label}</h4>
                  <p className="trigger-sublabel">{trigger.sublabel}</p>
                  <p style={{ color: trigger.triggered ? '#ef4444' : '#22c55e' }}>
                    {trigger.triggered ? '⚡ Triggered' : 'Stable'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ALERTS */}
      <div className="section-header" style={{ marginTop: '2rem' }}>
        <h2>Recent Alerts</h2>
      </div>
      <div className="alerts-list">
        {recentAlerts.map((alert) => (
          <div key={alert.id} className="alert-item">
            <Bell size={20} />
            <div className="alert-content">
              <p>{alert.message}</p>
              <span>{alert.time}</span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}