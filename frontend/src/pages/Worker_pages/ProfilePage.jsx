import { User, Phone, MapPin, Briefcase, LogOut, Settings, Shield, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './ProfilePage.css';

export function ProfilePage() {
  const navigate = useNavigate();

  // ✅ Get real user data
  const name = localStorage.getItem("workerName") || "User";
  const zone = localStorage.getItem("workerZone") || "N/A";
  const income = localStorage.getItem("workerIncome") || "N/A";

  // 🔥 ADD THESE TWO
  const phone = localStorage.getItem("workerPhone") || "Not available";
  const platform = localStorage.getItem("workerPlatform") || "Not available";

  const handleLogout = () => {
    localStorage.clear();
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
        <h2>{name}</h2>
        <p className="profile-member-since">Member since Jan 2026</p>
      </div>

      <div className="section-header">
        <h2>Personal Information</h2>
      </div>

      <div className="info-section">

        <div className="info-item">
          <div className="info-icon"><User size={20} /></div>
          <div className="info-content">
            <span className="info-label">Full Name</span>
            <span className="info-value">{name}</span>
          </div>
        </div>

        <div className="info-item">
          <div className="info-icon"><Phone size={20} /></div>
          <div className="info-content">
            <span className="info-label">Phone Number</span>
            <span className="info-value">{phone}</span> {/* ✅ FIXED */}
          </div>
        </div>

        <div className="info-item">
          <div className="info-icon"><Briefcase size={20} /></div>
          <div className="info-content">
            <span className="info-label">Platform</span>
            <span className="info-value">{platform}</span> {/* ✅ FIXED */}
          </div>
        </div>

        <div className="info-item">
          <div className="info-icon"><MapPin size={20} /></div>
          <div className="info-content">
            <span className="info-label">Zone</span>
            <span className="info-value">{zone}</span>
          </div>
        </div>

        <div className="info-item">
          <div className="info-icon"><Briefcase size={20} /></div>
          <div className="info-content">
            <span className="info-label">Weekly Income</span>
            <span className="info-value">₹ {income}</span>
          </div>
        </div>

      </div>

      <div className="section-header">
        <h2>Settings & Support</h2>
      </div>

      <div className="settings-section">
        <button className="settings-item">
          <Settings size={20} />
          <span>Account Settings</span>
        </button>

        <button className="settings-item">
          <Shield size={20} />
          <span>Privacy & Security</span>
        </button>

        <button className="settings-item">
          <HelpCircle size={20} />
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