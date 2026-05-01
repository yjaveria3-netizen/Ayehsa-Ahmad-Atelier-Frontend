import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Footer() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const handleNavigation = (path) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const footerLinks = [
    {
      section: 'Product',
      links: [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Features', href: '/#features' },
        { label: 'Pricing', href: '/#pricing' },
      ],
    },
    {
      section: 'Company',
      links: [
        { label: 'About', href: '/#about' },
        { label: 'Blog', href: '#' },
        { label: 'Careers', href: '#' },
      ],
    },
    {
      section: 'Legal',
      links: [
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms of Service', href: '/terms' },
        { label: 'Contact', href: 'mailto:support@libastrack.com' },
      ],
    },
    {
      section: 'Connect',
      links: [
        { label: 'Twitter', href: 'https://twitter.com/libastrack', target: '_blank' },
        { label: 'Instagram', href: 'https://instagram.com/libastrack', target: '_blank' },
        { label: 'Email', href: 'mailto:support@libastrack.com' },
      ],
    },
  ];

  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-grid">
          {/* Brand Section */}
          <motion.div
            className="footer-section"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: 'var(--hero-grad)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 900,
                  fontSize: '1rem',
                }}
              >
                LT
              </div>
              <div>
                <div style={{ fontWeight: 900, fontSize: '1.1rem' }}>LibasTrack</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 800, letterSpacing: '0.1em' }}>BRAND OS</div>
              </div>
            </div>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--text-secondary)', marginBottom: 16 }}>
              The ultimate platform for modern fashion brands to manage products, orders, customers, and operations.
            </p>
          </motion.div>

          {/* Footer Sections */}
          {footerLinks.map((section, idx) => (
            <motion.div
              key={section.section}
              className="footer-section"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: (idx + 1) * 0.1 }}
              viewport={{ once: true }}
            >
              <h4>{section.section}</h4>
              <div className="footer-links">
                {section.links.map((link) => (
                  <motion.a
                    key={link.label}
                    href={link.href}
                    target={link.target}
                    rel={link.target === '_blank' ? 'noopener noreferrer' : undefined}
                    className="footer-link"
                    whileHover={{ x: 4 }}
                    onClick={(e) => {
                      if (link.href.startsWith('/')) {
                        e.preventDefault();
                        handleNavigation(link.href);
                      }
                    }}
                  >
                    {link.label}
                  </motion.a>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="footer-divider" />

        {/* Bottom Section */}
        <motion.div
          className="footer-bottom"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <p className="footer-copyright">
            © {currentYear} LibasTrack. Built for fashion brands worldwide.
          </p>
          <div className="footer-meta-links">
            <a href="/privacy" className="footer-link" onClick={(e) => { e.preventDefault(); handleNavigation('/privacy'); }}>
              Privacy
            </a>
            <a href="/terms" className="footer-link" onClick={(e) => { e.preventDefault(); handleNavigation('/terms'); }}>
              Terms
            </a>
            <a href="mailto:support@libastrack.com" className="footer-link">
              Support
            </a>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
