import { useState } from "react";
import API from "../../services/api";
import "./EnrollmentPage.css"; // Create this CSS file next

export default function EnrollmentPage() {
  const [days, setDays] = useState("");
  const [res, setRes] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkEligibility = async () => {
    setLoading(true);
    try {
      // Hits your FastAPI backend /eligibility endpoint
      const r = await API.get("/eligibility", {
        params: { active_days: days },
      });
      setRes(r.data);
    } catch (err) {
      setRes({ message: "Backend connection failed. Is Uvicorn running?" });
    }
    setLoading(false);
  };

  return (
    <div className="enroll-container">
      <div className="enroll-card">
        <h2 className="enroll-title">Check Eligibility</h2>
        <p className="enroll-subtitle">
          Enter your total active days to see if you qualify for QShield coverage.
        </p>

        <div className="enroll-form">
          <div className="input-group">
            <label className="input-label">Total Active Days</label>
            <input
              type="number"
              placeholder="e.g. 30"
              className="enroll-input"
              value={days}
              onChange={(e) => setDays(e.target.value)}
            />
          </div>

          <button 
            onClick={checkEligibility} 
            className="enroll-btn"
            disabled={loading || !days}
          >
            {loading ? "Checking..." : "Verify Status"}
          </button>
        </div>

        {res && (
          <div className={`enroll-result ${res.eligible ? "success" : "fail"}`}>
            <p>{res.message}</p>
            {res.eligible && <button className="proceed-btn">Enroll Now</button>}
          </div>
        )}
      </div>
    </div>
  );
}