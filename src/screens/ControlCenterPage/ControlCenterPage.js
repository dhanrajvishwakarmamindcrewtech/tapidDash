import React, { useMemo, useCallback } from "react";
import { useCampaignData } from "./hooks/useCampaignData";
import { useModalManager } from "./hooks/useModalManager";
import { useCustomerStats } from "./hooks/useCustomerStats";
import KPIGrid from "./components/KPIGrid";
import CampaignSection from "./components/CampaignSection";
import PerformanceGrid from "./components/PerformanceGrid";
import CreateCampaignModal from "./components/CreateCampaignModal";
import ConfirmationModal from "./components/ConfirmationModal";
import NudgeModal from "./components/NudgeModal";
import LoadingSpinner from "./components/LoadingSpinner";
import { UI_CONFIG } from "./config/uiConfig";
import { formatKPIData } from "./utils/formatters";
import styles from "./LaunchPadPage.module.css";

const ControlCenterPage = () => {
  // Custom hooks for data management
  const customerStats = useCustomerStats();
  const {
    campaignData,
    isLoading: campaignLoading,
    actions: campaignActions,
  } = useCampaignData();

  const { modalState, openModal, closeModal, openConfirmation } =
    useModalManager();

  // Memoized computations
  const kpiData = useMemo(() => {
    return customerStats.data ? formatKPIData(customerStats.data) : [];
  }, [customerStats.data]);

  const isLoading = campaignLoading || customerStats.isLoading;

  // Event handlers
  const handleCreateCampaign = useCallback(() => {
    openModal("create");
  }, [openModal]);

  const handleEditCampaign = useCallback(() => {
    openModal("edit");
  }, [openModal]);

  const handleDeleteCampaign = useCallback(() => {
    openConfirmation({
      title: "Delete Campaign?",
      message:
        "Are you sure you want to delete your current rewards program? This cannot be undone.",
      onConfirm: campaignActions.deleteCampaign,
      variant: "danger",
    });
  }, [openConfirmation, campaignActions.deleteCampaign]);

  const handleSaveCampaign = useCallback(
    async (campaignData) => {
      const isEdit = modalState.type === "edit";
      await campaignActions.saveCampaign(campaignData, isEdit);
      closeModal();
    },
    [modalState.type, campaignActions.saveCampaign, closeModal]
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.welcomeHeader}>
        <div className={styles.welcomeContent}>
          <div className={styles.greetingSection}>
            <h1 className={styles.greetingMain}>{UI_CONFIG.pageTitle}</h1>
            <p className={styles.greetingPill}>{UI_CONFIG.pageSubtitle}</p>
          </div>
        </div>
      </header>

      {/* KPI Grid */}
      <KPIGrid kpis={kpiData} isLoading={customerStats.isLoading} />

      {/* Campaign Management Section */}
      <CampaignSection
        campaign={campaignData}
        topCustomers={customerStats.data?.topCustomers}
        onCreate={handleCreateCampaign}
        onEdit={handleEditCampaign}
        onDelete={handleDeleteCampaign}
        onToggleStatus={campaignActions.toggleStatus}
        data={customerStats.data}
        hasCampaign={!!campaignData}
        onNudgeUsers={() => openModal("nudge")}
      />

      {/* Performance Analytics */}
      <PerformanceGrid
        data={customerStats.data}
        hasCampaign={!!campaignData}
        onNudgeUsers={() => openModal("nudge")}
      />

      {/* Modals */}
      <CreateCampaignModal
        isOpen={
          modalState.isOpen && ["create", "edit"].includes(modalState.type)
        }
        editData={modalState.type === "edit" ? campaignData : null}
        onSave={handleSaveCampaign}
        onClose={closeModal}
      />

      <ConfirmationModal
        isOpen={modalState.isOpen && modalState.type === "confirmation"}
        config={modalState.confirmationConfig}
        onClose={closeModal}
      />

      <NudgeModal
        isOpen={modalState.isOpen && modalState.type === "nudge"}
        onClose={closeModal}
      />
    </div>
  );
};

export default ControlCenterPage;
