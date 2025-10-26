import React, { useEffect, useState } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import Swal from "sweetalert2";
import "react-datepicker/dist/react-datepicker.css";

export default function VehicleList() {
  const [vehicles, setVehicles] = useState([]);
  const [dateRanges, setDateRanges] = useState({});
  const [loadingVehicleId, setLoadingVehicleId] = useState(null);
  const [expandedVehicle, setExpandedVehicle] = useState(null);
  const [reviews, setReviews] = useState({});
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });

  // ✅ Filters
  const [filters, setFilters] = useState({
    keyword: "",
    type: "",
    location: "",
    minPrice: "",
    maxPrice: "",
  });

  const API_BASE_URL =
    import.meta.env.VITE_API_URL ||
    "https://vehicle-rental-server-kzuh.onrender.com";

  // ✅ Fetch vehicles based on filters
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/vehicles`, {
          params: filters,
        });
        setVehicles(res.data);
      } catch (err) {
        console.error("❌ Vehicle fetch error:", err);
        Swal.fire("Error", "Unable to load vehicles.", "error");
      }
    };
    fetchVehicles();
  }, [filters]);

  // ✅ Date change handler
  const handleDateChange = (vehicleId, field, value) => {
    setDateRanges((prev) => ({
      ...prev,
      [vehicleId]: { ...prev[vehicleId], [field]: value },
    }));
  };

  // ✅ Handle payment + booking
  const handlePayment = async (vehicleId) => {
    const range = dateRanges[vehicleId];
    if (!range?.startDate || !range?.endDate)
      return Swal.fire("Missing Dates", "Please select both start and end dates.", "warning");

    const token = localStorage.getItem("token");
    if (!token)
      return Swal.fire({
        title: "Login Required",
        text: "Please log in to book a vehicle.",
        icon: "warning",
        confirmButtonText: "Go to Login",
      }).then(() => (window.location.href = "/login"));

    try {
      setLoadingVehicleId(vehicleId);
      const res = await axios.post(
        `${API_BASE_URL}/api/payments/create-session`,
        {
          vehicleId,
          startDate: range.startDate.toISOString(),
          endDate: range.endDate.toISOString(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      window.location.href = res.data.url; // Stripe redirect
    } catch (error) {
      console.error("❌ Payment error:", error);
      if (error.response?.status === 409)
        Swal.fire("Already Booked", error.response.data.message, "warning");
      else Swal.fire("Payment Failed", "Please try again later.", "error");
    } finally {
      setLoadingVehicleId(null);
    }
  };

  // ✅ Disable unavailable dates
  const isDateUnavailable = (date, bookedRanges = []) => {
    return bookedRanges.some(
      (b) => date >= new Date(b.startDate) && date <= new Date(b.endDate)
    );
  };

  // ✅ Toggle expand card (load reviews)
  const toggleExpand = async (vehicleId) => {
    if (expandedVehicle === vehicleId) {
      setExpandedVehicle(null);
      return;
    }
    setExpandedVehicle(vehicleId);
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/reviews/vehicle/${vehicleId}`
      );
      setReviews((prev) => ({ ...prev, [vehicleId]: res.data }));
    } catch (err) {
      console.error("❌ Failed to load reviews:", err);
    }
  };

  // ✅ Submit new review
  const handleSubmitReview = async (vehicleId) => {
    const token = localStorage.getItem("token");
    if (!token)
      return Swal.fire("Login Required", "Please log in to leave a review.", "info");

    try {
      await axios.post(
        `${API_BASE_URL}/api/reviews/${vehicleId}`,
        newReview,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Swal.fire("✅ Submitted", "Your review was sent for approval.", "success");
      setNewReview({ rating: 5, comment: "" });
    } catch (err) {
      console.error("❌ Review submission error:", err);
      Swal.fire("Error", "Could not submit review.", "error");
    }
  };

  // ✅ Clear all filters
  const clearFilters = () =>
    setFilters({ keyword: "", type: "", location: "", minPrice: "", maxPrice: "" });

  return (
    <section className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold text-center text-blue-700 mb-6">
        Find Your Perfect Ride 🚗
      </h2>

      {/* 🔍 Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-md max-w-6xl mx-auto mb-8 grid md:grid-cols-6 gap-3">
        <input
          type="text"
          placeholder="Search (make or model)"
          value={filters.keyword}
          onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
          className="border rounded-lg px-3 py-2 focus:ring focus:ring-blue-300 outline-none"
        />
        <select
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          className="border rounded-lg px-3 py-2 focus:ring focus:ring-blue-300 outline-none"
        >
          <option value="">All Types</option>
          <option value="car">Car</option>
          <option value="bike">Bike</option>
          <option value="van">Scooter</option>
        </select>
        <input
          type="text"
          placeholder="Location"
          value={filters.location}
          onChange={(e) => setFilters({ ...filters, location: e.target.value })}
          className="border rounded-lg px-3 py-2 focus:ring focus:ring-blue-300 outline-none"
        />
        <input
          type="number"
          placeholder="Min ₹"
          value={filters.minPrice}
          onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
          className="border rounded-lg px-3 py-2 focus:ring focus:ring-blue-300 outline-none"
        />
        <input
          type="number"
          placeholder="Max ₹"
          value={filters.maxPrice}
          onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
          className="border rounded-lg px-3 py-2 focus:ring focus:ring-blue-300 outline-none"
        />
        <button
          onClick={clearFilters}
          className="bg-gray-200 text-gray-700 rounded-lg px-3 py-2 hover:bg-gray-300 transition"
        >
          Clear
        </button>
      </div>

      {/* 🚘 Vehicle Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {vehicles.length > 0 ? (
          vehicles.map((v) => {
            const range = dateRanges[v._id] || {};
            const ready = range.startDate && range.endDate;
            const days = ready
              ? Math.ceil((range.endDate - range.startDate) / (1000 * 60 * 60 * 24))
              : 0;
            const total = v.pricePerDay * days;

            return (
              <article
                key={v._id}
                className="border rounded-lg p-4 bg-white shadow hover:shadow-lg transition"
              >
                <img
                  src={v.imageUrl || "/assets/placeholder.jpg"}
                  alt={v.make}
                  className="w-full h-56 object-cover rounded mb-4"
                />
                <h3 className="text-lg font-semibold">
                  {v.make} {v.model}
                </h3>
                <p className="text-gray-600">📍 {v.location || "Unknown"}</p>
                <p className="text-gray-600">₹{v.pricePerDay} / day</p>
                {v.rating && (
                  <p className="text-yellow-500">⭐ {v.rating.toFixed(1)} / 5</p>
                )}

                {/* Date pickers */}
                <div className="mt-2">
                  <label className="font-medium text-sm">Start Date:</label>
                  <DatePicker
                    selected={range.startDate}
                    onChange={(date) => handleDateChange(v._id, "startDate", date)}
                    minDate={new Date()}
                    filterDate={(date) => !isDateUnavailable(date, v.bookedDates)}
                    className="p-2 border rounded w-full mt-1"
                    placeholderText="Select start date"
                  />
                  <label className="mt-2 block font-medium text-sm">End Date:</label>
                  <DatePicker
                    selected={range.endDate}
                    onChange={(date) => handleDateChange(v._id, "endDate", date)}
                    minDate={range.startDate || new Date()}
                    filterDate={(date) => !isDateUnavailable(date, v.bookedDates)}
                    className="p-2 border rounded w-full mt-1"
                    placeholderText="Select end date"
                  />
                </div>

                {ready && (
                  <p className="mt-2 text-green-700 font-bold">
                    Total: ₹{total.toLocaleString()}
                  </p>
                )}

                <button
                  onClick={() => handlePayment(v._id)}
                  disabled={!ready || loadingVehicleId === v._id}
                  className={`mt-3 w-full px-4 py-2 text-white rounded transition ${
                    ready
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                >
                  {loadingVehicleId === v._id ? "Processing..." : "Pay & Book"}
                </button>

                <button
                  onClick={() => toggleExpand(v._id)}
                  className="mt-2 w-full text-blue-600 hover:underline text-sm"
                >
                  {expandedVehicle === v._id
                    ? "Hide Details ↑"
                    : "Write Your Reviews ↓"}
                </button>

                {/* Expanded Details */}
                {expandedVehicle === v._id && (
                  <div className="mt-4 border-t pt-3">
                    <p className="text-gray-700">
                      <strong>Description:</strong>{" "}
                      {v.description || "No description provided."}
                    </p>
                    <hr className="my-2" />

                    <h4 className="font-semibold text-lg mb-2">⭐ Reviews</h4>
                    {reviews[v._id]?.length ? (
                      reviews[v._id].map((rev) => (
                        <div key={rev._id} className="border-b py-2">
                          <p className="font-semibold">{rev.user?.name}</p>
                          <p>{"⭐".repeat(rev.rating)}</p>
                          <p>{rev.comment}</p>
                          <span className="text-xs text-gray-500">
                            {new Date(rev.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">No reviews yet.</p>
                    )}

                    <div className="mt-4">
                      <h5 className="font-semibold text-sm mb-1">Leave a Review:</h5>
                      <select
                        value={newReview.rating}
                        onChange={(e) =>
                          setNewReview({ ...newReview, rating: Number(e.target.value) })
                        }
                        className="border p-1 rounded mr-2"
                      >
                        {[1, 2, 3, 4, 5].map((r) => (
                          <option key={r} value={r}>
                            {r} ⭐
                          </option>
                        ))}
                      </select>
                      <textarea
                        value={newReview.comment}
                        onChange={(e) =>
                          setNewReview({ ...newReview, comment: e.target.value })
                        }
                        placeholder="Write your review..."
                        className="border rounded p-2 w-full mt-2"
                      />
                      <button
                        onClick={() => handleSubmitReview(v._id)}
                        className="bg-green-600 text-white px-3 py-1 rounded mt-2"
                      >
                        Submit Review
                      </button>
                    </div>
                  </div>
                )}
              </article>
            );
          })
        ) : (
          <p className="text-center text-gray-600 col-span-full">
            No vehicles found. Try adjusting filters.
          </p>
        )}
      </div>
    </section>
  );
}

