import React, { useMemo } from "react";
import { Building, MapPin, CreditCard, Calendar, Loader } from "lucide-react";
import { useProfileData } from "./hooks/useProfileData";
import { useTabManager } from "./hooks/useTabManager";
import { useLocationManager } from "./hooks/useLocationManager";
import ProfileTab from "./components/ProfileTab";
import LocationsTab from "./components/LocationsTab";
import BillingTab from "./components/BillingTab";
import LocationModal from "./components/LocationModal";
import LoadingSpinner from "./components/LoadingSpinner";
import { PROFILE_TABS } from "./config/profileConfig";
import { formatDate } from "./utils/profileUtils";
import styles from "./ProfilePage.module.css";

const ProfilePage = () => {
  // Custom hooks for data management
  const {
    businessData,
    locations,
    billingData,
    isLoading,
    actions: profileActions,
  } = useProfileData();

  const { currentTab, setCurrentTab } = useTabManager();

  const {
    showLocationModal,
    locationToDelete,
    showDeleteModal,
    actions: locationActions,
  } = useLocationManager(profileActions.reloadProfile);

  // Memoized business stats
  const businessStats = useMemo(() => {
    if (!businessData || !locations) return null;

    return {
      locationsCount: locations.length,
      dataQuality: locations.length > 0 ? "100%" : "0%",
      avgRating:
        locations.reduce(
          (sum, loc) => sum + (loc.reviewsSummary?.rating || 0),
          0
        ) / (locations.length || 1),
      isActive: businessData.status === "active",
    };
  }, [businessData, locations]);

  // Loading state
  if (isLoading) {
    return <LoadingSpinner message="Loading profile data..." fullScreen />;
  }

  // Error state
  if (!businessData) {
    return (
      <div className={styles.errorMessage}>
        <Building size={48} />
        <p>Business data not found</p>
      </div>
    );
  }

  return (
    <div className={styles.profileRoot}>
      {/* Top Header with Business Info */}
      <header className={styles.topHeader}>
        <div className={styles.businessHeader}>
          <div className={styles.businessAvatar}>
            {businessData.businessName?.charAt(0).toUpperCase() || "B"}
          </div>

          <div className={styles.businessInfo}>
            <h1 className={styles.businessName}>
              {businessData.businessName || "Business Name"}
            </h1>

            <div className={styles.businessMeta}>
              {businessData.industry && (
                <span className={styles.industryBadge}>
                  {businessData.industry}
                </span>
              )}
              <span className={styles.statusBadge + " " + styles.statusActive}>
                Active
              </span>
            </div>

            <div className={styles.businessStats}>
              <span className={styles.statItem}>
                <MapPin size={14} />
                {locations?.length || 0} Location
                {locations?.length !== 1 ? "s" : ""}
              </span>
              <span className={styles.statItem}>
                <Calendar size={14} />
                Since {formatDate(businessData.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Top Navigation Tabs */}
        <nav className={styles.topNav}>
          {PROFILE_TABS.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setCurrentTab(tab.key)}
                className={`${styles.topNavItem} ${
                  currentTab === tab.key ? styles.topNavActive : ""
                }`}
              >
                <IconComponent size={18} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </header>

      {/* Main Content */}
      {/* <main className={styles.mainContent}> */}
      {/* <div className={styles.contentContainer}> */}
      {currentTab === "profile" && (
        <ProfileTab
          businessData={businessData}
          businessStats={businessStats}
          onSave={profileActions.saveProfile}
          isSaving={profileActions.isSaving}
        />
      )}

      {currentTab === "locations" && (
        <LocationsTab
          locations={locations}
          onAddLocation={() => locationActions.openLocationModal()}
          onDeleteLocation={locationActions.handleDeleteLocation}
        />
      )}

      {currentTab === "billing" && (
        <BillingTab businessData={businessData} billingData={billingData} />
      )}
      {/* </div> */}
      {/* </main> */}

      {/* Location Modal */}
      <LocationModal
        isOpen={showLocationModal}
        onClose={locationActions.closeLocationModal}
        onLocationAdd={locationActions.handleAddLocation}
        businessId={businessData?.businessId}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className={styles.modalOverlay}>
          <div
            className={styles.modalContent}
            style={{
              minWidth: "340px",
              maxWidth: "400px",
              textAlign: "center",
            }}
          >
            <button
              className={styles.modalClose}
              onClick={locationActions.cancelDeleteLocation}
            >
              ×
            </button>

            <div
              style={{
                fontWeight: 700,
                fontSize: "1.15rem",
                margin: "1.5rem 0 0.7rem 0",
                color: "#1f2937",
              }}
            >
              Delete Location?
            </div>

            <div
              style={{
                color: "#6b7280",
                marginBottom: "24px",
                lineHeight: 1.5,
              }}
            >
              Are you sure you want to delete this location? This action cannot
              be undone and will permanently remove all location data.
            </div>

            <div
              style={{
                display: "flex",
                gap: "16px",
                justifyContent: "center",
              }}
            >
              <button
                onClick={locationActions.confirmDeleteLocation}
                style={{
                  background: "#ef4444",
                  color: "#fff",
                  border: "none",
                  borderRadius: "0.5rem",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  padding: "0.75rem 1.5rem",
                  cursor: "pointer",
                }}
              >
                Delete Location
              </button>

              <button
                onClick={locationActions.cancelDeleteLocation}
                style={{
                  background: "#f3f4f6",
                  color: "#374151",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.5rem",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  padding: "0.75rem 1.5rem",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
