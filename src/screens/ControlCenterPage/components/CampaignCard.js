import React, { useState } from "react";
import { Settings } from "lucide-react";
import styles from "../LaunchPadPage.module.css";

const CampaignCard = ({ campaign, onEdit, onDelete, onToggleStatus }) => {
  const [showActionsMenu, setShowActionsMenu] = useState(false);

  if (!campaign) return null;

  return (
    <div
      className={styles.infoCard}
      style={{
        flex: 1,
        // maxWidth: "600px",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        minHeight: "320px",
        maxHeight: "442px",
        background: "linear-gradient(135deg, #f8f9fb 0%, #e6fcf5 100%)",
        border: "2px dashed #d1d5db",
        // maxWidth: "700px",
      }}
    >
      {/* Actions Menu */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: "10px",
          position: "absolute",
          top: "18px",
          right: "18px",
          zIndex: 2,
        }}
      >
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowActionsMenu(!showActionsMenu)}
            title="Actions"
            style={{
              background: "#f4f6f8",
              border: "1px solid #e9ecef",
              cursor: "pointer",
              color: "#008A9B",
              padding: "6px 10px",
              borderRadius: "10px",
              fontWeight: 700,
              fontSize: "0.9rem",
              marginTop: "0.5rem",
            }}
          >
            <Settings size={16} style={{ verticalAlign: "middle" }} />
          </button>

          {showActionsMenu && (
            <div
              style={{
                position: "absolute",
                top: "110%",
                right: 0,
                background: "#fff",
                border: "1px solid #ececec",
                boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
                borderRadius: "10px",
                minWidth: "160px",
                zIndex: 3,
              }}
            >
              <button
                onClick={() => {
                  setShowActionsMenu(false);
                  onEdit();
                }}
                style={{
                  background: "none",
                  border: "none",
                  width: "100%",
                  textAlign: "left",
                  padding: "10px 12px",
                  cursor: "pointer",
                  color: "#232428",
                }}
              >
                Edit
              </button>
              <button
                onClick={() => {
                  setShowActionsMenu(false);
                  onToggleStatus();
                }}
                style={{
                  background: "none",
                  border: "none",
                  width: "100%",
                  textAlign: "left",
                  padding: "10px 12px",
                  cursor: "pointer",
                  color: "#232428",
                }}
              >
                {campaign.isActive ? "Pause" : "Resume"}
              </button>
              <button
                onClick={() => {
                  setShowActionsMenu(false);
                  onDelete();
                }}
                style={{
                  background: "none",
                  border: "none",
                  width: "100%",
                  textAlign: "left",
                  padding: "10px 12px",
                  cursor: "pointer",
                  color: "#e03131",
                }}
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Card Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "18px",
        }}
      >
        <div className={styles.cardHeader}>My Campaign</div>
        <span
          className={styles.pillLabel}
          style={{
            marginRight: "2.5rem",
            marginTop: "-0.5rem",
            fontSize: "1rem",
          }}
        >
          {campaign.isActive ? "Active" : "Paused"}
        </span>
      </div>

      {/* Campaign Details */}
      <div
        style={{
          background: "#f8f9fb",
          borderRadius: "0.7rem",
          padding: "0.7rem 0.9rem",
          marginBottom: "14px",
          display: "flex",
          flexDirection: "column",
          gap: "2px",
        }}
      >
        <div
          style={{
            fontWeight: 700,
            fontSize: "1.22rem",
            color: "#232428",
            marginBottom: "2px",
          }}
        >
          {campaign.campaignName}
        </div>
        <div
          style={{
            color: "#008A9B",
            fontWeight: 600,
            fontSize: "1.01rem",
            marginBottom: "2px",
          }}
        >
          {campaign.rewardDescription}
        </div>
      </div>

      {/* Rewards List */}
      <div
        style={{
          borderTop: "1.5px solid #ececec",
          margin: "0 -1.2rem 1.1rem -1.2rem",
        }}
      />
      <ul
        style={{
          paddingLeft: 0,
          margin: 0,
          listStyle: "none",
          color: "#232428",
          fontWeight: 500,
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          fontSize: "0.95rem",
        }}
      >
        {Object.keys(campaign.rewards || {})
          .sort(
            (a, b) =>
              parseInt(a.replace("tier", ""), 10) -
              parseInt(b.replace("tier", ""), 10)
          )
          .map((key, idx) => {
            const tier = campaign.rewards[key];
            return (
              <li
                key={key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <span
                  style={{
                    background: "#e6fcf5",
                    color: "#008A9B",
                    borderRadius: "999px",
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    padding: "4px 10px",
                    marginRight: "8px",
                    boxShadow: "0 1px 4px rgba(0,138,155,0.06)",
                  }}
                >
                  Tier {idx + 1}
                </span>
                <span
                  style={{
                    fontWeight: 500,
                    color: "#444",
                    fontSize: "0.95rem",
                  }}
                >
                  {tier.rewardText}
                </span>
                <span
                  className={styles.tierPoints}
                  style={{
                    marginLeft: "auto",
                    fontSize: "0.9rem",
                  }}
                >
                  {tier.points} pts
                </span>
              </li>
            );
          })}
      </ul>
    </div>
  );
};

export default CampaignCard;
