import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Shield, CheckCircle, Calendar, IndianRupee, ArrowRight, Loader } from "lucide-react";
import "./PolicyConfirmationPage.css";

export function PolicyConfirmationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/policy/policy/${id}`
        );
        if (!res.ok) throw new Error("Failed to fetch policy");
        const data = await res.json();
        setPolicy(data);
      } catch (err) {
        console.error(err);
        setError("Could not load policy. Please check your dashboard.");
      } finally {
        setLoading(false);
      }
    };

    fetchPolicy();
  }, [id]);

  if (loading) {
    return (
      <div className="confirmation-page">
        <div className="confirmation-loading">
          <Loader size={32} className="spin" color="#00ff88" />
          <p>Setting up your policy...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="confirmation-page">
        <div className="confirmation-error">
          <p>{error}</p>
          <button onClick={() => navigate("/dashboard")} className="btn-dashboard">
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="confirmation-page">
      <div className="confirmation-container">

        {/* Success header */}
        <div className="confirmation-header">
          <div className="success-icon">
            <CheckCircle size={48} color="#00ff88" />
          </div>
          <h1>You're Protected!</h1>
          <p>Welcome to QShield, <strong>{policy.worker_name}</strong></p>
        </div>

        {/* Policy card */}
        <div className="policy-card">
          <div className="policy-card-header">
            <Shield size={20} color="#00ff88" />
            <span>Active Policy</span>
            <span className="policy-badge">ACTIVE</span>
          </div>

          <div className="policy-grid">
            <div className="policy-stat">
              <span className="stat-label">Weekly Premium</span>
              <span className="stat-value">
                <IndianRupee size={16} />
                {policy.premium?.toFixed(2)}
              </span>
            </div>

            <div className="policy-stat">
              <span className="stat-label">Max Coverage</span>
              <span className="stat-value highlight">
                <IndianRupee size={16} />
                {policy.coverage?.toFixed(2)}
              </span>
            </div>

            <div className="policy-stat">
              <span className="stat-label">Valid From</span>
              <span className="stat-value small">
                <Calendar size={14} />
                {policy.week_start}
              </span>
            </div>

            <div className="policy-stat">
              <span className="stat-label">Valid Until</span>
              <span className="stat-value small">
                <Calendar size={14} />
                {policy.week_end}
              </span>
            </div>
          </div>

          <div className="policy-footer">
            <span>Policy ID: <strong>#{policy.policy_id}</strong></span>
            <span>Zone: <strong>{localStorage.getItem("workerZone")}</strong></span>
          </div>
        </div>

        {/* What's covered */}
        <div className="coverage-list">
          <p className="coverage-title">You're covered for:</p>
          <ul>
            <li>🌧️ Heavy Rain (&gt;20mm/hr)</li>
            <li>🌫️ Hazardous AQI (&gt;350)</li>
            <li>🌡️ Extreme Heat (&gt;42°C)</li>
            <li>📵 Platform Outages</li>
            <li>🚫 Curfew / Bandh</li>
          </ul>
        </div>

        <button className="btn-dashboard" onClick={() => navigate("/dashboard")}>
          Go to Dashboard <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}