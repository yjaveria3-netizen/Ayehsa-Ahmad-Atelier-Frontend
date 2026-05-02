import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence, useInView } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import {
  Layers,
  ShoppingBag,
  Users,
  DollarSign,
  RotateCcw,
  Truck,
  FileSpreadsheet,
  CheckCircle2,
  ArrowRight,
  ChevronDown,
  Sun,
  Moon,
  Menu,
  X,
  Sparkles,
  Shield,
  Zap,
  Globe,
  Clock,
  Star,
  Quote,
  Play,
  Lock,
  Database,
  Info,
} from 'lucide-react';

/* ─────────────────────────────────────────
   STATIC DATA
───────────────────────────────────────── */
const FEATURES = [
  {
    icon: Layers,
    title: 'Product Catalog',
    desc: 'Manage your full product library with variants, SKUs, pricing, and stock levels — all in one place.',
    gradient: 'from-cyan-500 to-teal-500',
  },
  {
    icon: ShoppingBag,
    title: 'Order Pipeline',
    desc: 'Track every order from Pending to Delivered. Handle WhatsApp, Instagram, website, and in-store orders together.',
    gradient: 'from-violet-500 to-purple-500',
  },
  {
    icon: Users,
    title: 'Customer CRM',
    desc: 'Segment customers by loyalty tier, track spending history, and manage VIP relationships with ease.',
    gradient: 'from-emerald-500 to-green-500',
  },
  {
    icon: DollarSign,
    title: 'Financials',
    desc: 'Record every transaction, monitor payment status, and get a clear picture of your revenue at a glance.',
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    icon: RotateCcw,
    title: 'Returns & Refunds',
    desc: 'Handle exchange requests, refunds and return cases with a structured workflow.',
    gradient: 'from-rose-500 to-pink-500',
  },
  {
    icon: Truck,
    title: 'Supplier Management',
    desc: 'Keep track of fabric suppliers, embroiderers, and printers with lead times and ratings.',
    gradient: 'from-sky-500 to-blue-500',
  },
  {
    icon: FileSpreadsheet,
    title: 'Google Sheets Sync',
    desc: 'Every record syncs live to your Google Sheets. Your team sees the same data, always up to date.',
    gradient: 'from-lime-500 to-emerald-500',
  },
  {
    icon: CheckCircle2,
    title: 'Collection Checklist',
    desc: 'Plan and track every phase of your seasonal collection launch — from design to dispatch.',
    gradient: 'from-fuchsia-500 to-violet-500',
  },
];

const STATS = [
  { value: 8, label: 'Modules', suffix: '', prefix: '', icon: Layers },
  { value: 100, label: 'Free Forever', suffix: '%', prefix: '', icon: Sparkles },
  { value: 50, label: 'Currencies', suffix: '+', prefix: '', icon: Globe },
  { value: 24, label: 'Hr Sync', suffix: '/7', prefix: '', icon: Clock },
];

const TESTIMONIALS = [
  {
    quote: 'LibasTrack replaced three separate spreadsheets I was using. Now everything is connected — orders, customers, finances.',
    name: 'Ayesha K.',
    role: 'Founder, Atelier Brand',
    country: 'Pakistan',
    initial: 'A',
    gradient: 'from-cyan-500 to-teal-500',
  },
  {
    quote: 'The Google Sheets sync means my team always has live data without logging into the app. Brilliant for small operations.',
    name: 'Sara M.',
    role: 'Operations, Boutique Owner',
    country: 'UAE',
    initial: 'S',
    gradient: 'from-violet-500 to-purple-500',
  },
  {
    quote: 'Finally a fashion-specific tool that understands we sell on Instagram AND WhatsApp AND walk-ins, all at once.',
    name: 'Nadia R.',
    role: 'Designer & Founder',
    country: 'UK',
    initial: 'N',
    gradient: 'from-amber-500 to-orange-500',
  },
];

const HOW_IT_WORKS = [
  {
    num: '01',
    title: 'Sign in with Google',
    desc: 'No passwords. One-click Google login — your account is ready in seconds.',
    icon: Shield,
  },
  {
    num: '02',
    title: 'Connect your storage',
    desc: 'Link your Google Drive or use local Excel. LibasTrack sets up all your sheets automatically.',
    icon: FileSpreadsheet,
  },
  {
    num: '03',
    title: 'Start managing',
    desc: 'Add products, log orders, track customers and finances — all syncing live to your sheets.',
    icon: Zap,
  },
];

const DATA_PERMISSIONS = [
  {
    icon: Shield,
    title: 'Google OAuth Authentication',
    purpose: 'Secure login',
    details: 'We use Google OAuth for secure, password-free sign-in. You can manage access anytime in your Google account settings.',
  },
  {
    icon: Database,
    title: 'Google Sheets & Drive Access',
    purpose: 'Live data sync',
    details: 'We request access to your Google Drive and Sheets to create and sync your business data in real-time. This keeps your data accessible and editable directly in your sheets.',
  },
  {
    icon: FileSpreadsheet,
    title: 'Profile Information',
    purpose: 'Account setup',
    details: 'We collect your name, email, and profile image to set up your account and personalize your workspace.',
  },
  {
    icon: Lock,
    title: 'Data Protection',
    purpose: 'Security & privacy',
    details: 'All your data is encrypted, stored securely, and never sold to third parties. You own your data and can export or delete it anytime.',
  },
];

/* ─────────────────────────────────────────
   ANIMATED COUNTER
───────────────────────────────────────── */
function Counter({ value, prefix = '', suffix = '' }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const start = performance.now();
    const dur = 1600;
    const step = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(e * value));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [isInView, value]);

  return <span ref={ref}>{prefix}{display.toLocaleString()}{suffix}</span>;
}

/* ─────────────────────────────────────────
   SCROLL REVEAL
───────────────────────────────────────── */
function Reveal({ children, delay = 0, y = 32 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────── */
export default function Landing() {
  const navigate = useNavigate();
  const { isDark, toggle } = useTheme();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.96]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const [navScrolled, setNavScrolled] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setActiveTestimonial(i => (i + 1) % TESTIMONIALS.length), 4800);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="landing-page">
      {/* Ambient Background */}
      <div className="landing-ambient" aria-hidden="true">
        <div className="landing-ambient__orb landing-ambient__orb--1" />
        <div className="landing-ambient__orb landing-ambient__orb--2" />
        <div className="landing-ambient__orb landing-ambient__orb--3" />
        <div className="landing-ambient__grid" />
      </div>

      {/* ═══════════════ NAVBAR ═══════════════ */}
      <motion.header
        className={`landing-nav ${navScrolled ? 'landing-nav--scrolled' : ''}`}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        role="banner"
      >
        <div className="landing-nav__inner">
          {/* Logo */}
          <a href="/" className="landing-nav__logo" aria-label="LibasTrack home">
            <div className="landing-nav__logo-icon">
              <Sparkles size={20} />
            </div>
            <span className="landing-nav__logo-text">LibasTrack</span>
          </a>

          {/* Desktop Navigation */}
          <nav className="landing-nav__links" aria-label="Primary navigation">
            {['Features', 'How It Works', 'Reviews'].map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase().replace(/ /g, '-')}`}
                className="landing-nav__link"
              >
                {link}
              </a>
            ))}
          </nav>

          {/* CTA Actions */}
          <div className="landing-nav__actions">
            <button
              onClick={toggle}
              className="landing-nav__theme-btn"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              className="landing-btn landing-btn--primary"
              onClick={() => navigate('/login')}
            >
              Get Started Free
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="landing-nav__burger"
            onClick={() => setMenuOpen(v => !v)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              className="landing-nav__mobile"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              {['Features', 'How It Works', 'Reviews'].map((link) => (
                <a
                  key={link}
                  href={`#${link.toLowerCase().replace(/ /g, '-')}`}
                  className="landing-nav__mobile-link"
                  onClick={() => setMenuOpen(false)}
                >
                  {link}
                </a>
              ))}
              <button
                className="landing-btn landing-btn--primary landing-btn--full"
                onClick={() => navigate('/login')}
              >
                Get Started Free
                <ArrowRight size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* ═══════════════ HERO ═══════════════ */}
      <section ref={heroRef} className="landing-hero" aria-label="Hero section">
        <motion.div
          className="landing-hero__content"
          style={{ y: heroY, scale: heroScale, opacity: heroOpacity }}
        >
          {/* Eyebrow Badge */}
          <motion.div
            className="landing-hero__eyebrow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <span className="landing-hero__eyebrow-dot" />
            <span>Fashion Brand Operations Platform</span>
            <span className="landing-hero__eyebrow-badge">Free</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            className="landing-hero__headline"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            Run your entire
            <br />
            <span className="landing-hero__headline-gradient">fashion brand</span>
            <br />
            from one place.
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            className="landing-hero__sub"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.38 }}
          >
            Orders, inventory, customers, suppliers, financials & returns — all syncing live to Google Sheets.
            Built for boutiques and fashion houses. Completely free.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="landing-hero__actions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.52 }}
          >
            <button
              className="landing-btn landing-btn--primary landing-btn--large"
              onClick={() => navigate('/login')}
            >
              <Play size={18} />
              Start for Free
              <ArrowRight size={18} />
            </button>
            <a href="#features" className="landing-btn landing-btn--ghost landing-btn--large">
              Explore Modules
            </a>
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            className="landing-hero__trust"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            {[
              { icon: Shield, text: 'Google OAuth' },
              { icon: Sparkles, text: 'No credit card' },
              { icon: Zap, text: 'Live Sheets sync' },
            ].map((item, i) => (
              <span key={item.text} className="landing-hero__trust-item">
                <item.icon size={14} />
                {item.text}
                {i < 2 && <span className="landing-hero__trust-sep">|</span>}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* Dashboard Mockup */}
        <motion.div
          className="landing-hero__visual"
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          aria-hidden="true"
        >
          <div className="landing-mockup">
            {/* Window Chrome */}
            <div className="landing-mockup__chrome">
              <div className="landing-mockup__dots">
                <span style={{ background: '#FF5F57' }} />
                <span style={{ background: '#FFBD2E' }} />
                <span style={{ background: '#28CA41' }} />
              </div>
              <div className="landing-mockup__url">
                <Globe size={12} />
                libastrack.com/dashboard
              </div>
            </div>

            {/* Mockup Body */}
            <div className="landing-mockup__body">
              {/* Sidebar */}
              <div className="landing-mockup__sidebar">
                <div className="landing-mockup__sidebar-logo">
                  <Sparkles size={16} />
                </div>
                {[Layers, ShoppingBag, Users, DollarSign, RotateCcw, Truck].map((Icon, i) => (
                  <div key={i} className={`landing-mockup__nav-item ${i === 0 ? 'active' : ''}`}>
                    <Icon size={14} />
                    <div className="landing-mockup__nav-label" style={{ width: `${55 + (i % 3) * 15}%` }} />
                  </div>
                ))}
              </div>

              {/* Main Content */}
              <div className="landing-mockup__main">
                {/* Stats Row */}
                <div className="landing-mockup__stats">
                  {[
                    { color: '#06b6d4', label: 'Revenue', val: '84,200' },
                    { color: '#a855f7', label: 'Orders', val: '142' },
                    { color: '#10b981', label: 'Customers', val: '89' },
                    { color: '#f59e0b', label: 'Products', val: '203' },
                  ].map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      className="landing-mockup__stat"
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
                    >
                      <div className="landing-mockup__stat-indicator" style={{ background: stat.color }} />
                      <div className="landing-mockup__stat-label">{stat.label}</div>
                      <div className="landing-mockup__stat-value" style={{ color: stat.color }}>{stat.val}</div>
                    </motion.div>
                  ))}
                </div>

                {/* Table */}
                <div className="landing-mockup__table">
                  <div className="landing-mockup__table-header">
                    {['Order ID', 'Customer', 'Status', 'Amount'].map(h => (
                      <div key={h} className="landing-mockup__th">{h}</div>
                    ))}
                  </div>
                  {[
                    { status: 'Delivered', color: '#10b981' },
                    { status: 'Processing', color: '#f59e0b' },
                    { status: 'Confirmed', color: '#a855f7' },
                    { status: 'Pending', color: '#64748b' },
                  ].map((row, i) => (
                    <motion.div
                      key={i}
                      className="landing-mockup__tr"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + i * 0.12 }}
                    >
                      <div className="landing-mockup__td landing-mockup__td--mono">ORD-{String(1001 + i).padStart(4, '0')}</div>
                      <div className="landing-mockup__td landing-mockup__td--avatar">
                        <div className="landing-mockup__avatar" />
                        <div className="landing-mockup__avatar-name" />
                      </div>
                      <div className="landing-mockup__td">
                        <span className="landing-mockup__badge" style={{ background: `${row.color}20`, color: row.color }}>
                          {row.status}
                        </span>
                      </div>
                      <div className="landing-mockup__td landing-mockup__td--mono">{(3200 + i * 1450).toLocaleString()}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating Notification */}
            <motion.div
              className="landing-mockup__notification"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            >
              <div className="landing-mockup__notification-icon">
                <CheckCircle2 size={16} />
              </div>
              <div className="landing-mockup__notification-content">
                <div className="landing-mockup__notification-title">Sheets synced</div>
                <div className="landing-mockup__notification-sub">All records updated live</div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          className="landing-hero__scroll"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          aria-hidden="true"
        >
          <ChevronDown size={24} />
        </motion.div>
      </section>

      {/* ═══════════════ STATS BAND ═══════════════ */}
      <section className="landing-stats" aria-label="Statistics">
        <div className="landing-stats__inner">
          {STATS.map((stat, i) => (
            <React.Fragment key={stat.label}>
              {i > 0 && <div className="landing-stats__divider" aria-hidden="true" />}
              <Reveal delay={i * 0.1}>
                <div className="landing-stats__item">
                  <stat.icon size={20} className="landing-stats__icon" />
                  <div className="landing-stats__value">
                    <Counter value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
                  </div>
                  <div className="landing-stats__label">{stat.label}</div>
                </div>
              </Reveal>
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* ═══════════════ FEATURES ═══════════════ */}
      <section id="features" className="landing-section" aria-labelledby="features-heading">
        <div className="landing-section__inner">
          <Reveal>
            <div className="landing-section__header">
              <div className="landing-eyebrow">
                <Layers size={14} />
                Platform Modules
              </div>
              <h2 id="features-heading" className="landing-section__title">
                Everything your fashion
                <br />
                <span className="landing-section__title-gradient">brand needs</span>, in one system.
              </h2>
              <p className="landing-section__sub">
                Eight fully integrated modules covering every aspect of your business operations — no spreadsheet juggling required.
              </p>
            </div>
          </Reveal>

          <div className="landing-features__grid">
            {FEATURES.map((feature, i) => (
              <Reveal key={feature.title} delay={i * 0.06}>
                <div className="landing-feature-card">
                  <div className={`landing-feature-card__icon bg-gradient-to-br ${feature.gradient}`}>
                    <feature.icon size={24} />
                  </div>
                  <h3 className="landing-feature-card__title">{feature.title}</h3>
                  <p className="landing-feature-card__desc">{feature.desc}</p>
                  <div className="landing-feature-card__line" />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ HOW IT WORKS ═══════════════ */}
      <section id="how-it-works" className="landing-section landing-section--alt" aria-labelledby="how-heading">
        <div className="landing-section__inner">
          <Reveal>
            <div className="landing-section__header">
              <div className="landing-eyebrow">
                <Zap size={14} />
                Getting Started
              </div>
              <h2 id="how-heading" className="landing-section__title">
                Up and running
                <br />
                <span className="landing-section__title-gradient">in three steps.</span>
              </h2>
            </div>
          </Reveal>

          <div className="landing-steps">
            {HOW_IT_WORKS.map((step, i) => (
              <Reveal key={step.num} delay={i * 0.15}>
                <div className="landing-step">
                  <div className="landing-step__number">{step.num}</div>
                  {i < HOW_IT_WORKS.length - 1 && (
                    <div className="landing-step__connector" aria-hidden="true" />
                  )}
                  <div className="landing-step__icon">
                    <step.icon size={24} />
                  </div>
                  <h3 className="landing-step__title">{step.title}</h3>
                  <p className="landing-step__desc">{step.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ DATA & PRIVACY TRANSPARENCY ═══════════════ */}
      <section className="landing-section landing-section--alt" aria-labelledby="privacy-heading">
        <div className="landing-section__inner">
          <Reveal>
            <div className="landing-section__header">
              <div className="landing-eyebrow">
                <Info size={14} />
                Data & Privacy
              </div>
              <h2 id="privacy-heading" className="landing-section__title">
                Your data, your control.
                <br />
                <span className="landing-section__title-gradient">Complete transparency.</span>
              </h2>
              <p className="landing-section__sub">
                We're transparent about what we collect and why. You're in control of your data at all times, and you can revoke access or delete your account anytime.
              </p>
            </div>
          </Reveal>

          <div className="landing-privacy__grid">
            {DATA_PERMISSIONS.map((item, i) => (
              <Reveal key={item.title} delay={i * 0.06}>
                <div className="landing-privacy-card">
                  <div className="landing-privacy-card__header">
                    <div className="landing-privacy-card__icon">
                      <item.icon size={20} />
                    </div>
                    <span className="landing-privacy-card__badge">{item.purpose}</span>
                  </div>
                  <h3 className="landing-privacy-card__title">{item.title}</h3>
                  <p className="landing-privacy-card__desc">{item.details}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.3}>
            <div className="landing-privacy__footer">
              <p>
                For full details, see our{' '}
                <button
                  className="landing-privacy__link"
                  onClick={() => navigate('/privacy')}
                >
                  Privacy Policy
                </button>
                {' '}and{' '}
                <button
                  className="landing-privacy__link"
                  onClick={() => navigate('/terms')}
                >
                  Terms of Service
                </button>
                .
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════ TESTIMONIALS ═══════════════ */}
      <section id="reviews" className="landing-section" aria-labelledby="reviews-heading">
        <div className="landing-section__inner">
          <Reveal>
            <div className="landing-section__header">
              <div className="landing-eyebrow">
                <Star size={14} />
                Testimonials
              </div>
              <h2 id="reviews-heading" className="landing-section__title">
                Loved by <span className="landing-section__title-gradient">fashion founders</span>
              </h2>
            </div>
          </Reveal>

          <div className="landing-testimonials">
            {/* Main Testimonial */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                className="landing-testimonial"
                initial={{ opacity: 0, y: 24, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -24, scale: 0.98 }}
                transition={{ duration: 0.5 }}
              >
                <Quote className="landing-testimonial__quote-icon" size={48} />
                <blockquote className="landing-testimonial__quote">
                  {TESTIMONIALS[activeTestimonial].quote}
                </blockquote>
                <div className="landing-testimonial__author">
                  <div className={`landing-testimonial__avatar bg-gradient-to-br ${TESTIMONIALS[activeTestimonial].gradient}`}>
                    {TESTIMONIALS[activeTestimonial].initial}
                  </div>
                  <div className="landing-testimonial__info">
                    <div className="landing-testimonial__name">{TESTIMONIALS[activeTestimonial].name}</div>
                    <div className="landing-testimonial__role">
                      {TESTIMONIALS[activeTestimonial].role} · {TESTIMONIALS[activeTestimonial].country}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Testimonial Navigation */}
            <div className="landing-testimonials__nav">
              {TESTIMONIALS.map((t, i) => (
                <button
                  key={i}
                  className={`landing-testimonials__nav-btn ${i === activeTestimonial ? 'active' : ''}`}
                  onClick={() => setActiveTestimonial(i)}
                  aria-label={`View testimonial from ${t.name}`}
                >
                  <div className={`landing-testimonials__nav-avatar bg-gradient-to-br ${t.gradient}`}>
                    {t.initial}
                  </div>
                  <div className="landing-testimonials__nav-info">
                    <div className="landing-testimonials__nav-name">{t.name}</div>
                    <div className="landing-testimonials__nav-role">{t.role}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ CTA BANNER ═══════════════ */}
      <section className="landing-cta" aria-label="Call to action">
        <Reveal>
          <div className="landing-cta__card">
            <div className="landing-cta__glow" aria-hidden="true" />
            <div className="landing-cta__content">
              <div className="landing-eyebrow landing-eyebrow--light">
                <Sparkles size={14} />
                Free & Open Access
              </div>
              <h2 className="landing-cta__title">
                Ready to transform
                <br />
                how you run your brand?
              </h2>
              <p className="landing-cta__sub">
                Connect your Google account and be managing your fashion business in under two minutes.
                No setup fees. No subscriptions. No limits.
              </p>
              <button
                className="landing-btn landing-btn--light landing-btn--large"
                onClick={() => navigate('/login')}
              >
                <Play size={18} />
                Start for Free
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer className="landing-footer" role="contentinfo">
        <div className="landing-footer__inner">
          <div className="landing-footer__brand">
            <div className="landing-footer__logo">
              <Sparkles size={20} />
            </div>
            <div className="landing-footer__brand-info">
              <div className="landing-footer__brand-name">LibasTrack</div>
              <div className="landing-footer__brand-tagline">Fashion Brand Management Software</div>
            </div>
          </div>

          <nav className="landing-footer__links" aria-label="Footer navigation">
            <a href="#features" className="landing-footer__link">Features</a>
            <a href="#how-it-works" className="landing-footer__link">How It Works</a>
            <button className="landing-footer__link" onClick={() => navigate('/login')}>Sign In</button>
            <button className="landing-footer__link" onClick={() => navigate('/privacy')}>Privacy Policy</button>
            <button className="landing-footer__link" onClick={() => navigate('/terms')}>Terms of Service</button>
            <a href="mailto:support@libastrack.com" className="landing-footer__link">Contact</a>
          </nav>

          <div className="landing-footer__copy">
            &copy; {new Date().getFullYear()} LibasTrack — Built for boutiques & fashion brands worldwide
          </div>
        </div>
      </footer>
    </div>
  );
}
