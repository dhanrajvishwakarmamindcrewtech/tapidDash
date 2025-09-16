import React, { createContext, useContext, useMemo } from 'react';
import launchPadConfig from '../data/launchPadConfig.json';

const ConfigContext = createContext();

// Currency mapping - could be moved to a separate config later
const CURRENCY_SYMBOLS = {
  'EUR': '€',
  'USD': '$',
  'GBP': '£'
};

export const ConfigProvider = ({ children }) => {
  const contextValue = useMemo(() => ({
    launchPad: launchPadConfig,
    
    // Helper functions for common operations
    getLoyaltyConfig: () => launchPadConfig.loyalty,
    getUIConfig: () => launchPadConfig.ui,
    getCampaignConfig: () => launchPadConfig.campaigns,
    getKPIConfig: () => launchPadConfig.kpis,
    getAnalyticsConfig: () => launchPadConfig.analytics,
    getValidationConfig: () => launchPadConfig.validation,
    getMessagesConfig: () => launchPadConfig.messages,
    
    // Currency symbol helper
    getCurrencySymbol: (currency = launchPadConfig.loyalty.currency) => {
      return CURRENCY_SYMBOLS[currency] || currency;
    },
    
    // Currency formatting helpers
    formatCurrency: (amount, currency = launchPadConfig.loyalty.currency) => {
      if (typeof amount !== 'number') return CURRENCY_SYMBOLS[currency] + '0.00';
      return CURRENCY_SYMBOLS[currency] + amount.toFixed(2);
    },
    
    // Number formatting
    formatNumber: (num) => {
      if (typeof num !== 'number') return '0';
      return num.toLocaleString();
    },
    
    // Percentage formatting
    formatPercentage: (num) => {
      if (typeof num !== 'number') return '0%';
      return num + '%';
    },
    
    // Duration formatting
    formatDuration: (value, unit = 'd') => {
      if (typeof value !== 'number') return '0' + unit;
      return value + unit;
    },
    
    // Points to currency conversion
    pointsToEuros: (points, config = launchPadConfig.loyalty) => {
      return points / config.pointsPerEuro;
    },
    
    // Build default tiers from raw data
    buildDefaultTiers: (config = launchPadConfig.loyalty) => {
      return config.defaultTierPoints.map(points => ({
        rewardText: '',
        points: points
      }));
    },
    
    // Build default form structure
    buildDefaultForm: () => {
      const defaultTiers = launchPadConfig.loyalty.defaultTierPoints;
      const rewards = {};
      defaultTiers.forEach((points, index) => {
        rewards[`tier${index + 1}`] = { rewardText: '', points };
      });
      
      return {
        campaignName: '',
        rewardDescription: '',
        rewards,
        isActive: true
      };
    },
    
    // Transform tier array to rewards object (for backward compatibility)
    tiersToRewards: (tiers) => {
      const rewards = {};
      tiers.slice(0, launchPadConfig.loyalty.maxTiers).forEach((tier, index) => {
        rewards[`tier${index + 1}`] = {
          rewardText: tier.rewardText || '',
          points: tier.points || 0
        };
      });
      return rewards;
    },
    
    // Transform rewards object to tier array
    rewardsToTiers: (rewards) => {
      const tiers = [];
      for (let i = 1; i <= launchPadConfig.loyalty.maxTiers; i++) {
        const key = `tier${i}`;
        if (rewards && rewards[key]) {
          tiers.push({
            rewardText: rewards[key].rewardText || '',
            points: rewards[key].points || (i * launchPadConfig.loyalty.pointIncrement)
          });
        }
      }
      if (tiers.length === 0) {
        return launchPadConfig.loyalty.defaultTierPoints.map(points => ({
          rewardText: '',
          points
        }));
      }
      return tiers;
    },
    
    // Get KPI configuration by key
    getKPIByKey: (key) => {
      return launchPadConfig.kpis.find(kpi => kpi.key === key);
    },
    
    // Get analytics card configuration by key
    getAnalyticsCardByKey: (key) => {
      return launchPadConfig.analytics.cards.find(card => card.key === key);
    },
    
    // Get KPI icon based on key
    getKPIIcon: (key) => {
      const iconMap = {
        totalCustomers: 'Users',
        totalRevenue: 'Euro', 
        rewardsEarned: 'Gift',
        avgSpendPerWeek: 'UserCheck'
      };
      return iconMap[key] || 'Users';
    },
    
    // Get KPI format based on key
    getKPIFormat: (key) => {
      const formatMap = {
        totalCustomers: 'number',
        totalRevenue: 'currency',
        rewardsEarned: 'number', 
        avgSpendPerWeek: 'currency'
      };
      return formatMap[key] || 'number';
    },
    
    // Get analytics card type based on key
    getAnalyticsCardType: (key) => {
      const typeMap = {
        activePoints: 'value',
        redeemRate: 'value',
        mostRedemption: 'barChart',
        unredeemed: 'value',
        redemptionRate: 'donut',
        redemptionTime: 'value',
        firstTimeEarners: 'value',
        referralBoost: 'progressBar'
      };
      return typeMap[key] || 'value';
    },
    
    // Get analytics card format based on key
    getAnalyticsCardFormat: (key) => {
      const formatMap = {
        redeemRate: 'percentage',
        redemptionTime: 'duration'
      };
      return formatMap[key] || null;
    },
    
    // Format KPI value based on key and configuration
    formatKPIValue: (kpiConfig, value) => {
      if (value === null || value === undefined) return '0';
      
      let processedValue = value;
      
      // Apply transforms
      if (kpiConfig.transform === 'divide' && kpiConfig.transformValue) {
        processedValue = value / kpiConfig.transformValue;
      }
      
      // Get format from key mapping
      const formatMap = {
        totalCustomers: 'number',
        totalRevenue: 'currency',
        rewardsEarned: 'number', 
        avgSpendPerWeek: 'currency'
      };
      const format = formatMap[kpiConfig.key] || 'number';
      
      // Format based on type
      switch (format) {
        case 'currency':
          return CURRENCY_SYMBOLS[launchPadConfig.loyalty.currency] + processedValue.toFixed(2);
        case 'number':
          return processedValue.toLocaleString();
        case 'percentage':
          return processedValue + '%';
        default:
          return processedValue.toString();
      }
    },
    
    // Get data value from source path
    getDataFromSource: (source, data) => {
      const keys = source.split('.');
      let result = data;
      for (const key of keys) {
        result = result?.[key];
        if (result === undefined) return null;
      }
      return result;
    },
    
    // Format tier display text
    formatTierText: (rewardText, points, config = launchPadConfig.loyalty) => {
      if (!rewardText || !points) return null;
      const euros = (points / config.pointsPerEuro).toFixed(2);
      const ui = launchPadConfig.ui.labels;
      const symbol = CURRENCY_SYMBOLS[config.currency];
      return `• ${rewardText} ${ui.at} ${points} ${ui.pts} (≈ ${symbol}${euros} ${ui.spent})`;
    },
    
    // Validation messages generator
    getValidationMessage: (field, rules) => {
      const messages = {
        campaignName: `Campaign name is required and must be ${rules.minLength}-${rules.maxLength} characters`,
        rewardDescription: `Description is required and must be ${rules.minLength}-${rules.maxLength} characters`,
        tierPoints: 'Points must be greater than 0',
        tierProgression: 'Each tier must require more points than the previous tier'
      };
      return messages[field] || 'Invalid input';
    },
    
    // Validation helpers
    validateCampaignName: (name) => {
      const rules = launchPadConfig.validation.campaignName;
      if (!rules.required && !name) return null;
      if (!name || name.length < rules.minLength || name.length > rules.maxLength) {
        return `Campaign name is required and must be ${rules.minLength}-${rules.maxLength} characters`;
      }
      return null;
    },
    
    validateRewardDescription: (description) => {
      const rules = launchPadConfig.validation.rewardDescription;
      if (!rules.required && !description) return null;
      if (!description || description.length < rules.minLength || description.length > rules.maxLength) {
        return `Description is required and must be ${rules.minLength}-${rules.maxLength} characters`;
      }
      return null;
    },
    
    validateTierPoints: (points) => {
      const rules = launchPadConfig.validation.tierPoints;
      if (!rules.required && !points) return null;
      if (!points || points < rules.min) {
        return 'Points must be greater than 0';
      }
      return null;
    },
    
    validateTierProgression: (tiers) => {
      for (let i = 1; i < tiers.length; i++) {
        if (tiers[i].points <= tiers[i - 1].points) {
          return 'Each tier must require more points than the previous tier';
        }
      }
      return null;
    }
  }), []);

  return (
    <ConfigContext.Provider value={contextValue}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};

// Convenience hooks for specific configurations
export const useLoyaltyConfig = () => {
  const { getLoyaltyConfig } = useConfig();
  return getLoyaltyConfig();
};

export const useUIConfig = () => {
  const { getUIConfig } = useConfig();
  return getUIConfig();
};

export const useCampaignConfig = () => {
  const { getCampaignConfig } = useConfig();
  return getCampaignConfig();
};

export const useKPIConfig = () => {
  const { getKPIConfig } = useConfig();
  return getKPIConfig();
};

export const useAnalyticsConfig = () => {
  const { getAnalyticsConfig } = useConfig();
  return getAnalyticsConfig();
};

export const useValidationConfig = () => {
  const { getValidationConfig } = useConfig();
  return getValidationConfig();
};

export const useMessagesConfig = () => {
  const { getMessagesConfig } = useConfig();
  return getMessagesConfig();
}; 