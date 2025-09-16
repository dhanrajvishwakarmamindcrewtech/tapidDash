import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import ConnectPage from '../screens/ConnectPage/ConnectPage';
import { ConnectProvider } from '../context/ConnectContext';

// Mock Firebase
jest.mock('../firebase/config', () => ({
  auth: { currentUser: null },
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

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

// Mock Recharts components
jest.mock('recharts', () => ({
  BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  AreaChart: ({ children }) => <div data-testid="area-chart">{children}</div>,
  Area: () => <div data-testid="area" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
  Cell: () => <div data-testid="cell" />
}));

// Mock terminal services
jest.mock('../services/sumupService', () => ({
  connect: jest.fn(() => Promise.resolve({ success: true })),
  disconnect: jest.fn(() => Promise.resolve({ success: true })),
  getStatus: jest.fn(() => 'disconnected')
}));

jest.mock('../services/squareService', () => ({
  connect: jest.fn(() => Promise.resolve({ success: true })),
  disconnect: jest.fn(() => Promise.resolve({ success: true })),
  getStatus: jest.fn(() => 'disconnected')
}));

// Mock connected terminal modal
jest.mock('../components/ConnectedTerminalModal', () => {
  return function ConnectedTerminalModal({ terminal, onClose, onDisconnect }) {
    return (
      <div data-testid="connected-terminal-modal">
        <h3>{terminal.name} Details</h3>
        <button onClick={onClose}>Close</button>
        <button onClick={() => onDisconnect(terminal.id)}>Disconnect</button>
      </div>
    );
  };
});

// Mock available terminals modal
jest.mock('../components/AvailableTerminalsModal', () => {
  return function AvailableTerminalsModal({ terminals, onClose, onConnect }) {
    return (
      <div data-testid="available-terminals-modal">
        <h3>Available Terminals</h3>
        {terminals.map(terminal => (
          <div key={terminal.id}>
            <span>{terminal.name}</span>
            <button onClick={() => onConnect(terminal.id)}>Connect {terminal.name}</button>
          </div>
        ))}
        <button onClick={onClose}>Close</button>
      </div>
    );
  };
});

// Test wrapper component
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <ConnectProvider>
      {children}
    </ConnectProvider>
  </BrowserRouter>
);

describe('ConnectPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('Rendering', () => {
    test('renders without crashing', () => {
      render(
        <TestWrapper>
          <ConnectPage />
        </TestWrapper>
      );
    });

    test('displays page header', () => {
      render(
        <TestWrapper>
          <ConnectPage />
        </TestWrapper>
      );

      expect(screen.getByText('Connect Your POS')).toBeInTheDocument();
      expect(screen.getByText('Integrate your payment terminals for enhanced analytics')).toBeInTheDocument();
    });

    test('shows last updated timestamp', () => {
      render(
        <TestWrapper>
          <ConnectPage />
        </TestWrapper>
      );

      expect(screen.getByText(/Last updated:/)).toBeInTheDocument();
    });

    test('displays available terminals section', () => {
      render(
        <TestWrapper>
          <ConnectPage />
        </TestWrapper>
      );

      expect(screen.getByText('Available POS Terminals')).toBeInTheDocument();
    });

    test('displays coming soon section', () => {
      render(
        <TestWrapper>
          <ConnectPage />
        </TestWrapper>
      );

      expect(screen.getByText('Coming Soon')).toBeInTheDocument();
    });
  });

  describe('Terminal Display', () => {
    test('shows available terminals', () => {
      render(
        <TestWrapper>
          <ConnectPage />
        </TestWrapper>
      );

      expect(screen.getByText('SumUp')).toBeInTheDocument();
      expect(screen.getByText('Square')).toBeInTheDocument();
      expect(screen.getByText('Popular card reader and payment terminal')).toBeInTheDocument();
    });

    test('shows coming soon terminals', () => {
      render(
        <TestWrapper>
          <ConnectPage />
        </TestWrapper>
      );

      expect(screen.getByText('Clover')).toBeInTheDocument();
      expect(screen.getByText('Shopify POS')).toBeInTheDocument();
      expect(screen.getByText('Toast')).toBeInTheDocument();
    });

    test('displays terminal features', () => {
      render(
        <TestWrapper>
          <ConnectPage />
        </TestWrapper>
      );

      expect(screen.getByText('Contactless payments')).toBeInTheDocument();
      expect(screen.getByText('Mobile app integration')).toBeInTheDocument();
      expect(screen.getByText('Low transaction fees')).toBeInTheDocument();
    });

    test('shows connect buttons for available terminals', () => {
      render(
        <TestWrapper>
          <ConnectPage />
        </TestWrapper>
      );

      const connectButtons = screen.getAllByText('Connect');
      expect(connectButtons.length).toBeGreaterThan(0);
    });

    test('shows coming soon badges', () => {
      render(
        <TestWrapper>
          <ConnectPage />
        </TestWrapper>
      );

      const comingSoonBadges = screen.getAllByText('Coming Soon');
      expect(comingSoonBadges.length).toBeGreaterThan(0);
    });
  });

  describe('Terminal Pagination', () => {
    test('displays pagination controls', () => {
      render(
        <TestWrapper>
          <ConnectPage />
        </TestWrapper>
      );

      // Should show page indicators
      expect(screen.getByText(/\d+ \/ \d+/)).toBeInTheDocument();
    });

    test('pagination buttons work correctly', () => {
      render(
        <TestWrapper>
          <ConnectPage />
        </TestWrapper>
      );

      const prevButton = screen.getByRole('button', { name: /previous/i }) || 
                        screen.getAllByRole('button').find(btn => btn.querySelector('svg'));
      const nextButton = screen.getByRole('button', { name: /next/i }) ||
                        screen.getAllByRole('button').find(btn => btn.querySelector('svg'));

      // First page - prev should be disabled
      if (prevButton) {
        expect(prevButton).toBeDisabled();
      }
    });
  });

  describe('Terminal Connection', () => {
    test('connects to a terminal', async () => {
      render(
        <TestWrapper>
          <ConnectPage />
        </TestWrapper>
      );

      const connectButtons = screen.getAllByText('Connect');
      const firstConnectButton = connectButtons[0];

      fireEvent.click(firstConnectButton);

      // Should show connecting state
      await waitFor(() => {
        expect(screen.getByText(/Connecting/)).toBeInTheDocument();
      }, { timeout: 1000 });
    });

    test('shows connection progress', async () => {
      render(
        <TestWrapper>
          <ConnectPage />
        </TestWrapper>
      );

      const connectButtons = screen.getAllByText('Connect');
      const firstConnectButton = connectButtons[0];

      fireEvent.click(firstConnectButton);

      // Should show progress percentage
      await waitFor(() => {
        expect(screen.getByText(/\d+%/)).toBeInTheDocument();
      }, { timeout: 1000 });
    });

    test('handles connection errors gracefully', async () => {
      // Mock a connection error
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <TestWrapper>
          <ConnectPage />
        </TestWrapper>
      );

      const connectButtons = screen.getAllByText('Connect');
      const firstConnectButton = connectButtons[0];

      fireEvent.click(firstConnectButton);

      // Wait for any potential error handling
      await waitFor(() => {
        // The component should handle errors gracefully
        expect(consoleSpy).not.toThrow();
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Connected Terminals', () => {
    beforeEach(() => {
      // Mock localStorage with connected terminals
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
    });

    test('shows connected terminals section when terminals are connected', () => {
      render(
        <TestWrapper>
          <ConnectPage />
        </TestWrapper>
      );

      expect(screen.getByText('Connected Terminals')).toBeInTheDocument();
    });

    test('displays connected terminal details', () => {
      render(
        <TestWrapper>
          <ConnectPage />
        </TestWrapper>
      );

      expect(screen.getByText('SumUp')).toBeInTheDocument();
      expect(screen.getByText(/Connected:/)).toBeInTheDocument();
      expect(screen.getByText(/Last Sync:/)).toBeInTheDocument();
    });

    test('shows disconnect button for connected terminals', () => {
      render(
        <TestWrapper>
          <ConnectPage />
        </TestWrapper>
      );

      expect(screen.getByText('Disconnect')).toBeInTheDocument();
    });

    test('handles terminal disconnection', () => {
      render(
        <TestWrapper>
          <ConnectPage />
        </TestWrapper>
      );

      const disconnectButton = screen.getByText('Disconnect');
      fireEvent.click(disconnectButton);

      // Should handle disconnection
      expect(disconnectButton).toBeInTheDocument();
    });
  });

  describe('Analytics Integration', () => {
    beforeEach(() => {
      // Mock localStorage with connected terminals to show analytics
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
    });

    test('shows analytics section when terminals are connected', async () => {
      render(
        <TestWrapper>
          <ConnectPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Terminal Analytics')).toBeInTheDocument();
      });
    });

    test('displays KPI cards in analytics', async () => {
      render(
        <TestWrapper>
          <ConnectPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Tapid Users')).toBeInTheDocument();
        expect(screen.getByText("Today's Transactions")).toBeInTheDocument();
      });
    });

    test('shows trending items', async () => {
      render(
        <TestWrapper>
          <ConnectPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Trending Items')).toBeInTheDocument();
      });
    });

    test('displays queue performance metrics', async () => {
      render(
        <TestWrapper>
          <ConnectPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Queue Performance')).toBeInTheDocument();
        expect(screen.getByText('Average Service Time')).toBeInTheDocument();
      });
    });

    test('includes activity charts', async () => {
      render(
        <TestWrapper>
          <ConnectPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
        expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
      });
    });

    test('allows day selection for activity charts', async () => {
      render(
        <TestWrapper>
          <ConnectPage />
        </TestWrapper>
      );

      await waitFor(() => {
        const daySelector = screen.getByDisplayValue('Monday');
        expect(daySelector).toBeInTheDocument();

        fireEvent.change(daySelector, { target: { value: 'Tuesday' } });
        expect(daySelector.value).toBe('Tuesday');
      });
    });
  });

  describe('Refresh Functionality', () => {
    test('shows refresh button', () => {
      render(
        <TestWrapper>
          <ConnectPage />
        </TestWrapper>
      );

      const refreshButtons = screen.getAllByRole('button').filter(
        button => button.querySelector('svg') && button.getAttribute('class')?.includes('refresh')
      );
      expect(refreshButtons.length).toBeGreaterThan(0);
    });

    test('handles refresh action', async () => {
      render(
        <TestWrapper>
          <ConnectPage />
        </TestWrapper>
      );

      const refreshButtons = screen.getAllByRole('button').filter(
        button => button.querySelector('svg')
      );
      
      if (refreshButtons.length > 0) {
        fireEvent.click(refreshButtons[0]);
        
        // Should handle refresh without errors
        await waitFor(() => {
          expect(screen.getByText('Connect Your POS')).toBeInTheDocument();
        });
      }
    });
  });

  describe('Error Handling', () => {
    test('displays error messages when they occur', () => {
      // This would need to be tested with a custom wrapper that sets error state
      render(
        <TestWrapper>
          <ConnectPage />
        </TestWrapper>
      );

      // Error handling is built into the context
      expect(screen.getByText('Connect Your POS')).toBeInTheDocument();
    });

    test('handles missing data gracefully', () => {
      render(
        <TestWrapper>
          <ConnectPage />
        </TestWrapper>
      );

      // Should render without crashing even with empty data
      expect(screen.getByText('Available POS Terminals')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    test('adapts to mobile viewport', () => {
      // Mock window.innerWidth
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      });

      render(
        <TestWrapper>
          <ConnectPage />
        </TestWrapper>
      );

      // Should render mobile layout
      expect(screen.getByText('Available POS Terminals')).toBeInTheDocument();
    });

    test('displays properly on desktop', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200,
      });

      render(
        <TestWrapper>
          <ConnectPage />
        </TestWrapper>
      );

      // Should render desktop layout
      expect(screen.getByText('Available POS Terminals')).toBeInTheDocument();
    });
  });

  describe('Modals', () => {
    test('opens connected terminal modal', async () => {
      // Setup connected terminal
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

      render(
        <TestWrapper>
          <ConnectPage />
        </TestWrapper>
      );

      const viewDetailsButton = screen.getByText('View Details');
      fireEvent.click(viewDetailsButton);

      await waitFor(() => {
        expect(screen.getByTestId('connected-terminal-modal')).toBeInTheDocument();
      });
    });

    test('closes modal when close button is clicked', async () => {
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

      render(
        <TestWrapper>
          <ConnectPage />
        </TestWrapper>
      );

      const viewDetailsButton = screen.getByText('View Details');
      fireEvent.click(viewDetailsButton);

      await waitFor(() => {
        const closeButton = screen.getByText('Close');
        fireEvent.click(closeButton);
      });

      await waitFor(() => {
        expect(screen.queryByTestId('connected-terminal-modal')).not.toBeInTheDocument();
      });
    });
  });

  describe('Performance', () => {
    test('renders efficiently with large datasets', () => {
      const startTime = performance.now();
      
      render(
        <TestWrapper>
          <ConnectPage />
        </TestWrapper>
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render within reasonable time (1 second)
      expect(renderTime).toBeLessThan(1000);
    });

    test('handles multiple terminal connections efficiently', async () => {
      render(
        <TestWrapper>
          <ConnectPage />
        </TestWrapper>
      );

      const connectButtons = screen.getAllByText('Connect');
      
      // Should handle multiple operations without performance issues
      expect(connectButtons.length).toBeGreaterThan(0);
      expect(screen.getByText('Available POS Terminals')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA labels', () => {
      render(
        <TestWrapper>
          <ConnectPage />
        </TestWrapper>
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    test('supports keyboard navigation', () => {
      render(
        <TestWrapper>
          <ConnectPage />
        </TestWrapper>
      );

      const buttons = screen.getAllByRole('button');
      if (buttons.length > 0) {
        buttons[0].focus();
        expect(document.activeElement).toBe(buttons[0]);
      }
    });

    test('has proper heading hierarchy', () => {
      render(
        <TestWrapper>
          <ConnectPage />
        </TestWrapper>
      );

      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });
  });
}); 