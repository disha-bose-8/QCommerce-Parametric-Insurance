// FraudFlags.jsx — wired to AdminDashboard's runFraudEngine output

import { AlertTriangle, ShieldCheck } from "lucide-react";
import "./FraudFlags.css";

const SEVERITY_COLOR = {
  HIGH:   "#ef4444",
  MEDIUM: "#f97316",
  LOW:    "#f59e0b",
};

export default function FraudFlags({ allFraud = [] }) {
  return (
    <div className="fraud-panel">
      <div className="fraud-panel-header">
        <AlertTriangle size={20} color="#f59e0b" />
        <div>
          <h2>Fraud Detection Engine</h2>
          <p>
            {allFraud.length} claim(s) flagged — GPS spoofing, weather
            anomalies, rapid claims
          </p>
        </div>
        <div className={`fraud-count-badge ${allFraud.length > 0 ? "has-fraud" : ""}`}>
          {allFraud.length}
        </div>
      </div>

      {allFraud.length === 0 ? (
        <div className="fraud-empty">
          <ShieldCheck size={18} color="#22c55e" />
          <span>All claims clean — no anomalies detected</span>
        </div>
      ) : (
        <div className="fraud-list">
          {allFraud.slice(0, 5).map((result, i) => {
            const color = SEVERITY_COLOR[result.severity] ?? "#f59e0b";
            return (
              <div
                key={result.payout.id ?? i}
                className={`fraud-item severity-${result.severity.toLowerCase()}`}
              >
                <div className="fraud-item-top">
                  <span className="fraud-worker">
                    Worker #{result.payout.worker_id} —{" "}
                    {result.payout.trigger_type}
                  </span>
                  <div className="fraud-badges">
                    <span
                      className="severity-badge"
                      style={{
                        background: `${color}22`,
                        color,
                        border: `1px solid ${color}55`,
                      }}
                    >
                      {result.severity}
                    </span>
                    <span className="fraud-score">Score: {result.score}</span>
                  </div>
                </div>

                <div className="fraud-item-amount">
                  ₹{result.payout.amount?.toLocaleString()} —{" "}
                  {new Date(result.payout.created_at).toLocaleString("en-IN", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>

                <div className="fraud-flags-list">
                  {result.flags.map((f, j) => (
                    <div key={j} className="fraud-flag-row">
                      <span className="flag-dot" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
