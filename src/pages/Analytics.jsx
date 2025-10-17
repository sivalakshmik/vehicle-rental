import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

function AdminDashboard() {
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState("analytics");
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [reviews, setReviews] = useState([]);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  /* -------------------------------------------
     📊 Load analytics on mount
  ------------------------------------------- */
  useEffect(() => {
    if (!token) {
      Swal.fire("Unauthorized", "Please login as admin", "error");
      window.location.href = "/login";
      return;
    }

    axios
      .get("http://localhost:5000/api/admin/dashboard", { headers })
      .then((res) => setData(res.data))
      .catch((err) => console.error("❌ Dashboard fetch error:", err));
  }, []);

  /* -------------------------------------------
     🔄 Load tab-specific data
  ------------------------------------------- */
  useEffect(() => {
    if (!token) return;

    if (activeTab === "vehicles") {
      axios
        .get("http://localhost:5000/api/admin/vehicles", { headers })
        .then((res) => setVehicles(res.data))
        .catch((err) => console.error("❌ Vehicles fetch error:", err));
    }

    if (activeTab === "bookings") {
      axios
        .get("http://localhost:5000/api/admin/bookings", { headers })
        .then((res) => setBookings(res.data))
        .catch((err) => console.error("❌ Bookings fetch error:", err));
    }

    if (activeTab === "users") {
      axios
        .get("http://localhost:5000/api/admin/users", { headers })
        .then((res) => setUsers(res.data))
        .catch((err) => console.error("❌ Users fetch error:", err));
    }

    if (activeTab === "reviews") {
      axios
        .get("http://localhost:5000/api/reviews/pending", { headers })
        .then((res) => setReviews(res.data))
        .catch((err) => console.error("❌ Reviews fetch error:", err));
    }
  }, [activeTab]);

  /* -------------------------------------------
     ⚙️ Admin Actions
  ------------------------------------------- */
  const handleReviewModeration = async (reviewId, approved) => {
    try {
      await axios.put(
        `http://localhost:5000/api/reviews/${reviewId}/moderate`,
        { approved },
        { headers }
      );
      Swal.fire(
        approved ? "✅ Approved!" : "🚫 Rejected!",
        "Review moderation successful.",
        "success"
      );
      setReviews(reviews.filter((r) => r._id !== reviewId));
    } catch (err) {
      Swal.fire("Error", "Failed to moderate review", "error");
      console.error(err);
    }
  };

  if (!data)
    return <div className="p-6 font-poppins text-lg">Loading dashboard...</div>;

  /* -------------------------------------------
     🧭 Tabs Navigation
  ------------------------------------------- */
  const tabs = ["analytics", "vehicles", "bookings", "users", "reviews"];

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-poppins">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        ⚙️ Admin Dashboard
      </h1>

      {/* 🧭 Tabs */}
      <div className="flex space-x-4 border-b mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 px-4 text-lg font-medium ${
              activeTab === tab
                ? "border-b-4 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-blue-600"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* 📈 ANALYTICS */}
      {activeTab === "analytics" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
            <h2 className="text-lg font-semibold text-gray-700">👥 Users</h2>
            <p className="text-blue-600 text-3xl mt-2">{data.totalUsers}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
            <h2 className="text-lg font-semibold text-gray-700">📅 Bookings</h2>
            <p className="text-green-600 text-3xl mt-2">{data.totalBookings}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
            <h2 className="text-lg font-semibold text-gray-700">💰 Revenue</h2>
            <p className="text-purple-600 text-3xl mt-2">
              ₹{Number(data.totalRevenue || 0).toLocaleString("en-IN")}
            </p>
          </div>
        </div>
      )}

      {/* 🚗 VEHICLES */}
      {activeTab === "vehicles" && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">🚗 Manage Vehicles</h2>
          {vehicles.length === 0 ? (
            <p>No vehicles found.</p>
          ) : (
            <table className="min-w-full border bg-white rounded-lg shadow text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 border">Image</th>
                  <th className="p-2 border">Make / Model</th>
                  <th className="p-2 border">Type</th>
                  <th className="p-2 border">Price</th>
                  <th className="p-2 border">Location</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((v) => (
                  <tr key={v._id} className="border-t hover:bg-gray-50">
                    <td className="p-2">
                      <img
                        src={v.imageUrl || "/assets/placeholder.jpg"}
                        alt={v.make}
                        className="w-16 h-10 object-cover rounded"
                      />
                    </td>
                    <td className="p-2 font-semibold">
                      {v.make} {v.model}
                    </td>
                    <td className="p-2">{v.type}</td>
                    <td className="p-2 text-green-600 font-medium">
                      ₹{v.pricePerDay}
                    </td>
                    <td className="p-2">{v.location}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* 📖 BOOKINGS */}
      {activeTab === "bookings" && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">📅 Manage Bookings</h2>
          {bookings.length === 0 ? (
            <p>No bookings available.</p>
          ) : (
            <table className="min-w-full border bg-white rounded-lg shadow text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 border">User</th>
                  <th className="p-2 border">Vehicle</th>
                  <th className="p-2 border">Period</th>
                  <th className="p-2 border">Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id} className="border-t hover:bg-gray-50">
                    <td className="p-2">{b.user?.name || "N/A"}</td>
                    <td className="p-2">
                      {b.vehicle?.make} {b.vehicle?.model}
                    </td>
                    <td className="p-2">
                      {new Date(b.startDate).toLocaleDateString()} →{" "}
                      {new Date(b.endDate).toLocaleDateString()}
                    </td>
                    <td className="p-2">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          b.status === "confirmed"
                            ? "bg-green-100 text-green-700"
                            : b.status === "cancelled"
                            ? "bg-red-100 text-red-600"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* 👥 USERS */}
      {activeTab === "users" && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">👥 Manage Users</h2>
          {users.length === 0 ? (
            <p>No users found.</p>
          ) : (
            <table className="min-w-full border bg-white rounded-lg shadow text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 border">Name</th>
                  <th className="p-2 border">Email</th>
                  <th className="p-2 border">Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-t hover:bg-gray-50">
                    <td className="p-2">{u.name}</td>
                    <td className="p-2">{u.email}</td>
                    <td className="p-2">
                      {u.isAdmin ? (
                        <span className="text-blue-600 font-medium">Admin</span>
                      ) : (
                        "User"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* 💬 REVIEWS */}
      {activeTab === "reviews" && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">💬 Pending Reviews</h2>
          {reviews.length === 0 ? (
            <p>No pending reviews.</p>
          ) : (
            <table className="min-w-full border bg-white rounded-lg shadow text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 border">User</th>
                  <th className="p-2 border">Vehicle</th>
                  <th className="p-2 border">Rating</th>
                  <th className="p-2 border">Comment</th>
                  <th className="p-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((r) => (
                  <tr key={r._id} className="border-t hover:bg-gray-50">
                    <td className="p-2">{r.user?.name}</td>
                    <td className="p-2">
                      {r.vehicle?.make} {r.vehicle?.model}
                    </td>
                    <td className="p-2">⭐ {r.rating}</td>
                    <td className="p-2">{r.comment}</td>
                    <td className="p-2 flex gap-2">
                      <button
                        onClick={() => handleReviewModeration(r._id, true)}
                        className="bg-green-600 text-white px-2 py-1 rounded text-xs"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReviewModeration(r._id, false)}
                        className="bg-red-600 text-white px-2 py-1 rounded text-xs"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
