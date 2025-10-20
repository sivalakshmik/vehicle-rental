import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await axios.get(`${API_BASE_URL}/api/bookings/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(res.data);
    } catch (error) {
      console.error("❌ Booking fetch error:", error);
      Swal.fire("Error", "Failed to fetch bookings", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    const interval = setInterval(fetchBookings, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCancel = async (bookingId) => {
    const token = localStorage.getItem("token");
    try {
      await axios.put(
        ``${API_BASE_URL}/api/bookings/${bookingId}/cancel`,
        null,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire({
        icon: "success",
        title: "Booking Cancelled",
        text: "Your booking has been cancelled successfully.",
      });

      setBookings((prev) =>
        prev.map((b) =>
          b._id === bookingId ? { ...b, status: "cancelled" } : b
        )
      );
    } catch (error) {
      console.error("❌ Cancel error:", error);
      Swal.fire("Error", "Failed to cancel booking", "error");
    }
  };

  const handleDownloadInvoice = async (paymentId) => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(`${API_BASE_URL}/api/payments/invoice/${paymentId}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoice-${paymentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("❌ Invoice error:", error);
      Swal.fire("Error", "Unable to download invoice", "error");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-600 text-lg">Loading your bookings...</p>
      </div>
    );

  return (
    <section className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-center text-blue-700">
        My Bookings
      </h2>

      {bookings.length === 0 ? (
        <p className="text-center text-gray-500 text-lg">
          No bookings found.
        </p>
      ) : (
        <div className="space-y-6 max-w-4xl mx-auto">
          {bookings.map((b) => (
            <div
              key={b._id}
              className="border rounded-lg shadow-md bg-white p-5 hover:shadow-lg transition"
            >
              {/* Vehicle Info */}
              <div className="flex justify-between items-center border-b pb-2 mb-3">
                <h3 className="text-lg font-semibold text-gray-800">
                  {b.vehicle?.make} {b.vehicle?.model} ({b.vehicle?.year})
                </h3>
                <span
                  className={`text-sm px-3 py-1 rounded-full font-medium ${
                    b.status === "cancelled"
                      ? "bg-red-100 text-red-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {b.status.toUpperCase()}
                </span>
              </div>

              {/* Booking Details */}
              <div className="grid md:grid-cols-2 gap-3 text-gray-700">
                <p>
                  <strong>📍 Location:</strong>{" "}
                  {b.vehicle?.location || "N/A"}
                </p>
                <p>
                  <strong>💰 Price per day:</strong> ₹{b.vehicle?.pricePerDay}
                </p>
                <p>
                  <strong>📅 From:</strong>{" "}
                  {new Date(b.startDate).toLocaleDateString()}
                </p>
                <p>
                  <strong>📅 To:</strong>{" "}
                  {new Date(b.endDate).toLocaleDateString()}
                </p>
              </div>

              {/* Payment Info */}
              {b.payment && (
                <div className="mt-3 border-t pt-3 text-gray-600 text-sm">
                  <p>
                    💳 <strong>Paid:</strong> ₹{b.payment.amount / 100} (
                    {b.payment.status})
                  </p>
                   </div>
              )}

              {/* Action Buttons */}
              <div className="mt-4 flex flex-wrap gap-3">
                {b.payment && (
                  <button
                    onClick={() => handleDownloadInvoice(b.payment._id)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                  >
                    Download Invoice
                  </button>
                )}
                <button
                  className={`px-4 py-2 rounded text-white ${
                    b.status === "cancelled"
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                  onClick={() => handleCancel(b._id)}
                  disabled={b.status === "cancelled"}
                >
                  {b.status === "cancelled" ? "Cancelled" : "Cancel Booking"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

