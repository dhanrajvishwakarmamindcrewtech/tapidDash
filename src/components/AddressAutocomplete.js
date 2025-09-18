import React, { useState, useEffect, useRef } from "react";
import { useJsApiLoader } from "@react-google-maps/api";

/**
 * AddressAutocomplete - Enhanced with Places API (New)
 * ---------------------------------------------------
 * Advanced autocomplete component using Google Places API (New)
 * with comprehensive data fetching and enhanced features
 */

// Declare the libraries array once so its reference stays stable across renders
const GOOGLE_LIBRARIES = ["places"];

// API key configuration
const GOOGLE_MAPS_API_KEY =
  process.env.REACT_APP_GOOGLE_MAPS_API_KEY ||
  "AIzaSyBMrMxMvd1ZpzRJo07IqTj-FqWq3qbnKK4";
const DEBUG = process.env.NODE_ENV !== "production";

const AddressAutocomplete = ({
  value,
  onChange,
  onSelect,
  inputClassName = "",
  placeholder = "Search address",
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef();
  const autocompleteService = useRef();
  const placesService = useRef();
  const debounceTimer = useRef();

  // Ensure the Google Maps Places library is loaded
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: GOOGLE_LIBRARIES,
  });

  // Initialize the AutocompleteService and PlacesService when Google Maps loads
  useEffect(() => {
    if (isLoaded && window.google?.maps?.places?.AutocompleteService) {
      autocompleteService.current =
        new window.google.maps.places.AutocompleteService();

      // Create a dummy div for PlacesService (required by Google Maps API for fallback)
      const dummyDiv = document.createElement("div");
      placesService.current = new window.google.maps.places.PlacesService(
        dummyDiv
      );
    }
  }, [isLoaded]);

  // Debounced search function
  const searchPlaces = (query) => {
    if (!query || query.length < 2 || !autocompleteService.current) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);

    autocompleteService.current.getPlacePredictions(
      {
        input: query,
        componentRestrictions: { country: "ie" }, // Restrict to Ireland, change as needed
      },
      (predictions, status) => {
        setIsLoading(false);
        if (
          status === window.google.maps.places.PlacesServiceStatus.OK &&
          predictions
        ) {
          setSuggestions(predictions.slice(0, 5)); // Limit to 5 suggestions
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      }
    );
  };

  // Enhanced place details using Places API (New) with comprehensive data
  const getPlaceDetails = async (placeId, description) => {
    try {
      if (DEBUG)
        console.log(
          "🔍 Fetching COMPREHENSIVE place details using Places API (New) for:",
          placeId
        );

      // Use the new Places API (New) for maximum data coverage
      const response = await fetch(
        `https://places.googleapis.com/v1/places/${placeId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY,
            "X-Goog-FieldMask": [
              // === BASIC INFORMATION ===
              "id",
              "name",
              "displayName",
              "formattedAddress",
              "shortFormattedAddress",

              // === LOCATION & GEOMETRY ===
              "location",
              "viewport",
              "addressComponents",
              "plusCode",
              "googleMapsUri",

              // === CONTACT INFORMATION ===
              "internationalPhoneNumber",
              "nationalPhoneNumber",
              "websiteUri",

              // === BUSINESS INFORMATION ===
              "businessStatus",
              "types",
              "primaryType",
              "primaryTypeDisplayName",
              "utcOffsetMinutes",
              "pureServiceAreaBusiness",

              // === HOURS & OPERATIONS ===
              "regularOpeningHours",
              "currentOpeningHours",
              "regularSecondaryOpeningHours",
              "currentSecondaryOpeningHours",

              // === RATINGS & REVIEWS ===
              "rating",
              "userRatingCount",
              "reviews",

              // === PRICING & FEATURES ===
              "priceLevel",
              "priceRange",

              // === SERVICE OPTIONS ===
              "curbsidePickup",
              "delivery",
              "dineIn",
              "takeout",
              "reservable",

              // === ACCESSIBILITY ===
              "accessibilityOptions",

              // === FOOD SERVICE DETAILS ===
              "servesBeer",
              "servesBreakfast",
              "servesBrunch",
              "servesCocktails",
              "servesCoffee",
              "servesDessert",
              "servesDinner",
              "servesLunch",
              "servesVegetarianFood",
              "servesWine",

              // === ADDITIONAL FEATURES ===
              "allowsDogs",
              "goodForChildren",
              "goodForGroups",
              "goodForWatchingSports",
              "liveMusic",
              "menuForChildren",
              "outdoorSeating",
              "restroom",
              "paymentOptions",
              "parkingOptions",

              // === VISUAL & MEDIA ===
              "photos",
              "iconMaskBaseUri",
              "iconBackgroundColor",

              // === AI-POWERED SUMMARIES & FEATURES ===
              "editorialSummary",
              "generativeSummary",
              "reviewSummary",

              // === ADDITIONAL DETAILS ===
              "adrFormatAddress",
              "attributions",
              "containingPlaces",
              "subDestinations",
            ].join(","),
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Places API (New) error: ${response.status} ${response.statusText}`
        );
      }

      const place = await response.json();
      if (DEBUG)
        console.log("🏢 RAW Places API (New) Response - Full Data:", place);

      // Create the most comprehensive place object possible
      const placeData = {
        // === BASIC INFORMATION ===
        place_id: place.id,
        name: place.name,
        display_name: place.displayName?.text || place.name,
        display_name_language: place.displayName?.languageCode,
        formatted_address: place.formattedAddress,
        short_formatted_address: place.shortFormattedAddress,
        description: description, // From autocomplete
        google_maps_uri: place.googleMapsUri,
        utc_offset_minutes: place.utcOffsetMinutes,
        pure_service_area_business: place.pureServiceAreaBusiness,

        // === LOCATION & GEOMETRY ===
        geometry: {
          location: {
            lat: place.location?.latitude,
            lng: place.location?.longitude,
          },
          viewport: place.viewport
            ? {
                northeast: {
                  lat: place.viewport.high?.latitude,
                  lng: place.viewport.high?.longitude,
                },
                southwest: {
                  lat: place.viewport.low?.latitude,
                  lng: place.viewport.low?.longitude,
                },
              }
            : null,
        },
        address_components:
          place.addressComponents?.map((component) => ({
            long_name: component.longText,
            short_name: component.shortText,
            types: component.types,
            language_code: component.languageCode,
          })) || [],
        plus_code: place.plusCode,
        adr_format_address: place.adrFormatAddress,

        // === BUSINESS INFORMATION ===
        business_status: place.businessStatus,
        types: place.types || [],
        primary_type: place.primaryType,
        primary_type_display_name: place.primaryTypeDisplayName?.text,

        // === CONTACT INFORMATION ===
        international_phone_number: place.internationalPhoneNumber,
        national_phone_number: place.nationalPhoneNumber,
        website_uri: place.websiteUri,

        // === HOURS & OPERATIONS ===
        regular_opening_hours: place.regularOpeningHours
          ? {
              open_now: place.regularOpeningHours.openNow,
              periods: place.regularOpeningHours.periods,
              weekday_descriptions:
                place.regularOpeningHours.weekdayDescriptions,
              secondary_hours_type:
                place.regularOpeningHours.secondaryHoursType,
              special_days: place.regularOpeningHours.specialDays,
            }
          : null,
        current_opening_hours: place.currentOpeningHours,
        regular_secondary_opening_hours: place.regularSecondaryOpeningHours,
        current_secondary_opening_hours: place.currentSecondaryOpeningHours,

        // === RATINGS & REVIEWS ===
        rating: place.rating,
        user_rating_count: place.userRatingCount,
        reviews:
          place.reviews?.map((review) => ({
            name: review.name,
            relative_time_description: review.relativeTimeDescription,
            rating: review.rating,
            text: review.text?.text,
            text_language: review.text?.languageCode,
            time: review.time,
            author_attribution: {
              display_name: review.authorAttribution?.displayName,
              uri: review.authorAttribution?.uri,
              photo_uri: review.authorAttribution?.photoUri,
            },
            original_text: review.originalText?.text,
            original_language: review.originalText?.languageCode,
            translated: review.translated,
            publish_time: review.publishTime,
          })) || [],
        review_summary: place.reviewSummary
          ? {
              summary: place.reviewSummary.summary?.text,
              summary_language: place.reviewSummary.summary?.languageCode,
            }
          : null,

        // === PRICING & FEATURES ===
        price_level: place.priceLevel,
        price_range: place.priceRange
          ? {
              start_price: place.priceRange.startPrice,
              end_price: place.priceRange.endPrice,
            }
          : null,

        // === SERVICE OPTIONS ===
        curbside_pickup: place.curbsidePickup,
        delivery: place.delivery,
        dine_in: place.dineIn,
        takeout: place.takeout,
        reservable: place.reservable,

        // === ACCESSIBILITY ===
        accessibility_options: place.accessibilityOptions,

        // === FOOD SERVICE DETAILS ===
        serves_beer: place.servesBeer,
        serves_breakfast: place.servesBreakfast,
        serves_brunch: place.servesBrunch,
        serves_cocktails: place.servesCocktails,
        serves_coffee: place.servesCoffee,
        serves_dessert: place.servesDessert,
        serves_dinner: place.servesDinner,
        serves_lunch: place.servesLunch,
        serves_vegetarian_food: place.servesVegetarianFood,
        serves_wine: place.servesWine,

        // === ADDITIONAL FEATURES ===
        allows_dogs: place.allowsDogs,
        good_for_children: place.goodForChildren,
        good_for_groups: place.goodForGroups,
        good_for_watching_sports: place.goodForWatchingSports,
        live_music: place.liveMusic,
        menu_for_children: place.menuForChildren,
        outdoor_seating: place.outdoorSeating,
        restroom: place.restroom,
        payment_options: place.paymentOptions,
        parking_options: place.parkingOptions,

        // === VISUAL & MEDIA ===
        photos:
          place.photos?.map((photo, index) => ({
            name: photo.name,
            width_px: photo.widthPx,
            height_px: photo.heightPx,
            author_attributions:
              photo.authorAttributions?.map((attr) => ({
                display_name: attr.displayName,
                uri: attr.uri,
                photo_uri: attr.photoUri,
              })) || [],
            // Generate multiple photo URLs using the new Photos API
            photo_uri_small: `https://places.googleapis.com/v1/${photo.name}/media?maxWidthPx=400&maxHeightPx=400&key=${GOOGLE_MAPS_API_KEY}`,
            photo_uri_medium: `https://places.googleapis.com/v1/${photo.name}/media?maxWidthPx=800&maxHeightPx=800&key=${GOOGLE_MAPS_API_KEY}`,
            photo_uri_large: `https://places.googleapis.com/v1/${photo.name}/media?maxWidthPx=1600&maxHeightPx=1600&key=${GOOGLE_MAPS_API_KEY}`,
            photo_uri_original: `https://places.googleapis.com/v1/${photo.name}/media?maxWidthPx=${photo.widthPx}&maxHeightPx=${photo.heightPx}&key=${GOOGLE_MAPS_API_KEY}`,
          })) || [],
        icon_mask_base_uri: place.iconMaskBaseUri,
        icon_background_color: place.iconBackgroundColor,

        // === AI-POWERED SUMMARIES ===
        editorial_summary: place.editorialSummary
          ? {
              overview: place.editorialSummary.overview?.text,
              language: place.editorialSummary.overview?.languageCode,
            }
          : null,
        generative_summary: place.generativeSummary
          ? {
              overview: place.generativeSummary.overview?.text,
              language: place.generativeSummary.overview?.languageCode,
              references: place.generativeSummary.references,
            }
          : null,

        // === LOCATION CONTEXT ===
        containing_places: place.containingPlaces || [],
        sub_destinations: place.subDestinations || [],

        // === METADATA ===
        attributions: place.attributions || [],
        api_fetch_timestamp: new Date().toISOString(),
        api_version: "Places API (New)",
        api_endpoint: "Place Details (New)",
        fields_requested: "comprehensive_enhanced_new_api_maximum",
      };

      // === COMPREHENSIVE ENHANCED LOGGING ===
      if (DEBUG)
        console.log(
          "🎉 PLACES API (NEW) - MAXIMUM COMPREHENSIVE DATA:",
          placeData
        );
      if (DEBUG)
        console.log("⭐ Enhanced Review Intelligence:", {
          total_user_ratings: placeData.user_rating_count,
          detailed_reviews_returned: placeData.reviews?.length || 0,
          average_rating: placeData.rating,
          has_ai_review_summary: !!placeData.review_summary,
          review_languages: [
            ...new Set(
              placeData.reviews?.map((r) => r.text_language).filter(Boolean)
            ),
          ],
          has_translated_reviews: placeData.reviews?.some((r) => r.translated),
          author_photo_count:
            placeData.reviews?.filter((r) => r.author_attribution?.photo_uri)
              .length || 0,
        });
      if (DEBUG)
        console.log("📸 Enhanced Photo Intelligence:", {
          total_photos: placeData.photos?.length || 0,
          photo_resolutions:
            placeData.photos?.length > 0
              ? [
                  "400px (small)",
                  "800px (medium)",
                  "1600px (large)",
                  "original resolution",
                ]
              : [],
          has_author_attributions: placeData.photos?.some(
            (p) => p.author_attributions?.length > 0
          ),
          max_resolution:
            placeData.photos?.length > 0
              ? `${Math.max(
                  ...placeData.photos.map((p) => p.width_px)
                )}x${Math.max(...placeData.photos.map((p) => p.height_px))}`
              : "N/A",
          photographer_count: [
            ...new Set(
              placeData.photos
                ?.flatMap((p) =>
                  p.author_attributions?.map((a) => a.display_name)
                )
                .filter(Boolean)
            ),
          ].length,
        });
      if (DEBUG)
        console.log("🍽️ Complete Restaurant Intelligence:", {
          meal_services: {
            breakfast: placeData.serves_breakfast,
            brunch: placeData.serves_brunch,
            lunch: placeData.serves_lunch,
            dinner: placeData.serves_dinner,
            dessert: placeData.serves_dessert,
          },
          beverages: {
            beer: placeData.serves_beer,
            wine: placeData.serves_wine,
            cocktails: placeData.serves_cocktails,
            coffee: placeData.serves_coffee,
          },
          service_options: {
            dine_in: placeData.dine_in,
            takeout: placeData.takeout,
            delivery: placeData.delivery,
            curbside_pickup: placeData.curbside_pickup,
            reservable: placeData.reservable,
          },
          dietary_accommodations: {
            vegetarian_friendly: placeData.serves_vegetarian_food,
          },
          pricing_intelligence: {
            price_level: placeData.price_level,
            price_range: placeData.price_range,
          },
        });
      if (DEBUG)
        console.log("🏢 Advanced Business Intelligence:", {
          business_status: placeData.business_status,
          primary_category: placeData.primary_type_display_name,
          is_service_area_only: placeData.pure_service_area_business,
          accessibility: placeData.accessibility_options,
          family_experience: {
            good_for_children: placeData.good_for_children,
            allows_dogs: placeData.allows_dogs,
            children_menu: placeData.menu_for_children,
          },
          social_amenities: {
            outdoor_seating: placeData.outdoor_seating,
            restroom: placeData.restroom,
            live_music: placeData.live_music,
            good_for_groups: placeData.good_for_groups,
            good_for_sports: placeData.good_for_watching_sports,
          },
          infrastructure: {
            payment_options: placeData.payment_options,
            parking_options: placeData.parking_options,
          },
          operating_hours: {
            has_regular_hours: !!placeData.regular_opening_hours,
            has_current_hours: !!placeData.current_opening_hours,
            has_secondary_hours: !!placeData.regular_secondary_opening_hours,
            timezone_offset: placeData.utc_offset_minutes,
          },
        });
      if (DEBUG)
        console.log("🤖 AI-Powered Intelligence & Context:", {
          has_editorial_summary: !!placeData.editorial_summary,
          has_generative_ai_summary: !!placeData.generative_summary,
          has_ai_review_summary: !!placeData.review_summary,
          google_maps_link: placeData.google_maps_uri,
          location_context: {
            containing_places_count: placeData.containing_places?.length || 0,
            sub_destinations_count: placeData.sub_destinations?.length || 0,
          },
          plus_code: placeData.plus_code?.globalCode,
        });

      onSelect && onSelect(description, placeData);
    } catch (error) {
      console.error("❌ Places API (New) Error:", error);

      // Fallback to legacy API if new API fails
      if (DEBUG) console.log("🔄 Falling back to legacy Places API...");

      if (!placesService.current) {
        onSelect &&
          onSelect(description, {
            description,
            place_id: placeId,
            error: error.message,
            api_version: "Error - No fallback available",
          });
        return;
      }

      // Legacy fallback with comprehensive fields
      placesService.current.getDetails(
        {
          placeId: placeId,
          fields: [
            "place_id",
            "name",
            "formatted_address",
            "geometry",
            "address_components",
            "types",
            "rating",
            "user_ratings_total",
            "reviews",
            "photos",
            "international_phone_number",
            "website",
            "business_status",
            "opening_hours",
            "price_level",
          ],
        },
        (place, status) => {
          if (
            status === window.google.maps.places.PlacesServiceStatus.OK &&
            place
          ) {
            if (DEBUG) console.log("🏢 Legacy API Fallback Data:", place);
            onSelect &&
              onSelect(description, {
                place_id: place.place_id,
                name: place.name,
                formatted_address: place.formatted_address,
                description: description,
                geometry: {
                  location: {
                    lat: place.geometry?.location?.lat(),
                    lng: place.geometry?.location?.lng(),
                  },
                },
                address_components: place.address_components || [],
                types: place.types || [],
                rating: place.rating,
                user_ratings_total: place.user_ratings_total,
                reviews: place.reviews || [],
                photos:
                  place.photos?.map((photo) => ({
                    height: photo.height,
                    width: photo.width,
                    photo_reference: photo.getUrl ? photo.getUrl() : null,
                  })) || [],
                international_phone_number: place.international_phone_number,
                website: place.website,
                business_status: place.business_status,
                opening_hours: place.opening_hours,
                price_level: place.price_level,
                api_version: "Places API (Legacy - Fallback)",
                fallback_reason: error.message,
              });
          } else {
            onSelect &&
              onSelect(description, {
                description,
                place_id: placeId,
                error: "Both new and legacy APIs failed",
                api_version: "Complete failure",
              });
          }
        }
      );
    }
  };

  // Handle input changes with debouncing
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    onChange && onChange(newValue);

    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new timer
    debounceTimer.current = setTimeout(() => {
      searchPlaces(newValue);
    }, 300);
  };

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion) => {
    const selectedValue = suggestion.description;
    onChange && onChange(selectedValue);
    setShowSuggestions(false);
    setSuggestions([]);

    // Get comprehensive place information using Places API (New)
    getPlaceDetails(suggestion.place_id, suggestion.description);
  };

  // Handle input blur to hide suggestions
  const handleBlur = () => {
    // Delay hiding to allow for suggestion clicks
    setTimeout(() => {
      setShowSuggestions(false);
    }, 150);
  };

  // Handle input focus
  const handleFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={inputClassName}
        placeholder={placeholder}
        autoComplete="off"
      />

      {showSuggestions && (suggestions.length > 0 || isLoading) && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            backgroundColor: "white",
            border: "1px solid #ccc",
            borderRadius: "4px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            zIndex: 10001,
            maxHeight: "200px",
            overflowY: "auto",
          }}
        >
          {isLoading ? (
            <div
              style={{ padding: "12px", textAlign: "center", color: "#666" }}
            >
              Loading enhanced suggestions...
            </div>
          ) : (
            suggestions.map((suggestion) => (
              <div
                key={suggestion.place_id}
                onClick={() => handleSuggestionClick(suggestion)}
                style={{
                  padding: "12px",
                  cursor: "pointer",
                  borderBottom: "1px solid #eee",
                  fontSize: "14px",
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#f5f5f5";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "transparent";
                }}
              >
                <div style={{ fontWeight: "500" }}>
                  {suggestion.structured_formatting?.main_text ||
                    suggestion.description}
                </div>
                {suggestion.structured_formatting?.secondary_text && (
                  <div style={{ color: "#666", fontSize: "12px" }}>
                    {suggestion.structured_formatting.secondary_text}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AddressAutocomplete;
