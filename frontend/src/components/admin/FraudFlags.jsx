// displays workers flagged by fraud detection system

export default function FraudFlags({ fraudFlags }) {
  return (
    <div className="section">
      <h2 className="section-title">Fraud Flags</h2>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Worker</th>
            <th>Zone</th>
            <th>Anomaly Score</th>
            <th>Reason</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {fraudFlags.map((f) => (
            <tr key={f.id}>
              <td>{f.worker}</td>
              <td>{f.zone}</td>
              <td>
                <span className={f.score > 100 ? 'score-high' : 'score-medium'}>
                  {f.score}
                </span>
              </td>
              <td className="fraud-reason">{f.reason}</td>
              <td>
                <span className={f.status === 'blocked' ? 'badge-blocked' : 'badge-reviewing'}>
                  {f.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  )
}