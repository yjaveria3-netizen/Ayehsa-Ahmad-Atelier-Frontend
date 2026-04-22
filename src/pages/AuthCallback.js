import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [statusMsg, setStatusMsg] = useState('Authenticating…');

  useEffect(() => {
    const run = async () => {
      const token = searchParams.get('token');
      const needsOnboarding = searchParams.get('needsOnboarding') === 'true';
      const needsStorageSetup = searchParams.get('needsStorageSetup') === 'true';
      const error = searchParams.get('error');

      if (error) {
        toast.error('Google authentication failed. Please try again.');
        navigate('/login');
        return;
      }

      // Token is now stored in httpOnly cookie by backend (more secure)
      // Frontend should NOT store tokens in localStorage or URL
      // Cookies are automatically sent with credentials: true in API calls
      if (!token) {
        setStatusMsg('Restoring your session…');
      }

      setStatusMsg('Loading your workspace…');

      try {
        const user = await refreshUser();
        if (!user) {
          toast.error('Session not found. Please sign in again.');
          navigate('/login');
          return;
        }

        if (needsOnboarding || !user.brand?.onboardingComplete) {
          setStatusMsg('Setting up your brand…');
          setTimeout(() => navigate('/onboarding'), 600);
        } else if (needsStorageSetup || !user.storageType) {
          setStatusMsg('Choosing your storage…');
          setTimeout(() => navigate('/storage-setup'), 600);
        } else {
          setStatusMsg('Welcome back!');
          toast.success('Welcome back! 👋');
          setTimeout(() => navigate('/dashboard'), 400);
        }
      } catch {
        toast.error('Failed to load your profile. Please try again.');
        navigate('/login');
      }
    };

    run();
  }, [navigate, refreshUser, searchParams]);


  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', background: 'var(--bg-void)',
      flexDirection: 'column', gap: 24, position: 'relative', overflow: 'hidden'
    }}>
      {/* Atmosphere */}
      <div className="vibe-noise" />

      {/* Pulsing logo */}
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}
      >
        <div className="tm-logo-sq" style={{ borderColor: 'var(--accent)', width: 36, height: 36 }}>
          <div className="tm-logo-inner" style={{ background: 'var(--accent)', width: 14, height: 14 }} />
        </div>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, color: 'white' }}>
          LibasTrack
        </span>
      </motion.div>

      {/* Spinner */}
      <div className="callback-spinner">
        <div className="callback-spinner-ring" />
        <div className="callback-spinner-core" />
      </div>

      {/* Status message */}
      <motion.p
        key={statusMsg}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          color: 'var(--text-muted)', fontFamily: 'var(--font-body)',
          fontSize: '0.88rem', letterSpacing: '0.05em'
        }}
      >
        {statusMsg}
      </motion.p>
    </div>
  );
}
