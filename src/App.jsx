import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Analytics from './pages/Analytics.jsx';
import { AuthContext } from './context/AuthContext.jsx';
import Register from './pages/Register.jsx';
import VehicleList from './pages/VehicleList.jsx';
import PaymentSuccess from './pages/PaymentSuccess';
import AdminBookings from './pages/AdminBookings.jsx';
import AdminUsers from './pages/AdminUsers.jsx';
import AdminVehicles from './pages/AdminVehicles.jsx';
import './index.css';
import "./checkEnv.js";

export default function App() {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.isAdmin;

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/home" replace />} />
        <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" replace />} />
        <Route path="/admin/analytics" element={isAdmin ? <Analytics /> : <Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
        <Route path="/register" element={<Register />} />
        <Route path="/vehicles" element={<VehicleList />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/admin/vehicles" element={<AdminVehicles />} />
        <Route path="/admin/bookings" element={<AdminBookings />} />
        <Route path="/admin/users" element={<AdminUsers />} />

      </Routes>
    </Router>
  );
}
