// AdminDashboard.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

import StatCards  from "../../components/Admin_components/StatCards";
import ZoneTable  from "../../components/Admin_components/ZoneTable";
import WorkerList from "../../components/Admin_components/WorkerList";
import PayoutLog  from "../../components/Admin_components/PayoutLog";
import FraudFlags from "../../components/Admin_components/FraudFlags";

import "./AdminDashboard.css";

const BACKEND = "https://qshield-backend-nf8y.onrender.com";
const TRIGGER_TYPES = ["RAIN", "HEAT", "AQI", "OUTAGE", "CURFEW"];

// ─── FRAUD ENGINE ──────────────────────────────────────────────────────────

const CITY_BOUNDS = { latMin: 12.83, latMax: 13.14, lonMin: 77.46, lonMax: 77.75 };
const HISTORICAL_BASELINES = {
  rain: { avgMM: 3.2,  stdDev: 2.1 },
  aqi:  { avgAQI: 95,  stdDev: 30  },
  heat: { avgTemp: 31, stdDev: 3   },
};

function runFraudEngine(payout, allPayouts, sensorSnapshot) {
  const flags = [];
  let score   = 0;

  const lat = payout.lat ?? 12.9716;
  const lon = payout.lon ?? 77.5946;
  if (
    lat < CITY_BOUNDS.latMin || lat > CITY_BOUNDS.latMax ||
    lon < CITY_BOUNDS.lonMin || lon > CITY_BOUNDS.lonMax
  ) {
    score += 60;
    flags.push(`GPS coords (${lat.toFixed(4)}, ${lon.toFixed(4)}) outside Bengaluru`);
  }

  if (sensorSnapshot) {
    const { rain = 0, aqi = 0, heat = 0 } = sensorSnapshot;
    if (rain > HISTORICAL_BASELINES.rain.avgMM + 3 * HISTORICAL_BASELINES.rain.stdDev) {
      score += 40; flags.push(`Rain ${rain}mm — 3σ above Apr avg`);
    }
    if (aqi > HISTORICAL_BASELINES.aqi.avgAQI + 3 * HISTORICAL_BASELINES.aqi.stdDev) {
      score += 35; flags.push(`AQI ${aqi} — 3σ above historical avg`);
    }
    if (heat > HISTORICAL_BASELINES.heat.avgTemp + 3 * HISTORICAL_BASELINES.heat.stdDev) {
      score += 30; flags.push(`Temp ${heat}°C — 3σ above Apr avg`);
    }
  }

  const twoMin = 2 * 60 * 1000;
  const rapid = allPayouts.filter(p =>
    p.id !== payout.id &&
    Math.abs(new Date(p.created_at) - new Date(payout.created_at)) < twoMin
  );
  if (rapid.length > 0) { score += 50; flags.push(`${rapid.length} other payout(s) in 2-min window`); }

  if (payout.amount > 1000) {
    score += 25; flags.push(`Amount ₹${payout.amount} exceeds expected range`);
  }

  return {
    score,
    flags,
    severity:  score >= 80 ? "HIGH" : score >= 40 ? "MEDIUM" : "LOW",
    isFlagged: score >= 40,
  };
}

// ─── COMPONENT ────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [workers,      setWorkers]      = useState([]);
  const [livePayouts,  setLivePayouts]  = useState([]);
  const [fraudResults, setFraudResults] = useState([]);
  const [sensorSnap,   setSensorSnap]   = useState(null);
  const [simulateType, setSimulateType] = useState("RAIN");
  const [simulateZone, setSimulateZone] = useState("ALL");
  const [simStatus,    setSimStatus]    = useState("");
  const [isSimulating, setIsSimulating] = useState(false);

  const [stats, setStats] = useState({
    active_policies: 0, total_workers: 0,
    weekly_premium_pool: 0, total_payouts: 0, loss_ratio: 0,
  });

  useEffect(() => {
    if (localStorage.getItem("role") !== "admin") navigate("/login");
  }, [navigate]);

  const fetchWorkers = async () => {
    try {
      const res  = await fetch(`${BACKEND}/api/worker/all`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setWorkers(data);
        const premiumPool = data.reduce((s, w) => s + Math.round(w.weekly_income * 0.03), 0);
        setStats(prev => ({
          ...prev,
          total_workers: data.length,
          active_policies: data.length,
          weekly_premium_pool: premiumPool,
        }));
      }
    } catch (e) { console.error("Workers fetch error:", e); }
  };

  const fetchPayouts = async () => {
    try {
      const res  = await fetch(`${BACKEND}/api/payout/all`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setLivePayouts(data);
        const totalPaid = data.reduce((s, p) => s + (p.amount || 0), 0);
        setStats(prev => ({
          ...prev,
          total_payouts: totalPaid,
          loss_ratio: prev.weekly_premium_pool > 0
            ? +(totalPaid / prev.weekly_premium_pool).toFixed(2) : 0,
        }));
      }
    } catch (e) { console.error("Payout fetch error:", e); }
  };

  const fetchSensorSnap = async () => {
    try {
      const [rR, aR, hR] = await Promise.all([
        fetch(`${BACKEND}/api/triggers/rain?lat=12.9716&lon=77.5946&current_orders=60&baseline_orders=100`),
        fetch(`${BACKEND}/api/triggers/aqi?city=Bengaluru&current_orders=60&baseline_orders=100`),
        fetch(`${BACKEND}/api/triggers/heat?lat=12.9716&lon=77.5946&current_orders=60&baseline_orders=100`),
      ]);
      const [rain, aqi, heat] = await Promise.all([rR.json(), aR.json(), hR.json()]);
      setSensorSnap({ rain: rain?.raw_value ?? 0, aqi: aqi?.raw_value ?? 0, heat: heat?.raw_value ?? 0 });
    } catch (e) { console.error("Sensor error:", e); }
  };

  useEffect(() => {
    fetchWorkers();
    fetchPayouts();
    fetchSensorSnap();
    const poll = setInterval(() => { fetchPayouts(); fetchSensorSnap(); }, 15000);
    return () => clearInterval(poll);
  }, []);

  useEffect(() => {
    if (livePayouts.length === 0) return;
    const results = livePayouts
      .map(p => ({ payout: p, ...runFraudEngine(p, livePayouts, sensorSnap) }))
      .filter(r => r.isFlagged)
      .sort((a, b) => b.score - a.score);
    setFraudResults(results);
  }, [livePayouts, sensorSnap]);

  const handleSimulate = async () => {
    setIsSimulating(true);
    setSimStatus("Triggering...");
    try {
      const res  = await fetch(`${BACKEND}/api/triggers/simulate`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ trigger_type: simulateType, zone: simulateZone }),
      });
      const data = await res.json();
      if (data.error) {
        setSimStatus(`❌ ${data.error}`);
      } else {
        setSimStatus(
          `✅ ${simulateType} → ${simulateZone}: ${data.total_settled} worker(s) settled` +
          (data.skipped_duplicate?.length > 0
            ? ` · ${data.skipped_duplicate.length} already paid today` : "")
        );
        fetchPayouts();
      }
    } catch (e) {
      setSimStatus("❌ Network error");
    }
    setIsSimulating(false);
    setTimeout(() => setSimStatus(""), 6000);
  };

  const zoneData = Object.values(
    workers.reduce((acc, w) => {
      if (!acc[w.zone]) acc[w.zone] = { zone: w.zone, trigger: "—", count: 0 };
      acc[w.zone].count++;
      return acc;
    }, {})
  );

  const handleLogout = () => {
    localStorage.removeItem("role");
    navigate("/");
  };

  return (
    <div className="admin-container">

      <div className="admin-header">
        <div>
          <h1 className="dashboard-title">QShield Admin</h1>
          <p className="admin-subtitle">Insurer Control Panel</p>
        </div>
        <div className="admin-header-actions">
          <select className="sim-select" value={simulateType} onChange={e => setSimulateType(e.target.value)}>
            {TRIGGER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select className="sim-select" value={simulateZone} onChange={e => setSimulateZone(e.target.value)}>
            <option value="ALL">ALL ZONES</option>
            {[...new Set(workers.map(w => w.zone))].map(z => <option key={z} value={z}>{z}</option>)}
          </select>
          <button
            className={`trigger-button ${isSimulating ? "simulating" : ""}`}
            onClick={handleSimulate}
            disabled={isSimulating}
          >
            ▶ {isSimulating ? "Triggering..." : "Simulate Trigger"}
          </button>
          <button className="btn-admin-logout" onClick={handleLogout}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      {simStatus && (
        <div className={`sim-status-bar ${simStatus.startsWith("✅") ? "success" : simStatus.startsWith("❌") ? "error" : "pending"}`}>
          {simStatus}
        </div>
      )}

      <div className="admin-content">
        <div className="stat-cards-container"><StatCards stats={stats} /></div>
        <FraudFlags allFraud={fraudResults} />
        <div className="worker-list-container"><WorkerList workers={workers} /></div>
        <div className="zone-table-container"><ZoneTable zoneData={zoneData} /></div>
        <div className="payout-log-container"><PayoutLog payouts={livePayouts} workers={workers} /></div>
      </div>

    </div>
  );
}
