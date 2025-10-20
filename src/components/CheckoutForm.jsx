import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useEffect, useState } from 'react';
import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
function CheckoutForm({ amount, vehicleId, startDate, endDate }) {
  const stripe = useStripe();
  const elements = useElements();
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    axios.post(`${API_BASE_URL}/api/payments/create-intent`, { amount })
      .then(res => setClientSecret(res.data.clientSecret));
  }, [amount]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
      },
    });

    if (!error) {
      await axios.post(`${API_BASE_URL}/api/bookings`, {
        vehicleId, startDate, endDate
      }, { headers: { Authorization: token } });

      alert('✅ Payment successful & booking confirmed!');
    } else {
      alert('❌ Payment failed: ' + error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card p-4 rounded shadow mt-4">
      <h2 className="text-xl font-semibold text-text mb-2">💳 Enter Card Details</h2>
      <CardElement className="p-2 border rounded bg-white" />
      <button type="submit" className="mt-4 bg-primary text-white px-4 py-2 rounded">
        Pay ₹{amount}
      </button>
    </form>
  );
}

export default CheckoutForm;
