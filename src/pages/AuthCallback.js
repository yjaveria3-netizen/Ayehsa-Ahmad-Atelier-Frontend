import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const needsOnboarding = searchParams.get('needsOnboarding') === 'true';
    const error = searchParams.get('error');

    if (error) {
      toast.error('Google authentication failed. Please try again.');
      navigate('/login');
      return;
    }

    if (token) {
      localStorage.setItem('token', token);
      refreshUser().then(() => {
        if (needsOnboarding) {
          navigate('/onboarding');
        } else {
          toast.success('Welcome back!');
          navigate('/dashboard');
        }
      });
    } else {
      navigate('/login');
    }
  }, []);

  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:'var(--bg-void)', flexDirection:'column', gap:16 }}>
      <div className="spinner" style={{ width:40, height:40 }} />
      <p style={{ color:'var(--text-muted)', fontFamily:'var(--font-body)', fontSize:'0.82rem', letterSpacing:'0.05em' }}>Authenticating…</p>
    </div>
  );
}
