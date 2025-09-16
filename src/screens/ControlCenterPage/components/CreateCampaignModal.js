import React, { useState, useEffect, useMemo, useCallback } from "react";
import ReactDOM from "react-dom";
import {
  Plus,
  X,
  Info,
  Sparkles,
  Loader,
  Target,
  Award,
  TrendingUp,
  Users,
  Gift,
  Coffee,
  Utensils,
  DollarSign,
} from "lucide-react";
import styles from "../LaunchPadPage.module.css";

// Fixed validation function
const validateForm = (form, tiers) => {
  const errors = {};
  const tierErrors = [];

  if (!form.campaignName?.trim()) {
    errors.campaignName = "Campaign name is required";
  } else if (form.campaignName.trim().length < 3) {
    errors.campaignName = "Campaign name must be at least 3 characters";
  }

  if (!form.rewardDescription?.trim()) {
    errors.rewardDescription = "Reward description is required";
  } else if (form.rewardDescription.trim().length < 5) {
    errors.rewardDescription = "Description must be at least 5 characters";
  }

  tiers.forEach((tier, index) => {
    let tierError = null;
    if (!tier.rewardText?.trim()) {
      tierError = `Tier ${index + 1} reward description is required.`;
    }
    const points = parseInt(tier.points);
    if (!tier.points || isNaN(points) || points < 1) {
      tierError =
        (tierError ? tierError + " " : "") +
        `Tier ${index + 1} must have at least 1 point.`;
    }
    tierErrors.push(tierError);
  });

  return {
    errors,
    tierErrors,
    isValid: Object.keys(errors).length === 0 && !tierErrors.some(Boolean),
  };
};

const CreateCampaignModal = ({ isOpen, editData, onSave, onClose }) => {
  const [form, setForm] = useState({
    campaignName: "",
    rewardDescription: "",
  });

  const [tiers, setTiers] = useState([
    { rewardText: "", points: 500, icon: "coffee" },
    { rewardText: "", points: 1000, icon: "utensils" },
    { rewardText: "", points: 2000, icon: "gift" },
  ]);

  const [activeStage, setActiveStage] = useState(0);
  const [showInfo, setShowInfo] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [touched, setTouched] = useState({});

  // Detect device type for responsive behavior
  const [deviceType, setDeviceType] = useState("desktop");
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // Responsive detection
  useEffect(() => {
    const checkDeviceType = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isTouchDevice =
        "ontouchstart" in window || navigator.maxTouchPoints > 0;

      if (width <= 480) {
        setDeviceType("mobile");
        setIsMobile(true);
        setIsTablet(false);
      } else if (width <= 768 || (width <= 1024 && isTouchDevice)) {
        setDeviceType("tablet");
        setIsMobile(false);
        setIsTablet(true);
      } else {
        setDeviceType("desktop");
        setIsMobile(false);
        setIsTablet(false);
      }
    };

    checkDeviceType();
    window.addEventListener("resize", checkDeviceType);
    window.addEventListener("orientationchange", checkDeviceType);

    return () => {
      window.removeEventListener("resize", checkDeviceType);
      window.removeEventListener("orientationchange", checkDeviceType);
    };
  }, []);

  const tierIcons = {
    coffee: <Coffee size={isMobile ? 14 : 16} />,
    utensils: <Utensils size={isMobile ? 14 : 16} />,
    gift: <Gift size={isMobile ? 14 : 16} />,
    award: <Award size={isMobile ? 14 : 16} />,
    dollar: <DollarSign size={isMobile ? 14 : 16} />,
  };

  // Prevent body scroll and handle responsive padding
  useEffect(() => {
    if (isOpen) {
      const scrollBarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      if (scrollBarWidth > 0 && !isMobile) {
        document.body.style.paddingRight = `${scrollBarWidth}px`;
      }
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [isOpen, isMobile]);

  // Initialize form for editing
  useEffect(() => {
    if (editData && isOpen) {
      setForm({
        campaignName: editData.campaignName || "",
        rewardDescription: editData.rewardDescription || "",
      });

      if (editData.rewards) {
        const editTiers = Object.keys(editData.rewards)
          .sort(
            (a, b) =>
              parseInt(a.replace("tier", ""), 10) -
              parseInt(b.replace("tier", ""), 10)
          )
          .map((key, idx) => ({
            rewardText: editData.rewards[key].rewardText || "",
            points: editData.rewards[key].points || 0,
            icon:
              editData.rewards[key].icon ||
              ["coffee", "utensils", "gift", "award", "dollar"][idx] ||
              "gift",
          }));
        setTiers(editTiers.length > 0 ? editTiers : tiers);
      }
    } else if (isOpen && !editData) {
      setForm({ campaignName: "", rewardDescription: "" });
      setTiers([
        { rewardText: "", points: 500, icon: "coffee" },
        { rewardText: "", points: 1000, icon: "utensils" },
        { rewardText: "", points: 2000, icon: "gift" },
      ]);
      setActiveStage(0);
      setShowInfo(true);
    }
    setTouched({});
    setSaveLoading(false);
  }, [editData, isOpen]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  }, []);

  const handleAutoGen = useCallback(() => {
    const template = {
      campaignName: "Coffee Lovers Loyalty 2025",
      rewardDescription: "Premium coffee rewards for loyal customers",
      tiers: [
        { rewardText: "Free Espresso Shot", points: 300, icon: "coffee" },
        { rewardText: "Free Coffee & Pastry", points: 800, icon: "utensils" },
        { rewardText: "€15 Gift Card", points: 1500, icon: "gift" },
      ],
    };

    setForm({
      campaignName: template.campaignName,
      rewardDescription: template.rewardDescription,
    });
    setTiers(template.tiers);
    setShowInfo(false);
  }, []);

  const updateTier = useCallback(
    (index, field, value) => {
      const newTiers = [...tiers];
      newTiers[index] = { ...newTiers[index], [field]: value };

      if (field === "points") {
        const numValue = value === "" ? "" : parseInt(value, 10);
        if (!isNaN(numValue) || value === "") {
          newTiers[index].points = numValue;
        }
      }

      setTiers(newTiers);
    },
    [tiers]
  );

  const addTier = useCallback(() => {
    if (tiers.length < 5) {
      const lastPoints = tiers[tiers.length - 1]?.points || 0;
      const newTiers = [
        ...tiers,
        {
          rewardText: "",
          points: lastPoints + 500,
          icon:
            ["coffee", "utensils", "gift", "award", "dollar"][tiers.length] ||
            "gift",
        },
      ];
      setTiers(newTiers);
      setActiveStage(newTiers.length - 1);
    }
  }, [tiers]);

  const removeTier = useCallback(
    (index) => {
      if (tiers.length > 1) {
        const newTiers = tiers.filter((_, i) => i !== index);
        setTiers(newTiers);
        if (activeStage >= newTiers.length) {
          setActiveStage(newTiers.length - 1);
        }
      }
    },
    [tiers, activeStage]
  );

  const validation = useMemo(() => validateForm(form, tiers), [form, tiers]);
  const { errors, tierErrors, isValid } = validation;

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      setTouched({
        campaignName: true,
        rewardDescription: true,
      });

      if (!isValid) return;

      setSaveLoading(true);

      try {
        const campaignData = {
          ...form,
          rewards: tiers.reduce((acc, tier, idx) => {
            acc[`tier${idx + 1}`] = {
              rewardText: tier.rewardText.trim(),
              points: parseInt(tier.points) || 0,
              icon: tier.icon,
            };
            return acc;
          }, {}),
          isActive: editData?.isActive ?? true,
          createdAt: editData?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ...(editData?.id && { id: editData.id }),
        };

        await onSave(campaignData);
      } catch (error) {
        console.error("Failed to save campaign:", error);
      } finally {
        setSaveLoading(false);
      }
    },
    [form, tiers, editData, onSave, isValid]
  );

  // Enhanced keyboard handling for different devices
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        onClose();
      }
      // Only allow Ctrl+Enter on non-mobile devices
      else if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && !isMobile) {
        handleSubmit(e);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, handleSubmit, isMobile]);

  if (!isOpen) return null;

  // Responsive styles based on device type
  const getResponsiveStyles = () => {
    const baseStyles = {
      overlay: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        backdropFilter: isMobile ? "none" : "blur(4px)", // Skip blur on mobile for performance
        zIndex: 9999,
        display: "flex",
        alignItems: isMobile ? "flex-start" : "center",
        justifyContent: "center",
        overflowY: "auto",
        WebkitOverflowScrolling: "touch", // Smooth scrolling on iOS
      },
      modal: {
        background: "#fff",
        borderRadius: isMobile ? "20px 20px 0 0" : "16px",
        width: "100%",
        position: "relative",
        margin: isMobile ? "0" : "auto",
        display: "flex",
        flexDirection: "column",
        boxShadow: isMobile
          ? "0 -10px 30px rgba(0, 0, 0, 0.2)"
          : "0 25px 50px rgba(0, 0, 0, 0.25)",
      },
      formLayout: {
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        gap: isMobile ? "16px" : "24px",
      },
    };

    // Mobile specific styles
    if (isMobile) {
      return {
        ...baseStyles,
        modal: {
          ...baseStyles.modal,
          maxWidth: "100vw",
          maxHeight: "95vh",
          minHeight: "90vh",
          marginTop: "auto",
        },
      };
    }

    // Tablet specific styles
    if (isTablet) {
      return {
        ...baseStyles,
        modal: {
          ...baseStyles.modal,
          maxWidth: "90vw",
          maxHeight: "90vh",
          minWidth: "600px",
        },
      };
    }

    // Desktop styles
    return {
      ...baseStyles,
      modal: {
        ...baseStyles.modal,
        maxWidth: "1100px",
        maxHeight: "90vh",
        minHeight: "auto",
      },
    };
  };

  const responsiveStyles = getResponsiveStyles();

  return ReactDOM.createPortal(
    <div
      style={{
        ...responsiveStyles.overlay,
        padding: isMobile ? "0" : "20px",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isMobile) {
          onClose();
        }
      }}
    >
      <div style={responsiveStyles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Responsive Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: isMobile ? "16px 20px 12px" : "20px 24px 16px",
            borderBottom: "1px solid #e9ecef",
            background: "#fff",
            borderRadius: isMobile ? "20px 20px 0 0" : "16px 16px 0 0",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: isMobile ? "8px" : "12px",
            }}
          >
            <div
              style={{
                background: "linear-gradient(135deg, #008A9B, #00a8bd)",
                padding: isMobile ? "6px" : "8px",
                borderRadius: isMobile ? "8px" : "10px",
                color: "white",
              }}
            >
              <Target size={isMobile ? 16 : 20} />
            </div>
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: isMobile ? "1.2rem" : "1.4rem",
                  fontWeight: 700,
                  color: "#232428",
                }}
              >
                {editData ? "Edit Campaign" : "Create New Campaign"}
              </h2>
              <p
                style={{
                  margin: "4px 0 0 0",
                  color: "#666",
                  fontSize: isMobile ? "0.8rem" : "0.9rem",
                }}
              >
                Design your loyalty rewards program
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: "#f8f9fa",
              border: "1px solid #e9ecef",
              borderRadius: "8px",
              padding: isMobile ? "10px" : "8px",
              cursor: "pointer",
              transition: "all 0.2s ease",
              minWidth: isMobile ? "44px" : "auto",
              minHeight: isMobile ? "44px" : "auto",
            }}
          >
            <X size={isMobile ? 20 : 18} />
          </button>
        </div>

        {/* Scrollable content area */}
        <div
          style={{
            flex: 1,
            overflow: "auto",
            background: "#fff",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {/* Responsive Info Banner */}
          {showInfo && (
            <div
              style={{
                background: "linear-gradient(135deg, #e6fcf5 0%, #f0fdf4 100%)",
                border: "1px solid #a7f3d0",
                borderRadius: "12px",
                margin: isMobile ? "12px 16px" : "16px 24px",
                padding: isMobile ? "12px" : "16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: isMobile ? "8px" : "12px",
                    flex: 1,
                  }}
                >
                  <div
                    style={{
                      background: "#10b981",
                      padding: "6px",
                      borderRadius: "6px",
                      color: "white",
                      flexShrink: 0,
                    }}
                  >
                    <Info size={isMobile ? 14 : 16} />
                  </div>
                  <div>
                    <div
                      style={{
                        fontWeight: 700,
                        color: "#047857",
                        fontSize: isMobile ? "1rem" : "1.1rem",
                        marginBottom: 6,
                      }}
                    >
                      💡 Loyalty Campaign Best Practices
                    </div>
                    <div
                      style={{
                        fontSize: isMobile ? "0.85rem" : "0.95rem",
                        color: "#065f46",
                        lineHeight: 1.4,
                        marginBottom: 6,
                      }}
                    >
                      <strong>Point System:</strong> 10 pts per €1 spent • Set
                      milestone rewards
                    </div>
                    <div
                      style={{
                        fontSize: isMobile ? "0.85rem" : "0.95rem",
                        color: "#065f46",
                        lineHeight: 1.4,
                      }}
                    >
                      <strong>Pro Tip:</strong> Start with low-value rewards to
                      create early wins
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowInfo(false)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: isMobile ? "8px" : "4px",
                    color: "#047857",
                    borderRadius: "4px",
                    minWidth: isMobile ? "36px" : "auto",
                    minHeight: isMobile ? "36px" : "auto",
                  }}
                >
                  <X size={isMobile ? 18 : 16} />
                </button>
              </div>
            </div>
          )}

          {/* Responsive Form */}
          <form
            onSubmit={handleSubmit}
            style={{
              padding: isMobile ? "0 16px 16px" : "0 24px 24px",
              ...responsiveStyles.formLayout,
            }}
          >
            {/* Left Column */}
            <div style={{ flex: isMobile ? "1" : "1.2" }}>
              {/* Campaign Details */}
              <div
                style={{
                  background: "#f8f9fb",
                  border: "1px solid #e9ecef",
                  borderRadius: "12px",
                  padding: isMobile ? "16px" : "20px",
                  marginBottom: isMobile ? "16px" : "20px",
                }}
              >
                <h4
                  style={{
                    margin: "0 0 12px 0",
                    color: "#232428",
                    fontSize: isMobile ? "1rem" : "1.1rem",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <Target size={16} />
                  Campaign Details
                </h4>

                {/* Responsive Campaign Name */}
                <div style={{ marginBottom: "16px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      fontWeight: 600,
                      color: "#374151",
                      fontSize: isMobile ? "0.85rem" : "0.9rem",
                    }}
                  >
                    Campaign Name *
                  </label>
                  <input
                    name="campaignName"
                    type="text"
                    placeholder="e.g. Coffee Lovers Loyalty 2025"
                    value={form.campaignName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    style={{
                      width: "100%",
                      padding: isMobile ? "14px 16px" : "12px 16px",
                      border: `2px solid ${
                        errors.campaignName && touched.campaignName
                          ? "#e03131"
                          : "#e5e7eb"
                      }`,
                      borderRadius: "8px",
                      fontSize: isMobile ? "16px" : "1rem", // 16px prevents zoom on iOS
                      boxSizing: "border-box",
                      outline: "none",
                    }}
                    autoFocus={!isMobile} // Don't auto-focus on mobile to prevent keyboard pop-up
                  />
                  {errors.campaignName && touched.campaignName && (
                    <div
                      style={{
                        color: "#e03131",
                        fontSize: isMobile ? "0.75rem" : "0.8rem",
                        marginTop: "4px",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <X size={10} />
                      {errors.campaignName}
                    </div>
                  )}
                </div>

                {/* Responsive Reward Description */}
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      fontWeight: 600,
                      color: "#374151",
                      fontSize: isMobile ? "0.85rem" : "0.9rem",
                    }}
                  >
                    Reward Description *
                  </label>
                  <input
                    name="rewardDescription"
                    type="text"
                    placeholder="e.g. Premium coffee rewards"
                    value={form.rewardDescription}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    style={{
                      width: "100%",
                      padding: isMobile ? "14px 16px" : "12px 16px",
                      border: `2px solid ${
                        errors.rewardDescription && touched.rewardDescription
                          ? "#e03131"
                          : "#e5e7eb"
                      }`,
                      borderRadius: "8px",
                      fontSize: isMobile ? "16px" : "1rem",
                      boxSizing: "border-box",
                      outline: "none",
                    }}
                  />
                  {errors.rewardDescription && touched.rewardDescription && (
                    <div
                      style={{
                        color: "#e03131",
                        fontSize: isMobile ? "0.75rem" : "0.8rem",
                        marginTop: "4px",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <X size={10} />
                      {errors.rewardDescription}
                    </div>
                  )}
                </div>
              </div>

              {/* Responsive Tier Management */}
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #e9ecef",
                  borderRadius: "12px",
                  padding: isMobile ? "16px" : "20px",
                  marginBottom: isMobile ? "16px" : "20px",
                }}
              >
                <h4
                  style={{
                    margin: "0 0 12px 0",
                    color: "#232428",
                    fontSize: isMobile ? "1rem" : "1.1rem",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <Award size={16} />
                  Reward Tiers
                </h4>

                {/* Responsive Tier Navigation */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: isMobile ? "6px" : "8px",
                    marginBottom: "16px",
                    padding: isMobile ? "6px" : "8px",
                    background: "#f8f9fb",
                    borderRadius: "8px",
                    flexWrap: "wrap",
                    overflowX: isMobile ? "auto" : "visible",
                    WebkitOverflowScrolling: "touch",
                  }}
                >
                  {tiers.map((tier, i) => (
                    <div
                      key={i}
                      style={{
                        position: "relative",
                        flexShrink: 0,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setActiveStage(i)}
                        style={{
                          background:
                            activeStage === i
                              ? "linear-gradient(135deg, #008A9B, #00a8bd)"
                              : "#fff",
                          color: activeStage === i ? "#fff" : "#374151",
                          border:
                            activeStage === i ? "none" : "1px solid #e5e7eb",
                          borderRadius: "8px",
                          padding: isMobile ? "10px 12px" : "8px 12px",
                          cursor: "pointer",
                          fontSize: isMobile ? "0.8rem" : "0.85rem",
                          fontWeight: 600,
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          minHeight: isMobile ? "44px" : "auto",
                        }}
                      >
                        {tierIcons[tier.icon] || (
                          <Gift size={isMobile ? 12 : 14} />
                        )}
                        <span style={{ whiteSpace: "nowrap" }}>
                          Tier {i + 1}
                        </span>
                        {tier.points > 0 && !isMobile && (
                          <span
                            style={{
                              background:
                                activeStage === i
                                  ? "rgba(255,255,255,0.2)"
                                  : "#e5e7eb",
                              color: activeStage === i ? "#fff" : "#6b7280",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              fontSize: "0.7rem",
                              marginLeft: "4px",
                            }}
                          >
                            {tier.points}pts
                          </span>
                        )}
                      </button>

                      {i > 0 && tiers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTier(i)}
                          style={{
                            position: "absolute",
                            top: "-6px",
                            right: "-6px",
                            background: "#ef4444",
                            color: "#fff",
                            border: "none",
                            borderRadius: "50%",
                            width: isMobile ? "24px" : "20px",
                            height: isMobile ? "24px" : "20px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                          }}
                        >
                          <X size={isMobile ? 12 : 10} />
                        </button>
                      )}
                    </div>
                  ))}

                  {tiers.length < 5 && (
                    <button
                      type="button"
                      onClick={addTier}
                      style={{
                        background: "#10b981",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        padding: isMobile ? "10px 12px" : "8px 12px",
                        cursor: "pointer",
                        fontSize: isMobile ? "0.8rem" : "0.85rem",
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        minHeight: isMobile ? "44px" : "auto",
                        flexShrink: 0,
                      }}
                    >
                      <Plus size={isMobile ? 12 : 14} />
                      Add Tier
                    </button>
                  )}
                </div>

                {/* Responsive Active Tier Editor */}
                <div
                  style={{
                    background: "#f8f9fb",
                    border: "2px solid #e5e7eb",
                    borderRadius: "12px",
                    padding: isMobile ? "16px" : "20px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "16px",
                      flexWrap: isMobile ? "wrap" : "nowrap",
                      gap: "12px",
                    }}
                  >
                    <h5
                      style={{
                        margin: 0,
                        fontSize: isMobile ? "0.9rem" : "1rem",
                        fontWeight: 600,
                        color: "#232428",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      {tierIcons[tiers[activeStage]?.icon] || (
                        <Gift size={16} />
                      )}
                      Tier {activeStage + 1} Reward
                    </h5>

                    {/* Responsive Icon Selector */}
                    <div
                      style={{
                        display: "flex",
                        gap: "4px",
                        background: "#fff",
                        padding: "4px",
                        borderRadius: "8px",
                        border: "1px solid #e5e7eb",
                        flexShrink: 0,
                      }}
                    >
                      {Object.keys(tierIcons).map((iconKey) => (
                        <button
                          key={iconKey}
                          type="button"
                          onClick={() =>
                            updateTier(activeStage, "icon", iconKey)
                          }
                          style={{
                            background:
                              tiers[activeStage]?.icon === iconKey
                                ? "#008A9B"
                                : "transparent",
                            color:
                              tiers[activeStage]?.icon === iconKey
                                ? "#fff"
                                : "#6b7280",
                            border: "none",
                            borderRadius: "6px",
                            padding: isMobile ? "8px" : "6px",
                            cursor: "pointer",
                            minWidth: isMobile ? "36px" : "auto",
                            minHeight: isMobile ? "36px" : "auto",
                          }}
                        >
                          {tierIcons[iconKey]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: "16px" }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "6px",
                        fontWeight: 600,
                        color: "#374151",
                        fontSize: isMobile ? "0.85rem" : "0.9rem",
                      }}
                    >
                      Reward Description
                    </label>
                    <textarea
                      placeholder={
                        activeStage === 0
                          ? "e.g. Free Premium Coffee"
                          : activeStage === 1
                          ? "e.g. Free Coffee + Pastry"
                          : "e.g. €15 Gift Card"
                      }
                      value={tiers[activeStage]?.rewardText || ""}
                      onChange={(e) =>
                        updateTier(activeStage, "rewardText", e.target.value)
                      }
                      rows={isMobile ? 3 : 2}
                      style={{
                        width: "100%",
                        padding: isMobile ? "14px 16px" : "12px 16px",
                        border: "2px solid #e5e7eb",
                        borderRadius: "8px",
                        fontSize: isMobile ? "16px" : "1rem",
                        fontFamily: "inherit",
                        resize: "vertical",
                        minHeight: isMobile ? "80px" : "60px",
                        boxSizing: "border-box",
                        outline: "none",
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "6px",
                        fontWeight: 600,
                        color: "#374151",
                        fontSize: isMobile ? "0.85rem" : "0.9rem",
                      }}
                    >
                      Points Required
                    </label>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        background: "#fff",
                        border: "2px solid #e5e7eb",
                        borderRadius: "8px",
                        overflow: "hidden",
                      }}
                    >
                      <input
                        type="number"
                        placeholder="Points"
                        value={tiers[activeStage]?.points || ""}
                        onChange={(e) =>
                          updateTier(activeStage, "points", e.target.value)
                        }
                        min="1"
                        step="1"
                        style={{
                          flex: 1,
                          padding: isMobile ? "14px 16px" : "12px 16px",
                          border: "none",
                          fontSize: isMobile ? "16px" : "1rem",
                          outline: "none",
                        }}
                      />
                      <div
                        style={{
                          padding: isMobile ? "14px 16px" : "12px 16px",
                          background: "#f8f9fb",
                          color: "#6b7280",
                          fontSize: isMobile ? "0.85rem" : "0.9rem",
                          fontWeight: 600,
                          borderLeft: "1px solid #e5e7eb",
                        }}
                      >
                        pts
                      </div>
                    </div>

                    {/* Helper Text */}
                    {tiers[activeStage]?.points > 0 && (
                      <div
                        style={{
                          fontSize: isMobile ? "0.75rem" : "0.8rem",
                          color: "#6b7280",
                          marginTop: "6px",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <Users size={10} />
                        Requires €{Math.round(
                          tiers[activeStage].points / 10
                        )}{" "}
                        spend
                      </div>
                    )}
                  </div>

                  {tierErrors[activeStage] && (
                    <div
                      style={{
                        color: "#e03131",
                        fontSize: isMobile ? "0.75rem" : "0.8rem",
                        marginTop: "8px",
                        padding: "8px 12px",
                        background: "#fef2f2",
                        border: "1px solid #fecaca",
                        borderRadius: "6px",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <X size={10} />
                      {tierErrors[activeStage]}
                    </div>
                  )}
                </div>
              </div>

              {/* Responsive Action Buttons */}
              <div
                style={{
                  display: "flex",
                  flexDirection: isMobile ? "column" : "row",
                  gap: "12px",
                  alignItems: "stretch",
                }}
              >
                <button
                  type="button"
                  onClick={handleAutoGen}
                  style={{
                    background: "linear-gradient(135deg, #8b5cf6, #a855f7)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "10px",
                    padding: isMobile ? "16px 20px" : "12px 20px",
                    cursor: "pointer",
                    fontSize: isMobile ? "0.95rem" : "0.9rem",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    minHeight: isMobile ? "52px" : "auto",
                    order: isMobile ? 2 : 1,
                  }}
                >
                  <Sparkles size={16} />
                  Auto-generate Template
                </button>

                <button
                  type="submit"
                  disabled={!isValid || saveLoading}
                  style={{
                    flex: isMobile ? "none" : 1,
                    background: isValid
                      ? "linear-gradient(135deg, #10b981, #059669)"
                      : "#d1d5db",
                    color: "#fff",
                    border: "none",
                    borderRadius: "10px",
                    padding: isMobile ? "18px 24px" : "14px 24px",
                    cursor: isValid && !saveLoading ? "pointer" : "not-allowed",
                    fontSize: isMobile ? "1.05rem" : "1rem",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    opacity: saveLoading ? 0.8 : 1,
                    minHeight: isMobile ? "56px" : "auto",
                    order: isMobile ? 1 : 2,
                  }}
                >
                  {saveLoading && (
                    <Loader
                      size={18}
                      style={{ animation: "spin 1s linear infinite" }}
                    />
                  )}
                  {saveLoading
                    ? "Creating..."
                    : editData
                    ? "✨ Update Campaign"
                    : "🚀 Create Campaign"}
                </button>
              </div>
            </div>

            {/* Responsive Right Column - Live Preview */}
            {!isMobile && (
              <div style={{ flex: "0.8" }}>
                <div
                  style={{
                    position: isTablet ? "relative" : "sticky",
                    top: isTablet ? "auto" : "20px",
                  }}
                >
                  <div
                    style={{
                      background: "#fff",
                      border: "1px solid #e9ecef",
                      borderRadius: "12px",
                      overflow: "hidden",
                    }}
                  >
                    {/* Preview Header */}
                    <div
                      style={{
                        background:
                          "linear-gradient(135deg, #f8f9fb 0%, #e5e7eb 100%)",
                        padding: "16px 20px",
                        borderBottom: "1px solid #e9ecef",
                        fontWeight: 600,
                        color: "#374151",
                      }}
                    >
                      Live Preview
                    </div>

                    {/* Preview Content */}
                    <div
                      style={{
                        padding: "20px",
                        minHeight: "300px",
                      }}
                    >
                      {form.campaignName ||
                      form.rewardDescription ||
                      tiers.some((t) => t.rewardText && t.points) ? (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "12px",
                          }}
                        >
                          {form.campaignName && (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                padding: "8px 0",
                              }}
                            >
                              <Target size={16} style={{ color: "#008A9B" }} />
                              <div
                                style={{
                                  fontSize: "1.1rem",
                                  fontWeight: 700,
                                  color: "#232428",
                                }}
                              >
                                {form.campaignName}
                              </div>
                            </div>
                          )}

                          {form.rewardDescription && (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: "10px",
                                padding: "8px 0",
                              }}
                            >
                              <Info
                                size={16}
                                style={{ color: "#6b7280", marginTop: "2px" }}
                              />
                              <div
                                style={{
                                  fontSize: "0.95rem",
                                  fontWeight: 500,
                                  color: "#374151",
                                  lineHeight: 1.4,
                                }}
                              >
                                {form.rewardDescription}
                              </div>
                            </div>
                          )}

                          {tiers
                            .filter((tier) => tier.rewardText && tier.points)
                            .map((tier, idx) => (
                              <div
                                key={idx}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "10px",
                                  padding: "12px",
                                  background: "#f8f9fb",
                                  borderRadius: "8px",
                                  border: "1px solid #e5e7eb",
                                }}
                              >
                                <div style={{ color: "#10b981" }}>
                                  {tierIcons[tier.icon] || <Gift size={16} />}
                                </div>
                                <div style={{ flex: 1 }}>
                                  <div
                                    style={{
                                      fontSize: "0.95rem",
                                      fontWeight: 600,
                                      color: "#374151",
                                      lineHeight: 1.4,
                                    }}
                                  >
                                    Tier {idx + 1}: {tier.rewardText}
                                  </div>
                                  <div
                                    style={{
                                      fontSize: "0.8rem",
                                      color: "#10b981",
                                      fontWeight: 600,
                                      marginTop: "4px",
                                    }}
                                  >
                                    {tier.points} points required
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            height: "200px",
                            color: "#9ca3af",
                            textAlign: "center",
                          }}
                        >
                          <Target
                            size={32}
                            style={{ marginBottom: "12px", opacity: 0.5 }}
                          />
                          <div
                            style={{
                              fontSize: "1rem",
                              fontWeight: 500,
                              marginBottom: "6px",
                            }}
                          >
                            Start Creating Your Campaign
                          </div>
                          <div style={{ fontSize: "0.9rem", lineHeight: 1.4 }}>
                            Fill out the form to see preview
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </form>

          {/* Mobile-only preview at bottom */}
          {isMobile &&
            (form.campaignName ||
              form.rewardDescription ||
              tiers.some((t) => t.rewardText && t.points)) && (
              <div
                style={{
                  background: "#f8f9fb",
                  border: "1px solid #e9ecef",
                  borderTop: "2px solid #008A9B",
                  padding: "16px",
                  margin: "0 16px 16px",
                }}
              >
                <div
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    color: "#374151",
                    marginBottom: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Target size={14} style={{ color: "#008A9B" }} />
                  Quick Preview
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  {form.campaignName && (
                    <div
                      style={{
                        fontSize: "0.85rem",
                        color: "#232428",
                        fontWeight: 600,
                      }}
                    >
                      📢 {form.campaignName}
                    </div>
                  )}
                  {tiers
                    .filter((t) => t.rewardText && t.points)
                    .map((tier, idx) => (
                      <div
                        key={idx}
                        style={{
                          fontSize: "0.8rem",
                          color: "#374151",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        {tierIcons[tier.icon] || <Gift size={12} />}
                        Tier {idx + 1}: {tier.rewardText} ({tier.points}pts)
                      </div>
                    ))}
                </div>
              </div>
            )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        input:focus, textarea:focus {
          border-color: #008A9B !important;
          box-shadow: 0 0 0 3px rgba(0, 138, 155, 0.1) !important;
        }

        /* Mobile-specific enhancements */
        @media (max-width: 480px) {
          input[type="number"]::-webkit-outer-spin-button,
          input[type="number"]::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }

          input[type="number"] {
            -moz-appearance: textfield;
          }
        }

        /* Prevent zoom on iOS */
        @supports (-webkit-overflow-scrolling: touch) {
          input[font-size~="16px"] {
            font-size: 16px;
          }
        }
      `}</style>
    </div>,
    document.body
  );
};

export default CreateCampaignModal;
