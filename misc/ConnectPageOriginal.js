import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { 
  CreditCard, 
  Smartphone, 
  Store, 
  ShoppingCart, 
  Zap, 
  Diamond,
  BarChart3,
  Link2,
  CheckCircle,
  AlertCircle,
  Clock,
  Plus,
  Settings,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  Wifi,
  Shield,
  Activity,
  Info,
  X,
  Users,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  UserCheck
} from 'lucide-react';
import styles from './ConnectPage.module.css';
import SumUpService from '../../services/sumupService';
import ConnectedTerminalModal from '../../components/ConnectedTerminalModal';
import AvailableTerminalsModal from '../../components/AvailableTerminalsModal';
import SquareService from '../../services/squareService';

// POS Terminals Configuration
const POS_TERMINALS = [
  // Available Providers
  {
    id: 'sumup',
    name: 'SumUp',
    description: 'Popular card reader and payment terminal',
    icon: CreditCard,
    features: ['Contactless payments', 'Mobile app integration', 'Low transaction fees'],
    service: SumUpService,
    status: 'available',
    color: '#7950f2'
  },
  {
    id: 'square',
    name: 'Square',
    description: 'Complete point-of-sale system',
    icon: Smartphone,
    features: ['Full POS system', 'Analytics dashboard', 'Inventory management'],
    service: SquareService,
    status: 'available',
    color: '#00c851'
  },
  // Coming Soon Providers
  {
    id: 'clover',
    name: 'Clover',
    description: 'Flexible POS for retail, restaurants, and services',
    icon: Store,
    features: ['Customizable hardware', 'App marketplace', 'Multi-location support'],
    status: 'coming_soon',
    color: '#ff6b35'
  },
  {
    id: 'shopify',
    name: 'Shopify POS',
    description: 'POS for e-commerce and brick-and-mortar',
    icon: ShoppingCart,
    features: ['Unified online/offline sales', 'Inventory sync', 'Customer profiles'],
    status: 'coming_soon',
    color: '#95bf47'
  },
  {
    id: 'toast',
    name: 'Toast',
    description: 'Restaurant-focused POS system',
    icon: Zap,
    features: ['Order management', 'Table service', 'Online ordering'],
    status: 'coming_soon',
    color: '#ff6b6b'
  },
  {
    id: 'stripe',
    name: 'Stripe Terminal',
    description: 'Developer-friendly in-person payments',
    icon: CreditCard,
    features: ['Custom hardware', 'API-first', 'Advanced analytics'],
    status: 'coming_soon',
    color: '#6772e5'
  },
  {
    id: 'lightspeed',
    name: 'Lightspeed',
    description: 'POS for retail, restaurants, and golf',
    icon: Diamond,
    features: ['Multi-location', 'Inventory management', 'Advanced reporting'],
    status: 'coming_soon',
    color: '#007bff'
  },
  {
    id: 'vend',
    name: 'Vend',
    description: 'Cloud-based retail POS',
    icon: BarChart3,
    features: ['Inventory', 'Customer loyalty', 'E-commerce integration'],
    status: 'coming_soon',
    color: '#28a745'
  }
];

const ConnectPage = () => {
  // Helper function for trend icons
  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return <ArrowUpRight size={16} className={styles.trendUp} />;
      case 'down':
        return <ArrowDownRight size={16} className={styles.trendDown} />;
      default:
        return null;
    }
  };

  const [connectedTerminals, setConnectedTerminals] = useState([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState({});
  const [currentTerminalIndex, setCurrentTerminalIndex] = useState(0);
  const [terminalsPerPage, setTerminalsPerPage] = useState(3); // Responsive count
  const [selectedTerminal, setSelectedTerminal] = useState(null);
  const [showConnectedModal, setShowConnectedModal] = useState(false);
  const [showAvailableModal, setShowAvailableModal] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showQueueInfoModal, setShowQueueInfoModal] = useState(false);
  const [showQueueModal, setShowQueueModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [showTapidUsersModal, setShowTapidUsersModal] = useState(false);
  const [isAnalyticsExpanded, setIsAnalyticsExpanded] = useState(true);

  useEffect(() => {
    // Load connected terminals from localStorage or API
    const saved = localStorage.getItem('connectedTerminals');
    if (saved) {
      const terminals = JSON.parse(saved);
      setConnectedTerminals(terminals);
      // If there are connected terminals, show analytics
      if (terminals.length > 0) {
        setShowAnalytics(true);
        generateAnalyticsData();
      }
    }
  }, []);

  // Responsive terminals per page handling
  useEffect(() => {
    const updateTerminalsPerPage = () => {
      const width = window.innerWidth;
      if (width <= 480) {
        setTerminalsPerPage(1);
      } else if (width <= 768) {
        setTerminalsPerPage(1);
      } else if (width <= 1200) {
        setTerminalsPerPage(2);
      } else {
        setTerminalsPerPage(3);
      }
    };
    updateTerminalsPerPage();
    window.addEventListener('resize', updateTerminalsPerPage);
    return () => window.removeEventListener('resize', updateTerminalsPerPage);
  }, []);

  const generateAnalyticsData = () => {
    // ========================================
    // QUEUE EFFICIENCY MODAL DATA STRUCTURE
    // ========================================
    // This JSON structure contains all values used in the modal
    // Making it easy to replace with dynamic API data later
    
    const queueEfficiencyData = {
      // Current Performance Metrics
      currentPerformance: {
        efficiencyScore: 82,
        averageServiceTime: "3.4 minutes",
        customersPerHour: 18,
        busyThreshold: 40,
        peakEfficiency: "89% (11AM)",
        improvementTip: "Consider additional staff during 12-2 PM rush"
      },

      // 7-Day Trend Data
      weeklyTrend: [
        {
          day: "Mon",
          efficiency: 78,
          serviceTime: 3.8,
          customersPerHour: 16,
          status: "optimal"
        },
        {
          day: "Tue", 
          efficiency: 95,
          serviceTime: 2.1,
          customersPerHour: 8,
          status: "underutilized"
        },
        {
          day: "Wed",
          efficiency: 79,
          serviceTime: 3.6,
          customersPerHour: 17,
          status: "optimal"
        },
        {
          day: "Thu",
          efficiency: 85,
          serviceTime: 3.1,
          customersPerHour: 19,
          status: "optimal"
        },
        {
          day: "Fri",
          efficiency: 65,
          serviceTime: 4.8,
          customersPerHour: 22,
          status: "overworked"
        },
        {
          day: "Sat",
          efficiency: 92,
          serviceTime: 2.5,
          customersPerHour: 11,
          status: "underutilized"
        },
        {
          day: "Sun",
          efficiency: 68,
          serviceTime: 4.5,
          customersPerHour: 25,
          status: "overworked"
        }
      ],

      // Workload Status Definitions
      workloadStatuses: {
        overworked: {
          level: "Overworked",
          color: "#ef4444",
          icon: "🚨",
          recommendation: "Add 1-2 staff members during peak hours",
          description: "Staff are struggling to maintain service quality",
          suggestedStaff: 3
        },
        optimal: {
          level: "Optimal", 
          color: "#10b981",
          icon: "✅",
          recommendation: "Current staffing level is well-balanced",
          description: "Staff are performing efficiently without being overwhelmed",
          suggestedStaff: 2
        },
        excellent: {
          level: "Excellent",
          color: "#10b981", 
          icon: "🌟",
          recommendation: "Maintain current staffing strategy",
          description: "High efficiency with good customer throughput",
          suggestedStaff: 2
        },
        underutilized: {
          level: "Underutilized",
          color: "#3b82f6",
          icon: "💡", 
          recommendation: "Consider cross-training staff for other tasks",
          description: "Staff capacity could be better utilized during quiet periods",
          suggestedStaff: 1
        }
      },

      // Payment Provider Analysis
      paymentAnalysis: {
        totalTransactions: 1247,
        averageSpend: 23.45,
        currentProviderRate: 2.5,
        tapidPayRate: 1.5,
        savingsRate: 1.0
      },

      // Daily Hourly Activity Data
      dailyHourlyActivity: {
        Monday: [
          { hour: '9 AM', transactions: 12, customers: 8 },
          { hour: '10 AM', transactions: 18, customers: 12 },
          { hour: '11 AM', transactions: 25, customers: 18 },
          { hour: '12 PM', transactions: 42, customers: 32 },
          { hour: '1 PM', transactions: 38, customers: 28 },
          { hour: '2 PM', transactions: 35, customers: 25 },
          { hour: '3 PM', transactions: 28, customers: 20 },
          { hour: '4 PM', transactions: 22, customers: 16 },
          { hour: '5 PM', transactions: 15, customers: 11 }
        ],
        Tuesday: [
          { hour: '9 AM', transactions: 8, customers: 6 },
          { hour: '10 AM', transactions: 14, customers: 10 },
          { hour: '11 AM', transactions: 20, customers: 15 },
          { hour: '12 PM', transactions: 35, customers: 26 },
          { hour: '1 PM', transactions: 32, customers: 24 },
          { hour: '2 PM', transactions: 28, customers: 21 },
          { hour: '3 PM', transactions: 22, customers: 16 },
          { hour: '4 PM', transactions: 18, customers: 13 },
          { hour: '5 PM', transactions: 12, customers: 9 }
        ],
        Wednesday: [
          { hour: '9 AM', transactions: 15, customers: 11 },
          { hour: '10 AM', transactions: 22, customers: 16 },
          { hour: '11 AM', transactions: 28, customers: 21 },
          { hour: '12 PM', transactions: 45, customers: 34 },
          { hour: '1 PM', transactions: 41, customers: 31 },
          { hour: '2 PM', transactions: 38, customers: 28 },
          { hour: '3 PM', transactions: 32, customers: 24 },
          { hour: '4 PM', transactions: 25, customers: 19 },
          { hour: '5 PM', transactions: 18, customers: 14 }
        ],
        Thursday: [
          { hour: '9 AM', transactions: 20, customers: 15 },
          { hour: '10 AM', transactions: 26, customers: 19 },
          { hour: '11 AM', transactions: 32, customers: 24 },
          { hour: '12 PM', transactions: 48, customers: 36 },
          { hour: '1 PM', transactions: 44, customers: 33 },
          { hour: '2 PM', transactions: 40, customers: 30 },
          { hour: '3 PM', transactions: 35, customers: 26 },
          { hour: '4 PM', transactions: 28, customers: 21 },
          { hour: '5 PM', transactions: 22, customers: 16 }
        ],
        Friday: [
          { hour: '9 AM', transactions: 25, customers: 19 },
          { hour: '10 AM', transactions: 35, customers: 26 },
          { hour: '11 AM', transactions: 42, customers: 32 },
          { hour: '12 PM', transactions: 58, customers: 44 },
          { hour: '1 PM', transactions: 55, customers: 42 },
          { hour: '2 PM', transactions: 52, customers: 39 },
          { hour: '3 PM', transactions: 45, customers: 34 },
          { hour: '4 PM', transactions: 38, customers: 29 },
          { hour: '5 PM', transactions: 32, customers: 24 }
        ],
        Saturday: [
          { hour: '9 AM', transactions: 18, customers: 14 },
          { hour: '10 AM', transactions: 28, customers: 21 },
          { hour: '11 AM', transactions: 35, customers: 26 },
          { hour: '12 PM', transactions: 45, customers: 34 },
          { hour: '1 PM', transactions: 42, customers: 32 },
          { hour: '2 PM', transactions: 38, customers: 28 },
          { hour: '3 PM', transactions: 32, customers: 24 },
          { hour: '4 PM', transactions: 25, customers: 19 },
          { hour: '5 PM', transactions: 20, customers: 15 }
        ],
        Sunday: [
          { hour: '9 AM', transactions: 22, customers: 17 },
          { hour: '10 AM', transactions: 30, customers: 23 },
          { hour: '11 AM', transactions: 38, customers: 29 },
          { hour: '12 PM', transactions: 52, customers: 40 },
          { hour: '1 PM', transactions: 48, customers: 36 },
          { hour: '2 PM', transactions: 45, customers: 34 },
          { hour: '3 PM', transactions: 40, customers: 30 },
          { hour: '4 PM', transactions: 35, customers: 26 },
          { hour: '5 PM', transactions: 28, customers: 21 }
        ]
      }
    };

    // ========================================
    // DATA PROCESSING FUNCTIONS
    // ========================================

    // Calculate staff workload based on efficiency and customer volume
    const calculateStaffWorkload = (efficiencyScore, customersPerHour) => {
      if (efficiencyScore < 70) {
        return queueEfficiencyData.workloadStatuses.overworked;
      } else if (efficiencyScore >= 70 && efficiencyScore <= 90) {
        return queueEfficiencyData.workloadStatuses.optimal;
      } else if (efficiencyScore > 90 && customersPerHour < 12) {
        return queueEfficiencyData.workloadStatuses.underutilized;
      } else {
        return queueEfficiencyData.workloadStatuses.excellent;
      }
    };

    // Process weekly trend data with workload analysis
    const processedWeeklyData = queueEfficiencyData.weeklyTrend.map(dayData => {
      const workload = calculateStaffWorkload(dayData.efficiency, dayData.customersPerHour);
      
      return {
        ...dayData,
        workload: workload,
        suggestedStaff: workload.suggestedStaff,
        workloadIcon: workload.icon,
        workloadColor: workload.color
      };
    });

    // Calculate payment costs
    const totalSales = queueEfficiencyData.paymentAnalysis.totalTransactions * queueEfficiencyData.paymentAnalysis.averageSpend;
    const paymentCostAnalytics = {
      totalSales: totalSales,
      currentProviderCosts: (totalSales * queueEfficiencyData.paymentAnalysis.currentProviderRate) / 100,
      currentProviderRate: queueEfficiencyData.paymentAnalysis.currentProviderRate,
      tapidPayCosts: (totalSales * queueEfficiencyData.paymentAnalysis.tapidPayRate) / 100,
      tapidPayRate: queueEfficiencyData.paymentAnalysis.tapidPayRate,
      monthlySavings: (totalSales * queueEfficiencyData.paymentAnalysis.savingsRate) / 100,
      annualSavings: ((totalSales * queueEfficiencyData.paymentAnalysis.savingsRate) / 100) * 12,
      savingsPercentage: queueEfficiencyData.paymentAnalysis.savingsRate
    };

    // Current staff workload (overall)
    const currentStaffWorkload = calculateStaffWorkload(
      queueEfficiencyData.currentPerformance.efficiencyScore, 
      queueEfficiencyData.currentPerformance.customersPerHour
    );

    // ========================================
    // LEGACY DATA STRUCTURES (for other components)
    // ========================================
    
    // Generate mock customer analytics data
    const trendingItems = [
      { name: 'Coffee', sales: 245, change: +12 },
      { name: 'Sandwiches', sales: 189, change: +8 },
      { name: 'Pastries', sales: 156, change: -3 },
      { name: 'Salads', sales: 134, change: +15 },
      { name: 'Smoothies', sales: 98, change: +22 }
    ];

    const customerMetrics = {
      tapidUsers: 68, // Percentage of customers using Tapid
      newCustomers: 24,
      returningCustomers: 76,
      averageSpend: 23.45,
      totalTransactions: 1247,
      peakHour: '2:00 PM - 3:00 PM',
      totalRevenue: 29250.15,
      revenueGrowth: '+12.4%'
    };

    // KPI Cards for dashboard display (matching Insights page format)
    const summaryKPIs = [
      {
        title: 'Tapid Users',
        value: `${customerMetrics.tapidUsers}%`,
        change: '+5.2%',
        trend: 'up',
        period: 'vs last month',
        icon: <Users size={20} />,
        hasInfo: true
      },
      {
        title: 'Today\'s Transactions',
        value: customerMetrics.totalTransactions.toLocaleString(),
        change: '+18.3%',
        trend: 'up',
        period: 'vs yesterday',
        icon: <BarChart3 size={20} />
      },
      {
        title: 'Average Spend',
        value: `£${customerMetrics.averageSpend}`,
        change: '+7.8%',
        trend: 'up',
        period: 'vs last week',
        icon: <DollarSign size={20} />
      },
      {
        title: 'New vs Returning',
        value: `${customerMetrics.returningCustomers}%`,
        change: '+3.2%',
        trend: 'up',
        period: 'customers return',
        icon: <UserCheck size={20} />
      }
    ];

    const paymentMethods = [
      { method: 'Contactless', percentage: 45, color: '#008A9B' },
      { method: 'Chip & PIN', percentage: 28, color: '#00BD84' },
      { method: 'Mobile Pay', percentage: 20, color: '#67EF71' },
      { method: 'Cash', percentage: 7, color: '#E5E7EB' }
    ];

    // Get hourly data for the selected day from JSON structure
    const getHourlyDataForDay = (day) => {
      return queueEfficiencyData.dailyHourlyActivity[day] || queueEfficiencyData.dailyHourlyActivity.Monday;
    };

    const hourlyData = getHourlyDataForDay(selectedDay);

    // Queue Time Analytics - Using data from JSON structure
    const queueAnalytics = {
      averageServiceTime: queueEfficiencyData.currentPerformance.averageServiceTime,
      queueEfficiencyScore: queueEfficiencyData.currentPerformance.efficiencyScore,
      customersPerHour: queueEfficiencyData.currentPerformance.customersPerHour,
      busyThreshold: queueEfficiencyData.currentPerformance.busyThreshold,
      peakEfficiency: queueEfficiencyData.currentPerformance.peakEfficiency,
      improvementTip: queueEfficiencyData.currentPerformance.improvementTip,
      staffWorkload: currentStaffWorkload
    };

    // Use processed weekly data from JSON structure
    const queueTrendData = processedWeeklyData;

    setAnalyticsData({
      trendingItems,
      customerMetrics,
      paymentMethods,
      hourlyData,
      queueAnalytics,
      queueTrendData,
      paymentCostAnalytics,
      summaryKPIs,
      dailyHourlyActivity: queueEfficiencyData.dailyHourlyActivity,
      getHourlyDataForDay
    });
  };

  const handleConnectProvider = async (providerId) => {
    setIsConnecting(true);
    setConnectionStatus({ [providerId]: 'connecting' });
    setLoadingProgress(0);

    try {
      const terminal = POS_TERMINALS.find(t => t.id === providerId);
      if (!terminal) throw new Error('Terminal not found');

      // Simulate 3000ms connection with progress updates
      const totalTime = 3000;
      const intervals = 30; // Update every 100ms
      const increment = 100 / intervals;

      for (let i = 0; i <= intervals; i++) {
        await new Promise(resolve => setTimeout(resolve, totalTime / intervals));
        setLoadingProgress(Math.min(100, i * increment));
      }

      const newTerminal = {
        id: providerId,
        name: terminal.name,
        connectedAt: new Date().toISOString(),
        status: 'connected',
        lastSync: new Date().toISOString()
      };

      const updatedTerminals = [...connectedTerminals, newTerminal];
      setConnectedTerminals(updatedTerminals);
      localStorage.setItem('connectedTerminals', JSON.stringify(updatedTerminals));
      
      setConnectionStatus({ [providerId]: 'connected' });
      
      // Generate analytics data after successful connection
      generateAnalyticsData();
      setShowAnalytics(true);
    } catch (error) {
      setConnectionStatus({ [providerId]: 'error' });
      console.error('Connection failed:', error);
    } finally {
      setIsConnecting(false);
      setLoadingProgress(0);
    }
  };

  const handleDisconnectProvider = (providerId) => {
    const updatedTerminals = connectedTerminals.filter(t => t.id !== providerId);
    setConnectedTerminals(updatedTerminals);
    localStorage.setItem('connectedTerminals', JSON.stringify(updatedTerminals));
    setConnectionStatus({ [providerId]: 'disconnected' });
    
    // Hide analytics if no terminals connected
    if (updatedTerminals.length === 0) {
      setShowAnalytics(false);
      setAnalyticsData(null);
    }
  };

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
        return <Link2 size={16} color="#6b7280" />;
    }
  };

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
        return 'Connect';
    }
  };

  const isConnected = (providerId) => {
    return connectedTerminals.some(t => t.id === providerId);
  };

  const getConnectionStatus = (providerId) => {
    if (isConnected(providerId)) return 'connected';
    if (connectionStatus[providerId]) return connectionStatus[providerId];
    return 'available';
  };

  const handlePrevTerminals = () => {
    setCurrentTerminalIndex(prev => 
      prev === 0 ? Math.max(0, POS_TERMINALS.length - terminalsPerPage) : Math.max(0, prev - terminalsPerPage)
    );
  };

  const handleNextTerminals = () => {
    setCurrentTerminalIndex(prev => 
      prev + terminalsPerPage >= POS_TERMINALS.length ? 0 : prev + terminalsPerPage
    );
  };

  const getCurrentTerminals = () => {
    return POS_TERMINALS.slice(currentTerminalIndex, currentTerminalIndex + terminalsPerPage);
  };

  const handleConnectedClick = (terminalId) => {
    const connectedTerminal = connectedTerminals.find(t => t.id === terminalId);
    const terminalConfig = POS_TERMINALS.find(t => t.id === terminalId);
    
    if (connectedTerminal && terminalConfig) {
      setSelectedTerminal({
        ...connectedTerminal,
        ...terminalConfig
      });
      setShowConnectedModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowConnectedModal(false);
    setSelectedTerminal(null);
  };

  const canGoNext = currentTerminalIndex + terminalsPerPage < POS_TERMINALS.length;
  const canGoPrev = currentTerminalIndex > 0;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerInfo}>
            <h1 className={styles.title}>Connect POS Terminals</h1>
            <p className={styles.subtitle}>
              Connect your point-of-sale systems to sync transaction data and enhance your analytics
            </p>
          </div>
          <div className={styles.headerStats}>
            <div 
              className={`${styles.statCard} ${connectedTerminals.length > 0 ? styles.clickableStatCard : ''}`}
              onClick={() => {
                if (connectedTerminals.length === 1) {
                  // If only one terminal connected, open its modal
                  handleConnectedClick(connectedTerminals[0].id);
                }
                // Note: Multiple terminals will be handled through individual modals since we removed the connected section
              }}
            >
              <div className={styles.statIcon}>
                <Link2 size={20} />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statValue}>{connectedTerminals.length}</span>
                <span className={styles.statLabel}>Connected</span>
              </div>
            </div>
            <div 
              className={`${styles.statCard} ${styles.clickableStatCard}`}
              onClick={() => setShowAvailableModal(true)}
            >
              <div className={styles.statIcon}>
                <Activity size={20} />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statValue}>{POS_TERMINALS.length}</span>
                <span className={styles.statLabel}>Available</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Available Terminals Section - Only show when no terminals are connected */}
      {connectedTerminals.length === 0 && (
        <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Available Terminals</h2>
          <div className={styles.sectionControls}>
            <span className={styles.sectionCount}>
              {currentTerminalIndex + 1}-{Math.min(currentTerminalIndex + terminalsPerPage, POS_TERMINALS.length)} of {POS_TERMINALS.length}
            </span>
            <div className={styles.navigationArrows}>
              <button 
                className={styles.navButton}
                onClick={handlePrevTerminals}
                disabled={!canGoPrev}
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                className={styles.navButton}
                onClick={handleNextTerminals}
                disabled={!canGoNext}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
        <div className={styles.terminalsRow}>
          {getCurrentTerminals().map((terminal) => {
            const isTerminalConnected = isConnected(terminal.id);
            const status = getConnectionStatus(terminal.id);
            
            return (
              <div key={terminal.id} className={styles.terminalCard}>
                <div className={styles.terminalHeader}>
                  <div className={styles.terminalIcon} style={{ backgroundColor: terminal.color }}>
                    <terminal.icon size={24} color="white" />
                  </div>
                  <div className={styles.terminalInfo}>
                    <h3 className={styles.terminalName}>{terminal.name}</h3>
                    <p className={styles.terminalDescription}>{terminal.description}</p>
                  </div>
                  <div className={styles.terminalStatus}>
                    {status === 'connected' ? (
                      <button 
                        className={styles.connectedButton}
                        onClick={() => handleConnectedClick(terminal.id)}
                      >
                        <CheckCircle size={16} color="#10b981" />
                        <span className={styles.connectedText}>Connected</span>
                      </button>
                    ) : (
                      <>
                        {getStatusIcon(status)}
                        <span className={styles.statusText}>{getStatusText(status)}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className={styles.terminalActions}>
                  {terminal.status === 'available' && !isTerminalConnected && (
                    <button
                      className={styles.connectBtn}
                      onClick={() => handleConnectProvider(terminal.id)}
                      disabled={isConnecting}
                    >
                      {isConnecting && status === 'connecting' ? (
                        <>
                          <RefreshCw size={16} className={styles.spinning} />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <Link2 size={16} />
                          Connect
                        </>
                      )}
                    </button>
                  )}
                  
                  {terminal.status === 'coming_soon' && (
                    <button className={styles.comingSoonBtn} disabled>
                      <Clock size={16} />
                      Coming Soon
                    </button>
                  )}
                  
                  {isTerminalConnected && (
                    <button className={styles.manageBtn}>
                      <Settings size={16} />
                      Manage
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      )}



      {/* Customer Analytics Section */}
      {showAnalytics && analyticsData && (
        <div className={styles.analyticsSection}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTextContainer}>
              <h2 className={styles.sectionTitle}>Customer Analytics</h2>
              <span className={styles.sectionSubtitle}>Real-time insights from your connected POS</span>
            </div>
            <button 
              className={styles.analyticsToggleBtn}
              onClick={() => setIsAnalyticsExpanded(!isAnalyticsExpanded)}
              aria-label={isAnalyticsExpanded ? "Collapse analytics" : "Expand analytics"}
            >
              {isAnalyticsExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          </div>

          {isAnalyticsExpanded && (
            <>
              {/* KPI Cards - Updated to match Insights page */}
              <div className={styles.kpiGrid}>
                {analyticsData.summaryKPIs.map((kpi, index) => (
                  <div 
                    key={index} 
                    className={`${styles.kpiCard} ${kpi.hasInfo ? styles.clickableKpiCard : ''}`}
                    onClick={kpi.hasInfo ? () => setShowTapidUsersModal(true) : undefined}
                    style={kpi.hasInfo ? { cursor: 'pointer' } : {}}
                  >
                    <div className={styles.kpiContent}>
                      <div className={styles.kpiText}>
                        <div className={styles.kpiValue}>
                          {kpi.value}
                        </div>
                        <div className={styles.kpiTitle}>{kpi.title}</div>
                        <div className={styles.kpiTrend}>
                          {getTrendIcon(kpi.trend)}
                          <span className={styles.kpiChange}>{kpi.change}</span>
                          <span className={styles.kpiPeriod}>{kpi.period}</span>
                        </div>
                      </div>
                      <div className={styles.kpiIconWrapper}>
                        <div className={styles.kpiIcon}>{kpi.icon}</div>
                        {kpi.hasInfo && (
                          <div className={styles.kpiInfoIndicator}>
                            <Info size={12} />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Charts Grid */}
              <div className={styles.chartsGrid}>
            {/* Trending Items */}
            <div className={styles.chartCard}>
              <h3 className={styles.chartTitle}>Trending Items</h3>
              <div className={styles.trendingList}>
                {analyticsData.trendingItems.map((item, index) => (
                  <div key={index} className={styles.trendingItem}>
                    <div className={styles.trendingInfo}>
                      <span className={styles.trendingName}>{item.name}</span>
                      <span className={styles.trendingSales}>{item.sales} sales</span>
                    </div>
                    <span className={`${styles.trendingChange} ${item.change > 0 ? styles.positive : styles.negative}`}>
                      {item.change > 0 ? '+' : ''}{item.change}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Methods */}
            <div className={styles.chartCard}>
              <h3 className={styles.chartTitle}>Payment Methods</h3>
              <div className={styles.paymentChart}>
                {analyticsData.paymentMethods.map((method, index) => (
                  <div key={index} className={styles.paymentMethod}>
                    <div className={styles.paymentInfo}>
                      <div 
                        className={styles.paymentDot} 
                        style={{ backgroundColor: method.color }}
                      />
                      <span className={styles.paymentName}>{method.method}</span>
                    </div>
                    <span className={styles.paymentPercentage}>{method.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Queue Efficiency Summary Card */}
            <div 
              className={`${styles.chartCard} ${styles.clickableCard}`}
              onClick={() => setShowQueueModal(true)}
            >
              <div className={styles.queueChartTitleContainer}>
                <h3 className={styles.chartTitle}>Queue Efficiency</h3>
                <button 
                  className={styles.infoButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowQueueInfoModal(true);
                  }}
                  aria-label="Queue efficiency information"
                >
                  <Info size={16} />
                </button>
              </div>
              
              <div className={styles.queueSummaryCard}>
                <div className={styles.mainMetric}>
                  <span className={styles.metricValue}>{analyticsData.queueAnalytics.queueEfficiencyScore}%</span>
                  <span className={styles.metricLabel}>Efficiency Score</span>
                </div>
                
                <div className={styles.subMetrics}>
                  <div className={styles.subMetric}>
                    <span className={styles.subMetricValue}>{analyticsData.queueAnalytics.averageServiceTime}</span>
                    <span className={styles.subMetricLabel}>Avg Service</span>
                  </div>
                  <div className={styles.subMetric}>
                    <span className={styles.subMetricValue}>{analyticsData.queueAnalytics.customersPerHour}</span>
                    <span className={styles.subMetricLabel}>Customers/Hr</span>
                  </div>
                </div>
              </div>

              <div className={styles.viewDetailsPrompt}>
                <span>Click to view detailed analysis</span>
              </div>
            </div>

            {/* Hourly Transactions */}
            <div className={styles.chartCard}>
              <div className={styles.chartHeaderWithSubtitle}>
                <div className={styles.chartTitleContainer}>
                  <h3 className={styles.chartTitle}>Hourly Activity</h3>
                  <p className={styles.chartSubtitle}>Transaction volume throughout the day here we can see the busiest times of the day and the least busy times of the day.</p>
                </div>
                <select 
                  className={styles.daySelector}
                  value={selectedDay}
                  onChange={(e) => {
                    const newDay = e.target.value;
                    setSelectedDay(newDay);
                    // Update hourly data for the new selected day
                    const newHourlyData = analyticsData.getHourlyDataForDay(newDay);
                    setAnalyticsData(prev => ({
                      ...prev,
                      hourlyData: newHourlyData
                    }));
                  }}
                >
                  <option value="Monday">Monday</option>
                  <option value="Tuesday">Tuesday</option>
                  <option value="Wednesday">Wednesday</option>
                  <option value="Thursday">Thursday</option>
                  <option value="Friday">Friday</option>
                  <option value="Saturday">Saturday</option>
                  <option value="Sunday">Sunday</option>
                </select>
              </div>
              <div className={styles.areaChartContainer}>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={analyticsData.hourlyData}>
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
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      formatter={(value, name) => {
                        if (name === 'transactions') return [value, 'Transactions'];
                        return [value, name];
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="transactions" 
                      stroke="#008A9B" 
                      fill="url(#transactionGradient)"
                      strokeWidth={2}
                    />
                    <defs>
                      <linearGradient id="transactionGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#008A9B" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#008A9B" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Payment Provider Costs */}
            <div className={styles.chartCard}>
              <h3 className={styles.chartTitle}>Payment Provider Costs</h3>
              
              <div className={styles.costComparisonGrid}>
                <div className={styles.costProvider}>
                  <div className={styles.providerHeader}>
                    <span className={styles.providerName}>Current Provider</span>
                    <span className={styles.providerRate}>{analyticsData.paymentCostAnalytics.currentProviderRate}%</span>
                  </div>
                  <div className={styles.costAmount}>
                    £{analyticsData.paymentCostAnalytics.currentProviderCosts.toFixed(2)}
                  </div>
                  <div className={styles.costPeriod}>per month</div>
                </div>

                <div className={styles.costProvider}>
                  <div className={styles.providerHeader}>
                    <span className={styles.providerName}>TapidPay</span>
                    <span className={styles.providerRate}>{analyticsData.paymentCostAnalytics.tapidPayRate}%</span>
                  </div>
                  <div className={styles.costAmount}>
                    £{analyticsData.paymentCostAnalytics.tapidPayCosts.toFixed(2)}
                  </div>
                  <div className={styles.costPeriod}>per month</div>
                </div>
              </div>

              <div className={styles.savingsHighlight}>
                <div className={styles.savingsHeader}>
                  <span className={styles.savingsLabel}>Monthly Savings</span>
                  <span className={styles.savingsAmount}>£{analyticsData.paymentCostAnalytics.monthlySavings.toFixed(2)}</span>
                </div>
                <div className={styles.annualProjection}>
                  <span className={styles.projectionLabel}>Annual Savings:</span>
                  <span className={styles.projectionAmount}>£{analyticsData.paymentCostAnalytics.annualSavings.toFixed(2)}</span>
                </div>
              </div>

              <div className={styles.savingsInsight}>
                <span className={styles.insightLabel}>💰 Savings:</span>
                <span className={styles.insightText}>
                  Switch to TapidPay and save {analyticsData.paymentCostAnalytics.savingsPercentage}% on all transactions
                </span>
              </div>
            </div>
          </div>
            </>
          )}
        </div>
      )}

      {/* Integration Benefits Section */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Integration Benefits</h2>
        </div>
        <div className={styles.benefitsGrid}>
          <div className={styles.benefitCard}>
            <div className={styles.benefitIcon}>
              <BarChart3 size={24} />
            </div>
            <h3 className={styles.benefitTitle}>Enhanced Analytics</h3>
            <p className={styles.benefitDescription}>
              Get deeper insights into your sales patterns, customer behavior, and business performance
            </p>
          </div>
          
          <div className={styles.benefitCard}>
            <div className={styles.benefitIcon}>
              <Activity size={24} />
            </div>
            <h3 className={styles.benefitTitle}>Real-time Sync</h3>
            <p className={styles.benefitDescription}>
              Automatically sync transaction data in real-time for up-to-date reporting and insights
            </p>
          </div>
          
          <div className={styles.benefitCard}>
            <div className={styles.benefitIcon}>
              <Shield size={24} />
            </div>
            <h3 className={styles.benefitTitle}>Secure Integration</h3>
            <p className={styles.benefitDescription}>
              Bank-level security ensures your transaction data is protected and encrypted
            </p>
          </div>
          
          <div className={styles.benefitCard}>
            <div className={styles.benefitIcon}>
              <Wifi size={24} />
            </div>
            <h3 className={styles.benefitTitle}>Seamless Setup</h3>
            <p className={styles.benefitDescription}>
              Quick and easy setup process with guided integration steps
            </p>
          </div>
        </div>
      </div>

      {/* Connection Loading Overlay */}
      {isConnecting && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingContent}>
            <div className={styles.loadingSpinner} />
            <h3 className={styles.loadingTitle}>Connecting to POS Terminal</h3>
            <p className={styles.loadingDescription}>
              Establishing secure connection and fetching customer data...
            </p>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill} 
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
            <span className={styles.progressText}>{Math.round(loadingProgress)}%</span>
          </div>
        </div>
      )}

      {/* Connected Terminal Modal */}
      <ConnectedTerminalModal 
        isOpen={showConnectedModal}
        onClose={handleCloseModal}
        terminal={selectedTerminal}
        onDisconnect={handleDisconnectProvider}
      />

      {/* Available Terminals Modal */}
      <AvailableTerminalsModal 
        isOpen={showAvailableModal}
        onClose={() => setShowAvailableModal(false)}
        terminals={POS_TERMINALS}
        connectedTerminals={connectedTerminals}
        onConnect={handleConnectProvider}
        isConnecting={isConnecting}
        connectionStatus={connectionStatus}
        getStatusIcon={getStatusIcon}
        getStatusText={getStatusText}
      />

      {/* Queue Info Modal */}
      {showQueueInfoModal && (
        <div className={styles.modalOverlay} onClick={() => setShowQueueInfoModal(false)}>
          <div className={styles.queueInfoModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Queue Efficiency Explained</h3>
              <button 
                className={styles.modalCloseBtn}
                onClick={() => setShowQueueInfoModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className={styles.modalContent}>
              <div className={styles.explanationSection}>
                <h4>What is Queue Efficiency?</h4>
                <p>
                  Queue efficiency measures how well your business serves customers during busy periods. 
                  We track this by analyzing service times when you have high transaction volumes.
                </p>
              </div>

              <div className={styles.explanationSection}>
                <h4>How We Calculate It</h4>
                <div className={styles.calculationSteps}>
                  <div className={styles.step}>
                    <span className={styles.stepNumber}>1</span>
                    <span className={styles.stepText}>We identify "busy times" when you have 40+ transactions per hour</span>
                  </div>
                  <div className={styles.step}>
                    <span className={styles.stepNumber}>2</span>
                    <span className={styles.stepText}>We measure how long each customer takes to serve during these periods</span>
                  </div>
                  <div className={styles.step}>
                    <span className={styles.stepNumber}>3</span>
                    <span className={styles.stepText}>We calculate your "efficiency coefficient" - how many customers you can serve per hour</span>
                  </div>
                  <div className={styles.step}>
                    <span className={styles.stepNumber}>4</span>
                    <span className={styles.stepText}>This gives you a score from 0-100% showing how efficiently you handle busy periods</span>
                  </div>
                </div>
              </div>

              <div className={styles.explanationSection}>
                <h4>Why This Matters</h4>
                <ul className={styles.benefitsList}>
                  <li>Identify peak times when you need more staff</li>
                  <li>Reduce customer wait times and improve satisfaction</li>
                  <li>Optimize your operations for maximum efficiency</li>
                  <li>Increase revenue by serving more customers faster</li>
                </ul>
              </div>

              <div className={styles.exampleSection}>
                <h4>Example</h4>
                <div className={styles.exampleBox}>
                  <p>
                    <strong>82% Efficiency Score</strong> means you're serving customers efficiently during busy times. 
                    If your score drops below 70%, consider adding staff or streamlining your processes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Queue Efficiency Modal */}
      {showQueueModal && analyticsData && ReactDOM.createPortal(
        <div className={styles.modalOverlay} onClick={() => setShowQueueModal(false)}>
          <div className={styles.queueModalContent} onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className={styles.queueModalHeader}>
              <div className={styles.queueHeaderInfo}>
                <h2 className={styles.queueModalTitle}>Queue Efficiency Analysis</h2>
                <p className={styles.queueModalSubtitle}>
                  Detailed insights into your customer service efficiency and performance trends
                </p>
              </div>
              <button 
                className={styles.queueCloseBtn}
                onClick={() => setShowQueueModal(false)}
              >
                <X size={24} />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className={styles.queueModalBody}>
              {/* Current Performance Section */}
              <div className={styles.queueSection}>
                <h3 className={styles.queueSectionTitle}>Current Performance</h3>
                <div className={styles.queueMetricsGrid}>
                  <div className={styles.queueMetricCard}>
                    <div className={styles.queueMetricIcon}>📊</div>
                    <div className={styles.queueMetricInfo}>
                      <span className={styles.queueMetricLabel}>Efficiency Score</span>
                      <span className={styles.queueMetricValue}>{analyticsData.queueAnalytics.queueEfficiencyScore}%</span>
                    </div>
                  </div>
                  <div className={styles.queueMetricCard}>
                    <div className={styles.queueMetricIcon}>⏱️</div>
                    <div className={styles.queueMetricInfo}>
                      <span className={styles.queueMetricLabel}>Avg Service Time</span>
                      <span className={styles.queueMetricValue}>{analyticsData.queueAnalytics.averageServiceTime}</span>
                    </div>
                  </div>
                  <div className={styles.queueMetricCard}>
                    <div className={styles.queueMetricIcon}>👥</div>
                    <div className={styles.queueMetricInfo}>
                      <span className={styles.queueMetricLabel}>Customers/Hour</span>
                      <span className={styles.queueMetricValue}>{analyticsData.queueAnalytics.customersPerHour}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 7-Day Trend Chart */}
              <div className={styles.queueSection}>
                <h3 className={styles.queueSectionTitle}>7-Day Efficiency Trend</h3>
                <div className={styles.queueChartContainer}>
                  <div className={styles.rechartsWrapper}>
                    <ResponsiveContainer width="100%" height={320}>
                      <BarChart
                        data={analyticsData.queueTrendData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                        barCategoryGap="20%"
                      >
                        <CartesianGrid 
                          strokeDasharray="3 3" 
                          stroke="#f0f1f3"
                          vertical={false}
                        />
                        <XAxis 
                          dataKey="day" 
                          axisLine={false}
                          tickLine={false}
                          tick={{ 
                            fontSize: 12, 
                            fill: '#687787',
                            fontWeight: 500
                          }}
                        />
                        <YAxis 
                          axisLine={false}
                          tickLine={false}
                          tick={{ 
                            fontSize: 12, 
                            fill: '#687787',
                            fontWeight: 500
                          }}
                          domain={[0, 100]}
                          tickFormatter={(value) => `${value}%`}
                        />
                        <Tooltip 
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className={styles.customTooltip}>
                                  <div className={styles.tooltipHeader}>
                                    <span className={styles.tooltipDay}>{label}</span>
                                    <span className={styles.tooltipEfficiency}>{data.efficiency}%</span>
                                  </div>
                                  <div className={styles.tooltipContent}>
                                    <div className={styles.tooltipRow}>
                                      <span className={styles.tooltipLabel}>Service Time:</span>
                                      <span className={styles.tooltipValue}>{data.serviceTime} min</span>
                                    </div>
                                    <div className={styles.tooltipRow}>
                                      <span className={styles.tooltipLabel}>Customers/Hour:</span>
                                      <span className={styles.tooltipValue}>{data.customersPerHour}</span>
                                    </div>
                                    {data.workload && (
                                      <div className={styles.tooltipWorkload}>
                                        <span 
                                          className={styles.tooltipWorkloadIcon}
                                          style={{ color: data.workloadColor }}
                                        >
                                          {data.workloadIcon}
                                        </span>
                                        <span className={styles.tooltipWorkloadText}>
                                          {data.workload.level} - {data.suggestedStaff} staff
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar 
                          dataKey="efficiency" 
                          radius={[6, 6, 0, 0]}
                          fill="#8884d8"
                        >
                          {analyticsData.queueTrendData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.workloadColor || '#008A9B'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {/* Staff Workload Indicators */}
                  <div className={styles.staffIndicatorsGrid}>
                    {analyticsData.queueTrendData.map((day, index) => (
                      day.workload && (
                        <div key={index} className={styles.staffIndicatorCard}>
                          <div className={styles.staffDay}>{day.day}</div>
                          <div className={styles.staffWorkloadInfo}>
                            <span 
                              className={styles.staffWorkloadIcon}
                              style={{ color: day.workloadColor || '#6b7280' }}
                              title={day.workload.level || 'Unknown'}
                            >
                              {day.workloadIcon || '❓'}
                            </span>
                            <span className={styles.staffCount}>
                              {day.suggestedStaff || 2} staff
                            </span>
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              </div>

              {/* Performance Breakdown */}
              <div className={styles.queueSection}>
                <h3 className={styles.queueSectionTitle}>Performance Breakdown</h3>
                <div className={styles.performanceGrid}>
                  <div className={styles.performanceCard}>
                    <div className={styles.performanceIcon}>🏆</div>
                    <div className={styles.performanceInfo}>
                      <span className={styles.performanceLabel}>Best Day</span>
                      <span className={styles.performanceValue}>
                        {analyticsData.queueTrendData.reduce((best, day) => 
                          day.efficiency > best.efficiency ? day : best
                        ).day} ({analyticsData.queueTrendData.reduce((best, day) => 
                          day.efficiency > best.efficiency ? day : best
                        ).efficiency}%)
                      </span>
                    </div>
                  </div>
                  <div className={styles.performanceCard}>
                    <div className={styles.performanceIcon}>⚡</div>
                    <div className={styles.performanceInfo}>
                      <span className={styles.performanceLabel}>Fastest Service</span>
                      <span className={styles.performanceValue}>
                        {Math.min(...analyticsData.queueTrendData.map(d => d.serviceTime))} min
                      </span>
                    </div>
                  </div>
                  <div className={styles.performanceCard}>
                    <div className={styles.performanceIcon}>🚀</div>
                    <div className={styles.performanceInfo}>
                      <span className={styles.performanceLabel}>Peak Capacity</span>
                      <span className={styles.performanceValue}>
                        {Math.max(...analyticsData.queueTrendData.map(d => Math.round(60/d.serviceTime)))} customers/hour
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Staff Workload Analysis */}
              {analyticsData.queueAnalytics.staffWorkload && (
                <div className={styles.queueSection}>
                  <h3 className={styles.queueSectionTitle}>Staff Workload Analysis</h3>
                  <div className={styles.staffWorkloadCard}>
                    <div className={styles.workloadHeader}>
                      <div className={styles.workloadIcon} style={{ color: analyticsData.queueAnalytics.staffWorkload.color }}>
                        {analyticsData.queueAnalytics.staffWorkload.icon}
                      </div>
                      <div className={styles.workloadInfo}>
                        <span className={styles.workloadLevel} style={{ color: analyticsData.queueAnalytics.staffWorkload.color }}>
                          {analyticsData.queueAnalytics.staffWorkload.level}
                        </span>
                        <span className={styles.workloadDescription}>
                          {analyticsData.queueAnalytics.staffWorkload.description}
                        </span>
                      </div>
                    </div>
                    <div className={styles.workloadRecommendation}>
                      <span className={styles.recommendationLabel}>💼 Recommendation:</span>
                      <span className={styles.recommendationText}>
                        {analyticsData.queueAnalytics.staffWorkload.recommendation}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Key Insights */}
              <div className={styles.queueSection}>
                <h3 className={styles.queueSectionTitle}>Key Insights</h3>
                <div className={styles.queueInsightCard}>
                  <div className={styles.queueInsightIcon}>💡</div>
                  <div className={styles.queueInsightContent}>
                    <span className={styles.queueInsightText}>{analyticsData.queueAnalytics.improvementTip}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>, 
        document.body
      )}

      {/* Tapid Users Info Modal */}
      {showTapidUsersModal && ReactDOM.createPortal(
        <div className={styles.modalOverlay} onClick={() => setShowTapidUsersModal(false)}>
          <div className={styles.tapidUsersModalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.queueModalHeader}>
              <div className={styles.queueHeaderInfo}>
                <h2 className={styles.queueModalTitle}>Tapid Users Tracking</h2>
                <p className={styles.queueModalSubtitle}>Understanding your customer coverage</p>
              </div>
              <button 
                className={styles.queueCloseBtn}
                onClick={() => setShowTapidUsersModal(false)}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className={styles.queueModalBody}>
              {/* Explanation */}
              <div className={styles.explanationCard}>
                <p className={styles.explanationText}>
                  This is the number of users we can track through the Tapid platform. The missing users are those not using Tapid yet, creating data gaps in your analytics and insights.
                </p>
                <p className={styles.explanationText}>
                  More users means more quality and reliable data. The gold standard is a minimum of 75% coverage for comprehensive business insights.
                </p>
                
                {analyticsData.customerMetrics.tapidUsers < 75 && (
                  <button className={styles.primaryActionButton}>
                    Start Referral Program
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>, 
        document.body
      )}
    </div>
  );
};

export default ConnectPage; 