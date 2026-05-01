import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { buttonPress } from '../../utils/motion';

/**
 * Premium Button Component with animations
 * 
 * @param {string} variant - 'primary' | 'secondary' | 'ghost' | 'danger' | 'gold'
 * @param {string} size - 'sm' | 'md' | 'lg'
 * @param {boolean} loading - Shows loading spinner
 * @param {boolean} disabled
 * @param {boolean} fullWidth
 * @param {React.ReactNode} leftIcon
 * @param {React.ReactNode} rightIcon
 * @param {React.ReactNode} children
 */
const Button = React.forwardRef(({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  onClick,
  type = 'button',
  ...props
}, ref) => {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    borderRadius: '10px',
    fontWeight: 600,
    letterSpacing: '0.02em',
    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    position: 'relative',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    userSelect: 'none',
    border: 'none',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    width: fullWidth ? '100%' : 'auto',
  };

  const sizeStyles = {
    sm: { padding: '10px 18px', fontSize: '0.8rem' },
    md: { padding: '14px 28px', fontSize: '0.875rem' },
    lg: { padding: '18px 36px', fontSize: '1rem' },
  };

  const variantStyles = {
    primary: {
      background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
      color: 'white',
      boxShadow: '0 8px 24px rgba(6, 182, 212, 0.35)',
    },
    secondary: {
      background: 'var(--bg-layer1)',
      color: 'var(--text-primary)',
      border: '1px solid var(--border-subtle)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-muted)',
    },
    danger: {
      background: 'rgba(239, 68, 68, 0.12)',
      color: '#ef4444',
      border: '1px solid rgba(239, 68, 68, 0.25)',
    },
    gold: {
      background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
      color: '#0f172a',
      boxShadow: '0 8px 24px rgba(245, 158, 11, 0.25)',
    },
  };

  const combinedStyles = {
    ...baseStyles,
    ...sizeStyles[size],
    ...variantStyles[variant],
  };

  return (
    <motion.button
      ref={ref}
      type={type}
      onClick={loading || disabled ? undefined : onClick}
      disabled={disabled || loading}
      style={combinedStyles}
      className={className}
      variants={buttonPress}
      initial="rest"
      whileHover={!disabled && !loading ? "hover" : undefined}
      whileTap={!disabled && !loading ? "tap" : undefined}
      {...props}
    >
      {loading ? (
        <motion.span
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{ display: 'flex' }}
        >
          <Loader2 size={size === 'sm' ? 16 : size === 'lg' ? 22 : 18} />
        </motion.span>
      ) : (
        <>
          {leftIcon && <span style={{ display: 'flex' }}>{leftIcon}</span>}
          {children}
          {rightIcon && <span style={{ display: 'flex' }}>{rightIcon}</span>}
        </>
      )}
      
      {/* Shimmer effect overlay */}
      <motion.span
        style={{
          position: 'absolute',
          top: 0,
          left: '-100%',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
          pointerEvents: 'none',
        }}
        initial={{ left: '-100%' }}
        whileHover={{ left: '100%' }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      />
    </motion.button>
  );
});

Button.displayName = 'Button';

export default Button;
