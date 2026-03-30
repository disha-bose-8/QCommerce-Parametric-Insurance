import React, { useState, useEffect } from 'react'; // Added hooks
import { AlertTriangle, CloudRain, Wind, AlertCircle, Wifi, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { CircularProgress } from '../../components/Worker_components/CircularProgress';
import './AlertsPage.css';

export function AlertsPage() {
  // 1. STATE FOR REAL-TIME DATA
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 2. FETCH LIVE DATA
  useEffect(() => {
    const fetchRisk = async () => {
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/api/premium/calculate?weekly_income=6000&zone=HSR Layout&rain_intensity=0.8&traffic=0.7&aqi=350&uv_index=11"
        );
        const data = await response.json();
        setRiskData(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching live alerts:", error);
        setLoading(false);
      }
    };
    fetchRisk();
  }, []);

  // 3. DYNAMIC FORECAST GENERATION
  const triggers = riskData?.triggers_detected || {};
  
  const forecast = [
    {
      day: 'Today',
      date: 'Mar 30',
      // We map the REAL API values to your UI structure
      triggers: [
        { type: 'rain', label: 'Rain', risk: (triggers.rain || 0) * 100, trend: 'up', icon: CloudRain },
        { type: 'aqi', label: 'AQI', risk: ((triggers.aqi || 0) / 500) * 100, trend: 'stable', icon: Wind },
        { type: 'traffic', label: 'Traffic', risk: (triggers.traffic || 0) * 100, trend: 'up', icon: AlertCircle },
        { type: 'uv', label: 'UV Index', risk: ((triggers.uv || 0) / 15) * 100, trend: 'stable', icon: Wifi },
      ],
    },
    // Keep Tomorrow and Day after as static mocks for the demo
    {
      day: 'Tomorrow',
      date: 'Mar 31',
      triggers: [
        { type: 'rain', label: 'Rain', risk: 45, trend: 'down', icon: CloudRain },
        { type: 'aqi', label: 'AQI', risk: 30, trend: 'up', icon: Wind },
        { type: 'traffic', label: 'Traffic', risk: 15, trend: 'down', icon: AlertCircle },
        { type: 'uv', label: 'UV Index', risk: 10, trend: 'down', icon: Wifi },
      ],
    },
  ];

  // Logic for severity color (Existing)
  const getSeverityColor = (severity) => {
    if (severity === 'high') return '#ef4444';
    if (severity === 'medium') return '#f97316';
    return '#22c55e';
  };

  const getTrendIcon = (trend) => {
    if (trend === 'up') return <TrendingUp size={14} className="trend-icon up" color="#ff4d4d"/>;
    if (trend === 'down') return <TrendingDown size={14} className="trend-icon down" color="#00ff88"/>;
    return <Minus size={14} className="trend-icon stable" />;
  };

  return (
    <div className="alerts-page">
      <div className="page-header">
        <div className="header-icon"><AlertTriangle size={28} /></div>
        <div>
          <h1>Alerts</h1>
          <p>Zone risk forecast & live monitoring</p>
        </div>
      </div>

      {/* ACTIVE ALERTS SECTION (Live-Driven) */}
      <div className="section-header">
        <h2>Active Alerts</h2>
        <p>Currently monitoring these triggers</p>
      </div>

      <div className="active-alerts-list">
        {triggers.rain > 0.6 && (
          <div className="active-alert-item" style={{ borderLeft: '4px solid #ef4444' }}>
            <div className="alert-header-row">
              <h3>Heavy Rain Detected</h3>
              <span className="severity-badge high">High</span>
            </div>
            <p className="alert-message">Precipitation levels at {Math.round(triggers.rain * 100)}%. Payout eligibility monitoring active.</p>
          </div>
        )}
        {triggers.aqi > 250 && (
          <div className="active-alert-item" style={{ borderLeft: '4px solid #f97316' }}>
            <div className="alert-header-row">
              <h3>AQI Warning</h3>
              <span className="severity-badge medium">Medium</span>
            </div>
            <p className="alert-message">Hazardous air quality ({triggers.aqi}). Health protection coverage initiated.</p>
          </div>
        )}
      </div>

      <div className="section-header">
        <h2>3-Day Forecast</h2>
        <p>Real-time risk prediction</p>
      </div>

      <div className="forecast-list">
        {forecast.map((day, idx) => (
          <div key={idx} className="forecast-day">
            <div className="day-header">
              <h3>{day.day}</h3>
              <span className="day-date">{day.date}</span>
            </div>
            <div className="triggers-grid-forecast">
              {day.triggers.map((trigger) => {
                const Icon = trigger.icon;
                return (
                  <div key={trigger.label} className="trigger-forecast-card">
                    <div className="trigger-forecast-header">
                      <Icon size={20} />
                      <span>{trigger.label}</span>
                      {getTrendIcon(trigger.trend)}
                    </div>
                    <CircularProgress 
                      percentage={Math.round(trigger.risk)} 
                      size={70}
                      strokeWidth={6}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}