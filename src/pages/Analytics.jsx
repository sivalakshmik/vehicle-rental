import { useEffect, useState } from 'react';
import axios from 'axios';

function Analytics() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get('http://localhost:5000/api/admin/dashboard', {
      headers: { Authorization: token }
    }).then(res => setData(res.data));
  }, []);

  if (!data) return <div className="p-6 font-poppins">Loading analytics...</div>;

  return (
    <div className="p-6 font-poppins bg-background min-h-screen">
      <h1 className="text-3xl font-bold text-text mb-6">📊 Admin Analytics</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-card p-4 rounded shadow">
          <h2 className="text-xl font-semibold text-text">👥 Total Users</h2>
          <p className="text-primary text-2xl mt-2">{data.totalUsers}</p>
        </div>
        <div className="bg-card p-4 rounded shadow">
          <h2 className="text-xl font-semibold text-text">📅 Total Bookings</h2>
          <p className="text-primary text-2xl mt-2">{data.totalBookings}</p>
        </div>
        <div className="bg-card p-4 rounded shadow">
          <h2 className="text-xl font-semibold text-text">💰 Total Revenue</h2>
          <p className="text-primary text-2xl mt-2">₹{data.totalRevenue}</p>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
