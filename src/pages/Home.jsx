import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-tr from-white via-blue-100 to-blue-300 flex flex-col items-center justify-center px-6 py-12">
      <h1 className="text-5xl md:text-6xl font-extrabold text-blue-900 mb-6 text-center leading-tight">
        KVS Vehicle Rentals
      </h1>
      <p className="text-xl md:text-2xl text-gray-800 mb-10 text-center max-w-2xl">
       Drive your dreams today. Discover top-quality vehicles at unbeatable prices...
      </p>
      <div className="flex flex-col md:flex-row gap-6">
        <Link
          to="/dashboard"
          className="px-8 py-4 bg-blue-700 text-white text-lg font-medium rounded-xl shadow-md hover:bg-blue-800 transition duration-300"
        >
          Go to Dashboard
        </Link>
        <Link
          to="/vehicles"
          className="px-8 py-4 bg-white text-blue-700 border border-blue-700 text-lg font-medium rounded-xl shadow-md hover:bg-blue-50 transition duration-300"
        >
          Browse Vehicles
        </Link>
      </div>
    </div>
  );
}

