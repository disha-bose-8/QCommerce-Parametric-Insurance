// displays all enrolled workers

export default function WorkerList({ workers }) {
  return (
    <div className="section">
      <h2 className="section-title">Enrolled Workers</h2>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Platform</th>
            <th>Zone</th>
            <th>Weekly Income</th>
            <th>Premium Paid</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {workers.map((w) => (
            <tr key={w.id}>
              <td>{w.name}</td>
              <td>{w.platform}</td>
              <td>{w.zone}</td>
              <td>₹{w.weekly_income.toLocaleString()}</td>
              <td>₹{w.premium}</td>
              <td>
                <span className={w.status === 'active' ? 'badge-active' : 'badge-inactive'}>
                  {w.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  )
}