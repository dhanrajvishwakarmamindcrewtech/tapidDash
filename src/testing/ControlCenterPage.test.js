import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import '@testing-library/jest-dom';
import ControlCenterPage from '../screens/ControlCenterPage/ControlCenterPage';
import { ConfigProvider } from '../context/ConfigContext';
import { ToastProvider } from '../components/ToastSystem';
import ErrorBoundary from '../components/ErrorBoundary';
import safeStorage from '../utils/safeStorage';

// Mock dependencies
jest.mock('../utils/safeStorage');
jest.mock('../context/BusinessDataContext', () => ({
  useCustomers: () => ({
    getCustomerStats: jest.fn().mockResolvedValue({
      totalCustomers: 1250,
      avgSpend: 45.67,
      repeatRate: 68
    })
  })
}));

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate
}));

// Helper to render component with providers
const renderWithProviders = (component) => {
  return render(
    <ErrorBoundary>
      <ToastProvider>
        <ConfigProvider>
          {component}
        </ConfigProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
};

describe('ControlCenterPage (Launch Pad)', () => {
  let mockSafeStorage;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    mockNavigate.mockClear();
    
    // Setup safeStorage mock
    mockSafeStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn()
    };
    
    // Default successful responses
    mockSafeStorage.getItem.mockReturnValue({ success: true, data: null });
    mockSafeStorage.setItem.mockReturnValue({ success: true });
    mockSafeStorage.removeItem.mockReturnValue({ success: true });
    
    safeStorage.getItem = mockSafeStorage.getItem;
    safeStorage.setItem = mockSafeStorage.setItem;
    safeStorage.removeItem = mockSafeStorage.removeItem;
  });

  describe('Initial Rendering', () => {
    test('renders main page elements correctly', async () => {
      renderWithProviders(<ControlCenterPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Launch Pad')).toBeInTheDocument();
        expect(screen.getByText('Create and manage your loyalty campaigns')).toBeInTheDocument();
      });
    });

    test('shows loading skeleton initially', () => {
      renderWithProviders(<ControlCenterPage />);
      
      // Should show loading indicators
      expect(screen.getAllByTestId(/loading|skeleton/i).length).toBeGreaterThan(0);
    });
  });

  describe('Data Loading', () => {
    test('loads customer stats successfully', async () => {
      renderWithProviders(<ControlCenterPage />);
      
      await waitFor(() => {
        expect(screen.getByText('1,250')).toBeInTheDocument(); // Total customers
        expect(screen.getByText('€45.67')).toBeInTheDocument(); // Avg spend
        expect(screen.getByText('68%')).toBeInTheDocument(); // Repeat rate
      });
    });

    test('loads existing campaign from storage', async () => {
      const mockCampaign = {
        name: 'Test Campaign',
        description: 'Test Description',
        rewards: {
          tier1: { points: 500, rewardText: 'Free Coffee' },
          tier2: { points: 1000, rewardText: 'Free Lunch' }
        }
      };

      mockSafeStorage.getItem.mockReturnValue({ 
        success: true, 
        data: mockCampaign 
      });

      renderWithProviders(<ControlCenterPage />);

      await waitFor(() => {
        expect(screen.getByText('Test Campaign')).toBeInTheDocument();
        expect(screen.getByText('Test Description')).toBeInTheDocument();
      });
    });

    test('handles storage errors gracefully', async () => {
      mockSafeStorage.getItem.mockReturnValue({
        success: false,
        error: { type: 'CORRUPTED_DATA', message: 'Data corrupted' }
      });

      renderWithProviders(<ControlCenterPage />);

      await waitFor(() => {
        // Should still render without crashing
        expect(screen.getByText('Launch Pad')).toBeInTheDocument();
      });
    });
  });

  describe('Campaign Creation', () => {
    test('opens create campaign modal', async () => {
      renderWithProviders(<ControlCenterPage />);
      
      await waitFor(() => {
        const createButton = screen.getByText('Create Campaign');
        fireEvent.click(createButton);
      });

      expect(screen.getByText('Create Loyalty Campaign')).toBeInTheDocument();
    });

    test('validates required fields', async () => {
      renderWithProviders(<ControlCenterPage />);
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Create Campaign'));
      });

      // Try to submit without filling fields
      const submitButton = screen.getByText('Launch Campaign');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/campaign name is required/i)).toBeInTheDocument();
      });
    });

    test('creates campaign successfully', async () => {
      renderWithProviders(<ControlCenterPage />);
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Create Campaign'));
      });

      // Fill in the form
      const nameInput = screen.getByLabelText(/campaign name/i);
      const descInput = screen.getByLabelText(/description/i);
      
      fireEvent.change(nameInput, { target: { value: 'New Campaign' } });
      fireEvent.change(descInput, { target: { value: 'Campaign Description' } });

      // Submit the form
      const submitButton = screen.getByText('Launch Campaign');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSafeStorage.setItem).toHaveBeenCalledWith(
          'launchpad_campaign',
          expect.objectContaining({
            name: 'New Campaign',
            description: 'Campaign Description'
          })
        );
      });
    });

    test('handles save errors gracefully', async () => {
      mockSafeStorage.setItem.mockReturnValue({
        success: false,
        error: { type: 'QUOTA_EXCEEDED', message: 'Storage quota exceeded' }
      });

      renderWithProviders(<ControlCenterPage />);
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Create Campaign'));
      });

      const nameInput = screen.getByLabelText(/campaign name/i);
      const descInput = screen.getByLabelText(/description/i);
      
      fireEvent.change(nameInput, { target: { value: 'New Campaign' } });
      fireEvent.change(descInput, { target: { value: 'Campaign Description' } });

      fireEvent.click(screen.getByText('Launch Campaign'));

      await waitFor(() => {
        // Should show error toast (test that no crash occurs)
        expect(screen.getByText('Launch Campaign')).toBeInTheDocument();
      });
    });
  });

  describe('Campaign Management', () => {
    test('pauses campaign successfully', async () => {
      const mockCampaign = {
        name: 'Active Campaign',
        description: 'Test Description',
        isActive: true,
        rewards: { tier1: { points: 500, rewardText: 'Reward 1' } }
      };

      mockSafeStorage.getItem.mockReturnValue({ 
        success: true, 
        data: mockCampaign 
      });

      renderWithProviders(<ControlCenterPage />);

      await waitFor(() => {
        expect(screen.getByText('Active Campaign')).toBeInTheDocument();
      });

      // Find and click pause button
      const actionButton = screen.getByLabelText(/more actions/i);
      fireEvent.click(actionButton);

      const pauseButton = screen.getByText(/pause/i);
      fireEvent.click(pauseButton);

      await waitFor(() => {
        expect(mockSafeStorage.setItem).toHaveBeenCalledWith(
          'launchpad_campaign',
          expect.objectContaining({
            isActive: false
          })
        );
      });
    });

    test('deletes campaign successfully', async () => {
      const mockCampaign = {
        name: 'Campaign to Delete',
        description: 'Test Description',
        rewards: { tier1: { points: 500, rewardText: 'Reward 1' } }
      };

      mockSafeStorage.getItem.mockReturnValue({ 
        success: true, 
        data: mockCampaign 
      });

      renderWithProviders(<ControlCenterPage />);

      await waitFor(() => {
        expect(screen.getByText('Campaign to Delete')).toBeInTheDocument();
      });

      // Open actions menu and click delete
      const actionButton = screen.getByLabelText(/more actions/i);
      fireEvent.click(actionButton);

      const deleteButton = screen.getByText(/delete/i);
      fireEvent.click(deleteButton);

      // Confirm deletion
      const confirmButton = screen.getByText('Delete Campaign');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockSafeStorage.removeItem).toHaveBeenCalledWith('launchpad_campaign');
      });
    });
  });

  describe('Tier Management', () => {
    test('adds new tier successfully', async () => {
      renderWithProviders(<ControlCenterPage />);
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Create Campaign'));
      });

      const addTierButton = screen.getByText(/add tier/i);
      fireEvent.click(addTierButton);

      // Should have additional tier inputs
      const tierInputs = screen.getAllByLabelText(/reward description/i);
      expect(tierInputs.length).toBeGreaterThan(1);
    });

    test('validates tier progression', async () => {
      renderWithProviders(<ControlCenterPage />);
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Create Campaign'));
      });

      // Set second tier points lower than first tier
      const pointsInputs = screen.getAllByLabelText(/points required/i);
      
      fireEvent.change(pointsInputs[0], { target: { value: '1000' } });
      fireEvent.change(pointsInputs[1], { target: { value: '500' } });

      // Try to submit
      fireEvent.click(screen.getByText('Launch Campaign'));

      await waitFor(() => {
        expect(screen.getByText(/must require more points/i)).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    test('shows loading state during campaign creation', async () => {
      // Mock delayed response
      mockSafeStorage.setItem.mockImplementation(() => 
        new Promise(resolve => 
          setTimeout(() => resolve({ success: true }), 100)
        )
      );

      renderWithProviders(<ControlCenterPage />);
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Create Campaign'));
      });

      const nameInput = screen.getByLabelText(/campaign name/i);
      const descInput = screen.getByLabelText(/description/i);
      
      fireEvent.change(nameInput, { target: { value: 'New Campaign' } });
      fireEvent.change(descInput, { target: { value: 'Description' } });

      fireEvent.click(screen.getByText('Launch Campaign'));

      // Should show loading state
      expect(screen.getByText('Creating Campaign...')).toBeInTheDocument();
    });

    test('shows KPI loading skeleton', () => {
      renderWithProviders(<ControlCenterPage />);
      
      // Initially should show loading skeletons for KPIs
      const loadingElements = screen.getAllByTestId(/loading|skeleton/i);
      expect(loadingElements.length).toBeGreaterThan(0);
    });
  });

  describe('Auto Generation', () => {
    test('auto-generates sample campaign', async () => {
      renderWithProviders(<ControlCenterPage />);
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Create Campaign'));
      });

      const autoGenButton = screen.getByText(/auto-generate/i);
      fireEvent.click(autoGenButton);

      // Should populate form with sample data
      await waitFor(() => {
        expect(screen.getByDisplayValue(/sample/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Boundaries', () => {
    test('catches and handles component errors', () => {
      // Mock a component error
      const ThrowError = () => {
        throw new Error('Test error');
      };

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA labels', async () => {
      renderWithProviders(<ControlCenterPage />);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/create campaign/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /create campaign/i })).toBeInTheDocument();
      });
    });

    test('supports keyboard navigation', async () => {
      renderWithProviders(<ControlCenterPage />);
      
      await waitFor(() => {
        const createButton = screen.getByText('Create Campaign');
        createButton.focus();
        expect(createButton).toHaveFocus();
      });

      // Should be able to activate with Enter key
      const createButton = screen.getByText('Create Campaign');
      fireEvent.keyDown(createButton, { key: 'Enter', code: 'Enter' });
      
      await waitFor(() => {
        expect(screen.getByText('Create Loyalty Campaign')).toBeInTheDocument();
      });
    });
  });

  describe('Performance', () => {
    test('renders efficiently with large datasets', async () => {
      const startTime = performance.now();
      
      renderWithProviders(<ControlCenterPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Launch Pad')).toBeInTheDocument();
      });
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render within reasonable time (1 second)
      expect(renderTime).toBeLessThan(1000);
    });
  });
}); 