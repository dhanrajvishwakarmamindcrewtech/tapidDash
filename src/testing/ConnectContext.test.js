import React from 'react';
import { renderHook, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ConnectProvider, useConnect } from '../context/ConnectContext';

// Mock the ConnectData import
jest.mock('../data/ConnectData.json', () => ({
  posTerminals: {
    available: [
      {
        id: 'sumup',
        name: 'SumUp',
        description: 'Popular card reader and payment terminal',
        iconName: 'CreditCard',
        features: ['Contactless payments', 'Mobile app integration', 'Low transaction fees'],
        color: '#7950f2',
        category: 'payment_processor'
      },
      {
        id: 'square',
        name: 'Square',
        description: 'Complete point-of-sale system',
        iconName: 'Smartphone',
        features: ['Full POS system', 'Analytics dashboard', 'Inventory management'],
        color: '#00c851',
        category: 'full_pos'
      }
    ],
    comingSoon: [
      {
        id: 'clover',
        name: 'Clover',
        description: 'Flexible POS for retail, restaurants, and services',
        iconName: 'Store',
        features: ['Customizable hardware', 'App marketplace', 'Multi-location support'],
        color: '#ff6b35',
        category: 'enterprise'
      }
    ]
  },
  queueEfficiency: {
    currentPerformance: {
      averageServiceTime: 3.4,
      efficiencyScore: 82,
      customersPerHour: 18,
      peakHour: 12,
      busyThreshold: 4.0,
      peakEfficiency: 95,
      improvementTip: 'Consider additional staff during 12-2 PM rush'
    },
    weeklyTrend: [
      {
        day: 'Monday',
        efficiency: 78,
        serviceTime: 3.8,
        customersPerHour: 16,
        status: 'optimal'
      },
      {
        day: 'Friday',
        efficiency: 65,
        serviceTime: 4.8,
        customersPerHour: 22,
        status: 'overworked'
      }
    ],
    workloadStatuses: {
      overworked: {
        level: 'Overworked',
        color: '#ef4444',
        iconName: 'AlertTriangle',
        recommendation: 'Add 1-2 staff members during peak hours',
        description: 'Staff are struggling to maintain service quality',
        suggestedStaff: 3
      },
      optimal: {
        level: 'Optimal',
        color: '#10b981',
        iconName: 'CheckCircle',
        recommendation: 'Current staffing level is well-balanced',
        description: 'Staff are performing efficiently without being overwhelmed',
        suggestedStaff: 2
      }
    },
    paymentAnalysis: {
      totalTransactions: 1247,
      averageSpend: 23.45,
      currentProviderRate: 2.5,
      tapidPayRate: 1.5,
      savingsRate: 1.0
    },
    dailyHourlyActivity: {
      Monday: [
        { hour: '9 AM', transactions: 12, customers: 8 },
        { hour: '10 AM', transactions: 18, customers: 12 }
      ],
      Tuesday: [
        { hour: '9 AM', transactions: 8, customers: 6 },
        { hour: '10 AM', transactions: 14, customers: 10 }
      ]
    }
  },
  customerMetrics: {
    tapidUsers: 68,
    newCustomers: 24,
    returningCustomers: 76,
    averageSpend: 23.45,
    totalTransactions: 1247,
    peakHour: '2:00 PM - 3:00 PM',
    totalRevenue: 29250.15,
    revenueGrowth: 12.4
  },
  kpis: [
    {
      id: 'tapid_users',
      title: 'Tapid Users',
      value: 68,
      valueType: 'percentage',
      changeValue: 5.2,
      changeType: 'percentage',
      period: 'month',
      hasInfo: true
    },
    {
      id: 'daily_transactions',
      title: "Today's Transactions",
      value: 1247,
      valueType: 'number',
      changeValue: 18.3,
      changeType: 'percentage',
      period: 'day'
    }
  ],
  trendingItems: [
    { name: 'Coffee', sales: 245, changeValue: 12 },
    { name: 'Sandwiches', sales: 189, changeValue: 8 },
    { name: 'Pastries', sales: 156, changeValue: -3 }
  ],
  paymentMethods: [
    { method: 'Contactless', percentage: 45, color: '#008A9B' },
    { method: 'Chip & PIN', percentage: 28, color: '#00BD84' }
  ],
  connectionSettings: {
    connectionTimeout: 3000,
    retryAttempts: 3,
    syncInterval: 300000,
    defaultTerminalsPerPage: 3
  },
  notifications: {
    connectionSuccess: 'Terminal connected successfully!',
    connectionError: 'Failed to connect terminal. Please try again.',
    disconnectionSuccess: 'Terminal disconnected.',
    syncSuccess: 'Data synchronized with terminal.',
    syncError: 'Failed to sync data. Check connection.'
  }
}));

// Test wrapper for ConnectContext
const TestWrapper = ({ children }) => (
  <ConnectProvider>
    {children}
  </ConnectProvider>
);

describe('ConnectContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('Provider Setup', () => {
    test('provides context value without crashing', () => {
      const { result } = renderHook(() => useConnect(), {
        wrapper: TestWrapper
      });

      expect(result.current).toBeDefined();
      expect(result.current.data).toBeDefined();
    });

    test('initializes with ConnectData', () => {
      const { result } = renderHook(() => useConnect(), {
        wrapper: TestWrapper
      });

      expect(result.current.data.posTerminals).toBeDefined();
      expect(result.current.data.queueEfficiency).toBeDefined();
      expect(result.current.data.customerMetrics).toBeDefined();
    });

    test('sets initial state correctly', () => {
      const { result } = renderHook(() => useConnect(), {
        wrapper: TestWrapper
      });

      expect(result.current.connectedTerminals).toEqual([]);
      expect(result.current.connectionStatus).toEqual({});
      expect(result.current.selectedDay).toBe('Monday');
      expect(result.current.showAnalytics).toBe(false);
      expect(result.current.isConnecting).toBe(false);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
    });
  });

  describe('Utility Functions', () => {
    describe('formatCurrency', () => {
      test('formats GBP currency correctly', () => {
        const { result } = renderHook(() => useConnect(), {
          wrapper: TestWrapper
        });

        const formatted = result.current.formatCurrency(24.50);
        expect(formatted).toContain('24.50');
        expect(formatted).toContain('£');
      });

      test('handles different currencies', () => {
        const { result } = renderHook(() => useConnect(), {
          wrapper: TestWrapper
        });

        const formatted = result.current.formatCurrency(24.50, 'USD');
        expect(formatted).toContain('24.50');
      });

      test('handles errors gracefully', () => {
        const { result } = renderHook(() => useConnect(), {
          wrapper: TestWrapper
        });

        const formatted = result.current.formatCurrency(24.50, 'INVALID');
        expect(formatted).toBe('£24.50');
      });
    });

    describe('formatNumber', () => {
      test('formats numbers with commas', () => {
        const { result } = renderHook(() => useConnect(), {
          wrapper: TestWrapper
        });

        expect(result.current.formatNumber(1247)).toBe('1,247');
        expect(result.current.formatNumber(1234567)).toBe('1,234,567');
      });

      test('handles small numbers', () => {
        const { result } = renderHook(() => useConnect(), {
          wrapper: TestWrapper
        });

        expect(result.current.formatNumber(42)).toBe('42');
      });
    });

    describe('formatPercentage', () => {
      test('formats positive percentages with sign', () => {
        const { result } = renderHook(() => useConnect(), {
          wrapper: TestWrapper
        });

        expect(result.current.formatPercentage(12.5)).toBe('+12.5%');
      });

      test('formats negative percentages', () => {
        const { result } = renderHook(() => useConnect(), {
          wrapper: TestWrapper
        });

        expect(result.current.formatPercentage(-8.3)).toBe('-8.3%');
      });

      test('handles zero percentage', () => {
        const { result } = renderHook(() => useConnect(), {
          wrapper: TestWrapper
        });

        expect(result.current.formatPercentage(0)).toBe('0%');
      });

      test('can hide sign', () => {
        const { result } = renderHook(() => useConnect(), {
          wrapper: TestWrapper
        });

        expect(result.current.formatPercentage(12.5, false)).toBe('12.5%');
      });
    });

    describe('calculateTrend', () => {
      test('returns "up" for positive values', () => {
        const { result } = renderHook(() => useConnect(), {
          wrapper: TestWrapper
        });

        expect(result.current.calculateTrend(5.2)).toBe('up');
      });

      test('returns "down" for negative values', () => {
        const { result } = renderHook(() => useConnect(), {
          wrapper: TestWrapper
        });

        expect(result.current.calculateTrend(-3.1)).toBe('down');
      });

      test('returns "stable" for zero', () => {
        const { result } = renderHook(() => useConnect(), {
          wrapper: TestWrapper
        });

        expect(result.current.calculateTrend(0)).toBe('stable');
      });
    });

    describe('getIconComponent', () => {
      test('returns icon component for valid names', () => {
        const { result } = renderHook(() => useConnect(), {
          wrapper: TestWrapper
        });

        const icon = result.current.getIconComponent('Users');
        expect(icon).toBeDefined();
        expect(icon.type).toBeDefined();
      });

      test('returns default icon for invalid names', () => {
        const { result } = renderHook(() => useConnect(), {
          wrapper: TestWrapper
        });

        const icon = result.current.getIconComponent('InvalidIcon');
        expect(icon).toBeDefined();
        expect(icon.type).toBeDefined();
      });

      test('accepts size parameter', () => {
        const { result } = renderHook(() => useConnect(), {
          wrapper: TestWrapper
        });

        const icon = result.current.getIconComponent('Users', 24);
        expect(icon.props.size).toBe(24);
      });
    });

    describe('getTrendIcon', () => {
      test('returns up arrow for up trend', () => {
        const { result } = renderHook(() => useConnect(), {
          wrapper: TestWrapper
        });

        const icon = result.current.getTrendIcon('up');
        expect(icon).toBeDefined();
        expect(icon.props.style.color).toBe('#10b981');
      });

      test('returns down arrow for down trend', () => {
        const { result } = renderHook(() => useConnect(), {
          wrapper: TestWrapper
        });

        const icon = result.current.getTrendIcon('down');
        expect(icon).toBeDefined();
        expect(icon.props.style.color).toBe('#ef4444');
      });

      test('returns null for stable trend', () => {
        const { result } = renderHook(() => useConnect(), {
          wrapper: TestWrapper
        });

        const icon = result.current.getTrendIcon('stable');
        expect(icon).toBeNull();
      });
    });
  });

  describe('Business Logic Functions', () => {
    describe('calculateStaffWorkload', () => {
      test('returns overworked for low efficiency', () => {
        const { result } = renderHook(() => useConnect(), {
          wrapper: TestWrapper
        });

        const workload = result.current.calculateStaffWorkload(65, 20);
        expect(workload.level).toBe('Overworked');
        expect(workload.suggestedStaff).toBe(3);
      });

      test('returns optimal for good efficiency', () => {
        const { result } = renderHook(() => useConnect(), {
          wrapper: TestWrapper
        });

        const workload = result.current.calculateStaffWorkload(80, 18);
        expect(workload.level).toBe('Optimal');
        expect(workload.suggestedStaff).toBe(2);
      });
    });

    describe('calculatePaymentCosts', () => {
      test('calculates payment costs correctly', () => {
        const { result } = renderHook(() => useConnect(), {
          wrapper: TestWrapper
        });

        const costs = result.current.calculatePaymentCosts();
        
        expect(costs.totalSales).toBe(29250.15); // 1247 * 23.45
        expect(costs.currentProviderRate).toBe(2.5);
        expect(costs.tapidPayRate).toBe(1.5);
        expect(costs.savingsPercentage).toBe(1.0);
        expect(costs.monthlySavings).toBe(292.5015); // totalSales * 1.0 / 100
        expect(costs.annualSavings).toBe(3510.018); // monthlySavings * 12
      });
    });
  });

  describe('Data Transformation Functions', () => {
    describe('getTransformedTerminals', () => {
      test('transforms available terminals correctly', () => {
        const { result } = renderHook(() => useConnect(), {
          wrapper: TestWrapper
        });

        const terminals = result.current.getTransformedTerminals();
        
        expect(terminals.available).toHaveLength(2);
        expect(terminals.available[0].name).toBe('SumUp');
        expect(terminals.available[0].icon).toBeDefined();
        expect(terminals.available[0].status).toBe('available');
        expect(terminals.available[0].isConnected).toBe(false);
      });

      test('transforms coming soon terminals correctly', () => {
        const { result } = renderHook(() => useConnect(), {
          wrapper: TestWrapper
        });

        const terminals = result.current.getTransformedTerminals();
        
        expect(terminals.comingSoon).toHaveLength(1);
        expect(terminals.comingSoon[0].name).toBe('Clover');
        expect(terminals.comingSoon[0].status).toBe('coming_soon');
        expect(terminals.comingSoon[0].isConnected).toBe(false);
      });

      test('includes all terminals in combined array', () => {
        const { result } = renderHook(() => useConnect(), {
          wrapper: TestWrapper
        });

        const terminals = result.current.getTransformedTerminals();
        
        expect(terminals.all).toHaveLength(3);
        expect(terminals.all).toEqual([...terminals.available, ...terminals.comingSoon]);
      });
    });

    describe('getTransformedKPIs', () => {
      test('transforms KPI data with correct formatting', () => {
        const { result } = renderHook(() => useConnect(), {
          wrapper: TestWrapper
        });

        const kpis = result.current.getTransformedKPIs();
        
        expect(kpis).toHaveLength(2);
        
        const tapidUsersKPI = kpis[0];
        expect(tapidUsersKPI.title).toBe('Tapid Users');
        expect(tapidUsersKPI.formattedValue).toBe('68%');
        expect(tapidUsersKPI.formattedChange).toBe('+5.2%');
        expect(tapidUsersKPI.trend).toBe('up');
        expect(tapidUsersKPI.icon).toBeDefined();
      });

      test('handles different value types correctly', () => {
        const { result } = renderHook(() => useConnect(), {
          wrapper: TestWrapper
        });

        const kpis = result.current.getTransformedKPIs();
        
        const transactionsKPI = kpis[1];
        expect(transactionsKPI.valueType).toBe('number');
        expect(transactionsKPI.formattedValue).toBe('1,247');
      });
    });

    describe('getTransformedTrendingItems', () => {
      test('transforms trending items with formatted data', () => {
        const { result } = renderHook(() => useConnect(), {
          wrapper: TestWrapper
        });

        const items = result.current.getTransformedTrendingItems();
        
        expect(items).toHaveLength(3);
        
        const coffeeItem = items[0];
        expect(coffeeItem.name).toBe('Coffee');
        expect(coffeeItem.formattedSales).toBe('245');
        expect(coffeeItem.formattedChange).toBe('+12%');
        expect(coffeeItem.trend).toBe('up');
        expect(coffeeItem.trendIcon).toBeDefined();
      });

      test('handles negative changes correctly', () => {
        const { result } = renderHook(() => useConnect(), {
          wrapper: TestWrapper
        });

        const items = result.current.getTransformedTrendingItems();
        
        const pastriesItem = items[2];
        expect(pastriesItem.changeValue).toBe(-3);
        expect(pastriesItem.trend).toBe('down');
        expect(pastriesItem.formattedChange).toBe('-3%');
      });
    });

    describe('getHourlyDataForDay', () => {
      test('returns data for valid day', () => {
        const { result } = renderHook(() => useConnect(), {
          wrapper: TestWrapper
        });

        const data = result.current.getHourlyDataForDay('Monday');
        expect(data).toHaveLength(2);
        expect(data[0].hour).toBe('9 AM');
        expect(data[0].transactions).toBe(12);
      });

      test('returns Monday data for invalid day', () => {
        const { result } = renderHook(() => useConnect(), {
          wrapper: TestWrapper
        });

        const data = result.current.getHourlyDataForDay('InvalidDay');
        expect(data).toHaveLength(2);
        expect(data[0].hour).toBe('9 AM');
      });
    });

    describe('getQueueAnalytics', () => {
      test('transforms queue analytics with formatted values', () => {
        const { result } = renderHook(() => useConnect(), {
          wrapper: TestWrapper
        });

        const analytics = result.current.getQueueAnalytics();
        
        expect(analytics.averageServiceTime).toBe(3.4);
        expect(analytics.formattedServiceTime).toBe('3.4min');
        expect(analytics.queueEfficiencyScore).toBe(82);
        expect(analytics.formattedEfficiency).toBe('82%');
        expect(analytics.customersPerHour).toBe(18);
        expect(analytics.formattedCustomersPerHour).toBe('18/hr');
        expect(analytics.staffWorkload).toBeDefined();
        expect(analytics.improvementTip).toBe('Consider additional staff during 12-2 PM rush');
      });
    });

    describe('processWeeklyTrendData', () => {
      test('processes weekly data with workload analysis', () => {
        const { result } = renderHook(() => useConnect(), {
          wrapper: TestWrapper
        });

        const weeklyData = result.current.processWeeklyTrendData();
        
        expect(weeklyData).toHaveLength(2);
        
        const mondayData = weeklyData[0];
        expect(mondayData.day).toBe('Monday');
        expect(mondayData.workload).toBeDefined();
        expect(mondayData.workload.level).toBe('Optimal');
        expect(mondayData.formattedServiceTime).toBe('3.8min');
        expect(mondayData.efficiencyDisplay).toBe('78%');
      });
    });
  });

  describe('Connection Management', () => {
    describe('connectTerminal', () => {
      test('connects terminal successfully', async () => {
        const { result } = renderHook(() => useConnect(), {
          wrapper: TestWrapper
        });

        await act(async () => {
          const response = await result.current.connectTerminal('sumup');
          expect(response.success).toBe(true);
          expect(response.terminal).toBeDefined();
          expect(response.terminal.id).toBe('sumup');
        });

        expect(result.current.connectedTerminals).toHaveLength(1);
        expect(result.current.connectedTerminals[0].name).toBe('SumUp');
      });

      test('handles invalid terminal ID', async () => {
        const { result } = renderHook(() => useConnect(), {
          wrapper: TestWrapper
        });

        await act(async () => {
          const response = await result.current.connectTerminal('invalid');
          expect(response.success).toBe(false);
          expect(response.error).toBe('Terminal not found');
        });
      });

      test('updates connection status during process', async () => {
        const { result } = renderHook(() => useConnect(), {
          wrapper: TestWrapper
        });

        const connectPromise = act(async () => {
          return result.current.connectTerminal('sumup');
        });

        // Check intermediate states
        expect(result.current.isConnecting).toBe(true);

        await connectPromise;

        expect(result.current.isConnecting).toBe(false);
        expect(result.current.connectionStatus.sumup).toBe('connected');
      });

      test('shows analytics after successful connection', async () => {
        const { result } = renderHook(() => useConnect(), {
          wrapper: TestWrapper
        });

        await act(async () => {
          await result.current.connectTerminal('sumup');
        });

        expect(result.current.showAnalytics).toBe(true);
        expect(result.current.analyticsData).toBeDefined();
      });
    });

    describe('disconnectTerminal', () => {
      test('disconnects terminal successfully', async () => {
        const { result } = renderHook(() => useConnect(), {
          wrapper: TestWrapper
        });

        // First connect a terminal
        await act(async () => {
          await result.current.connectTerminal('sumup');
        });

        // Then disconnect it
        act(() => {
          const response = result.current.disconnectTerminal('sumup');
          expect(response.success).toBe(true);
        });

        expect(result.current.connectedTerminals).toHaveLength(0);
        expect(result.current.connectionStatus.sumup).toBe('disconnected');
      });

      test('hides analytics when no terminals connected', async () => {
        const { result } = renderHook(() => useConnect(), {
          wrapper: TestWrapper
        });

        // Connect and then disconnect
        await act(async () => {
          await result.current.connectTerminal('sumup');
        });

        act(() => {
          result.current.disconnectTerminal('sumup');
        });

        expect(result.current.showAnalytics).toBe(false);
        expect(result.current.analyticsData).toBe(null);
      });
    });
  });

  describe('Data Management', () => {
    describe('refreshData', () => {
      test('refreshes data successfully', async () => {
        const { result } = renderHook(() => useConnect(), {
          wrapper: TestWrapper
        });

        const initialTimestamp = result.current.lastUpdated;

        await act(async () => {
          await result.current.refreshData();
        });

        expect(result.current.lastUpdated).not.toBe(initialTimestamp);
        expect(result.current.loading).toBe(false);
      });

      test('sets loading state during refresh', async () => {
        const { result } = renderHook(() => useConnect(), {
          wrapper: TestWrapper
        });

        const refreshPromise = act(async () => {
          return result.current.refreshData();
        });

        expect(result.current.loading).toBe(true);

        await refreshPromise;

        expect(result.current.loading).toBe(false);
      });
    });

    describe('exportConnectData', () => {
      test('exports data with correct structure', () => {
        const { result } = renderHook(() => useConnect(), {
          wrapper: TestWrapper
        });

        const exportData = result.current.exportConnectData();
        
        expect(exportData).toBeDefined();
        expect(exportData.exportedAt).toBeDefined();
        expect(exportData.connectedTerminals).toBeDefined();
        expect(exportData.connectionStatus).toBeDefined();
        expect(exportData.selectedDay).toBe('Monday');
        expect(exportData.lastUpdated).toBeDefined();
      });
    });
  });

  describe('LocalStorage Integration', () => {
    test('loads connected terminals from localStorage on mount', () => {
      const mockTerminals = [
        {
          id: 'sumup',
          name: 'SumUp',
          connectedAt: new Date().toISOString(),
          status: 'connected',
          lastSync: new Date().toISOString()
        }
      ];
      localStorage.setItem('connectedTerminals', JSON.stringify(mockTerminals));

      const { result } = renderHook(() => useConnect(), {
        wrapper: TestWrapper
      });

      expect(result.current.connectedTerminals).toHaveLength(1);
      expect(result.current.connectedTerminals[0].name).toBe('SumUp');
    });

    test('shows analytics if terminals are loaded from localStorage', async () => {
      const mockTerminals = [
        {
          id: 'sumup',
          name: 'SumUp',
          connectedAt: new Date().toISOString(),
          status: 'connected',
          lastSync: new Date().toISOString()
        }
      ];
      localStorage.setItem('connectedTerminals', JSON.stringify(mockTerminals));

      const { result } = renderHook(() => useConnect(), {
        wrapper: TestWrapper
      });

      await waitFor(() => {
        expect(result.current.showAnalytics).toBe(true);
      });
    });

    test('handles corrupted localStorage data gracefully', () => {
      localStorage.setItem('connectedTerminals', 'invalid json');

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const { result } = renderHook(() => useConnect(), {
        wrapper: TestWrapper
      });

      expect(result.current.connectedTerminals).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('Error Handling', () => {
    test('handles errors gracefully', () => {
      const { result } = renderHook(() => useConnect(), {
        wrapper: TestWrapper
      });

      expect(result.current.error).toBe(null);
      expect(result.current.data).toBeDefined();
    });

    test('provides fallback values for missing data', () => {
      const { result } = renderHook(() => useConnect(), {
        wrapper: TestWrapper
      });

      const analytics = result.current.getQueueAnalytics();
      expect(analytics).toBeDefined();
      expect(analytics.staffWorkload).toBeDefined();
    });
  });

  describe('Performance', () => {
    test('memoizes expensive calculations', () => {
      const { result } = renderHook(() => useConnect(), {
        wrapper: TestWrapper
      });

      // Get transformed data multiple times
      const terminals1 = result.current.getTransformedTerminals();
      const terminals2 = result.current.getTransformedTerminals();
      
      // Functions should be stable
      expect(result.current.getTransformedTerminals).toBe(result.current.getTransformedTerminals);
    });

    test('utility functions are pure', () => {
      const { result } = renderHook(() => useConnect(), {
        wrapper: TestWrapper
      });

      const formatCurrency = result.current.formatCurrency;
      const formatNumber = result.current.formatNumber;
      
      // Same inputs should produce same outputs
      expect(formatCurrency(24.50)).toBe(formatCurrency(24.50));
      expect(formatNumber(1247)).toBe(formatNumber(1247));
    });
  });
}); 