/**
 * HomePage Component Tests
 * 
 * Comprehensive test suite for the HomePage component covering:
 * - Data rendering from JSON sources
 * - Chart functionality and dynamic calculations
 * - Interactive elements (todo list, heat map toggle)
 * - Market trends and revenue insights
 * - Google Maps integration
 * - Responsive behavior
 * - Error handling
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import HomePage from '../screens/HomePage/HomePage';
import { DataContext } from '../context/DataContext';
import { BusinessDataContext } from '../context/BusinessDataContext';

// Mock Google Maps API
const mockGoogleMaps = {
  maps: {
    Map: jest.fn(() => ({
      setCenter: jest.fn(),
      setZoom: jest.fn(),
    })),
    LatLng: jest.fn((lat, lng) => ({ lat, lng })),
    visualization: {
      HeatmapLayer: jest.fn(() => ({
        setMap: jest.fn(),
      })),
    },
    Marker: jest.fn(() => ({
      setMap: jest.fn(),
    })),
  },
};

global.window.google = mockGoogleMaps;

// Mock BusinessData.json
const mockBusinessData = {
  home: {
    notifications: [
      {
        id: "notif_001",
        type: "success",
        title: "Campaign Performance Update",
        message: "Your summer promotion exceeded targets by 15%",
        timestamp: "2024-08-08T14:30:00Z",
        isRead: false
      },
      {
        id: "notif_002",
        type: "info",
        title: "New Customer Insights Available",
        message: "Weekly analytics report is ready for review",
        timestamp: "2024-08-08T10:15:00Z",
        isRead: true
      }
    ],
    peakTimesData: [
      { label: "09:00", value: 45 },
      { label: "12:00", value: 78 },
      { label: "18:00", value: 92 },
      { label: "21:00", value: 35 }
    ],
    customerDistributionData: [
      { ageRange: "18-25", male: 120, female: 180 },
      { ageRange: "26-35", male: 200, female: 240 },
      { ageRange: "36-45", male: 150, female: 160 }
    ],
    leaderboard: [
      { name: "Sarah", spend: 287.50, visits: 12 },
      { name: "Mike", spend: 245.80, visits: 8 },
      { name: "Emma", spend: 198.20, visits: 15 }
    ],
    todoList: [
      {
        id: "setup_tapid",
        title: "Set up with Tapid",
        description: "Complete your Tapid account setup",
        completed: true,
        priority: "high"
      },
      {
        id: "connect_pos",
        title: "Connect POS terminal",
        description: "Link your point-of-sale system",
        completed: false,
        priority: "high"
      }
    ],
    marketTrends: [
      {
        trend: "Sunny weather increases outdoor dining by 23%",
        value: 23,
        impact: "positive"
      },
      {
        trend: "Evening coffee sales down due to seasonal changes",
        value: -12,
        impact: "negative"
      }
    ],
    revenueInsights: [
      {
        label: "Average Order Value",
        value: 24.50,
        progress: 75,
        changePercentage: 8.2
      },
      {
        label: "Monthly Revenue",
        value: 15750,
        progress: 82,
        changePercentage: 12.5
      }
    ],
    dublinHotspots: [
      {
        name: "Temple Bar",
        coordinates: { lat: 53.3456, lng: -6.2672 },
        intensity: 0.8
      },
      {
        name: "Grafton Street",
        coordinates: { lat: 53.3389, lng: -6.2595 },
        intensity: 0.9
      }
    ]
  }
};

// Mock business context data
const mockBusinessContextData = {
  customerStats: {
    totalCustomers: 1247,
    newThisMonth: 84,
    returningRate: 67.3,
    avgSpend: 23.45
  },
  campaignStats: {
    active: 3,
    paused: 1,
    totalReach: 2847,
    conversionRate: 4.2
  }
};

// Test utilities
const renderHomePage = (customData = {}) => {
  const dataContextValue = {
    data: { ...mockBusinessData, ...customData },
    loading: false,
    error: null
  };

  const businessContextValue = {
    ...mockBusinessContextData,
    loading: false,
    error: null
  };

  return render(
    <DataContext.Provider value={dataContextValue}>
      <BusinessDataContext.Provider value={businessContextValue}>
        <HomePage />
      </BusinessDataContext.Provider>
    </DataContext.Provider>
  );
};

describe('HomePage', () => {
  beforeEach(() => {
    // Reset Google Maps mocks
    jest.clearAllMocks();
    
    // Mock localStorage
    Storage.prototype.getItem = jest.fn();
    Storage.prototype.setItem = jest.fn();
    
    // Mock console.error to avoid Google Maps warnings in tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Component Rendering', () => {
    test('renders without crashing', () => {
      renderHomePage();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    test('displays welcome header with correct greeting', () => {
      renderHomePage();
      expect(screen.getByText('Good morning!')).toBeInTheDocument();
      expect(screen.getByText('Here\'s an overview of your business performance')).toBeInTheDocument();
    });

    test('renders KPI cards with business data', () => {
      renderHomePage();
      expect(screen.getByText('1,247')).toBeInTheDocument(); // Total customers
      expect(screen.getByText('€23.45')).toBeInTheDocument(); // Avg spend
      expect(screen.getByText('84')).toBeInTheDocument(); // New customers
      expect(screen.getByText('67.3%')).toBeInTheDocument(); // Returning rate
    });
  });

  describe('Data Integration', () => {
    test('loads notifications from JSON data', () => {
      renderHomePage();
      expect(screen.getByText('Campaign Performance Update')).toBeInTheDocument();
      expect(screen.getByText('Your summer promotion exceeded targets by 15%')).toBeInTheDocument();
    });

    test('displays leaderboard with dynamic data', () => {
      renderHomePage();
      expect(screen.getByText('Sarah')).toBeInTheDocument();
      expect(screen.getByText('€287.50')).toBeInTheDocument();
      expect(screen.getByText('12 visits')).toBeInTheDocument();
    });

    test('handles missing data gracefully', () => {
      const emptyData = { home: {} };
      renderHomePage(emptyData);
      // Should not crash and should show fallback content
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
  });

  describe('Charts and Analytics', () => {
    test('renders peak times chart with correct data', () => {
      renderHomePage();
      expect(screen.getByText('Peak Customer Hours')).toBeInTheDocument();
      expect(screen.getByText('Hourly activity patterns')).toBeInTheDocument();
    });

    test('calculates peak time dynamically from data', () => {
      renderHomePage();
      // Peak should be 18:00 (92 value) from mock data
      expect(screen.getByText('18')).toBeInTheDocument(); // Peak time display
    });

    test('calculates average activity dynamically', () => {
      renderHomePage();
      // Average of [45, 78, 92, 35] = 62.5, rounded to 63%
      expect(screen.getByText('63%')).toBeInTheDocument(); // Avg activity
    });

    test('renders customer distribution chart', () => {
      renderHomePage();
      expect(screen.getByText('Customer Distribution')).toBeInTheDocument();
      expect(screen.getByText('Age and gender breakdown')).toBeInTheDocument();
    });

    test('calculates top age group dynamically', () => {
      renderHomePage();
      // 26-35 has highest total (440) from mock data
      expect(screen.getByText('26-35')).toBeInTheDocument();
    });

    test('calculates gender split dynamically', () => {
      renderHomePage();
      // Female percentage: 580/1050 * 100 = 55%
      expect(screen.getByText('55% F')).toBeInTheDocument();
    });
  });

  describe('Interactive Elements', () => {
    test('todo list displays completion status', () => {
      renderHomePage();
      expect(screen.getByText('Set up with Tapid')).toBeInTheDocument();
      expect(screen.getByText('Connect POS terminal')).toBeInTheDocument();
      expect(screen.getByText('1/2 Complete')).toBeInTheDocument();
    });

    test('shows completed todos with checkmark', () => {
      renderHomePage();
      const completedTodo = screen.getByLabelText('setup_tapid');
      expect(completedTodo).toBeChecked();
    });

    test('heat map toggle button works', async () => {
      renderHomePage();
      
      await waitFor(() => {
        const heatmapToggle = screen.getByText('Heat Map');
        expect(heatmapToggle).toBeInTheDocument();
      });

      const toggleButton = screen.getByText('Heat Map').closest('button');
      fireEvent.click(toggleButton);
      
      // Should toggle heat map visibility
      expect(toggleButton).toHaveClass('active');
    });
  });

  describe('Market Trends Section', () => {
    test('renders market trends with correct data', () => {
      renderHomePage();
      expect(screen.getByText('Market Trends')).toBeInTheDocument();
      expect(screen.getByText('Customer behavior and industry insights')).toBeInTheDocument();
      expect(screen.getByText('Sunny weather increases outdoor dining by 23%')).toBeInTheDocument();
    });

    test('displays trend values with correct formatting', () => {
      renderHomePage();
      expect(screen.getByText('+23%')).toBeInTheDocument(); // Positive trend
      expect(screen.getByText('-12%')).toBeInTheDocument(); // Negative trend
    });

    test('applies correct styling for trend impact', () => {
      renderHomePage();
      const positiveTrend = screen.getByText('+23%');
      const negativeTrend = screen.getByText('-12%');
      
      expect(positiveTrend).toHaveClass('positive');
      expect(negativeTrend).toHaveClass('negative');
    });
  });

  describe('Revenue Insights', () => {
    test('renders revenue metrics with proper formatting', () => {
      renderHomePage();
      expect(screen.getByText('Revenue Insights')).toBeInTheDocument();
      expect(screen.getByText('Average Order Value')).toBeInTheDocument();
      expect(screen.getByText('€24.50')).toBeInTheDocument();
      expect(screen.getByText('€15,750')).toBeInTheDocument(); // Monthly Revenue
    });

    test('displays change percentages correctly', () => {
      renderHomePage();
      expect(screen.getByText('+8.2% vs last month')).toBeInTheDocument();
      expect(screen.getByText('+12.5% vs last month')).toBeInTheDocument();
    });

    test('progress bars reflect correct values', () => {
      renderHomePage();
      const progressBars = screen.getAllByClassName('revenueBarFill');
      expect(progressBars[0]).toHaveStyle('width: 75%');
      expect(progressBars[1]).toHaveStyle('width: 82%');
    });
  });

  describe('Google Maps Integration', () => {
    test('initializes Google Maps with correct configuration', async () => {
      renderHomePage();
      
      await waitFor(() => {
        expect(mockGoogleMaps.maps.Map).toHaveBeenCalled();
      });
    });

    test('creates heat map layer with custom green colors', async () => {
      renderHomePage();
      
      await waitFor(() => {
        expect(mockGoogleMaps.maps.visualization.HeatmapLayer).toHaveBeenCalledWith({
          data: expect.any(Array),
          map: expect.anything(),
          radius: 50,
          opacity: 0.7,
          gradient: expect.arrayContaining([
            'rgba(20, 184, 166, 0)',      // Our custom teal colors
            expect.stringMatching(/rgba\(20, 184, 166/)
          ])
        });
      });
    });

    test('displays correct heat map description', () => {
      renderHomePage();
      expect(screen.getByText('Green areas indicate high activity zones, while darker shades show areas with concentrated engagement.')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('handles null data gracefully', () => {
      const nullData = { home: null };
      renderHomePage(nullData);
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    test('handles missing chart data', () => {
      const noChartsData = { 
        home: { 
          peakTimesData: null,
          customerDistributionData: null 
        } 
      };
      renderHomePage(noChartsData);
      expect(screen.getByText('N/A')).toBeInTheDocument(); // Fallback values
    });

    test('handles Google Maps load failure gracefully', () => {
      // Remove Google Maps from global
      delete global.window.google;
      
      renderHomePage();
      // Should not crash
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    test('renders efficiently with large datasets', () => {
      const largeData = {
        home: {
          ...mockBusinessData.home,
          leaderboard: Array.from({ length: 100 }, (_, i) => ({
            name: `Customer ${i}`,
            spend: Math.random() * 500,
            visits: Math.floor(Math.random() * 20)
          }))
        }
      };
      
      const startTime = performance.now();
      renderHomePage(largeData);
      const endTime = performance.now();
      
      // Should render within reasonable time (500ms)
      expect(endTime - startTime).toBeLessThan(500);
    });

    test('memoizes chart calculations', () => {
      const { rerender } = renderHomePage();
      
      // Mock expensive calculation
      const calculateSpy = jest.spyOn(Array.prototype, 'reduce');
      
      // Re-render with same data
      rerender(
        <DataContext.Provider value={{ data: mockBusinessData, loading: false, error: null }}>
          <BusinessDataContext.Provider value={mockBusinessContextData}>
            <HomePage />
          </BusinessDataContext.Provider>
        </DataContext.Provider>
      );
      
      // Calculations should be memoized and not repeated
      expect(calculateSpy).toHaveBeenCalledTimes(0);
      
      calculateSpy.mockRestore();
    });
  });

  describe('Accessibility', () => {
    test('has proper heading hierarchy', () => {
      renderHomePage();
      expect(screen.getByRole('heading', { level: 1, name: 'Dashboard' })).toBeInTheDocument();
      expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(expect.any(Number));
      expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(expect.any(Number));
    });

    test('todo checkboxes have proper labels', () => {
      renderHomePage();
      expect(screen.getByLabelText('setup_tapid')).toBeInTheDocument();
      expect(screen.getByLabelText('connect_pos')).toBeInTheDocument();
    });

    test('buttons have accessible names', () => {
      renderHomePage();
      expect(screen.getByRole('button', { name: /heat map/i })).toBeInTheDocument();
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

      renderHomePage();
      
      // Should still render all content
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Market Trends')).toBeInTheDocument();
    });
  });

  describe('Production Readiness', () => {
    test('all data is sourced from JSON (no hardcoded values)', () => {
      const customData = {
        home: {
          notifications: [],
          peakTimesData: [{ label: "10:00", value: 50 }],
          customerDistributionData: [{ ageRange: "25-30", male: 10, female: 15 }],
          leaderboard: [{ name: "Test", spend: 100, visits: 5 }],
          todoList: [],
          marketTrends: [],
          revenueInsights: [],
          dublinHotspots: []
        }
      };
      
      renderHomePage(customData);
      
      // Verify dynamic data is used
      expect(screen.getByText('10')).toBeInTheDocument(); // Peak time from custom data
      expect(screen.getByText('50%')).toBeInTheDocument(); // Avg activity from custom data
    });

    test('handles all edge cases without crashing', () => {
      const edgeCases = [
        { home: {} },
        { home: { peakTimesData: [] } },
        { home: { customerDistributionData: [] } },
        { home: { todoList: [] } },
        null,
        undefined
      ];

      edgeCases.forEach(testData => {
        expect(() => renderHomePage(testData)).not.toThrow();
      });
    });

    test('has no console errors during normal operation', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      renderHomePage();
      
      // Should have no errors (excluding Google Maps mock warnings)
      const relevantErrors = consoleSpy.mock.calls.filter(call => 
        !call[0]?.toString().includes('Google Maps')
      );
      expect(relevantErrors).toHaveLength(0);
      
      consoleSpy.mockRestore();
    });
  });
}); 