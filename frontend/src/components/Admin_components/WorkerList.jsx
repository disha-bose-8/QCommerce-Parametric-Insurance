// WorkerList.jsx

import React from "react";
import "./WorkerList.css";

export default function WorkerList({ workers = [] }) {
  return (
    <div className="worker-list-container">
      <h3>Worker List</h3>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Platform</th>
              <th>Zone</th>
              <th>Weekly Income</th>
              <th>Premium (Dynamic)</th>
              <th>Wallet Balance</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {workers.length === 0 ? (
              <tr>
                <td colSpan="7">No workers available</td>
              </tr>
            ) : (
              workers.map((worker, index) => {
                // Use premium_weekly (actual DB value set by dynamic pricing engine)
                // `premium` prop is a fallback set in AdminDashboard for backwards compat
                const displayPremium = worker.premium_weekly ?? worker.premium ?? 0;

                return (
                  <tr key={worker.id || index}>
                    <td>{worker.name || "N/A"}</td>
                    <td>{worker.platform || "N/A"}</td>
                    <td>{worker.zone || "N/A"}</td>

                    <td>
                      ₹{worker.weekly_income
                        ? Number(worker.weekly_income).toLocaleString()
                        : "0"}
                    </td>

                    {/* AI-priced premium from DB, not client-side estimate */}
                    <td>
                      ₹{Number(displayPremium).toLocaleString()}
                    </td>

                    {/* Wallet balance — reflects deductions after Collect Premiums */}
                    <td>
                      <span style={{
                        color: (worker.wallet_balance || 0) < displayPremium
                          ? "#ef4444"   // red if balance < next premium (will be skipped)
                          : "#00ff88",  // green if sufficient
                        fontWeight: 600,
                      }}>
                        ₹{Number(worker.wallet_balance || 0).toLocaleString()}
                      </span>
                    </td>

                    <td>
                      <span className={
                        worker.status === "active" ? "badge badge-green" : "badge badge-red"
                      }>
                        {worker.status || "unknown"}
                      </span>
                    </td>
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