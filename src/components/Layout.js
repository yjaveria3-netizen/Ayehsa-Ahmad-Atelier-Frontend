import React, { useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';
import { NAV_GROUPS, MOBILE_NAV_ITEMS } from '../utils/navItems';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LogOut, 
  Menu, 
  X, 
  Search, 
  Bell,
  ChevronLeft,
  ChevronRight,
  Cloud,
  Sun,
  Moon
} from 'lucide-react';
import { fadeUp, staggerContainer, staggerItem } from '../utils/motion';

export default function Layout() {
  const { user, logout, storageType } = useAuth();
  const { theme, toggle: toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  );

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  const handleLogout = async () => {
    await logout();
    toast.success('Signed out successfully');
    navigate('/');
  };

  // Storage sync badge
  const SyncBadge = () => {
    if (storageType === 'google_drive' && user?.driveConnected) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            background: 'rgba(16, 185, 129, 0.12)',
            borderRadius: '8px',
            marginBottom: '12px',
          }}
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#10b981',
            }}
          />
          <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#10b981', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Live Sync
          </span>
          <Cloud size={14} style={{ color: '#10b981' }} />
        </motion.div>
      );
    }
    return null;
  };

  const sidebarWidth = sidebarCollapsed ? 80 : 280;

  return (
    <div className="app-shell">
      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setSidebarOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(3, 7, 18, 0.80)',
              backdropFilter: 'blur(8px)',
              zIndex: 299,
            }}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.nav
        initial={false}
        animate={{ 
          x: isMobile ? (sidebarOpen ? 0 : '-100%') : 0,
          width: isMobile ? 280 : sidebarWidth,
        }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          background: 'var(--glass-bg-strong)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid var(--border-glass)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 300,
        }}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Sidebar Header */}
        <div style={{ 
          padding: sidebarCollapsed ? '28px 16px' : '28px 24px', 
          borderBottom: '1px solid var(--border-faint)',
          flexShrink: 0,
        }}>
          <motion.div 
            style={{ display: 'flex', alignItems: 'center', gap: '14px' }}
            layout
          >
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #06b6d4 0%, #a855f7 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(6, 182, 212, 0.35)',
                flexShrink: 0,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div style={{
                position: 'absolute',
                inset: '2px',
                background: 'var(--bg-base)',
                borderRadius: '10px',
              }} />
              <span style={{
                position: 'relative',
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '1.4rem',
                background: 'linear-gradient(135deg, #06b6d4 0%, #a855f7 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                L
              </span>
            </motion.div>

            {/* Brand Text */}
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  style={{ flex: 1 }}
                >
                  <div style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.4rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    letterSpacing: '-0.01em',
                  }}>
                    LibasTrack
                  </div>
                  <div style={{
                    fontSize: '0.65rem',
                    color: 'var(--accent)',
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                    marginTop: '2px',
                  }}>
                    Brand OS
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Theme Toggle Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              style={{
                width: sidebarCollapsed ? '40px' : '36px',
                height: sidebarCollapsed ? '40px' : '36px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isDark ? 'var(--accent-soft)' : 'var(--gold-soft)',
                border: `1px solid ${isDark ? 'var(--accent-border)' : 'rgba(217, 119, 6, 0.25)'}`,
                color: isDark ? 'var(--accent)' : 'var(--gold)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                flexShrink: 0,
              }}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={theme}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {isDark ? <Sun size={18} /> : <Moon size={18} />}
                </motion.div>
              </AnimatePresence>
            </motion.button>
          </motion.div>
        </div>

        {/* Navigation */}
        <nav style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '20px 12px',
          scrollbarWidth: 'none',
        }}>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {NAV_GROUPS.map((group) => (
              <div key={group.section} style={{ marginBottom: '24px' }}>
                {!sidebarCollapsed && (
                  <motion.div
                    variants={staggerItem}
                    style={{
                      fontSize: '0.65rem',
                      color: 'var(--text-faint)',
                      letterSpacing: '0.2em',
                      textTransform: 'uppercase',
                      fontWeight: 700,
                      padding: '0 12px 10px',
                    }}
                  >
                    {group.section}
                  </motion.div>
                )}
                
                {group.items.map((item) => (
                  <motion.div key={item.to} variants={staggerItem}>
                    <NavLink
                      to={item.to}
                      style={({ isActive }) => ({
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: sidebarCollapsed ? '12px' : '12px 14px',
                        borderRadius: '10px',
                        fontSize: '0.9rem',
                        fontWeight: isActive ? 600 : 500,
                        color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                        background: isActive ? 'rgba(6, 182, 212, 0.12)' : 'transparent',
                        marginBottom: '4px',
                        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                        position: 'relative',
                        overflow: 'hidden',
                        justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                        textDecoration: 'none',
                      })}
                      title={sidebarCollapsed ? item.label : undefined}
                    >
                      {({ isActive }) => (
                        <>
                          {/* Active indicator */}
                          <motion.div
                            initial={false}
                            animate={{
                              height: isActive ? '60%' : '0%',
                              opacity: isActive ? 1 : 0,
                            }}
                            style={{
                              position: 'absolute',
                              left: 0,
                              top: '50%',
                              transform: 'translateY(-50%)',
                              width: '3px',
                              background: 'var(--accent)',
                              borderRadius: '0 4px 4px 0',
                            }}
                          />
                          
                          <motion.span 
                            whileHover={{ scale: 1.1 }}
                            style={{ 
                              display: 'flex',
                              width: '20px',
                              height: '20px',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {item.icon}
                          </motion.span>
                          
                          {!sidebarCollapsed && (
                            <span>{item.label}</span>
                          )}
                        </>
                      )}
                    </NavLink>
                  </motion.div>
                ))}
              </div>
            ))}
          </motion.div>
        </nav>

        {/* Sidebar Footer */}
        <div style={{ 
          padding: '16px 12px 24px', 
          borderTop: '1px solid var(--border-faint)',
          flexShrink: 0,
        }}>
          <SyncBadge />
          
          {/* User Card */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px',
            borderRadius: '10px',
            background: 'var(--bg-layer1)',
            border: '1px solid var(--border-faint)',
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #06b6d4 0%, #a855f7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '1rem',
              color: 'white',
              flexShrink: 0,
              overflow: 'hidden',
            }}>
              {user?.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.name} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                (user?.brand?.name || user?.name)?.[0]?.toUpperCase()
              )}
            </div>
            
            {!sidebarCollapsed && (
              <>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {user?.brand?.name || user?.name}
                  </div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {user?.email}
                  </div>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.1, background: 'rgba(239, 68, 68, 0.12)' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-muted)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'color 0.2s',
                  }}
                  title="Sign out"
                >
                  <LogOut size={18} />
                </motion.button>
              </>
            )}
          </div>

          {/* Collapse Toggle (Desktop only) */}
          {!isMobile && (
            <motion.button
              whileHover={{ background: 'var(--accent-soft)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              style={{
                width: '100%',
                marginTop: '12px',
                padding: '10px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                color: 'var(--text-muted)',
                background: 'none',
                border: '1px solid var(--border-faint)',
                cursor: 'pointer',
                fontSize: '0.8rem',
              }}
            >
              {sidebarCollapsed ? (
                <ChevronRight size={16} />
              ) : (
                <>
                  <ChevronLeft size={16} />
                  <span>Collapse</span>
                </>
              )}
            </motion.button>
          )}
        </div>
      </motion.nav>

      {/* Main Content */}
      <main
        style={{
          marginLeft: isMobile ? 0 : sidebarWidth,
          flex: 1,
          minHeight: '100vh',
          background: 'var(--bg-base)',
          transition: 'margin-left 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        role="main"
      >
        {/* Mobile Top Bar */}
        {isMobile && (
          <header style={{
            position: 'sticky',
            top: 0,
            left: 0,
            right: 0,
            height: '64px',
            padding: '0 20px',
            background: 'var(--glass-bg-strong)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid var(--border-faint)',
            zIndex: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <motion.button
              whileHover={{ background: 'var(--accent-soft)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSidebarOpen(true)}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-primary)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </motion.button>

            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.2rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
            }}>
              LibasTrack
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Mobile Theme Toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleTheme}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isDark ? 'var(--accent-soft)' : 'var(--gold-soft)',
                  border: `1px solid ${isDark ? 'var(--accent-border)' : 'rgba(217, 119, 6, 0.25)'}`,
                  color: isDark ? 'var(--accent)' : 'var(--gold)',
                  cursor: 'pointer',
                }}
                aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDark ? <Sun size={16} /> : <Moon size={16} />}
              </motion.button>

              <motion.button
                whileHover={{ background: 'var(--accent-soft)' }}
                whileTap={{ scale: 0.95 }}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <Bell size={18} />
              </motion.button>
            </div>
          </header>
        )}

        {/* Page Content with Transitions */}
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>

        {/* Mobile Bottom Navigation */}
        {isMobile && (
          <nav style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            height: '72px',
            background: 'var(--glass-bg-strong)',
            backdropFilter: 'blur(20px)',
            borderTop: '1px solid var(--border-faint)',
            zIndex: 300,
            paddingBottom: 'env(safe-area-inset-bottom)',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-around',
              height: '100%',
              padding: '0 8px',
            }}>
              {MOBILE_NAV_ITEMS.map((item) => {
                const isActive = location.pathname === item.to;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '8px 12px',
                      color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                      fontSize: '0.65rem',
                      fontWeight: 500,
                      textDecoration: 'none',
                      position: 'relative',
                    }}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="mobile-nav-indicator"
                        style={{
                          position: 'absolute',
                          top: 0,
                          width: '24px',
                          height: '3px',
                          background: 'var(--accent)',
                          borderRadius: '0 0 4px 4px',
                        }}
                      />
                    )}
                    <span style={{ width: '24px', height: '24px' }}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </nav>
        )}
      </main>
    </div>
  );
}
