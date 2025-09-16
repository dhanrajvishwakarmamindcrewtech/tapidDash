import React, { useState, useRef, useEffect } from 'react';
import { 
  Building2, 
  MapPin,
  Save,
  AlertCircle,
  RefreshCw,
  CheckCircle,
  Clock,
  Target
} from 'lucide-react';
import styles from './SettingsPage.module.css';

// Page imports
import CompanyProfile from './components/CompanyProfile';

// Context imports
import { useApp, useSettings, useAuth } from '../../context/CoreContext';
import { useNotifications } from '../../context/UIContext';

const SettingsPage = () => {
  // Context hooks
  const { 
    user, 
    businessSettings, 
    updateBusinessSettings,
    componentNeedsUpdate,
    markComponentUpdated,
    globalFilters
  } = useApp();
  
  const { settings, saveSettings } = useSettings();
  
  const { 
    showSuccess, 
    showError, 
    showWarning,
    showLoading,
    removeNotification 
  } = useNotifications();

  const { getBusinessData, updateBusinessInfo, updateLocationData } = useAuth();

  // Local state
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingChanges, setPendingChanges] = useState({});

  // Business data state
  const [businessData, setBusinessData] = useState(null);
  const [locations, setLocations] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState(null);

  // Get selected location from global filters
  const selectedLocationId = globalFilters.selectedLocation;
  const selectedLocation = locations.find(l => l.id === selectedLocationId) || null;

  // Calculate profile completion progress
  const calculateProgress = () => {
    if (!selectedLocation) return 0;
    
    const requiredFields = [
      'name', 'address', 'phone', 'website'
    ];
    
    const optionalFields = [
      'rating', 'userRatingsTotal', 'businessStatus'
    ];
    
    let completed = 0;
    let total = requiredFields.length + optionalFields.length;
    
    // Check required fields
    requiredFields.forEach(field => {
      if (selectedLocation[field] || selectedLocation.displayInfo?.[field]) {
        completed++;
      }
    });
    
    // Check optional fields  
    optionalFields.forEach(field => {
      if (selectedLocation[field] || selectedLocation.googlePlacesData?.[field]) {
        completed++;
      }
    });
    
    // Bonus points for Google Places connection
    if (selectedLocation.googlePlacesData) {
      completed += 2;
      total += 2;
    }
    
    // Bonus points for photos
    if (selectedLocation.images && selectedLocation.images.length > 0) {
      completed += 1;
      total += 1;
    }
    
    return Math.round((completed / total) * 100);
  };

  const progress = calculateProgress();

  // Helper to update displayInfo
  const buildDisplayInfo = (basicInfo, googlePlacesData) => ({
    ...(basicInfo || {}),
    ...(googlePlacesData || {})
  });

  // Refs for smooth scrolling
  const businessInfoRef = useRef(null);
  const advancedDetailsRef = useRef(null);
  const contactDetailsRef = useRef(null);
  const menuUploadRef = useRef(null);

  // Load business data when location is selected
  useEffect(() => {
    const loadData = async () => {
      if (!selectedLocationId) {
        console.log('⏳ SETTINGS: Waiting for location selection...');
        setDataLoading(false);
        return;
      }

      try {
        setDataLoading(true);
        setDataError(null);
        console.log('🔧 SETTINGS: Loading business data for location:', selectedLocationId);
        
        const data = await getBusinessData();
        
        if (data) {
          console.log('📍 SETTINGS: Found business data:', {
            businessId: data.business.id,
            locationCount: data.locations.length,
            selectedLocation: selectedLocationId,
            locations: data.locations.map(l => ({
              id: l.id,
              name: l.name
            }))
          });
          
          setBusinessData(data.business);
          setLocations(data.locations);
        } else {
          console.log('❌ SETTINGS: No business data found');
          setDataError('No business data found');
        }
      } catch (error) {
        console.error('❌ SETTINGS: Error loading data:', error);
        setDataError('Failed to load business data');
      } finally {
        setDataLoading(false);
      }
    };

    loadData();
  }, [selectedLocationId, getBusinessData]);

  // Check if component needs update on mount
  useEffect(() => {
    if (componentNeedsUpdate('SettingsPage')) {
      showWarning('Settings have been updated from another location', {
        actionLabel: 'Refresh',
        onAction: () => {
          window.location.reload();
        }
      });
      markComponentUpdated('SettingsPage');
    }
  }, [componentNeedsUpdate, markComponentUpdated, showWarning]);

  // React to location changes from FloatingWidgets
  useEffect(() => {
    if (selectedLocationId && selectedLocation) {
      console.log('🔧 SETTINGS: Location changed to:', selectedLocation.name);
      // Clear any pending changes when switching locations
      if (hasUnsavedChanges) {
        if (window.confirm('You have unsaved changes. Switching locations will discard them. Continue?')) {
          setHasUnsavedChanges(false);
          setPendingChanges({});
        } else {
          // User cancelled, could potentially revert the location change here
          // but that might create a cycle, so we'll let it proceed
        }
      }
    }
  }, [selectedLocationId, selectedLocation, hasUnsavedChanges]);

  // Handle business info updates
  const handleBusinessUpdate = async (updates) => {
    try {
      await updateBusinessInfo(updates);
      
      // Update local state
      setBusinessData(prev => ({
        ...prev,
        info: { ...prev.info, ...updates }
      }));
      
      showSuccess('Business information updated successfully');
    } catch (error) {
      showError('Failed to update business information');
    }
  };

  // Handle location updates
  const handleLocationUpdate = async (updates) => {
    if (!selectedLocationId) return;
    try {
      // If updating basicInfo or googlePlacesData, also update displayInfo
      let displayInfo = selectedLocation.displayInfo;
      if (updates.basicInfo || updates.googlePlacesData) {
        displayInfo = buildDisplayInfo(
          updates.basicInfo || selectedLocation.basicInfo,
          updates.googlePlacesData || selectedLocation.googlePlacesData
        );
      }
      await updateLocationData(selectedLocationId, { ...updates, displayInfo });
      // Update local state
      setLocations(prev => prev.map(loc => 
        loc.id === selectedLocationId 
          ? { ...loc, ...updates, displayInfo }
          : loc
      ));
      showSuccess('Location updated successfully');
    } catch (error) {
      showError('Failed to update location');
    }
  };

  // Handle location data refresh (e.g., Google Places data)
  const handleLocationRefresh = async () => {
    if (!user?.uid) return;
    
    try {
      console.log('🔄 Refreshing location data after Google Places update...');
      const data = await getBusinessData();
      
      if (data) {
        setBusinessData(data.business);
        setLocations(data.locations);
        console.log('✅ Location data refreshed successfully');
      }
    } catch (error) {
      console.error('❌ Error refreshing location data:', error);
      showError('Failed to refresh location data');
    }
  };

  // Enhanced save function with notifications and cross-component updates
  const handleSaveSettings = async () => {
    if (isSaving || !hasUnsavedChanges) return;

    setIsSaving(true);
    const loadingId = showLoading('Saving settings...');

    try {
      // Merge current settings with pending changes
      const newSettings = { ...settings, ...pendingChanges };
      
      // Save to SettingsContext
      await saveSettings(newSettings);
      
      // Update business settings in AppContext if business info changed
      const businessUpdates = {};
      if (pendingChanges.companyName) {
        businessUpdates.businessName = pendingChanges.companyName;
      }
      if (pendingChanges.contactEmail || pendingChanges.contactPhone || pendingChanges.address) {
        businessUpdates.contactInfo = {
          email: pendingChanges.contactEmail || settings.contactEmail,
          phone: pendingChanges.contactPhone || settings.contactPhone,
          address: pendingChanges.address || settings.address
        };
      }
      if (pendingChanges.openingTimes) {
        businessUpdates.operatingHours = pendingChanges.openingTimes;
      }
      
      // New: Update only the selected location's data
      if (selectedLocationId) {
        // Find and update the location in businessSettings.locations
        const updatedLocations = locations.map(loc =>
          loc.id === selectedLocationId ? { ...loc, ...pendingChanges } : loc
        );
        businessUpdates.locations = updatedLocations;
      }

      if (Object.keys(businessUpdates).length > 0) {
        await updateBusinessSettings(businessUpdates, [
          'SidebarLayout',
          'HomePage', 
          'ControlCenterPage'
        ]);
      }

      // Remove loading notification and show success
      removeNotification(loadingId);
      showSuccess('Settings saved successfully!', {
        duration: 3000
      });
      
      setHasUnsavedChanges(false);
      setPendingChanges({});

    } catch (error) {
      removeNotification(loadingId);
      showError('Failed to save settings. Please try again.', {
        duration: 5000,
        actionLabel: 'Retry',
        onAction: () => handleSaveSettings()
      });
      console.error('Error saving settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Track unsaved changes from child components
  const handleSettingsChange = (changes) => {
    setPendingChanges(prev => ({ ...prev, ...changes }));
    setHasUnsavedChanges(true);
  };

  const getProgressStatus = () => {
    if (progress >= 90) return { status: 'excellent', icon: CheckCircle, color: '#4CAF87', text: 'Profile Complete!' };
    if (progress >= 70) return { status: 'good', icon: Target, color: '#3FBAC2', text: 'Almost There!' };
    if (progress >= 40) return { status: 'okay', icon: Clock, color: '#F9CB40', text: 'Getting Started' };
    return { status: 'incomplete', icon: AlertCircle, color: '#F66A6A', text: 'Needs Attention' };
  };

  const progressStatus = getProgressStatus();
  const ProgressIcon = progressStatus.icon;

  return (
    <div className={styles.container}>
      {/* Main Content */}
      <div className={styles.content}>
        <div className={styles.contentHeader}>
          <div className={styles.headerContent}>
            <h2 className={styles.contentTitle}>
              Location Management
            </h2>
            <p className={styles.contentSubtitle}>
              Configure and optimize your location settings for better customer experience
            </p>
          </div>
          <div className={styles.contentActions}>
            <button 
              className={styles.secondaryButton}
              onClick={() => {
                if (hasUnsavedChanges) {
                  if (window.confirm('You have unsaved changes. Are you sure you want to discard them?')) {
                    setHasUnsavedChanges(false);
                    window.location.reload();
                  }
                }
              }}
              disabled={!hasUnsavedChanges}
            >
              {hasUnsavedChanges ? 'Discard Changes' : 'Cancel'}
            </button>
            <button 
              className={`${styles.primaryButton} ${isSaving ? styles.saving : ''}`}
              onClick={handleSaveSettings}
              disabled={!hasUnsavedChanges || isSaving}
            >
              {isSaving ? (
                <>
                  <div className={styles.spinner}></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>

        {/* Progress Card */}
        {selectedLocation && (
          <div className={styles.progressCard}>
            <div className={styles.progressHeader}>
              <div className={styles.progressInfo}>
                <ProgressIcon size={20} style={{ color: progressStatus.color }} />
                <div>
                  <h3 className={styles.progressTitle}>Profile Progress</h3>
                  <p className={styles.progressSubtitle}>{progressStatus.text}</p>
                </div>
              </div>
              <div className={styles.progressScore}>
                <span className={styles.progressNumber}>{progress}%</span>
                <span className={styles.progressLabel}>Complete</span>
              </div>
            </div>
            <div className={styles.progressBarContainer}>
              <div 
                className={styles.progressBar}
                style={{ 
                  background: `linear-gradient(90deg, ${progressStatus.color} 0%, ${progressStatus.color} ${progress}%, #e5e7eb ${progress}%, #e5e7eb 100%)`
                }}
              />
            </div>
            {progress < 100 && (
              <div className={styles.progressTips}>
                <p className={styles.tipText}>
                  {progress < 40 && "💡 Add basic information like name, address, and contact details to get started"}
                  {progress >= 40 && progress < 70 && "🎯 Connect Google Places and add photos to boost your profile"}
                  {progress >= 70 && progress < 90 && "✨ You're almost done! Add remaining details to complete your profile"}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Current Location Indicator */}
        {selectedLocation ? (
          <div className={styles.currentLocationIndicator}>
            <div className={styles.locationIndicatorContent}>
              <MapPin size={16} className={styles.locationIcon} />
              <div className={styles.locationDetails}>
                <span className={styles.locationName}>
                  Managing: {selectedLocation.name || 'Unnamed Location'}
                </span>
                {selectedLocation.address && (
                  <span className={styles.locationAddress}>
                    {selectedLocation.address}
                  </span>
                )}
              </div>
              {selectedLocation.googlePlacesData && (
                <div className={styles.googlePlacesBadge}>
                  🌍 Google Connected
                  {selectedLocation.rating && (
                    <span className={styles.rating}>
                      ⭐ {selectedLocation.rating}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className={styles.noLocationSelected}>
            <MapPin size={20} />
            <div className={styles.noLocationText}>
              <h3>No Location Selected</h3>
              <p>Use the location picker in the bottom right to select a location to manage.</p>
            </div>
          </div>
        )}

        {/* Settings Content */}
        <div className={styles.settingsContent}>
          {selectedLocation ? (
            <CompanyProfile 
              settings={settings} 
              onSettingsChange={handleSettingsChange}
              businessInfoRef={businessInfoRef}
              advancedDetailsRef={advancedDetailsRef}
              contactDetailsRef={contactDetailsRef}
              menuUploadRef={menuUploadRef}

              businessSettings={businessSettings}
              currentUser={user}
              selectedLocation={selectedLocation}
              selectedLocationId={selectedLocationId}
              // Real data props
              businessData={businessData}
              onBusinessUpdate={handleBusinessUpdate}
              onLocationUpdate={handleLocationUpdate}
              onLocationRefresh={handleLocationRefresh}
              // Show all 6 sections
              showAllSections={true}
              // Pass progress for section highlighting
              profileProgress={progress}
            />
          ) : (
            <div className={styles.placeholder}>
              <AlertCircle size={48} />
              <h3>Select a location to continue</h3>
              <p>Please select a location from the floating picker to manage its settings.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;