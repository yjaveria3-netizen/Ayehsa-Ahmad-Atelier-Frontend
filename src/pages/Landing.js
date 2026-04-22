import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';

/* ─────────────────────────────────────────
   STATIC DATA
───────────────────────────────────────── */
const FEATURES = [
  {
    icon: '📦',
    title: 'Product Catalog',
    desc: 'Manage your full product library with variants, SKUs, pricing, and stock levels — all in one place.',
  },
  {
    icon: '🛍️',
    title: 'Order Pipeline',
    desc: 'Track every order from Pending to Delivered. Handle WhatsApp, Instagram, website, and in-store orders together.',
  },
  {
    icon: '👥',
    title: 'Customer CRM',
    desc: 'Segment customers by loyalty tier, track spending history, and manage VIP relationships with ease.',
  },
  {
    icon: '💰',
    title: 'Financials',
    desc: 'Record every transaction, monitor payment status, and get a clear picture of your revenue at a glance.',
  },
  {
    icon: '↩️',
    title: 'Returns & Refunds',
    desc: 'Handle exchange requests, refunds and return cases with a structured workflow that keeps nothing falling through the cracks.',
  },
  {
    icon: '🏭',
    title: 'Supplier Management',
    desc: 'Keep track of fabric suppliers, embroiderers, and printers — with lead times, ratings, and purchase history.',
  },
  {
    icon: '📊',
    title: 'Google Sheets Sync',
    desc: 'Every record syncs live to your Google Sheets. Your team sees the same data, always up to date.',
  },
  {
    icon: '✅',
    title: 'Collection Checklist',
    desc: 'Plan and track every phase of your seasonal collection launch — from design to dispatch.',
  },
];

const STATS = [
  { value: '8', label: 'Modules', suffix: '' },
  { value: '100', label: 'Free', suffix: '%' },
  { value: '24', label: 'Hour Sync', suffix: '/7' },
  { value: '1', label: 'Platform', suffix: '' },
];

const TESTIMONIALS = [
  {
    quote: 'LibasTrack replaced three separate spreadsheets I was using. Now everything is connected — orders, customers, finances.',
    name: 'Ayesha K.',
    role: 'Founder, Atelier Brand',
    country: '🇵🇰',
  },
  {
    quote: 'The Google Sheets sync means my team always has live data without logging into the app. Brilliant for small operations.',
    name: 'Sara M.',
    role: 'Operations, Boutique Owner',
    country: '🇦🇪',
  },
  {
    quote: 'Finally a fashion-specific tool that understands we sell on Instagram AND WhatsApp AND walk-ins, all at once.',
    name: 'Nadia R.',
    role: 'Designer & Founder',
    country: '🇬🇧',
  },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Sign in with Google', desc: 'No passwords. One-click Google login — your account is ready in seconds.' },
  { step: '02', title: 'Connect your storage', desc: 'Link your Google Drive or use local Excel. LibasTrack sets up all your sheets automatically.' },
  { step: '03', title: 'Start managing', desc: 'Add products, log orders, track customers and finances — all syncing live to your sheets.' },
];

/* ─────────────────────────────────────────
   ANIMATION VARIANTS
───────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.4, 0, 0.2, 1] } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

/* ─────────────────────────────────────────
   COMPONENT
───────────────────────────────────────── */
export default function Landing() {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '22%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const [navScrolled, setNavScrolled] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 48);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Auto-rotate testimonials
  useEffect(() => {
    const t = setInterval(() => setActiveTestimonial(i => (i + 1) % TESTIMONIALS.length), 4500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="landing-root" style={{ minHeight: '100vh', overflowX: 'hidden' }}>

      {/* ── BACKGROUND GRID ── */}
      <div className="vibe-grid" aria-hidden="true" />
      <div className="vibe-noise" aria-hidden="true" />

      {/* ─────────────── NAV ─────────────── */}
      <header
        className={`landing-nav${navScrolled ? ' landing-nav-scrolled' : ''}`}
        role="banner"
      >
        <div className="landing-nav-inner">
          <div className="landing-nav-logo" aria-label="LibasTrack home">
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 700, fontStyle: 'italic' }}>
              LibasTrack
            </span>
          </div>
          <nav className="landing-nav-links" aria-label="Primary navigation">
            <a href="#features" className="landing-nav-link">Features</a>
            <a href="#how-it-works" className="landing-nav-link">How It Works</a>
            <a href="#testimonials" className="landing-nav-link">Reviews</a>
          </nav>
          <div className="landing-nav-cta">
            <button
              className="btn btn-primary"
              onClick={() => navigate('/login')}
              style={{ fontWeight: 700 }}
              aria-label="Get started for free"
            >
              Get Started Free
            </button>
          </div>
        </div>
      </header>

      {/* ─────────────── HERO ─────────────── */}
      <section
        ref={heroRef}
        className="landing-hero"
        aria-label="Hero section"
        style={{ minHeight: '92vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden' }}
      >
        <motion.div
          className="landing-hero-content"
          style={{ y: heroY, opacity: heroOpacity }}
        >
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}
          >
            {/* Pill badge */}
            <motion.div variants={fadeUp} style={{ marginBottom: 28 }}>
              <span
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 18px',
                  borderRadius: 99, background: 'var(--accent-soft)', border: '1px solid var(--accent-border)',
                  fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.1em', textTransform: 'uppercase'
                }}
                aria-label="Free to use fashion brand management tool"
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
                Free — No credit card required
              </span>
            </motion.div>

            {/* Headline — SEO H1 */}
            <motion.h1
              variants={fadeUp}
              style={{
                fontFamily: 'var(--font-display)', fontSize: 'clamp(2.6rem, 6vw, 4.4rem)',
                fontStyle: 'italic', fontWeight: 700, lineHeight: 1.08, marginBottom: 22,
                color: 'var(--text-primary)'
              }}
            >
              The Management Platform
              <br />
              <span style={{ color: 'var(--accent)' }}>Built for Fashion Brands</span>
            </motion.h1>

            {/* Sub-headline */}
            <motion.p
              variants={fadeUp}
              style={{ fontSize: '1.08rem', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 36, maxWidth: 580, margin: '0 auto 36px' }}
            >
              Manage your products, orders, customers, finances, suppliers and returns — all in one place,
              with live sync to Google Sheets. Designed for boutiques and fashion brands worldwide.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={fadeUp} style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                className="btn btn-primary"
                onClick={() => navigate('/login')}
                style={{ fontSize: '1rem', fontWeight: 700, padding: '14px 32px', borderRadius: 12 }}
                aria-label="Start using LibasTrack for free"
              >
                Start for Free →
              </button>
              <a
                href="#features"
                className="btn btn-ghost"
                style={{ fontSize: '1rem', fontWeight: 600, padding: '14px 28px', borderRadius: 12 }}
                aria-label="See LibasTrack features"
              >
                See Features
              </a>
            </motion.div>

            {/* Social proof mini */}
            <motion.p variants={fadeUp} style={{ marginTop: 28, fontSize: '0.78rem', color: 'var(--text-faint)', fontWeight: 500 }}>
              Trusted by fashion brands in 🇵🇰 Pakistan · 🇦🇪 UAE · 🇬🇧 UK · 🇺🇸 USA
            </motion.p>
          </motion.div>
        </motion.div>

        {/* Decorative orb */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
            width: 600, height: 600, borderRadius: '50%',
            background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)',
            pointerEvents: 'none', zIndex: 0,
          }}
        />
      </section>

      {/* ─────────────── STATS BAR ─────────────── */}
      <section aria-label="Statistics" style={{ background: 'var(--bg-layer1)', borderTop: '1px solid var(--border-faint)', borderBottom: '1px solid var(--border-faint)', padding: '28px 0' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 24, padding: '0 24px' }}>
          {STATS.map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', fontWeight: 700, color: 'var(--accent)', fontStyle: 'italic' }}>
                {s.value}{s.suffix}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 700, marginTop: 4 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────────── FEATURES ─────────────── */}
      <section
        id="features"
        aria-labelledby="features-heading"
        style={{ padding: '96px 24px', maxWidth: 1200, margin: '0 auto' }}
      >
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={stagger}
          style={{ textAlign: 'center', marginBottom: 64 }}
        >
          <motion.h2
            id="features-heading"
            variants={fadeUp}
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontStyle: 'italic', color: 'var(--text-primary)', marginBottom: 14 }}
          >
            Everything your fashion brand needs
          </motion.h2>
          <motion.p variants={fadeUp} style={{ fontSize: '0.97rem', color: 'var(--text-muted)', maxWidth: 520, margin: '0 auto' }}>
            Eight fully integrated modules covering every aspect of your business operations — no spreadsheet juggling required.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={stagger}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: 20 }}
          role="list"
          aria-label="LibasTrack features"
        >
          {FEATURES.map(f => (
            <motion.div
              key={f.title}
              variants={fadeUp}
              className="card glass"
              role="listitem"
              style={{ padding: '28px 24px' }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <div style={{ fontSize: '1.8rem', marginBottom: 14 }} aria-hidden="true">{f.icon}</div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ─────────────── HOW IT WORKS ─────────────── */}
      <section
        id="how-it-works"
        aria-labelledby="how-heading"
        style={{ background: 'var(--bg-layer1)', padding: '96px 24px', borderTop: '1px solid var(--border-faint)', borderBottom: '1px solid var(--border-faint)' }}
      >
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            style={{ textAlign: 'center', marginBottom: 64 }}
          >
            <motion.h2
              id="how-heading"
              variants={fadeUp}
              style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontStyle: 'italic', color: 'var(--text-primary)', marginBottom: 14 }}
            >
              Up and running in minutes
            </motion.h2>
            <motion.p variants={fadeUp} style={{ fontSize: '0.97rem', color: 'var(--text-muted)' }}>
              No lengthy setup. No technical knowledge needed.
            </motion.p>
          </motion.div>

          <motion.ol
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            style={{ display: 'flex', flexDirection: 'column', gap: 20, listStyle: 'none', padding: 0 }}
            aria-label="How LibasTrack works"
          >
            {HOW_IT_WORKS.map((step, i) => (
              <motion.li
                key={step.step}
                variants={fadeUp}
                className="card glass"
                style={{ display: 'flex', alignItems: 'flex-start', gap: 24, padding: '28px 28px' }}
              >
                <div
                  style={{
                    minWidth: 48, height: 48, borderRadius: 12, background: 'var(--accent-soft)',
                    border: '1px solid var(--accent-border)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontFamily: 'var(--font-display)', fontStyle: 'italic',
                    color: 'var(--accent)', fontSize: '1.1rem', fontWeight: 700
                  }}
                  aria-hidden="true"
                >
                  {step.step}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>{step.title}</h3>
                  <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{step.desc}</p>
                </div>
              </motion.li>
            ))}
          </motion.ol>
        </div>
      </section>

      {/* ─────────────── TESTIMONIALS ─────────────── */}
      <section
        id="testimonials"
        aria-labelledby="testimonials-heading"
        style={{ padding: '96px 24px', maxWidth: 760, margin: '0 auto', textAlign: 'center' }}
      >
        <motion.h2
          id="testimonials-heading"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontStyle: 'italic', color: 'var(--text-primary)', marginBottom: 48 }}
        >
          Loved by fashion founders
        </motion.h2>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTestimonial}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4 }}
            className="card glass"
            style={{ padding: '36px 32px' }}
            role="region"
            aria-label={`Testimonial from ${TESTIMONIALS[activeTestimonial].name}`}
          >
            <blockquote style={{ margin: 0 }}>
              <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1.25rem', color: 'var(--text-primary)', lineHeight: 1.6, marginBottom: 24 }}>
                "{TESTIMONIALS[activeTestimonial].quote}"
              </p>
              <footer>
                <cite style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                  <span style={{ fontSize: '1.4rem' }}>{TESTIMONIALS[activeTestimonial].country}</span>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{TESTIMONIALS[activeTestimonial].name}</div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{TESTIMONIALS[activeTestimonial].role}</div>
                  </div>
                </cite>
              </footer>
            </blockquote>
          </motion.div>
        </AnimatePresence>

        {/* Dot indicators */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }} role="tablist" aria-label="Testimonial navigation">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveTestimonial(i)}
              role="tab"
              aria-selected={i === activeTestimonial}
              aria-label={`View testimonial ${i + 1}`}
              style={{
                width: i === activeTestimonial ? 24 : 8, height: 8, borderRadius: 99,
                background: i === activeTestimonial ? 'var(--accent)' : 'var(--border-subtle)',
                border: 'none', cursor: 'pointer', transition: 'all 0.3s', padding: 0
              }}
            />
          ))}
        </div>
      </section>

      {/* ─────────────── CTA BANNER ─────────────── */}
      <section
        aria-label="Call to action"
        className="landing-cta-banner"
        style={{ margin: '0 24px 96px', borderRadius: 24 }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center' }}
        >
          <h2 className="landing-cta-banner-title" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
            Ready to run your brand smarter?
          </h2>
          <p className="landing-cta-banner-sub">
            LibasTrack is completely free to use. Sign in with your Google account and get started in minutes.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/login')}
            style={{ fontSize: '1.05rem', fontWeight: 700, padding: '15px 38px', borderRadius: 14 }}
            aria-label="Sign up for LibasTrack — free"
          >
            Get Started Free →
          </button>
        </motion.div>
      </section>

      {/* ─────────────── FOOTER ─────────────── */}
      <footer className="landing-footer" role="contentinfo">
        <div className="landing-footer-inner">
          <div>
            <p className="landing-footer-copy">
              © {new Date().getFullYear()} LibasTrack — Fashion Brand Management Software
            </p>
            <p style={{ fontSize: '0.68rem', color: 'var(--text-faint)', marginTop: 4 }}>
              Built for boutiques &amp; fashion brands worldwide · Products · Orders · Customers · Financials
            </p>
          </div>
          <nav className="landing-footer-links" aria-label="Footer navigation">
            <button className="landing-footer-link" onClick={() => navigate('/login')}>Sign In</button>
            <a
              href="mailto:support@libastrack.com"
              className="landing-footer-link"
              style={{ textDecoration: 'none' }}
            >
              Contact
            </a>
          </nav>
        </div>
      </footer>

    </div>
  );
}