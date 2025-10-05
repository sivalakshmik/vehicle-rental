import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/bookings/my', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(response.data);
    } catch (error) {
      console.error('❌ Booking fetch error:', error);
    }
  };

  useEffect(() => {
    fetchBookings();

    // Optional: Poll every 5 seconds to catch webhook delay
    const interval = setInterval(fetchBookings, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCancel = async (bookingId) => {
    const token = localStorage.getItem('token');
    try {
      await axios.put(`/api/bookings/${bookingId}/cancel`, null, {
        headers: { Authorization: `Bearer ${token}` }
      });

      Swal.fire({
        icon: 'success',
        title: 'Booking Cancelled',
        text: 'Your booking has been cancelled.'
      });

      setBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? { ...b, status: 'cancelled' } : b))
      );
    } catch (error) {
      console.error('❌ Cancel error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Cancellation Failed',
        text: 'Unable to cancel booking. Please try again.'
      });
    }
  };

  const handleDownloadInvoice = async (paymentId) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`/api/payments/invoice/${paymentId}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${paymentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('❌ Invoice download error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Download Failed',
        text: 'Unable to download invoice.'
      });
    }
  };

  return (
    <section className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-center">My Bookings</h2>

      {bookings.length === 0 ? (
        <p className="text-center text-gray-500">No bookings found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bookings.map((booking) => (
            <article key={booking._id} className="border rounded-lg shadow p-4 bg-white">
              <h3 className="text-lg font-bold mb-2">
                {booking.vehicle.make} {booking.vehicle.model} ({booking.vehicle.year})
              </h3>
              <p className="text-gray-600">{booking.vehicle.description}</p>
              <p className="mt-2 text-blue-700 font-semibold">₹{booking.vehicle.pricePerDay} / day</p>
              <p className="mt-2">📅 <strong>From:</strong> {new Date(booking.startDate).toLocaleDateString()}</p>
              <p>📅 <strong>To:</strong> {new Date(booking.endDate).toLocaleDateString()}</p>
              <p className={`mt-2 font-semibold ${booking.status === 'cancelled' ? 'text-red-600' : 'text-green-600'}`}>
                Status: {booking.status}
              </p>

              {booking.payment && (
                <>
                  <p className="mt-2 text-sm text-gray-500">
                    💳 Paid: ₹{booking.payment.amount / 100} ({booking.payment.status})
                  </p>
                  <button
                    className="mt-2 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                    onClick={() => handleDownloadInvoice(booking.payment._id)}
                  >
                    Download Invoice
                  </button>
                </>
              )}

              <button
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
                onClick={() => handleCancel(booking._id)}
                disabled={booking.status === 'cancelled'}
              >
                {booking.status === 'cancelled' ? 'Cancelled' : 'Cancel Booking'}
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
