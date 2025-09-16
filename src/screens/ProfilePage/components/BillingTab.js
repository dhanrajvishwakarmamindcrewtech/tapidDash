import React from "react";
import { CreditCard, MapPin, Calendar, Building } from "lucide-react";
import { formatDate } from "../utils/profileUtils";
import styles from "../ProfilePage.module.css";

const BillingTab = ({ businessData, billingData }) => {
  return (
    <div className={styles.tabContent}>
      <div className={styles.billingOverview}>
        <h3>Billing Overview</h3>

        {billingData ? (
          <div className={styles.billingGrid}>
            {/* Current Plan Card */}
            <div className={styles.billingCard}>
              <div className={styles.cardHeader}>
                <CreditCard size={24} />
                <div>
                  <h4>Current Plan</h4>
                  <span className={styles.planBadge}>
                    {businessData?.subscription?.plan?.toUpperCase() || "FREE"}
                  </span>
                </div>
              </div>

              <div className={styles.billingDetails}>
                <div className={styles.billingItem}>
                  <span>Billing Cycle</span>
                  <strong>
                    {businessData?.subscription?.billingCycle || "N/A"}
                  </strong>
                </div>
                <div className={styles.billingItem}>
                  <span>Payment Method</span>
                  <strong>
                    {businessData?.subscription?.paymentMethod || "N/A"}
                  </strong>
                </div>
                <div className={styles.billingItem}>
                  <span>Card Name</span>
                  <strong>
                    {billingData?.billingDetails?.cardName || "N/A"}
                  </strong>
                </div>
                <div className={styles.billingItem}>
                  <span>Last Updated</span>
                  <strong>{formatDate(billingData?.lastUpdated)}</strong>
                </div>
              </div>
            </div>

            {/* Billing Address Card */}
            <div className={styles.billingCard}>
              <div className={styles.cardHeader}>
                <MapPin size={24} />
                <div>
                  <h4>Billing Address</h4>
                </div>
              </div>

              <div className={styles.addressDetails}>
                <p>{billingData?.billingDetails?.billingAddress}</p>
                <p>{billingData?.billingDetails?.city}</p>
                <p>{billingData?.billingDetails?.postalCode}</p>
                <p>{billingData?.billingDetails?.country}</p>
              </div>
            </div>

            {/* Payment History Card */}
            <div className={styles.billingCard}>
              <div className={styles.cardHeader}>
                <Calendar size={24} />
                <div>
                  <h4>Payment History</h4>
                </div>
              </div>

              <div className={styles.paymentHistory}>
                <p>No payment history available</p>
                <small>Upgrade to a paid plan to see payment history</small>
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.noBillingCard}>
            <CreditCard size={48} />
            <p>No billing information available</p>
            <button className={styles.setupBillingBtn}>Setup Billing</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BillingTab;
