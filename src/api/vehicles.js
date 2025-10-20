import axios from 'axios';
// 
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
export const getVehicles = async () => {
  const res = await axios.get('${API_BASE_URL}/api/vehicles');
  return res.data;
};
// 
export const getVehicleById = async (id) => {
  const res = await axios.get(`${API_BASE_URL}/api/vehicles/${id}`);
  return res.data;
};



