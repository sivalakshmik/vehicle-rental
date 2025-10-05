import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import Swal from 'sweetalert2';
import { loadStripe } from '@stripe/stripe-js';
import 'react-datepicker/dist/react-datepicker.css';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export default function BookingForm({ vehicleId }) {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [bookedRanges, setBookedRanges] = useState([]);

  useEffect(() => {
    const fetchBookedDates = async () => {
      try {
        const res = await fetch(`/api/bookings/vehicle/${vehicleId}/booked-dates`);
        const data = await res.json();
        const ranges = data.map(b => ({
          start: new Date(b.startDate),
          end: new Date(b.endDate)
        }));
        setBookedRanges(ranges);
      } catch (error) {
        console.error('❌ Failed to fetch booked dates:', error);
      }
    };
    fetchBookedDates();
  }, [vehicleId]);

  const handlePayment = async () => {
    if (!startDate || !endDate) {
      return Swal.fire({
        icon: 'warning',
        title: 'Missing Dates',
        text: 'Please select both start and end dates.'
      });
    }

    const token = localStorage.getItem('token');
    if (!token) {
      return Swal.fire({
        icon: 'warning',
        title: 'Login Required',
        text: 'Please log in to proceed with payment.'
      });
    }

    try {
      const res = await fetch('/api/payments/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          vehicleId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        })
      });

      const { sessionId } = await res.json();
      const stripe = await stripePromise;
      await stripe.redirectToCheckout({ sessionId });
    } catch (error) {
      console.error('❌ Payment error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Payment Failed',
        text: 'Unable to initiate payment. Please try again.'
      });
    }
  };

  return (
    <div className="p-4 border rounded shadow bg-white">
      <h3 className="text-lg font-bold mb-4">Book This Vehicle</h3>

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Start Date & Time</label>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            showTimeSelect
            dateFormat="Pp"
            minDate={new Date()}
            excludeDateIntervals={bookedRanges}
            className="p-2 border rounded w-full"
          />
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">End Date & Time</label>
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            showTimeSelect
            dateFormat="Pp"
            minDate={startDate || new Date()}
            excludeDateIntervals={bookedRanges}
            className="p-2 border rounded w-full"
          />
        </div>
      </div>

      <button
        onClick={handlePayment}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Pay & Book Vehicle
      </button>
    </div>
  );
}
