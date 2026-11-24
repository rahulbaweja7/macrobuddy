import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const persist = (token, u) => {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(u));
      setUser(u);
    };

    // Google OAuth redirect: the URL carries a short-lived one-time code (never the JWT)
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code) {
      // Remove the code from the URL straight away so it isn't visible / shareable
      window.history.replaceState({}, '', window.location.pathname);
      api.post('/api/auth/google/exchange', { code })
        .then((res) => persist(res.data.token, res.data.user))
        .catch(() => {})
        .finally(() => setLoading(false));
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const stored = localStorage.getItem('user');
      if (token && stored) setUser(JSON.parse(stored));
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/api/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    setUser(res.data.user);
  };

  const register = async (name, email, password) => {
    const res = await api.post('/api/auth/register', { name, email, password });
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    setUser(res.data.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
