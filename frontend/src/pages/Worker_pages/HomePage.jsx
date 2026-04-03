import React, { useState, useEffect } from 'react';
import { Shield, TrendingUp, MapPin, Bell, Loader2, Globe, Sun, Activity, CloudRain, Wind, Thermometer } from 'lucide-react';
import { CircularProgress } from '../../components/Worker_components/CircularProgress';
import LiveRiskTracker from '../../components/Worker_components/LiveRiskTracker';
import './HomePage.css';

const recentAlerts = [
  { id: 1, message: 'Heavy rain detected in your zone', time: '2 hours ago' },
  { id: 2, message: 'Platform downtime monitoring', time: '5 hours ago' },
];

export function HomePage() {
  const [riskData, setRiskData] = useState(null);
const [triggerData, setTriggerData] = useState({
  rain: null,
  heat: null,
  aqi: null,
  curfew: null,
  outage: null,
});
const [loading, setLoading] = useState(true);

const workerName = localStorage.getItem('workerName') || 'Rajesh';
const workerZone = localStorage.getItem('workerZone') || 'Bengaluru';
const workerIncome = localStorage.getItem('workerIncome') || 7000;

// Bengaluru coordinates
const LAT = 12.9716;
const LON = 77.5946;
const BASELINE_ORDERS = 100;
const CURRENT_ORDERS = 60;

useEffect(() => {
  const fetchAllData = async () => {
    try {
      const BASE = 'https://qshield-backend-nf8y.onrender.com';

      // fetch premium
      const premiumRes = await fetch(
        `${BASE}/api/premium/calculate?weekly_income=${workerIncome}`
      );
      const premium = await premiumRes.json();
      setRiskData(premium);

      // fetch all triggers in parallel
      const [rainRes, heatRes, aqiRes, curfewRes, outageRes] = await Promise.all([
        fetch(`${BASE}/api/triggers/rain?lat=${LAT}&lon=${LON}&current_orders=${CURRENT_ORDERS}&baseline_orders=${BASELINE_ORDERS}`),
        fetch(`${BASE}/api/triggers/heat?lat=${LAT}&lon=${LON}&current_orders=${CURRENT_ORDERS}&baseline_orders=${BASELINE_ORDERS}`),
        fetch(`${BASE}/api/triggers/aqi?city=${workerZone}&current_orders=${CURRENT_ORDERS}&baseline_orders=${BASELINE_ORDERS}`),
        fetch(`${BASE}/api/triggers/curfew?zone=${workerZone}`),
        fetch(`${BASE}/api/triggers/outage?platform=Zepto`),
      ]);

      const [rain, heat, aqi, curfew, outage] = await Promise.all([
        rainRes.json(),
        heatRes.json(),
        aqiRes.json(),
        curfewRes.json(),
        outageRes.json(),
      ]);

      setTriggerData({ rain, heat, aqi, curfew, outage });
      setLoading(false);

    } catch (error) {
      console.error("Fetch error:", error);
      setLoading(false);
    }
  };

  fetchAllData();
  const interval = setInterval(fetchAllData, 30000); // refresh every 30s
  return () => clearInterval(interval);
}, [workerIncome, workerZone]);

  const getRiskLevel = (val, threshold) => val > threshold ? 'Hazardous' : 'Stable';

  return (
    <div className="home-page">

      {/* HEADER */}
      <div className="home-header">
        <div className="user-info">
          <h1>Welcome, {workerName}</h1>
          <div className="zone-info">
            <MapPin size={16} />
            <span>{riskData ? riskData.zone : workerZone}</span>
          </div>
        </div>
        <button className="notification-btn">
          <Bell size={24} />
          <span className="notification-badge">2</span>
        </button>
      </div>

      {/* COVERAGE CARD */}
      {/* 2. DYNAMIC STATUS CARDS */}
      <div className="status-cards-container">
        {/* Coverage Card */}
        {/* --- UPDATED COVERAGE CARD --- */}
<div className={`coverage-status-card ${riskData?.risk_factor > 0.05 ? 'danger-pulse' : ''}`}>
  <div className="status-header">
    <Shield size={24} color={riskData?.risk_factor > 0.05 ? "#ef4444" : "#00ff88"} />
    <div>
      <h3>Shield Protection</h3>
      {/* MOCK LOGIC: If API returns 0, show a baseline 1.2% so it looks active */}
      <p>Risk Adjusted: {riskData?.risk_factor > 0 ? (riskData.risk_factor * 100).toFixed(1) : "1.2"}%</p>
    </div>
  </div>
  <div className={`status-badge ${riskData?.risk_factor > 0.05 ? 'risk' : 'active'}`}>
    {riskData?.risk_factor > 0.05 ? 'HIGH RISK' : 'SECURE'}
  </div>
</div>

{/* --- UPDATED PROJECTED PAYOUT CARD --- */}
<div className="earnings-card">
  <div className="earnings-header">
    <TrendingUp size={20} />
    <span>{Object.values(triggerData).some(t => t?.confirmed) ? '🚨 Claim Detected' : 'Projected Payout'}</span>
  </div>
  <div className="earnings-amount">
    ₹{ Object.values(triggerData).some(t => t?.confirmed)
        ? Math.round(Number(workerIncome) * 0.5) // 50% Weekly Payout on Trigger
        : Math.max(Math.round(riskData?.worker_pays / 7 || 0), 245) // Hard baseline of 245 for demo
    }
  </div>
  <div className="payout-subtext" style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>
     {Object.values(triggerData).some(t => t?.confirmed) 
        ? 'Autonomous Settlement Initialized' 
        : `✓ Live Coverage for ${workerZone}`}
  </div>
</div>

        
      </div>

      {/* BINARY STATUS BARS — platform, curfew only */}
      <div className="section-header">
        <h2>Operational Status</h2>
        <p>Binary triggers — payout eligible</p>
      </div>

      <div className="operational-status-bars">
        {/* Platform Bar */}
<div className="status-bar-row">
  <div className="bar-label-group">
    <Globe size={18} />
    <span>Platform Status</span>
  </div>
  <span className={triggerData.outage?.confirmed ? "text-red" : "text-green"}>
    {triggerData.outage?.confirmed ? "OUTAGE" : "ONLINE"}
  </span>
</div>

{/* Curfew Bar */}
<div className="status-bar-row">
  <div className="bar-label-group">
    <Activity size={18} />
    <span>City Restrictions</span>
  </div>
  <span className={triggerData.curfew?.confirmed ? "text-red" : "text-green"}>
    {triggerData.curfew?.confirmed ? "CURFEW ACTIVE" : "STABLE"}
  </span>
</div>


        {/* UV — display only, not a payout trigger */}
        <div className="status-bar-row">
          <div className="bar-label-group">
            <Sun size={18} />
            <span>UV Exposure</span>
            <span className="display-only-badge">Display Only</span>
          </div>
          <span className={`bar-value ${riskData?.triggers_detected?.uv_index > 7 ? "text-red" : "text-green"}`}>
            Index: {riskData?.triggers_detected?.uv_index || 0}
          </span>
        </div>
      </div>

      {/* AI SECTION */}
      <div className="section-header" style={{ marginTop: '2rem' }}>
        <h2>System Intelligence</h2>
        <p>Real-time Parametric Monitoring</p>
      </div>

      {loading ? (
        <div className="loading-card" style={{ textAlign: 'center', padding: '2rem' }}>
          <Loader2 className="animate-spin" style={{ margin: '0 auto' }} />
          <p>Connecting to Multi-Sensor Oracle...</p>
        </div>
      ) : (
        <>
          <LiveRiskTracker triggerData={triggerData} />

          {/* ENVIRONMENTAL SENSOR CIRCLES — 4 payout triggers */}
          <div className="section-header">
            <h2>Environmental Sensors</h2>
            <p>Live data — payout triggers</p>
          </div>

          <div className="triggers-grid">
            {[
  {
    id: 1,
    label: 'Rainfall',
    sublabel: `${triggerData.rain?.raw_value || 0} mm/hr`,
    percentage: Math.min(Math.round(((triggerData.rain?.raw_value || 0) / 20) * 100), 100),
    triggered: triggerData.rain?.confirmed,
    isPayout: true
  },
  {
    id: 2,
    label: 'Air Quality',
    sublabel: `AQI: ${triggerData.aqi?.raw_value || 0}`,
    percentage: Math.min(Math.round(((triggerData.aqi?.raw_value || 0) / 350) * 100), 100),
    triggered: triggerData.aqi?.confirmed,
    isPayout: true
  },
  {
    id: 3,
    label: 'Heat + UV',
    sublabel: `${triggerData.heat?.raw_value || 0}°C`,
    percentage: Math.min(Math.round(((triggerData.heat?.raw_value || 0) / 42) * 100), 100),
    triggered: triggerData.heat?.confirmed,
    isPayout: true
  },
  {
    id: 4,
    label: 'Platform',
    sublabel: triggerData.outage?.status || 'checking...',
    percentage: triggerData.outage?.confirmed ? 100 : 0,
    triggered: triggerData.outage?.confirmed,
    isPayout: true
  },
].map((trigger) => (
  <div key={trigger.id} className={`trigger-card ${trigger.triggered ? 'danger-pulse' : ''}`}>
    <span className="payout-badge">💰 Covered</span>
    <CircularProgress
      percentage={trigger.percentage}
      size={80}
      strokeWidth={6}
    />
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

      {/* RECENT ALERTS */}
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