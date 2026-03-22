// receives stats data from AdminDashboard and displays 4 cards

export default function StatCards({ stats }) {
  return (
    <div className="stats-grid">

      <div className="stat-card">
        <p className="stat-label">Active Policies</p>
        <p className="stat-value">{stats.active_policies.toLocaleString()}</p>
        <p className="stat-sub">{stats.total_workers.toLocaleString()} workers enrolled</p>
      </div>

      <div className="stat-card">
        <p className="stat-label">Premium Pool</p>
        <p className="stat-value">₹{(stats.weekly_premium_pool / 1000).toFixed(1)}K</p>
        <p className="stat-sub">This week</p>
      </div>

      <div className="stat-card">
        <p className="stat-label">Payouts Processed</p>
        <p className="stat-value">₹{(stats.total_payouts / 1000).toFixed(1)}K</p>
        <p className="stat-sub">This week</p>
      </div>

      <div className="stat-card">
        <p className="stat-label">Loss Ratio</p>
        <p
          className="stat-value"
          style={{ color: stats.loss_ratio > 0.8 ? '#ef4444' : '#22c55e' }}
        >
          {Math.round(stats.loss_ratio * 100)}%
        </p>
        <p className="stat-sub">Target: 60–80%</p>
      </div>

    </div>
  )
}