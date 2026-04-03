import React from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const { loginWithGoogle } = useAuth();

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch {
      toast.error('Failed to initiate Google login');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background texture */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(ellipse at 20% 50%, rgba(157,110,42,0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(168,68,90,0.04) 0%, transparent 50%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: 'linear-gradient(rgba(0,0,0,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.025) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
        pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: '460px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ marginBottom: '48px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '64px', height: '64px',
            background: 'linear-gradient(135deg, var(--gold-dark), var(--gold))',
            borderRadius: '50%',
            marginBottom: '24px',
            boxShadow: '0 0 32px rgba(157,110,42,0.2)',
          }}>
            <span style={{ fontSize: '1.75rem', filter: 'brightness(10)' }}>✦</span>
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2.8rem',
            fontWeight: 400,
            color: 'var(--text-primary)',
            letterSpacing: '0.04em',
            lineHeight: 1.1,
            marginBottom: '8px',
          }}>
            Ayesha Ahmad<br />
            <em style={{ fontStyle: 'italic', color: 'var(--gold-dark)' }}>Atelier</em>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            Business Management Suite
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: '#ffffff',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '40px',
          boxShadow: '0 4px 32px rgba(0,0,0,0.08)',
        }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
            Welcome back
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '32px' }}>
            Sign in with your Google account to access your dashboard. Your data syncs directly to Google Sheets.
          </p>

          <button className="google-btn" onClick={handleLogin} style={{ width: '100%', justifyContent: 'center' }}>
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(157,110,42,0.05)', border: '1px solid rgba(157,110,42,0.15)', borderRadius: '6px' }}>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              <span style={{ color: 'var(--gold-dark)' }}>✦ </span>
              We'll request access to your Google Drive & Sheets to sync your business data automatically.
            </p>
          </div>
        </div>

        <p style={{ marginTop: '24px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Secure • Private • Your data stays in your Drive
        </p>
      </div>
    </div>
  );
}