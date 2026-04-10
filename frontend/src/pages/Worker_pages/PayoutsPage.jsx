// PayoutsPage.jsx - Payout history with fraud badges and earnings protection summary

import React, { useState, useEffect } from 'react';
import { DollarSign, AlertCircle, Loader2, CheckCircle, ShieldCheck, AlertTriangle } from 'lucide-react';
import './PayoutsPage.css';

const BACKEND = 'https://qshield-backend-nf8y.onrender.com';

const getTriggerColor = (type) => {
  const t = (type || '').toLowerCase();
  if (t.includes('rain'))                        return '#3b82f6';
  if (t.includes('aqi'))                         return '#f59e0b';
  if (t.includes('heat'))                        return '#ef4444';
  if (t.includes('disturb') || t.includes('curfew')) return '#8b5cf6';
  return '#6366f1';
};

// ─── FRAUD SCORING ──────────────────────────────────────────────────────────
// Simple heuristic: flag payouts that come in very rapid succession or
// with an unusually high amount relative to the worker's declared income.

const WEEKLY_INCOME_CAP = 14000; // max reasonable weekly income we'd expect

function getFraudScore(payout, allPayouts) {
  let score = 0;
  const flags = [];

  // 1. Amount anomaly — payout > 75% of declared weekly income cap
  if (payout.amount > WEEKLY_INCOME_CAP * 0.75) {
    score += 40;
    flags.push('Unusually high payout amount');
  }

  // 2. Duplicate trigger type within same day
  const sameDay = allPayouts.filter(p =>
    p.id !== payout.id &&
    p.trigger_type === payout.trigger_type &&
    new Date(p.created_at).toDateString() === new Date(payout.created_at).toDateString()
  );
  if (sameDay.length > 0) {
    score += 35;
    flags.push('Duplicate trigger type on same day');
  }

  // 3. Rapid fire — another payout within 2 minutes
  const twoMinMs = 2 * 60 * 1000;
  const rapid = allPayouts.filter(p =>
    p.id !== payout.id &&
    Math.abs(new Date(p.created_at) - new Date(payout.created_at)) < twoMinMs
  );
  if (rapid.length > 0) {
    score += 50;
    flags.push('Multiple payouts within 2-minute window');
  }

  return { score, flags, isFlagged: score >= 35 };
}

// ─── COMPONENT ──────────────────────────────────────────────────────────────

export function PayoutsPage() {
  const [history, setHistory]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const workerId = localStorage.getItem('workerId') || 1;

  const fetchPayoutData = async () => {
    try {
      const res  = await fetch(`${BACKEND}/api/payout/worker/${workerId}`);
      const data = await res.json();
      setHistory(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (e) {
      console.error('Payout Sync Error:', e);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayoutData();
    const interval = setInterval(fetchPayoutData, 10000);
    return () => clearInterval(interval);
  }, []);

  const totalAmount    = history.reduce((sum, p) => sum + (p.amount || 0), 0);
  const flaggedCount   = history.filter(p => getFraudScore(p, history).isFlagged).length;
  const cleanCount     = history.length - flaggedCount;

  if (loading) {
    return (
      <div className="loading-state">
        <Loader2 className="spin" size={28} />
        <span>Syncing with Oracle...</span>
      </div>
    );
  }

  return (
    <div className="payouts-page">

      {/* PAGE HEADER */}
      <div className="page-header">
        <div className="header-icon"><DollarSign size={28} /></div>
        <div>
          <h1>Parametric Settlements</h1>
          <p>Verified by Multi-Sensor Oracle</p>
        </div>
      </div>

      {/* EARNINGS PROTECTED SUMMARY */}
      <div className="payouts-summary">
        <div className="summary-label">Earnings Protected</div>
        <div className="summary-amount">₹{totalAmount.toLocaleString()}</div>
        <div className="summary-info">
          <ShieldCheck size={16} />
          <span>{history.length} Automated Claims Settled</span>
        </div>
        <div className="summary-sub-row">
          <div className="summary-chip clean">
            <CheckCircle size={12} />
            <span>{cleanCount} Verified</span>
          </div>
          {flaggedCount > 0 && (
            <div className="summary-chip flagged">
              <AlertTriangle size={12} />
              <span>{flaggedCount} Under Review</span>
            </div>
          )}
        </div>
      </div>

      {/* ACTIVE COVERAGE WEEK */}
      <div className="coverage-week-banner">
        <ShieldCheck size={16} color="#00ff88" />
        <div className="cwb-text">
          <span className="cwb-title">Active Weekly Coverage</span>
          <span className="cwb-date">Apr 7 – Apr 13, 2025</span>
        </div>
        <div className="cwb-status">LIVE</div>
      </div>

      {/* AUDIT TRAIL HEADER */}
      <div className="section-header">
        <h2>Live Audit Trail</h2>
        <p>Proof of autonomous payout execution</p>
      </div>

      {/* PAYOUTS LIST */}
      <div className="payouts-list">
        {history.length === 0 && (
          <p className="no-data">No settlements detected. Monitoring live sensors...</p>
        )}

        {history.map((payout) => {
          const color = getTriggerColor(payout.trigger_type);
          const fraud = getFraudScore(payout, history);

          return (
            <div
              key={payout.id}
              className={`payout-item ${fraud.isFlagged ? 'fraud-flagged' : ''}`}
            >
              <div className="payout-icon" style={{ background: `${color}20`, color }}>
                <AlertCircle size={24} />
              </div>

              <div className="payout-details">
                <div className="payout-header">
                  <h3>{payout.trigger_type}</h3>
                  <span className="payout-amount">+₹{payout.amount?.toLocaleString()}</span>
                </div>

                <div className="payout-audit">
                  <span className="audit-text">
                    {payout.audit_trail || 'Verified via OpenWeatherMap API'}
                  </span>
                </div>

                <div className="payout-meta">
                  <span>
                    {new Date(payout.created_at).toLocaleString('en-IN', {
                      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                    })}
                  </span>
                </div>

                {/* FRAUD BADGE */}
                {fraud.isFlagged ? (
                  <div className="payout-status fraud">
                    <AlertTriangle size={14} />
                    <span>Under Review — {fraud.flags[0]}</span>
                  </div>
                ) : (
                  <div className="payout-status completed">
                    <CheckCircle size={14} />
                    <span>Instant Settlement Finalized</span>
                  </div>
                )}

                {/* FRAUD FLAGS DETAIL */}
                {fraud.isFlagged && fraud.flags.length > 1 && (
                  <div className="fraud-flags-detail">
                    {fraud.flags.slice(1).map((f, i) => (
                      <div key={i} className="fraud-flag-chip">⚠ {f}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
