// AdminDashboard.jsx - Insurer Control Panel with Fraud Detection + Live Stats

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, AlertTriangle, ShieldCheck, TrendingUp, Users, Activity } from "lucide-react";

import StatCards from "../../components/Admin_components/StatCards";
import ZoneTable from "../../components/Admin_components/ZoneTable";
import WorkerList from "../../components/Admin_components/WorkerList";
import PayoutLog from "../../components/Admin_components/PayoutLog";

import "./AdminDashboard.css";

const BACKEND = "https://qshield-backend-nf8y.onrender.com";

// ─── FRAUD ENGINE ──────────────────────────────────────────────────────────

const CITY_BOUNDS = {
  latMin: 12.83, latMax: 13.14,
  lonMin: 77.46, lonMax: 77.75,
};

const HISTORICAL_BASELINES = {
  rain: { avgMM: 3.2, stdDev: 2.1 },
  aqi:  { avgAQI: 95, stdDev: 30 },
  heat: { avgTemp: 31, stdDev: 3 },
};

function runFraudEngine(payout, allPayouts, sensorSnapshot) {
  const flags   = [];
  let score     = 0;

  // 1. GPS Spoofing — check coordinates attached to payout (or use worker default)
  const lat = payout.lat ?? 12.9716;
  const lon = payout.lon ?? 77.5946;
  const outsideBounds =
    lat < CITY_BOUNDS.latMin || lat > CITY_BOUNDS.latMax ||
    lon < CITY_BOUNDS.lonMin || lon > CITY_BOUNDS.lonMax;

  if (outsideBounds) {
    score += 60;
    flags.push(`GPS coords (${lat.toFixed(4)}, ${lon.toFixed(4)}) outside Bengaluru`);
  }

  // 2. Weather Anomaly vs Historical Baseline
  if (sensorSnapshot) {
    const rain = sensorSnapshot.rain ?? 0;
    const aqi  = sensorSnapshot.aqi  ?? 0;
    const heat = sensorSnapshot.heat ?? 0;

    if (rain > HISTORICAL_BASELINES.rain.avgMM + 3 * HISTORICAL_BASELINES.rain.stdDev) {
      score += 40;
      flags.push(`Rain ${rain}mm — 3σ above Apr avg (${HISTORICAL_BASELINES.rain.avgMM}mm)`);
    }
    if (aqi > HISTORICAL_BASELINES.aqi.avgAQI + 3 * HISTORICAL_BASELINES.aqi.stdDev) {
      score += 35;
      flags.push(`AQI ${aqi} — 3σ above historical avg`);
    }
    if (heat > HISTORICAL_BASELINES.heat.avgTemp + 3 * HISTORICAL_BASELINES.heat.stdDev) {
      score += 30;
      flags.push(`Temp ${heat}°C — 3σ above Apr avg`);
    }
  }

  // 3. Rapid fire claims — multiple within 2 minutes
  const twoMin = 2 * 60 * 1000;
  const rapid = allPayouts.filter(p =>
    p.id !== payout.id &&
    Math.abs(new Date(p.created_at) - new Date(payout.created_at)) < twoMin
  );
  if (rapid.length > 0) {
    score += 50;
    flags.push(`${rapid.length} other payout(s) within 2-minute window`);
  }

  // 4. Duplicate trigger type same day
  const sameDay = allPayouts.filter(p =>
    p.id !== payout.id &&
    p.trigger_type === payout.trigger_type &&
    new Date(p.created_at).toDateString() === new Date(payout.created_at).toDateString()
  );
  if (sameDay.length > 0) {
    score += 35;
    flags.push(`Duplicate trigger type "${payout.trigger_type}" on same day`);
  }

  // 5. Unusually high amount
  if (payout.amount > 8000) {
    score += 25;
    flags.push(`Amount ₹${payout.amount} exceeds normal range`);
  }

  return {
    score,
    flags,
    severity: score >= 80 ? "HIGH" : score >= 40 ? "MEDIUM" : "LOW",
    isFlagged: score >= 35,
  };
}

// ─── COMPONENT ────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    active_policies:     1284,
    total_workers:       1891,
    weekly_premium_pool: 359520,
    total_payouts:       187400,
    loss_ratio:          0.52,
  });

  const [payouts,       setPayouts]       = useState([]);
  const [fraudResults,  setFraudResults]  = useState([]);
  const [sensorSnap,    setSensorSnap]    = useState(null);
  const [isSimulating,  setIsSimulating]  = useState(false);
  const [intervalId,    setIntervalId]    = useState(null);
  const [livePayouts,   setLivePayouts]   = useState([]);

  // ── AUTH ──
  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "admin") navigate("/login");
  }, [navigate]);

  // ── FETCH LIVE PAYOUTS FROM BACKEND ──
  const fetchPayouts = async () => {
    try {
      const res  = await fetch(`${BACKEND}/api/payout/all`);
      const data = await res.json();
      if (Array.isArray(data)) setLivePayouts(data);
    } catch (e) {
      console.error("Payout fetch error:", e);
    }
  };

  // ── FETCH SENSOR SNAPSHOT FOR FRAUD ENGINE ──
  const fetchSensorSnap = async () => {
    try {
      const [rainRes, aqiRes, heatRes] = await Promise.all([
        fetch(`${BACKEND}/api/triggers/rain?lat=12.9716&lon=77.5946&current_orders=60&baseline_orders=100`),
        fetch(`${BACKEND}/api/triggers/aqi?city=Bengaluru&current_orders=60&baseline_orders=100`),
        fetch(`${BACKEND}/api/triggers/heat?lat=12.9716&lon=77.5946&current_orders=60&baseline_orders=100`),
      ]);
      const [rain, aqi, heat] = await Promise.all([
        rainRes.json(), aqiRes.json(), heatRes.json(),
      ]);
      setSensorSnap({
        rain: rain?.raw_value ?? 0,
        aqi:  aqi?.raw_value  ?? 0,
        heat: heat?.raw_value ?? 0,
      });
    } catch (e) {
      console.error("Sensor snapshot error:", e);
    }
  };

  useEffect(() => {
    fetchPayouts();
    fetchSensorSnap();
    const poll = setInterval(() => {
      fetchPayouts();
      fetchSensorSnap();
    }, 15000);
    return () => clearInterval(poll);
  }, []);

  // ── RUN FRAUD ENGINE when payouts or sensor data updates ──
  useEffect(() => {
    if (livePayouts.length === 0) return;
    const results = livePayouts
      .map(p => ({
        payout: p,
        ...runFraudEngine(p, livePayouts, sensorSnap),
      }))
      .filter(r => r.isFlagged)
      .sort((a, b) => b.score - a.score);
    setFraudResults(results);
  }, [livePayouts, sensorSnap]);

  // ── SIMULATION (adds mock payouts to the simulation-only list) ──
  const startSimulation = () => {
    if (isSimulating) return;

    const id = setInterval(() => {
      const mockPayout = {
        id:           Date.now(),
        worker_id:    1,
        amount:       Math.round(1500 + Math.random() * 3000),
        trigger_type: ["RAIN", "AQI", "HEAT", "OUTAGE"][Math.floor(Math.random() * 4)],
        created_at:   new Date().toISOString(),
        audit_trail:  "Simulated via Admin Panel",
        lat:          Math.random() > 0.85 ? 13.5 : 12.9716, // 15% GPS spoof chance
        lon:          77.5946,
      };

      setPayouts(prev => [mockPayout, ...prev]);

      setStats(prev => {
        const newTotal = prev.total_payouts + mockPayout.amount;
        return {
          ...prev,
          total_payouts: newTotal,
          loss_ratio:    +(newTotal / prev.weekly_premium_pool).toFixed(2),
        };
      });
    }, 4000);

    setIntervalId(id);
    setIsSimulating(true);
  };

  const stopSimulation = () => {
    if (intervalId) clearInterval(intervalId);
    setIntervalId(null);
    setIsSimulating(false);
  };

  useEffect(() => {
    return () => { if (intervalId) clearInterval(intervalId); };
  }, [intervalId]);

  // ── RUN FRAUD ON SIMULATED PAYOUTS TOO ──
  const allPayouts = [...livePayouts, ...payouts];
  const simFraud = payouts
    .map(p => ({ payout: p, ...runFraudEngine(p, allPayouts, sensorSnap) }))
    .filter(r => r.isFlagged);

  const allFraud = [...fraudResults, ...simFraud].sort((a, b) => b.score - a.score);

  const handleLogout = () => {
    localStorage.removeItem("role");
    navigate("/");
  };

  const workers = [
    { id: 1, name: "Disha", platform: "Zepto", zone: "Koramangala", weekly_income: 5600, premium: 168, status: "active" },
    { id: 2, name: "Arjun", platform: "Swiggy", zone: "Whitefield", weekly_income: 6200, premium: 186, status: "active" },
  ];

  const zoneData = [
    { zone: "Koramangala", trigger: "Rain", count: 6 },
    { zone: "Whitefield",  trigger: "AQI",  count: 4 },
  ];

  return (
    <div className="admin-container">

      {/* HEADER */}
      <div className="admin-header">
        <div>
          <h1 className="dashboard-title">QShield Admin</h1>
          <p className="admin-subtitle">Insurer Control Panel</p>
        </div>
        <div className="admin-header-actions">
          <button
            className={`trigger-button ${isSimulating ? "simulating" : ""}`}
            onClick={startSimulation}
            disabled={isSimulating}
          >
            ▶ {isSimulating ? "Simulating..." : "Start Simulation"}
          </button>
          <button className="trigger-button stop-btn" onClick={stopSimulation}>
            ⏹ Stop
          </button>
          <button className="btn-admin-logout" onClick={handleLogout}>
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="admin-content">

        {/* STAT CARDS */}
        <div className="stat-cards-container">
          <StatCards stats={stats} />
        </div>

        {/* FRAUD DETECTION PANEL */}
        <div className="fraud-panel">
          <div className="fraud-panel-header">
            <AlertTriangle size={20} color="#f59e0b" />
            <div>
              <h2>Fraud Detection Engine</h2>
              <p>{allFraud.length} claim(s) flagged — GPS spoofing, weather anomalies, rapid claims</p>
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
              {allFraud.slice(0, 5).map((result, i) => (
                <div key={result.payout.id ?? i} className={`fraud-item severity-${result.severity.toLowerCase()}`}>
                  <div className="fraud-item-top">
                    <span className="fraud-worker">
                      Worker #{result.payout.worker_id} — {result.payout.trigger_type}
                    </span>
                    <div className="fraud-badges">
                      <span className={`severity-badge ${result.severity.toLowerCase()}`}>
                        {result.severity}
                      </span>
                      <span className="fraud-score">Score: {result.score}</span>
                    </div>
                  </div>
                  <div className="fraud-item-amount">
                    ₹{result.payout.amount?.toLocaleString()} — {new Date(result.payout.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
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
              ))}
            </div>
          )}
        </div>

        {/* WORKER LIST */}
        <div className="worker-list-container">
          <WorkerList workers={workers} />
        </div>

        {/* ZONE TABLE */}
        <div className="zone-table-container">
          <ZoneTable zoneData={zoneData} />
        </div>

        {/* PAYOUT LOG — shows sim + live combined */}
        <div className="payout-log-container">
          <PayoutLog payouts={[...payouts, ...livePayouts]} />
        </div>

      </div>
    </div>
  );
}
