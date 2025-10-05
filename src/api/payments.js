import axios from 'axios';

export const createPaymentIntent = async (amount) => {
  const res = await axios.post('http://localhost:5000/api/payments/create-intent', { amount });
  return res.data;
};
