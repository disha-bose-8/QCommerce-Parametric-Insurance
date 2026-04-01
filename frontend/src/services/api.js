import axios from 'axios';

// CHANGE THIS TO YOUR RENDER URL ONCE DEPLOYED
const API_BASE_URL = "http://localhost:8000/api"; 

export const fetchWorkerPayouts = async (workerId) => {
  const response = await axios.get(`${API_BASE_URL}/payout/worker/${workerId}`);
  return response.data;
};

export const fetchLiveRisk = async (income, zone) => {
  // This calls your ML + Oracle engine
  const response = await axios.get(`${API_BASE_URL}/premium/calculate`, {
    params: { weekly_income: income, zone: zone }
  });
  return response.data;
};