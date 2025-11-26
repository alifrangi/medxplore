import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Modal.css';

/**
 * Reusable Modal Component
 *
 * @param {boolean} isOpen - Whether modal is open
 * @param {function} onClose - Function to call when modal should close
 * @param {string} title - Modal title
 * @param {React.ReactNode} children - Modal body content
 * @param {React.ReactNode} footer - Modal footer content (buttons)
 * @param {string} size - Modal size: 'sm' | 'md' | 'lg' (default: 'md')
 * @param {boolean} closeOnOverlay - Whether clicking overlay closes modal (default: true)
 * @param {boolean} closeOnEscape - Whether pressing Escape closes modal (default: true)
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnOverlay = true,
  closeOnEscape = true,
}) => {
  // Handle Escape key
  const handleEscape = useCallback((e) => {
    if (e.key === 'Escape' && closeOnEscape) {
      onClose();
    }
  }, [onClose, closeOnEscape]);

  // Add/remove escape listener
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEscape]);

  // Handle overlay click
  const handleOverlayClick = () => {
    if (closeOnOverlay) {
      onClose();
    }
  };

  // Prevent clicks inside modal from closing it
  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  const sizeClasses = {
    sm: 'modal--sm',
    md: 'modal--md',
    lg: 'modal--lg',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleOverlayClick}
        >
          <motion.div
            className={`modal-content ${sizeClasses[size] || sizeClasses.md}`}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={handleModalClick}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div className="modal-header">
              <h2 id="modal-title">{title}</h2>
              <button
                className="modal-close-btn"
                onClick={onClose}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              {children}
            </div>

            {footer && (
              <div className="modal-footer">
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/**
 * Modal with form support - wraps children in a form element
 */
export const FormModal = ({
  isOpen,
  onClose,
  title,
  children,
  onSubmit,
  submitLabel = 'Submit',
  cancelLabel = 'Cancel',
  isLoading = false,
  size = 'md',
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size={size}
      footer={
        <>
          <button
            type="button"
            className="modal-btn modal-btn--secondary"
            onClick={onClose}
          >
            {cancelLabel}
          </button>
          <button
            type="submit"
            form="modal-form"
            className="modal-btn modal-btn--primary"
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : submitLabel}
          </button>
        </>
      }
    >
      <form id="modal-form" onSubmit={handleSubmit}>
        {children}
      </form>
    </Modal>
  );
};

export default Modal;
