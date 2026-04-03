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
    const newUser = searchParams.get('newUser') === 'true';
    const error = searchParams.get('error');

    if (error) {
      toast.error('Google authentication failed. Please try again.');
      navigate('/login');
      return;
    }

    if (token) {
      localStorage.setItem('token', token);
      refreshUser().then(() => {
        if (newUser) {
          toast.success('Welcome to Ayesha Ahmad Atelier! Let\'s connect your Google Drive.');
          navigate('/drive-setup');
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
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:'#080808', flexDirection:'column', gap:16 }}>
      <div className="spinner" style={{ width:48, height:48 }} />
      <p style={{ color:'var(--text-muted)', fontFamily:'var(--font-body)', fontSize:'0.875rem' }}>Authenticating with Google…</p>
    </div>
  );
}
