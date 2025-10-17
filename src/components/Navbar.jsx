
import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  const linkCls = ({ isActive }) =>
    `px-3 py-1 rounded ${isActive ? 'bg-white text-primary' : 'text-white hover:bg-white hover:text-primary'}`;

  return (
    <nav className="bg-indigo-500 p-4 flex justify-between">
      <NavLink to="/home" className="text-white font-bold">KVS Venhicle Rental</NavLink>
      <div className="space-x-4">
        {!user && <NavLink to="/login" className={linkCls}>Login</NavLink>}
        {user && (
          <>
            <span className="text-white">Hi, {user.name}</span>
            <NavLink to="/dashboard" className={linkCls}>Dashboard</NavLink>
            {user.isAdmin && <NavLink to="/admin/analytics" className={linkCls}>Admin</NavLink>}
            <button onClick={logout} className="px-3 py-1 bg-white text-primary rounded">Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}
