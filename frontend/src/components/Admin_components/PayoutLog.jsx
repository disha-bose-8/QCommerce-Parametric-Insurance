// PayoutLog.jsx

import { DollarSign } from "lucide-react";
import "./PayoutLog.css";

// fallback map — worker_id → { name, zone }
const WORKER_MAP = {
  1: { name: "Disha",  zone: "Koramangala" },
  2: { name: "Arjun",  zone: "Whitefield"  },
};

const TRIGGER_COLORS = {
  RAIN:   { bg: "#1e3a5f", color: "#60a5fa" },
  AQI:    { bg: "#2d1b4e", color: "#a78bfa" },
  HEAT:   { bg: "#3b1f1f", color: "#f87171" },
  OUTAGE: { bg: "#1a2e1a", color: "#4ade80" },
};

export default function PayoutLog({ payouts = [], workers = [] }) {
  const totalAmount = payouts.reduce((sum, p) => sum + (p.amount ?? 0), 0);

  // build lookup from passed-in workers prop, fallback to WORKER_MAP
  const workerLookup = workers.reduce((acc, w) => {
    acc[w.id] = { name: w.name, zone: w.zone };
    return acc;
  }, { ...WORKER_MAP });

  const resolveWorker = (payout) => {
    const match = workerLookup[payout.worker_id];
    return {
      name: match?.name ?? `Worker #${payout.worker_id ?? "—"}`,
      zone: match?.zone ?? "—",
    };
  };

  const formatDate = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("en-IN", {
      day:    "numeric",
      month:  "short",
      hour:   "2-digit",
      minute: "2-digit",
    });
  };

  const getTriggerStyle = (type) => {
    const t = TRIGGER_COLORS[type?.toUpperCase()] ?? { bg: "#1e2a1e", color: "#4ade80" };
    return { background: t.bg, color: t.color };
  };

  return (
    <div className="admin-section">
      <div className="section-header">
        <div className="section-title-group">
          <DollarSign size={24} className="section-icon" />
          <h2>Recent Payouts</h2>
        </div>
        <span className="section-badge">
          ₹{totalAmount.toLocaleString("en-IN")}
        </span>
      </div>

      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Worker</th>
              <th>Zone</th>
              <th>Trigger</th>
              <th>Amount</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {payouts.length === 0 ? (
              <tr>
                <td colSpan={5} className="empty-row">No payouts yet</td>
              </tr>
            ) : (
              payouts.map((payout, i) => {
                const { name, zone } = resolveWorker(payout);
                const triggerType    = payout.trigger_type ?? payout.trigger ?? "—";
                return (
                  <tr key={payout.id ?? i}>
                    <td className="worker-name">{name}</td>
                    <td>{zone}</td>
                    <td>
                      <span className="trigger-badge" style={getTriggerStyle(triggerType)}>
                        {triggerType}
                      </span>
                    </td>
                    <td className="amount-cell">
                      ₹{(payout.amount ?? 0).toLocaleString("en-IN")}
                    </td>
                    <td>{formatDate(payout.created_at ?? payout.date)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
