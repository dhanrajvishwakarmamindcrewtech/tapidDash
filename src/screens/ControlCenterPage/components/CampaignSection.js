import React from "react";
import CampaignCard from "./CampaignCard";
import TopCustomersCard from "./TopCustomersCard";
import SystemsReportCard from "./SystemsReportCard";
import EmptyState from "./EmptyState";
import { UI_CONFIG } from "../config/uiConfig";
import styles from "../LaunchPadPage.module.css";
import DonutChart from "./DonutChart";

const CampaignSection = ({
  campaign,
  topCustomers,
  onCreate,
  onEdit,
  onDelete,
  onToggleStatus,
  data,
  hasCampaign,
  onNudgeUsers,
}) => {
  return (
    <>
      {/* Section Title */}
      <div
        style={{
          fontSize: "1.5rem",
          fontWeight: 600,
          color: "#232428",
          margin: "0 0 1.2rem 0",
          textAlign: "left",
        }}
      >
        {UI_CONFIG.sections.myCampaign}
      </div>

      {/* Campaign and Market Row */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "2.2rem",
          // marginBottom: "2.2rem",
          alignItems: "stretch",
          justifyContent: "center",
        }}
      >
        {campaign ? (
          <CampaignCard
            campaign={campaign}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleStatus={onToggleStatus}
          />
        ) : (
          <EmptyState onCreate={onCreate} />
        )}

        {/* <TopCustomersCard customers={topCustomers} /> */}
        {/* Donut Chart Section */}
        {/* {data.topCustomers && data.topCustomers.length > 0 && ( */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "2.2rem",
            // marginBottom: "2.2rem",
            alignItems: "stretch",
            justifyContent: "center",
          }}
        >
          <DonutChart customers={data.topCustomers} />
        </div>
        {/* )} */}
        {/* <SystemsReportCard /> */}
      </div>
    </>
  );
};

export default CampaignSection;
