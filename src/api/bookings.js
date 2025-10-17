
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/bookings/my', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBookings(res.data);
      } catch (err) {
        console.error('❌ Fetch error:', err);
      }
    };
    fetchBookings();
  }, []);

  return (
    <section className="p-6">
      <h2 className="text-2xl font-bold text-center mb-6">My Bookings</h2>
      {bookings.length === 0 ? (
        <p className="text-center text-gray-500">No bookings yet.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {bookings.map((b) => (
            <article key={b._id} className="border rounded-lg shadow p-4 bg-white">
              <h3 className="text-lg font-bold">
                {b.vehicle.make} {b.vehicle.model}
              </h3>
              <p>From: {new Date(b.startDate).toLocaleDateString()}</p>
              <p>To: {new Date(b.endDate).toLocaleDateString()}</p>
              <p className={`font-semibold mt-2 ${b.status === 'cancelled' ? 'text-red-600' : 'text-green-600'}`}>
                {b.status.toUpperCase()}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
