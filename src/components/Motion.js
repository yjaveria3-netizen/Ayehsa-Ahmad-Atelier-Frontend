/**
 * LibasTrack — Luxury Motion System
 * Built on Framer Motion
 * 
 * Premium motion components with:
 *  • Scroll-triggered reveals
 *  • Floating ambient orbs
 *  • Magnetic buttons
 *  • Staggered text reveals
 *  • Smooth page transitions
 *  • Card tilt on hover
 *  • Liquid cursor follower
 */

import React, { useRef, useEffect, useState } from 'react';
import {
  motion, AnimatePresence, useScroll,
  useMotionValue, useSpring, useInView,
} from 'framer-motion';

/* ─────────────────────────────────────────
   SHARED EASING CURVES
───────────────────────────────────────── */
export const ease = {
  out:    [0.16, 1, 0.3, 1],
  inOut:  [0.83, 0, 0.17, 1],
  smooth: [0.25, 0.46, 0.45, 0.94],
  spring: { type:'spring', stiffness:260, damping:22 },
  springGentle: { type:'spring', stiffness:180, damping:28 },
  springBouncy: { type:'spring', stiffness:320, damping:18 },
};

/* ─────────────────────────────────────────
   PAGE TRANSITION WRAPPER
───────────────────────────────────────── */
export function PageTransition({ children }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={typeof window !== 'undefined' ? window.location.pathname : 'page'}
        initial={{ opacity: 0, y: 18, filter:'blur(4px)' }}
        animate={{ opacity: 1, y: 0, filter:'blur(0px)' }}
        exit={{ opacity: 0, y: -12, filter:'blur(2px)' }}
        transition={{ duration: 0.45, ease: ease.out }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/* ─────────────────────────────────────────
   SCROLL REVEAL
───────────────────────────────────────── */
export function Reveal({
  children,
  delay = 0,
  direction = 'up',
  distance = 24,
  duration = 0.6,
  once = true,
  className,
  style,
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: '-60px 0px' });

  const dirs = {
    up:    { y: distance, x: 0 },
    down:  { y: -distance, x: 0 },
    left:  { x: distance, y: 0 },
    right: { x: -distance, y: 0 },
    none:  { x: 0, y: 0 },
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...dirs[direction] }}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : {}}
      transition={{ duration, delay, ease: ease.out }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────
   STAGGERED CONTAINER
───────────────────────────────────────── */
export function StaggerContainer({ children, staggerDelay = 0.08, delayStart = 0, className, style }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-40px 0px' });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: staggerDelay, delayChildren: delayStart } },
      }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, direction = 'up', distance = 20, className, style }) {
  const dirs = {
    up:   { y: distance },
    down: { y: -distance },
    left: { x: distance },
    none: {},
  };
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, ...dirs[direction] },
        visible: { opacity: 1, x: 0, y: 0, transition: { duration: 0.55, ease: ease.out } },
      }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────
   SPLIT TEXT REVEAL
───────────────────────────────────────── */
export function SplitText({ text, className, style, delay = 0, stagger = 0.06, tag = 'h1' }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const words = text.split(' ');
  const Tag = tag;

  return (
    <Tag
      ref={ref}
      className={className}
      style={{ ...style, overflow:'hidden', display:'flex', flexWrap:'wrap', gap:'0.25em' }}
    >
      {words.map((word, i) => (
        <span key={i} style={{ overflow:'hidden', display:'inline-block' }}>
          <motion.span
            style={{ display:'inline-block' }}
            initial={{ y: '110%', opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.65, delay: delay + i * stagger, ease: ease.out }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

/* ─────────────────────────────────────────
   MAGNETIC BUTTON
───────────────────────────────────────── */
export function MagneticButton({ children, className, style, onClick, disabled, type }) {
  return (
    <motion.button
      style={{ ...style }}
      className={className}
      onClick={onClick}
      disabled={disabled}
      type={type}
    >
      {children}
    </motion.button>
  );
}

/* ─────────────────────────────────────────
   TILT CARD
───────────────────────────────────────── */
export function TiltCard({ children, intensity = 12, className, style, onClick }) {
  const ref = useRef(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 280, damping: 24 });
  const sry = useSpring(ry, { stiffness: 280, damping: 24 });

  const handleMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    rx.set(-py * intensity);
    ry.set(px * intensity);
  };
  const handleLeave = () => { rx.set(0); ry.set(0); };

  return (
    <motion.div
      ref={ref}
      style={{
        rotateX: srx, rotateY: sry,
        transformStyle: 'preserve-3d', transformPerspective: 800,
        ...style,
      }}
      className={className}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      transition={ease.springGentle}
    >
      <motion.div
        style={{
          position:'absolute', inset:0, borderRadius:'inherit',
          background:'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%)',
          pointerEvents:'none', zIndex:1,
        }}
      />
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────
   FLOATING AMBIENT ORBS
───────────────────────────────────────── */
export function AmbientOrbs() {
  return (
    <div style={{
      position:'fixed', inset:0, pointerEvents:'none',
      zIndex:0, overflow:'hidden',
    }}>
      {/* Cyan orb — top left */}
      <motion.div
        style={{
          position:'absolute', top:'-15%', left:'-10%',
          width:500, height:500, borderRadius:'50%',
          background:'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)',
          filter:'blur(40px)',
        }}
        animate={{ x:[0,30,0], y:[0,20,0], scale:[1,1.08,1] }}
        transition={{ duration:14, repeat:Infinity, ease:'easeInOut' }}
      />
      {/* Violet orb — top right */}
      <motion.div
        style={{
          position:'absolute', top:'5%', right:'-8%',
          width:360, height:360, borderRadius:'50%',
          background:'radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)',
          filter:'blur(40px)',
        }}
        animate={{ x:[0,-25,0], y:[0,35,0], scale:[1,1.06,1] }}
        transition={{ duration:17, repeat:Infinity, ease:'easeInOut', delay:3 }}
      />
      {/* Gold orb — bottom center */}
      <motion.div
        style={{
          position:'absolute', bottom:'10%', left:'35%',
          width:280, height:280, borderRadius:'50%',
          background:'radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)',
          filter:'blur(35px)',
        }}
        animate={{ x:[0,20,0], y:[0,-20,0], scale:[1,1.05,1] }}
        transition={{ duration:11, repeat:Infinity, ease:'easeInOut', delay:6 }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────
   CURSOR FOLLOWER
───────────────────────────────────────── */
export function CursorFollower() {
  const cx = useMotionValue(-100);
  const cy = useMotionValue(-100);
  const sx = useSpring(cx, { stiffness:100, damping:18 });
  const sy = useSpring(cy, { stiffness:100, damping:18 });
  const [hoveringBtn, setHoveringBtn] = useState(false);

  useEffect(() => {
    const move = (e) => { cx.set(e.clientX); cy.set(e.clientY); };
    const over = (e) => {
      if (e.target.closest('button, a, [role="button"]')) setHoveringBtn(true);
      else setHoveringBtn(false);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseover', over);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseover', over);
    };
  }, [cx, cy]);

  return (
    <motion.div
      style={{
        position:'fixed', top:0, left:0,
        x: sx, y: sy, translateX:'-50%', translateY:'-50%',
        width: hoveringBtn ? 48 : 14,
        height: hoveringBtn ? 48 : 14,
        borderRadius:'50%',
        background: hoveringBtn ? 'rgba(6,182,212,0.15)' : 'rgba(6,182,212,0.5)',
        border: hoveringBtn ? '1px solid rgba(6,182,212,0.4)' : 'none',
        pointerEvents:'none', zIndex:9999,
        mixBlendMode:'screen',
        transition:'width 0.3s, height 0.3s, background 0.3s',
      }}
    />
  );
}

/* ─────────────────────────────────────────
   SCROLL PROGRESS BAR
───────────────────────────────────────── */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  return (
    <motion.div
      style={{
        position:'fixed', top:0, left:0, right:0, height:2,
        background:'linear-gradient(90deg, #06b6d4, #a855f7)',
        scaleX:scrollYProgress,
        transformOrigin:'left', zIndex:9999,
        boxShadow:'0 0 12px rgba(6,182,212,0.6)',
      }}
    />
  );
}

/* ─────────────────────────────────────────
   COUNTER ANIMATION
───────────────────────────────────────── */
export function AnimatedCounter({ value, prefix = '', suffix = '', duration = 1.4, delay = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView || !value) return;
    const timeout = setTimeout(() => {
      const startTime = performance.now();
      const step = (ts) => {
        const p = Math.min((ts - startTime) / (duration * 1000), 1);
        const eased = 1 - Math.pow(1 - p, 3);
        setDisplay(Math.round(eased * value));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, delay * 1000);
    return () => clearTimeout(timeout);
  }, [isInView, value, duration, delay]);

  return (
    <span ref={ref}>{prefix}{display.toLocaleString()}{suffix}</span>
  );
}

/* ─────────────────────────────────────────
   GLOW CARD
───────────────────────────────────────── */
export function GlowCard({ children, className, style, onClick }) {
  const ref = useRef(null);
  const [glowPos, setGlowPos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    setGlowPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ position:'relative', overflow:'hidden', cursor: onClick ? 'pointer' : 'default', ...style }}
      onMouseMove={handleMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <motion.div
        style={{
          position:'absolute', inset:0, pointerEvents:'none', borderRadius:'inherit',
          background:`radial-gradient(200px circle at ${glowPos.x}% ${glowPos.y}%, rgba(6,182,212,0.1) 0%, transparent 70%)`,
          opacity: isHovered ? 1 : 0,
          transition:'opacity 0.3s',
          zIndex:0,
        }}
      />
      <div style={{ position:'relative', zIndex:1 }}>
        {children}
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────
   SKELETON PULSE
───────────────────────────────────────── */
export function MotionSkeleton({ width, height, borderRadius = 8, className }) {
  return (
    <motion.div
      className={className}
      style={{ width, height, borderRadius, overflow:'hidden', background:'rgba(6,182,212,0.07)', position:'relative' }}
      animate={{ opacity:[0.5, 1, 0.5] }}
      transition={{ duration:1.8, repeat:Infinity, ease:'easeInOut' }}
    >
      <motion.div
        style={{
          position:'absolute', inset:0,
          background:'linear-gradient(90deg, transparent, rgba(6,182,212,0.1), transparent)',
        }}
        animate={{ x:['-100%','100%'] }}
        transition={{ duration:1.5, repeat:Infinity, ease:'linear' }}
      />
    </motion.div>
  );
}
