import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { modalOverlay, modalSlideUp } from '../../utils/motion';

/**
 * Premium Modal Component with slide-up animation
 * 
 * @param {boolean} isOpen
 * @param {function} onClose
 * @param {string} title
 * @param {string} size - 'sm' | 'md' | 'lg' | 'xl' | 'full'
 * @param {boolean} closeOnOverlayClick
 * @param {boolean} closeOnEsc
 * @param {boolean} showCloseButton
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEsc = true,
  showCloseButton = true,
  children,
  footer,
}) => {
  const sizeStyles = {
    sm: { maxWidth: '400px' },
    md: { maxWidth: '600px' },
    lg: { maxWidth: '800px' },
    xl: { maxWidth: '1000px' },
    full: { maxWidth: '95vw', width: '95vw' },
  };

  // Handle escape key
  const handleEscKey = useCallback((e) => {
    if (e.key === 'Escape' && closeOnEsc) {
      onClose();
    }
  }, [closeOnEsc, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleEscKey]);

  const overlayStyles = {
    position: 'fixed',
    inset: 0,
    zIndex: 400,
    background: 'rgba(3, 7, 18, 0.85)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    padding: '24px',
  };

  const modalStyles = {
    background: 'var(--bg-layer1)',
    borderRadius: '24px 24px 0 0',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 40px 90px rgba(0, 0, 0, 0.70)',
    border: '1px solid rgba(255, 255, 255, 0.10)',
    position: 'relative',
    overscrollBehavior: 'contain',
    ...sizeStyles[size],
  };

  const headerStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '24px 28px',
    borderBottom: '1px solid var(--border-faint)',
    position: 'sticky',
    top: 0,
    background: 'var(--bg-layer1)',
    zIndex: 1,
  };

  const titleStyles = {
    fontFamily: 'var(--font-display)',
    fontSize: '1.5rem',
    fontWeight: 500,
    color: 'var(--text-primary)',
    margin: 0,
  };

  const closeButtonStyles = {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-muted)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
  };

  const bodyStyles = {
    padding: '28px',
  };

  const footerStyles = {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    padding: '20px 28px',
    borderTop: '1px solid var(--border-faint)',
    background: 'rgba(15, 23, 42, 0.50)',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          style={overlayStyles}
          variants={modalOverlay}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={closeOnOverlayClick ? onClose : undefined}
        >
          <motion.div
            style={modalStyles}
            variants={modalSlideUp}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            {/* Drag indicator for mobile */}
            <div
              style={{
                width: '40px',
                height: '4px',
                background: 'var(--border-subtle)',
                borderRadius: '4px',
                margin: '12px auto 0',
              }}
            />
            
            {(title || showCloseButton) && (
              <div style={headerStyles}>
                {title && <h2 id="modal-title" style={titleStyles}>{title}</h2>}
                {showCloseButton && (
                  <motion.button
                    style={closeButtonStyles}
                    onClick={onClose}
                    whileHover={{ 
                      background: 'rgba(239, 68, 68, 0.12)', 
                      color: '#ef4444' 
                    }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Close modal"
                  >
                    <X size={20} />
                  </motion.button>
                )}
              </div>
            )}
            
            <div style={bodyStyles}>
              {children}
            </div>
            
            {footer && (
              <div style={footerStyles}>
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Desktop-centered modal variant
export const ModalCentered = (props) => {
  const overlayStylesOverride = {
    alignItems: 'center',
  };

  const modalStylesOverride = {
    borderRadius: '24px',
  };

  return (
    <Modal
      {...props}
      _overlayStylesOverride={overlayStylesOverride}
      _modalStylesOverride={modalStylesOverride}
    />
  );
};

export default Modal;
