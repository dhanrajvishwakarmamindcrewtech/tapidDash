import React from 'react';
import ReactDOM from 'react-dom';
import { 
  X, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Link2,
  RefreshCw
} from 'lucide-react';
import styles from './AvailableTerminalsModal.module.css';

const AvailableTerminalsModal = ({ 
  isOpen, 
  onClose, 
  terminals, 
  connectedTerminals,
  onConnect,
  isConnecting,
  connectionStatus,
  getStatusIcon,
  getStatusText
}) => {
  if (!isOpen) return null;

  const isConnected = (terminalId) => {
    return connectedTerminals.some(t => t.id === terminalId);
  };

  const getConnectionStatus = (terminalId) => {
    if (isConnected(terminalId)) return 'connected';
    if (connectionStatus[terminalId]) return connectionStatus[terminalId];
    return 'available';
  };

  const canConnect = (terminal) => {
    // Can only connect if no terminals are connected and this terminal is available (not coming soon)
    return connectedTerminals.length === 0 && terminal.status === 'available';
  };

  const modalContent = (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className={styles.modalHeader}>
          <div className={styles.headerInfo}>
            <h2 className={styles.modalTitle}>POS Terminal Integrations</h2>
            <p className={styles.modalSubtitle}>
              Choose from {terminals.filter(t => t.status === 'available').length} available integrations. You can connect one terminal at a time.
            </p>
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Connection Limit Notice */}
        {connectedTerminals.length > 0 && (
          <div className={styles.limitNotice}>
            <AlertCircle size={16} />
            <span>You already have a terminal connected. Disconnect it first to connect a different one.</span>
          </div>
        )}

        {/* Terminals Grid */}
        <div className={styles.terminalsGrid}>
          {terminals.map((terminal) => {
            const status = getConnectionStatus(terminal.id);
            const canConnectTerminal = canConnect(terminal);
            const isTerminalConnected = isConnected(terminal.id);
            
            return (
              <div 
                key={terminal.id} 
                className={`${styles.terminalCard} ${!canConnectTerminal && !isTerminalConnected ? styles.disabledCard : ''}`}
              >
                {/* Terminal Header */}
                <div className={styles.terminalHeader}>
                  <div className={styles.terminalIcon} style={{ backgroundColor: terminal.color }}>
                    <terminal.icon size={24} color="white" />
                  </div>
                  <div className={styles.terminalInfo}>
                    <h3 className={styles.terminalName}>{terminal.name}</h3>
                    <p className={styles.terminalDescription}>{terminal.description}</p>
                  </div>
                </div>

                {/* Terminal Status */}
                <div className={styles.terminalStatus}>
                  {status === 'connected' ? (
                    <div className={styles.connectedStatus}>
                      <CheckCircle size={16} color="#10b981" />
                      <span>Connected</span>
                    </div>
                  ) : (
                    <div className={styles.statusIndicator}>
                      {getStatusIcon(status)}
                      <span>{getStatusText(status)}</span>
                    </div>
                  )}
                </div>

                {/* Terminal Actions */}
                <div className={styles.terminalActions}>
                  {!isTerminalConnected && (
                    <button
                      className={
                        terminal.status === 'coming_soon' ? styles.comingSoonBtn :
                        canConnectTerminal ? styles.connectBtn : styles.disabledBtn
                      }
                      onClick={() => terminal.status === 'available' && canConnectTerminal ? onConnect(terminal.id) : null}
                      disabled={
                        terminal.status === 'coming_soon' || 
                        !canConnectTerminal || 
                        isConnecting
                      }
                    >
                      {terminal.status === 'coming_soon' ? (
                        <>
                          <Clock size={16} />
                          Coming Soon
                        </>
                      ) : isConnecting && status === 'connecting' ? (
                        <>
                          <RefreshCw size={16} className={styles.spinning} />
                          Connecting...
                        </>
                      ) : canConnectTerminal ? (
                        <>
                          <Link2 size={16} />
                          Connect
                        </>
                      ) : (
                        <>
                          <AlertCircle size={16} />
                          Disconnect current first
                        </>
                      )}
                    </button>
                  )}
                  
                  {isTerminalConnected && (
                    <div className={styles.connectedBadge}>
                      <CheckCircle size={16} />
                      <span>Connected</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className={styles.modalFooter}>
          <button className={styles.closeBtn} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );

  // Use React Portal to render the modal at the root level
  return ReactDOM.createPortal(modalContent, document.body);
};

export default AvailableTerminalsModal; 