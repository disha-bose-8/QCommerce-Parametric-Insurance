import React, { useState, useEffect } from 'react';
import { DollarSign, CloudRain, Wind, AlertCircle, Wifi, Loader2, CheckCircle } from 'lucide-react';
import './PayoutsPage.css';

// 1. Trigger Color Helper
const getTriggerColor = (type) => {
  switch (type) {
    case 'rain': return '#3b82f6';
    case 'aqi': return '#f59e0b';
    case 'outage': return '#ef4444';
    case 'curfew': return '#8b5cf6';
    default: return '#6366f1';
  }
};

export function PayoutsPage() {
  const [livePayout, setLivePayout] = useState(null);

  // 2. Historical Data (Moved inside to be safe)
  const history = [
    { id: 1, trigger: 'Heavy Rain', type: 'rain', amount: 450, date: 'Mar 25, 2026', duration: '4 hours', icon: CloudRain },
    { id: 2, trigger: 'Poor Air Quality', type: 'aqi', amount: 280, date: 'Mar 22, 2026', duration: '6 hours', icon: Wind },
    { id: 3, trigger: 'Platform Outage', type: 'outage', amount: 520, date: 'Mar 20, 2026', duration: '3 hours', icon: Wifi },
    { id: 4, trigger: 'Curfew Alert', type: 'curfew', amount: 750, date: 'Mar 15, 2026', duration: '8 hours', icon: AlertCircle },
  ];

  // 3. Live AI Trigger Check
  useEffect(() => {
    const checkLiveTrigger = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/premium/calculate?weekly_income=7000&zone=HSR Layout&rain_intensity=0.8&aqi=350");
        const data = await response.json();
        
        // If rain or AQI is high, show the live processing card
        if (data.triggers_detected.rain > 0.6 || data.triggers_detected.aqi > 300) {
          setLivePayout({
            id: 'live-now',
            trigger: data.triggers_detected.rain > 0.6 ? 'Heavy Rain Alert' : 'AQI Emergency',
            type: data.triggers_detected.rain > 0.6 ? 'rain' : 'aqi',
            amount: data.triggers_detected.rain > 0.6 ? 450 : 250,
            status: 'Processing'
          });
        }
      } catch (e) { console.error("Payout API error:", e); }
    };
    checkLiveTrigger();
  }, []);

  const totalHistoryAmount = history.reduce((sum, p) => sum + p.amount, 0);
  const liveAmount = livePayout ? livePayout.amount : 0;

  return (
    <div className="payouts-page">
      <div className="page-header">
        <div className="header-icon"><DollarSign size={28} /></div>
        <div>
          <h1>Payouts</h1>
          <p>Parametric settlement history</p>
        </div>
      </div>

      <div className="payouts-summary">
        <div className="summary-label">Total Monthly Protection</div>
        <div className="summary-amount">₹{(totalHistoryAmount + liveAmount).toLocaleString()}</div>
        <div className="summary-info">
          <span>{history.length + (livePayout ? 1 : 0)} Automated Settlements</span>
        </div>
      </div>

      <div className="section-header">
        <h2>Recent Activity</h2>
        <p>Live monitoring & past credits</p>
      </div>

      <div className="payouts-list">
        {/* LIVE/PENDING CARD */}
        {livePayout && (
          <div className="payout-item live-processing">
            <div className="payout-icon processing">
              <Loader2 size={24} className="spin-icon" />
            </div>
            <div className="payout-details">
              <div className="payout-header">
                <h3>{livePayout.trigger}</h3>
                <span className="payout-amount processing">+₹{livePayout.amount}</span>
              </div>
              <div className="payout-status">
                <span className="status-label">AI Oracle calculating duration...</span>
              </div>
            </div>
          </div>
        )}

        {/* HISTORICAL CARDS */}
        {history.map((payout) => {
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
                  <span>{payout.date} • {payout.duration}</span>
                </div>
                <div className="payout-status completed">
                  <CheckCircle size={14} />
                  <span>Settled</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}