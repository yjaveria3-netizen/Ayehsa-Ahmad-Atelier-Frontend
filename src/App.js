import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { SWRConfig } from 'swr';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';
import api from './utils/api';

const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const AuthCallback = lazy(() => import('./pages/AuthCallback'));
const BrandOnboarding = lazy(() => import('./pages/BrandOnboarding'));
const StorageSetup = lazy(() => import('./pages/StorageSetup'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Products = lazy(() => import('./pages/Products'));
const Orders = lazy(() => import('./pages/Orders'));
const Customers = lazy(() => import('./pages/Customers'));
const Financial = lazy(() => import('./pages/Financial'));
const Suppliers = lazy(() => import('./pages/Suppliers'));
const Returns = lazy(() => import('./pages/Returns'));
const Checklist = lazy(() => import('./pages/Checklist'));
const Collection = lazy(() => import('./pages/Collection'));
const DriveSetup = lazy(() => import('./pages/DriveSetup'));
const BrandSettings = lazy(() => import('./pages/BrandSettings'));
const Layout = lazy(() => import('./components/Layout'));

const swrFetcher = async (url) => {
  const res = await api.get(url);
  return res.data;
};

const PageFallback = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-base)' }}>
    <div className="spinner" />
  </div>
);

// ── Route Guards ──────────────────────────────────────
const ProtectedRoute = ({ children, skipStorageCheck = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-base)' }}>
      <div className="spinner" />
    </div>
  );

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  if (!user.brand?.onboardingComplete && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  if (!skipStorageCheck && !user.storageType && location.pathname !== '/storage-setup') {
    // Only redirect to storage-setup if onboarding IS complete
    if (user.brand?.onboardingComplete) {
      return <Navigate to="/storage-setup" replace />;
    }
  }

  return children;
};

// Public-only: redirect authenticated users to dashboard
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-base)' }}>
      <div className="spinner" />
    </div>
  );
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};

// Catch-all: smart redirect based on auth state
const CatchAll = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return <Navigate to={user ? '/dashboard' : '/'} replace />;
};

// ── Toaster ───────────────────────────────────────────
function ToasterWithTheme() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: 'var(--bg-layer1)',
          color: 'var(--text-primary)',
          border: '1px solid var(--accent-border)',
          fontFamily: "var(--font-body)",
          fontSize: '0.85rem',
          borderRadius: '12px',
          boxShadow: 'var(--sha-md)',
        },
        success: { iconTheme: { primary: '#34D399', secondary: 'white' } },
        error: { iconTheme: { primary: 'var(--accent)', secondary: 'white' } },
      }}
    />
  );
}

// ── Routes ────────────────────────────────────────────
function AppRoutes() {
  return (
    <Routes>
      {/* ── Public / Unauthenticated ── */}
      <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* ── Setup Flow (requires auth, skips full protection) ── */}
      <Route path="/onboarding" element={<ProtectedRoute skipStorageCheck><BrandOnboarding /></ProtectedRoute>} />
      <Route path="/storage-setup" element={<ProtectedRoute skipStorageCheck><StorageSetup /></ProtectedRoute>} />

      {/* ── Protected App Shell ── */}
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/financial" element={<Financial />} />
        <Route path="/suppliers" element={<Suppliers />} />
        <Route path="/returns" element={<Returns />} />
        <Route path="/checklist" element={<Checklist />} />
        <Route path="/collections" element={<Collection />} />
        <Route path="/drive-setup" element={<DriveSetup />} />
        <Route path="/brand-settings" element={<BrandSettings />} />
      </Route>

      {/* ── Catch-All ── */}
      <Route path="*" element={<CatchAll />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <ErrorBoundary>
            <SWRConfig value={{
              fetcher: swrFetcher,
              dedupingInterval: 60 * 1000,
              revalidateOnFocus: false,
              shouldRetryOnError: true,
              errorRetryCount: 2,
            }}>
              <Suspense fallback={<PageFallback />}>
                <AppRoutes />
              </Suspense>
            </SWRConfig>
            <ToasterWithTheme />
          </ErrorBoundary>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;