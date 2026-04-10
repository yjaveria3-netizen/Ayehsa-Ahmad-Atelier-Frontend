import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import './index.css';

import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';
import BrandOnboarding from './pages/BrandOnboarding';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Customers from './pages/Customers';
import Financial from './pages/Financial';
import Suppliers from './pages/Suppliers';
import Returns from './pages/Returns';
import Checklist from './pages/Checklist';
import DriveSetup from './pages/DriveSetup';
import BrandSettings from './pages/BrandSettings';
import Layout from './components/Layout';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:'var(--bg-base)' }}>
      <div className="spinner" />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};

/* Stub for unbuilt pages */
const Stub = ({ title, icon = '▦' }) => (
  <div>
    <div className="page-header">
      <div className="page-header-inner">
        <div>
          <h1 className="page-title">{title}</h1>
          <p className="page-subtitle">Coming soon</p>
        </div>
      </div>
    </div>
    <div className="page-body">
      <div className="card">
        <div className="empty-state">
          <div className="empty-ico">{icon}</div>
          <h3>{title}</h3>
          <p>This module is being built. Check back soon.</p>
        </div>
      </div>
    </div>
  </div>
);

function ToasterWithTheme() {
  const { isDark } = useTheme();
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: isDark ? '#18181E' : '#FFFFFF',
          color: isDark ? '#F4F4F6' : '#1A1A20',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
          fontFamily: "'Instrument Sans', system-ui, sans-serif",
          fontSize: '0.8rem',
          borderRadius: '10px',
          boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.5)' : '0 4px 16px rgba(0,0,0,0.1)',
        },
        success: { iconTheme: { primary: '#34D399', secondary: isDark ? '#09090B' : '#FAFAF9' } },
        error:   { iconTheme: { primary: '#FB7185', secondary: isDark ? '#09090B' : '#FAFAF9' } },
      }}
    />
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/onboarding" element={<ProtectedRoute><BrandOnboarding /></ProtectedRoute>} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="orders" element={<Orders />} />
        <Route path="customers" element={<Customers />} />
        <Route path="financial" element={<Financial />} />
        <Route path="suppliers" element={<Suppliers />} />
        <Route path="returns" element={<Returns />} />
        <Route path="checklist" element={<Checklist />} />
        <Route path="collections" element={<Stub title="Collections" icon="▤" />} />
        <Route path="drive-setup" element={<DriveSetup />} />
        <Route path="brand-settings" element={<BrandSettings />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
          <ToasterWithTheme />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
