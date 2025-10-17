import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminVehicles() {
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get("http://localhost:5000/api/admin/vehicles", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setVehicles(res.data))
      .catch((err) => console.error("❌ Fetch vehicles failed:", err));
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">🚗 Manage Vehicles</h2>
      {vehicles.length === 0 ? (
        <p>No vehicles found.</p>
      ) : (
        <table className="min-w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Make</th>
              <th className="p-2 border">Model</th>
              <th className="p-2 border">Type</th>
              <th className="p-2 border">Price</th>
              <th className="p-2 border">Location</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v) => (
              <tr key={v._id} className="border-t">
                <td className="p-2">{v.make}</td>
                <td className="p-2">{v.model}</td>
                <td className="p-2">{v.type}</td>
                <td className="p-2">₹{v.pricePerDay}</td>
                <td className="p-2">{v.location}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
