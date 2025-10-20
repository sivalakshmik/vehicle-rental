
import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert('Please enter both email and password');
      return;
    }

    try {
      const { data } = await axios.post(`${API_BASE_URL}/api/users/login`, { email, password });

      if (!data?.token || !data?.user) {
        throw new Error('Invalid response from server');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      setUser(data.user);
      console.log('✅ setUser called with:', data.user);
      navigate('/home');
    } catch (err) {
      console.error('❌ Login error:', err);
      alert('Login failed. Please check your credentials.');
    }
  };

  return (
    <form onSubmit={handleLogin} className="p-8 max-w-sm mx-auto">
      <h2 className="text-xl mb-4">Login</h2>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="you@example.com"
        className="block w-full mb-4 p-2 border rounded"
        required
      />
      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="••••••••"
        className="block w-full mb-6 p-2 border rounded"
        required
      />
      <button
        type="submit"
        className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
      >
        Login
      </button>

      {/* Register link */}
      <div className="mt-4 text-center">
        <span className="text-gray-600">Don't have an account?</span>
        <Link
          to="/register"
          className="ml-2 text-blue-600 hover:underline font-medium"
        >
          Register here
        </Link>
      </div>
    </form>
  );
}


