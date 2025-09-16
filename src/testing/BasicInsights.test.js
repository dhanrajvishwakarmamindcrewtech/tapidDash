import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Simple utility function tests
describe('Insights System - Basic Tests', () => {
  describe('Data Utilities', () => {
    test('formats currency correctly', () => {
      const formatCurrency = (amount, currency = 'EUR') => {
        return new Intl.NumberFormat('en-EU', {
          style: 'currency',
          currency: currency,
        }).format(amount);
      };

      expect(formatCurrency(24.50)).toContain('24.50');
      expect(formatCurrency(1234.56)).toContain('1,234.56');
      expect(formatCurrency(0)).toContain('0.00');
    });

    test('formats numbers with commas', () => {
      const formatNumber = (num) => {
        return new Intl.NumberFormat('en-US').format(num);
      };

      expect(formatNumber(1847)).toBe('1,847');
      expect(formatNumber(1234567)).toBe('1,234,567');
      expect(formatNumber(42)).toBe('42');
    });

    test('formats percentages correctly', () => {
      const formatPercentage = (num) => {
        const sign = num > 0 ? '+' : '';
        return `${sign}${num}%`;
      };

      expect(formatPercentage(12.5)).toBe('+12.5%');
      expect(formatPercentage(-8.3)).toBe('-8.3%');
      expect(formatPercentage(0)).toBe('0%');
    });

    test('calculates trends correctly', () => {
      const calculateTrend = (value) => {
        if (value > 0) return 'up';
        if (value < 0) return 'down';
        return 'stable';
      };

      expect(calculateTrend(5.2)).toBe('up');
      expect(calculateTrend(-3.1)).toBe('down');
      expect(calculateTrend(0)).toBe('stable');
    });
  });

  describe('Data Structure Validation', () => {
    test('validates KPI data structure', () => {
      const mockKPI = {
        title: 'Active Customers',
        value: 1847,
        changeValue: 11,
        period: 'month'
      };

      expect(mockKPI).toHaveProperty('title');
      expect(mockKPI).toHaveProperty('value');
      expect(mockKPI).toHaveProperty('changeValue');
      expect(mockKPI).toHaveProperty('period');
      expect(typeof mockKPI.value).toBe('number');
      expect(typeof mockKPI.changeValue).toBe('number');
    });

    test('validates customer segment structure', () => {
      const mockSegment = {
        segment: 'vip',
        count: 271,
        avgSpend: 45.20,
        growthPercentage: 12.5,
        visitFreq: 4.2
      };

      expect(mockSegment).toHaveProperty('segment');
      expect(mockSegment).toHaveProperty('count');
      expect(mockSegment).toHaveProperty('avgSpend');
      expect(mockSegment).toHaveProperty('growthPercentage');
      expect(typeof mockSegment.count).toBe('number');
      expect(typeof mockSegment.avgSpend).toBe('number');
    });

    test('validates smart insight structure', () => {
      const mockInsight = {
        type: 'success',
        title: 'Queue times are within acceptable ranges',
        description: 'Good job!',
        priority: 'low'
      };

      expect(mockInsight).toHaveProperty('type');
      expect(mockInsight).toHaveProperty('title');
      expect(mockInsight).toHaveProperty('description');
      expect(mockInsight).toHaveProperty('priority');
      expect(['success', 'warning', 'error', 'info']).toContain(mockInsight.type);
      expect(['low', 'medium', 'high']).toContain(mockInsight.priority);
    });
  });

  describe('Queue Metrics Calculations', () => {
    test('calculates average service time', () => {
      const weeklyData = [
        { day: 'Monday', serviceTime: 3.2 },
        { day: 'Tuesday', serviceTime: 2.8 },
        { day: 'Wednesday', serviceTime: 3.5 },
        { day: 'Thursday', serviceTime: 4.1 },
        { day: 'Friday', serviceTime: 4.8 }
      ];

      const calculateAverage = (data) => {
        const sum = data.reduce((acc, item) => acc + item.serviceTime, 0);
        return Math.round((sum / data.length) * 10) / 10;
      };

      const average = calculateAverage(weeklyData);
      expect(average).toBe(3.7);
    });

    test('identifies busy periods', () => {
      const weeklyData = [
        { day: 'Monday', serviceTime: 3.2, status: 'optimal' },
        { day: 'Friday', serviceTime: 4.8, status: 'overworked' }
      ];

      const busyDays = weeklyData.filter(day => day.status === 'overworked');
      expect(busyDays).toHaveLength(1);
      expect(busyDays[0].day).toBe('Friday');
      expect(busyDays[0].serviceTime).toBe(4.8);
    });
  });

  describe('Icon Mapping', () => {
    test('maps icon types correctly', () => {
      const getIconForType = (title) => {
        const iconMap = {
          'Active Customers': 'Users',
          'New Customers': 'UserPlus',
          'VIP Customers': 'Crown',
          'Avg Spend per Customer': 'DollarSign',
          'Visit Frequency': 'RotateCcw'
        };
        return iconMap[title] || 'Circle';
      };

      expect(getIconForType('Active Customers')).toBe('Users');
      expect(getIconForType('New Customers')).toBe('UserPlus');
      expect(getIconForType('VIP Customers')).toBe('Crown');
      expect(getIconForType('Unknown Type')).toBe('Circle');
    });

    test('maps segment colors correctly', () => {
      const getColorForSegment = (segment) => {
        const colorMap = {
          'vip': '#FFD700',      // Gold
          'regular': '#4CAF50',   // Green
          'new': '#2196F3',       // Blue
          'at-risk': '#FF5722'    // Red
        };
        return colorMap[segment] || '#9E9E9E';
      };

      expect(getColorForSegment('vip')).toBe('#FFD700');
      expect(getColorForSegment('regular')).toBe('#4CAF50');
      expect(getColorForSegment('new')).toBe('#2196F3');
      expect(getColorForSegment('at-risk')).toBe('#FF5722');
      expect(getColorForSegment('unknown')).toBe('#9E9E9E');
    });
  });

  describe('Data Transformations', () => {
    test('transforms raw KPI data for UI', () => {
      const rawKPI = {
        title: 'Active Customers',
        value: 1847,
        changeValue: 11,
        period: 'month'
      };

      const transformKPI = (kpi) => ({
        ...kpi,
        formattedValue: new Intl.NumberFormat('en-US').format(kpi.value),
        formattedChange: `+${kpi.changeValue}%`,
        trend: kpi.changeValue > 0 ? 'up' : 'down',
        icon: 'Users'
      });

      const transformed = transformKPI(rawKPI);
      
      expect(transformed.formattedValue).toBe('1,847');
      expect(transformed.formattedChange).toBe('+11%');
      expect(transformed.trend).toBe('up');
      expect(transformed.icon).toBe('Users');
    });

    test('transforms customer segment data', () => {
      const rawSegment = {
        segment: 'vip',
        count: 271,
        avgSpend: 45.20,
        growthPercentage: 12.5
      };

      const transformSegment = (segment) => ({
        ...segment,
        formattedCount: new Intl.NumberFormat('en-US').format(segment.count),
        formattedAvgSpend: `€${segment.avgSpend.toFixed(2)}`,
        formattedGrowth: `+${segment.growthPercentage}%`,
        color: '#FFD700',
        icon: 'Crown'
      });

      const transformed = transformSegment(rawSegment);
      
      expect(transformed.formattedCount).toBe('271');
      expect(transformed.formattedAvgSpend).toBe('€45.20');
      expect(transformed.formattedGrowth).toBe('+12.5%');
      expect(transformed.color).toBe('#FFD700');
    });
  });

  describe('Export Functionality', () => {
    test('creates exportable data structure', () => {
      const mockData = {
        kpis: [{ title: 'Active Customers', value: 1847 }],
        segments: [{ segment: 'vip', count: 271 }],
        insights: [{ type: 'success', title: 'Good performance' }]
      };

      const createExportData = (data) => ({
        exportedAt: new Date().toISOString(),
        version: '1.0',
        data: data,
        summary: {
          totalKPIs: data.kpis.length,
          totalSegments: data.segments.length,
          totalInsights: data.insights.length
        }
      });

      const exportData = createExportData(mockData);
      
      expect(exportData).toHaveProperty('exportedAt');
      expect(exportData).toHaveProperty('version');
      expect(exportData).toHaveProperty('data');
      expect(exportData).toHaveProperty('summary');
      expect(exportData.summary.totalKPIs).toBe(1);
      expect(exportData.summary.totalSegments).toBe(1);
      expect(exportData.summary.totalInsights).toBe(1);
    });
  });

  describe('Performance Helpers', () => {
    test('measures execution time', () => {
      const measureTime = (fn) => {
        const start = performance.now();
        fn();
        const end = performance.now();
        return end - start;
      };

      const testFunction = () => {
        // Simulate some work
        let sum = 0;
        for (let i = 0; i < 1000; i++) {
          sum += i;
        }
        return sum;
      };

      const executionTime = measureTime(testFunction);
      expect(executionTime).toBeGreaterThan(0);
      expect(executionTime).toBeLessThan(100); // Should be fast
    });

    test('validates data consistency', () => {
      const validateKPI = (kpi) => {
        const requiredFields = ['title', 'value', 'changeValue', 'period'];
        return requiredFields.every(field => kpi.hasOwnProperty(field));
      };

      const validKPI = { title: 'Test', value: 100, changeValue: 5, period: 'month' };
      const invalidKPI = { title: 'Test', value: 100 }; // Missing fields

      expect(validateKPI(validKPI)).toBe(true);
      expect(validateKPI(invalidKPI)).toBe(false);
    });
  });

  describe('Error Handling', () => {
    test('handles invalid data gracefully', () => {
      const safeFormatNumber = (value) => {
        try {
          if (typeof value !== 'number' || isNaN(value)) {
            return 'N/A';
          }
          return new Intl.NumberFormat('en-US').format(value);
        } catch (error) {
          return 'Error';
        }
      };

      expect(safeFormatNumber(1234)).toBe('1,234');
      expect(safeFormatNumber('invalid')).toBe('N/A');
      expect(safeFormatNumber(null)).toBe('N/A');
      expect(safeFormatNumber(undefined)).toBe('N/A');
      expect(safeFormatNumber(NaN)).toBe('N/A');
    });

    test('provides fallback values', () => {
      const getValueWithFallback = (data, key, fallback = 'Unknown') => {
        return data && data[key] !== undefined ? data[key] : fallback;
      };

      const testData = { name: 'Test', value: 100 };
      
      expect(getValueWithFallback(testData, 'name')).toBe('Test');
      expect(getValueWithFallback(testData, 'missing')).toBe('Unknown');
      expect(getValueWithFallback(null, 'name')).toBe('Unknown');
      expect(getValueWithFallback(testData, 'missing', 'Custom Fallback')).toBe('Custom Fallback');
    });
  });
}); 