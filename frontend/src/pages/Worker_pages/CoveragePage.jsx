import React, { useState, useEffect } from 'react';
import { Shield, Calendar, DollarSign, Users, Info } from 'lucide-react';
import './CoveragePage.css';

export function CoveragePage() {
  const [premiumData, setPremiumData] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ GET DYNAMIC DATA FROM STORAGE
  const workerIncome = localStorage.getItem('workerIncome') || 7000;
  const workerZone = localStorage.getItem('workerZone') || 'HSR Layout';

  useEffect(() => {
    const fetchPremium = async () => {
      try {
        // ✅ DYNAMIC URL: Uses the actual income and zone from registration
        const response = await fetch(
          `https://qshield-backend-nf8y.onrender.com/api/premium/calculate?weekly_income=${workerIncome}&zone=${workerZone}`
        );
        const data = await response.json();
        setPremiumData(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching premium breakdown:", error);
        setLoading(false);
      }
    };
    fetchPremium();
  }, [workerIncome, workerZone]); // Re-fetch if storage changes
  

  const totalWeekly = premiumData?.total_premium || 0;
  const workerWeekly = premiumData?.worker_pays || 0;
  const platformWeekly = premiumData?.platform_pays || 0;
  const appliedSplit = premiumData?.applied_split || "60-40";

  const getCoveragePeriod = () => {
  const today = new Date();
  
  // Calculate start of the week (last Monday)
  const start = new Date(today);
  const day = today.getDay();
  const diff = today.getDate() - day + (day === 0 ? -6 : 1); 
  start.setDate(diff);

  // Calculate end of the week (next Sunday)
  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  const options = { month: 'short', day: 'numeric' };
  const year = today.getFullYear();
  
  return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}, ${year}`;
};

  return (
    <div className="coverage-page">
      <div className="page-header">
        <div className="header-icon"><Shield size={28} /></div>
        <div>
          <h1>Coverage</h1>
          <p>AI-adjusted active plan</p>
        </div>
      </div>

      {loading ? (
        <div className="loading-shimmer">Calculating split...</div>
      ) : (
        <>
          <div className="coverage-card main">
            <div className="coverage-card-header">
              <div className="coverage-icon active"><Shield size={32} /></div>
              <div className="coverage-status">
                <h2>Protection Active</h2>
                <p>Status: High Risk Adjusted</p>
              </div>
            </div>
            <div className="coverage-divider"></div>
            <div className="coverage-details">
              <div className="detail-row">
  <span>Coverage Period</span>
  
  <div className="detail-value">{getCoveragePeriod()}</div>
</div>
              <div className="detail-row">
                <span>Current Risk Factor</span>
                <div className="detail-value highlight">{(premiumData?.risk_factor * 100).toFixed(1)}%</div>
              </div>
              {/* ✅ ADDED: Show current zone for clarity */}
              <div className="detail-row">
                <span>Zone Coverage</span>
                <div className="detail-value">{workerZone}</div>
              </div>
            </div>
          </div>

          <div className="section-header">
            <h2>Premium Breakdown</h2>
            <p>Dynamic Split: <strong>{appliedSplit}</strong></p>
          </div>

          <div className="premium-card daily-premium">
            <div className="premium-header">
              <DollarSign size={24} />
              <span>Weekly Total Premium</span>
            </div>
            <div className="premium-amount">₹{totalWeekly}</div>
            <p className="premium-description">
              {/* ✅ DYNAMIC TEXT: Shows the actual income used */}
              Calculated based on your ₹{Number(workerIncome).toLocaleString()} income and current environmental triggers in {workerZone}.
            </p>
          </div>

          <div className="premium-split">
            <div className="split-card">
              <div className="split-icon worker"><DollarSign size={20} /></div>
              <div className="split-info">
                <span className="split-label">Worker Share</span>
                <span className="split-amount">₹{workerWeekly}</span>
                <span className="split-total">≈ ₹{Math.round(workerWeekly / 7)}/day</span>
              </div>
            </div>

            <div className="split-divider">+</div>

            <div className="split-card">
              <div className="split-icon platform"><Users size={20} /></div>
              <div className="split-info">
                <span className="split-label">Platform Share</span>
                <span className="split-amount">₹{platformWeekly}</span>
                <span className="split-total">Auto-deducted</span>
              </div>
            </div>
          </div>
          
          <div className="info-box-coverage">
            <Info size={16} />
            <p>During High-AQI or Heavy Rain, the platform's contribution increases to reduce worker burden.</p>
          </div>

          <div className="coverage-benefits">
            <h3>Automated Payout Thresholds</h3>
            <ul className="benefits-list">
              <li><Shield size={16} /> <span>Rain &gt; 0.5 intensity: ₹450 payout</span></li>
              <li><Shield size={16} /> <span>AQI &gt; 300: ₹250 payout</span></li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}