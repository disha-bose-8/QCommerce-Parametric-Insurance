// AdminDashboard.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Brain, TrendingUp, AlertTriangle, ShieldCheck } from "lucide-react";

import StatCards  from "../../components/Admin_components/StatCards";
import ZoneTable  from "../../components/Admin_components/ZoneTable";
import WorkerList from "../../components/Admin_components/WorkerList";
import PayoutLog  from "../../components/Admin_components/PayoutLog";
import FraudFlags from "../../components/Admin_components/FraudFlags";
import { pingBackend } from "../../services/api";

import "./AdminDashboard.css";

const BACKEND = "https://qshield-backend-nf8y.onrender.com";
const TRIGGER_TYPES = ["RAIN", "HEAT", "AQI", "OUTAGE", "CURFEW"];

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
    p.trigger_type !== payout.trigger_type &&
    Math.abs(new Date(p.created_at) - new Date(payout.created_at)) < twoMin
  );
  if (rapid.length > 0) { score += 50; flags.push(`${rapid.length} other payout(s) in 2-min window`); }
  if (payout.amount > 2000) { score += 25; flags.push(`Amount ₹${payout.amount} exceeds expected range`); }

  return {
    score,
    flags,
    severity:  score >= 80 ? "HIGH" : score >= 40 ? "MEDIUM" : "LOW",
    isFlagged: score >= 40,
  };
}

// ─── AI RISK FORECAST MODULE ──────────────────────────────────────────────

const RISK_TIER_COLOR = {
  LOW:    "#00ff88",
  MEDIUM: "#f59e0b",
  HIGH:   "#ef4444",
};

function getRiskTier(riskFactor) {
  if (riskFactor >= 0.05) return "HIGH";
  if (riskFactor >= 0.035) return "MEDIUM";
  return "LOW";
}

function AIRiskForecast({ workers }) {
  const [forecasts,    setForecasts]    = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [lastUpdated,  setLastUpdated]  = useState(null);
  const [summary,      setSummary]      = useState({ avg: 0, high: 0, medium: 0, low: 0 });

  const fetchForecasts = async () => {
    if (workers.length === 0) return;
    setLoading(true);

    // Get unique zones from workers
    const zones = [...new Set(workers.map(w => w.zone).filter(Boolean))];

    const results = await Promise.all(
      zones.map(async (zone) => {
        // Use the median income of workers in this zone as representative income
        const zoneWorkers = workers.filter(w => w.zone === zone);
        const avgIncome   = Math.round(
          zoneWorkers.reduce((s, w) => s + (w.weekly_income || 0), 0) / zoneWorkers.length
        );

        try {
          const res  = await fetch(
            `${BACKEND}/api/premium/calculate?weekly_income=${avgIncome}&zone=${zone}`
          );
          const data = await res.json();
          const rf   = data.risk_factor ?? 0.03;
          const tier = getRiskTier(rf);
          return {
            zone,
            workerCount:    zoneWorkers.length,
            avgIncome,
            riskFactor:     rf,
            tier,
            totalPremium:   data.total_premium ?? 0,
            workerPays:     data.worker_pays ?? 0,
            platformPays:   data.platform_pays ?? 0,
            appliedSplit:   data.applied_split ?? "60-40",
            rainRaw:        data.triggers_detected?.rain ?? 0,
            aqiRaw:         data.triggers_detected?.aqi  ?? 0,
            uvRaw:          data.triggers_detected?.uv   ?? 0,
          };
        } catch {
          return {
            zone,
            workerCount: zoneWorkers.length,
            avgIncome,
            riskFactor:  0.03,
            tier:        "LOW",
            totalPremium: 0,
            workerPays: 0,
            platformPays: 0,
            appliedSplit: "60-40",
            rainRaw: 0, aqiRaw: 0, uvRaw: 0,
          };
        }
      })
    );

    // Sort by risk descending
    results.sort((a, b) => b.riskFactor - a.riskFactor);
    setForecasts(results);

    // Aggregate summary
    const avg    = results.reduce((s, r) => s + r.riskFactor, 0) / (results.length || 1);
    const high   = results.filter(r => r.tier === "HIGH").length;
    const medium = results.filter(r => r.tier === "MEDIUM").length;
    const low    = results.filter(r => r.tier === "LOW").length;
    setSummary({ avg: avg.toFixed(4), high, medium, low });
    setLastUpdated(new Date().toLocaleTimeString());
    setLoading(false);
  };

  useEffect(() => {
    fetchForecasts();
  }, [workers.length]); // re-run when workers load

  return (
    <div className="ai-forecast-module">
      {/* Header */}
      <div className="ai-forecast-header">
        <div className="ai-forecast-title-group">
          <Brain size={22} className="ai-icon" />
          <h2>AI Risk Forecast</h2>
          <span className="ai-badge">Random Forest</span>
        </div>
        <div className="ai-forecast-meta">
          {lastUpdated && <span className="last-updated">Updated {lastUpdated}</span>}
          <button
            className="ai-refresh-btn"
            onClick={fetchForecasts}
            disabled={loading}
          >
            {loading ? "⏳ Analyzing..." : "↻ Refresh"}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="ai-summary-cards">
        <div className="ai-summary-card">
          <TrendingUp size={16} color="#a78bfa" />
          <span className="ai-summary-label">Avg Risk Factor</span>
          <span className="ai-summary-value" style={{ color: "#a78bfa" }}>
            {(summary.avg * 100).toFixed(2)}%
          </span>
        </div>
        <div className="ai-summary-card">
          <AlertTriangle size={16} color="#ef4444" />
          <span className="ai-summary-label">High Risk Zones</span>
          <span className="ai-summary-value" style={{ color: "#ef4444" }}>{summary.high}</span>
        </div>
        <div className="ai-summary-card">
          <AlertTriangle size={16} color="#f59e0b" />
          <span className="ai-summary-label">Medium Risk Zones</span>
          <span className="ai-summary-value" style={{ color: "#f59e0b" }}>{summary.medium}</span>
        </div>
        <div className="ai-summary-card">
          <ShieldCheck size={16} color="#00ff88" />
          <span className="ai-summary-label">Low Risk Zones</span>
          <span className="ai-summary-value" style={{ color: "#00ff88" }}>{summary.low}</span>
        </div>
      </div>

      {/* Zone Risk Table */}
      {loading && forecasts.length === 0 ? (
        <div className="ai-loading">⏳ Running AI model across zones...</div>
      ) : (
        <div className="table-container">
          <table className="admin-table ai-forecast-table">
            <thead>
              <tr>
                <th>Zone</th>
                <th>Workers</th>
                <th>Avg Income</th>
                <th>Risk Factor</th>
                <th>Risk Tier</th>
                <th>Premium / Worker</th>
                <th>Split</th>
                <th>Rain</th>
                <th>AQI</th>
              </tr>
            </thead>
            <tbody>
              {forecasts.map((f) => (
                <tr key={f.zone}>
                  <td className="worker-name">{f.zone}</td>
                  <td>{f.workerCount}</td>
                  <td>₹{f.avgIncome.toLocaleString()}</td>
                  <td style={{ color: RISK_TIER_COLOR[f.tier], fontWeight: 600 }}>
                    {(f.riskFactor * 100).toFixed(2)}%
                  </td>
                  <td>
                    <span
                      className="trigger-badge"
                      style={{
                        background: RISK_TIER_COLOR[f.tier] + "22",
                        color:      RISK_TIER_COLOR[f.tier],
                        border:     `1px solid ${RISK_TIER_COLOR[f.tier]}44`,
                      }}
                    >
                      {f.tier}
                    </span>
                  </td>
                  <td>₹{f.workerPays.toFixed(0)}</td>
                  <td>{f.appliedSplit}</td>
                  <td>{f.rainRaw} mm</td>
                  <td>{f.aqiRaw}</td>
                </tr>
              ))}
              {forecasts.length === 0 && (
                <tr>
                  <td colSpan="9" style={{ textAlign: "center", color: "#64748b" }}>
                    No zone data — workers not yet loaded
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── COMPONENT ────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [workers,      setWorkers]      = useState([]);
  const [livePayouts,  setLivePayouts]  = useState([]);
  const [fraudResults, setFraudResults] = useState([]);
  const [sensorSnap,   setSensorSnap]   = useState(null);
  // zoneSensors: { [zone]: { rain: bool, aqi: bool, heat: bool, outage: bool, curfew: bool } }
  const [zoneSensors,  setZoneSensors]  = useState({});
  const [simulateType, setSimulateType] = useState("RAIN");
  const [simulateZone, setSimulateZone] = useState("ALL");
  const [simStatus,    setSimStatus]    = useState("");
  const [isSimulating, setIsSimulating] = useState(false);
  const [loading,      setLoading]      = useState(true);
  const [fetchError,   setFetchError]   = useState("");

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
        const enriched = data.map(w => ({
          ...w,
          // Use actual premium_weekly from DB — fall back to 8% only if null
          premium: w.premium_weekly ?? Math.round((w.weekly_income || 0) * 0.08),
          status:  "active",
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
      throw e;
    }
  };

  const fetchPayouts = async () => {
    try {
      const res = await fetch(`${BACKEND}/api/payout/`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data)) setLivePayouts(data);
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
      setSensorSnap({
        rain: rain?.raw_value ?? 0,
        aqi:  aqi?.raw_value  ?? 0,
        heat: heat?.raw_value ?? 0,
      });
      // Store confirmed flags for zone trigger derivation
      return {
        rainConfirmed:  !!rain?.confirmed,
        aqiConfirmed:   !!aqi?.confirmed,
        heatConfirmed:  !!heat?.confirmed,
      };
    } catch (e) {
      console.error("Sensor error:", e);
      return {};
    }
  };

  // ── Derive active trigger labels per zone from live sensor data ──────────
  // Since our oracle uses city-level data (Bengaluru), all zones share the
  // same environmental readings. We apply the confirmed flags uniformly and
  // let zone-specific outage/curfew remain "—" unless a simulation has fired.
  const buildZoneData = (workersArr, sensorFlags, payoutsArr) => {
    const { rainConfirmed, aqiConfirmed, heatConfirmed } = sensorFlags || {};

    // Derive active triggers from sensor confirmations
    const activeTriggers = [];
    if (rainConfirmed)  activeTriggers.push("RAIN");
    if (aqiConfirmed)   activeTriggers.push("AQI");
    if (heatConfirmed)  activeTriggers.push("HEAT");

    // Also pull the most recent payout trigger per zone (from last 24h)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentByZone = {};
    payoutsArr
      .filter(p => new Date(p.created_at) >= oneDayAgo)
      .forEach(p => {
        const worker = workersArr.find(w => w.id === p.worker_id);
        if (worker?.zone) {
          // Keep the latest
          if (
            !recentByZone[worker.zone] ||
            new Date(p.created_at) > new Date(recentByZone[worker.zone].created_at)
          ) {
            recentByZone[worker.zone] = p;
          }
        }
      });

    return Object.values(
      workersArr.reduce((acc, w) => {
        if (!acc[w.zone]) {
          acc[w.zone] = { zone: w.zone, trigger: "—", count: 0 };
        }
        acc[w.zone].count++;

        // Build trigger label for this zone
        const triggerLabels = [...activeTriggers]; // env triggers apply to all zones

        // If a recent payout happened in this zone with a non-env type, surface it
        const recent = recentByZone[w.zone];
        if (recent && !triggerLabels.includes(recent.trigger_type)) {
          triggerLabels.push(recent.trigger_type);
        }

        acc[w.zone].trigger = triggerLabels.length > 0 ? triggerLabels.join(" + ") : "—";
        return acc;
      }, {})
    );
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      setFetchError("");
      try {
        await pingBackend();
      } catch (e) {
        setFetchError("Backend unreachable — retrying...");
      }
      try {
        await fetchWorkers();
        await fetchPayouts();
      } catch (e) {
        setFetchError("Could not load workers. Check backend.");
      }
      await fetchSensorSnap();
      setLoading(false);
    };

    init();

    const poll = setInterval(async () => {
      await fetchPayouts();
      await fetchSensorSnap();
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
    // Use actual premium_weekly from DB for pool calculation
    const premiumPool = workers.reduce((s, w) => s + (w.premium_weekly || w.premium || 0), 0);

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

  // Build zoneData reactively whenever workers, sensorSnap, or payouts change
  const [sensorFlags, setSensorFlags] = useState({});

  const refreshSensors = async () => {
    const flags = await fetchSensorSnap();
    if (flags) setSensorFlags(flags);
  };

  useEffect(() => {
    refreshSensors();
    const poll = setInterval(refreshSensors, 15000);
    return () => clearInterval(poll);
  }, []);

  const zoneData = buildZoneData(workers, sensorFlags, livePayouts);

  // ─── SIMULATE TRIGGER ────────────────────────────────────────────────────

  const handleSimulate = async () => {
    setIsSimulating(true);
    setSimStatus("⏳ Triggering...");

    const targets = simulateZone === "ALL"
      ? workers
      : workers.filter(w => w.zone === simulateZone);

    if (targets.length === 0) {
      setSimStatus("❌ No workers found in selected zone");
      setIsSimulating(false);
      setTimeout(() => setSimStatus(""), 5000);
      return;
    }

    const amount  = PAYOUT_AMOUNTS[simulateType] ?? 500;
    let   settled = 0;
    let   failed  = 0;
    const errors  = [];

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

    await fetchPayouts();

    let msg = `✅ ${simulateType} → ${simulateZone}: ${settled} worker(s) settled`;
    if (errors.length > 0) {
      const dupes  = errors.filter(e => e.includes("already paid")).length;
      const actual = errors.filter(e => !e.includes("already paid")).length;
      if (dupes  > 0) msg += ` · ${dupes} already paid today`;
      if (actual > 0) msg += ` · ${actual} failed`;
    }

    setSimStatus(
      msg.startsWith("✅") && settled === 0
        ? `⚠️ ${simulateType} → ${simulateZone}: all workers already paid today`
        : msg
    );
    setIsSimulating(false);
    setTimeout(() => setSimStatus(""), 8000);
  };

  const handleCollectPremiums = async () => {
    setSimStatus("⏳ Collecting weekly premiums...");
    try {
      const res  = await fetch(`${BACKEND}/api/worker/collect-premiums`, { method: "POST" });
      const data = await res.json();
      setSimStatus(
        `✅ Collected from ${data.collected} workers · ₹${data.total_collected} · ${data.skipped} skipped`
      );
      fetchWorkers();
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
          <select className="sim-select" value={simulateType} onChange={e => setSimulateType(e.target.value)}>
            {TRIGGER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select className="sim-select" value={simulateZone} onChange={e => setSimulateZone(e.target.value)}>
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

      {loading && (
        <div className="sim-status-bar pending">
          ⏳ Connecting to backend... (may take 30s on cold start)
        </div>
      )}
      {!loading && fetchError && (
        <div className="sim-status-bar error">{fetchError}</div>
      )}
      {simStatus && (
        <div className={`sim-status-bar ${
          simStatus.startsWith("✅") ? "success" :
          simStatus.startsWith("❌") ? "error"   :
          simStatus.startsWith("⚠️") ? "warn"    : "pending"
        }`}>
          {simStatus}
        </div>
      )}

      {!loading && (
        <div className="admin-content">
          <div className="stat-cards-container">
            <StatCards stats={stats} />
          </div>

          {/* ── AI RISK FORECAST ── */}
          <AIRiskForecast workers={workers} />

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