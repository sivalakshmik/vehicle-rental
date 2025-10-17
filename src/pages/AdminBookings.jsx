import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get("http://localhost:5000/api/admin/bookings", {
         headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setBookings(res.data))
      .catch((err) => console.error("❌ Fetch bookings failed:", err));
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">📅 Manage Bookings</h2>
      {bookings.length === 0 ? (
        <p>No bookings found.</p>
      ) : (
        <table className="min-w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">User</th>
              <th className="p-2 border">Vehicle</th>
              <th className="p-2 border">Dates</th>
              <th className="p-2 border">Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b._id}>
                <td className="p-2">{b.user?.name}</td>
                <td className="p-2">
                  {b.vehicle?.make} {b.vehicle?.model}
                </td>
                <td className="p-2">
                  {new Date(b.startDate).toLocaleDateString()} →{" "}
                  {new Date(b.endDate).toLocaleDateString()}
                </td>
                <td className="p-2">{b.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
