// data/index.js - Simplified data layer with Firebase-backed campaigns

import { firebaseService } from "../services/firebaseService";
import safeStorage from "../utils/safeStorage";

// =============================================================================
// DATA SERVICE LAYER
// =============================================================================

export class DataService {
  constructor() {
    this.subscribers = new Map();
    this.cache = new Map();
  }

  subscribe(dataType, callback) {
    if (!this.subscribers.has(dataType)) {
      this.subscribers.set(dataType, new Set());
    }
    this.subscribers.get(dataType).add(callback);
    return () => {
      this.subscribers.get(dataType)?.delete(callback);
    };
  }

  notify(dataType, data) {
    const callbacks = this.subscribers.get(dataType);
    if (callbacks) {
      callbacks.forEach((callback) => callback(data));
    }
  }

  setCache(key, data, ttl = 30000) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  getCache(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    return cached.data;
  }

  clearCache(pattern) {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }
}

export const dataService = new DataService();

// =============================================================================
// BUSINESS DATA
// =============================================================================

export const businessProfiles = {
  default: {
    id: "biz_001",
    businessName: "Joe's Café",
    industry: "Food & Beverage",
    locations: [
      { id: "all", name: "All Locations", count: 3, isAggregate: true },
      {
        id: "dublin-city",
        name: "Joe's Café - City Centre",
        address: "Dublin City Centre",
      },
      {
        id: "dublin-south",
        name: "Joe's Café - Southside",
        address: "Dublin Southside",
      },
      { id: "cork-main", name: "Joe's Café - Cork", address: "Cork Main St" },
    ],
    contactInfo: {
      email: "joe@joescafe.ie",
      phone: "+353 1 234 5678",
      address: "Dublin City Centre",
    },
    operatingHours: {
      monday: { open: "07:00", close: "19:00", closed: false },
      tuesday: { open: "07:00", close: "19:00", closed: false },
      wednesday: { open: "07:00", close: "19:00", closed: false },
      thursday: { open: "07:00", close: "19:00", closed: false },
      friday: { open: "07:00", close: "20:00", closed: false },
      saturday: { open: "08:00", close: "20:00", closed: false },
      sunday: { open: "09:00", close: "18:00", closed: false },
    },
    timezone: "Europe/Dublin",
    currency: "EUR",
    createdAt: "2023-01-01T00:00:00Z",
    lastUpdated: "2025-06-13T12:00:00Z",
  },
};

export const getBusinessProfile = (businessId = "default") => {
  return businessProfiles[businessId] || businessProfiles.default;
};

export const updateBusinessProfile = (businessId = "default", updates) => {
  const currentProfile = getBusinessProfile(businessId);
  businessProfiles[businessId] = {
    ...currentProfile,
    ...updates,
    lastUpdated: new Date().toISOString(),
  };
  return businessProfiles[businessId];
};

// =============================================================================
// CUSTOMER DATA
// =============================================================================

export const customerProfiles = [
  {
    id: "C001",
    name: "Sarah O'Brien",
    email: "sarah.obrien@email.com",
    phone: "+353 86 123 4567",
    totalSpend: 284.5,
    visitCount: 23,
    rewardsEarned: 8,
    rewardsRedeemed: 5,
    lastVisit: "2025-06-10",
    firstVisit: "2024-12-15",
    segment: "VIP",
    status: "active",
    location: "dublin-city",
    avgOrderValue: 12.37,
    tier: "VIP",
    birthDate: "1987-03-15",
    preferences: ["coffee", "pastries"],
    communicationPrefs: { email: true, sms: false, push: true },
  },
  {
    id: "C002",
    name: "Michael Chen",
    email: "michael.chen@email.com",
    phone: "+353 87 234 5678",
    totalSpend: 156.8,
    visitCount: 12,
    rewardsEarned: 4,
    rewardsRedeemed: 3,
    lastVisit: "2025-06-11",
    firstVisit: "2025-01-20",
    segment: "Regular",
    status: "active",
    location: "dublin-south",
    avgOrderValue: 13.07,
    tier: "Gold",
    birthDate: "1992-08-22",
    preferences: ["specialty-coffee"],
    communicationPrefs: { email: true, sms: true, push: false },
  },
  {
    id: "C003",
    name: "Emma Walsh",
    email: "emma.walsh@email.com",
    phone: "+353 85 345 6789",
    totalSpend: 89.2,
    visitCount: 7,
    rewardsEarned: 2,
    rewardsRedeemed: 1,
    lastVisit: "2025-05-15",
    firstVisit: "2025-02-10",
    segment: "At-Risk",
    status: "at-risk",
    location: "cork-main",
    avgOrderValue: 12.74,
    tier: "Silver",
    birthDate: "1995-11-30",
    preferences: ["tea", "sandwiches"],
    communicationPrefs: { email: false, sms: true, push: true },
  },
  {
    id: "C004",
    name: "David Murphy",
    email: "david.murphy@email.com",
    phone: "+353 83 456 7890",
    totalSpend: 42.3,
    visitCount: 3,
    rewardsEarned: 1,
    rewardsRedeemed: 0,
    lastVisit: "2025-06-12",
    firstVisit: "2025-05-28",
    segment: "New",
    status: "new",
    location: "dublin-city",
    avgOrderValue: 14.1,
    tier: "Bronze",
    birthDate: "1990-07-18",
    preferences: ["coffee"],
    communicationPrefs: { email: true, sms: false, push: false },
  },
  {
    id: "C005",
    name: "Lisa Kelly",
    email: "lisa.kelly@email.com",
    phone: "+353 89 567 8901",
    totalSpend: 312.7,
    visitCount: 28,
    rewardsEarned: 12,
    rewardsRedeemed: 9,
    lastVisit: "2025-06-09",
    firstVisit: "2024-11-05",
    segment: "VIP",
    status: "active",
    location: "dublin-south",
    avgOrderValue: 11.17,
    tier: "VIP",
    birthDate: "1985-12-12",
    preferences: ["coffee", "pastries", "lunch"],
    communicationPrefs: { email: true, sms: true, push: true },
  },
];

export const customerSegments = {
  new: {
    id: "new",
    name: "New Customers",
    description: "Customers with 1-2 visits",
    color: "teal",
  },
  regular: {
    id: "regular",
    name: "Regular Customers",
    description: "Customers with 3+ visits",
    color: "green",
  },
  vip: {
    id: "vip",
    name: "VIP Customers",
    description: "Top 10% spenders",
    color: "gold",
  },
  "at-risk": {
    id: "at-risk",
    name: "At-Risk Customers",
    description: "Haven't visited in 30+ days",
    color: "coral",
  },
};

export const getAllCustomers = () => {
  return [...customerProfiles];
};

export const getCustomerById = (customerId) => {
  return customerProfiles.find((c) => c.id === customerId);
};

export const getCustomersBySegment = (segmentId) => {
  if (segmentId === "all") return getAllCustomers();
  return customerProfiles.filter(
    (customer) => customer.segment.toLowerCase() === segmentId
  );
};

export const updateCustomer = (customerId, updates) => {
  const index = customerProfiles.findIndex((c) => c.id === customerId);
  if (index !== -1) {
    customerProfiles[index] = { ...customerProfiles[index], ...updates };
    return customerProfiles[index];
  }
  return null;
};

export const addCustomer = (customerData) => {
  const newCustomer = {
    id: `C${String(customerProfiles.length + 1).padStart(3, "0")}`,
    ...customerData,
    createdAt: new Date().toISOString(),
  };
  customerProfiles.push(newCustomer);
  return newCustomer;
};

export const calculateCustomerStats = () => {
  const customers = getAllCustomers();
  const stats = {
    total: customers.length,
    active: customers.filter((c) => c.status === "active").length,
    atRisk: customers.filter((c) => c.status === "at-risk").length,
    new: customers.filter((c) => c.status === "new").length,
    totalSpend: customers.reduce((sum, c) => sum + c.totalSpend, 0),
    avgSpend: 0,
    totalVisits: customers.reduce((sum, c) => sum + c.visitCount, 0),
    totalRewardsEarned: customers.reduce((sum, c) => sum + c.rewardsEarned, 0),
    totalRewardsRedeemed: customers.reduce(
      (sum, c) => sum + c.rewardsRedeemed,
      0
    ),
  };
  stats.avgSpend = stats.total > 0 ? stats.totalSpend / stats.total : 0;
  return stats;
};

// =============================================================================
// FIREBASE-BACKED CAMPAIGN DATA
// =============================================================================

const getCurrentBusinessId = () => {
  // This should come from your auth context or user session
  const businessId = safeStorage.getItem("userData", {}).data.user;
  // console.log(businessId, "bfbjasdokhvbd");

  return `biz_${businessId.uid}`; // Replace with actual business ID logic
};

export const getAllCampaigns = async () => {
  try {
    const businessId = getCurrentBusinessId();
    return await firebaseService.getCampaigns(businessId);
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return { error: "Failed to fetch campaigns" };
  }
};

export const getCampaignById = async (campaignId) => {
  try {
    return await firebaseService.getDocument("campaigns", campaignId);
  } catch (error) {
    console.error("Error fetching campaign:", error);
    return null;
  }
};

export const addCampaign = async (campaignType, campaignData) => {
  try {
    const businessId = getCurrentBusinessId();
    return await firebaseService.addCampaign(
      businessId,
      campaignType,
      campaignData
    );
  } catch (error) {
    console.error("Error adding campaign:", error);
    throw error;
  }
};

export const updateCampaign = async (campaignId, campaignType, updates) => {
  try {
    await firebaseService.updateCampaign(campaignId, updates);
    return await getCampaignById(campaignId);
  } catch (error) {
    console.error("Error updating campaign:", error);
    throw error;
  }
};

export const deleteCampaign = async (campaignId, campaignType) => {
  try {
    return await firebaseService.deleteCampaign(campaignId);
  } catch (error) {
    console.error("Error deleting campaign:", error);
    throw error;
  }
};

export const subscribeToCampaigns = (callback) => {
  const businessId = getCurrentBusinessId();
  return firebaseService.subscribeToCampaigns(businessId, callback);
};

// =============================================================================
// SETTINGS DATA
// =============================================================================

export const defaultSettings = {
  companyName: "Joe's Café",
  industry: "Food & Beverage",
  websiteUrl: "https://joescafe.ie",
  taxId: "IE1234567890",
  primaryContact: "Joe Smith",
  contactEmail: "joe@joescafe.ie",
  contactPhone: "+353 1 234 5678",
  address: "Dublin City Centre",
  twoFactorAuth: false,
  emailNotifications: true,
  smsNotifications: false,
  darkMode: false,
  primaryColor: "#10b981",
  sessionTimeout: 120,
  logRetention: "30 days",
};

export const getSettings = () => {
  return { ...defaultSettings };
};

export const updateSettings = (updates) => {
  Object.assign(defaultSettings, updates);
  return { ...defaultSettings };
};

// =============================================================================
// ANALYTICS DATA
// =============================================================================

export const analyticsData = {
  weeklyRevenue: [
    { day: "Mon", amount: 145 },
    { day: "Tue", amount: 120 },
    { day: "Wed", amount: 178 },
    { day: "Thu", amount: 234 },
    { day: "Fri", amount: 289 },
    { day: "Sat", amount: 354 },
    { day: "Sun", amount: 198 },
  ],
  customerGrowth: [
    { month: "Jan", new: 45, returning: 67 },
    { month: "Feb", new: 52, returning: 78 },
    { month: "Mar", new: 48, returning: 85 },
    { month: "Apr", new: 61, returning: 92 },
    { month: "May", new: 58, returning: 89 },
    { month: "Jun", new: 64, returning: 95 },
  ],
};

export const getAnalyticsData = (type) => {
  return analyticsData[type] || null;
};

export const getAllAnalytics = () => {
  return { ...analyticsData };
};

// =============================================================================
// REPORTS DATA AND FUNCTIONS
// =============================================================================

export const reportsData = {
  savedReports: [],
  reportMetrics: null,
};

export const reportTemplates = [
  {
    id: "revenue",
    name: "Revenue Report",
    description:
      "Detailed revenue analysis including trends, sources, and projections",
    sections: [
      "revenue_overview",
      "daily_breakdown",
      "growth_trends",
      "forecasting",
    ],
    estimatedTime: "2-3 minutes",
  },
  {
    id: "customers",
    name: "Customer Report",
    description: "Customer behavior analysis, segments, and engagement metrics",
    sections: [
      "customer_overview",
      "segmentation",
      "behavior_patterns",
      "retention_analysis",
    ],
    estimatedTime: "3-4 minutes",
  },
  {
    id: "rewards",
    name: "Rewards Report",
    description:
      "Rewards program performance including redemption rates and popular rewards",
    sections: [
      "rewards_overview",
      "redemption_analysis",
      "popular_rewards",
      "engagement_metrics",
    ],
    estimatedTime: "2-3 minutes",
  },
  {
    id: "retention",
    name: "Retention Report",
    description: "Customer retention analysis and churn prevention insights",
    sections: [
      "retention_overview",
      "churn_analysis",
      "lifecycle_stages",
      "recommendations",
    ],
    estimatedTime: "3-4 minutes",
  },
  {
    id: "general",
    name: "General Report",
    description: "Comprehensive overview of all loyalty program metrics",
    sections: [
      "executive_summary",
      "key_metrics",
      "trends_analysis",
      "action_items",
    ],
    estimatedTime: "4-5 minutes",
  },
];

export const getReportsData = () => {
  const customers = getAllCustomers();
  const customerStats = calculateCustomerStats();

  const metrics = {
    totalRevenue: customerStats.totalSpend,
    totalCustomers: customerStats.total,
    activeCustomers: customerStats.active,
    rewardsRedeemed: customerStats.totalRewardsRedeemed,
    avgOrderValue: customerStats.avgSpend,
    retentionRate:
      customerStats.active > 0
        ? (customerStats.active / customerStats.total) * 100
        : 0,
    revenueGrowth: 12.3,
    customerGrowth: 15.2,
    redemptionGrowth: 8.7,
    retentionGrowth: 5.1,
    lastUpdated: new Date().toISOString(),
    reportPeriod: "30 days",
  };

  return {
    metrics,
    customers: customers.slice(0, 10),
    campaigns: {}, // Not included at this level because campaigns are fetched async
    analytics: analyticsData,
    savedReports: reportsData.savedReports,
  };
};

export const getReportTemplates = () => {
  return [...reportTemplates];
};

export const generateReport = (reportType, options = {}) => {
  const data = getReportsData();
  const template =
    reportTemplates.find((t) => t.id === reportType) || reportTemplates[0];
  const report = {
    id: `RPT_${Date.now()}`,
    type: reportType,
    template: template.name,
    generatedAt: new Date().toISOString(),
    period: options.period || "30",
    location: options.location || "all",
    status: "generated",
    data: {
      metrics: data.metrics,
      customers: data.customers,
      analytics: data.analytics,
      sections: template.sections,
    },
    format: options.format || "pdf",
    size: "2.3 MB",
    downloadUrl: `/reports/${reportType}_${Date.now()}.pdf`,
  };

  reportsData.savedReports.unshift(report);

  if (reportsData.savedReports.length > 20) {
    reportsData.savedReports = reportsData.savedReports.slice(0, 20);
  }

  return report;
};

export const saveCustomReport = (reportData) => {
  const savedReport = {
    ...reportData,
    savedAt: new Date().toISOString(),
    id: reportData.id || `RPT_${Date.now()}`,
  };
  reportsData.savedReports.unshift(savedReport);

  if (reportsData.savedReports.length > 50) {
    reportsData.savedReports = reportsData.savedReports.slice(0, 50);
  }

  return savedReport;
};

export const getSavedReports = (filters = {}) => {
  let reports = [...reportsData.savedReports];

  if (filters.type && filters.type !== "all") {
    reports = reports.filter((r) => r.type === filters.type);
  }

  if (filters.dateRange) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(filters.dateRange));
    reports = reports.filter((r) => new Date(r.generatedAt) >= cutoffDate);
  }

  if (filters.location && filters.location !== "all") {
    reports = reports.filter((r) => r.location === filters.location);
  }

  return reports;
};

export const deleteReport = (reportId) => {
  const index = reportsData.savedReports.findIndex((r) => r.id === reportId);
  if (index !== -1) {
    reportsData.savedReports.splice(index, 1);
    return true;
  }
  return false;
};
