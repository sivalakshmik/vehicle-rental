import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY); // ✅ Use env variable

const PaymentButton = ({ vehicleId, startDate, endDate }) => {
  const handlePayment = async () => {
    if (!vehicleId || !startDate || !endDate) {
      alert('Missing booking details. Please select dates.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in to proceed with payment.');
        return;
      }

      const res = await axios.post(
        `${API_BASE_URL}/api/payments/create-session', 
        {
          vehicleId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const stripe = await stripePromise;
      await stripe.redirectToCheckout({ sessionId: res.data.sessionId });
    } catch (err) {
      console.error('❌ Payment error:', err);
      alert('Failed to initiate payment. Please try again.');
    }
  };

  return (
    <button
      onClick={handlePayment}
      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
    >
      Pay & Book Vehicle
    </button>
  );
};

export default PaymentButton;

