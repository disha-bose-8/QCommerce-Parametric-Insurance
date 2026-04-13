// ZoneTable.jsx — receives live trigger strings computed in AdminDashboard

import { MapPin } from 'lucide-react';
import './WorkerList.css';

// Trigger type → colour mapping for the badge
const TRIGGER_COLORS = {
  RAIN:   { bg: "#1e3a5f", color: "#60a5fa" },
  HEAT:   { bg: "#3b1f0a", color: "#fb923c" },
  AQI:    { bg: "#1a1a2e", color: "#a78bfa" },
  OUTAGE: { bg: "#1f1f1f", color: "#94a3b8" },
  CURFEW: { bg: "#2d1b1b", color: "#f87171" },
};

function TriggerBadge({ trigger }) {
  if (!trigger || trigger === "—") {
    return <span className="trigger-badge" style={{ color: "#475569", background: "#0f172a" }}>—</span>;
  }

  // trigger can be a compound string like "RAIN + AQI"
  const parts = trigger.split(" + ").map(t => t.trim());

  return (
    <span style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
      {parts.map((part, i) => {
        const style = TRIGGER_COLORS[part] || { bg: "#1e293b", color: "#00ff88" };
        return (
          <span
            key={i}
            className="trigger-badge"
            style={{
              background: style.bg,
              color:      style.color,
              border:     `1px solid ${style.color}44`,
              fontWeight: 600,
            }}
          >
            {part}
          </span>
        );
      })}
    </span>
  );
}

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
                  <TriggerBadge trigger={zone.trigger} />
                </td>
                <td>
                  <span className="count-badge">{zone.count} workers</span>
                </td>
              </tr>
            ))}
            {zoneData.length === 0 && (
              <tr>
                <td colSpan="3" style={{ textAlign: "center", color: "#475569" }}>
                  No zone data yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}