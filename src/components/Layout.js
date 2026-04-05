import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

const NAV = [
  { section: 'Overview',  items: [{ to: '/dashboard',  icon: '▦', label: 'Dashboard' }] },
  { section: 'Commerce',  items: [
    { to: '/orders',      icon: '◫', label: 'Orders' },
    { to: '/products',    icon: '▣', label: 'Products' },
    { to: '/customers',   icon: '◎', label: 'Customers' },
    { to: '/collections', icon: '▤', label: 'Collections' },
  ]},
  { section: 'Operations', items: [
    { to: '/financial',   icon: '◉', label: 'Financial' },
    { to: '/suppliers',   icon: '◈', label: 'Suppliers' },
    { to: '/returns',     icon: '↩', label: 'Returns & Refunds' },
  ]},
  { section: 'Planning', items: [
    { to: '/checklist',   icon: '✓', label: 'Checklist' },
  ]},
  { section: 'Setup', items: [
    { to: '/drive-setup',     icon: '↑', label: 'Drive & Sync' },
    { to: '/brand-settings',  icon: '◇', label: 'Brand Settings' },
  ]},
];

export default function Layout() {
  const { user, logout } = useAuth();
  const { theme, toggle, isDark } = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const brandName = user?.brand?.name || 'LibasTrack';

  const handleLogout = async () => {
    await logout();
    toast.success('Signed out');
    navigate('/login');
  };

  return (
    <div className="app-layout">
      {open && (
        <div
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:199, backdropFilter:'blur(4px)' }}
          onClick={() => setOpen(false)}
        />
      )}

      <nav className={`sidebar ${open ? 'open' : ''}`}>
        {/* Brand */}
        <div className="sidebar-logo">
          <div className="brand-wordmark">
            <div className="brand-icon">
              <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 13L5 3h1.5L8 9l1.5-6H11l3 10h-1.8l-2-7-1.7 7H7.5L5.8 6l-2 7H2z" fill="white"/>
              </svg>
            </div>
            <span className="brand-name">LibasTrack</span>
          </div>
          <div className="brand-tagline">{brandName}</div>
        </div>

        {/* Nav */}
        <div className="sidebar-nav">
          {NAV.map(group => (
            <div className="nav-section" key={group.section}>
              <div className="nav-section-label">{group.section}</div>
              {group.items.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                  onClick={() => setOpen(false)}
                >
                  <span className="nav-icon-box">{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="sidebar-footer">
          {/* Theme toggle */}
          <button className="theme-toggle-btn" onClick={toggle}>
            <div className="toggle-track">
              <div className="toggle-thumb" />
            </div>
            <span>{isDark ? 'Dark mode' : 'Light mode'}</span>
            <span style={{ marginLeft:'auto', fontSize:'0.8rem' }}>{isDark ? '☾' : '☀'}</span>
          </button>

          {/* Drive sync badge */}
          {user?.driveConnected && (
            <div className="sync-badge" style={{ marginBottom:8 }}>
              <span className="sync-dot" />
              Syncing to Google Sheets
            </div>
          )}

          {/* User pill */}
          {user && (
            <div className="user-pill">
              {user.avatar
                ? <img src={user.avatar} alt="" className="user-av" />
                : <div className="user-av-init">{(user.brand?.name || user.name)?.[0]?.toUpperCase()}</div>
              }
              <div className="user-info-wrap">
                <div className="user-info-name">{user.name}</div>
                <div className="user-info-email">{user.email}</div>
              </div>
              <button className="logout-btn" onClick={handleLogout} title="Sign out">✕</button>
            </div>
          )}
        </div>
      </nav>

      <main className="main-content">
        {/* Mobile topbar */}
        <div className="mobile-header">
          <button
            onClick={() => setOpen(true)}
            style={{ background:'var(--bg-layer2)', border:'1px solid var(--border-subtle)', color:'var(--text-primary)', borderRadius:8, padding:'6px 11px', fontSize:'0.78rem', fontFamily:'Instrument Sans,sans-serif' }}
          >
            Menu
          </button>
          <span style={{ fontFamily:'Syne,sans-serif', fontSize:'1rem', fontWeight:700, color:'var(--text-primary)', letterSpacing:'-0.01em' }}>
            LibasTrack
          </span>
          <button className="theme-toggle-btn" onClick={toggle} style={{ width:'auto', padding:'5px 10px', marginBottom:0 }}>
            {isDark ? '☾' : '☀'}
          </button>
        </div>

        <Outlet />
      </main>
    </div>
  );
}