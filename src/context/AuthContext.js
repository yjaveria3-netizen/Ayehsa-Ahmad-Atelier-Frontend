import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Fetch user profile ──────────────────
  const fetchUser = useCallback(async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.user);
      return res.data.user;
    } catch (err) {
      if (err?.response?.status === 401) {
        localStorage.removeItem('token');
        setUser(null);
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Auto restore session ────────────────
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser();

      const refreshInterval = setInterval(async () => {
        try {
          const res = await api.post('/auth/refresh');
          if (res.data.token) localStorage.setItem('token', res.data.token);
        } catch {}
      }, 24 * 60 * 60 * 1000);

      return () => clearInterval(refreshInterval);
    } else {
      setLoading(false);
    }
  }, [fetchUser]);

  // ── ✅ FIXED Google OAuth ────────────────
  const loginWithGoogle = () => {
    // DIRECT redirect (NO axios call)
    window.location.href = "https://libastrack-backend.railway.app/api/auth/google";
  };

  // ── Logout ──────────────────────────────
  const logout = async () => {
    try { await api.post('/auth/logout'); } catch {}
    localStorage.removeItem('token');
    setUser(null);
  };

  const refreshUser = () => fetchUser();

  // ── Derived values ──────────────────────
  const currency    = user?.brand?.currency || 'PKR';
  const storageType = user?.storageType || null;
  const localPath   = user?.localPath   || null;

  const formatCurrency = (n) => {
    const num = Number(n || 0);
    if (num >= 1_000_000) return `${currency} ${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 100_000)   return `${currency} ${(num / 1_000).toFixed(0)}K`;
    return `${currency} ${num.toLocaleString()}`;
  };

  return (
    <AuthContext.Provider value={{
      user, loading,
      loginWithGoogle, logout, refreshUser, setUser,
      currency, storageType, localPath, formatCurrency,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);