import { Shield, Calendar, DollarSign, Users } from 'lucide-react';
import './CoveragePage.css';

export function CoveragePage() {
  const weekDates = 'Mar 24 - Mar 30, 2026';
  const daysRemaining = 3;
  const totalPremium = 140;
  const dailyPremium = 20;
  const workerShare = 10;
  const platformShare = 10;

  return (
    <div className="coverage-page">
      <div className="page-header">
        <div className="header-icon">
          <Shield size={28} />
        </div>
        <div>
          <h1>Coverage</h1>
          <p>Your active insurance plan</p>
        </div>
      </div>

      <div className="coverage-card main">
        <div className="coverage-card-header">
          <div className="coverage-icon active">
            <Shield size={32} />
          </div>
          <div className="coverage-status">
            <h2>Coverage Active</h2>
            <p>Full protection enabled</p>
          </div>
        </div>

        <div className="coverage-divider"></div>

        <div className="coverage-details">
          <div className="detail-row">
            <div className="detail-label">
              <Calendar size={18} />
              <span>Coverage Period</span>
            </div>
            <div className="detail-value">{weekDates}</div>
          </div>

          <div className="detail-row">
            <div className="detail-label">
              <Calendar size={18} />
              <span>Days Remaining</span>
            </div>
            <div className="detail-value highlight">{daysRemaining} days</div>
          </div>
        </div>
      </div>

      <div className="section-header">
        <h2>Premium Breakdown</h2>
        <p>Affordable daily micro-premium</p>
      </div>

      <div className="premium-card daily-premium">
        <div className="premium-header">
          <DollarSign size={24} />
          <span>Daily Premium</span>
        </div>
        <div className="premium-amount">₹{dailyPremium}/day</div>
        <p className="premium-description">
          Protect your income for just ₹{dailyPremium} per day instead of a weekly lump sum
        </p>
      </div>

      <div className="premium-split">
        <div className="split-card">
          <div className="split-icon worker">
            <DollarSign size={20} />
          </div>
          <div className="split-info">
            <span className="split-label">Your Share</span>
            <span className="split-amount">₹{workerShare}/day</span>
            <span className="split-total">₹{workerShare * 7}/week</span>
          </div>
        </div>

        <div className="split-divider">+</div>

        <div className="split-card">
          <div className="split-icon platform">
            <Users size={20} />
          </div>
          <div className="split-info">
            <span className="split-label">Platform Share</span>
            <span className="split-amount">₹{platformShare}/day</span>
            <span className="split-total">₹{platformShare * 7}/week</span>
          </div>
        </div>
      </div>

      <div className="coverage-card total">
        <div className="total-row">
          <span className="total-label">Weekly Total</span>
          <span className="total-amount">₹{totalPremium}</span>
        </div>
        <p className="total-description">
          Split between you and your platform partner
        </p>
      </div>

      <div className="coverage-benefits">
        <h3>What's Covered</h3>
        <ul className="benefits-list">
          <li>
            <Shield size={16} />
            <span>Heavy rain preventing work (₹200-500/day)</span>
          </li>
          <li>
            <Shield size={16} />
            <span>Poor air quality AQI &gt; 300 (₹150-350/day)</span>
          </li>
          <li>
            <Shield size={16} />
            <span>Government curfews (₹500-1000/day)</span>
          </li>
          <li>
            <Shield size={16} />
            <span>Platform technical outages (₹300-700/day)</span>
          </li>
        </ul>
      </div>

      <button className="btn-renew">
        Renew Coverage
      </button>
    </div>
  );
}