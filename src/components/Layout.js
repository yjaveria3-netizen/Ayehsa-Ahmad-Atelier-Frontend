import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { to: '/dashboard', icon: '⊞', label: 'Dashboard' },
  { to: '/products', icon: '▪', label: 'Products' },
  { to: '/orders', icon: '▫', label: 'Orders' },
  { to: '/customers', icon: '○', label: 'Customers' },
  { to: '/financial', icon: '$', label: 'Financial' },
  { to: '/checklist', icon: '✓', label: 'Launch Checklist' },
  { to: '/drive-setup', icon: '↑', label: 'Drive Setup' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className="app-layout">
      {sidebarOpen && (
        <div
          style={{ position:'fixed', inset:0, background:'rgba(28,20,10,0.4)', zIndex:99 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="brand-name">Ayesha Ahmad<br />Atelier</div>
          <div className="brand-sub">Management Suite</div>
        </div>

        <div className="sidebar-nav">
          <div className="nav-section-label">Navigation</div>
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="sidebar-footer">
          {user && (
            <div className="user-card">
              {user.avatar
                ? <img src={user.avatar} alt={user.name} className="user-avatar" />
                : <div className="user-avatar-placeholder">{user.name?.[0]?.toUpperCase()}</div>
              }
              <div className="user-info">
                <div className="user-name">{user.name}</div>
                <div className="user-email">{user.email}</div>
              </div>
              <button className="logout-btn" onClick={handleLogout} title="Log out">&#x23FB;</button>
            </div>
          )}
          {user?.driveConnected && (
            <div style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 12px', fontSize:'0.7rem', color:'var(--text-muted)', marginTop:6 }}>
              <span className="sync-dot" />
              Drive connected
            </div>
          )}
        </div>
      </nav>

      <main className="main-content">
        <div style={{ display:'none' }} className="mobile-header">
          <button onClick={() => setSidebarOpen(true)} style={{ background:'none', color:'var(--text-primary)', fontSize:'1.1rem', padding:'4px 8px', border:'1px solid var(--border)', borderRadius:'6px' }}>
            Menu
          </button>
          <span style={{ fontFamily:'var(--font-display)', fontSize:'1rem', color:'var(--gold-dark)', marginLeft:12 }}>Ayesha Ahmad Atelier</span>
        </div>

        <Outlet />
      </main>
    </div>
  );
}