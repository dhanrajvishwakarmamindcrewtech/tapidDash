import React, { useState, useCallback } from "react";
import {
  MapPin,
  Plus,
  Star,
  ExternalLink,
  Phone,
  Globe,
  Utensils,
  Shield,
  ChevronUp,
  ChevronDown,
  Clock,
  Check,
  X,
  Trash2,
  Building,
  DollarSign,
  Euro,
} from "lucide-react";
import { formatPriceRange, getServiceOfferings } from "../utils/locationUtils";
import styles from "../ProfilePage.module.css";
import StarRating from "./StarRating";

const LocationsTab = ({ locations, onAddLocation, onDeleteLocation }) => {
  // console.log(locations, "locations");

  const [currentImageIndex, setCurrentImageIndex] = useState({});
  const [expandedSections, setExpandedSections] = useState({});

  // Handle image navigation
  const handleImageNavigation = useCallback((locId, direction, totalImages) => {
    setCurrentImageIndex((prev) => {
      const currentIndex = prev[locId] || 0;
      let newIndex =
        direction === "next"
          ? currentIndex === totalImages - 1
            ? 0
            : currentIndex + 1
          : currentIndex === 0
          ? totalImages - 1
          : currentIndex - 1;
      return { ...prev, [locId]: newIndex };
    });
  }, []);

  const toggleSection = useCallback((locId, section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [`${locId}-${section}`]: !prev[`${locId}-${section}`],
    }));
  }, []);

  const getKeyAmenities = (amenities) => {
    if (!amenities) return [];
    const allAmenities = [
      { key: "takeout", label: "Takeout", status: amenities.takeout },
      { key: "delivery", label: "Delivery", status: amenities.delivery },
      { key: "dine_in", label: "Dine-in", status: amenities.dine_in },
      {
        key: "outdoor_seating",
        label: "Outdoor Seating",
        status: amenities.outdoor_seating,
      },
      {
        key: "reservable",
        label: "Reservations",
        status: amenities.reservable,
      },
      {
        key: "good_for_groups",
        label: "Groups Welcome",
        status: amenities.good_for_groups,
      },
      {
        key: "good_for_children",
        label: "Kid-friendly",
        status: amenities.good_for_children,
      },
      {
        key: "allows_dogs",
        label: "Pet-friendly",
        status: amenities.allows_dogs,
      },
    ];
    return allAmenities.filter(
      (a) => a.status !== undefined && a.status !== null
    );
  };

  return (
    <div className={styles.tabContent}>
      {/* Section Header */}
      <div className={styles.sectionHeader}>
        <h3>Business Locations</h3>
        <button className={styles.addLocationBtn} onClick={onAddLocation}>
          <Plus size={16} /> Add Location
        </button>
      </div>

      {/* Locations List */}
      {locations.length === 0 ? (
        <div className={styles.noLocCard}>
          <MapPin size={48} />
          <p>No locations added yet</p>
        </div>
      ) : (
        <div className={styles.locationsList}>
          {locations.map((loc, idx) => {
            const id = loc.id || `loc-${idx}`;
            console.log(id, "loc id", locations);

            const images = loc.photos?.length ? loc.photos : null;
            const currentIndex = currentImageIndex[id] || 0;
            const business = loc.businessIntelligence;
            const servings = getServiceOfferings(business?.serviceOfferings);
            const amenities = getKeyAmenities(business?.amenities);

            return (
              <div key={`${id}-${idx}`} className={styles.locationListItem}>
                {/* Image Section */}
                <div className={styles.locationImageSection}>
                  {images ? (
                    <div className={styles.imageSlider}>
                      <img
                        src={images[currentIndex].photo_uri_original}
                        alt={`${loc.name} Location`}
                        className={styles.locationImage}
                      />
                      {images.length > 1 && (
                        <>
                          <button
                            className={`${styles.imageNavBtn} ${styles.prevBtn}`}
                            onClick={() =>
                              handleImageNavigation(id, "prev", images.length)
                            }
                          >
                            ←
                          </button>
                          <button
                            className={`${styles.imageNavBtn} ${styles.nextBtn}`}
                            onClick={() =>
                              handleImageNavigation(id, "next", images.length)
                            }
                          >
                            →
                          </button>
                        </>
                      )}
                      {images.length > 1 && (
                        <div className={styles.imageCounter}>
                          {currentIndex + 1}/{images.length}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className={styles.placeholderImage}>
                      <Building size={40} />
                    </div>
                  )}
                  {/* Status Badge */}
                  {business?.businessStatus && (
                    <div
                      className={`${styles.statusBadge} ${
                        business.businessStatus === "OPERATIONAL"
                          ? styles.operational
                          : styles.closed
                      }`}
                    >
                      {business.businessStatus === "OPERATIONAL"
                        ? "OPEN"
                        : "CLOSED"}
                    </div>
                  )}
                  {/* Delete Button */}
                  <button
                    className={styles.deleteOverlayBtn}
                    onClick={() => onDeleteLocation(id)}
                    title="Delete Location"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                {/* Content Section */}
                <div className={styles.locationInfoSection}>
                  <div className={styles.locationHeader}>
                    <div className={styles.locationTitleArea}>
                      <div className={styles.titleRow}>
                        <h4 className={styles.locationName}>{loc.name}</h4>
                      </div>
                      {business?.primaryTypeDisplayName && (
                        <span className={styles.businessType}>
                          {business.primaryTypeDisplayName}
                        </span>
                      )}
                    </div>
                    <div className={styles.headerBadges}>
                      {loc.dataEnrichment?.level && (
                        <div
                          className={`${styles.dataQualityBadge} ${
                            loc.dataEnrichment.level === "comprehensive"
                              ? styles.comprehensive
                              : styles.basic
                          }`}
                        >
                          {loc.dataEnrichment.level === "comprehensive"
                            ? "Comprehensive Data"
                            : "Basic Info"}
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Quick Info Row */}
                  <div className={styles.quickInfoRow}>
                    {loc.reviewsSummary?.rating && (
                      <div className={styles.ratingInfo}>
                        <StarRating rating={loc.reviewsSummary.rating} />
                        <span className={styles.ratingText}>
                          {loc.reviewsSummary.rating} (
                          {loc.reviewsSummary.userRatingCount} reviews)
                        </span>
                      </div>
                    )}
                    {business?.priceRange?.start_price && (
                      <div className={styles.priceInfo}>
                        <Euro size={14} />
                        <span>
                          {business.priceRange?.start_price?.units +
                            " - " +
                            business.priceRange?.end_price?.units}
                        </span>
                      </div>
                    )}
                    {business?.googleMapsUri && (
                      <a
                        href={business.googleMapsUri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.mapsLink}
                      >
                        <ExternalLink size={14} />
                        <span>View on Maps</span>
                      </a>
                    )}
                  </div>
                  {/* Address and Contact */}
                  <div className={styles.contactSection}>
                    <div className={styles.locationMeta}>
                      <MapPin size={16} />
                      <span className={styles.locationAddress}>
                        {loc.address}
                      </span>
                    </div>
                    <div className={styles.contactRow}>
                      {loc.contactInfo?.phone && (
                        <div className={styles.locationMeta}>
                          <Phone size={14} />
                          <span>{loc.contactInfo.phone}</span>
                        </div>
                      )}
                      {loc.contactInfo?.website && (
                        <div className={styles.locationMeta}>
                          <Globe size={14} />
                          <a
                            href={loc.contactInfo.website}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Website
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Service Offerings */}
                  {servings.length > 0 && (
                    <div className={styles.servingsSection}>
                      <div className={styles.sectionTitle}>
                        <Utensils size={16} />
                        <span>Serving</span>
                      </div>
                      <div className={styles.tagsList}>
                        {servings.slice(0, 6).map((serving) => (
                          <span key={serving} className={styles.tag}>
                            {serving}
                          </span>
                        ))}
                        {servings.length > 6 && (
                          <span className={styles.moreTag}>
                            +{servings.length - 6} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  {/* Key Amenities */}
                  {amenities.length > 0 && (
                    <div className={styles.amenitiesSection}>
                      <div className={styles.sectionTitle}>
                        <Shield size={16} />
                        <span>Amenities</span>
                      </div>
                      <div className={styles.amenitiesList}>
                        {amenities.slice(0, 4).map((amenity) => (
                          <div key={amenity.key} className={styles.amenityItem}>
                            {amenity.status ? (
                              <Check size={12} className={styles.checkIcon} />
                            ) : (
                              <X size={12} className={styles.crossIcon} />
                            )}
                            <span
                              className={
                                amenity.status
                                  ? styles.availableText
                                  : styles.unavailableText
                              }
                            >
                              {amenity.label}
                            </span>
                          </div>
                        ))}
                        {amenities.length > 4 && (
                          <button
                            className={styles.expandBtn}
                            onClick={() => toggleSection(id, "amenities")}
                          >
                            {expandedSections[`${id}-amenities`] ? (
                              <>
                                Less <ChevronUp size={12} />
                              </>
                            ) : (
                              <>
                                +{amenities.length - 4} more{" "}
                                <ChevronDown size={12} />
                              </>
                            )}
                          </button>
                        )}
                      </div>
                      {expandedSections[`${id}-amenities`] &&
                        amenities.length > 4 && (
                          <div className={styles.expandedAmenities}>
                            {amenities.slice(4).map((amenity) => (
                              <div
                                key={amenity.key}
                                className={styles.amenityItem}
                              >
                                {amenity.status ? (
                                  <Check
                                    size={12}
                                    className={styles.checkIcon}
                                  />
                                ) : (
                                  <X size={12} className={styles.crossIcon} />
                                )}
                                <span
                                  className={
                                    amenity.status
                                      ? styles.availableText
                                      : styles.unavailableText
                                  }
                                >
                                  {amenity.label}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                    </div>
                  )}
                  {/* Operating Hours */}
                  {loc.operatingHours &&
                    Object.keys(loc.operatingHours).length > 0 && (
                      <div className={styles.hoursSection}>
                        <button
                          className={styles.sectionTitleBtn}
                          onClick={() => toggleSection(id, "hours")}
                        >
                          <Clock size={16} />
                          <span>Operating Hours</span>
                          {expandedSections[`${id}-hours`] ? (
                            <ChevronUp size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          )}
                        </button>
                        {expandedSections[`${id}-hours`] && (
                          <div className={styles.hoursGrid}>
                            {Object.entries(loc.operatingHours).map(
                              ([day, hours]) => (
                                <div key={day} className={styles.hourItem}>
                                  <span className={styles.dayName}>
                                    {hours.split(":")[0]}
                                  </span>
                                  <span className={styles.hourTime}>
                                    {hours.split(":").slice(1).join(":").trim()}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LocationsTab;
