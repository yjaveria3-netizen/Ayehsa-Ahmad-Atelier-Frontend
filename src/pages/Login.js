import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const TAGLINES = [
  'Perfectly organised.',
  'Beautifully tracked.',
  'Always in sync.',
  'Simply powerful.',
  'Built to scale.',
];

const MODULES = [
  { icon: '📦', label: 'Products' },
  { icon: '🛍️', label: 'Orders' },
  { icon: '👥', label: 'Customers' },
  { icon: '💰', label: 'Financials' },
  { icon: '↩️', label: 'Returns' },
  { icon: '🏭', label: 'Suppliers' },
  { icon: '📊', label: 'Sheets Sync' },
  { icon: '✅', label: 'Checklist' },
];

export default function Login() {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [taglineIdx, setTaglineIdx] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [activeModule, setActiveModule] = useState(0);

  useEffect(() => {
    const error = searchParams.get('error');
    if (error === 'oauth_failed') {
      toast.error('Google authentication failed. Please try again.');
    }
  }, [searchParams]);

  useEffect(() => {
    const t1 = setInterval(() => setTaglineIdx(p => (p + 1) % TAGLINES.length), 3200);
    const t2 = setInterval(() => setActiveModule(p => (p + 1) % MODULES.length), 1600);
    return () => { clearInterval(t1); clearInterval(t2); };
  }, []);

  const handleLogin = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      await loginWithGoogle();
    } catch {
      toast.error('Failed to initiate Google login. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="lt-login">

      {/* Ambient */}
      <div className="lt-ambient" aria-hidden="true">
        <div className="lt-ambient-orb lt-ambient-orb--1" style={{ top: '10%', left: '10%' }} />
        <div className="lt-ambient-orb lt-ambient-orb--2" style={{ bottom: '15%', right: '5%' }} />
        <div className="lt-grain" />
      </div>

      {/* ── LEFT PANEL ── */}
      <motion.div
        className="lt-login__panel lt-login__panel--left glass"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        aria-hidden="true"
      >
        {/* Decorative large letter */}
        <div className="lt-login__bg-letter" aria-hidden="true">L</div>

        <div className="lt-login__panel-content">
          {/* Back */}
          <button
            className="lt-login__back"
            onClick={() => navigate('/')}
            tabIndex={-1}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Back to Home
          </button>

          {/* Logo mark */}
          <div className="lt-login__logo-row">
            <div className="lt-nav__logo-icon" style={{ width: 48, height: 48, fontSize: '1.3rem' }}>
              <span>L</span>
            </div>
            <span className="lt-login__brand-name">LibasTrack</span>
          </div>

          {/* Headline */}
          <h1 className="lt-login__tagline-head">
            Your brand.{' '}
            <AnimatePresence mode="wait">
              <motion.span
                key={taglineIdx}
                className="lt-login__tagline-swap"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4 }}
              >
                {TAGLINES[taglineIdx]}
              </motion.span>
            </AnimatePresence>
          </h1>

          <p className="lt-login__panel-desc">
            LibasTrack gives fashion brands the complete toolkit — orders, inventory, CRM,
            suppliers, returns, and checklist — with live Google Sheets sync.
          </p>

          {/* Modules orbit display */}
          <div className="lt-login__modules">
            {MODULES.map((m, i) => (
              <motion.div
                key={m.label}
                className={`lt-login__module${i === activeModule ? ' active' : ''}`}
                animate={{ scale: i === activeModule ? 1.1 : 1, opacity: i === activeModule ? 1 : 0.5 }}
                transition={{ duration: 0.3 }}
              >
                <span className="lt-login__module-icon">{m.icon}</span>
                <span className="lt-login__module-label">{m.label}</span>
              </motion.div>
            ))}
          </div>

          {/* Stats */}
          <div className="lt-login__panel-stats">
            {[
              { val: '8', label: 'Modules' },
              { val: '50+', label: 'Currencies' },
              { val: '100%', label: 'Free' },
            ].map((s, i) => (
              <React.Fragment key={s.label}>
                {i > 0 && <div className="lt-login__stat-sep" />}
                <div className="lt-login__stat">
                  <div className="lt-login__stat-val">{s.val}</div>
                  <div className="lt-login__stat-label">{s.label}</div>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── RIGHT PANEL ── */}
      <motion.div
        className="lt-login__panel lt-login__panel--right"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="lt-login__form-wrap">

          {/* Back (mobile only) */}
          <button
            className="lt-login__back lt-login__back--mobile"
            onClick={() => navigate('/')}
            aria-label="Go back to home page"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Back to Home
          </button>

          {/* Form header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <div className="lt-login__form-eyebrow">Welcome to LibasTrack</div>
            <h2 className="lt-login__form-title">Sign in to your account</h2>
            <p className="lt-login__form-sub">
              Elevate your boutique management with a suite designed for the modern fashion house.
            </p>
          </motion.div>

          {/* Divider */}
          <div className="lt-login__divider" aria-hidden="true" />

          {/* Google button */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.5 }}
          >
            <button
              className="lt-google-btn"
              onClick={handleLogin}
              disabled={isLoading}
              aria-label={isLoading ? 'Redirecting to Google…' : 'Continue with Google'}
              aria-busy={isLoading}
            >
              {isLoading ? (
                <div className="lt-google-btn__spinner" aria-hidden="true" />
              ) : (
                <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              )}
              <span>{isLoading ? 'Redirecting to Google…' : 'Continue with Google'}</span>
            </button>
          </motion.div>

          {/* Info cards */}
          <motion.div
            className="lt-login__info-cards"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.75, duration: 0.5 }}
          >
            {[
              { icon: '🔒', title: 'Secure OAuth', desc: 'We never store your Google password.' },
              { icon: '⚡', title: 'Instant Setup', desc: 'Sheets and folders created automatically.' },
            ].map(c => (
              <div key={c.title} className="lt-login__info-card">
                <span className="lt-login__info-icon">{c.icon}</span>
                <div>
                  <div className="lt-login__info-title">{c.title}</div>
                  <div className="lt-login__info-desc">{c.desc}</div>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Footer */}
          <motion.p
            className="lt-login__fine-print"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
          >
            By continuing, you agree to our{' '}
            <a href="/privacy" className="lt-login__fine-link">Privacy Policy</a>{' '}
            and{' '}
            <a href="/terms" className="lt-login__fine-link">Terms of Service</a>.
            LibasTrack is free to use.
          </motion.p>

        </div>
      </motion.div>

    </div>
  );
}