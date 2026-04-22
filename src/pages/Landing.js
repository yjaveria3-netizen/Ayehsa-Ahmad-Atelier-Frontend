import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence, useInView } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

/* ─────────────────────────────────────────
   STATIC DATA
───────────────────────────────────────── */
const FEATURES = [
  {
    icon: '◈',
    title: 'Product Catalog',
    desc: 'Manage your full product library with variants, SKUs, pricing, and stock levels — all in one place.',
    accent: '#C9A96E',
  },
  {
    icon: '◉',
    title: 'Order Pipeline',
    desc: 'Track every order from Pending to Delivered. Handle WhatsApp, Instagram, website, and in-store orders together.',
    accent: '#A78BFA',
  },
  {
    icon: '◎',
    title: 'Customer CRM',
    desc: 'Segment customers by loyalty tier, track spending history, and manage VIP relationships with ease.',
    accent: '#34D399',
  },
  {
    icon: '◐',
    title: 'Financials',
    desc: 'Record every transaction, monitor payment status, and get a clear picture of your revenue at a glance.',
    accent: '#F472B6',
  },
  {
    icon: '◑',
    title: 'Returns & Refunds',
    desc: 'Handle exchange requests, refunds and return cases with a structured workflow.',
    accent: '#FB923C',
  },
  {
    icon: '◒',
    title: 'Supplier Management',
    desc: 'Keep track of fabric suppliers, embroiderers, and printers with lead times and ratings.',
    accent: '#38BDF8',
  },
  {
    icon: '◓',
    title: 'Google Sheets Sync',
    desc: 'Every record syncs live to your Google Sheets. Your team sees the same data, always up to date.',
    accent: '#4ADE80',
  },
  {
    icon: '◔',
    title: 'Collection Checklist',
    desc: 'Plan and track every phase of your seasonal collection launch — from design to dispatch.',
    accent: '#E879F9',
  },
];

const STATS = [
  { value: 8, label: 'Modules', suffix: '', prefix: '' },
  { value: 100, label: 'Free', suffix: '%', prefix: '' },
  { value: 50, label: 'Currencies', suffix: '+', prefix: '' },
  { value: 24, label: 'Hr Sync', suffix: '/7', prefix: '' },
];

const TESTIMONIALS = [
  {
    quote: 'LibasTrack replaced three separate spreadsheets I was using. Now everything is connected — orders, customers, finances.',
    name: 'Ayesha K.',
    role: 'Founder, Atelier Brand',
    country: 'PK',
    initial: 'A',
  },
  {
    quote: 'The Google Sheets sync means my team always has live data without logging into the app. Brilliant for small operations.',
    name: 'Sara M.',
    role: 'Operations, Boutique Owner',
    country: 'AE',
    initial: 'S',
  },
  {
    quote: 'Finally a fashion-specific tool that understands we sell on Instagram AND WhatsApp AND walk-ins, all at once.',
    name: 'Nadia R.',
    role: 'Designer & Founder',
    country: 'GB',
    initial: 'N',
  },
];

const HOW_IT_WORKS = [
  {
    num: '01',
    title: 'Sign in with Google',
    desc: 'No passwords. One-click Google login — your account is ready in seconds.',
  },
  {
    num: '02',
    title: 'Connect your storage',
    desc: 'Link your Google Drive or use local Excel. LibasTrack sets up all your sheets automatically.',
  },
  {
    num: '03',
    title: 'Start managing',
    desc: 'Add products, log orders, track customers and finances — all syncing live to your sheets.',
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
    <div className="lt-landing" style={{ minHeight: '100vh', overflowX: 'hidden' }}>

      {/* Ambient background elements */}
      <div className="lt-ambient" aria-hidden="true">
        <div className="lt-ambient-orb lt-ambient-orb--1" />
        <div className="lt-ambient-orb lt-ambient-orb--2" />
        <div className="lt-ambient-orb lt-ambient-orb--3" />
        <div className="lt-grain" />
      </div>

      {/* ───────────── NAVBAR ───────────── */}
      <motion.header
        className={`lt-nav${navScrolled ? ' lt-nav--scrolled' : ''}`}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        role="banner"
      >
        <div className="lt-nav__inner">

          {/* Logo */}
          <a href="/" className="lt-nav__logo" aria-label="LibasTrack home">
            <div className="lt-nav__logo-icon" aria-hidden="true">
              <span>L</span>
            </div>
            <span className="lt-nav__logo-text">LibasTrack</span>
          </a>

          {/* Desktop Links */}
          <nav className="lt-nav__links" aria-label="Primary navigation">
            {['Features', 'How It Works', 'Reviews'].map((l) => (
              <a
                key={l}
                href={`#${l.toLowerCase().replace(/ /g, '-')}`}
                className="lt-nav__link"
              >
                {l}
              </a>
            ))}
          </nav>

          {/* CTA */}
          <div className="lt-nav__cta">
            <button
              onClick={toggle}
              className="lt-nav__theme-btn"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              )}
            </button>
            <button
              className="lt-btn lt-btn--primary"
              onClick={() => navigate('/login')}
              aria-label="Get started free"
            >
              Get Started Free
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="lt-nav__burger"
            onClick={() => setMenuOpen(v => !v)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            <span /><span /><span />
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              className="lt-nav__mobile-menu"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              {['Features', 'How It Works', 'Reviews'].map((l) => (
                <a
                  key={l}
                  href={`#${l.toLowerCase().replace(/ /g, '-')}`}
                  className="lt-nav__mobile-link"
                  onClick={() => setMenuOpen(false)}
                >
                  {l}
                </a>
              ))}
              <button className="lt-btn lt-btn--primary" onClick={() => navigate('/login')} style={{ width: '100%', marginTop: 8 }}>
                Get Started Free
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* ───────────── HERO ───────────── */}
      <section
        ref={heroRef}
        className="lt-hero"
        aria-label="Hero section"
      >
        {/* Parallax wrapper */}
        <motion.div className="lt-hero__parallax" style={{ y: heroY, scale: heroScale, opacity: heroOpacity }}>

          {/* Eyebrow */}
          <motion.div
            className="lt-hero__eyebrow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <span className="lt-hero__dot" aria-hidden="true" />
            Fashion Brand Operations Platform
          </motion.div>

          {/* Headline */}
          <motion.h1
            className="lt-hero__headline"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            Run your entire
            <br />
            <em className="lt-hero__headline-em">fashion brand</em>
            <br />
            from one place.
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            className="lt-hero__sub"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.38 }}
          >
            Orders, inventory, customers, suppliers, financials &amp; returns — all syncing live to Google Sheets.
            Built for boutiques and fashion houses. Completely free.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="lt-hero__actions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.52 }}
          >
            <button
              className="lt-btn lt-btn--primary lt-btn--large"
              onClick={() => navigate('/login')}
              aria-label="Start for free"
            >
              Start for Free
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
            <a
              href="#features"
              className="lt-btn lt-btn--ghost lt-btn--large"
            >
              Explore Modules
            </a>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            className="lt-hero__trust"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <span className="lt-hero__trust-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
              Google OAuth
            </span>
            <span className="lt-hero__trust-sep" aria-hidden="true">·</span>
            <span className="lt-hero__trust-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
              No credit card
            </span>
            <span className="lt-hero__trust-sep" aria-hidden="true">·</span>
            <span className="lt-hero__trust-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
              Live Sheets sync
            </span>
          </motion.div>
        </motion.div>

        {/* Hero visual — dashboard mockup */}
        <motion.div
          className="lt-hero__visual"
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          aria-hidden="true"
        >
          <div className="lt-mockup">
            {/* Window chrome */}
            <div className="lt-mockup__chrome">
              <div className="lt-mockup__dot" style={{ background: '#FF5F57' }} />
              <div className="lt-mockup__dot" style={{ background: '#FFBD2E' }} />
              <div className="lt-mockup__dot" style={{ background: '#28CA41' }} />
              <div className="lt-mockup__url">libastrack.com/dashboard</div>
            </div>
            {/* Mockup body */}
            <div className="lt-mockup__body">
              {/* Sidebar */}
              <div className="lt-mockup__sidebar">
                <div className="lt-mockup__sidebar-logo" />
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className={`lt-mockup__nav-item${i === 1 ? ' active' : ''}`}>
                    <div className="lt-mockup__nav-icon" />
                    <div className="lt-mockup__nav-label" style={{ width: `${55 + (i % 3) * 15}%` }} />
                  </div>
                ))}
              </div>
              {/* Main area */}
              <div className="lt-mockup__main">
                {/* Stat cards row */}
                <div className="lt-mockup__stats">
                  {[
                    { color: '#C9A96E', label: 'Revenue', val: '₨ 84,200' },
                    { color: '#A78BFA', label: 'Orders', val: '142' },
                    { color: '#34D399', label: 'Customers', val: '89' },
                    { color: '#F472B6', label: 'Products', val: '203' },
                  ].map((s, i) => (
                    <motion.div
                      key={s.label}
                      className="lt-mockup__stat"
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
                    >
                      <div className="lt-mockup__stat-dot" style={{ background: s.color }} />
                      <div className="lt-mockup__stat-label">{s.label}</div>
                      <div className="lt-mockup__stat-val" style={{ color: s.color }}>{s.val}</div>
                    </motion.div>
                  ))}
                </div>
                {/* Table skeleton */}
                <div className="lt-mockup__table">
                  <div className="lt-mockup__table-head">
                    {['Order ID', 'Customer', 'Status', 'Amount'].map(h => (
                      <div key={h} className="lt-mockup__th">{h}</div>
                    ))}
                  </div>
                  {[
                    { status: 'Delivered', color: '#34D399' },
                    { status: 'Processing', color: '#FBBF24' },
                    { status: 'Confirmed', color: '#A78BFA' },
                    { status: 'Pending', color: '#94A3B8' },
                  ].map((r, i) => (
                    <motion.div
                      key={i}
                      className="lt-mockup__tr"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + i * 0.12 }}
                    >
                      <div className="lt-mockup__td lt-mockup__td--mono">ORD-{String(1001 + i).padStart(4,'0')}</div>
                      <div className="lt-mockup__td">
                        <div className="lt-mockup__avatar" />
                        <div className="lt-mockup__td-label" />
                      </div>
                      <div className="lt-mockup__td">
                        <span className="lt-mockup__badge" style={{ background: `${r.color}20`, color: r.color }}>
                          {r.status}
                        </span>
                      </div>
                      <div className="lt-mockup__td lt-mockup__td--mono">₨ {(3200 + i * 1450).toLocaleString()}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
            {/* Floating notification */}
            <motion.div
              className="lt-mockup__notif"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            >
              <div className="lt-mockup__notif-icon">✓</div>
              <div>
                <div className="lt-mockup__notif-title">Sheets synced</div>
                <div className="lt-mockup__notif-sub">All records updated live</div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="lt-hero__scroll"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          aria-hidden="true"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12l7 7 7-7"/>
          </svg>
        </motion.div>
      </section>

      {/* ───────────── STATS BAND ───────────── */}
      <section className="lt-stats-band" aria-label="Statistics">
        <div className="lt-stats-band__inner">
          {STATS.map((s, i) => (
            <React.Fragment key={s.label}>
              {i > 0 && <div className="lt-stats-band__sep" aria-hidden="true" />}
              <Reveal delay={i * 0.1}>
                <div className="lt-stats-band__item">
                  <div className="lt-stats-band__value">
                    <Counter value={s.value} prefix={s.prefix} suffix={s.suffix} />
                  </div>
                  <div className="lt-stats-band__label">{s.label}</div>
                </div>
              </Reveal>
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* ───────────── FEATURES ───────────── */}
      <section id="features" className="lt-section lt-features" aria-labelledby="features-heading">
        <div className="lt-section__inner">
          <Reveal>
            <div className="lt-section__header">
              <div className="lt-eyebrow">Platform Modules</div>
              <h2 id="features-heading" className="lt-section__title">
                Everything your fashion<br />brand needs, in one system.
              </h2>
              <p className="lt-section__sub">
                Eight fully integrated modules covering every aspect of your business operations — no spreadsheet juggling required.
              </p>
            </div>
          </Reveal>

          <div className="lt-features__grid">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 0.06}>
                <div className="lt-feature-card" style={{ '--card-accent': f.accent }}>
                  <div className="lt-feature-card__icon" aria-hidden="true">{f.icon}</div>
                  <h3 className="lt-feature-card__title">{f.title}</h3>
                  <p className="lt-feature-card__desc">{f.desc}</p>
                  <div className="lt-feature-card__line" aria-hidden="true" />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── HOW IT WORKS ───────────── */}
      <section id="how-it-works" className="lt-section lt-how" aria-labelledby="how-heading">
        <div className="lt-section__inner">
          <Reveal>
            <div className="lt-section__header">
              <div className="lt-eyebrow">Getting Started</div>
              <h2 id="how-heading" className="lt-section__title">
                Up and running<br />in three steps.
              </h2>
            </div>
          </Reveal>

          <div className="lt-how__steps">
            {HOW_IT_WORKS.map((s, i) => (
              <Reveal key={s.num} delay={i * 0.15}>
                <div className="lt-how__step">
                  <div className="lt-how__step-num" aria-hidden="true">{s.num}</div>
                  {i < HOW_IT_WORKS.length - 1 && (
                    <div className="lt-how__connector" aria-hidden="true" />
                  )}
                  <h3 className="lt-how__step-title">{s.title}</h3>
                  <p className="lt-how__step-desc">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── TESTIMONIALS ───────────── */}
      <section id="reviews" className="lt-section lt-testimonials" aria-labelledby="reviews-heading">
        <div className="lt-section__inner">
          <Reveal>
            <div className="lt-section__header">
              <div className="lt-eyebrow">Testimonials</div>
              <h2 id="reviews-heading" className="lt-section__title">
                Loved by fashion founders
              </h2>
            </div>
          </Reveal>

          <div className="lt-testimonials__wrap">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                className="lt-testimonial"
                initial={{ opacity: 0, y: 24, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -24, scale: 0.98 }}
                transition={{ duration: 0.5 }}
                role="region"
                aria-label={`Testimonial from ${TESTIMONIALS[activeTestimonial].name}`}
              >
                <div className="lt-testimonial__quote-mark" aria-hidden="true">"</div>
                <blockquote className="lt-testimonial__quote">
                  {TESTIMONIALS[activeTestimonial].quote}
                </blockquote>
                <div className="lt-testimonial__author">
                  <div className="lt-testimonial__avatar">
                    {TESTIMONIALS[activeTestimonial].initial}
                  </div>
                  <div>
                    <div className="lt-testimonial__name">
                      {TESTIMONIALS[activeTestimonial].name}
                    </div>
                    <div className="lt-testimonial__role">
                      {TESTIMONIALS[activeTestimonial].role} · {TESTIMONIALS[activeTestimonial].country}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Dots */}
            <div className="lt-testimonials__dots" role="tablist" aria-label="Testimonial navigation">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  role="tab"
                  aria-selected={i === activeTestimonial}
                  aria-label={`View testimonial ${i + 1}`}
                  className={`lt-testimonials__dot${i === activeTestimonial ? ' active' : ''}`}
                  onClick={() => setActiveTestimonial(i)}
                />
              ))}
            </div>

            {/* All three — side-by-side faded previews on desktop */}
            <div className="lt-testimonials__all">
              {TESTIMONIALS.map((t, i) => (
                <button
                  key={i}
                  className={`lt-testimonial-mini${i === activeTestimonial ? ' active' : ''}`}
                  onClick={() => setActiveTestimonial(i)}
                  aria-label={`Select testimonial from ${t.name}`}
                >
                  <div className="lt-testimonial-mini__avatar">{t.initial}</div>
                  <div>
                    <div className="lt-testimonial-mini__name">{t.name}</div>
                    <div className="lt-testimonial-mini__role">{t.role}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── CTA BANNER ───────────── */}
      <section className="lt-cta-section" aria-label="Call to action">
        <Reveal>
          <div className="lt-cta-card">
            <div className="lt-cta-card__glow" aria-hidden="true" />
            <div className="lt-cta-card__content">
              <div className="lt-eyebrow" style={{ color: 'rgba(255,255,255,0.6)' }}>Free & Open Access</div>
              <h2 className="lt-cta-card__title">
                Ready to transform<br />how you run your brand?
              </h2>
              <p className="lt-cta-card__sub">
                Connect your Google account and be managing your fashion business in under two minutes.
                No setup fees. No subscriptions. No limits.
              </p>
              <button
                className="lt-btn lt-btn--light lt-btn--large"
                onClick={() => navigate('/login')}
                aria-label="Start using LibasTrack for free"
              >
                Start for Free
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ───────────── FOOTER ───────────── */}
      <footer className="lt-footer" role="contentinfo">
        <div className="lt-footer__inner">
          <div className="lt-footer__brand">
            <div className="lt-nav__logo-icon lt-footer__logo-icon" aria-hidden="true">
              <span>L</span>
            </div>
            <div>
              <div className="lt-footer__brand-name">LibasTrack</div>
              <div className="lt-footer__brand-tagline">Fashion Brand Management Software</div>
            </div>
          </div>

          <nav className="lt-footer__links" aria-label="Footer navigation">
            <a href="#features" className="lt-footer__link">Features</a>
            <a href="#how-it-works" className="lt-footer__link">How It Works</a>
            <button className="lt-footer__link" onClick={() => navigate('/login')}>Sign In</button>
            <a href="mailto:support@libastrack.com" className="lt-footer__link">Contact</a>
          </nav>

          <div className="lt-footer__copy">
            © {new Date().getFullYear()} LibasTrack — Built for boutiques &amp; fashion brands worldwide
          </div>
        </div>
      </footer>

    </div>
  );
}