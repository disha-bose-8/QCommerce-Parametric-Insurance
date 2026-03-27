import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { LogOut } from 'lucide-react';
import StatCards from "../../components/Admin_components/StatCards";
import ZoneTable from "../../components/Admin_components/ZoneTable";
import WorkerList from "../../components/Admin_components/WorkerList";
import PayoutLog from "../../components/Admin_components/PayoutLog";
import FraudFlags from "../../components/Admin_components/FraudFlags";
import TriggerCheck from "../../components/Admin_components/TriggerCheck";
import './AdminDashboard.css';

const mockStats = {
  active_policies: 1284,
  total_workers: 1891,
  weekly_premium_pool: 359520,
  total_payouts: 187400,
  loss_ratio: 0.52,
};

const mockZoneData = [
  { zone: 'Bengaluru Koramangala', trigger: 'Heavy Rain', count: 6 },
  { zone: 'Bengaluru Whitefield', trigger: 'Severe AQI', count: 4 },
  { zone: 'Bengaluru Indiranagar', trigger: 'Platform Outage', count: 3 },
  { zone: 'Bengaluru HSR Layout', trigger: 'Extreme Heat', count: 5 },
  { zone: 'Bengaluru Jayanagar', trigger: 'Heavy Rain', count: 7 },
];

const mockWorkers = [
  { id: 1, name: 'disha', platform: 'Zepto', zone: 'Koramangala', weekly_income: 5600, premium: 168, status: 'active' },
  { id: 2, name: 'sana', platform: 'Blinkit', zone: 'Whitefield', weekly_income: 4900, premium: 147, status: 'active' },
  { id: 3, name: 'pras', platform: 'Swiggy', zone: 'Indiranagar', weekly_income: 6200, premium: 186, status: 'active' },
  { id: 4, name: 'rosh', platform: 'Zepto', zone: 'HSR Layout', weekly_income: 4200, premium: 126, status: 'active' },
  { id: 5, name: 'anw', platform: 'Blinkit', zone: 'Jayanagar', weekly_income: 5100, premium: 153, status: 'inactive' },
];

const mockPayouts = [
  { id: 1, worker: 'disha', zone: 'Koramangala', trigger: 'Heavy Rain', amount: 400, date: 'Mar 18' },
  { id: 2, worker: 'sana', zone: 'Whitefield', trigger: 'Severe AQI', amount: 300, date: 'Mar 19' },
  { id: 3, worker: 'pras', zone: 'Indiranagar', trigger: 'Platform Outage', amount: 500, date: 'Mar 20' },
  { id: 4, worker: 'rosh', zone: 'HSR Layout', trigger: 'Extreme Heat', amount: 350, date: 'Mar 21' },
  { id: 5, worker: 'anw', zone: 'Jayanagar', trigger: 'Heavy Rain', amount: 450, date: 'Mar 22' },
];

const mockFraudFlags = [
  { id: 1, worker: 'Vikram #7749', zone: 'Whitefield', score: 128, reason: 'Social graph clustering', status: 'blocked' },
  { id: 2, worker: 'Unknown #3821', zone: 'HSR Layout', score: 81, reason: 'Zero order activity', status: 'reviewing' },
];

export function AdminDashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role !== 'admin') {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('role');
    navigate('/');
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div className="header-left">
          <h1 className="dashboard-title">QShield - Admin Dashboard</h1>
          <p className="admin-subtitle">Week of Mar 22 – 28, 2026</p>
        </div>

        <button className="btn-admin-logout" onClick={handleLogout}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>

      <div className="admin-content">
        <StatCards stats={mockStats} />
        <WorkerList workers={mockWorkers} />
        <ZoneTable zoneData={mockZoneData} />
        <PayoutLog payouts={mockPayouts} />
        <FraudFlags fraudFlags={mockFraudFlags} />
        <TriggerCheck />
      </div>
    </div>
  );
}