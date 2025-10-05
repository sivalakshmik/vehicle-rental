import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function PaymentSuccess() {
  const [params] = useSearchParams();
  const sessionId = params.get('session_id');
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestBooking = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/bookings/my', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const bookings = await response.json();
        const latest = bookings.find(b => b.payment?.sessionId === sessionId);
        setBooking(latest || null);
      } catch (error) {
        console.error('❌ Failed to fetch booking:', error);
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) fetchLatestBooking();
  }, [sessionId]);

  return (
    <div className="p-6 text-center">
      <h2 className="text-2xl font-bold text-green-600">✅ Payment Successful</h2>
      <p className="mt-2">Your booking is confirmed. Check your email for details.</p>

      {loading && <p className="mt-4 text-gray-500">Loading booking details...</p>}

      {booking && (
        <div className="mt-6 text-left bg-gray-100 p-4 rounded shadow">
          <h3 className="font-semibold text-lg mb-2">Booking Summary</h3>
          <p><strong>Vehicle:</strong> {booking.vehicle.make} {booking.vehicle.model}</p>
          <p><strong>Rental Period:</strong> {new Date(booking.startDate).toLocaleDateString()} to {new Date(booking.endDate).toLocaleDateString()}</p>
          <p><strong>Amount Paid:</strong> ₹{booking.payment.amount / 100}</p>
          <p><strong>Status:</strong> {booking.status}</p>
        </div>
      )}

      {!loading && !booking && (
        <p className="mt-4 text-red-500">No booking found for this session. Please check your email or contact support.</p>
      )}
    </div>
  );
}
