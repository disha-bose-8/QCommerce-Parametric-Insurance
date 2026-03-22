// receives zoneData array as a prop from AdminDashboard

export default function ZoneTable({ zoneData }) {
  return (
    <div className="section">
      <h2 className="section-title">Disruption Events by Zone</h2>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Zone</th>
            <th>Trigger Type</th>
            <th>Events</th>
          </tr>
        </thead>
        <tbody>
          {zoneData.map((row, i) => (
            <tr key={i}>
              <td>{row.zone}</td>
              <td>
                <span className="trigger-badge">{row.trigger}</span>
              </td>
              <td>{row.count}</td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  )
}