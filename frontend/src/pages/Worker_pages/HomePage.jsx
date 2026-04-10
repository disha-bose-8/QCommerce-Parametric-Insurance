// HomePage.jsx - Worker Dashboard with Instant Payout Modal + Fraud Detection

import React, { useState, useEffect, useRef } from 'react';
import { Shield, TrendingUp, MapPin, Bell, Loader2, Globe, Sun, Activity, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { CircularProgress } from '../../components/Worker_components/CircularProgress';
import LiveRiskTracker from '../../components/Worker_components/LiveRiskTracker';
import './HomePage.css';

const BACKEND = 'https://qshield-backend-nf8y.onrender.com';
const FORCE_TRIGGER = true;

// ─── FRAUD DETECTION HELPERS ──────────────────────────────────────────────────

// Expected lat/lon ranges for Bengaluru (rough bounding box)
const CITY_BOUNDS = {
  latMin: 12.83, latMax: 13.14,
  lonMin: 77.46, lonMax: 77.75,
};

function isGPSSpoofed(lat, lon) {
  return (
    lat < CITY_BOUNDS.latMin || lat > CITY_BOUNDS.latMax ||
    lon < CITY_BOUNDS.lonMin || lon > CITY_BOUNDS.lonMax
  );
}

// Historical baselines (monthly avg for Bengaluru, April)
const HISTORICAL_BASELINES = {
  rain: { avgMM: 3.2, stdDev: 2.1 },   // April is dry season
  aqi:  { avgAQI: 95, stdDev: 30 },
  heat: { avgTemp: 31, stdDev: 3 },
};

function isWeatherAnomaly(triggerData) {
  const flags = [];
  const rain = triggerData.rain?.raw_value || 0;
  const aqi  = triggerData.aqi?.raw_value  || 0;
  const heat = triggerData.heat?.raw_value || 0;

  // If rain > baseline + 3 sigma → suspicious (too extreme for season)
  if (rain > HISTORICAL_BASELINES.rain.avgMM + 3 * HISTORICAL_BASELINES.rain.stdDev) {
    flags.push(`Rain ${rain}mm far exceeds April historical avg (${HISTORICAL_BASELINES.rain.avgMM}mm)`);
  }
  if (aqi > HISTORICAL_BASELINES.aqi.avgAQI + 3 * HISTORICAL_BASELINES.aqi.stdDev) {
    flags.push(`AQI ${aqi} far exceeds historical avg (${HISTORICAL_BASELINES.aqi.avgAQI})`);
  }
  if (heat > HISTORICAL_BASELINES.heat.avgTemp + 3 * HISTORICAL_BASELINES.heat.stdDev) {
    flags.push(`Temp ${heat}°C far exceeds April avg (${HISTORICAL_BASELINES.heat.avgTemp}°C)`);
  }
  return flags;
}

// ─── PAYOUT MODAL ─────────────────────────────────────────────────────────────

function PayoutModal({ amount, workerName, upiId, onClose }) {
  const [stage, setStage] = useState(0);
  // stages: 0=initiating, 1=processing, 2=credited

  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 1200);
    const t2 = setTimeout(() => setStage(2), 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const stages = [
    { label: 'Initiating Transfer...', icon: '⚡', color: '#f59e0b' },
    { label: 'Processing via UPI...', icon: '🔄', color: '#3b82f6' },
    { label: 'Amount Credited!',      icon: '✅', color: '#00ff88' },
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
                {i < stage && <CheckCircle size={14} color="#00ff88" />}
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
            <div className="upi-row">
              <span className="upi-key">UPI ID</span>
              <span className="upi-val">{upiId}</span>
            </div>
            <div className="upi-row">
              <span className="upi-key">Ref No.</span>
              <span className="upi-val">QSH{Date.now().toString().slice(-8)}</span>
            </div>
            <div className="upi-row">
              <span className="upi-key">Mode</span>
              <span className="upi-val">IMPS / UPI</span>
            </div>
            <div className="success-stamp">SETTLED ✓</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

const recentAlerts = [
  { id: 1, message: 'Heavy rain detected in your zone', time: '2 hours ago' },
  { id: 2, message: 'Platform downtime monitoring', time: '5 hours ago' },
];

export function HomePage() {
  const [riskData, setRiskData]       = useState(null);
  const [triggerData, setTriggerData] = useState({ rain: null, heat: null, aqi: null, curfew: null, outage: null });
  const [loading, setLoading]         = useState(true);
  const [showModal, setShowModal]     = useState(false);
  const [fraudFlags, setFraudFlags]   = useState([]);
  const lastTriggerTime               = useRef(null);

  const workerName   = localStorage.getItem('workerName')   || 'Rajesh';
  const workerZone   = localStorage.getItem('workerZone')   || 'Bengaluru';
  const workerIncome = Number(localStorage.getItem('workerIncome') || 7000);
  const upiId        = localStorage.getItem('upiId')        || `${workerName.toLowerCase()}@upi`;

  const LAT = 12.9716;
  const LON = 77.5946;
  const BASELINE_ORDERS = 100;
  const CURRENT_ORDERS  = 60;

  // ── FETCH ──
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
    const interval = setInterval(fetchAll, 30000);
    return () => clearInterval(interval);
  }, [workerIncome, workerZone]);

  // ── FRAUD DETECTION ──
  useEffect(() => {
    if (loading) return;
    const flags = [];

    if (isGPSSpoofed(LAT, LON)) {
      flags.push('GPS coordinates outside Bengaluru bounds — possible spoofing');
    }

    const weatherFlags = isWeatherAnomaly(triggerData);
    flags.push(...weatherFlags);

    setFraudFlags(flags);
  }, [triggerData, loading]);

  // ── AUTO PAYOUT + MODAL ──
  useEffect(() => {
    const isTriggered = FORCE_TRIGGER || Object.values(triggerData).some(t => t?.confirmed);
    if (!isTriggered) return;
    if (lastTriggerTime.current && Date.now() - lastTriggerTime.current < 60000) return;

    const workerId = localStorage.getItem('workerId') || 1;
    const amount   = Math.round(workerIncome * 0.5);

    const triggerPayout = async () => {
      try {
        await fetch(`${BACKEND}/api/payout/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            worker_id:    workerId,
            amount,
            trigger_type: 'AUTO_ORACLE',
            audit_msg:    'Oracle-triggered payout',
          }),
        });
        lastTriggerTime.current = Date.now();
        setShowModal(true);
      } catch (err) {
        console.error('Payout error:', err);
      }
    };

    triggerPayout();
  }, [triggerData, workerIncome]);

  const isTriggered  = FORCE_TRIGGER || Object.values(triggerData).some(t => t?.confirmed);
  const payoutAmount = Math.round(workerIncome * 0.5);

  return (
    <div className="home-page">

      {/* PAYOUT MODAL */}
      {showModal && (
        <PayoutModal
          amount={payoutAmount}
          workerName={workerName}
          upiId={upiId}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* FRAUD WARNINGS (worker-facing, soft) */}
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
            <span>{riskData?.zone || workerZone || 'Bengaluru'}</span>
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
            ₹{isTriggered
              ? payoutAmount
              : Math.max(Math.round(riskData?.worker_pays / 7 || 0), 245)}
          </div>
          <div className="payout-subtext">
            {isTriggered
              ? 'Autonomous Settlement Initialized'
              : `✓ Live Coverage for ${workerZone}`}
          </div>
          {isTriggered && (
            <button className="replay-modal-btn" onClick={() => setShowModal(true)}>
              View Payment Receipt
            </button>
          )}
        </div>
      </div>

      {/* WEEKLY COVERAGE CARD */}
      <div className="weekly-coverage-card">
        <div className="wc-left">
          <Shield size={20} color="#00ff88" />
          <div>
            <div className="wc-title">Weekly Coverage Active</div>
            <div className="wc-sub">Apr 7 – Apr 13, 2025</div>
          </div>
        </div>
        <div className="wc-right">
          <div className="wc-amount">₹{(workerIncome * 0.5).toLocaleString()}</div>
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
            <p>Live data — payout triggers</p>
          </div>

          <div className="triggers-grid">
            {[
              { id: 1, label: 'Rainfall',    sublabel: `${triggerData.rain?.raw_value || 0} mm/hr`,   percentage: Math.min(Math.round(((triggerData.rain?.raw_value || 0) / 20) * 100), 100),  triggered: triggerData.rain?.confirmed },
              { id: 2, label: 'Air Quality', sublabel: `AQI: ${triggerData.aqi?.raw_value || 0}`,      percentage: Math.min(Math.round(((triggerData.aqi?.raw_value  || 0) / 350) * 100), 100), triggered: triggerData.aqi?.confirmed  },
              { id: 3, label: 'Heat + UV',   sublabel: `${triggerData.heat?.raw_value || 0}°C`,        percentage: Math.min(Math.round(((triggerData.heat?.raw_value || 0) / 42) * 100), 100),  triggered: triggerData.heat?.confirmed },
              { id: 4, label: 'Platform',    sublabel: triggerData.outage?.status || 'checking...',    percentage: triggerData.outage?.confirmed ? 100 : 0,                                      triggered: triggerData.outage?.confirmed },
            ].map((trigger) => (
              <div key={trigger.id} className={`trigger-card ${trigger.triggered ? 'danger-pulse' : ''}`}>
                <span className="payout-badge">💰 Covered</span>
                <CircularProgress percentage={trigger.percentage} size={80} strokeWidth={6} />
                <div className="trigger-info">
                  <h4>{trigger.label}</h4>
                  <p className="trigger-sublabel">{trigger.sublabel}</p>
                  <p style={{ color: trigger.triggered ? '#ef4444' : '#22c55e' }}>
                    {trigger.triggered ? 'Triggered' : 'Stable'}
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
