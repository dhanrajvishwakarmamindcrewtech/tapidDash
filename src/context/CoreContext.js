import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useReducer,
  useMemo,
} from "react";
import { auth, db } from "../firebase/config";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from "firebase/auth";
import {
  doc,
  collection,
  writeBatch,
  serverTimestamp,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import {
  getSettings,
  updateSettings as updateSettingsData,
  dataService,
} from "../data";
import safeStorage from "../utils/safeStorage";
const DEBUG = process.env.NODE_ENV !== "production";

const CoreContext = createContext();

// Action types for core state management
const CORE_ACTIONS = {
  SET_USER: "SET_USER",
  SET_BUSINESS_SETTINGS: "SET_BUSINESS_SETTINGS",
  SET_USER_SETTINGS: "SET_USER_SETTINGS",
  SET_GLOBAL_FILTERS: "SET_GLOBAL_FILTERS",
  SET_CURRENT_PAGE: "SET_CURRENT_PAGE",
  SET_DEMOGRAPHICS: "SET_DEMOGRAPHICS",
  SET_LOADING: "SET_LOADING",
  SET_ERROR: "SET_ERROR",
  SET_HEALTH_STATUS: "SET_HEALTH_STATUS",
  SET_ONLINE_STATUS: "SET_ONLINE_STATUS",
};

const initialCoreState = {
  // Auth state
  user: undefined, // undefined = checking, null = not authenticated, object = authenticated

  // Business settings
  businessSettings: null,

  // User settings
  userSettings: null,
  settingsLoaded: false,
  settingsLoading: false,

  // App state
  currentPage: "home",
  globalFilters: {
    selectedLocation: "all",
    dateRange: "30",
    timeRange: "all",
  },
  demographicsData: null,

  // System state
  loading: false,
  error: null,
  healthStatus: { status: "healthy", checks: {} },
  isOnline: navigator.onLine,
};

const coreReducer = (state, action) => {
  switch (action.type) {
    case CORE_ACTIONS.SET_USER:
      return { ...state, user: action.payload };

    case CORE_ACTIONS.SET_BUSINESS_SETTINGS:
      return { ...state, businessSettings: action.payload };

    case CORE_ACTIONS.SET_USER_SETTINGS:
      return {
        ...state,
        userSettings: action.payload.settings,
        settingsLoaded:
          action.payload.loaded !== undefined
            ? action.payload.loaded
            : state.settingsLoaded,
        settingsLoading:
          action.payload.loading !== undefined
            ? action.payload.loading
            : state.settingsLoading,
      };

    case CORE_ACTIONS.SET_GLOBAL_FILTERS:
      return {
        ...state,
        globalFilters: { ...state.globalFilters, ...action.payload },
      };

    case CORE_ACTIONS.SET_CURRENT_PAGE:
      return { ...state, currentPage: action.payload };

    case CORE_ACTIONS.SET_DEMOGRAPHICS:
      return { ...state, demographicsData: action.payload };

    case CORE_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };

    case CORE_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload };

    case CORE_ACTIONS.SET_HEALTH_STATUS:
      return { ...state, healthStatus: action.payload };

    case CORE_ACTIONS.SET_ONLINE_STATUS:
      return { ...state, isOnline: action.payload };

    default:
      return state;
  }
};

export const CoreProvider = ({ children, isNewUser = false }) => {
  const [state, dispatch] = useReducer(coreReducer, initialCoreState);

  // Demographics API configuration - using placeholder for now since original API is down
  const DEMOGRAPHICS_API_URL = "https://jsonplaceholder.typicode.com/users/1";

  // ===========================================================================
  // AUTH FUNCTIONS
  // ===========================================================================

  // Enhanced account creation with Firestore integration
  const createAccount = useCallback(
    async ({ email, password, displayName, enhancedData, ...rest }) => {
      console.log(
        "ðŸ”¥ CORE: Starting account creation with Firestore integration..."
      );

      if (!enhancedData) {
        console.error(
          "âŒ createAccount called without enhancedData payload â€“ aborting."
        );
        return {
          success: false,
          error: new Error("Enhanced signup data missing"),
        };
      }

      try {
        // Create Firebase Auth account
        console.log("ðŸ“§ Creating Firebase Auth account for:", email);
        const cred = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const firebaseUser = cred.user;

        // Update display name if provided
        if (displayName) {
          await updateProfile(firebaseUser, { displayName });
          console.log("ðŸ‘¤ Updated display name:", displayName);
        }
        safeStorage.setItem("userData", cred);

        // Save comprehensive business data to Firestore
        let firestoreResult = null;
        if (enhancedData) {
          console.log(
            "ðŸ’¾ Saving comprehensive business data to Firestore..."
          );
          firestoreResult = await saveBusinessToFirestore(
            enhancedData,
            firebaseUser.uid
          );

          if (firestoreResult.success && !firestoreResult.usedDefaultFallback) {
            const businessRef = doc(
              db,
              "businesses",
              firestoreResult.businessId
            );
            const businessSnap = await getDoc(businessRef);

            await safeStorage.setItem("businessData", {
              businessId: businessSnap.data().id,
              businessName: businessSnap.data()?.businessName || "My Business",
              locationsCreated: firestoreResult.locationsCreated,
            });
          } else {
            console.error(
              "âŒ Failed to save business data or default fallback used:",
              firestoreResult.error || "DEFAULT_LOCATION_FALLBACK"
            );
            await firebaseSignOut(auth);
            return {
              success: false,
              error:
                firestoreResult.error || new Error("Business data not saved"),
            };
          }
        }

        dispatch({
          type: CORE_ACTIONS.SET_USER,
          payload: { ...firebaseUser, isNewUser: true },
        });

        return {
          success: true,
          user: firebaseUser,
          businessData: enhancedData
            ? {
                businessId: firestoreResult.businessId,
                locationsCreated: firestoreResult.locationsCreated,
                onboardingData: enhancedData,
              }
            : null,
        };
      } catch (error) {
        console.error("âŒ Account creation failed:", error);
        return { success: false, error };
      }
    },
    []
  );

  // Sign in function
  const signIn = useCallback(async (email, password) => {
    try {
      console.log(email, password, "testing");

      const cred = await signInWithEmailAndPassword(auth, email, password);
      safeStorage.setItem("userData", cred);

      const businessRef = doc(db, "businesses", `biz_${cred.user.uid}`);
      const businessSnap = await getDoc(businessRef);

      await safeStorage.setItem("businessData", {
        businessId: businessSnap.data().id,
        businessName: businessSnap.data()?.businessName || "My Business",
        locationsCreated: {},
      });
      dispatch({ type: CORE_ACTIONS.SET_USER, payload: cred.user });
      return { success: true, user: cred.user };
    } catch (error) {
      console.error("âŒ Sign in failed:", error);
      return { success: false, error };
    }
  }, []);

  // Sign out function
  const signOut = useCallback(async () => {
    try {
      await firebaseSignOut(auth);
      dispatch({ type: CORE_ACTIONS.SET_USER, payload: null });
      localStorage.removeItem("currentPage");
      localStorage.removeItem("globalFilters");
      localStorage.removeItem("userData");
      localStorage.removeItem("businessData");
      localStorage.removeItem("tapidCampaigns");
      return { success: true };
    } catch (error) {
      console.error("âŒ Sign out failed:", error);
      return { success: false, error };
    }
  }, []);

  // Password reset function
  const resetPassword = useCallback(async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      console.error("âŒ Password reset failed:", error);
      return { success: false, error };
    }
  }, []);

  // ===========================================================================
  // BUSINESS DATA FUNCTIONS
  // ===========================================================================

  // Get business data from Firestore
  const getBusinessData = useCallback(
    async (forceRefresh = false) => {
      if (!state.user?.uid) {
        throw new Error("User not authenticated");
      }

      try {
        const businessDoc = await getDoc(doc(db, "businesses", state.user.uid));
        if (businessDoc.exists()) {
          const businessData = businessDoc.data();
          console.log("âœ… Business data loaded from Firestore:", businessData);
          return businessData;
        } else {
          console.log(
            "â„¹ï¸ No business document found for user:",
            state.user.uid
          );
          console.log(
            "â„¹ï¸ This is normal for new users who haven't completed onboarding yet"
          );
          return null;
        }
      } catch (error) {
        console.error("âŒ Failed to get business data:", error);
        throw error;
      }
    },
    [state.user?.uid]
  );

  // Load business settings
  const loadBusinessSettings = useCallback(async () => {
    try {
      dispatch({ type: CORE_ACTIONS.SET_LOADING, payload: true });
      const businessData = await getBusinessData();
      dispatch({
        type: CORE_ACTIONS.SET_BUSINESS_SETTINGS,
        payload: businessData,
      });
      return businessData;
    } catch (error) {
      console.error("Failed to load business settings:", error);
      dispatch({ type: CORE_ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    } finally {
      dispatch({ type: CORE_ACTIONS.SET_LOADING, payload: false });
    }
  }, [getBusinessData]);

  // Fetch demographics data
  const fetchDemographics = useCallback(async () => {
    try {
      if (DEBUG)
        console.log("ðŸ” Fetching demographics from:", DEMOGRAPHICS_API_URL);
      const res = await fetch(DEMOGRAPHICS_API_URL);
      if (DEBUG) console.log("ðŸ“Š Demographics API status:", res.status);

      const text = await res.text();
      if (DEBUG && text?.length < 2000)
        console.log("ðŸ“Š Demographics API raw response:", text);

      let data;
      try {
        data = JSON.parse(text);
        if (DEBUG)
          console.log("âœ… Demographics data parsed successfully:", data);

        // Transform the placeholder data into our expected format
        const transformedData = {
          demographics: {
            age_groups: [
              { group: "18-25", percentage: 25 },
              { group: "26-35", percentage: 35 },
              { group: "36-45", percentage: 25 },
              { group: "46+", percentage: 15 },
            ],
            location: data.address
              ? `${data.address.city}, ${data.address.geo.lat}, ${data.address.geo.lng}`
              : "Dublin, Ireland",
            interests: ["shopping", "technology", "food"],
          },
        };

        dispatch({
          type: CORE_ACTIONS.SET_DEMOGRAPHICS,
          payload: transformedData,
        });
      } catch (e) {
        console.error("âŒ Failed to parse demographics JSON:", e);
        console.error("âŒ Raw response was:", text);

        // Fallback to default demographics data
        const fallbackData = {
          demographics: {
            age_groups: [
              { group: "18-25", percentage: 25 },
              { group: "26-35", percentage: 35 },
              { group: "36-45", percentage: 25 },
              { group: "46+", percentage: 15 },
            ],
            location: "Dublin, Ireland",
            interests: ["shopping", "technology", "food"],
          },
        };

        dispatch({
          type: CORE_ACTIONS.SET_DEMOGRAPHICS,
          payload: fallbackData,
        });
        return;
      }
    } catch (err) {
      console.error("âŒ Failed to fetch demographics:", err);

      // Fallback to default demographics data even on network errors
      const fallbackData = {
        demographics: {
          age_groups: [
            { group: "18-25", percentage: 25 },
            { group: "26-35", percentage: 35 },
            { group: "36-45", percentage: 25 },
            { group: "46+", percentage: 15 },
          ],
          location: "Dublin, Ireland",
          interests: ["shopping", "technology", "food"],
        },
      };

      dispatch({ type: CORE_ACTIONS.SET_DEMOGRAPHICS, payload: fallbackData });
    }
  }, []);

  // ===========================================================================
  // SETTINGS FUNCTIONS
  // ===========================================================================

  // Load user settings
  const loadSettings = useCallback(() => {
    try {
      dispatch({
        type: CORE_ACTIONS.SET_USER_SETTINGS,
        payload: { loading: true },
      });

      let mergedSettings = null;
      if (isNewUser) {
        mergedSettings = {
          companyName: "",
          industry: "",
          websiteUrl: "",
          taxId: "",
          primaryContact: "",
          contactEmail: "",
          contactPhone: "",
          address: "",
          twoFactorAuth: false,
          emailNotifications: true,
          smsNotifications: false,
          darkMode: false,
          primaryColor: "#10b981",
          sessionTimeout: 120,
          logRetention: "30 days",
        };
      } else {
        const dataLayerSettings = getSettings();
        const savedSettings = localStorage.getItem("userSettings");
        mergedSettings = dataLayerSettings;

        if (savedSettings) {
          try {
            const parsedSaved = JSON.parse(savedSettings);
            mergedSettings = { ...dataLayerSettings, ...parsedSaved };
            if (DEBUG)
              console.log("Loaded settings from localStorage:", parsedSaved);
          } catch (parseError) {
            console.warn(
              "Failed to parse saved settings, using defaults:",
              parseError
            );
          }
        } else {
          if (DEBUG)
            console.log("No saved settings found, using data layer defaults");
        }
      }

      dispatch({
        type: CORE_ACTIONS.SET_USER_SETTINGS,
        payload: { settings: mergedSettings, loaded: true, loading: false },
      });
    } catch (err) {
      console.error("Error loading settings:", err);
      const defaultSettings = {
        companyName: "",
        industry: "",
        websiteUrl: "",
        taxId: "",
        primaryContact: "",
        contactEmail: "",
        contactPhone: "",
        address: "",
        twoFactorAuth: false,
        emailNotifications: true,
        smsNotifications: false,
        darkMode: false,
        primaryColor: "#10b981",
        sessionTimeout: 120,
        logRetention: "30 days",
      };

      dispatch({
        type: CORE_ACTIONS.SET_USER_SETTINGS,
        payload: { settings: defaultSettings, loaded: true, loading: false },
      });
    }
  }, [isNewUser]);

  // Save user settings
  const saveSettings = useCallback(
    async (newSettings) => {
      try {
        dispatch({
          type: CORE_ACTIONS.SET_USER_SETTINGS,
          payload: { loading: true },
        });

        const updatedSettings = { ...state.userSettings, ...newSettings };

        // Save to localStorage
        localStorage.setItem("userSettings", JSON.stringify(updatedSettings));

        // Save through data layer
        await updateSettingsData(updatedSettings);

        dispatch({
          type: CORE_ACTIONS.SET_USER_SETTINGS,
          payload: { settings: updatedSettings, loading: false },
        });

        // Notify subscribers
        dataService.notify("settings", {
          type: "update",
          settings: updatedSettings,
        });

        return { success: true };
      } catch (error) {
        console.error("Failed to save settings:", error);
        dispatch({
          type: CORE_ACTIONS.SET_USER_SETTINGS,
          payload: { loading: false },
        });
        return { success: false, error };
      }
    },
    [state.userSettings]
  );

  // ===========================================================================
  // APP STATE FUNCTIONS
  // ===========================================================================

  // Component update tracking state
  const [componentUpdateTracking, setComponentUpdateTracking] = useState({});

  // Update global filters
  const updateGlobalFilters = useCallback(
    (newFilters) => {
      const updatedFilters = { ...state.globalFilters, ...newFilters };
      dispatch({ type: CORE_ACTIONS.SET_GLOBAL_FILTERS, payload: newFilters });
      localStorage.setItem("globalFilters", JSON.stringify(updatedFilters));
    },
    [state.globalFilters]
  );

  // Navigate to page
  const navigateToPage = useCallback((page) => {
    dispatch({ type: CORE_ACTIONS.SET_CURRENT_PAGE, payload: page });
    localStorage.setItem("currentPage", page);
  }, []);

  // Update business settings with cross-component notification
  const updateBusinessSettings = useCallback(
    async (updates, affectedComponents = []) => {
      try {
        const updatedSettings = { ...state.businessSettings, ...updates };
        dispatch({
          type: CORE_ACTIONS.SET_BUSINESS_SETTINGS,
          payload: updatedSettings,
        });

        // Save to localStorage
        localStorage.setItem(
          "businessSettings",
          JSON.stringify(updatedSettings)
        );

        // Mark affected components as needing updates
        if (affectedComponents.length > 0) {
          const updateTracker = {};
          affectedComponents.forEach((component) => {
            updateTracker[component] = true;
          });
          setComponentUpdateTracking((prev) => ({ ...prev, ...updateTracker }));
        }

        return { success: true };
      } catch (error) {
        console.error("Failed to update business settings:", error);
        return { success: false, error };
      }
    },
    [state.businessSettings]
  );

  // Check if a component needs update
  const componentNeedsUpdate = useCallback(
    (componentName) => {
      return componentUpdateTracking[componentName] === true;
    },
    [componentUpdateTracking]
  );

  // Mark component as updated
  const markComponentUpdated = useCallback((componentName) => {
    setComponentUpdateTracking((prev) => ({
      ...prev,
      [componentName]: false,
    }));
  }, []);

  // Update business info
  const updateBusinessInfo = useCallback(
    async (updates) => {
      try {
        console.log("ðŸ¢ Updating business info:", updates);

        const updatedSettings = {
          ...state.businessSettings,
          info: { ...state.businessSettings?.info, ...updates },
        };

        dispatch({
          type: CORE_ACTIONS.SET_BUSINESS_SETTINGS,
          payload: updatedSettings,
        });
        localStorage.setItem(
          "businessSettings",
          JSON.stringify(updatedSettings)
        );

        return { success: true };
      } catch (error) {
        console.error("Failed to update business info:", error);
        throw error;
      }
    },
    [state.businessSettings]
  );

  // Update location data
  const updateLocationData = useCallback(
    async (locationId, updates) => {
      try {
        console.log("ðŸ“ Updating location data for:", locationId, updates);

        const updatedSettings = {
          ...state.businessSettings,
          locations:
            state.businessSettings?.locations?.map((loc) =>
              loc.id === locationId ? { ...loc, ...updates } : loc
            ) || [],
        };

        dispatch({
          type: CORE_ACTIONS.SET_BUSINESS_SETTINGS,
          payload: updatedSettings,
        });
        localStorage.setItem(
          "businessSettings",
          JSON.stringify(updatedSettings)
        );

        return { success: true };
      } catch (error) {
        console.error("Failed to update location data:", error);
        throw error;
      }
    },
    [state.businessSettings]
  );

  // Get health status
  const getHealthStatus = useCallback(() => {
    return state.healthStatus;
  }, [state.healthStatus]);

  // ===========================================================================
  // EFFECTS
  // ===========================================================================

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        dispatch({ type: CORE_ACTIONS.SET_USER, payload: firebaseUser });
      } else {
        dispatch({ type: CORE_ACTIONS.SET_USER, payload: null });
      }
    });
    return unsubscribe;
  }, []);

  // Initialize app from localStorage and data layer
  useEffect(() => {
    const initializeApp = async () => {
      // Load user session
      const savedPage = localStorage.getItem("currentPage") || "home";
      const savedFilters = JSON.parse(
        localStorage.getItem("globalFilters") || "{}"
      );

      dispatch({ type: CORE_ACTIONS.SET_CURRENT_PAGE, payload: savedPage });
      dispatch({
        type: CORE_ACTIONS.SET_GLOBAL_FILTERS,
        payload: savedFilters,
      });

      // Load business settings from data layer
      if (state.user) {
        try {
          await loadBusinessSettings();
        } catch (error) {
          console.error("Failed to load initial business settings:", error);
        }

        // Fetch demographics data
        try {
          await fetchDemographics();
        } catch (error) {
          console.error("Failed to fetch demographics on app init:", error);
        }
      }
    };

    if (state.user !== undefined) {
      initializeApp();
    }
  }, [state.user, loadBusinessSettings, fetchDemographics]);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Subscribe to settings changes from other sources
  useEffect(() => {
    const unsubscribe = dataService.subscribe("settings", (changeData) => {
      if (DEBUG)
        console.log("Settings changed from external source:", changeData);
      loadSettings();
    });

    return unsubscribe;
  }, [loadSettings]);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () =>
      dispatch({ type: CORE_ACTIONS.SET_ONLINE_STATUS, payload: true });
    const handleOffline = () =>
      dispatch({ type: CORE_ACTIONS.SET_ONLINE_STATUS, payload: false });

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // ===========================================================================
  // HELPER FUNCTIONS - COMPLETELY REWRITTEN FOR ENHANCED DATA
  // ===========================================================================

  const saveBusinessToFirestore = async (enhancedData, userId) => {
    console.log("ðŸ’¾ FIRESTORE: Starting comprehensive business data save...");
    console.log("ðŸ“¦ Enhanced data payload:", enhancedData);

    // Validate enhanced data structure
    if (!enhancedData?.businessRegistration?.companyInfo?.businessName) {
      console.error("âŒ Invalid business data - missing businessName");
      console.log(
        "âŒ Expected: enhancedData.businessRegistration.companyInfo.businessName"
      );
      console.log("âŒ Received:", enhancedData);
      return { success: false, error: new Error("Invalid business data") };
    }

    // Helper function to safely handle undefined values
    const safeValue = (value, defaultValue = null) => {
      return value !== undefined ? value : defaultValue;
    };

    // Helper function to safely extract object with no undefined values
    const safeObject = (obj, defaultObj = {}) => {
      if (!obj) return defaultObj;
      const cleaned = {};
      Object.keys(obj).forEach((key) => {
        if (obj[key] !== undefined) {
          cleaned[key] = obj[key];
        }
      });
      return cleaned;
    };

    try {
      const batch = writeBatch(db);
      const businessId = `biz_${userId}`;
      const businessRef = doc(db, "businesses", businessId);

      // Extract data from the actual enhanced data structure
      const companyInfo = enhancedData.businessRegistration.companyInfo;
      const userInfo = enhancedData.userProfile.personalInfo;
      const paymentInfo = enhancedData.paymentInfo || {};
      const onboardingAnalytics = enhancedData.onboardingAnalytics || {};

      // Create comprehensive business document
      const businessData = {
        id: businessId,
        userId: userId,
        businessName: companyInfo.businessName || "My Business",
        industry: companyInfo.industry || "Other",
        // companySize: companyInfo.companySize || "1-10",
        businessType: companyInfo.businessType || "standard",
        description: companyInfo.description || "",
        website: companyInfo.website || "",
        primaryOperatingCountry:
          companyInfo.primaryOperatingCountry || "Ireland",

        // Enhanced contact information
        contactInfo: {
          email: userInfo.email || "",
          phone: userInfo.phone || "",
          website: companyInfo.website || "",
          primaryContact: userInfo.fullName || "",
        },

        // Business settings
        settings: {
          currency: companyInfo.currency || userInfo.preferredCurrency || "EUR",
          timezone:
            companyInfo.timezone ||
            userInfo.preferredTimezone ||
            "Europe/Dublin",
          primaryColor: "#10b981",
          language: enhancedData.userProfile?.preferences?.language || "en",
          emailNotifications: safeValue(
            enhancedData.userProfile?.preferences?.notifications,
            true
          ),
          marketingEmails: safeValue(
            enhancedData.userProfile?.preferences?.marketingEmails,
            false
          ),
        },

        // Subscription information
        subscription: enhancedData.businessRegistration?.subscription || {
          plan: "free",
          billingCycle: "monthly",
          paymentMethod: "card",
        },

        // Onboarding analytics
        onboardingData: {
          // completedSteps: onboardingAnalytics.userBehavior?.stepsCompleted || 4,
          sessionDuration: onboardingAnalytics.sessionInfo?.duration || 0,
          dataQualityScore: enhancedData.metadata?.dataQualityScore || 0,
          deviceInfo: safeObject(onboardingAnalytics.deviceInfo),
          businessIntelligence: safeObject(
            onboardingAnalytics.businessIntelligence
          ),
        },

        // Metadata
        metadata: safeObject(enhancedData.metadata),

        // Timestamps
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp(),
        status: "active",
      };

      batch.set(businessRef, businessData);
      console.log("ðŸ¢ Prepared business document:", businessData.businessName);

      // Create locations collection with comprehensive Google Places data
      const locationsCreated = [];
      if (enhancedData.locations && Array.isArray(enhancedData.locations)) {
        for (let i = 0; i < enhancedData.locations.length; i++) {
          const location = enhancedData.locations[i];
          const locationId = `loc_${Date.now()}_${Math.random()
            .toString(36)
            .substr(2, 9)}`;
          const locationRef = doc(
            collection(businessRef, "locations"),
            locationId
          );

          // Extract comprehensive location data
          const googlePlacesData =
            location.googlePlacesData || location.enrichedData;

          const locationData = {
            id: locationId,
            businessId: businessId,
            name: location.name || "",
            address: location.address || "",
            category: companyInfo.industry || "",

            // Contact information from Google Places or manual entry
            contactInfo: {
              phone:
                safeValue(googlePlacesData?.international_phone_number) ||
                safeValue(googlePlacesData?.national_phone_number) ||
                location.phone ||
                "",
              website:
                safeValue(googlePlacesData?.website_uri) ||
                location.website ||
                "",
            },

            // Google Places business intelligence (safely handled)
            businessIntelligence: googlePlacesData
              ? {
                  placeId: safeValue(googlePlacesData.place_id, ""),
                  googleMapsUri: safeValue(
                    googlePlacesData.google_maps_uri,
                    ""
                  ),
                  businessStatus: safeValue(
                    googlePlacesData.business_status,
                    ""
                  ),
                  primaryType: safeValue(googlePlacesData.primary_type, ""),
                  primaryTypeDisplayName: safeValue(
                    googlePlacesData.primary_type_display_name,
                    ""
                  ),
                  types: googlePlacesData.types || [],

                  // Performance metrics
                  rating: safeValue(googlePlacesData.rating),
                  userRatingCount: safeValue(
                    googlePlacesData.user_rating_count
                  ),
                  priceLevel: safeValue(googlePlacesData.price_level),
                  priceRange: safeObject(googlePlacesData.price_range),

                  // Service offerings (safely handled)
                  serviceOfferings: {
                    serves_breakfast: safeValue(
                      googlePlacesData.serves_breakfast
                    ),
                    serves_brunch: safeValue(googlePlacesData.serves_brunch),
                    serves_lunch: safeValue(googlePlacesData.serves_lunch),
                    serves_coffee: safeValue(googlePlacesData.serves_coffee),
                    serves_vegetarian_food: safeValue(
                      googlePlacesData.serves_vegetarian_food
                    ),
                    serves_beer: safeValue(googlePlacesData.serves_beer),
                    serves_wine: safeValue(googlePlacesData.serves_wine),
                    serves_cocktails: safeValue(
                      googlePlacesData.serves_cocktails
                    ),
                    serves_dinner: safeValue(googlePlacesData.serves_dinner),
                    serves_dessert: safeValue(googlePlacesData.serves_dessert),
                  },

                  // Customer amenities (safely handled)
                  amenities: {
                    takeout: safeValue(googlePlacesData.takeout),
                    allows_dogs: safeValue(googlePlacesData.allows_dogs),
                    good_for_children: safeValue(
                      googlePlacesData.good_for_children
                    ),
                    good_for_groups: safeValue(
                      googlePlacesData.good_for_groups
                    ),
                    outdoor_seating: safeValue(
                      googlePlacesData.outdoor_seating
                    ),
                    restroom: safeValue(googlePlacesData.restroom),
                    live_music: safeValue(googlePlacesData.live_music),
                    dine_in: safeValue(googlePlacesData.dine_in),
                    curbside_pickup: safeValue(
                      googlePlacesData.curbside_pickup
                    ),
                    delivery: safeValue(googlePlacesData.delivery),
                    reservable: safeValue(googlePlacesData.reservable),
                  },

                  // Accessibility (safely handled)
                  accessibility: safeObject(
                    googlePlacesData.accessibility_options
                  ),

                  // Payment options (safely handled)
                  paymentOptions: safeObject(googlePlacesData.payment_options),

                  // Parking (safely handled)
                  parkingOptions: safeObject(googlePlacesData.parking_options),

                  // Geographic data (safely handled)
                  geometry: safeObject(googlePlacesData.geometry),
                  plusCode: safeObject(googlePlacesData.plus_code),
                  addressComponents: googlePlacesData.address_components || [],
                }
              : null,

            // Operating hours from Google Places (safely handled)
            operatingHours:
              safeObject(
                googlePlacesData?.regular_opening_hours?.weekday_descriptions
              ) ||
              safeObject(
                googlePlacesData?.current_opening_hours?.weekdayDescriptions
              ),

            // Photos from Google Places (safely handled)
            photos: (googlePlacesData?.photos || [])
              .slice(0, 5)
              .map((photo) => ({
                name: safeValue(photo.name, ""),
                width_px: safeValue(photo.width_px),
                height_px: safeValue(photo.height_px),
                // photo_uri_small: safeValue(photo.photo_uri_small, ""),
                // photo_uri_medium: safeValue(photo.photo_uri_medium, ""),
                // photo_uri_large: safeValue(photo.photo_uri_large, ""),
                photo_uri_original: safeValue(photo.photo_uri_original, ""),
              })),

            // Reviews summary (safely handled)
            reviewsSummary: googlePlacesData
              ? {
                  rating: safeValue(googlePlacesData.rating),
                  userRatingCount: safeValue(
                    googlePlacesData.user_rating_count
                  ),
                  hasReviews: (googlePlacesData.reviews || []).length > 0,
                  reviewCount: (googlePlacesData.reviews || []).length,
                }
              : null,

            // Data quality indicators
            dataEnrichment: {
              level: googlePlacesData ? "comprehensive" : "basic",
              source: googlePlacesData ? "google_places_api" : "manual_entry",
              lastUpdated: serverTimestamp(),
              fieldsPopulated: {
                hasPhone: !!(
                  safeValue(googlePlacesData?.international_phone_number) ||
                  location.phone
                ),
                hasWebsite: !!(
                  safeValue(googlePlacesData?.website_uri) || location.website
                ),
                hasHours: !!googlePlacesData?.regular_opening_hours,
                hasRating: !!safeValue(googlePlacesData?.rating),
                hasPhotos: !!(googlePlacesData?.photos?.length > 0),
                hasReviews: !!(googlePlacesData?.reviews?.length > 0),
              },
            },
            geometry: safeObject(googlePlacesData?.geometry),
            plusCode: safeObject(googlePlacesData?.plus_code),
            // Location status
            isActive: true,
            isPrimary: i === 0, // First location is primary
            setupTimestamp:
              safeValue(location.setupTimestamp) || serverTimestamp(),
            createdAt: serverTimestamp(),
          };

          batch.set(locationRef, locationData);
          locationsCreated.push({
            id: locationId,
            name: location.name,
            dataEnrichmentLevel: locationData.dataEnrichment.level,
          });

          console.log(
            `ðŸ“ Prepared location: ${location.name} (${locationId}) - ${locationData.dataEnrichment.level} data`
          );
        }
      } else {
        // Create default location if none provided
        console.log("âš ï¸ No locations provided, creating default location");
        const defaultLocationId = `loc_${Date.now()}_default`;
        const defaultLocationRef = doc(collection(db, "locations"));

        const defaultLocationData = {
          id: defaultLocationId,
          businessId: businessId,
          name: `${companyInfo.businessName} - Main Location`,
          address: companyInfo.address || "",
          category: "Business",
          contactInfo: {
            phone: userInfo.phone || "",
            website: companyInfo.website || "",
            email: userInfo.email || "",
          },
          businessIntelligence: null,
          operatingHours: {},
          photos: [],
          reviewsSummary: null,
          dataEnrichment: {
            level: "basic",
            source: "default_creation",
            lastUpdated: serverTimestamp(),
            fieldsPopulated: {
              hasPhone: !!userInfo.phone,
              hasWebsite: !!companyInfo.website,
              hasHours: false,
              hasRating: false,
              hasPhotos: false,
              hasReviews: false,
            },
          },
          isActive: true,
          isPrimary: true,
          setupTimestamp: serverTimestamp(),
          createdAt: serverTimestamp(),
        };

        batch.set(defaultLocationRef, defaultLocationData);
        locationsCreated.push({
          id: defaultLocationId,
          name: defaultLocationData.name,
          dataEnrichmentLevel: "basic",
        });
      }

      // Create billing document for payment tracking (safely handled)
      if (paymentInfo.cardDetails) {
        const billingId = `billing_${Date.now()}`;

        // Create billing as subcollection: businesses/{businessId}/billing/{billingId}
        const billingRef = doc(collection(businessRef, "billing"), billingId);

        const billingData = {
          userId: userId,
          businessId: businessId,
          billingDetails: {
            cardName: paymentInfo.cardDetails.cardName || "",
            billingAddress: paymentInfo.cardDetails.billingAddress || "",
            city: paymentInfo.cardDetails.city || "",
            postalCode: paymentInfo.cardDetails.postalCode || "",
            country: paymentInfo.cardDetails.country || "Ireland",
          },
          paymentMethodSetup: safeValue(paymentInfo.paymentMethodSetup, false),
          paymentProvider: paymentInfo.paymentProvider || "stripe",
          subscription: businessData.subscription,
          createdAt: serverTimestamp(),
          lastUpdated: serverTimestamp(),
        };

        batch.set(billingRef, billingData);
        console.log("ðŸ’³ Prepared billing document");
      }

      // Execute batch write
      await batch.commit();
      console.log(
        "âœ… FIRESTORE: Comprehensive batch write completed successfully"
      );
      console.log(
        `ðŸ“Š Created ${locationsCreated.length} locations with enriched data`
      );

      return {
        success: true,
        businessId: businessId,
        locationsCreated: locationsCreated,
        usedDefaultFallback: false,
        dataQualityScore: enhancedData.metadata?.dataQualityScore || 0,
      };
    } catch (error) {
      console.error("âŒ FIRESTORE: Comprehensive batch write failed:", error);
      return { success: false, error };
    }
  };

  // ===========================================================================
  // CONTEXT VALUE
  // ===========================================================================

  const contextValue = useMemo(
    () => ({
      // Auth state
      user: state.user,

      // Auth functions
      createAccount,
      signIn,
      signOut,
      resetPassword,
      getBusinessData,

      // Business settings
      businessSettings: state.businessSettings,
      loadBusinessSettings,

      // User settings
      settings: state.userSettings,
      settingsLoaded: state.settingsLoaded,
      settingsLoading: state.settingsLoading,
      loadSettings,
      saveSettings,

      // App state
      currentPage: state.currentPage,
      globalFilters: state.globalFilters,
      demographicsData: state.demographicsData,
      loading: state.loading,
      error: state.error,
      healthStatus: state.healthStatus,
      isOnline: state.isOnline,

      // App functions
      updateGlobalFilters,
      navigateToPage,
      getHealthStatus,
      fetchDemographics,
      updateBusinessSettings,
      componentNeedsUpdate,
      markComponentUpdated,
      updateBusinessInfo,
      updateLocationData,
    }),
    [
      state,
      createAccount,
      signIn,
      signOut,
      resetPassword,
      getBusinessData,
      loadBusinessSettings,
      loadSettings,
      saveSettings,
      updateGlobalFilters,
      navigateToPage,
      getHealthStatus,
      fetchDemographics,
      updateBusinessSettings,
      componentNeedsUpdate,
      markComponentUpdated,
      updateBusinessInfo,
      updateLocationData,
    ]
  );

  return (
    <CoreContext.Provider value={contextValue}>{children}</CoreContext.Provider>
  );
};

// Custom hooks
export const useCore = () => {
  const context = useContext(CoreContext);
  if (!context) {
    throw new Error("useCore must be used within a CoreProvider");
  }
  return context;
};

// Legacy compatibility hooks
export const useAuth = () => {
  const core = useCore();
  return {
    user: core.user,
    createAccount: core.createAccount,
    signIn: core.signIn,
    signOut: core.signOut,
    resetPassword: core.resetPassword,
    getBusinessData: core.getBusinessData,
    updateBusinessInfo: core.updateBusinessInfo,
    updateLocationData: core.updateLocationData,
  };
};

export const useApp = () => {
  const core = useCore();
  return {
    currentPage: core.currentPage,
    globalFilters: core.globalFilters,
    businessSettings: core.businessSettings,
    demographicsData: core.demographicsData,
    loading: core.loading,
    error: core.error,
    isOnline: core.isOnline,
    updateGlobalFilters: core.updateGlobalFilters,
    navigateToPage: core.navigateToPage,
    getHealthStatus: core.getHealthStatus,
    loadBusinessSettings: core.loadBusinessSettings,
    fetchDemographics: core.fetchDemographics,
    updateBusinessSettings: core.updateBusinessSettings,
    componentNeedsUpdate: core.componentNeedsUpdate,
    markComponentUpdated: core.markComponentUpdated,
  };
};

export const useSettings = () => {
  const core = useCore();
  return {
    settings: core.settings,
    loaded: core.settingsLoaded,
    loading: core.settingsLoading,
    loadSettings: core.loadSettings,
    saveSettings: core.saveSettings,
  };
};
