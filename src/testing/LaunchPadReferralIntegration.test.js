import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ControlCenterPage from '../screens/ControlCenterPage/ControlCenterPage';
import ReferralPage from '../screens/ReferralPage/ReferralPage';
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

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockResolvedValue(undefined)
  }
});

// Helper to render both components in a router
const renderIntegratedApp = (initialRoute = '/control-center') => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <ErrorBoundary>
        <ToastProvider>
          <ConfigProvider>
            <Routes>
              <Route path="/control-center" element={<ControlCenterPage />} />
              <Route path="/referrals" element={<ReferralPage />} />
            </Routes>
          </ConfigProvider>
        </ToastProvider>
      </ErrorBoundary>
    </MemoryRouter>
  );
};

describe('Launch Pad ↔ Referral Page Integration', () => {
  let mockSafeStorage;
  let storageData = {};

  beforeEach(() => {
    // Reset mocks and storage
    jest.clearAllMocks();
    navigator.clipboard.writeText.mockClear();
    storageData = {};
    
    // Setup safeStorage mock that simulates real storage
    mockSafeStorage = {
      getItem: jest.fn((key) => {
        if (storageData[key]) {
          return { success: true, data: storageData[key] };
        }
        return { success: true, data: null };
      }),
      setItem: jest.fn((key, data) => {
        storageData[key] = data;
        return { success: true };
      }),
      removeItem: jest.fn((key) => {
        delete storageData[key];
        return { success: true };
      })
    };
    
    safeStorage.getItem = mockSafeStorage.getItem;
    safeStorage.setItem = mockSafeStorage.setItem;
    safeStorage.removeItem = mockSafeStorage.removeItem;
  });

  describe('Campaign Creation Flow', () => {
    test('creates campaign in Launch Pad and enables referral creation', async () => {
      const user = userEvent.setup();
      
      // Start in Launch Pad
      renderIntegratedApp('/control-center');
      
      await waitFor(() => {
        expect(screen.getByText('Launch Pad')).toBeInTheDocument();
      });

      // Create a campaign
      const createButton = screen.getByText('Create Campaign');
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(screen.getByText('Create Loyalty Campaign')).toBeInTheDocument();
      });

      // Fill in campaign details
      await user.type(screen.getByLabelText(/campaign name/i), 'Integration Test Campaign');
      await user.type(screen.getByLabelText(/description/i), 'Test campaign for integration');

      // Set up reward tiers
      const rewardInputs = screen.getAllByLabelText(/reward description/i);
      await user.clear(rewardInputs[0]);
      await user.type(rewardInputs[0], 'Free Coffee');

      if (rewardInputs[1]) {
        await user.clear(rewardInputs[1]);
        await user.type(rewardInputs[1], 'Free Lunch');
      }

      // Submit the campaign
      fireEvent.click(screen.getByText('Launch Campaign'));

      await waitFor(() => {
        // Verify campaign was saved
        expect(storageData['launchpad_campaign']).toBeDefined();
        expect(storageData['launchpad_campaign'].name).toBe('Integration Test Campaign');
        expect(storageData['launchpad_campaign'].rewards).toBeDefined();
      });

      // Now navigate to Referral Page (simulate user navigation)
      renderIntegratedApp('/referrals');

      await waitFor(() => {
        // Should show "Create Referral Program" since campaign exists
        expect(screen.getByText('Create Referral Program')).toBeInTheDocument();
        expect(screen.queryByText('Set Up Rewards First')).not.toBeInTheDocument();
      });
    });

    test('shows correct reward preview in referral creation modal', async () => {
      // Pre-populate with a campaign
      storageData['launchpad_campaign'] = {
        name: 'Reward Preview Test',
        description: 'Test Description',
        rewards: {
          tier1: { points: 500, rewardText: 'Free Coffee' },
          tier2: { points: 1000, rewardText: 'Free Meal' },
          tier3: { points: 2000, rewardText: 'VIP Status' }
        }
      };

      renderIntegratedApp('/referrals');

      await waitFor(() => {
        fireEvent.click(screen.getByText('Create Referral Program'));
      });

      // Should show rewards preview
      expect(screen.getByText('Available Rewards at')).toBeInTheDocument();
      expect(screen.getByText('Free Coffee')).toBeInTheDocument();

      // Change points value and check reward updates
      const slider = screen.getByRole('slider');
      fireEvent.change(slider, { target: { value: '1000' } });

      await waitFor(() => {
        expect(screen.getByText('Free Coffee')).toBeInTheDocument();
        expect(screen.getByText('Free Meal')).toBeInTheDocument();
      });

      // Increase to highest tier
      fireEvent.change(slider, { target: { value: '2000' } });

      await waitFor(() => {
        expect(screen.getByText('VIP Status')).toBeInTheDocument();
      });
    });
  });

  describe('Data Persistence and Sync', () => {
    test('referral program persists across page reloads', async () => {
      // Create campaign first
      storageData['launchpad_campaign'] = {
        name: 'Persistence Test',
        rewards: {
          tier1: { points: 500, rewardText: 'Test Reward' }
        }
      };

      renderIntegratedApp('/referrals');

      await waitFor(() => {
        fireEvent.click(screen.getByText('Create Referral Program'));
      });

      // Create referral program
      fireEvent.click(screen.getByText('Launch Program'));

      await waitFor(() => {
        expect(storageData['referral_program']).toBeDefined();
        expect(storageData['referral_program'].active).toBe(true);
      });

      // Simulate page reload by re-rendering
      renderIntegratedApp('/referrals');

      await waitFor(() => {
        // Should show active program status
        expect(screen.getByText('Referral Program Status')).toBeInTheDocument();
        expect(screen.getByText('Active')).toBeInTheDocument();
      });
    });

    test('handles missing campaign data gracefully', async () => {
      // No campaign data in storage
      renderIntegratedApp('/referrals');

      await waitFor(() => {
        expect(screen.getByText('Set Up Rewards First')).toBeInTheDocument();
        expect(screen.getByText('Rewards are required to create referral programs')).toBeInTheDocument();
      });
    });

    test('updates referral program when campaign is modified', async () => {
      // Start with a campaign and active referral program
      storageData['launchpad_campaign'] = {
        name: 'Original Campaign',
        rewards: {
          tier1: { points: 500, rewardText: 'Original Reward' }
        }
      };

      storageData['referral_program'] = {
        active: true,
        pointsReward: 100,
        isTapidSponsored: false
      };

      renderIntegratedApp('/referrals');

      await waitFor(() => {
        expect(screen.getByText('Active')).toBeInTheDocument();
      });

      // Simulate campaign update (would happen in Launch Pad)
      storageData['launchpad_campaign'] = {
        name: 'Updated Campaign',
        rewards: {
          tier1: { points: 600, rewardText: 'Updated Reward' },
          tier2: { points: 1200, rewardText: 'New Tier Reward' }
        }
      };

      // Re-render to simulate navigation back to referrals
      renderIntegratedApp('/referrals');

      await waitFor(() => {
        fireEvent.click(screen.getByText('Create Referral Program'));
      });

      // Should show updated rewards
      expect(screen.getByText('Updated Reward')).toBeInTheDocument();
      expect(screen.getByText('New Tier Reward')).toBeInTheDocument();
    });
  });

  describe('Navigation Integration', () => {
    test('navigates from referrals to launch pad when no rewards exist', async () => {
      // Mock window.location for navigation test
      delete window.location;
      window.location = { href: '' };
      
      renderIntegratedApp('/referrals');

      await waitFor(() => {
        const setupButton = screen.getByText('Set Up Rewards First');
        fireEvent.click(setupButton);
      });

      // In a real app, this would trigger navigation
      // Here we verify the navigation intent
      expect(mockSafeStorage.getItem).toHaveBeenCalledWith('launchpad_campaign', null);
    });

    test('back-and-forth navigation maintains state', async () => {
      // Create campaign
      storageData['launchpad_campaign'] = {
        name: 'Navigation Test',
        rewards: {
          tier1: { points: 500, rewardText: 'Test Reward' }
        }
      };

      // Start in Launch Pad
      renderIntegratedApp('/control-center');

      await waitFor(() => {
        expect(screen.getByText('Launch Pad')).toBeInTheDocument();
      });

      // Navigate to Referrals
      renderIntegratedApp('/referrals');

      await waitFor(() => {
        expect(screen.getByText('Create Referral Program')).toBeInTheDocument();
      });

      // Create referral program
      fireEvent.click(screen.getByText('Create Referral Program'));
      fireEvent.click(screen.getByText('Launch Program'));

      await waitFor(() => {
        expect(storageData['referral_program']).toBeDefined();
      });

      // Navigate back to Launch Pad
      renderIntegratedApp('/control-center');

      await waitFor(() => {
        expect(screen.getByText('Launch Pad')).toBeInTheDocument();
        // Campaign should still be there
        expect(screen.getByText('Navigation Test')).toBeInTheDocument();
      });

      // Navigate back to Referrals
      renderIntegratedApp('/referrals');

      await waitFor(() => {
        // Referral program should still be active
        expect(screen.getByText('Active')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling Integration', () => {
    test('handles storage errors consistently across both pages', async () => {
      // Mock storage error
      mockSafeStorage.getItem.mockReturnValue({
        success: false,
        error: { type: 'CORRUPTED_DATA', message: 'Data corrupted' }
      });

      // Test Launch Pad error handling
      renderIntegratedApp('/control-center');

      await waitFor(() => {
        expect(screen.getByText('Launch Pad')).toBeInTheDocument();
        // Should not crash
      });

      // Test Referral Page error handling
      renderIntegratedApp('/referrals');

      await waitFor(() => {
        expect(screen.getByText('Referral Program')).toBeInTheDocument();
        // Should not crash
      });
    });

    test('handles corrupted campaign data gracefully', async () => {
      // Corrupt campaign data
      storageData['launchpad_campaign'] = {
        name: 'Corrupted Campaign',
        // Missing rewards property
      };

      renderIntegratedApp('/referrals');

      await waitFor(() => {
        // Should fall back to "Set Up Rewards First"
        expect(screen.getByText('Set Up Rewards First')).toBeInTheDocument();
      });
    });
  });

  describe('Tapid Integration Flow', () => {
    test('creates Tapid-sponsored referral program with proper data flow', async () => {
      const user = userEvent.setup();

      // Set up campaign
      storageData['launchpad_campaign'] = {
        name: 'Tapid Test Campaign',
        rewards: {
          tier1: { points: 500, rewardText: 'Tapid Reward' }
        }
      };

      renderIntegratedApp('/referrals');

      await waitFor(() => {
        fireEvent.click(screen.getByText('Create Referral Program'));
      });

      // Enter Tapid code
      const codeInput = screen.getByPlaceholderText(/enter activation code/i);
      await user.type(codeInput, 'TAPID500');

      // Should show Tapid benefits
      expect(screen.getByText(/Tapid will pay YOU €1.50/)).toBeInTheDocument();

      // Create program
      fireEvent.click(screen.getByText('Launch Program'));

      await waitFor(() => {
        expect(storageData['referral_program']).toEqual(
          expect.objectContaining({
            active: true,
            isTapidSponsored: true,
            tapidLimit: 500,
            tapidCode: 'tapid500'
          })
        );
      });

      // Verify active program shows Tapid features
      await waitFor(() => {
        expect(screen.getByText('Tapid-sponsored referral program')).toBeInTheDocument();
        expect(screen.getByText(/Money You Earn/)).toBeInTheDocument();
      });
    });
  });

  describe('Performance Integration', () => {
    test('efficient data loading across page transitions', async () => {
      const startTime = performance.now();

      // Create campaign with multiple rewards
      storageData['launchpad_campaign'] = {
        name: 'Performance Test',
        rewards: {
          tier1: { points: 500, rewardText: 'Reward 1' },
          tier2: { points: 1000, rewardText: 'Reward 2' },
          tier3: { points: 1500, rewardText: 'Reward 3' },
          tier4: { points: 2000, rewardText: 'Reward 4' }
        }
      };

      // Rapid page transitions
      renderIntegratedApp('/control-center');
      
      await waitFor(() => {
        expect(screen.getByText('Launch Pad')).toBeInTheDocument();
      });

      renderIntegratedApp('/referrals');
      
      await waitFor(() => {
        expect(screen.getByText('Referral Program')).toBeInTheDocument();
      });

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Should handle transitions efficiently
      expect(totalTime).toBeLessThan(2000); // 2 seconds max
    });
  });
}); 