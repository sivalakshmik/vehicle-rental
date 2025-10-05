import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import Swal from 'sweetalert2';
import 'react-datepicker/dist/react-datepicker.css';

export default function VehicleList() {
  const [vehicles, setVehicles] = useState([]);
  const [filters, setFilters] = useState({
    type: '',
    location: '',
    minPrice: '',
    maxPrice: '',
    keyword: ''
  });
  const [dateRanges, setDateRanges] = useState({});
  const [loadingVehicleId, setLoadingVehicleId] = useState(null);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await axios.get('/api/vehicles', { params: filters });
        setVehicles(response.data);
      } catch (error) {
        console.error('❌ Vehicle fetch error:', error);
      }
    };
    fetchVehicles();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (vehicleId, field, value) => {
    setDateRanges((prev) => ({
      ...prev,
      [vehicleId]: {
        ...prev[vehicleId],
        [field]: value
      }
    }));
  };

  const handlePayment = async (vehicleId) => {
    const range = dateRanges[vehicleId];
    if (!range?.startDate || !range?.endDate) {
      return Swal.fire({
        icon: 'warning',
        title: 'Missing Dates',
        text: 'Please select both start and end dates.'
      });
    }

    const token = localStorage.getItem('token');
    if (!token) {
      return Swal.fire({
        title: 'Login Required',
        text: 'Please log in to proceed with payment.',
        icon: 'warning',
        confirmButtonText: 'Go to Login'
      }).then(() => {
        window.location.href = '/login';
      });
    }

    try {
      setLoadingVehicleId(vehicleId);
      const res = await axios.post(
        '/api/payments/create-session',
        {
          vehicleId,
          startDate: range.startDate.toISOString(),
          endDate: range.endDate.toISOString()
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // ✅ Redirect to Stripe-hosted checkout
      window.location.href = res.data.url;
    } catch (error) {
      console.error('❌ Payment error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Payment Failed',
        text: error?.message || 'Unable to initiate payment. Please try again.'
      });
    } finally {
      setLoadingVehicleId(null);
    }
  };

  return (
    <section className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-center">Available Vehicles</h2>

      {/* 🔍 Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <select name="type" value={filters.type} onChange={handleFilterChange} className="p-2 border rounded">
          <option value="">All Types</option>
          <option value="car">Car</option>
          <option value="bike">Bike</option>
          <option value="scooter">Scooter</option>
          <option value="suv">SUV</option>
        </select>

        <select name="location" value={filters.location} onChange={handleFilterChange} className="p-2 border rounded">
          <option value="">All Locations</option>
          <option value="Madurai">Madurai</option>
          <option value="Chennai">Chennai</option>
          <option value="Coimbatore">Coimbatore</option>
          <option value="Trichy">Trichy</option>
        </select>

        <input
          name="minPrice"
          type="number"
          placeholder="Min ₹"
          value={filters.minPrice}
          onChange={handleFilterChange}
          className="p-2 border rounded"
        />

        <input
          name="maxPrice"
          type="number"
          placeholder="Max ₹"
          value={filters.maxPrice}
          onChange={handleFilterChange}
          className="p-2 border rounded"
        />

        <input
          name="keyword"
          placeholder="Search make/model"
          value={filters.keyword}
          onChange={handleFilterChange}
          className="p-2 border rounded"
        />
      </div>

      {/* 🚗 Vehicle Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {vehicles.length === 0 ? (
          <p className="text-center text-gray-500 col-span-full">Loading...</p>
        ) : (
          vehicles.map((vehicle) => {
            const range = dateRanges[vehicle._id] || {};
            const isReadyToPay = range.startDate && range.endDate;
            const estimatedDays = isReadyToPay
              ? Math.ceil((range.endDate - range.startDate) / (1000 * 60 * 60 * 24))
              : 0;
            const estimatedPrice = estimatedDays * vehicle.pricePerDay;

            return (
              <article key={vehicle._id} className="border rounded-lg shadow p-4 bg-white">
                <img
                  src={vehicle.imageUrl}
                  alt={`${vehicle.make} ${vehicle.model}`}
                  onError={(e) => {
                    e.target.src = '/assets/placeholder.jpg';
                  }}
                  className="w-full h-40 object-cover rounded mb-4"
                />

                <h3 className="text-lg font-bold">{vehicle.make} {vehicle.model} ({vehicle.year})</h3>
                <p className="text-gray-600">{vehicle.description}</p>
                <p className="mt-2 text-blue-700 font-semibold">₹{vehicle.pricePerDay} / day</p>
                <p className={`text-sm mt-1 ${vehicle.available ? 'text-green-600' : 'text-red-500'}`}>
                  {vehicle.available ? 'Available' : 'Not Available'}
                </p>

                {/* 📅 Booking Date Pickers */}
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-1">Start Date</label>
                  <DatePicker
                    selected={range.startDate}
                    onChange={(date) => handleDateChange(vehicle._id, 'startDate', date)}
                    selectsStart
                    startDate={range.startDate}
                    endDate={range.endDate}
                    minDate={new Date()}
                    className="p-2 border rounded w-full"
                  />

                  <label className="block text-sm font-medium mt-2 mb-1">End Date</label>
                  <DatePicker
                    selected={range.endDate}
                    onChange={(date) => handleDateChange(vehicle._id, 'endDate', date)}
                    selectsEnd
                    startDate={range.startDate}
                    endDate={range.endDate}
                    minDate={range.startDate || new Date()}
                    className="p-2 border rounded w-full"
                  />
                </div>

                {/* 💰 Estimated Price */}
                {isReadyToPay && (
                  <p className="mt-2 text-green-700 font-semibold">
                    Estimated Total: ₹{estimatedPrice}
                  </p>
                )}

                {/* 📅 Booked Dates */}
                {vehicle.bookedDates?.length > 0 && (
                  <div className="mt-2 text-sm text-gray-600">
                    <strong>Booked Dates:</strong>
                    <ul className="list-disc ml-4">
                      {vehicle.bookedDates.map((b, i) => (
                        <li key={i}>
                          {new Date(b.start).toLocaleDateString()} → {new Date(b.end).toLocaleDateString()}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 💳 Payment Button */}
                <button
                  className={`mt-4 px-4 py-2 rounded text-white ${
                    isReadyToPay ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'
                  }`}
                  onClick={() => isReadyToPay && handlePayment(vehicle._id)}
                  disabled={!isReadyToPay || loadingVehicleId === vehicle._id}
                >
                  {loadingVehicleId === vehicle._id ? 'Redirecting...' : 'Pay & Book Vehicle'}
                </button>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}

