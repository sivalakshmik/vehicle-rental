import axios from 'axios';

export const getVehicles = async () => {
  const res = await axios.get('http://localhost:5000/api/vehicles');
  return res.data;
};

export const getVehicleById = async (id) => {
  const res = await axios.get(`http://localhost:5000/api/vehicles/${id}`);
  return res.data;
};
