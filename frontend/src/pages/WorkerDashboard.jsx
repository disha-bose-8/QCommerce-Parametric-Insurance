import { useState } from "react";
import API from "../services/api";
import Layout from "../components/Layout";
import Card from "../components/Card";

export default function WorkerDashboard({ setRole }) {
  const [days, setDays] = useState("");
  const [premium, setPremium] = useState(null);
  const [forecast, setForecast] = useState([]);

  const handleCalculate = async () => {
    const income = days * 500; // assume ₹500/day

    const res = await API.get("/premium/calculate", {
      params: { weekly_income: income },
    });

    setPremium(res.data);
  };

  // mock worker data
  const worker = {
    coverage: "Active",
    earnings: 1200,
    daysLeft: 2,
    logs: [
      { type: "Rain", payout: 400 },
      { type: "AQI", payout: 300 },
    ],
  };

  return (
    <Layout setRole={setRole}>

      <h1 className="text-3xl font-bold mb-6">Worker Dashboard</h1>

      {/* TOP CARDS */}
      <div className="grid grid-cols-3 gap-6">

        <Card title="Coverage Status" value={worker.coverage} />
        <Card title="Earnings Protected" value={`₹${worker.earnings}`} />
        <Card title="Days Remaining" value={worker.daysLeft} />

      </div>

      {/* INPUT */}
      <div className="mt-6 bg-white p-6 rounded shadow">
        <h2 className="font-semibold mb-2">Enter Days You Work</h2>

        <input
          type="number"
          placeholder="Days per week"
          className="border p-2 mr-3"
          onChange={(e) => setDays(e.target.value)}
        />

        <button
          onClick={handleCalculate}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Calculate Premium
        </button>
      </div>

      {/* PREMIUM */}
      {premium && (
        <div className="grid grid-cols-3 gap-6 mt-6">
          <Card title="Worker Pays" value={`₹${premium.worker_premium}`} />
          <Card title="Platform Pays" value={`₹${premium.platform_premium}`} />
          <Card title="Payout/Day" value={`₹${premium.payout_per_day}`} />
        </div>
      )}

      {/* LOGS */}
      <div className="mt-6 bg-white p-6 rounded shadow">
        <h2 className="font-semibold mb-2">Disruption History</h2>

        {worker.logs.map((l, i) => (
          <p key={i}>
            {l.type} → ₹{l.payout}
          </p>
        ))}
      </div>

      {/* FORECAST */}
      <div className="mt-6 bg-white p-6 rounded shadow">
        <h2 className="font-semibold mb-2">Risk Forecast</h2>

        <p>🌧 Rain Risk Tomorrow</p>
        <p>🔥 Heat Moderate</p>
        <p>🌫 AQI Safe</p>
      </div>

    </Layout>
  );
}