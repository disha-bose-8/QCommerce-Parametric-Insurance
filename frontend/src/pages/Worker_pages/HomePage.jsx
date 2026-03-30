import { Shield, TrendingUp, MapPin, Bell } from 'lucide-react';
import { CircularProgress } from '../../components/Worker_components/CircularProgress';
import LiveRiskTracker from '../../components/Worker_components/LiveRiskTracker';
import { useState, useEffect } from 'react';
import './HomePage.css';

// Keep your mocks as fallback
const mockTriggers = [
  { id: 1, label: 'Rainfall', percentage: 0, forecast: 'Syncing...' },
  { id: 2, label: 'Air Quality', percentage: 0, forecast: 'Syncing...' },
  { id: 3, label: 'Traffic', percentage: 0, forecast: 'Syncing...' },
  { id: 4, label: 'UV Index', percentage: 0, forecast: 'Syncing...' },
];

const recentAlerts = [
  { id: 1, message: 'Heavy rain detected in your zone', time: '2 hours ago' },
  { id: 2, message: 'Platform downtime monitoring', time: '5 hours ago' },
];

export function HomePage() {
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const fetchRisk = async () => {
    try {
      // THE URL MUST MATCH YOUR SWAGGER PARAMETERS EXACTLY
      const response = await fetch(
        "http://127.0.0.1:8000/api/premium/calculate?weekly_income=6000&zone=HSR Layout&rain_intensity=0.4&traffic=0.1&aqi=150&uv_index=1"
      );
      const data = await response.json();
      console.log("API RESPONSE:", data); // Check your browser console for this!
      setRiskData(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching AI risk:", error);
      setLoading(false);
    }
  };
  fetchRisk();
}, []);

  return (
    <div className="home-page">
      {/* 1. Header */}
      <div className="home-header">
        <div className="user-info">
          <h1>Welcome, Rajesh</h1>
          <div className="zone-info">
            <MapPin size={16} />
            <span>{riskData ? riskData.zone : "South Delhi"}</span>
          </div>
        </div>
        <button className="notification-btn">
          <Bell size={24} />
          <span className="notification-badge">2</span>
        </button>
      </div>

      {/* 2. Status Cards */}
      <div className="status-cards-container">
        <div className="coverage-status-card">
          <div className="status-header">
            <Shield size={24} />
            <div>
              <h3>Coverage Active</h3>
              <p>Protected until Mar 30, 2026</p>
            </div>
          </div>
          <div className="status-badge active">Active</div>
        </div>

        <div className="earnings-card">
          <div className="earnings-header">
            <TrendingUp size={20} />
            <span>This Week's Earnings</span>
          </div>
          <div className="earnings-amount">₹4,250</div>
        </div>
      </div>

      {/* 3. AI Section */}
      <div className="section-header">
        <h2>System Intelligence</h2>
        <p>AI-driven hyper-local risk profiling</p>
      </div>

      {loading ? (
        <div className="loading-card">
          <p>Syncing with Weather Oracle...</p>
        </div>
      ) : (
        <>
          {riskData && <LiveRiskTracker riskData={riskData} />}

          <div className="section-header">
            <h2>Environmental Sensors</h2>
            <p>Real-time trigger monitoring</p>
          </div>

          <div className="triggers-grid">
            {(riskData?.triggers_detected ? [
              { id: 1, label: 'Rainfall', percentage: (riskData.triggers_detected.rain || 0) * 100, forecast: riskData.triggers_detected.rain > 0.6 ? 'High Risk' : 'Stable' },
              { id: 2, label: 'Air Quality', percentage: ((riskData.triggers_detected.aqi || 0) / 500) * 100, forecast: riskData.triggers_detected.aqi > 200 ? 'Hazardous' : 'Good' },
              { id: 3, label: 'Traffic', percentage: (riskData.triggers_detected.traffic || 0) * 100, forecast: 'Live congestion' },
              { id: 4, label: 'UV Index', percentage: ((riskData.triggers_detected.uv || 0) / 15) * 100, forecast: 'Sun intensity' },
            ] : mockTriggers).map((trigger) => (
              <div key={trigger.id} className="trigger-card">
                <CircularProgress percentage={Math.round(trigger.percentage)} size={80} strokeWidth={6} />
                <div className="trigger-info">
                  <h4>{trigger.label}</h4>
                  <p>{trigger.forecast}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* 4. Alerts */}
      <div className="section-header">
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