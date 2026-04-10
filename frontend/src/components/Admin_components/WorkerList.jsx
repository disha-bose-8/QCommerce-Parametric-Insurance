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
              <th>Premium</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {workers.length === 0 ? (
              <tr>
                <td colSpan="6">No workers available</td>
              </tr>
            ) : (
              workers.map((worker, index) => (
                <tr key={worker.id || index}>
                  <td>{worker.name || "N/A"}</td>
                  <td>{worker.platform || "N/A"}</td>
                  <td>{worker.zone || "N/A"}</td>

                  {/* 🔥 FIX HERE */}
                  <td>
                    ₹
                    {worker.weekly_income
                      ? Number(worker.weekly_income).toLocaleString()
                      : "0"}
                  </td>

                  <td>
                    ₹
                    {worker.premium
                      ? Number(worker.premium).toLocaleString()
                      : "0"}
                  </td>

                  <td>
                    <span
                      className={
                        worker.status === "active"
                          ? "badge badge-green"
                          : "badge badge-red"
                      }
                    >
                      {worker.status || "unknown"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}