import { useState, useEffect } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../../../firebase/config";
import { useToast } from "../../../components/ToastSystem";
import safeStorage from "../../../utils/safeStorage";

export const useCustomerStats = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCustomerStats = async () => {
      try {
        const txRef = collection(db, "userTransactions");
        const snapshot = await getDocs(txRef);
        const businessData = safeStorage.getItem("businessData", {}).data;
        const matchedTransactions = [];
        const transactionsData = await Promise.all(
          snapshot.docs.map(async (txDoc) => {
            const baseData = { id: txDoc.id, ...txDoc.data() };

            // Get points data
            const pointsRef = collection(
              doc(db, "userTransactions", txDoc.id),
              "points"
            );
            const pointsSnap = await getDocs(pointsRef);
            const points = pointsSnap.docs[0]?.exists()
              ? { id: pointsSnap.docs[0].id, ...pointsSnap.docs[0].data() }
              : null;

            // Get user details
            let user = null;
            if (baseData.userId) {
              const userRef = doc(db, "users", baseData.userId);
              const userSnap = await getDoc(userRef);
              if (userSnap.exists()) {
                user = { id: userSnap.id, ...userSnap.data() };
              }
            }

            // Get matched transactions
            const accountsRef = collection(
              doc(db, "userTransactions", txDoc.id),
              "accounts"
            );
            const accountsSnap = await getDocs(accountsRef);
            const matchTransactionsArr = [];
            await Promise.all(
              accountsSnap.docs.map(async (accountDoc) => {
                const mtRef = collection(
                  doc(
                    db,
                    "userTransactions",
                    txDoc.id,
                    "accounts",
                    accountDoc.id
                  ),
                  "matchTransactions"
                );
                const mtSnap = await getDocs(mtRef);

                mtSnap.docs.forEach((mtDoc) => {
                  const mtData = mtDoc.data();
                  if (mtData.matchedMerchant === businessData?.businessName) {
                    matchedTransactions.push({
                      userId: baseData.userId, // link to user
                      accountId: accountDoc.id,
                      id: mtDoc.id,
                      ...mtData,
                      points: baseData.points?.totalPointsLeft || 0, // attach points
                      userDetails: baseData.userDetails || null, // attach user
                    });
                    matchTransactionsArr.push({
                      ...mtDoc.data(),
                      id: mtDoc.id,
                      accountId: accountDoc.id,
                    });
                  }
                });
              })
            );

            return {
              ...baseData,
              points,
              userDetails: user,
              matchTransactions: matchTransactionsArr,
            };
          })
        );

        // Calculate statistics
        const totalCustomers = new Set(
          matchedTransactions.map((tx) => tx.userId)
        ).size;
        const totalRevenue = matchedTransactions.reduce(
          (sum, tx) => sum + Math.abs(Number(tx.numericAmount) || 0),
          0
        );
        const totalTransactions = matchedTransactions.length;
        const avgOrderValue =
          totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
        // console.log(transactionsData, "matchedTransactions");

        // Get top customers
        const topCustomers = transactionsData
          .map((tx) => {
            if (
              tx.userDetails?.fullName &&
              Array.isArray(tx.matchTransactions) &&
              tx.matchTransactions.length > 0
            ) {
              // Sum all numericAmount for matched transactions
              const totalAmount = tx.matchTransactions.reduce(
                (sum, mt) => sum + Math.abs(Number(mt.numericAmount) || 0),
                0
              );
              return {
                userName: tx.userDetails.fullName,
                points: Number(totalAmount), // Use 'amount' for chart
              };
            }
            return null;
          })
          .filter(Boolean)
          .sort((a, b) => b.points - a.points)
          .slice(0, 10);

        setData({
          totalCustomers,
          totalRevenue: Number(totalRevenue.toFixed(2)),
          totalTransactions,
          avgOrderValue: Number(avgOrderValue.toFixed(2)),
          topCustomers,
        });
      } catch (error) {
        console.error("Error fetching customer stats:", error);
        toast.error(
          "Data Loading Error",
          "Failed to load customer statistics."
        );
        setData({
          totalCustomers: 0,
          totalRevenue: 0,
          totalTransactions: 0,
          avgOrderValue: 0,
          topCustomers: [],
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomerStats();
  }, [toast]);

  return { data, isLoading };
};
