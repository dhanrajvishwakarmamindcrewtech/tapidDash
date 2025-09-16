import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { 
  X, 
  CheckCircle, 
  AlertTriangle, 
  Wifi, 
  Calendar, 
  Clock,
  Trash2
} from 'lucide-react';
import styles from './ConnectedTerminalModal.module.css';

const ConnectedTerminalModal = ({ 
  isOpen, 
  onClose, 
  terminal, 
  onDisconnect 
}) => {
  const [showDisconnectWarning, setShowDisconnectWarning] = useState(false);

  if (!isOpen || !terminal) return null;

  const handleDisconnectClick = () => {
    setShowDisconnectWarning(true);
  };

  const handleConfirmDisconnect = () => {
    onDisconnect(terminal.id);
    setShowDisconnectWarning(false);
    onClose();
  };

  const handleCancelDisconnect = () => {
    setShowDisconnectWarning(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const modalContent = (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className={styles.modalHeader}>
          <div className={styles.terminalInfo}>
            <div className={styles.terminalIcon} style={{ backgroundColor: terminal.color }}>
              {terminal.icon && <terminal.icon size={24} color="white" />}
            </div>
            <div>
              <h2 className={styles.terminalName}>{terminal.name}</h2>
              <p className={styles.terminalDescription}>{terminal.description}</p>
            </div>
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Connection Status */}
        <div className={styles.statusSection}>
          <div className={styles.statusItem}>
            <CheckCircle size={20} color="#10b981" />
            <span className={styles.statusLabel}>Connected</span>
          </div>
          <div className={styles.statusItem}>
            <Wifi size={20} color="#10b981" />
            <span className={styles.statusLabel}>Online</span>
          </div>
        </div>

        {/* Connection Details */}
        <div className={styles.detailsSection}>
          <h3 className={styles.sectionTitle}>Connection Details</h3>
          
          <div className={styles.detailItem}>
            <Calendar size={16} />
            <div className={styles.detailContent}>
              <span className={styles.detailLabel}>Connected On</span>
              <span className={styles.detailValue}>{formatDate(terminal.connectedAt)}</span>
            </div>
          </div>

          <div className={styles.detailItem}>
            <Clock size={16} />
            <div className={styles.detailContent}>
              <span className={styles.detailLabel}>Last Sync</span>
              <span className={styles.detailValue}>{formatDate(terminal.lastSync)}</span>
            </div>
          </div>
        </div>

        {/* Disconnect Warning Modal */}
        {showDisconnectWarning && (
          <div className={styles.warningOverlay}>
            <div className={styles.warningModal}>
              <div className={styles.warningHeader}>
                <AlertTriangle size={24} color="#f59e0b" />
                <h3>Disconnect Terminal?</h3>
              </div>
              <p className={styles.warningMessage}>
                Are you sure you want to disconnect <strong>{terminal.name}</strong>? 
                This will stop all payment processing and data synchronization for this terminal.
              </p>
              <div className={styles.warningActions}>
                <button 
                  className={styles.cancelButton}
                  onClick={handleCancelDisconnect}
                >
                  Cancel
                </button>
                <button 
                  className={styles.disconnectButton}
                  onClick={handleConfirmDisconnect}
                >
                  <Trash2 size={16} />
                  Disconnect
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div className={styles.modalActions}>
          <button 
            className={styles.disconnectBtn}
            onClick={handleDisconnectClick}
          >
            <Trash2 size={16} />
            Disconnect Terminal
          </button>
        </div>
      </div>
    </div>
  );

  // Use React Portal to render the modal at the root level
  return ReactDOM.createPortal(modalContent, document.body);
};

export default ConnectedTerminalModal; 