import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import Swal from 'sweetalert2';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import 'react-datepicker/dist/react-datepicker.css';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export default function BookingForm({ vehicleId }) {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [bookedRanges, setBookedRanges] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Fetch booked dates
  const fetchBookedDates = async () => {
    try {
      const res = await axios.get(`/api/bookings/vehicle/${vehicleId}/booked-dates`);
      const ranges = res.data.map((b) => ({
        start: new Date(b.startDate),
        end: new Date(b.endDate),
      }));
      setBookedRanges(ranges);
    } catch (error) {
      console.error('❌ Failed to fetch booked dates:', error);
    }
  };

  useEffect(() => {
    fetchBookedDates();
  }, [vehicleId]);

  // ✅ Handle payment flow
  const handlePayment = async () => {
    if (!startDate || !endDate) {
      return Swal.fire('⚠️', 'Please select both start and end dates.', 'warning');
    }

    const token = localStorage.getItem('token');
    if (!token) {
      return Swal.fire('⚠️', 'Please login to continue.', 'warning');
    }

    setIsLoading(true);

    try {
      const res = await axios.post(
        '/api/payments/create-session',
        {
          vehicleId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          validateStatus: () => true, // 👈 prevents Axios from throwing automatically
        }
      );

      console.log('📡 Response Status:', res.status);

      if (res.status === 409) {
        // ✅ Already booked
        await Swal.fire({
          icon: 'warning',
          title: 'Already Booked',
          text: res.data.message || 'This vehicle is already booked for the selected dates.',
        });
        await fetchBookedDates();
        setIsLoading(false);
        return;
      }

      if (!res.data?.url) {
        throw new Error(res.data.message || 'Failed to create Stripe session');
      }

      // ✅ Redirect to Stripe
      const stripe = await stripePromise;
      await stripe.redirectToCheckout({ url: res.data.url });
    } catch (error) {
      console.error('❌ Payment error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Payment Failed',
        text:
          error.response?.data?.message ||
          error.message ||
          'Unable to process payment. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow bg-white max-w-md mx-auto">
      <h3 className="text-lg font-bold mb-4 text-center text-blue-700">
        Book This Vehicle
      </h3>

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1 text-gray-600">
            Start Date
          </label>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            showTimeSelect
            dateFormat="Pp"
            minDate={new Date()}
            excludeDateIntervals={bookedRanges}
            className="p-2 border rounded w-full focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium mb-1 text-gray-600">
            End Date
          </label>
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            showTimeSelect
            dateFormat="Pp"
            minDate={startDate || new Date()}
            excludeDateIntervals={bookedRanges}
            className="p-2 border rounded w-full focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>

      <button
        onClick={handlePayment}
        disabled={isLoading}
        className={`w-full py-2 rounded text-white font-semibold transition ${
          isLoading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {isLoading ? 'Processing...' : 'Pay & Book Vehicle'}
      </button>
    </div>
  );
}
