import React, { createContext, useContext, useState, useCallback } from 'react';

const UIContext = createContext();

export const useNotifications = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useNotifications must be used within a UIProvider');
  }
  return context;
};

export const UIProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [updateLog, setUpdateLog] = useState([]);

  // Show notification
  const showNotification = useCallback((message, type = 'success', options = {}) => {
    const {
      duration = 4000,
      persistent = false,
      actionLabel = null,
      onAction = null,
      details = null
    } = options;

    const id = Date.now() + Math.random();
    const notification = {
      id,
      message,
      type, // 'success', 'error', 'warning', 'info', 'update'
      timestamp: new Date(),
      persistent,
      actionLabel,
      onAction,
      details
    };

    setNotifications(prev => [...prev, notification]);

    // Auto-remove non-persistent notifications
    if (!persistent && duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }

    return id;
  }, []);

  // Remove notification
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Log system updates
  const logUpdate = useCallback((updateType, details, affectedComponents = []) => {
    const updateEntry = {
      id: Date.now(),
      type: updateType,
      details,
      affectedComponents,
      timestamp: new Date()
    };

    setUpdateLog(prev => [updateEntry, ...prev.slice(0, 49)]); // Keep last 50 updates

    // Show notification for important updates
    if (['settings', 'customer_update', 'campaign_change'].includes(updateType)) {
      showNotification(
        getUpdateMessage(updateType, details),
        'update',
        {
          duration: 3000,
          details: affectedComponents.length > 0 ? `Updated: ${affectedComponents.join(', ')}` : null
        }
      );
    }
  }, [showNotification]);

  // Get user-friendly update messages
  const getUpdateMessage = (updateType, details) => {
    switch (updateType) {
      case 'settings':
        return `Settings updated: ${details.settingName || 'Business information'}`;
      case 'customer_update':
        return `Customer ${details.customerName || details.customerId} updated`;
      case 'campaign_change':
        return `Campaign "${details.campaignName}" ${details.action}`;
      case 'data_refresh':
        return 'Data refreshed successfully';
      case 'sync_complete':
        return 'All data synchronized';
      default:
        return `System update: ${updateType}`;
    }
  };

  // Convenience methods for different notification types
  const showSuccess = useCallback((message, options = {}) => {
    return showNotification(message, 'success', options);
  }, [showNotification]);

  const showError = useCallback((message, options = {}) => {
    return showNotification(message, 'error', { ...options, duration: 6000 });
  }, [showNotification]);

  const showWarning = useCallback((message, options = {}) => {
    return showNotification(message, 'warning', { ...options, duration: 5000 });
  }, [showNotification]);

  const showInfo = useCallback((message, options = {}) => {
    return showNotification(message, 'info', options);
  }, [showNotification]);

  const showLoading = useCallback((message, options = {}) => {
    return showNotification(message, 'info', { ...options, persistent: true });
  }, [showNotification]);

  // Get notification statistics
  const getNotificationStats = useCallback(() => {
    const stats = {
      total: notifications.length,
      unread: notifications.length, // All notifications are considered unread until dismissed
      byType: {}
    };

    notifications.forEach(notification => {
      stats.byType[notification.type] = (stats.byType[notification.type] || 0) + 1;
    });

    return stats;
  }, [notifications]);

  // Get recent updates
  const getRecentUpdates = useCallback((limit = 10) => {
    return updateLog.slice(0, limit);
  }, [updateLog]);

  // Clear update log
  const clearUpdateLog = useCallback(() => {
    setUpdateLog([]);
  }, []);

  const contextValue = {
    // Notification state
    notifications,
    updateLog,
    
    // Notification functions
    showNotification,
    removeNotification,
    clearNotifications,
    
    // Convenience notification methods
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading,
    
    // Update logging
    logUpdate,
    getRecentUpdates,
    clearUpdateLog,
    
    // Utility functions
    getNotificationStats
  };

  return (
    <UIContext.Provider value={contextValue}>
      {children}
    </UIContext.Provider>
  );
};

// Notification container component for rendering notifications
export const NotificationContainer = () => {
  const { notifications, removeNotification } = useNotifications();

  if (notifications.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      maxWidth: '400px'
    }}>
      {notifications.map(notification => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={removeNotification}
        />
      ))}
    </div>
  );
};

// Individual notification item component
const NotificationItem = ({ notification, onRemove }) => {
  const getNotificationStyle = (type) => {
    const baseStyle = {
      padding: '12px 16px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      maxWidth: '100%',
      wordBreak: 'break-word',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: '14px',
      transition: 'all 0.3s ease'
    };

    const typeStyles = {
      success: {
        backgroundColor: '#d4edda',
        color: '#155724',
        border: '1px solid #c3e6cb'
      },
      error: {
        backgroundColor: '#f8d7da',
        color: '#721c24',
        border: '1px solid #f5c6cb'
      },
      warning: {
        backgroundColor: '#fff3cd',
        color: '#856404',
        border: '1px solid #ffeaa7'
      },
      info: {
        backgroundColor: '#d1ecf1',
        color: '#0c5460',
        border: '1px solid #bee5eb'
      },
      update: {
        backgroundColor: '#e2e3e5',
        color: '#383d41',
        border: '1px solid #d6d8db'
      }
    };

    return { ...baseStyle, ...typeStyles[type] };
  };

  return (
    <div style={getNotificationStyle(notification.type)}>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: '500', marginBottom: '4px' }}>
          {notification.message}
        </div>
        {notification.details && (
          <div style={{ fontSize: '12px', opacity: 0.8 }}>
            {notification.details}
          </div>
        )}
        {notification.actionLabel && notification.onAction && (
          <button
            onClick={notification.onAction}
            style={{
              marginTop: '8px',
              padding: '4px 8px',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
              color: 'inherit',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            {notification.actionLabel}
          </button>
        )}
      </div>
      {!notification.persistent && (
        <button
          onClick={() => onRemove(notification.id)}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '16px',
            cursor: 'pointer',
            color: 'inherit',
            opacity: 0.6,
            marginLeft: '8px',
            padding: '0',
            lineHeight: '1'
          }}
          title="Dismiss"
        >
          ×
        </button>
      )}
    </div>
  );
};

// Export the provider as NotificationProvider for backward compatibility
export const NotificationProvider = UIProvider; 