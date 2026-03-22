export default function AdminPanel() {
  return (
    <div style={{ padding: 20 }}>
      <h2>Admin Dashboard</h2>

      <p>Active Policies: 120</p>
      <p>Total Premium Pool: ₹1,20,000</p>
      <p>Loss Ratio: 0.45</p>
    </div>
  );
}
const [admin, setAdmin] = useState(false);
<button onClick={() => setAdmin(!admin)}>Switch View</button>

{admin ? <AdminPanel /> : <UserDashboard />}