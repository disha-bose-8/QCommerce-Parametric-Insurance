import { useState } from "react";
import API from "../services/api";
import Layout from "../components/Layout";
import Card from "../components/Card";

export default function AdminDashboard({ setRole }) {
  const [triggerData, setTriggerData] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState("Bangalore");

// =============================
// 🔥 TRIGGER ENGINE
// =============================
const runTrigger = async (type) => {
  let url = "";
  let params = {
    lat: 12.97,
    lon: 77.59,
    current_orders: 60,
    baseline_orders: 100,
  };

  if (type === "rain") {
    url = "/triggers/rain";
  }

  if (type === "heat") {
    url = "/triggers/heat";
  }

  if (type === "aqi") {
  url = "/triggers/aqi";
  params = {
    city: location || "Bangalore",
    current_orders: 60,
    baseline_orders: 100,
  };
}

  try {
    const res = await API.get(url, { params });
    setTriggerData(res.data);
  } catch (err) {
    console.error(err);
    alert(err.response?.data?.detail || "Error fetching trigger");
  }
};
  // =============================
  // 📊 FORECAST (3 DAYS)
  // =============================
  const generateForecast = async () => {
  try {
    setLoading(true);

    const rain = await API.get("/triggers/rain", {
      params: {
        lat: 12.97,
        lon: 77.59,
        current_orders: 60,
        baseline_orders: 100,
      },
    });

    const heat = await API.get("/triggers/heat", {
      params: {
        lat: 12.97,
        lon: 77.59,
        current_orders: 60,
        baseline_orders: 100,
      },
    });

    const aqi = await API.get("/triggers/aqi", {
      params: {
        city: location || "Bangalore",
        current_orders: 60,
        baseline_orders: 100,
      },
    });

    const result = [
      rain.data.triggered ? "🌧 High Rain Risk" : "✅ Low Risk",
      heat.data.triggered ? "🔥 Heat Risk" : "✅ Low Risk",
      aqi.data.triggered ? "🌫 AQI Risk" : "✅ Low Risk",
    ];

    setForecast(result);

  } catch (err) {
    console.error(err);
    alert("Forecast failed");
  } finally {
    setLoading(false);
  }
};

  // =============================
  // 📈 MOCK ANALYTICS (WEEK)
  // =============================
  const weeklyData = [
  { day: "Mon", type: "Rain", payout: 400 },
  { day: "Tue", type: "AQI", payout: 350 },
  { day: "Wed", type: "Heat", payout: 200 },
  { day: "Thu", type: "Rain", payout: 500 },
  { day: "Fri", type: "AQI", payout: 300 },
];

  const admin = {
    policies: 120,
    pool: 45000,
    loss: "32%",
    fraud: 3,
    prediction: 12000,
  };

  return (
    <Layout setRole={setRole}>

      {/* ================= HEADER ================= */}
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {/* ================= TOP CARDS ================= */}
      <div className="grid grid-cols-3 gap-6">

        <Card title="Active Policies" value={admin.policies} />
        <Card title="Premium Pool" value={`₹${admin.pool}`} />
        <Card title="Loss Ratio" value={admin.loss} />

        <Card title="Fraud Flags" value={admin.fraud} />
        <Card title="Predictive Payout" value={`₹${admin.prediction}`} />
        <Card title="Disruptions Today" value="5" />

      </div>

      {/* ================= TRIGGER ENGINE ================= */}
      <div className="mt-10 bg-white p-6 rounded-xl shadow-md">

        <h2 className="text-xl font-semibold mb-4">Trigger Engine</h2>
        <div className="mb-4">
  <input
    type="text"
    placeholder="Enter City (e.g. Bangalore)"
    value={location}
    onChange={(e) => setLocation(e.target.value)}
    className="border p-2 rounded w-64"
  />
</div>

        <div className="flex gap-4 flex-wrap">

          <button
            onClick={() => runTrigger("rain")}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Rain
          </button>

          <button
            onClick={() => runTrigger("heat")}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded"
          >
            Heat
          </button>

          <button
            onClick={() => runTrigger("aqi")}
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded"
          >
            AQI
          </button>

          <button
            onClick={generateForecast}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            Generate Forecast
          </button>

        </div>

        {/* RESULT */}
        {loading && <p className="mt-4">Loading...</p>}

        {triggerData && (
          <div className="mt-5 border-t pt-4 text-sm">

            <p><b>Trigger:</b> {triggerData.trigger_type}</p>
            <p>
              <b>Status:</b>{" "}
              {triggerData.triggered ? "⚠️ Triggered" : "✅ Safe"}
            </p>
            <p><b>Value:</b> {triggerData.raw_value}</p>
            <p><b>Threshold:</b> {triggerData.threshold}</p>

          </div>
        )}

      </div>

      {/* ================= FORECAST ================= */}
      {forecast.length > 0 && (
        <div className="mt-8 bg-white p-6 rounded-xl shadow-md">

          <h2 className="text-xl font-semibold mb-4">3-Day Risk Forecast</h2>

          {forecast.map((f, i) => (
            <p key={i} className="mb-1">{f}</p>
          ))}

        </div>
      )}

      {/* ================= WEEKLY ANALYTICS ================= */}
      <div className="mt-8 bg-white p-6 rounded-xl shadow-md">

        <h2 className="text-xl font-semibold mb-4">Weekly Disruptions</h2>

        {weeklyData.map((d, i) => (
          <p key={i} className="mb-1">
                {d.day}: {d.type} disruption → ₹{d.payout}
          </p>
        ))}

      </div>

    </Layout>
  );
}