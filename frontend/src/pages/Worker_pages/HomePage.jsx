import React, { useState, useEffect } from 'react';
import { Shield, TrendingUp, MapPin, Bell, Loader2 } from 'lucide-react';
import { CircularProgress } from '../../components/Worker_components/CircularProgress';
import LiveRiskTracker from '../../components/Worker_components/LiveRiskTracker';
import './HomePage.css';

const recentAlerts = [
  { id: 1, message: 'Heavy rain detected in your zone', time: '2 hours ago' },
  { id: 2, message: 'Platform downtime monitoring', time: '5 hours ago' },
];

export function HomePage() {
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Dynamic user data from localStorage
  const workerName = localStorage.getItem('workerName') || 'Rajesh';
  const workerZone = localStorage.getItem('workerZone') || 'Bengaluru';
  const workerIncome = localStorage.getItem('workerIncome') || 7000;

  useEffect(() => {
    const fetchRisk = async () => {
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/api/premium/calculate?weekly_income=${workerIncome}&zone=${workerZone}`
        );
        const data = await response.json();
        setRiskData(data);
        setLoading(false);
      } catch (error) {
        console.error("Oracle Sync Error:", error);
        setLoading(false);
      }
    };

    fetchRisk();
    const interval = setInterval(fetchRisk, 5000); 
    return () => clearInterval(interval);
  }, [workerIncome, workerZone]);

  const getRiskLevel = (val, threshold) => val > threshold ? 'Hazardous' : 'Stable';

  return (
    <div className="home-page">
      {/* 1. Header */}
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

      {/* 2. Status Cards (RESTORED) */}
      <div className="status-cards-container">
        <div className={`coverage-status-card ${riskData?.risk_factor > 0.7 ? 'danger-pulse' : ''}`}>
          <div className="status-header">
            <Shield size={24} color={riskData?.risk_factor > 0.7 ? "#ef4444" : "#22c55e"} />
            <div>
              <h3>Coverage Active</h3>
              <p>Protected until Mar 30, 2026</p>
            </div>
          </div>
          <div className={`status-badge ${riskData?.risk_factor > 0.7 ? 'risk' : 'active'}`}>
            {riskData?.risk_factor > 0.7 ? 'SHIELD ON' : 'SECURE'}
          </div>
        </div>

        <div className="earnings-card">
          <div className="earnings-header">
            <TrendingUp size={20} />
            <span>Projected Payout</span>
          </div>
          <div className="earnings-amount">₹{riskData?.total_premium?.toFixed(0) || '0'}</div>
        </div>
      </div>

      {/* 3. AI Section */}
      <div className="section-header">
        <h2>System Intelligence</h2>
        <p>Real-time Parametric Monitoring</p>
      </div>

      {loading ? (
        <div className="loading-card" style={{textAlign: 'center', padding: '2rem'}}>
          <Loader2 className="animate-spin" style={{margin: '0 auto'}} />
          <p>Connecting to Multi-Sensor Oracle...</p>
        </div>
      ) : (
        <>
          {riskData && <LiveRiskTracker riskData={riskData} />}

          <div className="section-header">
            <h2>Environmental Sensors</h2>
            <p>Live data from Bengaluru Smart-Grid</p>
          </div>

          <div className="triggers-grid">
            {[
              { id: 1, label: 'Rainfall', percentage: (riskData?.triggers_detected?.rain || 0) * 100, val: riskData?.triggers_detected?.rain, thresh: 0.6 },
              { id: 2, label: 'Air Quality', percentage: ((riskData?.triggers_detected?.aqi || 0) / 500) * 100, val: riskData?.triggers_detected?.aqi, thresh: 200 },
              { id: 3, label: 'Traffic', percentage: (riskData?.triggers_detected?.traffic || 0) * 100, val: riskData?.triggers_detected?.traffic, thresh: 0.7 },
              { id: 4, label: 'UV Index', percentage: ((riskData?.triggers_detected?.uv_index || 0) / 11) * 100, val: riskData?.triggers_detected?.uv_index, thresh: 7 },
            ].map((trigger) => {
              const forecast = getRiskLevel(trigger.val, trigger.thresh);
              return (
                <div key={trigger.id} className={`trigger-card ${forecast === 'Hazardous' ? 'danger-pulse' : ''}`}>
                  <CircularProgress 
                    percentage={Math.round(trigger.percentage)} 
                    size={80} 
                    strokeWidth={6} 
                  />
                  <div className="trigger-info">
                    <h4>{trigger.label}</h4>
                    <p className={forecast === 'Hazardous' ? 'text-red-500' : ''}>{forecast}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* 4. Recent Alerts */}
      <div className="section-header" style={{marginTop: '2rem'}}>
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