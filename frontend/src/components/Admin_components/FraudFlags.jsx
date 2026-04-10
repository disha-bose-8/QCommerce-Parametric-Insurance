import { AlertTriangle } from 'lucide-react';
import './FraudFlags.css';

export default function FraudFlags({ fraudFlags = [] }) {
  const getScoreColor = (score) => {
    if (score >= 100) return '#ef4444';
    if (score >= 75) return '#f97316';
    return '#f59e0b';
  };

  return (
    <div className="admin-section">
      <div className="section-header">
        <div className="section-title-group">
          <AlertTriangle size={24} className="section-icon" />
          <h2>Fraud Detection Flags</h2>
        </div>
        <span className="section-badge alert">
          {fraudFlags.length} flags
        </span>
      </div>

      <div className="fraud-list">
        {fraudFlags.map((flag) => (
          <div key={flag.id} className="fraud-card">
            <div className="fraud-header">
              <div className="fraud-worker-info">
                <span className="fraud-worker">{flag.worker}</span>
                <span className="fraud-zone">{flag.zone}</span>
              </div>

              <div
                className="fraud-score"
                style={{
                  background: `${getScoreColor(flag.score)}20`,
                  color: getScoreColor(flag.score),
                }}
              >
                {flag.score}
              </div>
            </div>

            <p className="fraud-reason">{flag.reason}</p>

            <div className="fraud-footer">
              <span className={`fraud-status-badge ${flag.status}`}>
                {flag.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}