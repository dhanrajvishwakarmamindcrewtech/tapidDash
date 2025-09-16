import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase/config";

class FirebaseService {
  constructor() {
    this.campaignsCollection = "campaigns";
    this.businessCollection = "businesses";
  }

  // Generic CRUD operations
  async getCollection(collectionName) {
    try {
      const querySnapshot = await getDocs(collection(db, collectionName));
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error(`Error fetching ${collectionName}:`, error);
      throw error;
    }
  }

  async getDocument(collectionName, docId) {
    try {
      const docRef = doc(db, collectionName, docId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        return null;
      }
    } catch (error) {
      console.error(`Error fetching document:`, error);
      throw error;
    }
  }

  async addDocument(collectionName, data) {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      return docRef.id;
    } catch (error) {
      console.error(`Error adding document:`, error);
      throw error;
    }
  }

  async updateDocument(collectionName, docId, data) {
    try {
      const docRef = doc(db, collectionName, docId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date().toISOString(),
      });
      return true;
    } catch (error) {
      console.error(`Error updating document:`, error);
      throw error;
    }
  }

  async deleteDocument(collectionName, docId) {
    try {
      await deleteDoc(doc(db, collectionName, docId));
      return true;
    } catch (error) {
      console.error(`Error deleting document:`, error);
      throw error;
    }
  }

  // Campaign-specific methods
  async getCampaigns(businessId) {
    try {
      // Reference to the business document
      const businessDocRef = doc(db, "businesses", businessId);
      // Reference to the 'campaigns' subcollection inside the business document
      const campaignsCollectionRef = collection(businessDocRef, "campaigns");

      // Get all campaigns from the subcollection
      const querySnapshot = await getDocs(campaignsCollectionRef);

      const campaigns = [];
      querySnapshot.forEach((doc) => {
        campaigns.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return campaigns.length ? campaigns[0] : null;
    } catch (error) {
      console.error("Error getting campaigns:", error);
      throw error;
    }
  }

  async addCampaign(businessId, campaignType, campaignData) {
    try {
      const campaign = {
        ...campaignData,
        businessId,
        type: campaignType,
        isActive: campaignData.isActive || false,
        //   notifications: campaignData.notifications || true,
        //   performance: campaignData.performance || { sent: 0, redeemed: 0, remaining: 0 },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Reference to the business document
      const businessDocRef = doc(db, "businesses", businessId);
      // Reference to the 'campaigns' subcollection inside the business document
      const campaignsCollectionRef = collection(businessDocRef, "campaigns");

      // Add campaign to the subcollection
      const docRef = await addDoc(campaignsCollectionRef, campaign);

      return { id: docRef.id, ...campaign };
    } catch (error) {
      console.error("Error adding campaign:", error);
      throw error;
    }
  }

  async updateCampaign(campaignId, updates) {
    try {
      await this.updateDocument(this.campaignsCollection, campaignId, updates);
      return true;
    } catch (error) {
      console.error("Error updating campaign:", error);
      throw error;
    }
  }

  async deleteCampaign(campaignId) {
    try {
      return await this.deleteDocument(this.campaignsCollection, campaignId);
    } catch (error) {
      console.error("Error deleting campaign:", error);
      throw error;
    }
  }

  // Real-time listener for campaigns
  subscribeToCampaigns(businessId, callback) {
    const q = query(
      collection(db, this.campaignsCollection),
      where("businessId", "==", businessId),
      orderBy("createdAt", "desc")
    );

    return onSnapshot(q, (querySnapshot) => {
      const campaigns = {
        primaryRewards: [],
        flashPromotions: [],
        recurringPromotions: [],
        groupRewards: [],
        targetedCampaigns: [],
        nudgeCampaigns: [],
      };

      querySnapshot.docs.forEach((doc) => {
        const campaign = { id: doc.id, ...doc.data() };
        const type = this.mapCampaignType(campaign.type);
        if (campaigns[type]) {
          campaigns[type].push(campaign);
        }
      });

      callback(campaigns);
    });
  }

  // Helper method to map campaign types
  mapCampaignType(type) {
    const typeMapping = {
      primary: "primaryRewards",
      stamps: "primaryRewards",
      points: "primaryRewards",
      cashback: "primaryRewards",
      flash: "flashPromotions",
      recurring: "recurringPromotions",
      targeted: "targetedCampaigns",
      nudge: "nudgeCampaigns",
      group: "groupRewards",
    };
    return typeMapping[type] || "primaryRewards";
  }
}

export const firebaseService = new FirebaseService();
export default FirebaseService;
