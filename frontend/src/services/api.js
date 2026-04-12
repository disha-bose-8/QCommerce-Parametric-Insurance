import axios from "axios";

// CHANGE THIS TO YOUR RENDER URL ONCE DEPLOYED
const API_BASE_URL = "https://qshield-backend-nf8y.onrender.com";

// 🔥 Wake-up call (prevents cold start delay)
export const pingBackend = async () => {
  try {
    await axios.get(`${API_BASE_URL}/health`, { timeout: 60000 });
  } catch (e) {
    console.log("Backend waking up...");
  }
};

// 💰 Fetch worker payouts
export const fetchWorkerPayouts = async (workerId) => {
  const response = await axios.get(
    `${API_BASE_URL}/payout/worker/${workerId}`
  );
  return response.data;
};

// ⚡ Fetch live ML risk + premium
export const fetchLiveRisk = async (income, zone) => {
  const response = await axios.get(
    `${API_BASE_URL}/premium/calculate`,
    {
      params: {
        weekly_income: income,
        zone: zone,
      },
    }
  );
  return response.data;
};