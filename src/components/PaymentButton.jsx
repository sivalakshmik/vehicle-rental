import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const PaymentButton = ({ vehicleId, startDate, endDate }) => {
  const handlePayment = async () => {
    if (!vehicleId || !startDate || !endDate) {
      alert("Missing booking details. Please select dates.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please log in to proceed with payment.");
        return;
      }

      console.log("🌍 Using API_BASE_URL:", API_BASE_URL);

      const res = await axios.post(
        `${API_BASE_URL}/api/payments/create-session`,
        {
          vehicleId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("✅ Stripe session created:", res.data);

      // 🔁 Redirect to Stripe Checkout
      if (res.data.url) {
        window.location.href = res.data.url;
      } else {
        const stripe = await stripePromise;
        await stripe.redirectToCheckout({ sessionId: res.data.sessionId });
      }
    } catch (err) {
      console.error("❌ Payment error:", err.response?.data || err.message);
      alert("Failed to initiate payment. Please try again.");
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
