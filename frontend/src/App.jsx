import MapView from "./MapView";
import { useState } from "react";
import axios from "axios";

import {
  CloudRain,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function App() {
  // 🔐 AUTH STATES
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [message, setMessage] = useState("");

  // 📊 CORE STATES (FIXED)
  const [zone, setZone] = useState("Delhi");
  const [hours, setHours] = useState(8);
  const [weeklyIncome, setWeeklyIncome] = useState(5600);

  const [result, setResult] = useState(null);
  const [risk, setRisk] = useState(null);

  // 📈 GENERATE GRAPH DATA (FIXED)
  const generateData = () => {
    const base = weeklyIncome / 7;

    return [
      { day: "Mon", earnings: base + Math.random() * 200 },
      { day: "Tue", earnings: base - Math.random() * 200 },
      { day: "Wed", earnings: base + Math.random() * 100 },
      { day: "Thu", earnings: base - Math.random() * 150 },
      { day: "Fri", earnings: base + Math.random() * 250 },
    ];
  };

  const data = generateData();

  // 🔐 LOGIN
  const handleLogin = async () => {
    try {
      const res = await axios.post("http://127.0.0.1:8000/login", {
        username,
        password,
      });

      if (res.data.status === "success") {
        setLoggedIn(true);
        setMessage("");
      } else {
        setMessage(res.data.message);
      }
    } catch {
      setMessage("Server error");
    }
  };

  // 🆕 SIGNUP
  const handleSignup = async () => {
    try {
      const res = await axios.post("http://127.0.0.1:8000/signup", {
        username,
        password,
      });

      setMessage(res.data.message);
    } catch {
      setMessage("Server error");
    }
  };

  // 💸 CHECK PAYOUT (FIXED)
  const checkPayout = async () => {
    
    try {
      console.log({ zone, hours, weeklyIncome });

      const res = await axios.post(
        "http://127.0.0.1:8000/check/1",
        {
          zone: zone,
          hours: Number(hours),
          income: Number(weeklyIncome),
        }
      );

      console.log(res.data);

      setResult({ ...res.data });
      setRisk(res.data.order_drop / 100);

    } catch (err) {
      console.error(err);
      alert("Backend error — check console");
    }
  };

  // 🔐 LOGIN SCREEN
  if (!loggedIn) {
    return (
      <div style={styles.container}>
        <h2>{isSignup ? "Create Account" : "Login"}</h2>

        <input
          style={styles.input}
          placeholder="Username"
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          style={styles.input}
          placeholder="Password"
          type="password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          style={styles.button}
          onClick={isSignup ? handleSignup : handleLogin}
        >
          {isSignup ? "Sign Up" : "Login"}
        </button>

        {message && (
          <p style={{ marginTop: 10, color: "red" }}>{message}</p>
        )}

        <p
          style={{ marginTop: 10, cursor: "pointer" }}
          onClick={() => {
            setIsSignup(!isSignup);
            setMessage("");
          }}
        >
          {isSignup
            ? "Already have an account? Login"
            : "Create new account"}
        </p>
      </div>
    );
  }

  // 📊 MAIN DASHBOARD
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>QShield Dashboard</h1>

      {/* SUMMARY */}
      <div style={styles.grid}>
        <Card
          title="Weekly Earnings"
          value={`₹${weeklyIncome}`}
          icon={<TrendingUp />}
        />

        <Card
          title="Protected Income (Weekly Max)"
          value="₹800"
          icon={<CloudRain />}
        />

        <Card
          title="Risk Level"
          value={
            risk !== null
              ? `${(risk * 100).toFixed(0)}%`
              : "Click Run Check"
          }
          icon={<AlertTriangle />}
        />
      </div>

      {/* CHECK PANEL */}
      <div style={styles.card}>
        <h2>Check Disruption</h2>

        <input
          style={styles.input}
          placeholder="City"
          value={zone}
          onChange={(e) => setZone(e.target.value)}
        />

        <input
          style={styles.input}
          placeholder="Working Hours Today"
          type="number"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
        />

        <input
          style={styles.input}
          placeholder="Weekly Income"
          type="number"
          value={weeklyIncome}
          onChange={(e) => setWeeklyIncome(e.target.value)}
        />

        <button style={styles.button} onClick={checkPayout}>
          Run Check
        </button>

        {result && (
          <div style={{ marginTop: 15 }}>
            <p>Status: {result.status}</p>
            <p>Payout: ₹{result.amount || 0}</p>
            <p>Reason: {result.reason || "None"}</p>
            <p>Order Drop: {result.order_drop}%</p>
            {/* 🔍 DEBUG VALUES (VERY IMPORTANT) */}
            <p>Temp: {result.temp}</p>
            <p>Rain: {result.rain}</p>
            <p>AQI: {result.aqi}</p>
          </div>
        )}
      </div>

      {/* GRAPH */}
      <div style={styles.card}>
        <h2>Weekly Earnings Trend</h2>

        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data}>
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="earnings"
              stroke="#22c55e"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* MAP */}
      <div style={styles.card}>
        <h2>Zone Risk Map</h2>

        <MapView
  key={result?.lat + "-" + result?.lon}   // 🔥 IMPORTANT
  lat={result?.lat}
  lon={result?.lon}
  risk={risk}

/>

      </div>

      {/* FORECAST */}
      <div style={styles.card}>
        <h2>Zone Risk Forecast</h2>
        <p>
          Next 3 days risk: {risk > 0.6 ? "🌧️ High" : "🌤️ Moderate"}
        </p>
      </div>
    </div>
  );
}

export default App;

// 🔹 CARD
function Card({ title, value, icon }) {
  return (
    <div style={styles.smallCard}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h3>{title}</h3>
        {icon}
      </div>
      <h2>{value}</h2>
    </div>
  );
}

// 🎨 STYLES
const styles = {
  container: {
    background: "#56cdd3",
    minHeight: "100vh",
    padding: 20,
  },

  title: {
    textAlign: "center",
    marginBottom: 20,
  },

  grid: {
    display: "flex",
    gap: 15,
    justifyContent: "center",
    marginBottom: 20,
    flexWrap: "wrap",
  },

  smallCard: {
    background: "#4b78bf",
    padding: 15,
    borderRadius: 10,
    width: 180,
  },

  card: {
    background: "#62b5b5",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    maxWidth: 500,
    marginInline: "auto",
  },

  input: {
    width: "100%",
    padding: 10,
    marginTop: 10,
    borderRadius: 8,
    border: "none",
  },

  button: {
    width: "100%",
    padding: 10,
    marginTop: 10,
    background: "#24b75a",
    border: "none",
    borderRadius: 8,
    color: "white",
    cursor: "pointer",
  },
  
};