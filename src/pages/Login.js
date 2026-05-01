import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Sparkles,
  Package,
  ShoppingBag,
  Users,
  DollarSign,
  RotateCcw,
  Truck,
  FileSpreadsheet,
  CheckCircle2,
  Shield,
  Zap,
  Lock,
  Globe,
  Loader2
} from 'lucide-react';

const TAGLINES = [
  'Perfectly organised.',
  'Beautifully tracked.',
  'Always in sync.',
  'Simply powerful.',
  'Built to scale.',
];

const MODULES = [
  { icon: Package, label: 'Products', color: 'var(--accent)' },
  { icon: ShoppingBag, label: 'Orders', color: 'var(--secondary)' },
  { icon: Users, label: 'Customers', color: 'var(--emerald)' },
  { icon: DollarSign, label: 'Financials', color: 'var(--gold)' },
  { icon: RotateCcw, label: 'Returns', color: 'var(--rose)' },
  { icon: Truck, label: 'Suppliers', color: 'var(--sky)' },
  { icon: FileSpreadsheet, label: 'Sheets Sync', color: 'var(--lime)' },
  { icon: CheckCircle2, label: 'Checklist', color: 'var(--fuchsia)' },
];

const INFO_CARDS = [
  { 
    icon: Shield, 
    title: 'Secure OAuth', 
    desc: 'We never store your Google password.',
    gradient: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-deep) 100%)'
  },
  { 
    icon: Zap, 
    title: 'Instant Setup', 
    desc: 'Sheets and folders created automatically.',
    gradient: 'linear-gradient(135deg, var(--gold) 0%, var(--amber) 100%)'
  },
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
    loginWithGoogle();
  };

  return (
    <div className="auth-page">
      {/* Ambient Background */}
      <div className="auth-ambient" aria-hidden="true">
        <div className="auth-ambient__orb auth-ambient__orb--1" />
        <div className="auth-ambient__orb auth-ambient__orb--2" />
        <div className="auth-ambient__orb auth-ambient__orb--3" />
        <div className="auth-ambient__grid" />
      </div>

      {/* Left Panel - Branding */}
      <motion.div
        className="auth-panel auth-panel--left"
        initial={{ opacity: 0, x: -60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        aria-hidden="true"
      >
        {/* Decorative Background Icon */}
        <div className="auth-panel__bg-letter" style={{ fontSize: '20vw', opacity: 0.05 }}>
          <Sparkles size={200} />
        </div>

        <div className="auth-panel__content">
          {/* Back Button */}
          <button
            className="auth-back-btn"
            onClick={() => navigate('/')}
            tabIndex={-1}
          >
            <ArrowLeft size={16} />
            <span>Back to Home</span>
          </button>

          {/* Logo */}
          <div className="auth-logo">
            <div className="auth-logo__icon">
              <Sparkles size={24} />
            </div>
            <span className="auth-logo__text">LibasTrack</span>
          </div>

          {/* Animated Headline */}
          <h1 className="auth-headline">
            Your brand.{' '}
            <AnimatePresence mode="wait">
              <motion.span
                key={taglineIdx}
                className="auth-headline__swap"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.4 }}
              >
                {TAGLINES[taglineIdx]}
              </motion.span>
            </AnimatePresence>
          </h1>

          <p className="auth-description">
            LibasTrack gives fashion brands the complete toolkit — orders, inventory, CRM,
            suppliers, returns, and checklist — with live Google Sheets sync.
          </p>

          {/* Modules Grid */}
          <div className="auth-modules">
            {MODULES.map((m, i) => {
              const Icon = m.icon;
              return (
                <motion.div
                  key={m.label}
                  className={`auth-module ${i === activeModule ? 'auth-module--active' : ''}`}
                  animate={{ 
                    scale: i === activeModule ? 1.08 : 1, 
                    opacity: i === activeModule ? 1 : 0.5 
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <div 
                    className="auth-module__icon"
                    style={{ 
                      background: i === activeModule ? m.color : 'var(--bg-layer2)',
                      boxShadow: i === activeModule ? `0 0 20px ${m.color}40` : 'none'
                    }}
                  >
                    <Icon size={16} />
                  </div>
                  <span className="auth-module__label">{m.label}</span>
                </motion.div>
              );
            })}
          </div>

          {/* Stats */}
          <div className="auth-stats">
            {[
              { val: '8', label: 'Modules', icon: Package },
              { val: '50+', label: 'Currencies', icon: Globe },
              { val: '100%', label: 'Free', icon: Zap },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <React.Fragment key={s.label}>
                  {i > 0 && <div className="auth-stats__divider" />}
                  <div className="auth-stat">
                    <Icon size={16} className="auth-stat__icon" />
                    <div className="auth-stat__value">{s.val}</div>
                    <div className="auth-stat__label">{s.label}</div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Right Panel - Login Form */}
      <motion.div
        className="auth-panel auth-panel--right"
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="auth-form-container">
          {/* Mobile Back Button */}
          <button
            className="auth-back-btn auth-back-btn--mobile"
            onClick={() => navigate('/')}
            aria-label="Go back to home page"
          >
            <ArrowLeft size={16} />
            <span>Back to Home</span>
          </button>

          {/* Form Header */}
          <motion.div
            className="auth-form-header"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6 }}
          >
            <div className="auth-form-eyebrow">
              <Lock size={14} />
              <span>Welcome to LibasTrack</span>
            </div>
            <h2 className="auth-form-title">Sign in to your account</h2>
            <p className="auth-form-subtitle">
              Elevate your boutique management with a suite designed for the modern fashion house.
            </p>
          </motion.div>

          {/* Divider */}
          <motion.div 
            className="auth-divider"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          />

          {/* Google Login Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.5 }}
          >
            <button
              className="auth-google-btn"
              onClick={handleLogin}
              disabled={isLoading}
              aria-label={isLoading ? 'Redirecting to Google...' : 'Continue with Google'}
              aria-busy={isLoading}
            >
              <span className="auth-google-btn__bg" />
              <span className="auth-google-btn__content">
                {isLoading ? (
                  <Loader2 size={20} className="auth-google-btn__spinner" />
                ) : (
                  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                )}
                <span>{isLoading ? 'Redirecting to Google...' : 'Continue with Google'}</span>
              </span>
            </button>
          </motion.div>

          {/* Info Cards */}
          <motion.div
            className="auth-info-cards"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            {INFO_CARDS.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.title} className="auth-info-card">
                  <div 
                    className="auth-info-card__icon"
                    style={{ background: card.gradient }}
                  >
                    <Icon size={18} />
                  </div>
                  <div className="auth-info-card__content">
                    <div className="auth-info-card__title">{card.title}</div>
                    <div className="auth-info-card__desc">{card.desc}</div>
                  </div>
                </div>
              );
            })}
          </motion.div>

          {/* Fine Print */}
          <motion.p
            className="auth-fine-print"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.85, duration: 0.5 }}
          >
            By continuing, you agree to our{' '}
            <a href="/privacy" className="auth-fine-print__link">Privacy Policy</a>{' '}
            and{' '}
            <a href="/terms" className="auth-fine-print__link">Terms of Service</a>.
            LibasTrack is free to use.
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}
