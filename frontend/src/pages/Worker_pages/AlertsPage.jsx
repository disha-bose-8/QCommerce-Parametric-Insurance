import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  CloudRain,
  Wind,
  Activity,
  Sun,
  Loader2,
  TrendingUp,
  TrendingDown,
  Minus,
  Globe
} from 'lucide-react';
import { CircularProgress } from '../../components/Worker_components/CircularProgress';
import './AlertsPage.css';

export function AlertsPage() {
  const [triggerData, setTriggerData] = useState({
    rain: null,
    heat: null,
    aqi: null,
    curfew: null,
    outage: null,
  });

  const [loading, setLoading] = useState(true);

  const BASE = 'https://qshield-backend-nf8y.onrender.com';
  const LAT = 12.9716;
  const LON = 77.5946;
  const BASELINE_ORDERS = 100;
  const CURRENT_ORDERS = 60;

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const zone = localStorage.getItem('workerZone') || 'Bengaluru';

        const [rainRes, heatRes, aqiRes, curfewRes, outageRes] = await Promise.all([
          fetch(`${BASE}/api/triggers/rain?lat=${LAT}&lon=${LON}&current_orders=${CURRENT_ORDERS}&baseline_orders=${BASELINE_ORDERS}`),
          fetch(`${BASE}/api/triggers/heat?lat=${LAT}&lon=${LON}&current_orders=${CURRENT_ORDERS}&baseline_orders=${BASELINE_ORDERS}`),
          fetch(`${BASE}/api/triggers/aqi?city=${zone}&current_orders=${CURRENT_ORDERS}&baseline_orders=${BASELINE_ORDERS}`),
          fetch(`${BASE}/api/triggers/curfew?zone=${zone}`),
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

      } catch (e) {
        console.error("Alerts Sync Error:", e);
        setLoading(false);
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return (
    <div style={{ color: 'white', textAlign: 'center', marginTop: '20%' }}>
      <Loader2 className="animate-spin" />
      <p>Syncing Sensors...</p>
    </div>
  );

  const isRainHigh = triggerData.rain?.confirmed;
  const isAQIHigh = triggerData.aqi?.confirmed;
  const isHeatHigh = triggerData.heat?.confirmed;
  const isCurfewActive = triggerData.curfew?.confirmed;
  const isOutageActive = triggerData.outage?.confirmed;

  return (
    <div className="alerts-page">

      {/* ACTIVE ALERTS */}
      <div className="section-header-mini" style={{ marginBottom: '1rem' }}>
        <AlertTriangle size={18} />
        <span>Active Alerts</span>
      </div>

      <div className="active-alerts-list">
        {isRainHigh && (
          <div className="active-alert-item" style={{ borderColor: '#ef4444' }}>
            <div className="alert-header-row">
              <h3>Heavy Rain Detected</h3>
              <span className="severity-badge high">High</span>
            </div>
            <p className="alert-message">
              Rainfall at {triggerData.rain?.raw_value} mm/hr — above threshold.
            </p>
          </div>
        )}

        {isAQIHigh && (
          <div className="active-alert-item" style={{ borderColor: '#f97316' }}>
            <div className="alert-header-row">
              <h3>AQI Warning</h3>
              <span className="severity-badge medium">Medium</span>
            </div>
            <p className="alert-message">
              AQI at {triggerData.aqi?.raw_value} — unhealthy levels detected.
            </p>
          </div>
        )}

        {isHeatHigh && (
          <div className="active-alert-item" style={{ borderColor: '#f97316' }}>
            <div className="alert-header-row">
              <h3>Extreme Heat</h3>
              <span className="severity-badge high">High</span>
            </div>
            <p className="alert-message">
              Temperature at {triggerData.heat?.raw_value}°C — above threshold.
            </p>
          </div>
        )}

        {isCurfewActive && (
          <div className="active-alert-item" style={{ borderColor: '#ef4444' }}>
            <div className="alert-header-row">
              <h3>Curfew / Strike</h3>
              <span className="severity-badge high">High</span>
            </div>
            <p className="alert-message">
              {triggerData.curfew?.headline || 'Restriction active in your zone.'}
            </p>
          </div>
        )}

        {isOutageActive && (
          <div className="active-alert-item" style={{ borderColor: '#ef4444' }}>
            <div className="alert-header-row">
              <h3>Platform Outage</h3>
              <span className="severity-badge high">High</span>
            </div>
            <p className="alert-message">
              Platform is {triggerData.outage?.status}.
            </p>
          </div>
        )}

        {!isRainHigh && !isAQIHigh && !isHeatHigh && !isCurfewActive && !isOutageActive && (
          <div className="active-alert-item" style={{ borderColor: '#22c55e' }}>
            <div className="alert-header-row">
              <h3>All Sensors Stable</h3>
              <span className="severity-badge low">Safe</span>
            </div>
            <p className="alert-message">
              System monitoring Bengaluru smart-grid. No active disruptions.
            </p>
          </div>
        )}
      </div>

      {/* STATUS */}
      <div className="alerts-status-section">
        <div className="section-header-mini">
          <Activity size={18} />
          <span>Live Sensor Audit</span>
        </div>

        <div className="operational-status-bars">
          <div className={`status-bar-row ${isOutageActive ? 'alert-pulse-red' : ''}`}>
            <div className="bar-label-group">
              <Globe size={18} />
              <span>Platform</span>
            </div>
            <span className={isOutageActive ? "text-red" : "text-green"}>
              {isOutageActive ? "OFFLINE" : "STABLE"}
            </span>
          </div>

          <div className={`status-bar-row ${isCurfewActive ? 'alert-pulse-red' : ''}`}>
            <div className="bar-label-group">
              <AlertTriangle size={18} />
              <span>Restrictions</span>
            </div>
            <span className={isCurfewActive ? "text-red" : "text-green"}>
              {isCurfewActive ? "ACTIVE" : "NONE"}
            </span>
          </div>
        </div>
      </div>

      {/* FORECAST */}
<div className="forecast-list">

  {/* TODAY */}
  <div className="forecast-day">
    <div className="day-header">
      <h3>Today</h3>
      <span className="day-date">
        {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
      </span>
    </div>

    <div className="triggers-grid-forecast">
      <div className="trigger-forecast-card">
        <CloudRain size={14} /> <span>Rain</span>
        <CircularProgress
          percentage={Math.min(Math.round(((triggerData.rain?.raw_value || 0) / 20) * 100), 100)}
          size={80}
        />
      </div>

      <div className="trigger-forecast-card">
        <Wind size={14} /> <span>AQI</span>
        <CircularProgress
          percentage={Math.min(Math.round(((triggerData.aqi?.raw_value || 0) / 350) * 100), 100)}
          size={80}
        />
      </div>

      <div className="trigger-forecast-card">
        <Sun size={14} /> <span>Heat</span>
        <CircularProgress
          percentage={Math.min(Math.round(((triggerData.heat?.raw_value || 0) / 42) * 100), 100)}
          size={80}
        />
      </div>

      <div className="trigger-forecast-card">
        <Globe size={14} /> <span>Platform</span>
        <CircularProgress
          percentage={isOutageActive ? 100 : 0}
          size={80}
        />
      </div>
    </div>
  </div>

  {/* TOMORROW — RESTORED */}
  <div className="forecast-day">
    <div className="day-header">
      <h3>Tomorrow</h3>
      <span className="day-date">
        {new Date(Date.now() + 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
      </span>
    </div>

    <div className="triggers-grid-forecast" style={{ opacity: 0.7 }}>
      <div className="trigger-forecast-card">
        <CloudRain size={14} /> <span>Rain</span>
        <CircularProgress percentage={15} size={70} />
      </div>

      <div className="trigger-forecast-card">
        <Wind size={14} /> <span>AQI</span>
        <CircularProgress percentage={45} size={70} />
      </div>

      <div className="trigger-forecast-card">
        <Sun size={14} /> <span>Heat</span>
        <CircularProgress percentage={30} size={70} />
      </div>

      <div className="trigger-forecast-card">
        <Globe size={14} /> <span>Platform</span>
        <CircularProgress percentage={20} size={70} />
      </div>
    </div>
  </div>
  <div className="info-card-alerts">
  <h3>Parametric Shield</h3>
  <p>
    Our AI Oracle monitors real-time sensors. If triggers exceed threshold,
    settlements are processed automatically — no claims needed.
  </p>
</div>

</div>
</div>
  );
}