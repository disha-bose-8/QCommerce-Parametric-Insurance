import React from 'react';
import { CloudRain, Wind, Car, Sun, ShieldCheck, AlertTriangle } from 'lucide-react';
import './LiveRiskTracker.css';

const LiveRiskTracker = ({ riskData }) => {
  // 1. Extract the triggers object from the response
  const triggers = riskData?.triggers_detected || {};
  
  // 2. MATCH THE FASTAPI NAMES EXACTLY
  const rain = triggers.rain || 0;    // Was rain_intensity
  const traffic = triggers.traffic || 0; 
  const aqi = triggers.aqi || 0;
  const uv = triggers.uv || 0;
  const riskFactor = riskData?.risk_factor || 0.03;

  const getStatusColor = (val, high, mid) => {
    if (val >= high) return 'status-danger';
    if (val >= mid) return 'status-warning';
    return 'status-safe';
  };

  return (
    <div className="risk-tracker-container">
      <div className="risk-header">
        <ShieldCheck size={24} color={riskFactor > 0.045 ? "#ff4d4d" : "#00ff88"} />
        <h3>Live Protection Status</h3>
        <span className={`risk-badge ${getStatusColor(riskFactor, 0.05, 0.035)}`}>
          {(riskFactor * 100).toFixed(1)}% Risk
        </span>
      </div>

      <div className="trigger-grid">
        {/* Rain Card */}
        <div className={`trigger-card ${getStatusColor(rain, 0.7, 0.3)}`}>
          <CloudRain size={20} />
          <span>Rain: {rain > 0.5 ? "Heavy" : "Clear"} ({Math.round(rain * 100)}%)</span>
        </div>

        {/* Traffic Card */}
        <div className={`trigger-card ${getStatusColor(traffic, 0.8, 0.5)}`}>
          <Car size={20} />
          <span>Traffic: {Math.round(traffic * 100)}%</span>
        </div>

        {/* AQI Card */}
        <div className={`trigger-card ${getStatusColor(aqi, 300, 150)}`}>
          <Wind size={20} />
          <span>AQI: {aqi}</span>
        </div>

        {/* UV Card */}
        <div className={`trigger-card ${getStatusColor(uv, 11, 7)}`}>
          <Sun size={20} />
          <span>UV: {uv}</span>
        </div>
      </div>
    </div>
  );
};

export default LiveRiskTracker;