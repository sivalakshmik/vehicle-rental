import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('user');
      console.log('🔍 Initial user from localStorage:', raw);
      if (!raw || raw === 'undefined') return null;
      return JSON.parse(raw);
    } catch (err) {
      console.error('❌ Failed to parse user JSON:', err);
      return null;
    }
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('🔐 Axios auth header set');
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, []);

  useEffect(() => {
    console.log('🧠 AuthProvider mounted, user =', user);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}
