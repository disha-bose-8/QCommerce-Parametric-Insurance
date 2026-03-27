import { Users } from 'lucide-react';
import './WorkerList.css';

export default function WorkerList({ workers }) {
  return (
    <div className="admin-section">
      <div className="section-header">
        <div className="section-title-group">
          <Users size={24} className="section-icon" />
          <h2>Worker List</h2>
        </div>
        <span className="section-badge">
          {workers.length} workers
        </span>
      </div>

      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Platform</th>
              <th>Zone</th>
              <th>Weekly Income</th>
              <th>Premium</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {workers.map((worker) => (
              <tr key={worker.id}>
                <td className="worker-name">{worker.name}</td>
                <td>{worker.platform}</td>
                <td>{worker.zone}</td>
                <td>
                  ₹{worker.weekly_income.toLocaleString()}
                </td>
                <td>₹{worker.premium}</td>
                <td>
                  <span className={`status-badge ${worker.status}`}>
                    {worker.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}