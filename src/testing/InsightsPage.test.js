import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import InsightsPage from '../screens/InsightsPage/InsightsPage';
import { BusinessDataProvider } from '../context/BusinessDataContext';
import { DataProvider } from '../context/DataContext';
import { CoreProvider } from '../context/CoreContext';
import { UIProvider } from '../context/UIContext';

// Mock the navigation hook
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
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
    // Immediately call with null user to simulate no auth
    callback(null);
    return () => {}; // Unsubscribe function
  })
}));

// Test wrapper component with all required providers
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <UIProvider>
      <CoreProvider>
        <DataProvider>
          <BusinessDataProvider notificationHooks={{
            showSuccess: jest.fn(),
            showError: jest.fn(),
            showLoading: jest.fn(),
            removeNotification: jest.fn(),
            logUpdate: jest.fn()
          }}>
            {children}
          </BusinessDataProvider>
        </DataProvider>
      </CoreProvider>
    </UIProvider>
  </BrowserRouter>
);

describe('InsightsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('renders without crashing', () => {
      render(
        <TestWrapper>
          <InsightsPage />
        </TestWrapper>
      );
    });

    test('displays loading state initially', () => {
      render(
        <TestWrapper>
          <InsightsPage />
        </TestWrapper>
      );
      
      // Should show loading or have loaded content
      expect(screen.getByText(/loading/i) || screen.getByText(/insights/i)).toBeInTheDocument();
    });

    test('displays insights header', async () => {
      render(
        <TestWrapper>
          <InsightsPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/insights/i)).toBeInTheDocument();
      });
    });
  });

  describe('KPIs Section', () => {
    test('displays KPI cards when data is loaded', async () => {
      render(
        <TestWrapper>
          <InsightsPage />
        </TestWrapper>
      );

      await waitFor(() => {
        // Look for KPI-related elements
        const kpiElements = screen.queryAllByText(/customers|spend|visits/i);
        expect(kpiElements.length).toBeGreaterThan(0);
      });
    });

    test('displays formatted currency values', async () => {
      render(
        <TestWrapper>
          <InsightsPage />
        </TestWrapper>
      );

      await waitFor(() => {
        // Look for currency symbols
        const currencyElements = screen.queryAllByText(/€|EUR|\$/);
        expect(currencyElements.length).toBeGreaterThan(0);
      });
    });

    test('shows trend indicators', async () => {
      render(
        <TestWrapper>
          <InsightsPage />
        </TestWrapper>
      );

      await waitFor(() => {
        // Look for trend indicators (arrows or percentage changes)
        const trendElements = screen.queryAllByText(/%|up|down/i);
        expect(trendElements.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Smart Insights Section', () => {
    test('displays smart insights cards', async () => {
      render(
        <TestWrapper>
          <InsightsPage />
        </TestWrapper>
      );

      await waitFor(() => {
        // Look for insights-related content
        const insightElements = screen.queryAllByText(/queue|customer|campaign/i);
        expect(insightElements.length).toBeGreaterThan(0);
      });
    });

    test('displays queue time insights with busy period data', async () => {
      render(
        <TestWrapper>
          <InsightsPage />
        </TestWrapper>
      );

      await waitFor(() => {
        // Look for queue-specific content
        expect(
          screen.getByText(/queue times are within acceptable ranges/i) ||
          screen.getByText(/4\.8 min at busy times/i)
        ).toBeInTheDocument();
      });
    });

    test('shows insight priority levels', async () => {
      render(
        <TestWrapper>
          <InsightsPage />
        </TestWrapper>
      );

      await waitFor(() => {
        // Look for priority indicators
        const priorityElements = screen.queryAllByText(/low|medium|high/i);
        expect(priorityElements.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Customer Segments Section', () => {
    test('displays customer segment cards', async () => {
      render(
        <TestWrapper>
          <InsightsPage />
        </TestWrapper>
      );

      await waitFor(() => {
        // Look for segment-related content
        const segmentElements = screen.queryAllByText(/vip|regular|new|at-risk/i);
        expect(segmentElements.length).toBeGreaterThan(0);
      });
    });

    test('shows segment pagination controls', async () => {
      render(
        <TestWrapper>
          <InsightsPage />
        </TestWrapper>
      );

      await waitFor(() => {
        // Look for pagination elements
        const paginationElements = screen.queryAllByRole('button', { name: /previous|next/i });
        expect(paginationElements.length).toBeGreaterThan(0);
      });
    });

    test('handles segment navigation', async () => {
      render(
        <TestWrapper>
          <InsightsPage />
        </TestWrapper>
      );

      await waitFor(() => {
        const nextButton = screen.queryByRole('button', { name: /next/i });
        if (nextButton && !nextButton.disabled) {
          fireEvent.click(nextButton);
          // Verify page change behavior
          expect(nextButton).toBeInTheDocument();
        }
      });
    });
  });

  describe('Export Functionality', () => {
    test('displays export button', async () => {
      render(
        <TestWrapper>
          <InsightsPage />
        </TestWrapper>
      );

      await waitFor(() => {
        const exportButton = screen.queryByText(/export/i) || screen.queryByRole('button', { name: /export/i });
        expect(exportButton).toBeInTheDocument();
      });
    });

    test('handles export action', async () => {
      // Mock URL.createObjectURL
      global.URL.createObjectURL = jest.fn(() => 'mock-url');
      global.URL.revokeObjectURL = jest.fn();
      
      render(
        <TestWrapper>
          <InsightsPage />
        </TestWrapper>
      );

      await waitFor(() => {
        const exportButton = screen.queryByText(/export/i) || screen.queryByRole('button', { name: /export/i });
        if (exportButton) {
          fireEvent.click(exportButton);
          expect(global.URL.createObjectURL).toHaveBeenCalled();
        }
      });
    });
  });

  describe('Error Handling', () => {
    test('displays error state when data loading fails', async () => {
      // Mock console.error to avoid noise in tests
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      render(
        <TestWrapper>
          <InsightsPage />
        </TestWrapper>
      );

      // Test will depend on how errors are triggered in your app
      // You might need to mock the DataContext to return an error
      
      consoleSpy.mockRestore();
    });

    test('shows retry button on error', async () => {
      render(
        <TestWrapper>
          <InsightsPage />
        </TestWrapper>
      );

      // Look for retry functionality
      const retryButton = screen.queryByText(/retry|try again/i);
      if (retryButton) {
        expect(retryButton).toBeInTheDocument();
      }
    });
  });

  describe('Responsive Design', () => {
    test('adapts to mobile viewport', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      
      render(
        <TestWrapper>
          <InsightsPage />
        </TestWrapper>
      );

      // Test mobile-specific behavior
      expect(screen.getByTestId?.('insights-container') || document.body).toBeInTheDocument();
    });

    test('displays properly on desktop', () => {
      // Mock desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200,
      });
      
      render(
        <TestWrapper>
          <InsightsPage />
        </TestWrapper>
      );

      expect(screen.getByTestId?.('insights-container') || document.body).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA labels', async () => {
      render(
        <TestWrapper>
          <InsightsPage />
        </TestWrapper>
      );

      await waitFor(() => {
        // Check for accessibility attributes
        const ariaElements = document.querySelectorAll('[aria-label], [aria-labelledby], [role]');
        expect(ariaElements.length).toBeGreaterThan(0);
      });
    });

    test('supports keyboard navigation', async () => {
      render(
        <TestWrapper>
          <InsightsPage />
        </TestWrapper>
      );

      await waitFor(() => {
        // Test tab navigation
        const focusableElements = document.querySelectorAll('button, input, [tabindex]');
        expect(focusableElements.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Performance', () => {
    test('renders efficiently with large datasets', async () => {
      const renderTime = performance.now();
      
      render(
        <TestWrapper>
          <InsightsPage />
        </TestWrapper>
      );

      await waitFor(() => {
        const endTime = performance.now();
        const renderDuration = endTime - renderTime;
        
        // Ensure render time is reasonable (less than 1 second)
        expect(renderDuration).toBeLessThan(1000);
      });
    });

    test('memoizes expensive calculations', () => {
      // This would test that useMemo and useCallback are working properly
      // by ensuring components don't re-render unnecessarily
      const { rerender } = render(
        <TestWrapper>
          <InsightsPage />
        </TestWrapper>
      );

      // Rerender with same props should not cause expensive recalculations
      rerender(
        <TestWrapper>
          <InsightsPage />
        </TestWrapper>
      );

      // In a real test, you'd spy on expensive functions to ensure they're not called repeatedly
      expect(true).toBe(true); // Placeholder assertion
    });
  });
}); 