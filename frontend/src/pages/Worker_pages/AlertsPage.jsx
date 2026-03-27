import { AlertTriangle, CloudRain, Wind, AlertCircle, Wifi, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { CircularProgress } from '../../components/Worker_components/CircularProgress';
import './AlertsPage.css';

const forecast = [
  {
    day: 'Today',
    date: 'Mar 27',
    triggers: [
      { type: 'rain', label: 'Rain', risk: 85, trend: 'up', icon: CloudRain },
      { type: 'aqi', label: 'AQI', risk: 25, trend: 'down', icon: Wind },
      { type: 'curfew', label: 'Curfew', risk: 5, trend: 'stable', icon: AlertCircle },
      { type: 'outage', label: 'Outage', risk: 15, trend: 'stable', icon: Wifi },
    ],
  },
  {
    day: 'Tomorrow',
    date: 'Mar 28',
    triggers: [
      { type: 'rain', label: 'Rain', risk: 45, trend: 'down', icon: CloudRain },
      { type: 'aqi', label: 'AQI', risk: 30, trend: 'up', icon: Wind },
      { type: 'curfew', label: 'Curfew', risk: 5, trend: 'stable', icon: AlertCircle },
      { type: 'outage', label: 'Outage', risk: 10, trend: 'down', icon: Wifi },
    ],
  },
  {
    day: 'Mar 29',
    date: 'Friday',
    triggers: [
      { type: 'rain', label: 'Rain', risk: 20, trend: 'down', icon: CloudRain },
      { type: 'aqi', label: 'AQI', risk: 35, trend: 'up', icon: Wind },
      { type: 'curfew', label: 'Curfew', risk: 5, trend: 'stable', icon: AlertCircle },
      { type: 'outage', label: 'Outage', risk: 12, trend: 'up', icon: Wifi },
    ],
  },
];

const activeAlerts = [
  {
    id: 1,
    type: 'rain',
    severity: 'high',
    title: 'Heavy Rain Alert',
    message: 'Heavy rainfall detected in South Delhi. Monitoring conditions for potential payout trigger.',
    time: '2 hours ago',
    status: 'monitoring',
  },
  {
    id: 2,
    type: 'outage',
    severity: 'medium',
    title: 'Platform Monitoring',
    message: 'Platform experiencing intermittent issues. We\'re monitoring the situation closely.',
    time: '5 hours ago',
    status: 'monitoring',
  },
];

const getTrendIcon = (trend) => {
  if (trend === 'up') return <TrendingUp size={14} className="trend-icon up" />;
  if (trend === 'down') return <TrendingDown size={14} className="trend-icon down" />;
  return <Minus size={14} className="trend-icon stable" />;
};

const getSeverityColor = (severity) => {
  switch (severity) {
    case 'high':
      return '#ef4444';
    case 'medium':
      return '#f97316';
    case 'low':
      return '#22c55e';
    default:
      return '#6366f1';
  }
};

export function AlertsPage() {
  return (
    <div className="alerts-page">
      <div className="page-header">
        <div className="header-icon">
          <AlertTriangle size={28} />
        </div>
        <div>
          <h1>Alerts</h1>
          <p>Zone risk forecast & notifications</p>
        </div>
      </div>

      {activeAlerts.length > 0 && (
        <>
          <div className="section-header">
            <h2>Active Alerts</h2>
            <p>Currently monitoring these triggers</p>
          </div>

          <div className="active-alerts-list">
            {activeAlerts.map((alert) => (
              <div key={alert.id} className="active-alert-item" style={{ borderLeftColor: getSeverityColor(alert.severity) }}>
                <div className="alert-header-row">
                  <h3>{alert.title}</h3>
                  <span className={`severity-badge ${alert.severity}`}>
                    {alert.severity}
                  </span>
                </div>
                <p className="alert-message">{alert.message}</p>
                <div className="alert-footer-row">
                  <span className="alert-time">{alert.time}</span>
                  <span className="alert-status-badge monitoring">
                    <div className="pulse-dot"></div>
                    Monitoring
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="section-header">
        <h2>3-Day Forecast</h2>
        <p>Risk levels for your zone</p>
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
                  <div key={trigger.type} className="trigger-forecast-card">
                    <div className="trigger-forecast-header">
                      <Icon size={20} />
                      <span>{trigger.label}</span>
                      {getTrendIcon(trigger.trend)}
                    </div>
                    <CircularProgress 
                      percentage={trigger.risk} 
                      size={80}
                      strokeWidth={6}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="info-card-alerts">
        <h3>About Risk Forecasting</h3>
        <p>
          Our AI-powered system monitors weather, air quality, platform status, 
          and local conditions 24/7. Risk levels are updated in real-time to 
          help you plan your work and automatically trigger payouts when conditions 
          meet the threshold for extended periods.
        </p>
      </div>
    </div>
  );
}
