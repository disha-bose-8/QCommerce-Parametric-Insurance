import { Shield, TrendingUp, MapPin, Bell } from 'lucide-react';
import { CircularProgress } from '../../components/Worker_components/CircularProgress';
import './HomePage.css';

const mockTriggers = [
  { id: 1, type: 'rain', label: 'Heavy Rain', percentage: 85, forecast: 'High risk next 6 hours' },
  { id: 2, type: 'aqi', label: 'Air Quality', percentage: 25, forecast: 'Good conditions' },
  { id: 3, type: 'curfew', label: 'Curfew Risk', percentage: 5, forecast: 'Low risk today' },
  { id: 4, type: 'outage', label: 'Platform', percentage: 15, forecast: 'Stable operations' },
];

const recentAlerts = [
  {
    id: 1,
    type: 'rain',
    message: 'Heavy rain detected in your zone',
    time: '2 hours ago',
    status: 'monitoring',
  },
  {
    id: 2,
    type: 'platform',
    message: 'Platform downtime - We\'re monitoring the situation',
    time: '5 hours ago',
    status: 'monitoring',
  },
];

export function HomePage() {
  return (
    <div className="home-page">
      <div className="home-header">
        <div className="user-info">
          <h1>Welcome, Rajesh</h1>
          <div className="zone-info">
            <MapPin size={16} />
            <span>South Delhi</span>
          </div>
        </div>
        <button className="notification-btn">
          <Bell size={24} />
          <span className="notification-badge">2</span>
        </button>
      </div>

      <div className="coverage-status-card">
        <div className="status-header">
          <div className="status-icon">
            <Shield size={24} />
          </div>
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
        <div className="earnings-info">
          <span className="earnings-change positive">+12% from last week</span>
        </div>
      </div>

      <div className="section-header">
        <h2>Today's Risk Levels</h2>
        <p>Real-time trigger monitoring</p>
      </div>

      <div className="triggers-grid">
        {mockTriggers.map((trigger) => (
          <div key={trigger.id} className="trigger-card">
            <CircularProgress 
              percentage={trigger.percentage} 
              size={100}
              strokeWidth={8}
            />
            <div className="trigger-info">
              <h4>{trigger.label}</h4>
              <p>{trigger.forecast}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="section-header">
        <h2>Recent Alerts</h2>
        <p>Stay updated on active triggers</p>
      </div>

      <div className="alerts-list">
        {recentAlerts.map((alert) => (
          <div key={alert.id} className="alert-item">
            <div className="alert-icon">
              <Bell size={20} />
            </div>
            <div className="alert-content">
              <p className="alert-message">{alert.message}</p>
              <span className="alert-time">{alert.time}</span>
            </div>
            <div className="alert-status monitoring">Monitoring</div>
          </div>
        ))}
      </div>
    </div>
  );
}
