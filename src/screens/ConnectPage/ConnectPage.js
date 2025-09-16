import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { 
  CheckCircle, AlertCircle, Clock, Plus, Settings, RefreshCw, ExternalLink,
  ChevronRight, ChevronLeft, ChevronUp, ChevronDown, Wifi, Shield, Activity,
  Info, X, Users, DollarSign, TrendingUp
} from 'lucide-react';
import styles from './ConnectPage.module.css';
import SumUpService from '../../services/sumupService';
import ConnectedTerminalModal from '../../components/ConnectedTerminalModal';
import AvailableTerminalsModal from '../../components/AvailableTerminalsModal';
import SquareService from '../../services/squareService';
import { useConnect } from '../../context/ConnectContext';

const ConnectPage = () => {
  // Context data and functions
  const {
    // Data
    connectedTerminals,
    connectionStatus,
    selectedTerminal,
    selectedDay,
    showAnalytics,
    analyticsData,
    loading,
    error,
    lastUpdated,
    isConnecting,
    loadingProgress,
    
    // Setters
    setSelectedTerminal,
    setSelectedDay,
    setShowAnalytics,
    
    // Utility functions
    formatCurrency,
    formatNumber,
    formatPercentage,
    getTrendIcon,
    getIconComponent,
    
    // Data transformations
    getTransformedTerminals,
    getTransformedKPIs,
    getTransformedTrendingItems,
    getHourlyDataForDay,
    getQueueAnalytics,
    
    // Connection management
    connectTerminal,
    disconnectTerminal,
    refreshData,
    
    // Analytics
    generateAnalyticsData,
    exportConnectData,
    
    // Configuration
    connectionSettings,
    notifications
  } = useConnect();

  // Local UI state
  const [currentTerminalIndex, setCurrentTerminalIndex] = useState(0);
  const [terminalsPerPage, setTerminalsPerPage] = useState(3);
  const [showConnectedModal, setShowConnectedModal] = useState(false);
  const [showAvailableModal, setShowAvailableModal] = useState(false);
  const [showQueueInfoModal, setShowQueueInfoModal] = useState(false);
  const [showQueueModal, setShowQueueModal] = useState(false);
  const [showTapidUsersModal, setShowTapidUsersModal] = useState(false);
  const [isAnalyticsExpanded, setIsAnalyticsExpanded] = useState(true);
  const [showConnectedDropdown, setShowConnectedDropdown] = useState(false);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);

  // Get transformed data
  const terminals = getTransformedTerminals();
  const kpis = getTransformedKPIs();
  const trendingItems = getTransformedTrendingItems();
  const queueAnalytics = getQueueAnalytics();
  const hourlyData = getHourlyDataForDay(selectedDay);

  // Handle responsive terminals per page
  useEffect(() => {
    const updateTerminalsPerPage = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setTerminalsPerPage(1);
      } else if (width < 1200) {
        setTerminalsPerPage(2);
      } else {
        setTerminalsPerPage(3);
      }
    };

    updateTerminalsPerPage();
    window.addEventListener('resize', updateTerminalsPerPage);
    return () => window.removeEventListener('resize', updateTerminalsPerPage);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showConnectedDropdown && !event.target.closest(`.${styles.connectedDropdown}`)) {
        setShowConnectedDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showConnectedDropdown]);

  // Handle terminal connection
  const handleConnectProvider = async (providerId) => {
    try {
      const result = await connectTerminal(providerId);
      if (result.success) {
        // Show success notification or modal
        console.log(notifications.connectionSuccess);
      } else {
        console.error(result.error);
      }
    } catch (error) {
      console.error(notifications.connectionError, error);
    }
  };

  // Handle terminal disconnection
  const handleDisconnectProvider = (providerId) => {
    const result = disconnectTerminal(providerId);
    if (result.success) {
      console.log(notifications.disconnectionSuccess);
    }
  };

  // Get status icon for connection state
  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected':
        return <CheckCircle size={16} color="#10b981" />;
      case 'connecting':
        return <RefreshCw size={16} className={styles.spinning} />;
      case 'error':
        return <AlertCircle size={16} color="#ef4444" />;
      case 'coming_soon':
        return <Clock size={16} color="#6b7280" />;
      default:
        return null;
    }
  };

  // Get status text for connection state
  const getStatusText = (status) => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting...';
      case 'error':
        return 'Connection Failed';
      case 'coming_soon':
        return 'Coming Soon';
      default:
        return 'Available';
    }
  };

  // Paginate terminals - show both available and coming soon
  const allTerminals = terminals.all;
  const totalPages = Math.ceil(allTerminals.length / terminalsPerPage);
  const currentTerminals = allTerminals.slice(
    currentTerminalIndex,
    currentTerminalIndex + terminalsPerPage
  );

  const nextTerminals = () => {
    setCurrentTerminalIndex(prev => 
      Math.min(prev + terminalsPerPage, allTerminals.length - terminalsPerPage)
    );
  };

  const prevTerminals = () => {
    setCurrentTerminalIndex(prev => Math.max(prev - terminalsPerPage, 0));
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.welcomeHeader}>
        <div className={styles.welcomeContent}>
          <div className={styles.greetingSection}>
            <div className={styles.greetingRow}>
              <span className={styles.greetingMain}>Connect Your POS</span>
            </div>
            <div className={styles.greetingPill}>
              Integrate your payment terminals for enhanced analytics
            </div>
          </div>
          <div className={styles.lastUpdated}>
            <RefreshCw size={14} />
            <span>Last updated: {new Date(lastUpdated).toLocaleTimeString()}</span>
            <button onClick={refreshData} disabled={loading} className={styles.refreshButton}>
              <RefreshCw size={14} className={loading ? styles.spinning : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className={styles.errorBanner}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}



      {/* POS Terminal Integrations - Only show when no terminals are connected */}
      {connectedTerminals.length === 0 && (
        <div className={styles.terminalsSection}>
          <div className={styles.sectionHeader}>
            <h2>POS Terminal Integrations</h2>
            <div className={styles.pagination}>
              <button 
                onClick={prevTerminals} 
                disabled={currentTerminalIndex === 0}
                className={styles.paginationButton}
              >
                <ChevronLeft size={16} />
              </button>
              <span className={styles.pageInfo}>
                {Math.floor(currentTerminalIndex / terminalsPerPage) + 1} / {totalPages}
              </span>
              <button 
                onClick={nextTerminals} 
                disabled={currentTerminalIndex + terminalsPerPage >= allTerminals.length}
                className={styles.paginationButton}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className={styles.terminalsGrid}>
            {currentTerminals.map((terminal) => (
              <div key={terminal.id} className={styles.terminalCard}>
                <div className={styles.terminalHeader}>
                  <div className={styles.terminalIcon} style={{ color: terminal.color }}>
                    {terminal.icon}
                  </div>
                  <div className={styles.terminalInfo}>
                    <h3>{terminal.name}</h3>
                    <p>{terminal.description}</p>
                  </div>
                  {getStatusIcon(terminal.connectionStatus)}
                </div>

                <div className={styles.terminalActions}>
                  {terminal.isConnected ? (
                    <button 
                      onClick={() => handleDisconnectProvider(terminal.id)}
                      className={styles.disconnectButton}
                    >
                      Disconnect
                    </button>
                  ) : (
                    <button 
                      onClick={terminal.status === 'available' ? () => handleConnectProvider(terminal.id) : null}
                      disabled={terminal.status === 'coming_soon' || isConnecting}
                      className={terminal.status === 'coming_soon' ? styles.comingSoonButton : styles.connectButton}
                    >
                      {terminal.status === 'coming_soon' ? (
                        <>
                          <Clock size={16} />
                          Coming Soon
                        </>
                      ) : isConnecting && connectionStatus[terminal.id] === 'connecting' ? (
                        <>
                          <RefreshCw size={16} className={styles.spinning} />
                          Connecting... ({Math.round(loadingProgress)}%)
                        </>
                      ) : (
                        <>
                          <Plus size={16} />
                          Connect
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}


      {/* Analytics Section */}
      {showAnalytics && analyticsData && (
        <div className={styles.analyticsSection}>
          <div className={styles.analyticsHeader}>
            <h2>Terminal Analytics</h2>
            <div className={styles.connectedDropdown}>
              <button 
                className={styles.connectedButton}
                onClick={() => setShowConnectedDropdown(!showConnectedDropdown)}
              >
                <CheckCircle size={14} />
                <span>Connected</span>
                <ChevronDown size={14} />
              </button>
              {showConnectedDropdown && (
                <div className={styles.dropdownMenu}>
            <button 
                    className={styles.dropdownItem}
                    onClick={() => {
                      setShowConnectedDropdown(false);
                      setShowDisconnectModal(true);
                    }}
                  >
                    <X size={14} />
                    Disconnect
            </button>
                </div>
              )}
            </div>
          </div>
          
          {/* KPI Summary */}
          <div className={styles.kpiSection}>
            <div className={styles.kpiGrid}>
              {kpis.map((kpi, index) => (
                <div key={index} className={styles.kpiCard}>
                  <div className={styles.kpiContent}>
                    <div className={styles.kpiIconWrapper}>
                      <div className={styles.kpiIcon}>
                        {kpi.icon}
                      </div>
                    </div>
                    <div className={styles.kpiText}>
                      <div className={styles.kpiValue}>{kpi.formattedValue}</div>
                      <div className={styles.kpiTitle}>{kpi.title}</div>
                      <div className={styles.kpiTrend}>
                        {kpi.trendIcon}
                        <span className={styles.kpiChange}>{kpi.formattedChange}</span>
                        <span className={styles.kpiPeriod}>{kpi.periodText}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Analytics Grid */}
          <div className={styles.analyticsGrid}>
            {/* Trending Items */}
            <div className={styles.analyticsCard}>
              <h3>Trending Items</h3>
              <div className={styles.trendingList}>
                {trendingItems.map((item, index) => (
                  <div key={index} className={styles.trendingItem}>
                    <span className={styles.itemName}>{item.name}</span>
                    <span className={styles.itemSales}>{item.formattedSales}</span>
                    <span className={styles.itemChange}>
                      {item.trendIcon}
                      {item.formattedChange}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Queue Performance */}
            <div className={styles.analyticsCard}>
              <h3>Queue Performance</h3>
              <div className={styles.queueStats}>
                <div className={styles.queueStat}>
                  <span className={styles.statLabel}>Average Service Time</span>
                  <span className={styles.statValue}>{queueAnalytics.formattedServiceTime}</span>
                </div>
                <div className={styles.queueStat}>
                  <span className={styles.statLabel}>Efficiency Score</span>
                  <span className={styles.statValue}>{queueAnalytics.formattedEfficiency}</span>
                </div>
                <div className={styles.queueStat}>
                  <span className={styles.statLabel}>Customers per Hour</span>
                  <span className={styles.statValue}>{queueAnalytics.formattedCustomersPerHour}</span>
                </div>
              </div>
              <div className={styles.improvementTip}>
                <Info size={16} />
                <span>{queueAnalytics.improvementTip}</span>
              </div>
            </div>
          </div>

          {/* Hourly Activity Chart */}
          <div className={styles.chartSection}>
            <div className={styles.chartHeader}>
              <h3>Daily Activity - {selectedDay}</h3>
              <select 
                value={selectedDay} 
                onChange={(e) => setSelectedDay(e.target.value)}
                className={styles.daySelector}
              >
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={hourlyData}>
                  <defs>
                    <linearGradient id="transactionsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#008A9B" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#008A9B" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="customersGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00BD84" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#00BD84" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="hour" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="transactions" 
                    stroke="#008A9B" 
                    strokeWidth={2}
                    fill="url(#transactionsGradient)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="customers" 
                    stroke="#00BD84" 
                    strokeWidth={2}
                    fill="url(#customersGradient)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showConnectedModal && selectedTerminal && (
        <ConnectedTerminalModal
          terminal={selectedTerminal}
          onClose={() => {
            setShowConnectedModal(false);
            setSelectedTerminal(null);
          }}
          onDisconnect={handleDisconnectProvider}
        />
      )}

      {showAvailableModal && (
        <AvailableTerminalsModal
          isOpen={showAvailableModal}
          terminals={terminals.all}
          connectedTerminals={connectedTerminals}
          onClose={() => setShowAvailableModal(false)}
          onConnect={handleConnectProvider}
          isConnecting={isConnecting}
          connectionStatus={connectionStatus}
          getStatusIcon={getStatusIcon}
          getStatusText={getStatusText}
        />
      )}

      {/* Disconnect Confirmation Modal */}
      {showDisconnectModal && (
        <div className={styles.modalOverlay} onClick={() => setShowDisconnectModal(false)}>
          <div className={styles.disconnectModalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.disconnectModalHeader}>
              <h3>Disconnect Terminal</h3>
              <button 
                onClick={() => setShowDisconnectModal(false)}
                className={styles.disconnectModalClose}
              >
                <X size={20} />
              </button>
            </div>
            <div className={styles.disconnectModalBody}>
              <p>Are you sure you want to disconnect from {connectedTerminals[0]?.name}?</p>
              <p className={styles.disconnectWarning}>
                This will stop all data synchronization and analytics tracking.
              </p>
            </div>
            <div className={styles.disconnectModalActions}>
              <button 
                onClick={() => setShowDisconnectModal(false)}
                className={styles.cancelButton}
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  if (connectedTerminals[0]) {
                    handleDisconnectProvider(connectedTerminals[0].id);
                  }
                  setShowDisconnectModal(false);
                }}
                className={styles.confirmDisconnectButton}
              >
                Yes, Disconnect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectPage; 