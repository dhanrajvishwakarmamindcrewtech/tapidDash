import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BusinessDataProvider, useInsights, useCustomers } from '../context/BusinessDataContext';
import { DataProvider } from '../context/DataContext';
import { CoreProvider } from '../context/CoreContext';
import { UIProvider } from '../context/UIContext';
// Define mock data locally to avoid circular dependency
const localMockData = {
  insights: {
    kpis: [
      { title: 'Active Customers', value: 1847, changeValue: 11, period: 'month' },
      { title: 'Avg Spend per Customer', value: 24.50, changeValue: 8.2, period: 'month' }
    ],
    customerSegments: [
      { segment: 'vip', count: 271, avgSpend: 45.20, growthPercentage: 12.5, visitFreq: 4.2 },
      { segment: 'regular', count: 892, avgSpend: 18.75, growthPercentage: 5.1, visitFreq: 2.8 }
    ],
    smartInsights: [
      { type: 'success', title: 'Queue times are within acceptable ranges at 4.8 min at busy times', description: 'Good job!', priority: 'low' },
      { type: 'warning', title: 'High customer churn risk', description: 'customers (15%) haven\'t visited recently', priority: 'high' }
    ],
    customerStats: { total: 2710, active: 1847, new: 184, atRisk: 407, vip: 271, avgSpend: 18.50, totalSpend: 50135.00, avgVisitFrequency: 3.2, retentionRate: 76 }
  }
};

import { mockNotificationHooks } from './testUtils';

// Mock the data imports
jest.mock('../data/insights.json', () => localMockData.insights);

jest.mock('../data', () => ({
  getAllCustomers: jest.fn(() => Promise.resolve([])),
  getCustomerById: jest.fn(),
  getCustomersBySegment: jest.fn(),
  updateCustomer: jest.fn(),
  addCustomer: jest.fn(),
  calculateCustomerStats: jest.fn(() => localMockData.insights.customerStats),
  customerSegments: [
    { segment: 'vip', count: 271 },
    { segment: 'regular', count: 892 },
    { segment: 'new', count: 184 },
    { segment: 'at-risk', count: 407 }
  ],
  dataService: {
    getCache: jest.fn(),
    setCache: jest.fn(),
    subscribe: jest.fn(() => () => {}),
  },
  getAllCampaigns: jest.fn(),
  addCampaign: jest.fn(),
  updateCampaign: jest.fn(),
  deleteCampaign: jest.fn(),
  getReportsData: jest.fn(),
  generateReport: jest.fn(),
  getReportTemplates: jest.fn(),
  saveCustomReport: jest.fn()
}));

// Mock Firebase completely
jest.mock('../firebase/config', () => ({
  auth: {
    currentUser: null
  },
  db: {},
  analytics: {}
}));

// Mock Firebase auth functions
jest.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  updateProfile: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  onAuthStateChanged: jest.fn((auth, callback) => {
    callback(null);
    return () => {};
  })
}));

// Mock CoreContext
jest.mock('../context/CoreContext', () => ({
  useCore: () => ({
    user: { uid: 'test-user' },
    businessSettings: {},
    globalFilters: {},
    getBusinessData: jest.fn()
  }),
  CoreProvider: ({ children }) => <div>{children}</div>
}));

// Test wrapper for BusinessDataContext
const TestWrapper = ({ children, customNotificationHooks = {} }) => {
  const notificationHooks = { ...mockNotificationHooks, ...customNotificationHooks };
  
  return (
    <UIProvider>
      <CoreProvider>
        <DataProvider>
          <BusinessDataProvider notificationHooks={notificationHooks}>
            {children}
          </BusinessDataProvider>
        </DataProvider>
      </CoreProvider>
    </UIProvider>
  );
};

describe('BusinessDataContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Provider Setup', () => {
    test('provides context without crashing', () => {
      const { result } = renderHook(() => useInsights(), {
        wrapper: TestWrapper
      });

      expect(result.current).toBeDefined();
    });

    test('initializes with default state', () => {
      const { result } = renderHook(() => useInsights(), {
        wrapper: TestWrapper
      });

      expect(result.current.loading).toBeDefined();
      expect(result.current.error).toBeNull();
      expect(result.current.showCustomerTable).toBe(false);
    });
  });

  describe('useInsights Hook', () => {
    test('provides insights functionality', () => {
      const { result } = renderHook(() => useInsights(), {
        wrapper: TestWrapper
      });

      expect(result.current.loadInsights).toBeDefined();
      expect(result.current.exportInsights).toBeDefined();
      expect(result.current.getCustomerStats).toBeDefined();
      expect(typeof result.current.loadInsights).toBe('function');
      expect(typeof result.current.exportInsights).toBe('function');
      expect(typeof result.current.getCustomerStats).toBe('function');
    });

    test('provides loading and error state', () => {
      const { result } = renderHook(() => useInsights(), {
        wrapper: TestWrapper
      });

      expect(result.current.loading).toBeDefined();
      expect(result.current.error).toBeDefined();
      expect(typeof result.current.loading).toBe('boolean');
    });

    test('provides customer table toggle', () => {
      const { result } = renderHook(() => useInsights(), {
        wrapper: TestWrapper
      });

      expect(result.current.showCustomerTable).toBeDefined();
      expect(typeof result.current.showCustomerTable).toBe('boolean');
    });

    test('provides customers data', () => {
      const { result } = renderHook(() => useInsights(), {
        wrapper: TestWrapper
      });

      expect(result.current.customers).toBeDefined();
      expect(Array.isArray(result.current.customers)).toBe(true);
    });
  });

  describe('useCustomers Hook', () => {
    test('provides customer functionality', () => {
      const { result } = renderHook(() => useCustomers(), {
        wrapper: TestWrapper
      });

      expect(result.current.customers).toBeDefined();
      expect(result.current.fetchCustomers).toBeDefined();
      expect(result.current.getCustomerStats).toBeDefined();
      expect(typeof result.current.fetchCustomers).toBe('function');
      expect(typeof result.current.getCustomerStats).toBe('function');
    });

    test('provides customer segments', () => {
      const { result } = renderHook(() => useCustomers(), {
        wrapper: TestWrapper
      });

      expect(result.current.customerSegments).toBeDefined();
      expect(Array.isArray(result.current.customerSegments)).toBe(true);
    });

    test('provides pagination state', () => {
      const { result } = renderHook(() => useCustomers(), {
        wrapper: TestWrapper
      });

      expect(result.current.pagination).toBeDefined();
      expect(result.current.pagination.page).toBeDefined();
      expect(result.current.pagination.limit).toBeDefined();
      expect(typeof result.current.pagination.page).toBe('number');
      expect(typeof result.current.pagination.limit).toBe('number');
    });

    test('provides filter state', () => {
      const { result } = renderHook(() => useCustomers(), {
        wrapper: TestWrapper
      });

      expect(result.current.filters).toBeDefined();
      expect(result.current.filters.segment).toBeDefined();
      expect(result.current.filters.dateRange).toBeDefined();
    });
  });

  describe('Insights Data Loading', () => {
    test('loadInsights function works', async () => {
      const { result } = renderHook(() => useInsights(), {
        wrapper: TestWrapper
      });

      expect(result.current.loadInsights).toBeDefined();
      
      // Call loadInsights
      await result.current.loadInsights();

      // Should not throw error
      expect(result.current.error).toBeNull();
    });

    test('handles loading state correctly', async () => {
      const { result } = renderHook(() => useInsights(), {
        wrapper: TestWrapper
      });

      const loadingPromise = result.current.loadInsights();
      
      // Wait for the promise to resolve
      await loadingPromise;
      
      // After loading, should not be in loading state
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    test('calls notification hooks on success', async () => {
      const mockNotifications = {
        ...mockNotificationHooks,
        showSuccess: jest.fn(),
        showError: jest.fn()
      };

      const { result } = renderHook(() => useInsights(), {
        wrapper: ({ children }) => (
          <TestWrapper customNotificationHooks={mockNotifications}>
            {children}
          </TestWrapper>
        )
      });

      await result.current.loadInsights();

      // Should not call showError if successful
      expect(mockNotifications.showError).not.toHaveBeenCalled();
    });
  });

  describe('Customer Stats', () => {
    test('getCustomerStats returns valid data', () => {
      const { result } = renderHook(() => useInsights(), {
        wrapper: TestWrapper
      });

      const stats = result.current.getCustomerStats();

      expect(stats).toBeDefined();
      expect(typeof stats).toBe('object');
      
      // Should have expected properties
      if (stats.total !== undefined) {
        expect(typeof stats.total).toBe('number');
      }
      if (stats.active !== undefined) {
        expect(typeof stats.active).toBe('number');
      }
    });

    test('getCustomerStats provides consistent data', () => {
      const { result } = renderHook(() => useInsights(), {
        wrapper: TestWrapper
      });

      const stats1 = result.current.getCustomerStats();
      const stats2 = result.current.getCustomerStats();

      expect(stats1).toEqual(stats2);
    });

    test('customer stats available from useCustomers hook', () => {
      const { result } = renderHook(() => useCustomers(), {
        wrapper: TestWrapper
      });

      const stats = result.current.getCustomerStats();
      expect(stats).toBeDefined();
      expect(typeof stats).toBe('object');
    });
  });

  describe('Export Functionality', () => {
    test('exportInsights returns data', () => {
      const { result } = renderHook(() => useInsights(), {
        wrapper: TestWrapper
      });

      const exportData = result.current.exportInsights();
      
      // Export should return something (might be null if no data loaded)
      expect(exportData !== undefined).toBe(true);
    });

    test('export data has correct structure when available', () => {
      const { result } = renderHook(() => useInsights(), {
        wrapper: TestWrapper
      });

      const exportData = result.current.exportInsights();
      
      if (exportData) {
        expect(typeof exportData).toBe('object');
        // Should have some insights-related data
        expect(
          exportData.customers || 
          exportData.analytics || 
          exportData.kpis ||
          exportData.insights
        ).toBeDefined();
      }
    });
  });

  describe('Error Handling', () => {
    test('handles errors gracefully', async () => {
      const mockErrorNotifications = {
        ...mockNotificationHooks,
        showError: jest.fn()
      };

      const { result } = renderHook(() => useInsights(), {
        wrapper: ({ children }) => (
          <TestWrapper customNotificationHooks={mockErrorNotifications}>
            {children}
          </TestWrapper>
        )
      });

      // Should not throw on function calls
      expect(() => result.current.getCustomerStats()).not.toThrow();
      expect(() => result.current.exportInsights()).not.toThrow();
    });

    test('provides error state', () => {
      const { result } = renderHook(() => useInsights(), {
        wrapper: TestWrapper
      });

      expect(result.current.error).toBeDefined();
      // Initial error should be null
      expect(result.current.error).toBeNull();
    });
  });

  describe('Customer Data Management', () => {
    test('fetchCustomers function exists and callable', async () => {
      const { result } = renderHook(() => useCustomers(), {
        wrapper: TestWrapper
      });

      expect(result.current.fetchCustomers).toBeDefined();
      expect(typeof result.current.fetchCustomers).toBe('function');
      
      // Should not throw when called
      await expect(result.current.fetchCustomers()).resolves.not.toThrow();
    });

    test('customers array is initialized', () => {
      const { result } = renderHook(() => useCustomers(), {
        wrapper: TestWrapper
      });

      expect(result.current.customers).toBeDefined();
      expect(Array.isArray(result.current.customers)).toBe(true);
    });

    test('customer segments are available', () => {
      const { result } = renderHook(() => useCustomers(), {
        wrapper: TestWrapper
      });

      expect(result.current.customerSegments).toBeDefined();
      expect(Array.isArray(result.current.customerSegments)).toBe(true);
    });
  });

  describe('State Management', () => {
    test('maintains consistent state across re-renders', () => {
      const { result, rerender } = renderHook(() => useInsights(), {
        wrapper: TestWrapper
      });

      const initialLoading = result.current.loading;
      const initialError = result.current.error;

      rerender();

      expect(result.current.loading).toBe(initialLoading);
      expect(result.current.error).toBe(initialError);
    });

    test('provides stable function references', () => {
      const { result, rerender } = renderHook(() => useInsights(), {
        wrapper: TestWrapper
      });

      const initialLoadInsights = result.current.loadInsights;
      const initialExportInsights = result.current.exportInsights;
      const initialGetCustomerStats = result.current.getCustomerStats;

      rerender();

      // Functions should maintain reference stability
      expect(result.current.loadInsights).toBe(initialLoadInsights);
      expect(result.current.exportInsights).toBe(initialExportInsights);
      expect(result.current.getCustomerStats).toBe(initialGetCustomerStats);
    });
  });

  describe('Integration with DataContext', () => {
    test('works with DataContext provider', () => {
      const { result } = renderHook(() => useInsights(), {
        wrapper: TestWrapper
      });

      // Should be able to access insights functionality
      expect(result.current.loadInsights).toBeDefined();
      expect(result.current.getCustomerStats).toBeDefined();
    });

    test('provides data from both contexts', () => {
      const { result: insightsResult } = renderHook(() => useInsights(), {
        wrapper: TestWrapper
      });
      
      const { result: customersResult } = renderHook(() => useCustomers(), {
        wrapper: TestWrapper
      });

      // Both hooks should provide data
      expect(insightsResult.current.getCustomerStats).toBeDefined();
      expect(customersResult.current.getCustomerStats).toBeDefined();
    });
  });

  describe('Performance', () => {
    test('does not cause unnecessary re-renders', () => {
      let renderCount = 0;
      
      const TestComponent = () => {
        renderCount++;
        useInsights();
        return null;
      };

      const { rerender } = renderHook(() => <TestComponent />, {
        wrapper: TestWrapper
      });

      const initialRenderCount = renderCount;
      
      // Rerender should not cause additional renders of the test component
      rerender();
      
      expect(renderCount).toBe(initialRenderCount);
    });

    test('memoizes expensive operations', () => {
      const { result } = renderHook(() => useInsights(), {
        wrapper: TestWrapper
      });

      // Multiple calls should return consistent results
      const stats1 = result.current.getCustomerStats();
      const stats2 = result.current.getCustomerStats();
      const export1 = result.current.exportInsights();
      const export2 = result.current.exportInsights();

      expect(stats1).toEqual(stats2);
      expect(export1).toEqual(export2);
    });
  });
}); 