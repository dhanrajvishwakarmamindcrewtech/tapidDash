import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { BusinessDataProvider } from '../context/BusinessDataContext';
import { DataProvider } from '../context/DataContext';
import { CoreProvider } from '../context/CoreContext';
import { UIProvider } from '../context/UIContext';

// Mock Firebase
export const mockFirebase = () => {
  jest.mock('../firebase/config', () => ({
    auth: {
      currentUser: {
        uid: 'test-user-id',
        email: 'test@example.com',
        displayName: 'Test User'
      }
    },
    db: {},
    analytics: {}
  }));
};

// Mock React Router
export const mockReactRouter = () => {
  const mockNavigate = jest.fn();
  jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: 'test-id' }),
    useLocation: () => ({ pathname: '/insights', search: '', hash: '', state: null })
  }));
  return { mockNavigate };
};

// Test data constants
export const mockInsightsData = {
  kpis: [
    {
      title: 'Active Customers',
      value: 1847,
      changeValue: 11,
      period: 'month'
    },
    {
      title: 'Avg Spend per Customer',
      value: 24.50,
      changeValue: 8.2,
      period: 'month'
    },
    {
      title: 'Visit Frequency',
      value: 3.2,
      changeValue: -2.1,
      period: 'month'
    }
  ],
  customerSegments: [
    {
      segment: 'vip',
      count: 271,
      avgSpend: 45.20,
      growthPercentage: 12.5,
      visitFreq: 4.2
    },
    {
      segment: 'regular',
      count: 892,
      avgSpend: 18.75,
      growthPercentage: 5.1,
      visitFreq: 2.8
    },
    {
      segment: 'new',
      count: 184,
      avgSpend: 12.30,
      growthPercentage: 25.3,
      visitFreq: 1.1
    },
    {
      segment: 'at-risk',
      count: 407,
      avgSpend: 8.45,
      growthPercentage: -8.7,
      visitFreq: 0.5
    }
  ],
  smartInsights: [
    {
      type: 'success',
      title: 'Queue times are within acceptable ranges at 4.8 min at busy times',
      description: 'Good job!',
      priority: 'low'
    },
    {
      type: 'warning',
      title: 'High customer churn risk',
      description: 'customers (15%) haven\'t visited recently',
      priority: 'high',
      churnPercentage: 15,
      churnCount: 277
    },
    {
      type: 'opportunity',
      title: 'VIP segment growth opportunity',
      description: 'Consider launching premium tier program',
      priority: 'medium'
    }
  ],
  customerStats: {
    total: 2710,
    active: 1847,
    new: 184,
    atRisk: 407,
    vip: 271,
    avgSpend: 18.50,
    totalSpend: 50135.00,
    avgVisitFrequency: 3.2,
    retentionRate: 76
  }
};

export const mockBusinessData = {
  insights: mockInsightsData,
  connect: {
    queueEfficiency: {
      weeklyTrend: [
        { day: 'Monday', serviceTime: 3.2, status: 'optimal' },
        { day: 'Tuesday', serviceTime: 2.8, status: 'optimal' },
        { day: 'Wednesday', serviceTime: 3.5, status: 'optimal' },
        { day: 'Thursday', serviceTime: 4.1, status: 'busy' },
        { day: 'Friday', serviceTime: 4.8, status: 'overworked' },
        { day: 'Saturday', serviceTime: 4.2, status: 'busy' },
        { day: 'Sunday', serviceTime: 3.9, status: 'busy' }
      ],
      currentPerformance: {
        averageServiceTime: 3.4,
        efficiencyScore: 82,
        peakHour: 12,
        customersPerHour: 45
      }
    }
  }
};

// Mock notification hooks
export const mockNotificationHooks = {
  showSuccess: jest.fn(),
  showError: jest.fn(),
  showWarning: jest.fn(),
  showInfo: jest.fn(),
  showLoading: jest.fn(),
  removeNotification: jest.fn(),
  logUpdate: jest.fn()
};

// Full test wrapper with all providers
export const createTestWrapper = (options = {}) => {
  const {
    notificationHooks = mockNotificationHooks,
    initialUser = null,
    mockData = true
  } = options;

  return ({ children }) => (
    <BrowserRouter>
      <UIProvider>
        <CoreProvider isNewUser={false}>
          <DataProvider>
            <BusinessDataProvider notificationHooks={notificationHooks}>
              {children}
            </BusinessDataProvider>
          </DataProvider>
        </CoreProvider>
      </UIProvider>
    </BrowserRouter>
  );
};

// Minimal test wrapper for context testing
export const createMinimalWrapper = (ContextProvider, contextValue = {}) => {
  return ({ children }) => (
    <ContextProvider value={contextValue}>
      {children}
    </ContextProvider>
  );
};

// Mock DOM APIs
export const mockDOMAPIs = () => {
  // Mock URL.createObjectURL for file exports
  global.URL.createObjectURL = jest.fn(() => 'mock-blob-url');
  global.URL.revokeObjectURL = jest.fn();

  // Mock document.createElement for link downloads
  const mockLink = {
    href: '',
    download: '',
    click: jest.fn()
  };
  jest.spyOn(document, 'createElement').mockImplementation((tagName) => {
    if (tagName === 'a') {
      return mockLink;
    }
    return document.createElement(tagName);
  });

  // Mock performance API
  global.performance.now = jest.fn(() => Date.now());

  // Mock IntersectionObserver
  global.IntersectionObserver = jest.fn(() => ({
    observe: jest.fn(),
    disconnect: jest.fn(),
    unobserve: jest.fn()
  }));

  // Mock ResizeObserver
  global.ResizeObserver = jest.fn(() => ({
    observe: jest.fn(),
    disconnect: jest.fn(),
    unobserve: jest.fn()
  }));

  return { mockLink };
};

// Mock localStorage
export const mockLocalStorage = () => {
  const store = {};
  
  global.localStorage = {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    })
  };

  return store;
};

// Helper to wait for async state updates
export const waitForStateUpdate = (callback, timeout = 1000) => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const checkCondition = () => {
      try {
        const result = callback();
        if (result) {
          resolve(result);
        } else if (Date.now() - startTime > timeout) {
          reject(new Error('Timeout waiting for state update'));
        } else {
          setTimeout(checkCondition, 10);
        }
      } catch (error) {
        reject(error);
      }
    };
    
    checkCondition();
  });
};

// Helper to simulate user interactions
export const simulateUserInteraction = {
  clickButton: (element) => {
    element.click();
  },
  
  typeInInput: (input, value) => {
    input.value = value;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  },
  
  selectOption: (select, value) => {
    select.value = value;
    select.dispatchEvent(new Event('change', { bubbles: true }));
  }
};

// Assert helpers for common test patterns
export const assertHelpers = {
  expectElementWithText: (container, text) => {
    const element = container.querySelector(`*:contains("${text}")`);
    expect(element).toBeInTheDocument();
    return element;
  },
  
  expectNoErrors: (consoleSpy) => {
    expect(consoleSpy).not.toHaveBeenCalledWith(
      expect.stringMatching(/error|Error|ERROR/)
    );
  },
  
  expectValidCurrency: (text) => {
    expect(text).toMatch(/^[€$£¥]\d{1,3}(,\d{3})*(\.\d{2})?$/);
  },
  
  expectValidPercentage: (text) => {
    expect(text).toMatch(/^[+-]?\d+(\.\d+)?%$/);
  }
};

// Test data generators
export const generateTestData = {
  kpi: (overrides = {}) => ({
    title: 'Test KPI',
    value: 100,
    changeValue: 5.0,
    period: 'month',
    ...overrides
  }),
  
  segment: (overrides = {}) => ({
    segment: 'test',
    count: 50,
    avgSpend: 25.00,
    growthPercentage: 10.0,
    visitFreq: 2.5,
    ...overrides
  }),
  
  insight: (overrides = {}) => ({
    type: 'success',
    title: 'Test Insight',
    description: 'Test description',
    priority: 'medium',
    ...overrides
  })
};

// Performance testing helpers
export const performanceHelpers = {
  measureRenderTime: (renderFunction) => {
    const start = performance.now();
    const result = renderFunction();
    const end = performance.now();
    return {
      result,
      renderTime: end - start
    };
  },
  
  expectFastRender: (renderTime, maxTime = 100) => {
    expect(renderTime).toBeLessThan(maxTime);
  }
};

export default {
  mockFirebase,
  mockReactRouter,
  mockInsightsData,
  mockBusinessData,
  mockNotificationHooks,
  createTestWrapper,
  createMinimalWrapper,
  mockDOMAPIs,
  mockLocalStorage,
  waitForStateUpdate,
  simulateUserInteraction,
  assertHelpers,
  generateTestData,
  performanceHelpers
}; 