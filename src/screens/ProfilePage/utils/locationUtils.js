export const processLocationData = (locationData = {}, businessId) => {
  // Helpers
  const safeValue = (value, defaultValue = null) =>
    value === undefined ? defaultValue : value ?? defaultValue;

  const safeObject = (obj, defaultObj = {}) => {
    if (!obj) return { ...defaultObj };
    if (Array.isArray(obj)) return obj; // keep arrays as-is
    return {
      ...defaultObj,
      ...Object.fromEntries(
        Object.entries(obj || {}).map(([k, v]) => [k, v ?? null])
      ),
    };
  };

  // Source of truth for google places / enrichment (support multiple possible fields)
  const googlePlacesData =
    locationData.googlePlacesData || locationData.enrichedData;
  // id fallback sequence
  // const id = `loc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // operating hours — support multiple shapes/names that may come from different APIs

  // Build the final normalized object
  return {
    // id: id,
    businessId: businessId,
    name: googlePlacesData.display_name || "",
    address: googlePlacesData.formatted_address || "",
    category: googlePlacesData.primary_type || "",

    // Contact information from Google Places or manual entry
    contactInfo: {
      phone: safeValue(googlePlacesData?.international_phone_number),
      website: safeValue(googlePlacesData?.website_uri),
    },

    // Google Places business intelligence (safely handled)
    businessIntelligence: googlePlacesData
      ? {
          placeId: safeValue(googlePlacesData.place_id, ""),
          googleMapsUri: safeValue(googlePlacesData.google_maps_uri, ""),
          businessStatus: safeValue(googlePlacesData.business_status, ""),
          primaryType: safeValue(googlePlacesData.primary_type, ""),
          primaryTypeDisplayName: safeValue(
            googlePlacesData.primary_type_display_name,
            ""
          ),
          types: googlePlacesData.types || [],

          // Performance metrics
          rating: safeValue(googlePlacesData.rating),
          userRatingCount: safeValue(googlePlacesData.user_rating_count),
          priceLevel: safeValue(googlePlacesData.price_level),
          priceRange: safeObject(googlePlacesData.price_range),

          // Service offerings (safely handled)
          serviceOfferings: {
            serves_breakfast: safeValue(googlePlacesData.serves_breakfast),
            serves_brunch: safeValue(googlePlacesData.serves_brunch),
            serves_lunch: safeValue(googlePlacesData.serves_lunch),
            serves_coffee: safeValue(googlePlacesData.serves_coffee),
            serves_vegetarian_food: safeValue(
              googlePlacesData.serves_vegetarian_food
            ),
            serves_beer: safeValue(googlePlacesData.serves_beer),
            serves_wine: safeValue(googlePlacesData.serves_wine),
            serves_cocktails: safeValue(googlePlacesData.serves_cocktails),
            serves_dinner: safeValue(googlePlacesData.serves_dinner),
            serves_dessert: safeValue(googlePlacesData.serves_dessert),
          },

          // Customer amenities (safely handled)
          amenities: {
            takeout: safeValue(googlePlacesData.takeout),
            allows_dogs: safeValue(googlePlacesData.allows_dogs),
            good_for_children: safeValue(googlePlacesData.good_for_children),
            good_for_groups: safeValue(googlePlacesData.good_for_groups),
            outdoor_seating: safeValue(googlePlacesData.outdoor_seating),
            restroom: safeValue(googlePlacesData.restroom),
            live_music: safeValue(googlePlacesData.live_music),
            dine_in: safeValue(googlePlacesData.dine_in),
            curbside_pickup: safeValue(googlePlacesData.curbside_pickup),
            delivery: safeValue(googlePlacesData.delivery),
            reservable: safeValue(googlePlacesData.reservable),
          },

          // Accessibility (safely handled)
          accessibility: safeObject(googlePlacesData.accessibility_options),

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
      safeObject(googlePlacesData?.current_opening_hours?.weekdayDescriptions),

    // Photos from Google Places (safely handled)
    photos: (googlePlacesData?.photos || []).slice(0, 5).map((photo) => ({
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
          userRatingCount: safeValue(googlePlacesData.user_rating_count),
          hasReviews: (googlePlacesData.reviews || []).length > 0,
          reviewCount: (googlePlacesData.reviews || []).length,
        }
      : null,

    // Data quality indicators
    dataEnrichment: {
      level: googlePlacesData ? "comprehensive" : "basic",
      source: googlePlacesData ? "google_places_api" : "manual_entry",
      // lastUpdated: serverTimestamp(),
      fieldsPopulated: {
        hasPhone: !!safeValue(googlePlacesData?.international_phone_number),
        hasWebsite: !!safeValue(googlePlacesData?.website_uri),
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
  };
};

export const formatPriceRange = (priceRange) => {
  if (!priceRange?.startPrice) return null;

  const start = priceRange.startPrice;
  const end = priceRange.endPrice;
  const currency = start.currencyCode || "EUR";
  const startAmount = (start.units || 0) + (start.nanos || 0) / 1000000000;
  const endAmount = end
    ? (end.units || 0) + (end.nanos || 0) / 1000000000
    : startAmount;

  return `${currency} ${startAmount}${
    endAmount !== startAmount ? ` - ${endAmount}` : ""
  }`;
};

export const getServiceOfferings = (serviceOfferings) => {
  if (!serviceOfferings) return [];

  const servings = [];
  if (serviceOfferings.serves_breakfast) servings.push("Breakfast");
  if (serviceOfferings.serves_brunch) servings.push("Brunch");
  if (serviceOfferings.serves_lunch) servings.push("Lunch");
  if (serviceOfferings.serves_dinner) servings.push("Dinner");
  if (serviceOfferings.serves_coffee) servings.push("Coffee");
  if (serviceOfferings.serves_dessert) servings.push("Desserts");

  return servings;
};
