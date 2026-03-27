import { useNavigate } from 'react-router-dom';
import { Shield, Zap } from 'lucide-react';
import './StartPage.css';

export function StartPage() {
  const navigate = useNavigate();

  return (
    <div className="start-page">
      <div className="start-content">
        <div className="logo-section">
          <div className="logo-icon">
            <Shield size={64} strokeWidth={2} />
          </div>
          <h1 className="app-name">QShield</h1>
          <p className="app-tagline">AI-Powered Parametric Insurance</p>
        </div>

        <div className="info-section">
          <div className="info-card">
            <Zap className="info-icon" size={24} />
            <h3>Instant Payouts</h3>
            <p>Get paid automatically when triggers happen</p>
          </div>
          <div className="info-card">
            <Shield className="info-icon" size={24} />
            <h3>Protect Your Income</h3>
            <p>Coverage for rain, AQI, curfews & platform outages</p>
          </div>
          <div className="info-card">
            <Zap className="info-icon" size={24} />
            <h3>Just ₹20/Day</h3>
            <p>Affordable micro-premiums for gig workers</p>
          </div>
        </div>

        <div className="action-buttons">
          <button 
            className="btn-primary"
            onClick={() => navigate('/login')}
          >
            Login
          </button>
          <button 
            className="btn-secondary"
            onClick={() => navigate('/register')}
          >
            Register
          </button>
        </div>

        <p className="footer-text">Securing gig workers across India</p>
      </div>
    </div>
  );
}
