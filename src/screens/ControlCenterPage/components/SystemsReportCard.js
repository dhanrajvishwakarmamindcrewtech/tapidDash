import React, { useState } from "react";
import {
  Activity,
  Server,
  Database,
  Wifi,
  CheckCircle,
  AlertCircle,
  Clock,
  RefreshCw,
} from "lucide-react";
import styles from "../LaunchPadPage.module.css";

const SystemsReportCard = () => {
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const systemStatus = [
    {
      name: "API Server",
      status: "operational",
      uptime: "99.9%",
      response: "45ms",
      icon: <Server size={16} />,
    },
    {
      name: "Database",
      status: "operational",
      uptime: "99.8%",
      response: "12ms",
      icon: <Database size={16} />,
    },
    {
      name: "Payment Gateway",
      status: "operational",
      uptime: "99.9%",
      response: "89ms",
      icon: <Wifi size={16} />,
    },
    {
      name: "Analytics Engine",
      status: "maintenance",
      uptime: "95.2%",
      response: "156ms",
      icon: <Activity size={16} />,
    },
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case "operational":
        return <CheckCircle size={14} color="#10b981" />;
      case "maintenance":
        return <AlertCircle size={14} color="#f59e0b" />;
      case "error":
        return <AlertCircle size={14} color="#e03131" />;
      default:
        return <Clock size={14} color="#6b7280" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "operational":
        return "#10b981";
      case "maintenance":
        return "#f59e0b";
      case "error":
        return "#e03131";
      default:
        return "#6b7280";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "operational":
        return "Operational";
      case "maintenance":
        return "Maintenance";
      case "error":
        return "Error";
      default:
        return "Unknown";
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setLastUpdated(new Date());
    setIsRefreshing(false);
  };

  const operationalCount = systemStatus.filter(
    (s) => s.status === "operational"
  ).length;
  const totalSystems = systemStatus.length;

  return (
    <div
      className={styles.infoCard}
      style={{
        flex: "0 0 320px",
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
          <Activity size={20} color="#008A9B" />
          System Status
        </div>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          style={{
            background: "none",
            border: "none",
            cursor: isRefreshing ? "not-allowed" : "pointer",
            padding: "4px",
            color: "#008A9B",
            borderRadius: "4px",
            display: "flex",
            alignItems: "center",
            opacity: isRefreshing ? 0.6 : 1,
          }}
          title="Refresh status"
        >
          <RefreshCw
            size={16}
            style={{
              animation: isRefreshing ? "spin 1s linear infinite" : "none",
            }}
          />
        </button>
      </div>

      {/* Overall Status */}
      <div
        style={{
          background: "#f8f9fb",
          border: "2px solid #e6fcf5",
          borderRadius: "10px",
          padding: "16px",
          marginBottom: "20px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "1.2rem",
            fontWeight: 700,
            color: "#008A9B",
            marginBottom: "4px",
          }}
        >
          {operationalCount}/{totalSystems} Systems
        </div>
        <div
          style={{
            color: "#666",
            fontSize: "0.9rem",
          }}
        >
          Overall Status:{" "}
          {operationalCount === totalSystems
            ? "All Operational"
            : "Partial Outage"}
        </div>
      </div>

      {/* Systems List */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        {systemStatus.map((system, idx) => (
          <div
            key={idx}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 16px",
              background: "#fff",
              border: "1px solid #f0f0f0",
              borderRadius: "8px",
              fontSize: "0.9rem",
            }}
          >
            {/* System Info */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                flex: 1,
              }}
            >
              <div style={{ color: "#666" }}>{system.icon}</div>
              <span
                style={{
                  fontWeight: 500,
                  color: "#232428",
                }}
              >
                {system.name}
              </span>
            </div>

            {/* Status */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                {getStatusIcon(system.status)}
                <span
                  style={{
                    fontSize: "0.8rem",
                    color: getStatusColor(system.status),
                    fontWeight: 500,
                  }}
                >
                  {getStatusLabel(system.status)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: "16px",
          padding: "12px 0",
          borderTop: "1px solid #e9ecef",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "0.8rem",
          color: "#666",
        }}
      >
        <span>Last updated</span>
        <span>{lastUpdated.toLocaleTimeString()}</span>
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default SystemsReportCard;
