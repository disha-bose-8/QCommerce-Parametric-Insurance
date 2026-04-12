// AdminDashboard.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

import StatCards  from "../../components/Admin_components/StatCards";
import ZoneTable  from "../../components/Admin_components/ZoneTable";
import WorkerList from "../../components/Admin_components/WorkerList";
import PayoutLog  from "../../components/Admin_components/PayoutLog";
import FraudFlags from "../../components/Admin_components/FraudFlags";
import { pingBackend } from "../../services/api";

import "./AdminDashboard.css";

const BACKEND = "https://qshield-backend-nf8y.onrender.com";
const TRIGGER_TYPES = ["RAIN", "HEAT", "AQI", "OUTAGE", "CURFEW"];

// ─── PAYOUT AMOUNT PER TRIGGER TYPE ────────────────────────────────────────
const PAYOUT_AMOUNTS = {
  RAIN:   500,
  HEAT:   400,
  AQI:    450,
  OUTAGE: 600,
  CURFEW: 550,
};

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
      score += 40;
      flags.push(`Rain ${rain}mm — 3σ above Apr avg`);
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

  const twoMin = 2 * 60 * 1000;

  // ✅ FIX 1: Ignore same-trigger bulk simulations
  const rapid = allPayouts.filter(p =>
    p.id !== payout.id &&
    p.trigger_type !== payout.trigger_type && // <-- NEW LINE
    Math.abs(new Date(p.created_at) - new Date(payout.created_at)) < twoMin
  );

  if (rapid.length > 0) {
    score += 50;
    flags.push(`${rapid.length} other payout(s) in 2-min window`);
  }

  // ✅ FIX 2: Raise threshold (your payouts are ₹400–₹600)
  if (payout.amount > 2000) {
    score += 25;
    flags.push(`Amount ₹${payout.amount} exceeds expected range`);
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
 
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const [stats, setStats] = useState({
    active_policies: 0, total_workers: 0,
    weekly_premium_pool: 0, total_payouts: 0, loss_ratio: 0,
  });

  useEffect(() => {
    if (localStorage.getItem("role") !== "admin") navigate("/login");
  }, [navigate]);

  const fetchWorkers = async () => {
  try {
    const res = await fetch(`${BACKEND}/api/worker/all`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data)) {
      // compute premium client-side since backend doesn't return it
      const enriched = data.map(w => ({
        ...w,
        premium: Math.round((w.weekly_income || 0) * 0.08),
        status: "active",
      }));
      setWorkers(enriched);
      setStats(prev => ({
  ...prev,
  total_workers:   enriched.length,
  active_policies: enriched.length,
}));
    }
  } catch (e) {
    console.error("Workers fetch error:", e);
    throw e; // re-throw so init() catch block fires
  }
};

  const fetchPayouts = async () => {
  try {
    const res = await fetch(`${BACKEND}/api/payout/`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data)) {
      setLivePayouts(data);

      // Only count payouts from current week for loss ratio
      
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
  const init = async () => {
    setLoading(true);
    setFetchError("");
    try {
      await pingBackend(); // wait fully before any fetches
    } catch (e) {
      setFetchError("Backend unreachable — retrying...");
    }
    try {
      await fetchWorkers(); // await so workers populate before zone dropdown renders
      await fetchPayouts();
    } catch(e) {
      setFetchError("Could not load workers. Check backend.");
    }
    fetchPayouts();
    fetchSensorSnap();
    setLoading(false);
  };

  

  init();

  const poll = setInterval(() => {
    fetchPayouts();
    fetchSensorSnap();
  }, 15000);

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

  useEffect(() => {
  if (workers.length === 0) return;

  // Use stored premium_weekly from DB, not computed guess
  const premiumPool = workers.reduce((s, w) => s + (w.wallet_balance || 0), 0);

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const weeklyPaid = livePayouts
    .filter(p => new Date(p.created_at) >= oneWeekAgo)
    .reduce((s, p) => s + (p.amount || 0), 0);

  setStats(prev => ({
    ...prev,
    weekly_premium_pool: premiumPool,
    total_payouts:       livePayouts.reduce((s, p) => s + (p.amount || 0), 0),
    loss_ratio:          premiumPool > 0 ? Math.round((weeklyPaid / premiumPool) * 100) : 0,
  }));
}, [workers, livePayouts]);

  // ─── SIMULATE TRIGGER ──────────────────────────────────────────────────
  // Loops through workers in the selected zone and calls /api/payout/create
  // for each one individually (backend has no /simulate endpoint).

  const handleSimulate = async () => {
    setIsSimulating(true);
    setSimStatus("⏳ Triggering...");

    // Filter workers by zone
    const targets = simulateZone === "ALL"
      ? workers
      : workers.filter(w => w.zone === simulateZone);

    if (targets.length === 0) {
      setSimStatus("❌ No workers found in selected zone");
      setIsSimulating(false);
      setTimeout(() => setSimStatus(""), 5000);
      return;
    }

    const amount     = PAYOUT_AMOUNTS[simulateType] ?? 500;
    let   settled    = 0;
    let   failed     = 0;
    const errors     = [];

    // Create payout for each worker sequentially
    for (const worker of targets) {
      try {
        const res = await fetch(`${BACKEND}/api/payout/create`, {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            worker_id:    worker.id,
            amount:       amount,
            trigger_type: simulateType,
            audit_msg:    `Admin Simulate — ${simulateType} @ ${simulateZone}`,
          }),
        });

        if (res.ok) {
          settled++;
        } else {
          const errData = await res.json().catch(() => ({}));
          // 409 = already paid today (cooldown), not a real error
          if (res.status === 409) {
            errors.push(`${worker.name || worker.id}: already paid today`);
          } else {
            failed++;
            errors.push(`${worker.name || worker.id}: ${errData.detail || res.status}`);
          }
        }
      } catch (e) {
        failed++;
        errors.push(`${worker.name || worker.id}: network error`);
      }
    }

    // Refresh payout log after all requests
    await fetchPayouts();

    // Build status message
    let msg = `✅ ${simulateType} → ${simulateZone}: ${settled} worker(s) settled`;
    if (errors.length > 0) {
      const dupes  = errors.filter(e => e.includes("already paid")).length;
      const actual = errors.filter(e => !e.includes("already paid")).length;
      if (dupes  > 0) msg += ` · ${dupes} already paid today`;
      if (actual > 0) msg += ` · ${actual} failed`;
    }

    setSimStatus(msg.startsWith("✅") && settled === 0
      ? `⚠️ ${simulateType} → ${simulateZone}: all workers already paid today`
      : msg
    );
    setIsSimulating(false);
    setTimeout(() => setSimStatus(""), 8000);
  };

  // ──────────────────────────────────────────────────────────────────────

  const zoneData = Object.values(
    workers.reduce((acc, w) => {
      if (!acc[w.zone]) acc[w.zone] = { zone: w.zone, trigger: "—", count: 0 };
      acc[w.zone].count++;
      return acc;
    }, {})
  );

  const handleCollectPremiums = async () => {
  setSimStatus("⏳ Collecting weekly premiums...");
  try {
    const res  = await fetch(`${BACKEND}/api/worker/collect-premiums`, { method: "POST" });
    const data = await res.json();
    setSimStatus(`✅ Collected from ${data.collected} workers · ₹${data.total_collected} · ${data.skipped} skipped`);
    fetchWorkers(); // refresh so wallet balances update
  } catch (e) {
    setSimStatus("❌ Premium collection failed");
  }
  setTimeout(() => setSimStatus(""), 8000);
};

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
        <button className="trigger-button" onClick={handleCollectPremiums}>
  💰 Collect Premiums
</button>
        <select
          className="sim-select"
          value={simulateType}
          onChange={e => setSimulateType(e.target.value)}
        >
          {TRIGGER_TYPES.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <select
          className="sim-select"
          value={simulateZone}
          onChange={e => setSimulateZone(e.target.value)}
        >
          <option value="ALL">ALL ZONES</option>
          {[...new Set(workers.map(w => w.zone))].map(z => (
            <option key={z} value={z}>{z}</option>
          ))}
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

    {/* 🔹 LOADING BANNER */}
    {loading && (
      <div className="sim-status-bar pending">
        ⏳ Connecting to backend... (may take 30s on cold start)
      </div>
    )}

    {/* 🔹 ERROR BANNER */}
    {!loading && fetchError && (
      <div className="sim-status-bar error">
        {fetchError}
      </div>
    )}

    {/* 🔹 SIMULATION STATUS */}
    {simStatus && (
      <div
        className={`sim-status-bar ${
          simStatus.startsWith("✅") ? "success" :
          simStatus.startsWith("❌") ? "error" :
          simStatus.startsWith("⚠️") ? "warn" : "pending"
        }`}
      >
        {simStatus}
      </div>
    )}

    {/* 🔹 MAIN CONTENT (ONLY AFTER LOAD) */}
    {!loading && (
      <div className="admin-content">
        <div className="stat-cards-container">
          <StatCards stats={stats} />
        </div>

        <FraudFlags allFraud={fraudResults} />

        <div className="worker-list-container">
          <WorkerList workers={workers} />
        </div>

        <div className="zone-table-container">
          <ZoneTable zoneData={zoneData} />
        </div>

        <div className="payout-log-container">
          <PayoutLog payouts={livePayouts} workers={workers} />
        </div>
      </div>
    )}

  </div>
);
}