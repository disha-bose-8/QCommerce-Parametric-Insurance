import React from 'react';
import { CloudRain, Wind, Thermometer, Globe, ShieldCheck } from 'lucide-react';
import './LiveRiskTracker.css';

const LiveRiskTracker = ({ triggerData }) => {

  const rain = triggerData?.rain?.raw_value || 0;
  const aqi = triggerData?.aqi?.raw_value || 0;
  const temp = triggerData?.heat?.raw_value || 0;
  const uv = triggerData?.heat?.uv_index || 0;
  const platformUp = !triggerData?.outage?.confirmed;

  // unified thresholds (same as AlertsPage)
  const isRainHigh = rain > 20;
  const isAQIHigh = aqi > 350;
  const isHeatHigh = temp > 42;
  const isPlatformDown = !platformUp;

  // simulated risk score (since new API doesn't provide one)
  const riskFactor = (
    (isRainHigh ? 0.02 : 0) +
    (isAQIHigh ? 0.02 : 0) +
    (isHeatHigh ? 0.02 : 0) +
    (isPlatformDown ? 0.02 : 0)
  );

  const getStatusColor = (val, high, mid) => {
    if (val >= high) return 'status-danger';
    if (val >= mid) return 'status-warning';
    return 'status-safe';
  };

  const heatStressTriggered = temp >= 42 || (temp >= 40 && uv >= 8);

  return (
    <div className="risk-tracker-container">

      {/* HEADER */}
      <div className="risk-header">
        <ShieldCheck
          size={24}
          color={riskFactor > 0.045 ? "#ff4d4d" : "#00ff88"}
        />
        <h3>Live Protection Status</h3>

        <span className={`risk-badge ${getStatusColor(riskFactor, 0.05, 0.02)}`}>
          {(riskFactor * 100).toFixed(1)}% Risk
        </span>
      </div>

      {/* GRID */}
      <div className="trigger-grid">

        {/* Rain */}
        <div className={`trigger-card ${getStatusColor(rain, 20, 10)}`}>
          <CloudRain size={20} />
          <span>
            Rain: {rain > 20 ? "Heavy" : "Clear"} ({Math.round((rain / 20) * 100)}%)
          </span>
          <span className="trigger-tag">💰 Payout</span>
        </div>

        {/* AQI */}
        <div className={`trigger-card ${getStatusColor(aqi, 350, 200)}`}>
          <Wind size={20} />
          <span>AQI: {aqi}</span>
          <span className="trigger-tag">💰 Payout</span>
        </div>

        {/* Heat + UV */}
        <div className={`trigger-card ${heatStressTriggered ? 'status-danger' : 'status-safe'}`}>
          <Thermometer size={20} />
          <span>Heat: {temp}°C · UV: {uv}</span>
          <span className="trigger-tag">💰 Payout</span>
        </div>

        {/* Platform */}
        <div className={`trigger-card ${isPlatformDown ? 'status-danger' : 'status-safe'}`}>
          <Globe size={20} />
          <span>Platform: {platformUp ? "Online" : "Outage"}</span>
          <span className="trigger-tag">💰 Payout</span>
        </div>

      </div>
    </div>
  );
};

export default LiveRiskTracker;