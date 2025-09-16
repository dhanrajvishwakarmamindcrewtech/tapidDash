import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import BusinessData from '../data/BusinessData.json';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const [data, setData] = useState(BusinessData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date().toISOString());

  // Data transformation utilities
  const formatCurrency = (value, currency = 'EUR') => {
    return new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency: currency
    }).format(value);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('en-IE').format(value);
  };

  const formatPercentage = (value) => {
    return `${value > 0 ? '+' : ''}${value}%`;
  };

  const calculateTrend = (changeValue) => {
    if (changeValue > 0) return 'up';
    if (changeValue < 0) return 'down';
    return 'stable';
  };


  const calculateQueueMetrics = (queueData) => {
    if (!queueData) return null;
    
    const weeklyTrend = queueData.weeklyTrend || [];
    const busyDays = weeklyTrend.filter(day => day.status === "overworked");
    const normalDays = weeklyTrend.filter(day => day.status === "optimal");
    const slowDays = weeklyTrend.filter(day => day.status === "underutilized");
    
    const avgBusyTime = busyDays.length > 0 ? 
      busyDays.reduce((sum, day) => sum + day.serviceTime, 0) / busyDays.length : 0;
    const avgNormalTime = normalDays.length > 0 ?
      normalDays.reduce((sum, day) => sum + day.serviceTime, 0) / normalDays.length : 0;
    const avgSlowTime = slowDays.length > 0 ?
      slowDays.reduce((sum, day) => sum + day.serviceTime, 0) / slowDays.length : 0;
    
    return {
      averageServiceTime: queueData.currentPerformance?.averageServiceTime || 0,
      busyTimeServiceTime: avgBusyTime,
      normalServiceTime: avgNormalTime,
      slowTimeServiceTime: avgSlowTime,
      efficiencyScore: queueData.currentPerformance?.efficiencyScore || 0,
      busyDays: busyDays.map(day => day.day),
      peakHour: queueData.currentPerformance?.peakHour || 12,
      customersPerHour: queueData.currentPerformance?.customersPerHour || 0
    };
  };

  const formatQueueInsight = (insight, connectData) => {
    if (insight.title?.includes('Queue times') && connectData?.queueEfficiency) {
      const queueMetrics = calculateQueueMetrics(connectData.queueEfficiency);
      return {
        ...insight,
        formattedDescription: `Average serve time: ${queueMetrics.averageServiceTime} min (${queueMetrics.busyTimeServiceTime.toFixed(1)} min during busy periods)`,
        queueMetrics: queueMetrics,
        details: {
          ...insight.details,
          realTimeData: {
            current: `${queueMetrics.averageServiceTime} min`,
            busy: `${queueMetrics.busyTimeServiceTime.toFixed(1)} min`,
            slow: `${queueMetrics.slowTimeServiceTime.toFixed(1)} min`,
            efficiency: `${queueMetrics.efficiencyScore}%`
          }
        }
      };
    }
    return insight;
  };

    const formatRelativeTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  const getIconForType = (type) => {
    const iconMap = {
      // KPI Icons
      'Active Customers': 'Users',
      'Total Customers': 'Users',
      'New vs Returning': 'UserCheck',
      'Avg Spend per Visit': 'DollarSign',
      'Customer Demographics': 'BarChart3',
      'Total Revenue': 'DollarSign',
      'Active Users': 'Users',
      'Total Points Collected': 'TrendingUp',
      'New Customers This Week': 'UserPlus',
      
      // Notification Types
      'success': 'CheckCircle',
      'warning': 'AlertCircle',
      'info': 'Info',
      'error': 'XCircle',
      
      // Activity Types
      'campaign': 'Rocket',
      'customer': 'Users',
      'reward': 'Gift',
      'insight': 'Lightbulb',
      
      // POS Terminals
      'sumup': 'CreditCard',
      'square': 'Smartphone',
      'clover': 'Store',
      'shopify': 'ShoppingCart',
      
      // Sections
      'Launch Pad': 'Rocket',
      'Boosters': 'Zap',
      'Insights': 'Lightbulb',
      'Reports': 'FileText',
      
      // Data Sources
      'POS System': 'Activity',
      'Customer Database': 'Users',
      'Loyalty Program': 'Gift'
    };
    
    return iconMap[type] || 'Circle';
  };

  const getColorForType = (type, value) => {
    const colorMap = {
      // Status colors
      'up': '#10b981',
      'down': '#ef4444',
      'stable': '#6b7280',
      
      // Section colors
      'Launch Pad': '#7950f2',
      'Boosters': '#f59e0b',
      'Insights': '#10b981',
      'Reports': '#3b82f6',
      
      // Notification colors
      'success': '#10b981',
      'warning': '#f59e0b',
      'info': '#3b82f6',
      'error': '#ef4444',
      
      // Payment method colors
      'Contactless': '#008A9B',
      'Chip & PIN': '#00BD84',
      'Mobile Pay': '#67EF71',
      'Cash': '#E5E7EB'
    };
    
    // Default KPI colors
    if (!colorMap[type]) {
      const defaultColors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
      return defaultColors[Math.abs(type.hashCode ? type.hashCode() : 0) % defaultColors.length];
    }
    
    return colorMap[type];
  };

  // Data fetching methods
  const fetchInsightsData = useCallback(async () => {
    try {
      setLoading(true);
      // In a real app, this would be an API call
      // const response = await fetch('/api/insights');
      // const data = await response.json();
      
      // For now, return transformed local data
      const insights = data.insights;
      
      // Transform KPIs with formatting
      const transformedKPIs = insights.kpis.map(kpi => ({
        ...kpi,
        formattedValue: kpi.title.includes('Spend') ? formatCurrency(kpi.value) : 
                       kpi.title.includes('%') || kpi.title.includes('Demographics') ? `${kpi.value}%` :
                       formatNumber(kpi.value),
        formattedChange: formatPercentage(kpi.changeValue),
        trend: calculateTrend(kpi.changeValue),
        icon: getIconForType(kpi.title),
        change: formatPercentage(kpi.changeValue),
        period: `vs last ${kpi.period}`
      }));

      // Transform customer segments
      const transformedSegments = insights.customerSegments.map(segment => ({
        ...segment,
        formattedAvgSpend: formatCurrency(segment.avgSpend),
        formattedGrowth: formatPercentage(segment.growthPercentage),
        trend: calculateTrend(segment.growthPercentage),
        visitFreq: `${segment.visitFreq}x`,
        icon: getIconForType(segment.segment),
        color: getColorForType(segment.segment),
        actionText: segment.segment === 'new' ? 'Send Welcome Campaign' :
                   segment.segment === 'regular' ? 'Boost Loyalty Campaign' :
                   segment.segment === 'vip' ? 'VIP Exclusive Offer' :
                   'Win-Back Campaign'
      }));

      // Transform smart insights with icons
      const transformedSmartInsights = insights.smartInsights.map(insight => ({
        ...insight,
        icon: insight.type === 'warning' ? 'Zap' :
              insight.type === 'opportunity' ? 'Crown' :
              insight.type === 'success' ? 'CheckCircle' :
              'Clock'
      }));

      return {
        ...insights,
        kpis: transformedKPIs,
        customerSegments: transformedSegments,
        customerStats: insights.customerStats,
        smartInsights: transformedSmartInsights
      };
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [data.insights]);

  const fetchHomeData = useCallback(async () => {
    try {
      setLoading(true);
      const homeData = data.home;
      
      // Transform summary KPIs
      const transformedKPIs = homeData.summaryKPIs.map(kpi => ({
        ...kpi,
        formattedValue: kpi.title.includes('Revenue') ? formatCurrency(kpi.value) :
                       formatNumber(kpi.value),
        formattedChange: formatPercentage(kpi.changePercentage),
        trend: calculateTrend(kpi.changePercentage),
        icon: getIconForType(kpi.title),
        color: getColorForType('up') // Default to positive color
      }));

      // Transform section summaries
      const transformedSections = homeData.sectionSummaries.map(section => ({
        ...section,
        formattedPerformance: formatPercentage(section.stats.performancePercentage),
        icon: getIconForType(section.title),
        color: getColorForType(section.title),
        action: `View ${section.title}`
      }));

      // Transform recent activity
      const transformedActivity = homeData.recentActivity.map(activity => ({
        ...activity,
        time: formatRelativeTime(activity.timestamp),
        icon: getIconForType(activity.type),
        color: getColorForType(activity.type)
      }));

      // Transform notifications
      const transformedNotifications = homeData.notifications.map(notification => ({
        ...notification,
        time: formatRelativeTime(notification.timestamp),
        icon: getIconForType(notification.type)
      }));

      // Transform leaderboard
      const transformedLeaderboard = homeData.leaderboard.map(customer => ({
        ...customer,
        formattedSpend: formatCurrency(customer.spend)
      }));

      // Transform revenue insights
      const transformedRevenueInsights = homeData.revenueInsights.map(insight => ({
        ...insight,
        formattedValue: insight.label.includes('Revenue') || insight.label.includes('Value') ? 
                       formatCurrency(insight.value) : 
                       insight.label.includes('Rate') || insight.label.includes('Orders') ? 
                       `${insight.value}%` : 
                       formatNumber(insight.value),
        formattedChange: formatPercentage(insight.changePercentage),
        trend: calculateTrend(insight.changePercentage)
      }));

      return {
        ...homeData,
        summaryKPIs: transformedKPIs,
        sectionSummaries: transformedSections,
        recentActivity: transformedActivity,
        notifications: transformedNotifications,
        leaderboard: transformedLeaderboard,
        revenueInsights: transformedRevenueInsights
      };
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [data.home]);

  const fetchConnectData = useCallback(async () => {
    try {
      setLoading(true);
      const connectData = data.connect;
      
      // Transform POS terminals
      const transformedTerminals = connectData.posTerminals.map(terminal => ({
        ...terminal,
        icon: getIconForType(terminal.id),
        color: getColorForType(terminal.status)
      }));

      // Transform analytics KPIs
      const transformedKPIs = connectData.analyticsKPIs.map(kpi => ({
        ...kpi,
        formattedValue: kpi.title.includes('Spend') ? formatCurrency(kpi.value) :
                       kpi.title.includes('%') || kpi.title.includes('Users') || kpi.title.includes('Returning') ? 
                       `${kpi.value}%` :
                       formatNumber(kpi.value),
        formattedChange: formatPercentage(kpi.changePercentage),
        trend: calculateTrend(kpi.changePercentage),
        icon: getIconForType(kpi.title),
        hasInfo: kpi.title === 'Tapid Users'
      }));

      // Transform trending items
      const transformedTrendingItems = connectData.trendingItems.map(item => ({
        ...item,
        change: item.changePercentage,
        trend: calculateTrend(item.changePercentage)
      }));

      // Transform payment methods with colors
      const transformedPaymentMethods = connectData.paymentMethods.map(method => ({
        ...method,
        color: getColorForType(method.method)
      }));

      return {
        ...connectData,
        posTerminals: transformedTerminals,
        analyticsKPIs: transformedKPIs,
        trendingItems: transformedTrendingItems,
        paymentMethods: transformedPaymentMethods
      };
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [data.connect]);

  const fetchControlCenterData = useCallback(async () => {
    try {
      setLoading(true);
      const controlData = data.controlCenter;
      
      // Transform KPIs
      const transformedKPIs = controlData.kpis.map(kpi => ({
        ...kpi,
        formattedValue: kpi.title.includes('Spend') ? formatCurrency(kpi.value) :
                       kpi.title.includes('Rate') ? `${kpi.value}%` :
                       formatNumber(kpi.value),
        icon: getIconForType(kpi.title)
      }));

      // Transform performance metrics
      const transformedMetrics = controlData.performanceMetrics.map(metric => ({
        ...metric,
        formattedValue: metric.title.includes('Points') || metric.title.includes('Earners') || 
                       metric.title.includes('Rewards') ? formatNumber(metric.value) :
                       metric.title.includes('Rate') || metric.title.includes('Funnel') ? 
                       `${metric.value}%` :
                       metric.title.includes('Timing') ? `${metric.value}d` :
                       metric.value.toString(),
        formattedChange: metric.changePercentage ? formatPercentage(metric.changePercentage) : null,
        trend: metric.changePercentage ? calculateTrend(metric.changePercentage) : null
      }));

      return {
        ...controlData,
        kpis: transformedKPIs,
        performanceMetrics: transformedMetrics
      };
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [data.controlCenter]);

  const fetchReportsData = useCallback(async () => {
    try {
      setLoading(true);
      const reportsData = data.reports;
      
      // Transform overview metrics
      const transformedMetrics = reportsData.overviewMetrics.map(metric => ({
        ...metric,
        formattedValue: metric.title.includes('Revenue') ? formatCurrency(metric.value) :
                       metric.title.includes('Metrics') ? `${metric.value}%` :
                       formatNumber(metric.value),
        formattedChange: formatPercentage(metric.changePercentage),
        trend: calculateTrend(metric.changePercentage),
        icon: getIconForType(metric.reportType)
      }));

      // Add icons to data scope options
      const transformedDataScope = reportsData.dataScopeOptions.map(option => ({
        ...option,
        icon: option.key === 'campaignOverview' ? '📈' :
              option.key === 'boosterPerformance' ? '🛠' :
              option.key === 'customerSegments' ? '👥' :
              option.key === 'averageSpend' ? '💰' :
              option.key === 'redemptionFunnel' ? '📊' :
              '📍'
      }));

      return {
        ...reportsData,
        overviewMetrics: transformedMetrics,
        dataScopeOptions: transformedDataScope
      };
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [data.reports]);

  const fetchReferralData = useCallback(async () => {
    try {
      setLoading(true);
      const referralData = data.referral;
      
      // Transform metrics
      const transformedMetrics = referralData.metrics.map(metric => ({
        ...metric,
        formattedValue: metric.title.includes('Money') ? formatCurrency(metric.value) :
                       metric.title.includes('Points') ? `${formatNumber(metric.value)} pts` :
                       formatNumber(metric.value),
        formattedChange: metric.changeThisMonth ? `+${metric.changeThisMonth} this month` :
                        metric.pointsPerReferral ? `${metric.pointsPerReferral} pts per referral` :
                        metric.earningsPerPerson ? `€${metric.earningsPerPerson} per person × ${metric.totalPeople} people` :
                        '',
        icon: getIconForType(metric.title.includes('Referrals') ? 'Users' :
                           metric.title.includes('Referrers') ? 'UserPlus' :
                           metric.title.includes('Points') ? 'Gift' :
                           'DollarSign'),
        color: getColorForType('up')
      }));

      return {
        ...referralData,
        metrics: transformedMetrics
      };
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [data.referral]);

  const fetchBoostersData = useCallback(async () => {
    try {
      setLoading(true);
      const boostersData = data.boosters;
      
      // Transform flash boosters
      const transformedFlash = boostersData.flash.map(booster => ({
        ...booster,
        start: booster.startDate,
        end: booster.endDate,
        multiplier: booster.multiplier.toString()
      }));

      // Transform recurring boosters  
      const transformedRecurring = boostersData.recurring.map(booster => ({
        ...booster,
        time: `${booster.startTime}-${booster.endTime}`,
        bonus: booster.bonus.toString(),
        threshold: booster.threshold.toString()
      }));

      return {
        ...boostersData,
        flash: transformedFlash,
        recurring: transformedRecurring
      };
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [data.boosters]);

  // Customer stats method
  const getCustomerStats = useCallback(() => {
    return data.insights?.customerStats || {
      total: 0,
      active: 0,
      new: 0,
      atRisk: 0,
      vip: 0,
      avgSpend: 0,
      totalSpend: 0,
      avgVisitFrequency: 0,
      retentionRate: 0
    };
  }, [data.insights]);

  // Insights specific methods
  const loadInsights = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // In a real app, this would load fresh insights data
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setLastUpdated(new Date().toISOString());
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const exportInsights = useCallback(() => {
    try {
      const insightsData = data.insights;
      const exportData = {
        customers: insightsData.customers,
        analytics: insightsData.analytics,
        kpis: insightsData.kpis,
        customerSegments: insightsData.customerSegments,
        customerStats: insightsData.customerStats,
        exportedAt: new Date().toISOString()
      };
      
      return exportData;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, [data.insights]);

  // Generic data refresh method
  const refreshData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // In a real app, this would fetch fresh data from APIs
      // For now, we'll simulate a refresh
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setLastUpdated(new Date().toISOString());
      setData(BusinessData); // Reload from file
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize data on mount
  useEffect(() => {
    setData(BusinessData);
    setLastUpdated(new Date().toISOString());
  }, []);

  const value = {
    // Raw data access
    data,
    loading,
    error,
    lastUpdated,
    
    // Data fetching methods
    fetchInsightsData,
    fetchHomeData,
    fetchConnectData,
    fetchControlCenterData,
    fetchReportsData,
    fetchReferralData,
    fetchBoostersData,
    refreshData,
    loadInsights,
    exportInsights,
    
    // Utility methods
    formatCurrency,
    formatNumber,
    formatPercentage,
    calculateTrend,
    formatRelativeTime,
    getIconForType,
    getColorForType,
    getCustomerStats,
    calculateQueueMetrics,
    formatQueueInsight
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export default DataContext; 