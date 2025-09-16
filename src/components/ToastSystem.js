import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

// Toast context
const ToastContext = createContext();

// Toast types
export const ToastTypes = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Individual Toast Component
const Toast = ({ toast, onRemove }) => {
  const { id, type, title, message, duration, persistent } = toast;

  useEffect(() => {
    if (!persistent && duration > 0) {
      const timer = setTimeout(() => {
        onRemove(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [id, duration, persistent, onRemove]);

  const getToastStyles = () => {
    const baseStyles = {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '0.75rem',
      padding: '1rem 1.25rem',
      borderRadius: '0.75rem',
      boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
      border: '1px solid',
      minWidth: '320px',
      maxWidth: '480px',
      position: 'relative',
      animation: 'toastSlideIn 0.3s ease-out',
      transition: 'all 0.2s ease'
    };

    switch (type) {
      case ToastTypes.SUCCESS:
        return {
          ...baseStyles,
          background: 'linear-gradient(135deg, #f0fff4 0%, #c6f6d5 100%)',
          borderColor: '#68d391',
          color: '#22543d'
        };
      case ToastTypes.ERROR:
        return {
          ...baseStyles,
          background: 'linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%)',
          borderColor: '#fc8181',
          color: '#742a2a'
        };
      case ToastTypes.WARNING:
        return {
          ...baseStyles,
          background: 'linear-gradient(135deg, #fffbeb 0%, #fed7aa 100%)',
          borderColor: '#f6ad55',
          color: '#744210'
        };
      case ToastTypes.INFO:
      default:
        return {
          ...baseStyles,
          background: 'linear-gradient(135deg, #ebf8ff 0%, #bee3f8 100%)',
          borderColor: '#63b3ed',
          color: '#2c5282'
        };
    }
  };

  const getIcon = () => {
    const iconProps = { size: 20 };
    
    switch (type) {
      case ToastTypes.SUCCESS:
        return <CheckCircle {...iconProps} color="#38a169" />;
      case ToastTypes.ERROR:
        return <XCircle {...iconProps} color="#e53e3e" />;
      case ToastTypes.WARNING:
        return <AlertTriangle {...iconProps} color="#d69e2e" />;
      case ToastTypes.INFO:
      default:
        return <Info {...iconProps} color="#3182ce" />;
    }
  };

  return (
    <div style={getToastStyles()}>
      {/* Icon */}
      <div style={{ marginTop: '0.125rem', flexShrink: 0 }}>
        {getIcon()}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {title && (
          <div style={{
            fontWeight: '600',
            fontSize: '0.95rem',
            marginBottom: message ? '0.25rem' : '0',
            lineHeight: '1.4'
          }}>
            {title}
          </div>
        )}
        {message && (
          <div style={{
            fontSize: '0.875rem',
            lineHeight: '1.5',
            opacity: 0.9
          }}>
            {message}
          </div>
        )}
      </div>

      {/* Close Button */}
      <button
        onClick={() => onRemove(id)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '0.25rem',
          borderRadius: '0.375rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0.7,
          transition: 'opacity 0.2s ease',
          marginTop: '0.125rem'
        }}
        onMouseOver={(e) => e.target.style.opacity = '1'}
        onMouseOut={(e) => e.target.style.opacity = '0.7'}
        aria-label="Close notification"
      >
        <X size={16} />
      </button>
    </div>
  );
};

// Toast Container Component
const ToastContainer = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return ReactDOM.createPortal(
    <>
      {/* Add CSS animations */}
      <style>
        {`
          @keyframes toastSlideIn {
            from {
              opacity: 0;
              transform: translateX(100%);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          
          @keyframes toastSlideOut {
            from {
              opacity: 1;
              transform: translateX(0);
            }
            to {
              opacity: 0;
              transform: translateX(100%);
            }
          }
        `}
      </style>
      
      {/* Toast Container */}
      <div style={{
        position: 'fixed',
        top: '1rem',
        right: '1rem',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        pointerEvents: 'none'
      }}>
        {toasts.map(toast => (
          <div key={toast.id} style={{ pointerEvents: 'auto' }}>
            <Toast toast={toast} onRemove={onRemove} />
          </div>
        ))}
      </div>
    </>,
    document.body
  );
};

// Toast Provider Component
export const ToastProvider = ({ children, maxToasts = 5 }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toastData) => {
    const id = Date.now() + Math.random();
    const toast = {
      id,
      type: ToastTypes.INFO,
      duration: 5000,
      persistent: false,
      ...toastData
    };

    setToasts(current => {
      const newToasts = [...current, toast];
      // Limit number of toasts
      if (newToasts.length > maxToasts) {
        return newToasts.slice(-maxToasts);
      }
      return newToasts;
    });

    return id;
  }, [maxToasts]);

  const removeToast = useCallback((id) => {
    setToasts(current => current.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Convenience methods
  const toast = useMemo(() => ({
    success: (title, message, options = {}) => addToast({
      type: ToastTypes.SUCCESS,
      title,
      message,
      ...options
    }),
    
    error: (title, message, options = {}) => addToast({
      type: ToastTypes.ERROR,
      title,
      message,
      persistent: true, // Errors should be persistent by default
      ...options
    }),
    
    warning: (title, message, options = {}) => addToast({
      type: ToastTypes.WARNING,
      title,
      message,
      ...options
    }),
    
    info: (title, message, options = {}) => addToast({
      type: ToastTypes.INFO,
      title,
      message,
      ...options
    }),

    // Storage-specific error helper
    storageError: (storageError, options = {}) => {
      const { getStorageErrorMessage } = require('../utils/safeStorage');
      return addToast({
        type: ToastTypes.ERROR,
        title: 'Storage Error',
        message: getStorageErrorMessage(storageError),
        persistent: true,
        ...options
      });
    }
  }), [addToast]);

  const contextValue = {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    toast
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

// Hook to use toast system
export const useToast = () => {
  const context = useContext(ToastContext);
  
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  
  return context;
};

export default ToastProvider; 