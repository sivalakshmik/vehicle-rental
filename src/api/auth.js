import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
console.log("🌍 API_BASE_URL in build:", API_BASE_URL);
// ✅ LOGIN
export const login = async (email, password) => {
  const res = await axios.post(`${API_BASE_URL}/api/users/login`, { email, password });
  return res.data;
};

// ✅ REGISTER
export const register = async (name, email, password) => {
  const res = await axios.post(`${API_BASE_URL}/api/users/register`, { name, email, password });
  return res.data;
};

// ✅ GET USER
export const getUser = async (token) => {
  const res = await axios.get(`${API_BASE_URL}/api/users/me`, {
    headers: { Authorization: token },
  });
  return res.data;
};

