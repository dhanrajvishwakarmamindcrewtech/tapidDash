import React, { Component } from 'react';
import { AlertTriangle, RefreshCw, Home, Send, Copy, CheckCircle } from 'lucide-react';

/**
 * Comprehensive Error Boundary with recovery mechanisms
 * Handles JavaScript errors, network failures, and provides user-friendly feedback
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: 0,
      isRetrying: false,
      errorReported: false,
      showDetails: false,
      copied: false
    };
    
    this.maxRetries = 3;
    this.retryDelay = 1000;
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      errorId: Date.now().toString(36) + Math.random().toString(36).substr(2)
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
      hasError: true
    });

    // Log error for monitoring
    this.logError(error, errorInfo);
  }

  logError = async (error, errorInfo) => {
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.props.userId || 'anonymous',
      errorId: this.state.errorId
    };

    try {
      // In production, send to error monitoring service
      if (process.env.NODE_ENV !== 'production') console.error('Error logged:', errorData);
      
      // Could integrate with services like Sentry, LogRocket, etc.
      // await sendErrorToService(errorData);
      
    } catch (loggingError) {
      console.error('Failed to log error:', loggingError);
    }
  };

  handleRetry = async () => {
    if (this.state.retryCount >= this.maxRetries) {
      return;
    }

    this.setState({ isRetrying: true });

    // Wait before retrying
    await new Promise(resolve => setTimeout(resolve, this.retryDelay));

    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1,
      isRetrying: false
    }));
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      isRetrying: false,
      errorReported: false,
      showDetails: false
    });
  };

  handleReportError = async () => {
    try {
      this.setState({ errorReported: true });
      
      const errorReport = {
        errorId: this.state.errorId,
        message: this.state.error?.message,
        stack: this.state.error?.stack,
        componentStack: this.state.errorInfo?.componentStack,
        userDescription: '', // Could add user input
        timestamp: new Date().toISOString()
      };

      // In production, send to support system
      console.log('Error reported:', errorReport);
      
      // Show success feedback
      setTimeout(() => {
        this.setState({ errorReported: false });
      }, 3000);
      
    } catch (reportError) {
      console.error('Failed to report error:', reportError);
      this.setState({ errorReported: false });
    }
  };

  copyErrorDetails = () => {
    const errorDetails = `
Error ID: ${this.state.errorId}
Message: ${this.state.error?.message}
Timestamp: ${new Date().toISOString()}
URL: ${window.location.href}
User Agent: ${navigator.userAgent}

Stack Trace:
${this.state.error?.stack}

Component Stack:
${this.state.errorInfo?.componentStack}
    `.trim();

    navigator.clipboard.writeText(errorDetails).then(() => {
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2000);
    }).catch(err => {
      console.error('Failed to copy error details:', err);
    });
  };

  getErrorSeverity = () => {
    const error = this.state.error;
    
    if (!error) return 'low';
    
    // Check for critical errors
    if (error.message.includes('ChunkLoadError') || 
        error.message.includes('Loading chunk') ||
        error.message.includes('Network Error')) {
      return 'network';
    }
    
    if (error.stack?.includes('TypeError') || 
        error.stack?.includes('ReferenceError')) {
      return 'high';
    }
    
    return 'medium';
  };

  getErrorMessage = () => {
    const severity = this.getErrorSeverity();
    
    switch (severity) {
      case 'network':
        return {
          title: 'Connection Issue',
          message: 'There seems to be a network problem. Please check your connection and try again.',
          icon: RefreshCw
        };
      case 'high':
        return {
          title: 'Application Error',
          message: 'Something went wrong with the application. Our team has been notified.',
          icon: AlertTriangle
        };
      default:
        return {
          title: 'Unexpected Error',
          message: 'An unexpected error occurred. Please try refreshing the page.',
          icon: AlertTriangle
        };
    }
  };

  render() {
    if (this.state.hasError) {
      const errorMessage = this.getErrorMessage();
      const ErrorIcon = errorMessage.icon;
      const canRetry = this.state.retryCount < this.maxRetries;

      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          padding: '2rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            padding: '2rem',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            border: '1px solid #e5e7eb',
            textAlign: 'center'
          }}>
            {/* Error Icon */}
            <div style={{
              background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto'
            }}>
              <ErrorIcon size={40} color="#dc2626" />
            </div>

            {/* Error Message */}
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#374151',
              margin: '0 0 0.5rem 0'
            }}>
              {errorMessage.title}
            </h2>
            
            <p style={{
              color: '#6b7280',
              fontSize: '1rem',
              lineHeight: '1.6',
              margin: '0 0 1.5rem 0'
            }}>
              {errorMessage.message}
            </p>

            {/* Error ID */}
            <div style={{
              background: '#f3f4f6',
              borderRadius: '0.5rem',
              padding: '0.75rem',
              marginBottom: '1.5rem',
              fontSize: '0.875rem',
              color: '#6b7280'
            }}>
              Error ID: <code style={{ fontFamily: 'monospace', color: '#374151' }}>
                {this.state.errorId}
              </code>
            </div>

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: '0.75rem',
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginBottom: '1rem'
            }}>
              {canRetry && (
                <button
                  onClick={this.handleRetry}
                  disabled={this.state.isRetrying}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1.5rem',
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: this.state.isRetrying ? 'not-allowed' : 'pointer',
                    opacity: this.state.isRetrying ? 0.7 : 1,
                    transition: 'all 0.2s ease'
                  }}
                >
                  <RefreshCw size={16} style={{
                    animation: this.state.isRetrying ? 'spin 1s linear infinite' : 'none'
                  }} />
                  {this.state.isRetrying ? 'Retrying...' : 'Try Again'}
                </button>
              )}

              <button
                onClick={() => window.location.href = '/'}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => e.target.style.background = '#4b5563'}
                onMouseOut={(e) => e.target.style.background = '#6b7280'}
              >
                <Home size={16} />
                Go Home
              </button>
            </div>

            {/* Secondary Actions */}
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={this.handleReportError}
                disabled={this.state.errorReported}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.5rem 0.75rem',
                  background: 'none',
                  color: this.state.errorReported ? '#059669' : '#6b7280',
                  border: '1px solid',
                  borderColor: this.state.errorReported ? '#059669' : '#d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {this.state.errorReported ? <CheckCircle size={14} /> : <Send size={14} />}
                {this.state.errorReported ? 'Reported' : 'Report Error'}
              </button>

              <button
                onClick={() => this.setState(prev => ({ showDetails: !prev.showDetails }))}
                style={{
                  padding: '0.5rem 0.75rem',
                  background: 'none',
                  color: '#6b7280',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {this.state.showDetails ? 'Hide' : 'Show'} Details
              </button>

              {this.state.showDetails && (
                <button
                  onClick={this.copyErrorDetails}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    padding: '0.5rem 0.75rem',
                    background: 'none',
                    color: this.state.copied ? '#059669' : '#6b7280',
                    border: '1px solid',
                    borderColor: this.state.copied ? '#059669' : '#d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {this.state.copied ? <CheckCircle size={14} /> : <Copy size={14} />}
                  {this.state.copied ? 'Copied!' : 'Copy Details'}
                </button>
              )}
            </div>

            {/* Error Details */}
            {this.state.showDetails && (
              <div style={{
                marginTop: '1rem',
                padding: '1rem',
                background: '#f9fafb',
                borderRadius: '0.5rem',
                border: '1px solid #e5e7eb',
                textAlign: 'left'
              }}>
                <h4 style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                  margin: '0 0 0.5rem 0'
                }}>
                  Technical Details
                </h4>
                <pre style={{
                  fontSize: '0.75rem',
                  color: '#6b7280',
                  background: '#f3f4f6',
                  padding: '0.75rem',
                  borderRadius: '0.375rem',
                  overflow: 'auto',
                  maxHeight: '200px',
                  margin: 0,
                  fontFamily: 'monospace'
                }}>
                  {this.state.error?.message}
                  {this.state.error?.stack && '\n\nStack Trace:\n' + this.state.error.stack}
                </pre>
              </div>
            )}

            {/* Retry Counter */}
            {this.state.retryCount > 0 && (
              <div style={{
                marginTop: '1rem',
                fontSize: '0.75rem',
                color: '#6b7280'
              }}>
                Retry attempts: {this.state.retryCount}/{this.maxRetries}
              </div>
            )}
          </div>

          {/* CSS for spin animation */}
          <style>
            {`
              @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
            `}
          </style>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 