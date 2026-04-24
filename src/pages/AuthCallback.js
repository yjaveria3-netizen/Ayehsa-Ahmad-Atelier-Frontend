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
    <div className="callback-page">
      {/* Atmosphere */}
      <div className="vibe-noise" />
      <div className="callback-page__orb callback-page__orb--gold" />
      <div className="callback-page__orb callback-page__orb--cyan" />
      <div className="callback-page__grid" />

      <div className="callback-shell">
        <motion.div
          className="callback-brand"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div
            className="callback-brand__mark"
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="tm-logo-sq callback-brand__square">
              <div className="tm-logo-inner callback-brand__inner" />
            </div>
          </motion.div>

          <div className="callback-brand__copy">
            <div className="callback-brand__name">LibasTrack</div>
            <div className="callback-brand__tag">Fashion brand workspace</div>
          </div>
        </motion.div>

        <motion.div
          className="callback-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="callback-spinner-wrap">
            <div className="callback-spinner">
              <div className="callback-spinner-ring" />
              <div className="callback-spinner-core" />
            </div>
          </div>

          <div className="callback-card__eyebrow">Preparing your workspace</div>
          <motion.p
            key={statusMsg}
            className="callback-card__status"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {statusMsg}
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
