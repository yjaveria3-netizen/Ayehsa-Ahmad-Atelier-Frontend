import React from 'react';
import { motion } from 'framer-motion';

/**
 * Premium Shimmer Skeleton Component
 */
const Skeleton = ({
  width,
  height,
  borderRadius = '10px',
  className = '',
  style = {},
  variant = 'default', // 'default' | 'text' | 'title' | 'avatar' | 'card' | 'circle'
  ...props
}) => {
  const variantStyles = {
    default: {},
    text: { height: '16px', borderRadius: '4px' },
    title: { height: '32px', width: '60%', borderRadius: '6px' },
    avatar: { width: '48px', height: '48px', borderRadius: '12px' },
    card: { height: '200px', borderRadius: '16px' },
    circle: { borderRadius: '50%' },
    button: { height: '48px', width: '120px', borderRadius: '10px' },
    badge: { height: '28px', width: '80px', borderRadius: '99px' },
  };

  const combinedStyles = {
    background: 'linear-gradient(90deg, var(--bg-layer1) 0%, var(--bg-layer2) 50%, var(--bg-layer1) 100%)',
    backgroundSize: '200% 100%',
    borderRadius,
    width,
    height,
    ...variantStyles[variant],
    ...style,
  };

  return (
    <motion.div
      className={className}
      style={combinedStyles}
      animate={{
        backgroundPosition: ['200% 0', '-200% 0'],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'linear',
      }}
      {...props}
    />
  );
};

// Pre-built skeleton layouts for common page patterns
export const SkeletonText = ({ lines = 3, lastLineWidth = '60%' }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        variant="text"
        style={{ 
          width: i === lines - 1 ? lastLineWidth : '100%' 
        }}
      />
    ))}
  </div>
);

export const SkeletonCard = ({ showAvatar = false, showActions = false }) => (
  <div
    style={{
      background: 'rgba(30, 41, 59, 0.50)',
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(255, 255, 255, 0.10)',
      borderRadius: '16px',
      padding: '28px',
    }}
  >
    <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
      {showAvatar && <Skeleton variant="avatar" />}
      <div style={{ flex: 1 }}>
        <Skeleton variant="title" style={{ marginBottom: '8px' }} />
        <Skeleton variant="text" style={{ width: '40%' }} />
      </div>
    </div>
    <SkeletonText lines={3} />
    {showActions && (
      <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
        <Skeleton variant="button" />
        <Skeleton variant="button" style={{ width: '100px' }} />
      </div>
    )}
  </div>
);

export const SkeletonTable = ({ rows = 5, columns = 4 }) => (
  <div
    style={{
      background: 'rgba(30, 41, 59, 0.40)',
      backdropFilter: 'blur(12px)',
      borderRadius: '16px',
      border: '1px solid rgba(255, 255, 255, 0.10)',
      overflow: 'hidden',
    }}
  >
    {/* Header */}
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: '16px',
        padding: '16px 24px',
        background: 'rgba(15, 23, 42, 0.50)',
        borderBottom: '1px solid var(--border-faint)',
      }}
    >
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} height="12px" width="60%" borderRadius="4px" />
      ))}
    </div>
    
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div
        key={rowIndex}
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: '16px',
          padding: '18px 24px',
          borderBottom: rowIndex < rows - 1 ? '1px solid var(--border-faint)' : 'none',
        }}
      >
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton
            key={colIndex}
            variant="text"
            style={{ width: colIndex === 0 ? '80%' : '60%' }}
          />
        ))}
      </div>
    ))}
  </div>
);

export const SkeletonKPICards = ({ count = 4 }) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${Math.min(count, 4)}, 1fr)`,
      gap: '20px',
    }}
  >
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        style={{
          background: 'rgba(30, 41, 59, 0.50)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.10)',
          borderRadius: '16px',
          padding: '24px',
        }}
      >
        <Skeleton height="14px" width="50%" style={{ marginBottom: '16px' }} />
        <Skeleton height="36px" width="70%" style={{ marginBottom: '8px' }} />
        <Skeleton height="12px" width="40%" />
      </div>
    ))}
  </div>
);

export const SkeletonDashboard = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
    {/* Header */}
    <div>
      <Skeleton variant="title" style={{ width: '40%', marginBottom: '8px' }} />
      <Skeleton variant="text" style={{ width: '25%' }} />
    </div>
    
    {/* KPI Cards */}
    <SkeletonKPICards count={4} />
    
    {/* Chart */}
    <div
      style={{
        background: 'rgba(30, 41, 59, 0.50)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.10)',
        borderRadius: '16px',
        padding: '24px',
      }}
    >
      <Skeleton height="14px" width="30%" style={{ marginBottom: '24px' }} />
      <Skeleton height="200px" />
    </div>
    
    {/* Table */}
    <SkeletonTable rows={5} columns={5} />
  </div>
);

export default Skeleton;
