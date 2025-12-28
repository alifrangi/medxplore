import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Icon from '../Icon';
import './Toast.css';

const ToastContext = createContext(null);

/**
 * Toast types with their default configurations
 */
const TOAST_TYPES = {
  success: {
    icon: 'CheckCircle',
    className: 'toast--success',
  },
  error: {
    icon: 'AlertCircle',
    className: 'toast--error',
  },
  warning: {
    icon: 'AlertTriangle',
    className: 'toast--warning',
  },
  info: {
    icon: 'Info',
    className: 'toast--info',
  },
};

let toastId = 0;
const recentToasts = new Map(); // Track recent toasts to prevent duplicates

/**
 * Toast Provider Component
 * Wrap your app with this to enable toast notifications
 */
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, options = {}) => {
    const {
      type = 'info',
      duration = 4000,
      title,
    } = options;

    // Prevent duplicate toasts with same message within 500ms
    const toastKey = `${type}:${message}`;
    const now = Date.now();
    const lastShown = recentToasts.get(toastKey);

    if (lastShown && now - lastShown < 500) {
      return null; // Skip duplicate
    }
    recentToasts.set(toastKey, now);

    // Clean up old entries
    if (recentToasts.size > 20) {
      const oldestKey = recentToasts.keys().next().value;
      recentToasts.delete(oldestKey);
    }

    const id = ++toastId;

    const newToast = {
      id,
      message,
      type,
      title,
    };

    setToasts((prev) => [...prev, newToast]);

    // Auto dismiss
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // Convenience methods
  const success = useCallback((message, options = {}) => {
    return addToast(message, { ...options, type: 'success' });
  }, [addToast]);

  const error = useCallback((message, options = {}) => {
    return addToast(message, { ...options, type: 'error', duration: options.duration || 6000 });
  }, [addToast]);

  const warning = useCallback((message, options = {}) => {
    return addToast(message, { ...options, type: 'warning' });
  }, [addToast]);

  const info = useCallback((message, options = {}) => {
    return addToast(message, { ...options, type: 'info' });
  }, [addToast]);

  const value = {
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* Toast Container */}
      <div className="toast-container" role="region" aria-label="Notifications">
        <AnimatePresence>
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              toast={toast}
              onDismiss={() => removeToast(toast.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

/**
 * Individual Toast Component
 */
const Toast = ({ toast, onDismiss }) => {
  const { type, message, title } = toast;
  const config = TOAST_TYPES[type] || TOAST_TYPES.info;

  return (
    <motion.div
      className={`toast ${config.className}`}
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      role="alert"
    >
      <span className="toast-icon">
        <Icon name={config.icon} size={20} />
      </span>

      <div className="toast-content">
        {title && <div className="toast-title">{title}</div>}
        <div className="toast-message">{message}</div>
      </div>

      <button
        className="toast-dismiss"
        onClick={onDismiss}
        aria-label="Dismiss notification"
      >
        <Icon name="X" size={16} />
      </button>
    </motion.div>
  );
};

/**
 * Hook to use toast notifications
 *
 * @example
 * const toast = useToast();
 *
 * // Simple usage
 * toast.success('Item saved successfully!');
 * toast.error('Failed to save item');
 * toast.warning('Please review your input');
 * toast.info('New updates available');
 *
 * // With options
 * toast.success('Saved!', { duration: 2000, title: 'Success' });
 */
export const useToast = () => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  return context;
};

export default ToastContext;
