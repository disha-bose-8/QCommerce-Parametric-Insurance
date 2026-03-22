// displays all payouts processed this week

export default function PayoutLog({ payouts }) {
  return (
    <div className="section">
      <h2 className="section-title">Payout Log — This Week</h2>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Worker</th>
            <th>Zone</th>
            <th>Trigger</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {payouts.map((p) => (
            <tr key={p.id}>
              <td>{p.date}</td>
              <td>{p.worker}</td>
              <td>{p.zone}</td>
              <td>
                <span className="trigger-badge">{p.trigger}</span>
              </td>
              <td className="payout-amount">₹{p.amount}</td>
              <td>
                <span className="badge-active">processed</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  )
}