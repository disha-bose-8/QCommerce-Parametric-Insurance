import { DollarSign, CloudRain, Wind, AlertCircle, Wifi } from 'lucide-react';
import './PayoutsPage.css';

const payouts = [
  {
    id: 1,
    trigger: 'Heavy Rain',
    type: 'rain',
    amount: 450,
    date: 'Mar 25, 2026',
    time: '2:30 PM',
    status: 'completed',
    duration: '4 hours',
    icon: CloudRain,
  },
  {
    id: 2,
    trigger: 'Poor Air Quality',
    type: 'aqi',
    amount: 280,
    date: 'Mar 22, 2026',
    time: '9:00 AM',
    status: 'completed',
    duration: '6 hours',
    icon: Wind,
  },
  {
    id: 3,
    trigger: 'Platform Outage',
    type: 'outage',
    amount: 520,
    date: 'Mar 20, 2026',
    time: '11:45 AM',
    status: 'completed',
    duration: '3 hours',
    icon: Wifi,
  },
  {
    id: 4,
    trigger: 'Heavy Rain',
    type: 'rain',
    amount: 380,
    date: 'Mar 18, 2026',
    time: '4:15 PM',
    status: 'completed',
    duration: '5 hours',
    icon: CloudRain,
  },
  {
    id: 5,
    trigger: 'Curfew Alert',
    type: 'curfew',
    amount: 750,
    date: 'Mar 15, 2026',
    time: '6:00 PM',
    status: 'completed',
    duration: '8 hours',
    icon: AlertCircle,
  },
];

const getTriggerColor = (type) => {
  switch (type) {
    case 'rain':
      return '#3b82f6';
    case 'aqi':
      return '#f59e0b';
    case 'outage':
      return '#ef4444';
    case 'curfew':
      return '#8b5cf6';
    default:
      return '#6366f1';
  }
};

export function PayoutsPage() {
  const totalPayouts = payouts.reduce((sum, payout) => sum + payout.amount, 0);

  return (
    <div className="payouts-page">
      <div className="page-header">
        <div className="header-icon">
          <DollarSign size={28} />
        </div>
        <div>
          <h1>Payouts</h1>
          <p>Your triggered insurance claims</p>
        </div>
      </div>

      <div className="payouts-summary">
        <div className="summary-label">Total Payouts This Month</div>
        <div className="summary-amount">₹{totalPayouts.toLocaleString()}</div>
        <div className="summary-info">
          <span className="summary-count">{payouts.length} payouts</span>
          <span className="summary-dot">•</span>
          <span className="summary-status">All processed</span>
        </div>
      </div>

      <div className="section-header">
        <h2>Payout History</h2>
        <p>Automatic payouts when triggers are confirmed</p>
      </div>

      <div className="payouts-list">
        {payouts.map((payout) => {
          const Icon = payout.icon;
          const color = getTriggerColor(payout.type);
          
          return (
            <div key={payout.id} className="payout-item">
              <div className="payout-icon" style={{ background: `${color}20`, color }}>
                <Icon size={24} />
              </div>
              <div className="payout-details">
                <div className="payout-header">
                  <h3>{payout.trigger}</h3>
                  <span className="payout-amount">+₹{payout.amount}</span>
                </div>
                <div className="payout-meta">
                  <span>{payout.date}</span>
                  <span className="meta-dot">•</span>
                  <span>{payout.time}</span>
                  <span className="meta-dot">•</span>
                  <span>{payout.duration}</span>
                </div>
                <div className="payout-status completed">
                  <div className="status-dot"></div>
                  <span>Completed</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="info-card">
        <h3>How Payouts Work</h3>
        <ul>
          <li>Payouts are triggered automatically when conditions are met</li>
          <li>Amount depends on severity and duration of the trigger</li>
          <li>Funds are transferred within 24-48 hours of trigger confirmation</li>
          <li>No claim forms needed - fully automated process</li>
        </ul>
      </div>
    </div>
  );
}
