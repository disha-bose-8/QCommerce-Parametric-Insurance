import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Home, Shield, DollarSign, AlertTriangle, User } from 'lucide-react';
import './DashboardLayout.css';

export function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { path: '/dashboard', icon: Home, label: 'Home' },
    { path: '/dashboard/coverage', icon: Shield, label: 'Coverage' },
    { path: '/dashboard/payouts', icon: DollarSign, label: 'Payouts' },
    { path: '/dashboard/alerts', icon: AlertTriangle, label: 'Alerts' },
    { path: '/dashboard/profile', icon: User, label: 'Profile' },
  ];

 const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="dashboard-layout">
      <div className="dashboard-content">
        <Outlet />
      </div>
      
      <nav className="bottom-nav">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.path);
          
          return (
            <button
              key={tab.path}
              className={`nav-item ${active ? 'active' : ''}`}
              onClick={() => navigate(tab.path)}
            >
              <Icon size={24} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
