import { User, Phone, MapPin, Briefcase, LogOut, Settings, Shield, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './ProfilePage.css';

export function ProfilePage() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="profile-page">
      <div className="page-header">
        <div className="header-icon">
          <User size={28} />
        </div>
        <div>
          <h1>Profile</h1>
          <p>Your account information</p>
        </div>
      </div>

      <div className="profile-card">
        <div className="profile-avatar">
          <User size={48} />
        </div>
        <h2>Rajesh Kumar</h2>
        <p className="profile-member-since">Member since Jan 2026</p>
      </div>

      <div className="section-header">
        <h2>Personal Information</h2>
      </div>

      <div className="info-section">
        <div className="info-item">
          <div className="info-icon">
            <User size={20} />
          </div>
          <div className="info-content">
            <span className="info-label">Full Name</span>
            <span className="info-value">Anwpras Rosha</span>
          </div>
        </div>

        <div className="info-item">
          <div className="info-icon">
            <Phone size={20} />
          </div>
          <div className="info-content">
            <span className="info-label">Phone Number</span>
            <span className="info-value">+91 98765 43210</span>
          </div>
        </div>

        <div className="info-item">
          <div className="info-icon">
            <Briefcase size={20} />
          </div>
          <div className="info-content">
            <span className="info-label">Platform</span>
            <span className="info-value">Blinkit</span>
          </div>
        </div>

        <div className="info-item">
          <div className="info-icon">
            <MapPin size={20} />
          </div>
          <div className="info-content">
            <span className="info-label">Zone</span>
            <span className="info-value">Kormangala</span>
          </div>
        </div>
      </div>

      <div className="section-header">
        <h2>Settings & Support</h2>
      </div>

      <div className="settings-section">
        <button className="settings-item">
          <div className="settings-icon">
            <Settings size={20} />
          </div>
          <span>Account Settings</span>
        </button>

        <button className="settings-item">
          <div className="settings-icon">
            <Shield size={20} />
          </div>
          <span>Privacy & Security</span>
        </button>

        <button className="settings-item">
          <div className="settings-icon">
            <HelpCircle size={20} />
          </div>
          <span>Help & Support</span>
        </button>
      </div>

      <button className="btn-logout" onClick={handleLogout}>
        <LogOut size={20} />
        <span>Logout</span>
      </button>

      <div className="app-version">
        QShield v1.0.0
      </div>
    </div>
  );
}
