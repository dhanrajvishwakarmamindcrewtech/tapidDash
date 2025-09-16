import React from "react";
import { Users, Trophy, Star } from "lucide-react";
import { formatNumber } from "../utils/formatters";
import styles from "../LaunchPadPage.module.css";

const TopCustomersCard = ({ customers }) => {
  if (!customers || customers.length === 0) {
    return (
      <div
        className={styles.infoCard}
        style={{
          flex: "0 0 300px",
          minHeight: "320px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div className={styles.cardHeader} style={{ marginBottom: "20px" }}>
          <Users size={20} style={{ marginRight: "8px" }} />
          Top Customers
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            color: "#666",
            textAlign: "center",
          }}
        >
          <Users size={48} color="#e0e0e0" style={{ marginBottom: "16px" }} />
          <div style={{ fontSize: "1rem", fontWeight: 500 }}>
            No customer data available
          </div>
          <div style={{ fontSize: "0.9rem", marginTop: "8px" }}>
            Customer data will appear here once transactions are processed
          </div>
        </div>
      </div>
    );
  }

  const topCustomers = customers.slice(0, 10);

  return (
    <div
      className={styles.infoCard}
      style={{
        flex: "0 0 300px",
        minHeight: "320px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <div
          className={styles.cardHeader}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Trophy size={20} color="#008A9B" />
          Top Customers
        </div>
        <span
          style={{
            background: "#e6fcf5",
            color: "#008A9B",
            padding: "4px 8px",
            borderRadius: "12px",
            fontSize: "0.8rem",
            fontWeight: 600,
          }}
        >
          {topCustomers.length} users
        </span>
      </div>

      {/* Customers List */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          maxHeight: "250px",
          overflowY: "auto",
          paddingRight: "4px",
        }}
      >
        {topCustomers.map((customer, idx) => (
          <div
            key={idx}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 16px",
              background: idx < 3 ? "#f8f9fb" : "#fff",
              border: idx < 3 ? "2px solid #e6fcf5" : "1px solid #f0f0f0",
              borderRadius: "10px",
              transition: "all 0.2s ease",
            }}
          >
            {/* Rank and Name */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                flex: 1,
              }}
            >
              {/* Rank Badge */}
              <div
                style={{
                  background: idx < 3 ? "#008A9B" : "#f0f0f0",
                  color: idx < 3 ? "#fff" : "#666",
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  minWidth: "24px",
                }}
              >
                {idx + 1}
              </div>

              {/* Customer Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontWeight: 600,
                    color: "#232428",
                    fontSize: "0.9rem",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {customer.userName}
                </div>
                <div
                  style={{
                    color: "#008A9B",
                    fontSize: "0.8rem",
                    fontWeight: 500,
                  }}
                >
                  {formatNumber(customer.points)} pts
                </div>
              </div>

              {/* Top 3 Star */}
              {idx < 3 && (
                <Star
                  size={16}
                  color="#ffd700"
                  fill="#ffd700"
                  style={{ flexShrink: 0 }}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      {customers.length > 10 && (
        <div
          style={{
            marginTop: "16px",
            padding: "12px 0",
            borderTop: "1px solid #e9ecef",
            textAlign: "center",
            color: "#666",
            fontSize: "0.85rem",
          }}
        >
          Showing top 10 of {customers.length} customers
        </div>
      )}
    </div>
  );
};

export default TopCustomersCard;
