import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const createPaymentIntent = async (amount) => {

  const res = await axios.post(`${API_BASE_URL}/api/payments/create-intent`, { amount });
  return res.data;
};
