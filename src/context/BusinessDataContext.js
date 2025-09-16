import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from "react";
import { useCore } from "./CoreContext";
import { useData } from "./DataContext";
import insightsSeed from "../data/insights.json";
import {
  getAllCustomers,
  getCustomerById,
  getCustomersBySegment,
  updateCustomer as updateCustomerData,
  addCustomer as addCustomerData,
  calculateCustomerStats,
  customerSegments,
  dataService,
  getAllCampaigns,
  addCampaign,
  updateCampaign,
  deleteCampaign,
  getReportsData,
  generateReport as generateReportData,
  getReportTemplates,
  saveCustomReport,
} from "../data";
import { firebaseService } from "../services/firebaseService";

const BusinessDataContext = createContext();

// Combined action types for all business data
const BUSINESS_DATA_ACTIONS = {
  // Customer actions
  SET_CUSTOMERS: "SET_CUSTOMERS",
  SET_CUSTOMER_SEGMENTS: "SET_CUSTOMER_SEGMENTS",
  UPDATE_CUSTOMER: "UPDATE_CUSTOMER",
  ADD_CUSTOMER: "ADD_CUSTOMER",
  SET_CUSTOMER_FILTERS: "SET_CUSTOMER_FILTERS",
  SET_CUSTOMER_PAGINATION: "SET_CUSTOMER_PAGINATION",

  // Campaign actions
  SET_CAMPAIGNS: "SET_CAMPAIGNS",
  ADD_CAMPAIGN: "ADD_CAMPAIGN",
  UPDATE_CAMPAIGN: "UPDATE_CAMPAIGN",
  DELETE_CAMPAIGN: "DELETE_CAMPAIGN",
  SET_CAMPAIGN_FILTERS: "SET_CAMPAIGN_FILTERS",

  // Insights actions
  SET_INSIGHTS_DATA: "SET_INSIGHTS_DATA",
  SET_CUSTOMER_INSIGHTS: "SET_CUSTOMER_INSIGHTS",
  SET_REVENUE_INSIGHTS: "SET_REVENUE_INSIGHTS",
  SET_INSIGHTS_FILTERS: "SET_INSIGHTS_FILTERS",
  SET_INSIGHTS_SORT: "SET_INSIGHTS_SORT",
  TOGGLE_INSIGHTS_VIEW: "TOGGLE_INSIGHTS_VIEW",

  // Reports actions
  SET_REPORTS: "SET_REPORTS",
  SET_REPORT_METRICS: "SET_REPORT_METRICS",
  SET_REPORT_TEMPLATES: "SET_REPORT_TEMPLATES",
  ADD_GENERATED_REPORT: "ADD_GENERATED_REPORT",
  UPDATE_REPORT_STATUS: "UPDATE_REPORT_STATUS",
  SET_REPORT_FILTERS: "SET_REPORT_FILTERS",
  SET_CURRENT_REPORT_VIEW: "SET_CURRENT_REPORT_VIEW",

  // Common actions
  SET_LOADING: "SET_LOADING",
  SET_ERROR: "SET_ERROR",
  UPDATE_CACHE: "UPDATE_CACHE",
  CLEAR_CACHE: "CLEAR_CACHE",
};

const initialBusinessDataState = {
  // Customer state
  customers: [],
  customerSegments: [],
  customerPagination: {
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  },
  customerFilters: {
    segment: "all",
    location: "all",
    dateRange: "30",
    searchQuery: "",
    sortBy: "totalSpend",
    sortOrder: "desc",
  },

  // Campaign state
  campaigns: {
    primaryRewards: [],
    flashPromotions: [],
    recurringPromotions: [],
    groupRewards: [],
    targetedCampaigns: [],
    nudgeCampaigns: [],
  },
  campaignFilters: {
    status: "all",
    type: "all",
    location: "all",
  },

  // Insights state
  insightsData: null,
  customerInsights: null,
  revenueInsights: null,
  insightsFilters: {
    dateRange: "30",
    selectedLocation: "all",
    selectedSegment: "all",
    timeOfDay: "all",
    dayOfWeek: "all",
  },
  insightsSortConfig: {
    key: "totalSpend",
    direction: "desc",
  },
  showCustomerTable: false,
  activeInsightsView: "overview",

  // Reports state
  reports: [],
  reportMetrics: null,
  reportTemplates: [],
  generatedReports: [],
  reportFilters: {
    dateRange: "30",
    location: "all",
    reportType: "all",
  },
  currentReportView: 0,

  // Common state
  loading: false,
  error: null,
  cache: new Map(),
  lastFetch: null,
  lastUpdated: null,
};

const businessDataReducer = (state, action) => {
  switch (action.type) {
    // Customer reducers
    case BUSINESS_DATA_ACTIONS.SET_CUSTOMERS:
      return { ...state, customers: action.payload };

    case BUSINESS_DATA_ACTIONS.SET_CUSTOMER_SEGMENTS:
      return { ...state, customerSegments: action.payload };

    case BUSINESS_DATA_ACTIONS.UPDATE_CUSTOMER:
      return {
        ...state,
        customers: state.customers.map((customer) =>
          customer.id === action.payload.id
            ? { ...customer, ...action.payload.updates }
            : customer
        ),
      };

    case BUSINESS_DATA_ACTIONS.ADD_CUSTOMER:
      return {
        ...state,
        customers: [...state.customers, action.payload],
      };

    case BUSINESS_DATA_ACTIONS.SET_CUSTOMER_FILTERS:
      return {
        ...state,
        customerFilters: { ...state.customerFilters, ...action.payload },
        customerPagination: { ...state.customerPagination, page: 1 },
      };

    case BUSINESS_DATA_ACTIONS.SET_CUSTOMER_PAGINATION:
      return {
        ...state,
        customerPagination: { ...state.customerPagination, ...action.payload },
      };

    // Campaign reducers
    case BUSINESS_DATA_ACTIONS.SET_CAMPAIGNS:
      return { ...state, campaigns: action.payload };

    case BUSINESS_DATA_ACTIONS.ADD_CAMPAIGN:
      const { type: campaignType, campaign } = action.payload;
      return {
        ...state,
        campaigns: {
          ...state.campaigns,
          [campaignType]: [...state.campaigns[campaignType], campaign],
        },
      };

    case BUSINESS_DATA_ACTIONS.UPDATE_CAMPAIGN:
      const { type: updateType, id: campaignId, updates } = action.payload;
      return {
        ...state,
        campaigns: {
          ...state.campaigns,
          [updateType]: state.campaigns[updateType].map((campaign) =>
            campaign.id === campaignId ? { ...campaign, ...updates } : campaign
          ),
        },
      };

    case BUSINESS_DATA_ACTIONS.DELETE_CAMPAIGN:
      const { type: deleteType, id: deleteId } = action.payload;
      return {
        ...state,
        campaigns: {
          ...state.campaigns,
          [deleteType]: state.campaigns[deleteType].filter(
            (campaign) => campaign.id !== deleteId
          ),
        },
      };

    case BUSINESS_DATA_ACTIONS.SET_CAMPAIGN_FILTERS:
      return {
        ...state,
        campaignFilters: { ...state.campaignFilters, ...action.payload },
      };

    // Insights reducers
    case BUSINESS_DATA_ACTIONS.SET_INSIGHTS_DATA:
      return {
        ...state,
        insightsData: action.payload,
        lastUpdated: new Date().toISOString(),
      };

    case BUSINESS_DATA_ACTIONS.SET_CUSTOMER_INSIGHTS:
      return { ...state, customerInsights: action.payload };

    case BUSINESS_DATA_ACTIONS.SET_REVENUE_INSIGHTS:
      return { ...state, revenueInsights: action.payload };

    case BUSINESS_DATA_ACTIONS.SET_INSIGHTS_FILTERS:
      return {
        ...state,
        insightsFilters: { ...state.insightsFilters, ...action.payload },
      };

    case BUSINESS_DATA_ACTIONS.SET_INSIGHTS_SORT:
      return { ...state, insightsSortConfig: action.payload };

    case BUSINESS_DATA_ACTIONS.TOGGLE_INSIGHTS_VIEW:
      return {
        ...state,
        showCustomerTable:
          action.payload.type === "customerTable"
            ? action.payload.value
            : state.showCustomerTable,
        activeInsightsView:
          action.payload.type === "activeView"
            ? action.payload.value
            : state.activeInsightsView,
      };

    // Reports reducers
    case BUSINESS_DATA_ACTIONS.SET_REPORTS:
      return { ...state, reports: action.payload };

    case BUSINESS_DATA_ACTIONS.SET_REPORT_METRICS:
      return { ...state, reportMetrics: action.payload };

    case BUSINESS_DATA_ACTIONS.SET_REPORT_TEMPLATES:
      return { ...state, reportTemplates: action.payload };

    case BUSINESS_DATA_ACTIONS.ADD_GENERATED_REPORT:
      return {
        ...state,
        generatedReports: [action.payload, ...state.generatedReports],
      };

    case BUSINESS_DATA_ACTIONS.UPDATE_REPORT_STATUS:
      return {
        ...state,
        generatedReports: state.generatedReports.map((report) =>
          report.id === action.payload.id
            ? { ...report, ...action.payload.updates }
            : report
        ),
      };

    case BUSINESS_DATA_ACTIONS.SET_REPORT_FILTERS:
      return {
        ...state,
        reportFilters: { ...state.reportFilters, ...action.payload },
      };

    case BUSINESS_DATA_ACTIONS.SET_CURRENT_REPORT_VIEW:
      return { ...state, currentReportView: action.payload };

    // Common reducers
    case BUSINESS_DATA_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };

    case BUSINESS_DATA_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload };

    case BUSINESS_DATA_ACTIONS.UPDATE_CACHE:
      const newCache = new Map(state.cache);
      newCache.set(action.payload.key, action.payload.data);
      return { ...state, cache: newCache, lastFetch: Date.now() };

    case BUSINESS_DATA_ACTIONS.CLEAR_CACHE:
      return { ...state, cache: new Map() };

    default:
      return state;
  }
};

export const BusinessDataProvider = ({ children, notificationHooks = {} }) => {
  const [state, dispatch] = useReducer(
    businessDataReducer,
    initialBusinessDataState
  );
  const { user, businessSettings, globalFilters, getBusinessData } = useCore();

  // Use passed notification hooks or create stub functions
  const {
    showSuccess = () => {},
    showError = () => {},
    showLoading = () => {},
    removeNotification = () => {},
    logUpdate = () => {},
  } = notificationHooks;

  // ==========================================================================
  // CUSTOMER FUNCTIONS
  // ==========================================================================

  const loadCustomers = useCallback(
    async (filters = {}) => {
      try {
        dispatch({ type: BUSINESS_DATA_ACTIONS.SET_LOADING, payload: true });

        const mergedFilters = { ...state.customerFilters, ...filters };
        const cacheKey = `customers_${JSON.stringify(mergedFilters)}`;

        // Check cache first
        const cached = dataService.getCache(cacheKey);
        if (cached) {
          dispatch({
            type: BUSINESS_DATA_ACTIONS.SET_CUSTOMERS,
            payload: cached.customers,
          });
          dispatch({
            type: BUSINESS_DATA_ACTIONS.SET_CUSTOMER_SEGMENTS,
            payload: cached.segments,
          });
          return;
        }

        const customers = await getAllCustomers(mergedFilters);
        const segments = customerSegments;

        dispatch({
          type: BUSINESS_DATA_ACTIONS.SET_CUSTOMERS,
          payload: customers,
        });
        dispatch({
          type: BUSINESS_DATA_ACTIONS.SET_CUSTOMER_SEGMENTS,
          payload: segments,
        });

        // Cache the results
        dataService.setCache(cacheKey, { customers, segments });
      } catch (error) {
        console.error("Failed to load customers:", error);
        dispatch({
          type: BUSINESS_DATA_ACTIONS.SET_ERROR,
          payload: error.message,
        });
        showError("Failed to load customers");
      } finally {
        dispatch({ type: BUSINESS_DATA_ACTIONS.SET_LOADING, payload: false });
      }
    },
    [state.customerFilters, showError]
  );

  const updateCustomer = useCallback(
    async (customerId, updates) => {
      try {
        const updatedCustomer = await updateCustomerData(customerId, updates);
        dispatch({
          type: BUSINESS_DATA_ACTIONS.UPDATE_CUSTOMER,
          payload: { id: customerId, updates: updatedCustomer },
        });
        showSuccess("Customer updated successfully");
        logUpdate("customer_update", { customerId, updates });
        dataService.clearCache("customers");
      } catch (error) {
        console.error("Failed to update customer:", error);
        showError("Failed to update customer");
      }
    },
    [showSuccess, showError, logUpdate]
  );

  const addCustomer = useCallback(
    async (customerData) => {
      try {
        const newCustomer = await addCustomerData(customerData);
        dispatch({
          type: BUSINESS_DATA_ACTIONS.ADD_CUSTOMER,
          payload: newCustomer,
        });
        showSuccess("Customer added successfully");
        logUpdate("customer_add", { customerId: newCustomer.id });
        dataService.clearCache("customers");
      } catch (error) {
        console.error("Failed to add customer:", error);
        showError("Failed to add customer");
      }
    },
    [showSuccess, showError, logUpdate]
  );

  const updateCustomerFilters = useCallback((newFilters) => {
    dispatch({
      type: BUSINESS_DATA_ACTIONS.SET_CUSTOMER_FILTERS,
      payload: newFilters,
    });
  }, []);

  // ==========================================================================
  // CAMPAIGN FUNCTIONS
  // ==========================================================================

  const loadCampaigns = useCallback(
    async (forceRefresh = false) => {
      if (!globalFilters.selectedLocation) {
        console.log(
          "⏳ Waiting for location selection before loading campaigns..."
        );
        return;
      }

      try {
        dispatch({ type: BUSINESS_DATA_ACTIONS.SET_LOADING, payload: true });

        const businessData = await getBusinessData();
        if (!businessData?.business?.id) {
          console.log("⏳ Business data not ready yet, will retry...");
          return false;
        }

        console.log(
          "🚀 Business data ready, loading campaigns from Firebase..."
        );
        const campaignsData = await getAllCampaigns(); // This now uses Firebase
        dispatch({
          type: BUSINESS_DATA_ACTIONS.SET_CAMPAIGNS,
          payload: campaignsData,
        });

        return true;
      } catch (error) {
        console.error("Failed to load campaigns:", error);
        dispatch({
          type: BUSINESS_DATA_ACTIONS.SET_ERROR,
          payload: error.message,
        });
        showError("Failed to load campaigns");
        return false;
      } finally {
        dispatch({ type: BUSINESS_DATA_ACTIONS.SET_LOADING, payload: false });
      }
    },
    [globalFilters.selectedLocation, getBusinessData, showError]
  );

  // Update createCampaign function
  const createCampaign = useCallback(
    async (type, campaignData) => {
      try {
        const newCampaign = await addCampaign((type = "default"), campaignData); // Firebase call
        dispatch({
          type: BUSINESS_DATA_ACTIONS.ADD_CAMPAIGN,
          payload: {
            type: firebaseService.mapCampaignType(type),
            campaign: newCampaign,
          },
        });
        showSuccess(`${type} campaign created successfully`);
        logUpdate("campaign_change", {
          campaignName: campaignData.name,
          action: "created",
        });
      } catch (error) {
        console.error("Failed to create campaign:", error);
        showError("Failed to create campaign");
      }
    },
    [showSuccess, showError, logUpdate]
  );

  const updateCampaignData = useCallback(
    async (type, id, updates) => {
      try {
        updateCampaign(id, type, updates);
        dispatch({
          type: BUSINESS_DATA_ACTIONS.UPDATE_CAMPAIGN,
          payload: { type, id, updates },
        });
        showSuccess("Campaign updated successfully");
        logUpdate("campaign_change", {
          campaignName: updates.name,
          action: "updated",
        });
      } catch (error) {
        console.error("Failed to update campaign:", error);
        showError("Failed to update campaign");
      }
    },
    [showSuccess, showError, logUpdate]
  );

  const deleteCampaignData = useCallback(
    async (type, id) => {
      try {
        deleteCampaign(id, type);
        dispatch({
          type: BUSINESS_DATA_ACTIONS.DELETE_CAMPAIGN,
          payload: { type, id },
        });
        showSuccess("Campaign deleted successfully");
        logUpdate("campaign_change", { campaignId: id, action: "deleted" });
      } catch (error) {
        console.error("Failed to delete campaign:", error);
        showError("Failed to delete campaign");
      }
    },
    [showSuccess, showError, logUpdate]
  );

  // ==========================================================================
  // INSIGHTS FUNCTIONS
  // ==========================================================================

  const loadInsights = useCallback(async () => {
    try {
      dispatch({ type: BUSINESS_DATA_ACTIONS.SET_LOADING, payload: true });

      // Load insights from JSON seed data
      const insights = insightsSeed;

      dispatch({
        type: BUSINESS_DATA_ACTIONS.SET_INSIGHTS_DATA,
        payload: insights,
      });

      // Calculate customer insights
      const customerStats = calculateCustomerStatsFromJson(
        insights.customers || []
      );
      dispatch({
        type: BUSINESS_DATA_ACTIONS.SET_CUSTOMER_INSIGHTS,
        payload: customerStats,
      });

      // Calculate revenue insights
      const revenueStats = calculateRevenueInsights(insights);
      dispatch({
        type: BUSINESS_DATA_ACTIONS.SET_REVENUE_INSIGHTS,
        payload: revenueStats,
      });
    } catch (error) {
      console.error("Failed to load insights:", error);
      dispatch({
        type: BUSINESS_DATA_ACTIONS.SET_ERROR,
        payload: error.message,
      });
      showError("Failed to load insights");
    } finally {
      dispatch({ type: BUSINESS_DATA_ACTIONS.SET_LOADING, payload: false });
    }
  }, [showError]);

  const updateInsightsFilters = useCallback((newFilters) => {
    dispatch({
      type: BUSINESS_DATA_ACTIONS.SET_INSIGHTS_FILTERS,
      payload: newFilters,
    });
  }, []);

  const updateInsightsSort = useCallback((sortConfig) => {
    dispatch({
      type: BUSINESS_DATA_ACTIONS.SET_INSIGHTS_SORT,
      payload: sortConfig,
    });
  }, []);

  const toggleInsightsView = useCallback((type, value) => {
    dispatch({
      type: BUSINESS_DATA_ACTIONS.TOGGLE_INSIGHTS_VIEW,
      payload: { type, value },
    });
  }, []);

  // ==========================================================================
  // REPORTS FUNCTIONS
  // ==========================================================================

  const loadReports = useCallback(async () => {
    try {
      dispatch({ type: BUSINESS_DATA_ACTIONS.SET_LOADING, payload: true });

      const reports = await getReportsData(state.reportFilters);
      const templates = await getReportTemplates();

      dispatch({ type: BUSINESS_DATA_ACTIONS.SET_REPORTS, payload: reports });
      dispatch({
        type: BUSINESS_DATA_ACTIONS.SET_REPORT_TEMPLATES,
        payload: templates,
      });
    } catch (error) {
      console.error("Failed to load reports:", error);
      dispatch({
        type: BUSINESS_DATA_ACTIONS.SET_ERROR,
        payload: error.message,
      });
      showError("Failed to load reports");
    } finally {
      dispatch({ type: BUSINESS_DATA_ACTIONS.SET_LOADING, payload: false });
    }
  }, [state.reportFilters, showError]);

  const generateReport = useCallback(
    async (reportConfig) => {
      try {
        const reportId = showLoading("Generating report...");

        const report = await generateReportData(reportConfig);
        dispatch({
          type: BUSINESS_DATA_ACTIONS.ADD_GENERATED_REPORT,
          payload: report,
        });

        removeNotification(reportId);
        showSuccess("Report generated successfully");

        return report;
      } catch (error) {
        console.error("Failed to generate report:", error);
        showError("Failed to generate report");
      }
    },
    [showLoading, showSuccess, showError, removeNotification]
  );

  const updateReportFilters = useCallback((newFilters) => {
    dispatch({
      type: BUSINESS_DATA_ACTIONS.SET_REPORT_FILTERS,
      payload: newFilters,
    });
  }, []);

  // ==========================================================================
  // HELPER FUNCTIONS
  // ==========================================================================

  const calculateCustomerStatsFromJson = (customers) => {
    const stats = {
      total: customers.length,
      active: customers.filter((c) => c.status === "active").length,
      atRisk: customers.filter((c) => c.status === "at-risk").length,
      new: customers.filter((c) => c.status === "new").length,
      totalSpend: customers.reduce((sum, c) => sum + (c.totalSpend || 0), 0),
      avgSpend: 0,
      totalVisits: customers.reduce((sum, c) => sum + (c.visitCount || 0), 0),
      totalRewardsEarned: customers.reduce(
        (sum, c) => sum + (c.rewardsEarned || 0),
        0
      ),
      totalRewardsRedeemed: customers.reduce(
        (sum, c) => sum + (c.rewardsRedeemed || 0),
        0
      ),
    };
    stats.avgSpend = stats.total > 0 ? stats.totalSpend / stats.total : 0;
    return stats;
  };

  const calculateRevenueInsights = (insights) => {
    // Calculate revenue insights from the insights data
    const revenue = insights.revenue || {};
    return {
      totalRevenue: revenue.total || 0,
      averageOrderValue: revenue.averageOrderValue || 0,
      topProducts: revenue.topProducts || [],
      revenueByLocation: revenue.byLocation || {},
      revenueGrowth: revenue.growth || 0,
    };
  };

  // ==========================================================================
  // COMPUTED VALUES
  // ==========================================================================

  const customerStats = useMemo(() => {
    return calculateCustomerStats(state.customers);
  }, [state.customers]);

  const campaignStats = useMemo(() => {
    const allCampaigns = Object.values(state.campaigns).flat();
    return {
      total: allCampaigns.length,
      active: allCampaigns.filter((c) => c.status === "active").length,
      scheduled: allCampaigns.filter((c) => c.status === "scheduled").length,
      completed: allCampaigns.filter((c) => c.status === "completed").length,
    };
  }, [state.campaigns]);

  const filteredCustomers = useMemo(() => {
    let filtered = [...state.customers];

    if (state.customerFilters.segment !== "all") {
      filtered = filtered.filter(
        (c) => c.segment === state.customerFilters.segment
      );
    }

    if (state.customerFilters.searchQuery) {
      const query = state.customerFilters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.email.toLowerCase().includes(query)
      );
    }

    // Sort customers
    filtered.sort((a, b) => {
      const aVal = a[state.customerFilters.sortBy] || 0;
      const bVal = b[state.customerFilters.sortBy] || 0;

      if (state.customerFilters.sortOrder === "desc") {
        return bVal - aVal;
      }
      return aVal - bVal;
    });

    return filtered;
  }, [state.customers, state.customerFilters]);

  // ==========================================================================
  // EFFECTS
  // ==========================================================================

  // Load customers when filters change
  useEffect(() => {
    if (user && globalFilters.selectedLocation) {
      loadCustomers();
    }
  }, [user, globalFilters.selectedLocation, loadCustomers]);

  // Load campaigns when business data is available
  useEffect(() => {
    if (user && globalFilters.selectedLocation && businessSettings) {
      const attemptLoad = async () => {
        try {
          const success = await loadCampaigns(false);
          if (!success) {
            // Retry after a delay
            setTimeout(() => {
              console.log("🔄 Retrying campaign load...");
              loadCampaigns(false).catch((error) => {
                console.log("❌ Retry failed:", error.message);
              });
            }, 2000);
          }
        } catch (error) {
          console.error("Campaign load attempt failed:", error);
        }
      };

      attemptLoad();
    }
  }, [user, globalFilters.selectedLocation, businessSettings, loadCampaigns]);

  // Load insights on mount
  useEffect(() => {
    loadInsights();
  }, [loadInsights]);

  // Load reports when filters change
  useEffect(() => {
    if (user) {
      loadReports();
    }
  }, [user, state.reportFilters, loadReports]);

  // Subscribe to data changes
  useEffect(() => {
    const unsubscribes = [
      dataService.subscribe("customers", () => loadCustomers()),
      dataService.subscribe("campaigns", () => loadCampaigns()),
      dataService.subscribe("reports", () => loadReports()),
    ];

    return () => unsubscribes.forEach((unsub) => unsub());
  }, [loadCustomers, loadCampaigns, loadReports]);

  // ==========================================================================
  // CONTEXT VALUE
  // ==========================================================================

  const contextValue = useMemo(
    () => ({
      // Customer data
      customers: state.customers,
      customerSegments: state.customerSegments,
      customerFilters: state.customerFilters,
      customerPagination: state.customerPagination,
      customerStats,
      filteredCustomers,

      // Customer functions
      loadCustomers,
      updateCustomer,
      addCustomer,
      updateCustomerFilters,

      // Campaign data
      campaigns: state.campaigns,
      campaignFilters: state.campaignFilters,
      campaignStats,

      // Campaign functions
      loadCampaigns,
      createCampaign,
      updateCampaign: updateCampaignData,
      deleteCampaign: deleteCampaignData,

      // Insights data
      insightsData: state.insightsData,
      customerInsights: state.customerInsights,
      revenueInsights: state.revenueInsights,
      insightsFilters: state.insightsFilters,
      insightsSortConfig: state.insightsSortConfig,
      showCustomerTable: state.showCustomerTable,
      activeInsightsView: state.activeInsightsView,

      // Insights functions
      loadInsights,
      updateInsightsFilters,
      updateInsightsSort,
      toggleInsightsView,

      // Reports data
      reports: state.reports,
      reportMetrics: state.reportMetrics,
      reportTemplates: state.reportTemplates,
      generatedReports: state.generatedReports,
      reportFilters: state.reportFilters,
      currentReportView: state.currentReportView,

      // Reports functions
      loadReports,
      generateReport,
      updateReportFilters,

      // Common state
      loading: state.loading,
      error: state.error,
      lastUpdated: state.lastUpdated,
    }),
    [
      state,
      customerStats,
      campaignStats,
      filteredCustomers,
      loadCustomers,
      updateCustomer,
      addCustomer,
      updateCustomerFilters,
      loadCampaigns,
      createCampaign,
      updateCampaignData,
      deleteCampaignData,
      loadInsights,
      updateInsightsFilters,
      updateInsightsSort,
      toggleInsightsView,
      loadReports,
      generateReport,
      updateReportFilters,
    ]
  );

  return (
    <BusinessDataContext.Provider value={contextValue}>
      {children}
    </BusinessDataContext.Provider>
  );
};

// Custom hooks for backward compatibility
export const useBusinessData = () => {
  const context = useContext(BusinessDataContext);
  if (!context) {
    throw new Error(
      "useBusinessData must be used within a BusinessDataProvider"
    );
  }
  return context;
};

export const useCustomers = () => {
  const businessData = useBusinessData();
  const { getCustomerStats } = useData();
  return {
    customers: businessData.customers,
    segments: businessData.customerSegments,
    filters: businessData.customerFilters,
    pagination: businessData.customerPagination,
    stats: businessData.customerStats,
    filteredCustomers: businessData.filteredCustomers,
    loading: businessData.loading,
    error: businessData.error,
    loadCustomers: businessData.loadCustomers,
    updateCustomer: businessData.updateCustomer,
    addCustomer: businessData.addCustomer,
    updateFilters: businessData.updateCustomerFilters,
    getCustomerStats,
  };
};

export const useCampaigns = () => {
  const businessData = useBusinessData();
  return {
    campaigns: businessData.campaigns,
    filters: businessData.campaignFilters,
    stats: businessData.campaignStats,
    loading: businessData.loading,
    error: businessData.error,
    loadCampaigns: businessData.loadCampaigns,
    createCampaign: businessData.createCampaign,
    updateCampaign: businessData.updateCampaign,
    deleteCampaign: businessData.deleteCampaign,
  };
};

export const useInsights = () => {
  const businessData = useBusinessData();
  const { getCustomerStats, loadInsights, exportInsights } = useData();
  return {
    insightsData: businessData.insightsData,
    customerInsights: businessData.customerInsights,
    revenueInsights: businessData.revenueInsights,
    filters: businessData.insightsFilters,
    sortConfig: businessData.insightsSortConfig,
    showCustomerTable: businessData.showCustomerTable,
    activeView: businessData.activeInsightsView,
    loading: businessData.loading,
    error: businessData.error,
    lastUpdated: businessData.lastUpdated,
    loadInsights,
    exportInsights,
    updateFilters: businessData.updateInsightsFilters,
    updateSort: businessData.updateInsightsSort,
    toggleView: businessData.toggleInsightsView,
    getCustomerStats,
    customers: businessData.customers,
  };
};

export const useReports = () => {
  const businessData = useBusinessData();
  return {
    reports: businessData.reports,
    metrics: businessData.reportMetrics,
    templates: businessData.reportTemplates,
    generatedReports: businessData.generatedReports,
    filters: businessData.reportFilters,
    currentView: businessData.currentReportView,
    loading: businessData.loading,
    error: businessData.error,
    loadReports: businessData.loadReports,
    generateReport: businessData.generateReport,
    updateFilters: businessData.updateReportFilters,
  };
};
