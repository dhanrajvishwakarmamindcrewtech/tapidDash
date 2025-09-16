import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Upload, X, Edit3, Clock, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import styles from '../SettingsPage.module.css';
import { useAuth } from '../../../context/CoreContext';
import { useNotifications } from '../../../context/UIContext';

// Import validation and file upload utilities
import { validateForm, validateText, validateEmail, validatePhone, validateURL } from '../../../utils/validation';
import { processFileUploads, cleanupFileUploads, FILE_TYPES, blobURLManager } from '../../../utils/fileUpload';

export default function CompanyProfile({
  settings,
  onSettingsChange,
  businessInfoRef,
  advancedDetailsRef,
  menuUploadRef,
  businessSettings,
  currentUser,
  selectedLocation,
  selectedLocationId,
  // Real data props
  businessData,
  onBusinessUpdate,
  onLocationUpdate,
  showAllSections = false,
  // Add callback to refresh location data
  onLocationRefresh,
  // Progress prop for section highlighting
  profileProgress = 0
}) {
  const logoInputRef = useRef(null);
  const businessImagesInputRef = useRef(null);
  const [showHoursModal, setShowHoursModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [showReviewsDebug, setShowReviewsDebug] = useState(false);

  // Unified save state management
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [originalFormData, setOriginalFormData] = useState({});

  // Validation state
  const [validationErrors, setValidationErrors] = useState({});
  const [isValidating, setIsValidating] = useState(false);

  // File upload state
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});

  // Context hooks
  const { refreshGooglePlacesData } = useAuth();
  const { showSuccess, showError, showInfo } = useNotifications();

  // New: Determine if location is selected
  const locationSelected = Boolean(selectedLocationId && selectedLocation);

  // Form data state with validation
  const [formData, setFormData] = useState({
    companyName: settings.companyName || '',
    companyLogo: settings.companyLogo || null,
    businessImages: settings.businessImages || [],
    industry: settings.industry || '',
    websiteUrl: settings.websiteUrl || '',
    taxId: settings.taxId || '',
    primaryContact: settings.primaryContact || '',
    contactEmail: settings.contactEmail || '',
    contactPhone: settings.contactPhone || '',
    address: settings.address || '',
    openingTimes: settings.openingTimes || {}
  });

  // Location form state
  const [locationForm, setLocationForm] = useState({
    name: selectedLocation?.name || '',
    address: selectedLocation?.address || '',
    phone: selectedLocation?.phone || '',
    website: selectedLocation?.website || '',
    rating: selectedLocation?.rating || selectedLocation?.googlePlacesData?.rating || '',
    userRatingsTotal: selectedLocation?.userRatingsTotal || selectedLocation?.googlePlacesData?.userRatingsTotal || 0,
    businessStatus: selectedLocation?.businessStatus || selectedLocation?.googlePlacesData?.businessStatus || ''
  });

  // Validation schema
  const validationSchema = {
    companyName: {
      type: 'text',
      required: true,
      minLength: 2,
      maxLength: 100
    },
    contactEmail: {
      type: 'email',
      required: false
    },
    contactPhone: {
      type: 'phone',
      required: false
    },
    websiteUrl: {
      type: 'url',
      required: false
    },
    address: {
      type: 'text',
      required: false,
      maxLength: 500
    }
  };

  // Location validation schema
  const locationValidationSchema = {
    name: {
      type: 'text',
      required: true,
      minLength: 2,
      maxLength: 100
    },
    address: {
      type: 'text',
      required: false,
      maxLength: 500
    },
    phone: {
      type: 'phone',
      required: false
    },
    website: {
      type: 'url',
      required: false
    }
  };

  // Sync form data with settings
  useEffect(() => {
    setFormData({
      companyName: settings.companyName || '',
      companyLogo: settings.companyLogo || null,
      businessImages: settings.businessImages || [],
      industry: settings.industry || '',
      websiteUrl: settings.websiteUrl || '',
      taxId: settings.taxId || '',
      primaryContact: settings.primaryContact || '',
      contactEmail: settings.contactEmail || '',
      contactPhone: settings.contactPhone || '',
      address: settings.address || '',
      openingTimes: settings.openingTimes || {}
    });
  }, [settings]);

  // Sync location form with selected location
  useEffect(() => {
    if (selectedLocation) {
      setLocationForm({
        name: selectedLocation.name || '',
        address: selectedLocation.address || '',
        phone: selectedLocation.phone || '',
        website: selectedLocation.website || '',
        rating: selectedLocation.rating || selectedLocation.googlePlacesData?.rating || '',
        userRatingsTotal: selectedLocation.userRatingsTotal || selectedLocation.googlePlacesData?.userRatingsTotal || 0,
        businessStatus: selectedLocation.businessStatus || selectedLocation.googlePlacesData?.businessStatus || ''
      });
    }
  }, [selectedLocation]);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      blobURLManager.revokeAll();
    };
  }, []);

  // Debounced validation
  const validateField = useCallback(async (fieldName, value, schema = validationSchema) => {
    setIsValidating(true);
    
    try {
      const fieldSchema = schema[fieldName];
      if (!fieldSchema) return;

      let result;
      switch (fieldSchema.type) {
        case 'email':
          result = validateEmail(value);
          break;
        case 'phone':
          result = validatePhone(value);
          break;
        case 'url':
          result = validateURL(value, fieldSchema.required);
          break;
        default:
          result = validateText(value, fieldSchema);
      }

      setValidationErrors(prev => ({
        ...prev,
        [fieldName]: result.isValid ? null : result.errors
      }));

      return result;
    } catch (error) {
      console.error('Validation error:', error);
    } finally {
      setIsValidating(false);
    }
  }, [validationSchema]);

  // Debounced form change handler
  const handleFormChange = useCallback(async (field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Validate field after state update
      setTimeout(() => validateField(field, value), 300);
      
      setHasUnsavedChanges(true);
      return newData;
    });
  }, [validateField]);

  // Location form change handler
  const handleLocationChange = useCallback(async (field, value) => {
    setLocationForm(prev => {
      const newData = { ...prev, [field]: value };
      
      // Validate field
      setTimeout(() => validateField(field, value, locationValidationSchema), 300);
      
      setHasUnsavedChanges(true);
      return newData;
    });
  }, [validateField, locationValidationSchema]);

  // Get location value from actual database fields
  const getLocationValue = (field) => {
    if (!selectedLocation) return '';
    return selectedLocation[field] || '';
  };

  // Get operational data values
  const getOperationalValue = (field) => {
    if (!selectedLocation?.operationalData) return null;
    return selectedLocation.operationalData[field];
  };

  // Get Google Places description
  const getGooglePlacesDescription = useCallback(() => {
    if (!selectedLocation?.googlePlacesData?.editorialSummary?.overview) {
      return null;
    }
    return selectedLocation.googlePlacesData.editorialSummary.overview;
  }, [selectedLocation]);

  // Get Google Places types as tags
  const getGooglePlacesTags = useCallback(() => {
    const googleData = selectedLocation?.googlePlacesData;
    if (!googleData?.types) return [];
    
    // Convert Google Places types to readable tags
    return googleData.types
      .map(type => type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()))
      .slice(0, 6); // Limit to 6 tags
  }, [selectedLocation]);

  // Update location form when selectedLocation changes
  useEffect(() => {
    if (selectedLocation) {
      const newLocationForm = {
        name: getLocationValue('name'),
        address: getLocationValue('address'),
        placeId: getLocationValue('placeId'),
        website: getLocationValue('website'),
        rating: getLocationValue('rating') || 0,
        userRatingsTotal: getLocationValue('userRatingsTotal') || 0,
        businessStatus: getLocationValue('businessStatus') || 'OPERATIONAL',
        latitude: getLocationValue('latitude'),
        longitude: getLocationValue('longitude'),
        openingHours: getLocationValue('openingHours'),
        images: getLocationValue('images') || [],
        googlePlacesData: selectedLocation.googlePlacesData || null
      };
      setLocationForm(newLocationForm);
      setOriginalFormData({
        location: newLocationForm,
        business: formData
      });
      setHasUnsavedChanges(false);
    }
  }, [selectedLocation]);

  // Sync legacy formData for backward compatibility
  useEffect(() => {
    setFormData({
      companyName: businessData?.info?.businessName || settings.companyName || '',
      industry: businessData?.info?.industry || settings.industry || '',
      websiteUrl: businessData?.info?.website || settings.websiteUrl || '',
      description: getGooglePlacesDescription(),
      openingTimes: locationSelected ? (selectedLocation.openingHours || {}) : {},
      companyLogo: locationSelected ? (selectedLocation.images?.[0] || null) : null,
      businessImages: locationSelected ? (selectedLocation.images || []) : [],
      primaryContact: settings.primaryContact || '',
      contactEmail: settings.contactEmail || '',
      contactPhone: settings.contactPhone || '',
      address: selectedLocation?.address || settings.address || ''
    });
  }, [settings, selectedLocation, locationSelected, businessData, getGooglePlacesDescription]);

  // Unified save all changes
  const saveAllChanges = async () => {
    setIsSaving(true);
    
    try {
      // Validate all form data before saving
      const formValidation = validateForm(formData, validationSchema);
      const locationValidation = validateForm(locationForm, locationValidationSchema);

      if (!formValidation.isValid || !locationValidation.isValid) {
        setValidationErrors({
          ...formValidation.errors,
          ...locationValidation.errors
        });
        showError('Please fix validation errors before saving');
        return;
      }

      // Use sanitized data
      const sanitizedFormData = formValidation.sanitized;
      const sanitizedLocationData = locationValidation.sanitized;

      // Save location data if location is selected
      if (onLocationUpdate && selectedLocationId) {
        const displayInfo = { ...sanitizedLocationData };
        await onLocationUpdate({
          basicInfo: sanitizedLocationData,
          displayInfo
        });
      }

      // Save business data if onBusinessUpdate is available
      if (onBusinessUpdate) {
        await onBusinessUpdate(sanitizedFormData);
      }

      // Save settings if onSettingsChange is available
      if (onSettingsChange) {
        onSettingsChange(sanitizedFormData);
      }

      setHasUnsavedChanges(false);
      setValidationErrors({});
      showSuccess('All changes saved successfully!');

    } catch (error) {
      console.error('Error saving changes:', error);
      showError('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Legacy save function for backward compatibility
  const saveLocationChanges = () => {
    saveAllChanges();
  };

  // Check if reviews can be refreshed (monthly limit)
  const canRefreshReviews = () => {
    if (!selectedLocation?.googlePlacesData?.lastRefreshed) return true;
    
    const lastRefresh = new Date(selectedLocation.googlePlacesData.lastRefreshed);
    const now = new Date();
    const monthsAgo = (now.getFullYear() - lastRefresh.getFullYear()) * 12 + 
                      (now.getMonth() - lastRefresh.getMonth());
    
    return monthsAgo >= 1;
  };

  // Get next available refresh date
  const getNextRefreshDate = () => {
    if (!selectedLocation?.googlePlacesData?.lastRefreshed) return null;
    
    const lastRefresh = new Date(selectedLocation.googlePlacesData.lastRefreshed);
    const nextRefresh = new Date(lastRefresh);
    nextRefresh.setMonth(nextRefresh.getMonth() + 1);
    
    return nextRefresh;
  };

  // Refresh Google Places data (reviews, ratings, etc.)
  const handleRefreshReviews = async () => {
    if (!canRefreshReviews()) {
      const nextDate = getNextRefreshDate();
      showInfo('Review refresh is limited to once per month', {
        details: `Next refresh available: ${nextDate?.toLocaleDateString()}`
      });
      return;
    }

    try {
      setIsRefreshing(true);
      
      if (refreshGooglePlacesData) {
        await refreshGooglePlacesData(selectedLocationId);
        showSuccess('Google Places data refreshed successfully!');
        
        // Trigger parent refresh
        if (onLocationRefresh) {
          await onLocationRefresh();
        }
      } else {
        showInfo('Refresh feature not available');
      }
    } catch (error) {
      console.error('Error refreshing Google Places data:', error);
      showError('Failed to refresh Google Places data. Please try again later.');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Secure file upload handlers
  const handleLogoUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploadingFiles(true);
      setUploadProgress({ logo: 0 });

      const result = await processFileUploads(files, {
        allowedTypes: FILE_TYPES.IMAGE,
        maxFiles: 1,
        compress: true,
        generateThumbnails: true
      });

      if (result.errors.length > 0) {
        showError(result.errors.join(', '));
        return;
      }

      if (result.processed.length > 0) {
        const processedFile = result.processed[0];
        handleFormChange('companyLogo', processedFile.previewURL);
        setUploadProgress({ logo: 100 });
        showSuccess('Logo uploaded successfully');
      }
    } catch (error) {
      console.error('Logo upload error:', error);
      showError('Failed to upload logo');
    } finally {
      setUploadingFiles(false);
      setUploadProgress({});
    }
  };

  const handleBusinessImagesUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploadingFiles(true);
      setUploadProgress({ images: 0 });

      const result = await processFileUploads(files, {
        allowedTypes: FILE_TYPES.IMAGE,
        maxFiles: 5,
        compress: true,
        generateThumbnails: true
      });

      if (result.errors.length > 0) {
        showError(result.errors.join(', '));
      }

      if (result.processed.length > 0) {
        const imageUrls = result.processed.map(file => file.previewURL);
        const existingImages = formData.businessImages || [];
        const newImages = [...existingImages, ...imageUrls].slice(0, 5);
        
        handleFormChange('businessImages', newImages);
        setUploadProgress({ images: 100 });
        showSuccess(`${result.processed.length} image(s) uploaded successfully`);
      }
    } catch (error) {
      console.error('Business images upload error:', error);
      showError('Failed to upload images');
    } finally {
      setUploadingFiles(false);
      setUploadProgress({});
    }
  };

  // Drag and drop handlers
  const handleLogoDrop = async (e) => {
    e.preventDefault();
    try {
      const result = await processFileUploads(e.dataTransfer.files, {
        allowedTypes: FILE_TYPES.IMAGE,
        maxFiles: 1,
        compress: true
      });

      if (result.processed.length > 0) {
        handleFormChange('companyLogo', result.processed[0].previewURL);
        showSuccess('Logo uploaded successfully');
      }
    } catch (error) {
      showError('Failed to upload logo: ' + error.message);
    }
  };

  const handleBusinessImagesDrop = async (e) => {
    e.preventDefault();
    try {
      const result = await processFileUploads(e.dataTransfer.files, {
        allowedTypes: FILE_TYPES.IMAGE,
        maxFiles: 5,
        compress: true
      });

      if (result.processed.length > 0) {
        const imageUrls = result.processed.map(file => file.previewURL);
        const existingImages = formData.businessImages || [];
        const newImages = [...existingImages, ...imageUrls].slice(0, 5);
        
        handleFormChange('businessImages', newImages);
        showSuccess(`${result.processed.length} image(s) uploaded successfully`);
      }
    } catch (error) {
      showError('Failed to upload images: ' + error.message);
    }
  };

  const handleDragOver = (e) => e.preventDefault();

  const removeLogo = () => {
    if (formData.companyLogo) {
      blobURLManager.revoke(formData.companyLogo);
    }
    handleFormChange('companyLogo', null);
  };

  const removeBusinessImage = (indexToRemove) => {
    const updatedImages = [...(formData.businessImages || [])];
    const removedImage = updatedImages[indexToRemove];
    
    if (removedImage) {
      blobURLManager.revoke(removedImage);
    }
    
    updatedImages.splice(indexToRemove, 1);
    handleFormChange('businessImages', updatedImages);
  };

  // Helper to get field validation status
  const getFieldValidationStatus = (fieldName) => {
    const errors = validationErrors[fieldName];
    if (!errors) return 'valid';
    if (errors.length > 0) return 'invalid';
    return 'valid';
  };

  // Helper to render validation feedback
  const renderValidationFeedback = (fieldName) => {
    const errors = validationErrors[fieldName];
    if (!errors || errors.length === 0) return null;

    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.25rem',
        marginTop: '0.25rem',
        fontSize: '0.75rem',
        color: '#dc2626'
      }}>
        <AlertTriangle size={12} />
        <span>{errors[0]}</span>
      </div>
    );
  };

  const getOpeningHoursSummary = () => {
    // Try to get Google Places opening hours first
    const googlePlacesHours = selectedLocation?.googlePlacesData?.currentOpeningHours?.weekdayText;
    if (googlePlacesHours && googlePlacesHours.length > 0) {
      // Show a summary of Google Places hours
      const openDays = googlePlacesHours.filter(day => !day.includes('Closed')).length;
      if (openDays === 0) return 'Closed';
      if (openDays === 7) return 'Open daily';
      return `Open ${openDays} days/week`;
    }

    // Fallback to operational hours
    const operationalHours = getOperationalValue('operatingHours');
    if (operationalHours && Object.keys(operationalHours).length > 0) {
      const openDays = Object.values(operationalHours).filter(day => day?.isOpen).length;
      if (openDays === 0) return 'Closed';
      if (openDays === 7) return 'Open daily';
      return `Open ${openDays} days/week`;
    }

    // Fallback to legacy formData
    if (!formData.openingTimes) return 'Not set';
    const enabledDays = Object.entries(formData.openingTimes)
      .filter(([_, config]) => config.enabled)
      .map(([day, _]) => day.slice(0, 3));
    
    if (enabledDays.length === 0) return 'Closed';
    if (enabledDays.length === 7) return 'Open daily';
    if (enabledDays.length <= 3) return enabledDays.join(', ');
    return `${enabledDays.length} days`;
  };

  const updateOpeningTimes = (day, updates) => {
    const currentTimes = formData.openingTimes || {};
    const dayConfig = currentTimes[day] || { enabled: false, open: '', close: '' };
    const newOpeningTimes = {
      ...currentTimes,
      [day]: { ...dayConfig, ...updates }
    };
    handleFormChange('openingTimes', newOpeningTimes);
  };

  return (
    <>
      <div className={styles.sectionContent}>
        {/* Location Information */}
        {selectedLocation ? (
          <div className={styles.subsection} ref={businessInfoRef}>
            {/* Location Details */}
            <div className={styles.locationInfoContainer}>
              <h4 className={styles.locationInfoTitle}>Location Details</h4>
              <p className={styles.locationInfoHelper}>
                Manage your location information and settings.
              </p>
              
              <div className={styles.locationInfoGrid}>
                <div className={styles.locationInfoGroup}>
                  <div className={styles.locationInfoLabel}>
                    <label className={styles.label}>Location Name</label>
                  </div>
                  <input
                    type="text"
                    className={styles.locationInfoInput}
                    value={locationForm.name}
                    onChange={e => handleLocationChange('name', e.target.value)}
                    placeholder="Enter location name"
                  />
                </div>

                <div className={styles.locationInfoGroup}>
                  <div className={styles.locationInfoLabel}>
                    <label className={styles.label}>Address</label>
                  </div>
                  <input
                    type="text"
                    className={styles.locationInfoInput}
                    value={locationForm.address}
                    onChange={e => handleLocationChange('address', e.target.value)}
                    placeholder="Enter complete address"
                  />
                  {selectedLocation?.googlePlacesData?.formattedAddress && (
                    <small className={styles.helperText}>
                      Google Places: {selectedLocation.googlePlacesData.formattedAddress}
                    </small>
                  )}
                </div>

                <div className={styles.locationInfoGroup}>
                  <div className={styles.locationInfoLabel}>
                    <label className={styles.label}>Website</label>
                  </div>
                  <input
                    type="url"
                    className={styles.locationInfoInput}
                    value={locationForm.website}
                    onChange={e => handleLocationChange('website', e.target.value)}
                    placeholder="https://www.yourwebsite.com"
                  />
                  {selectedLocation?.googlePlacesData?.websiteUri && (
                    <small className={styles.helperText}>
                      Google Places: {selectedLocation.googlePlacesData.websiteUri}
                    </small>
                  )}
                </div>
              </div>
            </div>

            {/* Google Places Overview */}
            {selectedLocation?.googlePlacesData && (
              <div className={styles.googlePlacesSummary}>
                <h4 className={styles.googlePlacesSummaryTitle}>Google Places Overview</h4>
                <p className={styles.googlePlacesSummaryHelper}>
                  Key metrics from your Google Places profile.
                </p>
                
                <div className={styles.googlePlacesSummaryGrid}>
                  <div className={styles.summaryCard}>
                    <div className={styles.summaryInfo}>
                      <div className={styles.summaryValue}>
                        {locationForm.rating || 'N/A'}
                      </div>
                      <div className={styles.summaryLabel}>Rating</div>
                    </div>
                  </div>

                  <div className={styles.summaryCard}>
                    <div className={styles.summaryInfo}>
                      <div className={styles.summaryValue}>
                        {locationForm.userRatingsTotal || 0}
                      </div>
                      <div className={styles.summaryLabel}>Reviews</div>
                    </div>
                  </div>

                  <div className={styles.summaryCard}>
                    <div className={styles.summaryInfo}>
                      <div className={styles.summaryValue}>
                        {locationForm.businessStatus === 'OPERATIONAL' ? 'Open' : 
                         locationForm.businessStatus === 'CLOSED_TEMPORARILY' ? 'Temporarily Closed' :
                         locationForm.businessStatus === 'CLOSED_PERMANENTLY' ? 'Closed' :
                         'Unknown'}
                      </div>
                      <div className={styles.summaryLabel}>Status</div>
                    </div>
                  </div>

                  <div className={styles.summaryCard}>
                    <div className={styles.summaryInfo}>
                      <div className={styles.summaryValue}>
                        {getOpeningHoursSummary()}
                      </div>
                      <div className={styles.summaryLabel}>Hours</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Location Photos */}
            {selectedLocation?.images && selectedLocation.images.length > 0 && (
              <div className={styles.photosGrid}>
                <h4 className={styles.locationInfoTitle}>Location Photos</h4>
                <p className={styles.locationInfoHelper}>
                  Photos associated with this location.
                </p>
                
                <div className={styles.photosContainer}>
                  {(showAllPhotos ? selectedLocation.images : selectedLocation.images.slice(0, 6)).map((image, index) => (
                    <div key={index} className={styles.photoItem}>
                      <img 
                        src={image} 
                        alt={`Location photo ${index + 1}`}
                        className={styles.photoImage}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div className={styles.photoFallback}>
                        <span>Photo {index + 1}</span>
                      </div>
                    </div>
                  ))}
                </div>
                {selectedLocation.images.length > 6 && !showAllPhotos && (
                  <button
                    className={styles.morePhotosButton}
                    onClick={() => setShowAllPhotos(true)}
                    type="button"
                  >
                    + {selectedLocation.images.length - 6} more photos
                  </button>
                )}
                {showAllPhotos && selectedLocation.images.length > 6 && (
                  <button
                    className={styles.showLessButton}
                    onClick={() => setShowAllPhotos(false)}
                    type="button"
                  >
                    Show less photos
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className={styles.placeholder}>
            <div className={styles.placeholderIcon}>📍</div>
            <h3>No Location Selected</h3>
            <p>Please select a location to manage its settings and information.</p>
          </div>
        )}
      </div>
    </>
  );
}