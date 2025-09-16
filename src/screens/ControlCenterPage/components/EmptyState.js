import React from "react";
import { Plus, Sparkles, Gift, Target } from "lucide-react";
import styles from "../LaunchPadPage.module.css";

const EmptyState = ({ onCreate }) => {
  const benefits = [
    {
      icon: <Gift size={20} />,
      title: "Reward Loyal Customers",
      description: "Create point-based rewards to increase customer retention",
    },
    {
      icon: <Target size={20} />,
      title: "Drive Repeat Business",
      description: "Encourage customers to return with tiered incentives",
    },
    {
      icon: <Sparkles size={20} />,
      title: "Boost Revenue",
      description: "Increase average order value through reward programs",
    },
  ];

  return (
    <div
      className={styles.infoCard}
      style={{
        flex: 1,
        maxWidth: "auto",
        minHeight: "320px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        // maxHeight: "442px",
        padding: "2rem",
        background: "linear-gradient(135deg, #f8f9fb 0%, #e6fcf5 100%)",
        border: "2px dashed #d1d5db",
        // maxHeight: "442px",
      }}
    >
      {/* Icon */}
      <div
        style={{
          background: "linear-gradient(135deg, #008A9B 0%, #00a8bd 100%)",
          padding: "20px",
          borderRadius: "50%",
          marginBottom: "24px",
          boxShadow: "0 8px 32px rgba(0, 138, 155, 0.2)",
        }}
      >
        <Plus size={32} color="#fff" />
      </div>

      {/* Main Message */}
      <h3
        style={{
          fontSize: "1.5rem",
          fontWeight: 700,
          color: "#232428",
          marginBottom: "12px",
          margin: 0,
        }}
      >
        Create Your First Campaign
      </h3>

      <p
        style={{
          color: "#666",
          fontSize: "1rem",
          marginBottom: "32px",
          lineHeight: 1.5,
          maxWidth: "400px",
        }}
      >
        Launch a loyalty rewards program to engage customers and boost repeat
        business. Start building stronger customer relationships today.
      </p>

      {/* Benefits */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px",
          marginBottom: "32px",
          width: "100%",
        }}
      >
        {benefits.map((benefit, idx) => (
          <div
            key={idx}
            style={{
              background: "#fff",
              padding: "16px",
              borderRadius: "12px",
              border: "1px solid #e9ecef",
              textAlign: "center",
            }}
          >
            <div
              style={{
                background: "#e6fcf5",
                display: "inline-flex",
                padding: "8px",
                borderRadius: "8px",
                marginBottom: "12px",
                color: "#008A9B",
              }}
            >
              {benefit.icon}
            </div>
            <h4
              style={{
                fontSize: "0.95rem",
                fontWeight: 600,
                color: "#232428",
                marginBottom: "8px",
                margin: 0,
              }}
            >
              {benefit.title}
            </h4>
            <p
              style={{
                fontSize: "0.85rem",
                color: "#666",
                lineHeight: 1.4,
                margin: 0,
              }}
            >
              {benefit.description}
            </p>
          </div>
        ))}
      </div>

      {/* CTA Button */}
      <button
        onClick={onCreate}
        style={{
          background: "linear-gradient(135deg, #008A9B 0%, #00a8bd 100%)",
          color: "#fff",
          border: "none",
          borderRadius: "12px",
          padding: "14px 28px",
          fontSize: "1rem",
          fontWeight: 600,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          boxShadow: "0 4px 16px rgba(0, 138, 155, 0.3)",
          transition: "all 0.2s ease",
          transform: "translateY(0)",
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = "translateY(-2px)";
          e.target.style.boxShadow = "0 6px 20px rgba(0, 138, 155, 0.4)";
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = "translateY(0)";
          e.target.style.boxShadow = "0 4px 16px rgba(0, 138, 155, 0.3)";
        }}
      >
        <Plus size={20} />
        Create Campaign
      </button>

      {/* Help Text */}
      <div
        style={{
          marginTop: "24px",
          fontSize: "0.85rem",
          color: "#999",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        <Sparkles size={14} />
        Takes less than 5 minutes to set up
      </div>
    </div>
  );
};

export default EmptyState;
