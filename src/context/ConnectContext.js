import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import ConnectData from "../data/ConnectData.json";

// Import icon components for dynamic rendering
import {
  CreditCard,
  Smartphone,
  Store,
  ShoppingCart,
  Zap,
  Diamond,
  BarChart3,
  CheckCircle,
  AlertTriangle,
  Award,
  Info,
  Users,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Clock,
  Settings,
  ExternalLink,
  Plus,
  X,
  Wifi,
  Shield,
  Activity,
  Link2,
  UserCheck,
} from "lucide-react";

// Create the context
const ConnectContext = createContext();

// Icon mapping for dynamic rendering
const ICON_MAP = {
  CreditCard: CreditCard,
  Smartphone: Smartphone,
  Store: Store,
  ShoppingCart: ShoppingCart,
  Zap: Zap,
  Diamond: Diamond,
  BarChart3: BarChart3,
  CheckCircle: CheckCircle,
  AlertTriangle: AlertTriangle,
  Award: Award,
  Info: Info,
  Users: Users,
  DollarSign: DollarSign,
  TrendingUp: TrendingUp,
  ArrowUpRight: ArrowUpRight,
  ArrowDownRight: ArrowDownRight,
  RefreshCw: RefreshCw,
  Clock: Clock,
  Settings: Settings,
  ExternalLink: ExternalLink,
  Plus: Plus,
  X: X,
  Wifi: Wifi,
  Shield: Shield,
  Activity: Activity,
  Link2: Link2,
  UserCheck: UserCheck,
};

// Provider component
export const ConnectProvider = ({ children }) => {
  // State management
  const [data, setData] = useState(ConnectData);
  const [connectedTerminals, setConnectedTerminals] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState({});
  const [isConnecting, setIsConnecting] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [selectedTerminal, setSelectedTerminal] = useState(null);
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date().toISOString());

  // Load connected terminals from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("connectedTerminals");
    if (saved) {
      try {
        const terminals = JSON.parse(saved);
        setConnectedTerminals(terminals);
        if (terminals.length > 0) {
          setShowAnalytics(true);
          // generateAnalyticsData will be called in a separate useEffect
        }
      } catch (error) {
        console.error("Failed to load connected terminals:", error);
      }
    }
  }, []);

  // ========================================
  // UTILITY FUNCTIONS
  // ========================================

  // Format currency values
  const formatCurrency = useCallback((amount, currency = "GBP") => {
    try {
      return new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: currency,
      }).format(amount);
    } catch (error) {
      return `£${amount.toFixed(2)}`;
    }
  }, []);

  // Format numbers with commas
  const formatNumber = useCallback((num) => {
    try {
      return new Intl.NumberFormat("en-US").format(num);
    } catch (error) {
      return num.toString();
    }
  }, []);

  // Format percentage values
  const formatPercentage = useCallback((num, showSign = true) => {
    const sign = showSign && num > 0 ? "+" : "";
    return `${sign}${num}%`;
  }, []);

  // Calculate trend direction
  const calculateTrend = useCallback((value) => {
    if (value > 0) return "up";
    if (value < 0) return "down";
    return "stable";
  }, []);

  // Get icon component by name
  const getIconComponent = useCallback(
    (iconName, size = 20, className = "") => {
      const IconComponent = ICON_MAP[iconName] || Info;
      return React.createElement(IconComponent, { size, className });
    },
    []
  );

  // Get trend icon
  const getTrendIcon = useCallback((trend, size = 16) => {
    switch (trend) {
      case "up":
        return <ArrowUpRight size={size} style={{ color: "#10b981" }} />;
      case "down":
        return <ArrowDownRight size={size} style={{ color: "#ef4444" }} />;
      default:
        return null;
    }
  }, []);

  // ========================================
  // BUSINESS LOGIC FUNCTIONS
  // ========================================

  // Calculate staff workload based on efficiency and volume
  const calculateStaffWorkload = useCallback(
    (efficiencyScore, customersPerHour) => {
      const { workloadStatuses } = data.queueEfficiency;

      if (efficiencyScore < 70) {
        return workloadStatuses.overworked;
      } else if (efficiencyScore >= 70 && efficiencyScore <= 90) {
        return workloadStatuses.optimal;
      } else if (efficiencyScore > 90 && customersPerHour < 12) {
        return workloadStatuses.underutilized;
      } else {
        return workloadStatuses.excellent;
      }
    },
    [data.queueEfficiency]
  );

  // Calculate payment cost analytics
  const calculatePaymentCosts = useCallback(() => {
    const { paymentAnalysis } = data.queueEfficiency;
    const totalSales =
      paymentAnalysis.totalTransactions * paymentAnalysis.averageSpend;

    return {
      totalSales,
      currentProviderCosts:
        (totalSales * paymentAnalysis.currentProviderRate) / 100,
      currentProviderRate: paymentAnalysis.currentProviderRate,
      tapidPayCosts: (totalSales * paymentAnalysis.tapidPayRate) / 100,
      tapidPayRate: paymentAnalysis.tapidPayRate,
      monthlySavings: (totalSales * paymentAnalysis.savingsRate) / 100,
      annualSavings: ((totalSales * paymentAnalysis.savingsRate) / 100) * 12,
      savingsPercentage: paymentAnalysis.savingsRate,
    };
  }, [data.queueEfficiency]);

  // Process weekly trend data with workload analysis
  const processWeeklyTrendData = useCallback(() => {
    return data.queueEfficiency.weeklyTrend.map((dayData) => {
      const workload = calculateStaffWorkload(
        dayData.efficiency,
        dayData.customersPerHour
      );

      return {
        ...dayData,
        workload,
        suggestedStaff: workload.suggestedStaff,
        workloadIcon: workload.iconName,
        workloadColor: workload.color,
        formattedServiceTime: `${dayData.serviceTime}min`,
        efficiencyDisplay: `${dayData.efficiency}%`,
      };
    });
  }, [data.queueEfficiency, calculateStaffWorkload]);

  // ========================================
  // DATA TRANSFORMATION FUNCTIONS
  // ========================================

  // Transform POS terminals data for UI
  const getTransformedTerminals = useCallback(() => {
    const availableTerminals = data.posTerminals.available.map((terminal) => ({
      ...terminal,
      icon: getIconComponent(terminal.iconName),
      status: "available",
      isConnected: connectedTerminals.some((ct) => ct.id === terminal.id),
      connectionStatus: connectionStatus[terminal.id] || "disconnected",
    }));

    const comingSoonTerminals = data.posTerminals.comingSoon.map(
      (terminal) => ({
        ...terminal,
        icon: getIconComponent(terminal.iconName),
        status: "coming_soon",
        isConnected: false,
        connectionStatus: "coming_soon",
      })
    );

    return {
      available: availableTerminals,
      comingSoon: comingSoonTerminals,
      all: [...availableTerminals, ...comingSoonTerminals],
    };
  }, [
    data.posTerminals,
    connectedTerminals,
    connectionStatus,
    getIconComponent,
  ]);

  // Transform KPIs data for UI
  const getTransformedKPIs = useCallback(() => {
    return data.kpis.map((kpi) => {
      let formattedValue;

      switch (kpi.valueType) {
        case "currency":
          formattedValue = formatCurrency(kpi.value);
          break;
        case "percentage":
          formattedValue = `${kpi.value}%`;
          break;
        case "number":
          formattedValue = formatNumber(kpi.value);
          break;
        default:
          formattedValue = kpi.value.toString();
      }

      const trend = calculateTrend(kpi.changeValue);
      const formattedChange = formatPercentage(kpi.changeValue);
      const periodText = kpi.description || `vs last ${kpi.period}`;

      return {
        ...kpi,
        formattedValue,
        formattedChange,
        trend,
        trendIcon: getTrendIcon(trend),
        periodText,
        icon: getIconComponent(getKPIIcon(kpi.id)),
      };
    });
  }, [
    data.kpis,
    formatCurrency,
    formatNumber,
    formatPercentage,
    calculateTrend,
    getTrendIcon,
    getIconComponent,
  ]);

  // Get appropriate icon for KPI type
  const getKPIIcon = useCallback((kpiId) => {
    const iconMap = {
      tapid_users: "Users",
      daily_transactions: "BarChart3",
      average_spend: "DollarSign",
      customer_retention: "UserCheck",
    };
    return iconMap[kpiId] || "Activity";
  }, []);

  // Transform trending items with formatted data
  const getTransformedTrendingItems = useCallback(() => {
    return data.trendingItems.map((item) => ({
      ...item,
      formattedSales: formatNumber(item.sales),
      formattedChange: formatPercentage(item.changeValue),
      trend: calculateTrend(item.changeValue),
      trendIcon: getTrendIcon(calculateTrend(item.changeValue)),
    }));
  }, [
    data.trendingItems,
    formatNumber,
    formatPercentage,
    calculateTrend,
    getTrendIcon,
  ]);

  // Get hourly data for selected day
  const getHourlyDataForDay = useCallback(
    (day) => {
      return (
        data.queueEfficiency.dailyHourlyActivity[day] ||
        data.queueEfficiency.dailyHourlyActivity.Monday
      );
    },
    [data.queueEfficiency]
  );

  // Transform queue analytics data
  const getQueueAnalytics = useCallback(() => {
    const { currentPerformance } = data.queueEfficiency;
    const staffWorkload = calculateStaffWorkload(
      currentPerformance.efficiencyScore,
      currentPerformance.customersPerHour
    );

    return {
      averageServiceTime: currentPerformance.averageServiceTime,
      formattedServiceTime: `${currentPerformance.averageServiceTime}min`,
      queueEfficiencyScore: currentPerformance.efficiencyScore,
      formattedEfficiency: `${currentPerformance.efficiencyScore}%`,
      customersPerHour: currentPerformance.customersPerHour,
      formattedCustomersPerHour: `${currentPerformance.customersPerHour}/hr`,
      busyThreshold: currentPerformance.busyThreshold,
      peakEfficiency: currentPerformance.peakEfficiency,
      improvementTip: currentPerformance.improvementTip,
      staffWorkload,
    };
  }, [data.queueEfficiency, calculateStaffWorkload]);

  // ========================================
  // CONNECTION MANAGEMENT
  // ========================================

  // Connect to a POS terminal
  const connectTerminal = useCallback(
    async (providerId) => {
      setIsConnecting(true);
      setConnectionStatus((prev) => ({ ...prev, [providerId]: "connecting" }));
      setLoadingProgress(0);
      setError(null);

      try {
        const terminal = data.posTerminals.available.find(
          (t) => t.id === providerId
        );
        if (!terminal) throw new Error("Terminal not found");

        // Simulate connection process with progress
        const totalTime = data.connectionSettings.connectionTimeout;
        const intervals = 30;
        const increment = 100 / intervals;

        for (let i = 0; i <= intervals; i++) {
          await new Promise((resolve) =>
            setTimeout(resolve, totalTime / intervals)
          );
          setLoadingProgress(Math.min(100, i * increment));
        }

        const newTerminal = {
          id: providerId,
          name: terminal.name,
          connectedAt: new Date().toISOString(),
          status: "connected",
          lastSync: new Date().toISOString(),
        };

        const updatedTerminals = [...connectedTerminals, newTerminal];
        setConnectedTerminals(updatedTerminals);
        localStorage.setItem(
          "connectedTerminals",
          JSON.stringify(updatedTerminals)
        );

        setConnectionStatus((prev) => ({ ...prev, [providerId]: "connected" }));
        setShowAnalytics(true);
        generateAnalyticsData();

        return { success: true, terminal: newTerminal };
      } catch (error) {
        setConnectionStatus((prev) => ({ ...prev, [providerId]: "error" }));
        setError(error.message);
        return { success: false, error: error.message };
      } finally {
        setIsConnecting(false);
        setLoadingProgress(0);
      }
    },
    [data.posTerminals, data.connectionSettings, connectedTerminals]
  );

  // Disconnect from a POS terminal
  const disconnectTerminal = useCallback(
    (providerId) => {
      const updatedTerminals = connectedTerminals.filter(
        (t) => t.id !== providerId
      );
      setConnectedTerminals(updatedTerminals);
      localStorage.setItem(
        "connectedTerminals",
        JSON.stringify(updatedTerminals)
      );
      setConnectionStatus((prev) => ({
        ...prev,
        [providerId]: "disconnected",
      }));

      // Hide analytics if no terminals connected
      if (updatedTerminals.length === 0) {
        setShowAnalytics(false);
        setAnalyticsData(null);
      }

      return { success: true };
    },
    [connectedTerminals]
  );

  // Generate analytics data (simulated)
  const generateAnalyticsData = useCallback(() => {
    setLoading(true);

    try {
      const processedWeeklyData = processWeeklyTrendData();
      const paymentCostAnalytics = calculatePaymentCosts();
      const queueAnalytics = getQueueAnalytics();
      const hourlyData = getHourlyDataForDay(selectedDay);

      const analytics = {
        trendingItems: getTransformedTrendingItems(),
        customerMetrics: data.customerMetrics,
        paymentMethods: data.paymentMethods,
        hourlyData,
        queueAnalytics,
        queueTrendData: processedWeeklyData,
        paymentCostAnalytics,
        summaryKPIs: getTransformedKPIs(),
        dailyHourlyActivity: data.queueEfficiency.dailyHourlyActivity,
        getHourlyDataForDay,
      };

      setAnalyticsData(analytics);
      setLastUpdated(new Date().toISOString());
    } catch (error) {
      setError(error.message);
      console.error("Failed to generate analytics:", error);
    } finally {
      setLoading(false);
    }
  }, [
    processWeeklyTrendData,
    calculatePaymentCosts,
    getQueueAnalytics,
    getHourlyDataForDay,
    selectedDay,
    getTransformedTrendingItems,
    data.customerMetrics,
    data.paymentMethods,
    getTransformedKPIs,
    data.queueEfficiency,
  ]);

  // Generate analytics when connected terminals change
  useEffect(() => {
    if (connectedTerminals.length > 0 && showAnalytics) {
      generateAnalyticsData();
    }
  }, [connectedTerminals.length, showAnalytics, generateAnalyticsData]);

  // Refresh data
  const refreshData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // In a real app, this would fetch fresh data from APIs
      await new Promise((resolve) => setTimeout(resolve, 1000));

      generateAnalyticsData();
      setLastUpdated(new Date().toISOString());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [generateAnalyticsData]);

  // Export connect data
  const exportConnectData = useCallback(() => {
    try {
      const exportData = {
        exportedAt: new Date().toISOString(),
        connectedTerminals,
        analyticsData,
        connectionStatus,
        selectedDay,
        lastUpdated,
      };

      return exportData;
    } catch (error) {
      setError(error.message);
      return null;
    }
  }, [
    connectedTerminals,
    analyticsData,
    connectionStatus,
    selectedDay,
    lastUpdated,
  ]);

  // ========================================
  // CONTEXT VALUE
  // ========================================

  const value = useMemo(
    () => ({
      // Data
      data,
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
      calculateTrend,
      getIconComponent,
      getTrendIcon,

      // Business logic
      calculateStaffWorkload,
      calculatePaymentCosts,

      // Data transformations
      getTransformedTerminals,
      getTransformedKPIs,
      getTransformedTrendingItems,
      getHourlyDataForDay,
      getQueueAnalytics,
      processWeeklyTrendData,

      // Connection management
      connectTerminal,
      disconnectTerminal,
      refreshData,

      // Analytics
      generateAnalyticsData,
      exportConnectData,

      // Configuration
      connectionSettings: data.connectionSettings,
      notifications: data.notifications,
    }),
    [
      data,
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
      formatCurrency,
      formatNumber,
      formatPercentage,
      calculateTrend,
      getIconComponent,
      getTrendIcon,
      calculateStaffWorkload,
      calculatePaymentCosts,
      getTransformedTerminals,
      getTransformedKPIs,
      getTransformedTrendingItems,
      getHourlyDataForDay,
      getQueueAnalytics,
      processWeeklyTrendData,
      connectTerminal,
      disconnectTerminal,
      refreshData,
      generateAnalyticsData,
      exportConnectData,
    ]
  );

  return (
    <ConnectContext.Provider value={value}>{children}</ConnectContext.Provider>
  );
};

// Custom hook to use the context
export const useConnect = () => {
  const context = useContext(ConnectContext);
  if (!context) {
    throw new Error("useConnect must be used within a ConnectProvider");
  }
  return context;
};

export default ConnectContext;
