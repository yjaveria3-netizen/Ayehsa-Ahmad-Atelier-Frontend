import React from 'react';
import { motion } from 'framer-motion';

/**
 * Premium Badge Component with optional pulse animation
 * 
 * @param {string} variant - 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'premium'
 * @param {boolean} pulse - Show pulse animation dot
 * @param {string} size - 'sm' | 'md' | 'lg'
 */
const Badge = ({
  variant = 'neutral',
  pulse = false,
  size = 'md',
  children,
  className = '',
  style = {},
  ...props
}) => {
  const sizeStyles = {
    sm: { padding: '4px 8px', fontSize: '0.6rem' },
    md: { padding: '6px 12px', fontSize: '0.7rem' },
    lg: { padding: '8px 16px', fontSize: '0.75rem' },
  };

  const variantStyles = {
    success: {
      background: 'rgba(16, 185, 129, 0.12)',
      color: '#10b981',
      borderColor: 'rgba(16, 185, 129, 0.25)',
    },
    warning: {
      background: 'rgba(245, 158, 11, 0.12)',
      color: '#f59e0b',
      borderColor: 'rgba(245, 158, 11, 0.25)',
    },
    error: {
      background: 'rgba(239, 68, 68, 0.12)',
      color: '#ef4444',
      borderColor: 'rgba(239, 68, 68, 0.25)',
    },
    info: {
      background: 'rgba(6, 182, 212, 0.12)',
      color: '#06b6d4',
      borderColor: 'rgba(6, 182, 212, 0.25)',
    },
    neutral: {
      background: 'rgba(100, 116, 139, 0.15)',
      color: 'rgba(248, 250, 252, 0.55)',
      borderColor: 'rgba(100, 116, 139, 0.25)',
    },
    premium: {
      background: 'rgba(245, 158, 11, 0.12)',
      color: '#f59e0b',
      borderColor: 'rgba(245, 158, 11, 0.25)',
    },
    secondary: {
      background: 'rgba(168, 85, 247, 0.12)',
      color: '#a855f7',
      borderColor: 'rgba(168, 85, 247, 0.25)',
    },
  };

  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    borderRadius: '99px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    border: '1px solid',
    whiteSpace: 'nowrap',
    ...sizeStyles[size],
    ...variantStyles[variant],
    ...style,
  };

  return (
    <span style={baseStyles} className={className} {...props}>
      {pulse && (
        <motion.span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: 'currentColor',
          }}
          animate={{
            scale: [1, 1.4, 1],
            opacity: [1, 0.6, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}
      {children}
    </span>
  );
};

export default Badge;

// Status-specific badge variants for convenience
export const StatusBadge = ({ status, ...props }) => {
  const statusMap = {
    // Order statuses
    pending: { variant: 'warning', label: 'Pending' },
    confirmed: { variant: 'info', label: 'Confirmed' },
    processing: { variant: 'info', label: 'Processing' },
    shipped: { variant: 'info', label: 'Shipped' },
    delivered: { variant: 'success', label: 'Delivered' },
    cancelled: { variant: 'error', label: 'Cancelled' },
    
    // Product statuses
    active: { variant: 'success', label: 'Active' },
    draft: { variant: 'neutral', label: 'Draft' },
    archived: { variant: 'neutral', label: 'Archived' },
    'out-of-stock': { variant: 'error', label: 'Out of Stock' },
    'on-sale': { variant: 'premium', label: 'On Sale' },
    
    // Customer statuses
    vip: { variant: 'premium', label: 'VIP' },
    regular: { variant: 'neutral', label: 'Regular' },
    new: { variant: 'info', label: 'New' },
    
    // Payment statuses
    paid: { variant: 'success', label: 'Paid' },
    unpaid: { variant: 'error', label: 'Unpaid' },
    partial: { variant: 'warning', label: 'Partial' },
    refunded: { variant: 'neutral', label: 'Refunded' },
    
    // Collection statuses
    upcoming: { variant: 'info', label: 'Upcoming' },
    live: { variant: 'success', label: 'Live', pulse: true },
    ended: { variant: 'neutral', label: 'Ended' },
  };

  const config = statusMap[status?.toLowerCase()] || { variant: 'neutral', label: status };

  return (
    <Badge variant={config.variant} pulse={config.pulse} {...props}>
      {config.label}
    </Badge>
  );
};
