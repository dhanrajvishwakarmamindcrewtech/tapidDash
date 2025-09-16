import { useState, useEffect, useCallback } from "react";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
} from "firebase/firestore";
import { db } from "../../../firebase/config";
import { useToast } from "../../../components/ToastSystem";
import safeStorage from "../../../utils/safeStorage";

export const useProfileData = () => {
  const [businessId, setBusinessId] = useState(null);
  const [businessData, setBusinessData] = useState(null);
  const [locations, setLocations] = useState([]);
  const [billingData, setBillingData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Load business ID from storage
  useEffect(() => {
    const loadBusinessId = async () => {
      try {
        const storedData = await safeStorage.getItem("businessData", {});
        const id = storedData?.data?.businessId || null;
        setBusinessId(id);
      } catch (error) {
        console.error("Failed to load businessId", error);
        setBusinessId(null);
      }
    };

    loadBusinessId();
  }, []);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const businessRef = doc(db, "businesses", businessId);
      const businessSnap = await getDoc(businessRef);

      if (businessSnap.exists()) {
        const data = businessSnap.data();
        setBusinessData({ ...data, businessId });

        // Fetch locations
        const locationsColRef = collection(
          db,
          "businesses",
          businessId,
          "locations"
        );
        const locationsSnap = await getDocs(locationsColRef);
        const locationsList = locationsSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setLocations(locationsList);

        // Fetch billing data
        const billingColRef = collection(
          db,
          "businesses",
          businessId,
          "billing"
        );
        const billingSnap = await getDocs(billingColRef);
        if (!billingSnap.empty) {
          const billingDoc = billingSnap.docs[0];
          setBillingData({
            id: billingDoc.id,
            ...billingDoc.data(),
          });
        } else {
          setBillingData(null);
        }
      } else {
        setBusinessData(null);
        setLocations([]);
        setBillingData(null);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Loading Error", "Failed to load profile data.");
    } finally {
      setIsLoading(false);
    }
  }, [businessId, toast]);

  useEffect(() => {
    if (businessId) fetchData();
  }, [businessId, fetchData]);

  // Save profile data
  const saveProfile = useCallback(
    async (updatedData) => {
      if (!businessData || !businessId) return;

      setIsSaving(true);
      try {
        const businessRef = doc(db, "businesses", businessId);
        await updateDoc(businessRef, updatedData);

        setBusinessData((prev) => ({ ...prev, ...updatedData }));
        toast.success(
          "Profile Updated!",
          "Your profile data has been updated successfully."
        );
      } catch (error) {
        console.error("Error saving profile:", error);
        toast.error("Save Failed", "Unable to save profile information.");
      } finally {
        setIsSaving(false);
      }
    },
    [businessData, businessId, toast]
  );

  // Update locations list
  const updateLocations = useCallback((newLocations) => {
    setLocations(newLocations);
  }, []);

  return {
    businessData,
    locations,
    billingData,
    isLoading,
    actions: {
      saveProfile,
      updateLocations,
      reloadProfile: fetchData,
      isSaving,
    },
  };
};
