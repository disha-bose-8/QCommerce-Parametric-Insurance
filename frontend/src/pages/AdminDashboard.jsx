/*import StatCards from "../components/admin/StatCards";
import ZoneTable from "../components/admin/ZoneTable";
import WorkerList from "../components/admin/WorkerList";
import PayoutLog from "../components/admin/PayoutLog";
import FraudFlags from "../components/admin/FraudFlags";
import TriggerCheck from "../components/admin/TriggerCheck";
import '../css/admin.css'

const mockStats = {
  active_policies: 1284,
  total_workers: 1891,
  weekly_premium_pool: 359520,
  total_payouts: 187400,
  loss_ratio: 0.52,
}

const mockZoneData = [
  { zone: 'Bengaluru Koramangala', trigger: 'Heavy Rain', count: 6 },
  { zone: 'Bengaluru Whitefield', trigger: 'Severe AQI', count: 4 },
  { zone: 'Bengaluru Indiranagar', trigger: 'Platform Outage', count: 3 },
  { zone: 'Bengaluru HSR Layout', trigger: 'Extreme Heat', count: 5 },
  { zone: 'Bengaluru Jayanagar', trigger: 'Heavy Rain', count: 7 },
]

const mockWorkers = [
  { id: 1, name: 'disha', platform: 'Zepto', zone: 'Koramangala', weekly_income: 5600, premium: 168, status: 'active' },
  { id: 2, name: 'sana', platform: 'Blinkit', zone: 'Whitefield', weekly_income: 4900, premium: 147, status: 'active' },
  { id: 3, name: 'pras', platform: 'Swiggy', zone: 'Indiranagar', weekly_income: 6200, premium: 186, status: 'active' },
  { id: 4, name: 'rosh', platform: 'Zepto', zone: 'HSR Layout', weekly_income: 4200, premium: 126, status: 'active' },
  { id: 5, name: 'anw', platform: 'Blinkit', zone: 'Jayanagar', weekly_income: 5100, premium: 153, status: 'inactive' },
]

const mockPayouts = [
    { id: 1, worker: 'disha', zone: 'Koramangala', trigger: 'Heavy Rain', amount: 400, date: 'Mar 18' },
    { id: 2, worker: 'sana', zone: 'Whitefield', trigger: 'Severe AQI', amount: 300, date: 'Mar 19' },
    { id: 3, worker: 'pras', zone: 'Indiranagar', trigger: 'Platform Outage', amount: 500, date: 'Mar 20' },
    { id: 4, worker: 'rosh', zone: 'HSR Layout', trigger: 'Extreme Heat', amount: 350, date: 'Mar 21' },
    { id: 5, worker: 'anw', zone: 'Jayanagar', trigger: 'Heavy Rain', amount: 450, date: 'Mar 22' },
]

const mockFraudFlags = [
  {
    id: 1,
    worker: 'Vikram #7749',
    zone: 'Whitefield',
    score: 128,
    reason: 'Social graph clustering — 14 workers claiming from same coordinates in 8-min window. Enrollment 36hrs before forecast storm.',
    status: 'blocked'
  },
  {
    id: 2,
    worker: 'Unknown #3821',
    zone: 'HSR Layout',
    score: 81,
    reason: 'Zero order activity 2hrs before disruption event. Claim rate 3.2 Z-score above zone baseline.',
    status: 'reviewing'
  },
  {
    id: 3,
    worker: 'Suspicious #4492',
    zone: 'Koramangala',
    score: 74,
    reason: 'GPS coordinates show unnatural precision — no micro-movement drift during claimed storm period.',
    status: 'reviewing'
  },
]

export default function AdminDashboard() {
  return (
    <div className="admin-container">
        <h1 className="dashboard-title">QShield - Admin Dashboard</h1>
        <p className="admin-subtitle">Week of Mar 22 – 28, 2026</p>

        <StatCards stats={mockStats} />
        <WorkerList workers={mockWorkers} />
        <ZoneTable zoneData={mockZoneData} />
        <PayoutLog payouts={mockPayouts} />
        <FraudFlags fraudFlags={mockFraudFlags} />
        <TriggerCheck />
    </div>
  );
}*/