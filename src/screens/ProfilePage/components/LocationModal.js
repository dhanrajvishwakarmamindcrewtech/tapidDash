import React, { useState, useEffect, useCallback } from "react";
import { MapPin, Plus, X, CreditCard, Building, ArrowLeft } from "lucide-react";
import AddressAutocomplete from "../../../components/AddressAutocomplete";
import POSModal from "../../../components/POSModal";
import styles from "../LocationModal.module.css";

const LocationModel = ({ isOpen, onClose, onLocationAdd, businessId }) => {
  const [newLocation, setNewLocation] = useState({
    name: "",
    address: "",
  });
  const [selectedPlaceData, setSelectedPlaceData] = useState(null);
  const [nameError, setNameError] = useState("");
  const [addressError, setAddressError] = useState("");
  const [locationError, setLocationError] = useState("");
  const [showPOSModal, setShowPOSModal] = useState(false);
  const [selectedPOSTerminals, setSelectedPOSTerminals] = useState([]);
  const [connectedTerminals, setConnectedTerminals] = useState(new Set());

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setNewLocation({ name: "", address: "" });
      setSelectedPlaceData(null);
      setNameError("");
      setAddressError("");
      setLocationError("");
      setShowPOSModal(false);
      setSelectedPOSTerminals([]);
      setConnectedTerminals(new Set());
    }
  }, [isOpen]);

  const autoPopulateCompanyData = useCallback((placeData) => {
    if (!placeData) return;
    // console.log(placeData, "placeData");
  }, []);

  const handleTerminalConnect = useCallback((terminalId, status) => {
    if (status === "connected") {
      setConnectedTerminals((prev) => new Set([...prev, terminalId]));
    }
  }, []);

  const handleCreateLocation = useCallback(async () => {
    // Reset errors
    setNameError("");
    setAddressError("");
    setLocationError("");

    let hasError = false;

    if (!newLocation.name) {
      setNameError("Please enter the location name.");
      hasError = true;
    }

    if (!newLocation.address) {
      setAddressError("Please enter the address.");
      hasError = true;
    }

    if (hasError) return;

    function removeUndefined(obj) {
      return JSON.parse(JSON.stringify(obj));
    }

    const locationDataPackage = {
      modalFormData: {
        name: newLocation.name,
        address: newLocation.address,
        dateCreated: new Date().toISOString(),
        createdBy: "user_id_placeholder",
        businessId: businessId,
        isActive: true,
        isPrimary: false,
      },
      googlePlacesData: selectedPlaceData,
      timestamp: new Date().toISOString(),
      source: "location_modal",
    };

    const completeLocationData = {
      ...locationDataPackage.modalFormData,
      googlePlacesData: locationDataPackage.googlePlacesData,
      website_uri: selectedPlaceData?.website_uri,
      photos: selectedPlaceData?.photos || [],
      contactInfo: {
        phone: selectedPlaceData?.international_phone_number || "",
        website: selectedPlaceData?.website_uri || "",
      },
      reviewsSummary: {
        rating: selectedPlaceData?.rating || 0,
        userRatingCount: selectedPlaceData?.user_rating_total || 0,
        hasReviews: !!(
          selectedPlaceData?.rating && selectedPlaceData?.user_rating_total > 0
        ),
      },
      operatingHours:
        selectedPlaceData?.regular_opening_hours?.weekday_text?.reduce(
          (acc, hour, index) => {
            acc[index] = hour;
            return acc;
          },
          {}
        ) || {},
      businessIntelligence: selectedPlaceData
        ? {
            placeId: selectedPlaceData.place_id,
            primaryType: selectedPlaceData.primary_type,
            types: selectedPlaceData.types || [],
            rating: selectedPlaceData.rating,
            userRatingCount: selectedPlaceData.user_rating_total,
            priceLevel: selectedPlaceData.price_level,
            businessStatus: selectedPlaceData.business_status,
          }
        : null,
    };

    try {
      // Call the parent's onLocationAdd function
      await onLocationAdd(removeUndefined(completeLocationData));

      // Reset form and close modal
      setNewLocation({ name: "", address: "" });
      setSelectedPlaceData(null);
      setNameError("");
      setAddressError("");
      setLocationError("");
      onClose();
    } catch (error) {
      console.error("Error adding location:", error);
      setLocationError("Failed to add location. Please try again.");
    }
  }, [newLocation, selectedPlaceData, businessId, onLocationAdd, onClose]);

  const handleAddressSelect = useCallback(
    (address, placeData) => {
      setNewLocation((prev) => ({ ...prev, address }));
      setSelectedPlaceData(placeData);
      setAddressError(""); // Clear address error on selection
      autoPopulateCompanyData(placeData);
      console.log("🏠 Selected Place Address:", address);
      console.log("📍 Detailed Place Data:", placeData);
    },
    [autoPopulateCompanyData]
  );

  if (!isOpen) return null;

  return (
    <>
      <div className={styles.modalOverlay}>
        <div className={styles.modal}>
          {/* Modal Header */}
          <div className={styles.modalHeader}>
            <button
              onClick={onClose}
              className={styles.backButton}
              type="button"
            >
              <ArrowLeft size={16} />
              Back
            </button>

            <div className={styles.stepHeader}>
              <div className={styles.stepIcon}>
                <Building size={20} />
              </div>
              <h2 className={styles.stepTitle}>Add Business Location</h2>
            </div>

            <button onClick={onClose} className={styles.modalClose}>
              <X size={20} />
            </button>
          </div>

          {/* Modal Body */}
          <div className={styles.modalBody}>
            <form
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                handleCreateLocation();
              }}
              className={styles.stepForm}
            >
              {/* Locations Section */}
              <div className={styles.sectionHeader}>
                <MapPin size={20} />
                <h3 className={styles.sectionTitle}>
                  Business Location Details
                </h3>
              </div>

              <div className={styles.inputGrid}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Location Name</label>
                  <input
                    type="text"
                    value={newLocation.name}
                    onChange={(e) => {
                      setNewLocation((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }));
                      if (nameError) setNameError("");
                    }}
                    className={styles.modernInput}
                    placeholder="e.g. Downtown Cafe, Main Branch"
                    autoComplete="off"
                  />
                  {nameError && (
                    <div className={styles.errorMessage}>{nameError}</div>
                  )}
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Address</label>
                  <AddressAutocomplete
                    value={newLocation.address}
                    onChange={(val) => {
                      setNewLocation((prev) => ({ ...prev, address: val }));
                      if (addressError) setAddressError("");
                    }}
                    onSelect={handleAddressSelect}
                    inputClassName={styles.modernInput}
                    placeholder="123 Main Street, Dublin, Ireland"
                  />
                  {addressError && (
                    <div className={styles.errorMessage}>{addressError}</div>
                  )}
                </div>
              </div>

              {/* POS Section */}
              <div className={styles.posSection}>
                <div className={styles.sectionHeader}>
                  <CreditCard size={20} />
                  <h3 className={styles.sectionTitle}>
                    Connect POS System (Optional)
                  </h3>
                  <p className={styles.sectionSubtitle}>
                    Connect your point-of-sale system to automatically sync
                    transactions and customer data for this location
                  </p>
                </div>

                <div className={styles.posOptions}>
                  <div className={styles.posOption}>
                    <div className={styles.posOptionContent}>
                      <h4>Connect POS System</h4>
                      <p>
                        Set up POS integration for this location to sync
                        transactions and customer data
                      </p>
                    </div>
                    <button
                      onClick={() => setShowPOSModal(true)}
                      className={styles.posConnectButton}
                      type="button"
                    >
                      <CreditCard size={16} />
                      Connect POS
                    </button>
                  </div>
                </div>
              </div>

              {locationError && (
                <div className={styles.errorMessage}>{locationError}</div>
              )}
            </form>
          </div>

          {/* Fixed Footer with Centered Buttons */}
          <div className={styles.modalFooter}>
            <button
              type="button"
              onClick={onClose}
              className={styles.secondaryButton}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreateLocation}
              className={styles.primaryButton}
            >
              <Plus size={16} />
              Add Location
            </button>
          </div>
        </div>
      </div>

      {/* POS Modal */}
      <POSModal
        isOpen={showPOSModal}
        onClose={() => setShowPOSModal(false)}
        selectedTerminals={selectedPOSTerminals}
        setSelectedTerminals={setSelectedPOSTerminals}
        connectedTerminals={connectedTerminals}
        setConnectedTerminals={setConnectedTerminals}
        onTerminalConnect={handleTerminalConnect}
      />
    </>
  );
};

export default LocationModel;
