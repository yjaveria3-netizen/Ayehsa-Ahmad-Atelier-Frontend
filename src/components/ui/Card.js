import React from 'react';
import { motion } from 'framer-motion';
import { cardHover, fadeUp } from '../../utils/motion';

/**
 * Premium Glassmorphism Card Component
 * 
 * @param {string} variant - 'default' | 'accent' | 'glow' | 'gradient'
 * @param {boolean} hoverable - Enable hover animations
 * @param {boolean} animated - Enable entrance animation
 * @param {string} padding - 'none' | 'sm' | 'md' | 'lg'
 */
const Card = React.forwardRef(({
  variant = 'default',
  hoverable = true,
  animated = false,
  padding = 'md',
  children,
  className = '',
  style = {},
  onClick,
  ...props
}, ref) => {
  const paddingValues = {
    none: '0',
    sm: '16px',
    md: '28px',
    lg: '40px',
  };

  const baseStyles = {
    background: 'rgba(30, 41, 59, 0.50)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.10)',
    borderRadius: '16px',
    padding: paddingValues[padding],
    position: 'relative',
    overflow: 'hidden',
    cursor: onClick ? 'pointer' : 'default',
    ...style,
  };

  const variantStyles = {
    default: {},
    accent: {
      borderTop: '2px solid var(--accent)',
    },
    glow: {
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.40), 0 0 30px rgba(6, 182, 212, 0.08)',
    },
    gradient: {
      background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.60) 0%, rgba(30, 41, 59, 0.40) 100%)',
    },
  };

  const combinedStyles = {
    ...baseStyles,
    ...variantStyles[variant],
  };

  const motionProps = hoverable
    ? {
        variants: cardHover,
        initial: 'rest',
        whileHover: 'hover',
        whileTap: onClick ? 'tap' : undefined,
      }
    : {};

  const entranceProps = animated
    ? {
        variants: fadeUp,
        initial: 'hidden',
        animate: 'visible',
        exit: 'exit',
      }
    : {};

  return (
    <motion.div
      ref={ref}
      style={combinedStyles}
      className={className}
      onClick={onClick}
      {...motionProps}
      {...entranceProps}
      {...props}
    >
      {/* Top gradient line on hover */}
      {hoverable && (
        <motion.div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: 'linear-gradient(90deg, transparent, var(--accent-soft), transparent)',
            opacity: 0,
          }}
          variants={{
            rest: { opacity: 0 },
            hover: { opacity: 1 },
          }}
        />
      )}
      {children}
    </motion.div>
  );
});

Card.displayName = 'Card';

// Card Header subcomponent
export const CardHeader = ({ children, style = {}, className = '' }) => (
  <div
    style={{
      marginBottom: '20px',
      paddingBottom: '16px',
      borderBottom: '1px solid var(--border-faint)',
      ...style,
    }}
    className={className}
  >
    {children}
  </div>
);

// Card Title subcomponent
export const CardTitle = ({ children, style = {}, className = '' }) => (
  <h3
    style={{
      fontFamily: 'var(--font-display)',
      fontSize: '1.25rem',
      fontWeight: 500,
      color: 'var(--text-primary)',
      margin: 0,
      ...style,
    }}
    className={className}
  >
    {children}
  </h3>
);

// Card Description subcomponent
export const CardDescription = ({ children, style = {}, className = '' }) => (
  <p
    style={{
      fontSize: '0.9rem',
      color: 'var(--text-muted)',
      margin: '6px 0 0 0',
      ...style,
    }}
    className={className}
  >
    {children}
  </p>
);

// Card Footer subcomponent
export const CardFooter = ({ children, style = {}, className = '' }) => (
  <div
    style={{
      marginTop: '20px',
      paddingTop: '16px',
      borderTop: '1px solid var(--border-faint)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: '12px',
      ...style,
    }}
    className={className}
  >
    {children}
  </div>
);

export default Card;
