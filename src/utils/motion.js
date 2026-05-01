// ============================================================
// LIBASTRACK MOTION SYSTEM — Luxury Animation Variants
// ============================================================

// Reduced-motion detection
export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

// Easing curves
export const ease = {
  smooth: [0.25, 0.46, 0.45, 0.94],
  spring: [0.34, 1.56, 0.64, 1],
  out: [0.16, 1, 0.3, 1],
  in: [0.4, 0, 1, 1],
  inOut: [0.4, 0, 0.2, 1],
};

// Duration helper for reduced motion
const dur = (d) => (prefersReducedMotion() ? 0.01 : d);
const val = (v) => (prefersReducedMotion() ? 0 : v);

// ============================================================
// FADE VARIANTS
// ============================================================

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: dur(0.4), ease: ease.out },
  },
  exit: {
    opacity: 0,
    transition: { duration: dur(0.3), ease: ease.out },
  },
};

export const fadeUp = {
  hidden: { opacity: 0, y: val(30) },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: dur(0.5), ease: ease.smooth },
  },
  exit: {
    opacity: 0,
    y: val(-20),
    transition: { duration: dur(0.3), ease: ease.out },
  },
};

export const fadeDown = {
  hidden: { opacity: 0, y: val(-30) },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: dur(0.5), ease: ease.smooth },
  },
  exit: {
    opacity: 0,
    y: val(20),
    transition: { duration: dur(0.3), ease: ease.out },
  },
};

// ============================================================
// SCALE VARIANTS
// ============================================================

export const scaleIn = {
  hidden: { opacity: 0, scale: val(0.93) === 0 ? 1 : 0.93 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: dur(0.4), ease: ease.spring },
  },
  exit: {
    opacity: 0,
    scale: val(0.95) === 0 ? 1 : 0.95,
    transition: { duration: dur(0.3), ease: ease.out },
  },
};

export const scaleUp = {
  hidden: { opacity: 0, scale: val(0.8) === 0 ? 1 : 0.8, y: val(20) },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: dur(0.5), ease: ease.spring },
  },
  exit: {
    opacity: 0,
    scale: val(0.9) === 0 ? 1 : 0.9,
    transition: { duration: dur(0.3), ease: ease.out },
  },
};

// ============================================================
// SLIDE VARIANTS
// ============================================================

export const slideInLeft = {
  hidden: { opacity: 0, x: val(-40) },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: dur(0.5), ease: ease.out },
  },
  exit: {
    opacity: 0,
    x: val(-40),
    transition: { duration: dur(0.3), ease: ease.out },
  },
};

export const slideInRight = {
  hidden: { opacity: 0, x: val(40) },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: dur(0.5), ease: ease.out },
  },
  exit: {
    opacity: 0,
    x: val(40),
    transition: { duration: dur(0.3), ease: ease.out },
  },
};

export const slideUp = {
  hidden: { opacity: 0, y: val(100) },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: dur(0.5), ease: ease.spring },
  },
  exit: {
    opacity: 0,
    y: val(100),
    transition: { duration: dur(0.3), ease: ease.out },
  },
};

export const slideDown = {
  hidden: { opacity: 0, y: val(-100) },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: dur(0.5), ease: ease.spring },
  },
  exit: {
    opacity: 0,
    y: val(-100),
    transition: { duration: dur(0.3), ease: ease.out },
  },
};

// ============================================================
// STAGGER CONTAINERS
// ============================================================

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
  exit: { opacity: 0 },
};

export const staggerContainerFast = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
  exit: { opacity: 0 },
};

export const staggerContainerSlow = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.15,
    },
  },
  exit: { opacity: 0 },
};

// Stagger item for use inside containers
export const staggerItem = {
  hidden: { opacity: 0, y: val(20) },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: dur(0.4), ease: ease.out },
  },
  exit: {
    opacity: 0,
    y: val(-10),
    transition: { duration: dur(0.2), ease: ease.out },
  },
};

export const staggerItemScale = {
  hidden: { opacity: 0, scale: 0.9, y: val(10) },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: dur(0.4), ease: ease.spring },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: dur(0.2), ease: ease.out },
  },
};

// ============================================================
// SPECIAL EFFECTS
// ============================================================

export const glowPulse = {
  animate: {
    boxShadow: [
      '0 0 0px rgba(6, 182, 212, 0)',
      '0 0 20px rgba(6, 182, 212, 0.4)',
      '0 0 0px rgba(6, 182, 212, 0)',
    ],
    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
  },
};

export const float = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

export const shimmer = {
  animate: {
    backgroundPosition: ['200% 0', '-200% 0'],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

// ============================================================
// MODAL VARIANTS
// ============================================================

export const modalOverlay = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: dur(0.3), ease: ease.out },
  },
  exit: {
    opacity: 0,
    transition: { duration: dur(0.2), ease: ease.out },
  },
};

export const modalContent = {
  hidden: { opacity: 0, y: val(50), scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: dur(0.4), ease: ease.spring },
  },
  exit: {
    opacity: 0,
    y: val(30),
    scale: 0.98,
    transition: { duration: dur(0.25), ease: ease.out },
  },
};

export const modalSlideUp = {
  hidden: { opacity: 0, y: '100%' },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: dur(0.5), ease: ease.spring },
  },
  exit: {
    opacity: 0,
    y: '100%',
    transition: { duration: dur(0.3), ease: ease.out },
  },
};

// ============================================================
// PAGE TRANSITIONS
// ============================================================

export const pageTransition = {
  hidden: { opacity: 0, y: val(20), filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: dur(0.5), ease: ease.out },
  },
  exit: {
    opacity: 0,
    y: val(-10),
    filter: 'blur(2px)',
    transition: { duration: dur(0.3), ease: ease.out },
  },
};

// ============================================================
// TABLE ROW ANIMATIONS
// ============================================================

export const tableRow = {
  hidden: { opacity: 0, x: val(-20) },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: {
      duration: dur(0.3),
      delay: i * 0.05,
      ease: ease.out,
    },
  }),
  exit: {
    opacity: 0,
    x: val(20),
    transition: { duration: dur(0.2), ease: ease.out },
  },
};

// ============================================================
// CARD ANIMATIONS
// ============================================================

export const cardHover = {
  rest: {
    scale: 1,
    y: 0,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.40)',
  },
  hover: {
    scale: 1.02,
    y: -4,
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.50)',
    transition: { duration: 0.3, ease: ease.spring },
  },
  tap: {
    scale: 0.98,
    transition: { duration: 0.1 },
  },
};

// ============================================================
// BUTTON ANIMATIONS
// ============================================================

export const buttonPress = {
  rest: { scale: 1 },
  hover: {
    scale: 1.02,
    transition: { duration: 0.2, ease: ease.spring },
  },
  tap: {
    scale: 0.98,
    transition: { duration: 0.1 },
  },
};

// ============================================================
// LEGACY EXPORTS (for backward compatibility)
// ============================================================

export const fadeInUp = fadeUp;
export const fadeInDown = fadeDown;
export const transition = {
  duration: prefersReducedMotion() ? 0.01 : 0.3,
  ease: ease.out,
  type: 'tween',
};
