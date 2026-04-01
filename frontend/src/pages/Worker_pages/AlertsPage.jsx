import React, { useState, useEffect } from 'react';
import { AlertTriangle, CloudRain, Wind, Activity, Sun, Loader2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { CircularProgress } from '../../components/Worker_components/CircularProgress';
import './AlertsPage.css';

export function AlertsPage() {
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const zone = localStorage.getItem('workerZone') || 'Bengaluru';
        const response = await fetch(`http://127.0.0.1:8000/api/premium/calculate?weekly_income=7000&zone=${zone}`);
        const data = await response.json();
        setRiskData(data);
        setLoading(false);
      } catch (e) {
        console.error("Alerts Sync Error:", e);
      }
    };
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return (
    <div className="loading-state" style={{color: 'white', textAlign: 'center', marginTop: '20%'}}>
      <Loader2 className="animate-spin" /> <p>Syncing Sensors...</p>
    </div>
  );

  const isRainHigh = riskData?.triggers_detected?.rain > 0.6;
  const isAQIHigh = riskData?.triggers_detected?.aqi > 200;

  return (
    <div className="alerts-page">
      {/* 1. Active Alerts Section */}
      <div className="active-alerts-list">
        {isRainHigh && (
          <div className="active-alert-item" style={{ borderColor: '#ef4444' }}>
            <div className="alert-header-row">
              <h3>Heavy Rain Detected</h3>
              <span className="severity-badge high">High</span>
            </div>
            <p className="alert-message">
              Precipitation levels at {Math.round(riskData.triggers_detected.rain * 100)}%. Payout eligibility monitoring active.
            </p>
            <div className="alert-footer-row">
              <span className="alert-time">Live Monitoring</span>
              <div className="alert-status-badge monitoring">
                <div className="pulse-dot"></div>
                <span>Active</span>
              </div>
            </div>
          </div>
        )}

        {isAQIHigh && (
          <div className="active-alert-item" style={{ borderColor: '#f97316' }}>
            <div className="alert-header-row">
              <h3>AQI Warning</h3>
              <span className="severity-badge medium">Medium</span>
            </div>
            <p className="alert-message">
              Hazardous air quality ({riskData.triggers_detected.aqi}). Health protection coverage initiated.
            </p>
            <div className="alert-footer-row">
              <span className="alert-time">Live Monitoring</span>
              <div className="alert-status-badge monitoring">
                <div className="pulse-dot"></div>
                <span>Active</span>
              </div>
            </div>
          </div>
        )}

        {!isRainHigh && !isAQIHigh && (
          <div className="active-alert-item" style={{ borderColor: '#22c55e' }}>
            <div className="alert-header-row">
              <h3>All Sensors Stable</h3>
              <span className="severity-badge low">Safe</span>
            </div>
            <p className="alert-message">System monitoring Bengaluru smart-grid. No active disruptions.</p>
          </div>
        )}
      </div>

      {/* 2. Forecast Section */}
      <div className="forecast-list">
        {/* TODAY */}
        <div className="forecast-day">
          <div className="day-header">
            <h3>Today</h3>
            <span className="day-date">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </div>
          <div className="triggers-grid-forecast">
            <div className="trigger-forecast-card">
              <div className="trigger-forecast-header"><CloudRain size={14} /> <span>Rain</span><TrendingUp size={14} className="trend-icon up" /></div>
              <CircularProgress percentage={Math.round((riskData?.triggers_detected?.rain || 0) * 100)} size={80} />
            </div>
            <div className="trigger-forecast-card">
              <div className="trigger-forecast-header"><Wind size={14} /> <span>AQI</span><Minus size={14} className="trend-icon stable" /></div>
              <CircularProgress percentage={Math.round(((riskData?.triggers_detected?.aqi || 0) / 500) * 100)} size={80} />
            </div>
            <div className="trigger-forecast-card">
              <div className="trigger-forecast-header"><Activity size={14} /> <span>Traffic</span><TrendingDown size={14} className="trend-icon down" /></div>
              <CircularProgress percentage={Math.round((riskData?.triggers_detected?.traffic || 0) * 100)} size={80} />
            </div>
            <div className="trigger-forecast-card">
              <div className="trigger-forecast-header"><Sun size={14} /> <span>UV Index</span><Minus size={14} className="trend-icon stable" /></div>
              <CircularProgress percentage={Math.round(((riskData?.triggers_detected?.uv_index || 0) / 11) * 100)} size={80} />
            </div>
          </div>
        </div>

        {/* TOMORROW - PREDICTIVE SECTION */}
        <div className="forecast-day">
          <div className="day-header">
            <h3>Tomorrow</h3>
            <span className="day-date">Apr 02</span>
          </div>
          <div className="triggers-grid-forecast" style={{ opacity: 0.7 }}>
            <div className="trigger-forecast-card">
              <div className="trigger-forecast-header"><CloudRain size={14} /> <span>Rain</span><TrendingDown size={14} className="trend-icon down" /></div>
              <CircularProgress percentage={15} size={70} />
            </div>
            <div className="trigger-forecast-card">
              <div className="trigger-forecast-header"><Wind size={14} /> <span>AQI</span><TrendingUp size={14} className="trend-icon up" /></div>
              <CircularProgress percentage={45} size={70} />
            </div>
            <div className="trigger-forecast-card">
              <div className="trigger-forecast-header"><Activity size={14} /> <span>Traffic</span><Minus size={14} className="trend-icon stable" /></div>
              <CircularProgress percentage={20} size={70} />
            </div>
            <div className="trigger-forecast-card">
              <div className="trigger-forecast-header"><Sun size={14} /> <span>UV Index</span><TrendingDown size={14} className="trend-icon down" /></div>
              <CircularProgress percentage={10} size={70} />
            </div>
          </div>
        </div>
      </div>

      <div className="info-card-alerts">
        <h3>Parametric Shield</h3>
        <p>Our AI Oracle monitors real-time sensors. If triggers exceed threshold, settlements are processed automatically.</p>
      </div>
    </div>
  );
}