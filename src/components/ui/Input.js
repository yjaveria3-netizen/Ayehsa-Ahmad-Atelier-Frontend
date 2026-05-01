import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';

/**
 * Premium Input Component with floating label and focus glow
 * 
 * @param {string} label
 * @param {string} hint
 * @param {string} error
 * @param {React.ReactNode} leftIcon
 * @param {React.ReactNode} rightIcon
 * @param {boolean} showPasswordToggle
 */
const Input = React.forwardRef(({
  label,
  hint,
  error,
  leftIcon,
  rightIcon,
  showPasswordToggle = false,
  type = 'text',
  className = '',
  style = {},
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const inputType = showPasswordToggle 
    ? (showPassword ? 'text' : 'password')
    : type;

  const containerStyles = {
    position: 'relative',
    marginBottom: error || hint ? '8px' : '0',
  };

  const labelStyles = {
    display: 'block',
    fontSize: '0.8rem',
    fontWeight: 600,
    color: error ? 'var(--error)' : 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: '8px',
    transition: 'color 0.2s',
  };

  const inputWrapperStyles = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  };

  const inputStyles = {
    width: '100%',
    padding: leftIcon ? '16px 18px 16px 48px' : '16px 18px',
    paddingRight: (rightIcon || showPasswordToggle) ? '48px' : '18px',
    borderRadius: '10px',
    border: `1px solid ${error ? 'var(--error)' : isFocused ? 'var(--accent)' : 'var(--border-subtle)'}`,
    background: isFocused ? 'var(--bg-base)' : 'var(--bg-layer1)',
    color: 'var(--text-primary)',
    fontSize: '0.95rem',
    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    boxShadow: isFocused 
      ? '0 0 0 4px var(--accent-soft), 0 0 40px rgba(6, 182, 212, 0.15)' 
      : 'none',
    outline: 'none',
    ...style,
  };

  const iconStyles = {
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: isFocused ? 'var(--accent)' : 'var(--text-faint)',
    transition: 'color 0.2s',
    pointerEvents: 'none',
  };

  const rightIconStyles = {
    ...iconStyles,
    right: '16px',
    pointerEvents: showPasswordToggle ? 'auto' : 'none',
    cursor: showPasswordToggle ? 'pointer' : 'default',
  };

  const messageStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: '6px',
    fontSize: '0.8rem',
  };

  return (
    <div style={containerStyles} className={className}>
      {label && (
        <motion.label 
          style={labelStyles}
          animate={{ color: isFocused ? 'var(--accent)' : error ? 'var(--error)' : 'var(--text-muted)' }}
        >
          {label}
        </motion.label>
      )}
      
      <div style={inputWrapperStyles}>
        {leftIcon && (
          <motion.span 
            style={{ ...iconStyles, left: '16px' }}
            animate={{ color: isFocused ? 'var(--accent)' : 'var(--text-faint)' }}
          >
            {leftIcon}
          </motion.span>
        )}
        
        <input
          ref={ref}
          type={inputType}
          style={inputStyles}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          {...props}
        />
        
        {showPasswordToggle && (
          <motion.button
            type="button"
            style={{ ...rightIconStyles, background: 'none', border: 'none' }}
            onClick={() => setShowPassword(!showPassword)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </motion.button>
        )}
        
        {rightIcon && !showPasswordToggle && (
          <span style={rightIconStyles}>{rightIcon}</span>
        )}
      </div>
      
      <AnimatePresence>
        {(error || hint) && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            style={{ 
              ...messageStyles, 
              color: error ? 'var(--error)' : 'var(--text-faint)' 
            }}
          >
            {error && <AlertCircle size={14} />}
            <span>{error || hint}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
