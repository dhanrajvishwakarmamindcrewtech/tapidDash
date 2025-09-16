import { useState, useEffect, useCallback } from "react";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
} from "firebase/firestore";
import { db } from "../../../firebase/config";
import { useToast } from "../../../components/ToastSystem";
import safeStorage from "../../../utils/safeStorage";

export const useCampaignData = () => {
  const [campaignData, setCampaignData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Load campaign data
  useEffect(() => {
    const loadCampaign = async () => {
      try {
        const result = safeStorage.getItem("businessData", null);
        if (!result.success || !result.data) return;

        const businessId = result.data.businessId;
        const businessDocRef = doc(db, "businesses", businessId);
        const campaignsCollectionRef = collection(businessDocRef, "campaigns");
        const querySnapshot = await getDocs(campaignsCollectionRef);

        const campaigns = [];
        querySnapshot.forEach((doc) => {
          campaigns.push({ id: doc.id, ...doc.data() });
        });

        if (campaigns.length > 0) {
          setCampaignData(campaigns[0]);
        }
      } catch (error) {
        console.error("Error loading campaign:", error);
        toast.error("Loading Error", "Failed to load campaign data.");
      } finally {
        setIsLoading(false);
      }
    };

    loadCampaign();
  }, [toast]);

  // Save campaign (create or update)
  const saveCampaign = useCallback(
    async (campaignData, isUpdate = false) => {
      try {
        const result = safeStorage.getItem("businessData", null);
        if (!result.success || !result.data) {
          toast.error("Save Failed", "Unable to find business information.");
          return;
        }

        const businessId = result.data.businessId;
        const businessDocRef = doc(db, "businesses", businessId);

        if (isUpdate && campaignData.id) {
          const campaignDocRef = doc(
            businessDocRef,
            "campaigns",
            campaignData.id
          );
          await updateDoc(campaignDocRef, {
            ...campaignData,
            updatedAt: new Date(),
          });
          setCampaignData({ ...campaignData, updatedAt: new Date() });
          toast.success(
            "Campaign Updated!",
            "Your loyalty campaign has been updated."
          );
        } else {
          const campaignsCollectionRef = collection(
            businessDocRef,
            "campaigns"
          );
          const docRef = await addDoc(campaignsCollectionRef, {
            ...campaignData,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          const newCampaign = {
            ...campaignData,
            id: docRef.id,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          setCampaignData(newCampaign);
          toast.success(
            "Campaign Created!",
            "Your loyalty campaign has been created."
          );
        }
      } catch (error) {
        console.error("Error saving campaign:", error);
        toast.error(
          "Save Failed",
          "An error occurred while saving your campaign."
        );
      }
    },
    [toast]
  );

  // Toggle campaign status
  const toggleStatus = useCallback(async () => {
    if (!campaignData) return;

    try {
      const result = safeStorage.getItem("businessData", null);
      if (!result.success || !result.data) return;

      const businessId = result.data.businessId;
      const campaignDocRef = doc(
        db,
        "businesses",
        businessId,
        "campaigns",
        campaignData.id
      );
      const newStatus = !campaignData.isActive;

      await updateDoc(campaignDocRef, {
        isActive: newStatus,
        updatedAt: new Date(),
      });

      setCampaignData((prev) => ({
        ...prev,
        isActive: newStatus,
        updatedAt: new Date(),
      }));

      toast.success(
        newStatus ? "Campaign Resumed" : "Campaign Paused",
        `Your campaign is now ${newStatus ? "active" : "paused"}.`
      );
    } catch (error) {
      console.error("Error toggling campaign status:", error);
      toast.error("Update Failed", "Failed to update campaign status.");
    }
  }, [campaignData, toast]);

  // Delete campaign
  const deleteCampaign = useCallback(async () => {
    if (!campaignData) return;

    try {
      const result = safeStorage.getItem("businessData", null);
      if (!result.success || !result.data) return;

      const businessId = result.data.businessId;
      const campaignDocRef = doc(
        db,
        "businesses",
        businessId,
        "campaigns",
        campaignData.id
      );

      await deleteDoc(campaignDocRef);
      setCampaignData(null);
      toast.success(
        "Campaign Deleted",
        "Your campaign has been removed successfully."
      );
    } catch (error) {
      console.error("Error deleting campaign:", error);
      // toast.error("Delete Failed", "Failed to delete campaign.");
    }
  }, [campaignData, toast]);

  return {
    campaignData,
    isLoading,
    actions: {
      saveCampaign,
      toggleStatus,
      deleteCampaign,
    },
  };
};
