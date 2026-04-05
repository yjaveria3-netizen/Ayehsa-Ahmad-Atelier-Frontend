import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

export default function Login() {
  const { loginWithGoogle } = useAuth();
  const { isDark, toggle } = useTheme();

  const handleLogin = async () => {
    try { await loginWithGoogle(); }
    catch { toast.error('Failed to initiate Google login'); }
  };

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg-base)', display:'flex', transition:'background 0.25s' }}>

      {/* Theme toggle — top right */}
      <button
        onClick={toggle}
        style={{
          position:'absolute', top:18, right:20,
          background:'var(--bg-layer2)', border:'1px solid var(--border-subtle)',
          borderRadius:8, padding:'6px 12px', cursor:'pointer',
          color:'var(--text-secondary)', fontSize:'0.75rem',
          fontFamily:'Instrument Sans,sans-serif', fontWeight:500,
          display:'flex', alignItems:'center', gap:6, transition:'all 0.14s',
        }}
      >
        {isDark ? '☾ Dark' : '☀ Light'}
      </button>

      {/* Left: Branding */}
      <div style={{
        flex:'0 0 52%', display:'flex', flexDirection:'column',
        justifyContent:'flex-end', padding:'52px 56px',
        borderRight:'1px solid var(--border-faint)',
        position:'relative', overflow:'hidden',
      }}>
        {/* Decorative large letter */}
        <div style={{
          position:'absolute', top:'-40px', left:'-20px',
          fontFamily:'Syne,sans-serif', fontSize:'22rem',
          fontWeight:800, color:'var(--border-faint)',
          letterSpacing:'-0.05em', lineHeight:1,
          userSelect:'none', pointerEvents:'none',
          transition:'color 0.25s',
        }}>L</div>

        <div style={{ position:'relative', zIndex:1 }}>
          {/* Logo */}
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:36 }}>
            <div style={{ width:38, height:38, borderRadius:10, background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 12px rgba(167,139,250,0.35)' }}>
              <svg viewBox="0 0 16 16" fill="none" width="20" height="20">
                <path d="M2 13L5 3h1.5L8 9l1.5-6H11l3 10h-1.8l-2-7-1.7 7H7.5L5.8 6l-2 7H2z" fill="white"/>
              </svg>
            </div>
            <span style={{ fontFamily:'Syne,sans-serif', fontSize:'1.3rem', fontWeight:800, color:'var(--text-primary)', letterSpacing:'-0.02em', transition:'color 0.25s' }}>LibasTrack</span>
          </div>

          <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:'3.4rem', fontWeight:800, color:'var(--text-primary)', lineHeight:1.05, letterSpacing:'-0.03em', marginBottom:18, transition:'color 0.25s' }}>
            Manage your<br />
            <span style={{ color:'var(--text-accent)' }}>fashion brand</span><br />
            with ease.
          </h1>

          <p style={{ color:'var(--text-muted)', fontSize:'0.875rem', lineHeight:1.75, maxWidth:360, marginBottom:36, transition:'color 0.25s' }}>
            Orders, products, customers, suppliers, collections, returns — all in one place. Live sync to Google Sheets. Works for any clothing brand, anywhere in the world.
          </p>

          {/* Feature list */}
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {[
              ['◫', 'Full order pipeline with 13 statuses'],
              ['▣', 'Inventory with cost price & margin tracking'],
              ['◎', 'CRM with VIP/Loyal/At-Risk segments'],
              ['◈', 'Supplier management & ratings'],
              ['↩', 'Returns & refunds tracking'],
              ['✓', 'Custom editable launch checklist'],
            ].map(([icon, text]) => (
              <div key={text} style={{ display:'flex', alignItems:'center', gap:10, fontSize:'0.8rem', color:'var(--text-secondary)', transition:'color 0.25s' }}>
                <span style={{ width:20, height:20, borderRadius:5, background:'var(--accent-subtle)', border:'1px solid var(--border-mid)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.65rem', color:'var(--text-accent)', flexShrink:0 }}>{icon}</span>
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Login */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 32px' }}>
        <div style={{ width:'100%', maxWidth:360 }}>
          <div style={{ marginBottom:28 }}>
            <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:'1.6rem', fontWeight:800, color:'var(--text-primary)', letterSpacing:'-0.02em', marginBottom:8, transition:'color 0.25s' }}>
              Sign in
            </h2>
            <p style={{ fontSize:'0.8rem', color:'var(--text-muted)', lineHeight:1.65, transition:'color 0.25s' }}>
              New user? We'll walk you through setting up your brand in 2 minutes.
            </p>
          </div>

          <button className="google-btn" onClick={handleLogin}>
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div style={{ margin:'18px 0', height:1, background:'var(--border-faint)', transition:'background 0.25s' }} />

          <div style={{ padding:'13px 15px', background:'var(--accent-subtle)', border:'1px solid rgba(167,139,250,0.15)', borderRadius:10 }}>
            <p style={{ fontSize:'0.73rem', color:'var(--text-secondary)', lineHeight:1.65, transition:'color 0.25s' }}>
              We request access to Google Drive & Sheets to sync your brand data automatically. Your data stays in your own Drive — we never store files.
            </p>
          </div>

          <p style={{ marginTop:16, fontSize:'0.67rem', color:'var(--text-muted)', textAlign:'center', transition:'color 0.25s' }}>
            Works for any fashion brand · Any currency · Any country
          </p>
        </div>
      </div>
    </div>
  );
}