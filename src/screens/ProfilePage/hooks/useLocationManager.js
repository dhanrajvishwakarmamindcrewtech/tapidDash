import { useState, useCallback } from "react";
import { doc, deleteDoc, setDoc, collection } from "firebase/firestore";
import { db } from "../../../firebase/config";
import { useToast } from "../../../components/ToastSystem";
import { processLocationData } from "../utils/locationUtils";
import safeStorage from "../../../utils/safeStorage";

export const useLocationManager = (onChange) => {
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { toast } = useToast();

  // Modal management
  const openLocationModal = useCallback(() => {
    setShowLocationModal(true);
  }, []);

  const closeLocationModal = useCallback(() => {
    setShowLocationModal(false);
  }, []);

  // Delete location handlers
  const handleDeleteLocation = useCallback((locationId) => {
    setLocationToDelete(locationId);
    setShowDeleteModal(true);
  }, []);

  const confirmDeleteLocation = useCallback(async () => {
    if (!locationToDelete) return;
    // console.log(locationToDelete, "locationToDelete");

    try {
      // Get business ID from storage
      const storedData = await safeStorage.getItem("businessData", {});
      const businessId = storedData?.data?.businessId;

      if (!businessId) throw new Error("Business ID not found");

      const locRef = doc(
        db,
        "businesses",
        businessId,
        "locations",
        locationToDelete
      );
      console.log("businessId:", businessId);
      console.log("locationToDelete:", locationToDelete);

      await deleteDoc(locRef)
        .then((data) => console.log("Delete success", data))
        .catch((e) => console.error("Delete failed:", e));

      toast.success(
        "Location Deleted!",
        "The location has been removed successfully."
      );
      setShowDeleteModal(false);
      setLocationToDelete(null);
      onChange?.();
      // Trigger re-fetch by returning the deleted location ID
      return locationToDelete;
    } catch (error) {
      console.error("Failed to delete location:", error);
      toast.error("Delete Failed", "Unable to delete the location.");
    }
  }, [locationToDelete, toast, onChange]);

  const cancelDeleteLocation = useCallback(() => {
    setShowDeleteModal(false);
    setLocationToDelete(null);
  }, []);

  // Add location handler
  const handleAddLocation = useCallback(
    async (locationData) => {
      try {
        // Get business ID from storage
        const storedData = await safeStorage.getItem("businessData", {});
        const businessId = storedData?.data?.businessId;

        if (!businessId) throw new Error("Business ID not found");

        const locationsColRef = collection(
          db,
          "businesses",
          businessId,
          "locations"
        );
        const customLocationId = `loc_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;

        // Process and save location data
        const processedData = processLocationData(locationData, businessId);
        console.log(processedData, "processedData");

        const customDocRef = doc(locationsColRef, customLocationId);
        await setDoc(customDocRef, processedData);

        toast.success(
          "Location Added!",
          "Your new location has been added successfully."
        );
        setShowLocationModal(false);

        onChange?.();
        // Return the new location for updating the list
        return {
          id: customLocationId,
          ...processedData,
        };
      } catch (error) {
        console.error("Failed to add location:", error);
        toast.error("Add Location Failed", "Unable to add the location.");
      }
    },
    [toast, onChange]
  );

  return {
    showLocationModal,
    locationToDelete,
    showDeleteModal,
    actions: {
      openLocationModal,
      closeLocationModal,
      handleDeleteLocation,
      confirmDeleteLocation,
      cancelDeleteLocation,
      handleAddLocation,
    },
  };
};
