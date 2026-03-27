import { MapPin } from 'lucide-react';
import './WorkerList.css';

export default function ZoneTable({ zoneData }) {
  return (
    <div className="admin-section">
      <div className="section-header">
        <div className="section-title-group">
          <MapPin size={24} className="section-icon" />
          <h2>Zone Triggers</h2>
        </div>
        <span className="section-badge">
          {zoneData.length} zones
        </span>
      </div>

      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Zone</th>
              <th>Active Trigger</th>
              <th>Affected Workers</th>
            </tr>
          </thead>

          <tbody>
            {zoneData.map((zone, idx) => (
              <tr key={idx}>
                <td className="worker-name">{zone.zone}</td>
                <td>
                  <span className="trigger-badge">
                    {zone.trigger}
                  </span>
                </td>
                <td>
                  <span className="count-badge">
                    {zone.count} workers
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