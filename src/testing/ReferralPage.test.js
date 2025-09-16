import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import ReferralPage from '../screens/ReferralPage/ReferralPage';
import { ToastProvider } from '../components/ToastSystem';
import ErrorBoundary from '../components/ErrorBoundary';
import safeStorage from '../utils/safeStorage';

// Mock dependencies
jest.mock('../utils/safeStorage');

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate
}));

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockResolvedValue(undefined)
  }
});

// Helper to render component with providers
const renderWithProviders = (component) => {
  return render(
    <ErrorBoundary>
      <ToastProvider>
        {component}
      </ToastProvider>
    </ErrorBoundary>
  );
};

describe('ReferralPage', () => {
  let mockSafeStorage;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    mockNavigate.mockClear();
    navigator.clipboard.writeText.mockClear();
    
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
      renderWithProviders(<ReferralPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Referral Program')).toBeInTheDocument();
      });
    });

    test('shows loading skeleton initially', () => {
      renderWithProviders(<ReferralPage />);
      
      // Should show loading indicators initially
      const loadingElements = screen.getAllByRole('progressbar', { hidden: true });
      expect(loadingElements.length).toBeGreaterThan(0);
    });
  });

  describe('Data Loading and Integration', () => {
    test('loads campaign data from Launch Pad successfully', async () => {
      const mockCampaign = {
        name: 'Test Campaign',
        description: 'Test Description',
        rewards: {
          tier1: { points: 500, rewardText: 'Free Coffee' },
          tier2: { points: 1000, rewardText: 'Free Lunch' }
        }
      };

      mockSafeStorage.getItem.mockImplementation((key) => {
        if (key === 'launchpad_campaign') {
          return { success: true, data: mockCampaign };
        }
        return { success: true, data: null };
      });

      renderWithProviders(<ReferralPage />);

      await waitFor(() => {
        // Should show "Create Referral Program" since rewards are available
        expect(screen.getByText('Create Referral Program')).toBeInTheDocument();
      });
    });

    test('shows "Set Up Rewards First" when no campaign exists', async () => {
      mockSafeStorage.getItem.mockReturnValue({ success: true, data: null });

      renderWithProviders(<ReferralPage />);

      await waitFor(() => {
        expect(screen.getByText('Set Up Rewards First')).toBeInTheDocument();
        expect(screen.getByText('Rewards are required to create referral programs')).toBeInTheDocument();
      });
    });

    test('loads existing referral program from storage', async () => {
      const mockProgram = {
        active: true,
        paused: false,
        pointsReward: 150,
        isTapidSponsored: true,
        tapidLimit: 500,
        tapidCode: 'tapid500',
        referralCode: 'REF2024TEST'
      };

      mockSafeStorage.getItem.mockImplementation((key) => {
        if (key === 'referral_program') {
          return { success: true, data: mockProgram };
        }
        if (key === 'launchpad_campaign') {
          return { 
            success: true, 
            data: { rewards: { tier1: { points: 500, rewardText: 'Test Reward' } } }
          };
        }
        return { success: true, data: null };
      });

      renderWithProviders(<ReferralPage />);

      await waitFor(() => {
        expect(screen.getByText('Referral Program Status')).toBeInTheDocument();
        expect(screen.getByText('Active')).toBeInTheDocument();
      });
    });

    test('handles storage errors gracefully', async () => {
      mockSafeStorage.getItem.mockReturnValue({
        success: false,
        error: { type: 'CORRUPTED_DATA', message: 'Data corrupted' }
      });

      renderWithProviders(<ReferralPage />);

      await waitFor(() => {
        // Should still render without crashing
        expect(screen.getByText('Referral Program')).toBeInTheDocument();
      });
    });
  });

  describe('Program Creation', () => {
    test('opens create program modal', async () => {
      // Mock campaign with rewards
      mockSafeStorage.getItem.mockImplementation((key) => {
        if (key === 'launchpad_campaign') {
          return { 
            success: true, 
            data: { rewards: { tier1: { points: 500, rewardText: 'Test Reward' } } }
          };
        }
        return { success: true, data: null };
      });

      renderWithProviders(<ReferralPage />);
      
      await waitFor(() => {
        const createButton = screen.getByText('Create Referral Program');
        fireEvent.click(createButton);
      });

      expect(screen.getByText('Create Referral Program')).toBeInTheDocument();
      expect(screen.getByText('Points Reward')).toBeInTheDocument();
    });

    test('creates self-managed program successfully', async () => {
      const user = userEvent.setup();
      
      // Mock campaign with rewards
      mockSafeStorage.getItem.mockImplementation((key) => {
        if (key === 'launchpad_campaign') {
          return { 
            success: true, 
            data: { rewards: { tier1: { points: 500, rewardText: 'Test Reward' } } }
          };
        }
        return { success: true, data: null };
      });

      renderWithProviders(<ReferralPage />);
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Create Referral Program'));
      });

      // Set points and create program
      const slider = screen.getByRole('slider');
      fireEvent.change(slider, { target: { value: '200' } });

      const launchButton = screen.getByText('Launch Program');
      fireEvent.click(launchButton);

      await waitFor(() => {
        expect(mockSafeStorage.setItem).toHaveBeenCalledWith(
          'referral_program',
          expect.objectContaining({
            active: true,
            pointsReward: 200,
            isTapidSponsored: false
          })
        );
      });
    });

    test('creates Tapid-sponsored program successfully', async () => {
      const user = userEvent.setup();
      
      // Mock campaign with rewards
      mockSafeStorage.getItem.mockImplementation((key) => {
        if (key === 'launchpad_campaign') {
          return { 
            success: true, 
            data: { rewards: { tier1: { points: 500, rewardText: 'Test Reward' } } }
          };
        }
        return { success: true, data: null };
      });

      renderWithProviders(<ReferralPage />);
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Create Referral Program'));
      });

      // Enter Tapid code
      const codeInput = screen.getByPlaceholderText(/enter activation code/i);
      await user.type(codeInput, 'TAPID500');

      const launchButton = screen.getByText('Launch Program');
      fireEvent.click(launchButton);

      await waitFor(() => {
        expect(mockSafeStorage.setItem).toHaveBeenCalledWith(
          'referral_program',
          expect.objectContaining({
            active: true,
            isTapidSponsored: true,
            tapidLimit: 500,
            tapidCode: 'tapid500'
          })
        );
      });
    });

    test('handles creation errors gracefully', async () => {
      mockSafeStorage.setItem.mockReturnValue({
        success: false,
        error: { type: 'QUOTA_EXCEEDED', message: 'Storage quota exceeded' }
      });

      // Mock campaign with rewards
      mockSafeStorage.getItem.mockImplementation((key) => {
        if (key === 'launchpad_campaign') {
          return { 
            success: true, 
            data: { rewards: { tier1: { points: 500, rewardText: 'Test Reward' } } }
          };
        }
        return { success: true, data: null };
      });

      renderWithProviders(<ReferralPage />);
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Create Referral Program'));
      });

      fireEvent.click(screen.getByText('Launch Program'));

      await waitFor(() => {
        // Should show error without crashing
        expect(screen.getByText('Launch Program')).toBeInTheDocument();
      });
    });
  });

  describe('Program Management', () => {
    beforeEach(() => {
      // Setup active program
      const mockProgram = {
        active: true,
        paused: false,
        pointsReward: 150,
        isTapidSponsored: true,
        tapidLimit: 500,
        tapidCode: 'tapid500',
        referralCode: 'REF2024TEST'
      };

      mockSafeStorage.getItem.mockImplementation((key) => {
        if (key === 'referral_program') {
          return { success: true, data: mockProgram };
        }
        if (key === 'launchpad_campaign') {
          return { 
            success: true, 
            data: { rewards: { tier1: { points: 500, rewardText: 'Test Reward' } } }
          };
        }
        return { success: true, data: null };
      });
    });

    test('pauses program successfully', async () => {
      renderWithProviders(<ReferralPage />);

      await waitFor(() => {
        expect(screen.getByText('Active')).toBeInTheDocument();
      });

      // Click actions menu
      const actionsButton = screen.getByLabelText(/more actions/i);
      fireEvent.click(actionsButton);

      const pauseButton = screen.getByText('Pause Program');
      fireEvent.click(pauseButton);

      await waitFor(() => {
        expect(mockSafeStorage.setItem).toHaveBeenCalledWith(
          'referral_program',
          expect.objectContaining({
            paused: true
          })
        );
      });
    });

    test('deletes program successfully', async () => {
      renderWithProviders(<ReferralPage />);

      await waitFor(() => {
        expect(screen.getByText('Active')).toBeInTheDocument();
      });

      // Click actions menu
      const actionsButton = screen.getByLabelText(/more actions/i);
      fireEvent.click(actionsButton);

      const deleteButton = screen.getByText('Delete Program');
      fireEvent.click(deleteButton);

      // Confirm deletion
      const confirmButton = screen.getByText('Delete Program');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockSafeStorage.removeItem).toHaveBeenCalledWith('referral_program');
      });
    });
  });

  describe('Clipboard Operations', () => {
    beforeEach(() => {
      // Setup active program
      const mockProgram = {
        active: true,
        paused: false,
        pointsReward: 150,
        isTapidSponsored: false,
        referralCode: 'REF2024TEST'
      };

      mockSafeStorage.getItem.mockImplementation((key) => {
        if (key === 'referral_program') {
          return { success: true, data: mockProgram };
        }
        if (key === 'launchpad_campaign') {
          return { 
            success: true, 
            data: { rewards: { tier1: { points: 500, rewardText: 'Test Reward' } } }
          };
        }
        return { success: true, data: null };
      });
    });

    test('copies referral code successfully', async () => {
      renderWithProviders(<ReferralPage />);

      await waitFor(() => {
        expect(screen.getByText('REF2024TEST')).toBeInTheDocument();
      });

      const copyButton = screen.getByText('Copy');
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith('REF2024TEST');
        expect(screen.getByText('Copied!')).toBeInTheDocument();
      });
    });

    test('handles clipboard errors gracefully', async () => {
      navigator.clipboard.writeText.mockRejectedValue(new Error('Clipboard not supported'));

      renderWithProviders(<ReferralPage />);

      await waitFor(() => {
        expect(screen.getByText('REF2024TEST')).toBeInTheDocument();
      });

      const copyButton = screen.getByText('Copy');
      fireEvent.click(copyButton);

      await waitFor(() => {
        // Should handle error gracefully without crashing
        expect(screen.getByText('Copy')).toBeInTheDocument();
      });
    });

    test('uses fallback copy method when clipboard API unavailable', async () => {
      // Mock no clipboard API
      delete navigator.clipboard;

      // Mock document methods
      const mockTextArea = {
        value: '',
        select: jest.fn(),
        remove: jest.fn()
      };
      
      const createElementSpy = jest.spyOn(document, 'createElement').mockReturnValue(mockTextArea);
      const appendChildSpy = jest.spyOn(document.body, 'appendChild').mockImplementation(() => {});
      const removeChildSpy = jest.spyOn(document.body, 'removeChild').mockImplementation(() => {});
      const execCommandSpy = jest.spyOn(document, 'execCommand').mockReturnValue(true);

      renderWithProviders(<ReferralPage />);

      await waitFor(() => {
        expect(screen.getByText('REF2024TEST')).toBeInTheDocument();
      });

      const copyButton = screen.getByText('Copy');
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(createElementSpy).toHaveBeenCalledWith('textarea');
        expect(execCommandSpy).toHaveBeenCalledWith('copy');
      });

      // Cleanup
      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
      execCommandSpy.mockRestore();
    });
  });

  describe('Loading States', () => {
    test('shows loading state during program creation', async () => {
      // Mock delayed response
      mockSafeStorage.setItem.mockImplementation(() => 
        new Promise(resolve => 
          setTimeout(() => resolve({ success: true }), 100)
        )
      );

      // Mock campaign with rewards
      mockSafeStorage.getItem.mockImplementation((key) => {
        if (key === 'launchpad_campaign') {
          return { 
            success: true, 
            data: { rewards: { tier1: { points: 500, rewardText: 'Test Reward' } } }
          };
        }
        return { success: true, data: null };
      });

      renderWithProviders(<ReferralPage />);
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Create Referral Program'));
      });

      fireEvent.click(screen.getByText('Launch Program'));

      // Should show loading state
      expect(screen.getByText('Creating Program...')).toBeInTheDocument();
    });

    test('shows loading state during copy operation', async () => {
      // Mock delayed clipboard response
      navigator.clipboard.writeText.mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      );

      // Setup active program
      mockSafeStorage.getItem.mockImplementation((key) => {
        if (key === 'referral_program') {
          return { 
            success: true, 
            data: { 
              active: true, 
              referralCode: 'REF2024TEST' 
            }
          };
        }
        return { success: true, data: null };
      });

      renderWithProviders(<ReferralPage />);

      await waitFor(() => {
        expect(screen.getByText('REF2024TEST')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Copy'));

      expect(screen.getByText('Copying...')).toBeInTheDocument();
    });
  });

  describe('Navigation Integration', () => {
    test('navigates to Launch Pad when clicking "Set Up Rewards First"', async () => {
      mockSafeStorage.getItem.mockReturnValue({ success: true, data: null });

      renderWithProviders(<ReferralPage />);

      await waitFor(() => {
        const setupButton = screen.getByText('Set Up Rewards First');
        fireEvent.click(setupButton);
      });

      expect(mockNavigate).toHaveBeenCalledWith('/control-center');
    });
  });

  describe('Reward Integration', () => {
    test('displays available rewards from campaign', async () => {
      const mockCampaign = {
        rewards: {
          tier1: { points: 500, rewardText: 'Free Coffee' },
          tier2: { points: 1000, rewardText: 'Free Lunch' }
        }
      };

      mockSafeStorage.getItem.mockImplementation((key) => {
        if (key === 'launchpad_campaign') {
          return { success: true, data: mockCampaign };
        }
        return { success: true, data: null };
      });

      renderWithProviders(<ReferralPage />);
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Create Referral Program'));
      });

      // Should show reward callouts
      expect(screen.getByText('Available Rewards at')).toBeInTheDocument();
      expect(screen.getByText('Free Coffee')).toBeInTheDocument();
    });

    test('updates rewards display when points change', async () => {
      const mockCampaign = {
        rewards: {
          tier1: { points: 500, rewardText: 'Free Coffee' },
          tier2: { points: 1000, rewardText: 'Free Lunch' }
        }
      };

      mockSafeStorage.getItem.mockImplementation((key) => {
        if (key === 'launchpad_campaign') {
          return { success: true, data: mockCampaign };
        }
        return { success: true, data: null };
      });

      renderWithProviders(<ReferralPage />);
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Create Referral Program'));
      });

      // Change slider to higher value
      const slider = screen.getByRole('slider');
      fireEvent.change(slider, { target: { value: '1000' } });

      // Should now show both rewards
      expect(screen.getByText('Free Coffee')).toBeInTheDocument();
      expect(screen.getByText('Free Lunch')).toBeInTheDocument();
    });
  });

  describe('Error Boundaries', () => {
    test('catches and handles component errors', () => {
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
      // Mock campaign with rewards
      mockSafeStorage.getItem.mockImplementation((key) => {
        if (key === 'launchpad_campaign') {
          return { 
            success: true, 
            data: { rewards: { tier1: { points: 500, rewardText: 'Test Reward' } } }
          };
        }
        return { success: true, data: null };
      });

      renderWithProviders(<ReferralPage />);
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create referral program/i })).toBeInTheDocument();
      });
    });

    test('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      
      // Mock campaign with rewards
      mockSafeStorage.getItem.mockImplementation((key) => {
        if (key === 'launchpad_campaign') {
          return { 
            success: true, 
            data: { rewards: { tier1: { points: 500, rewardText: 'Test Reward' } } }
          };
        }
        return { success: true, data: null };
      });

      renderWithProviders(<ReferralPage />);
      
      await waitFor(() => {
        const createButton = screen.getByText('Create Referral Program');
        createButton.focus();
        expect(createButton).toHaveFocus();
      });

      await user.keyboard('{Enter}');
      
      await waitFor(() => {
        expect(screen.getByText('Points Reward')).toBeInTheDocument();
      });
    });
  });

  describe('Performance', () => {
    test('renders efficiently', async () => {
      const startTime = performance.now();
      
      renderWithProviders(<ReferralPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Referral Program')).toBeInTheDocument();
      });
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render within reasonable time (1 second)
      expect(renderTime).toBeLessThan(1000);
    });
  });
}); 