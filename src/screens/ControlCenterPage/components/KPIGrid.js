import React from "react";
import { Users, Euro, BarChart3, TrendingUp, Loader } from "lucide-react";
import styles from "../LaunchPadPage.module.css";

const iconMap = {
  Users: <Users size={20} />,
  Euro: <Euro size={20} />,
  BarChart3: <BarChart3 size={20} />,
  TrendingUp: <TrendingUp size={20} />,
};

const KPISkeleton = () => (
  <div className={styles.kpiCard} style={{ opacity: 0.7 }}>
    <div className={styles.kpiContent}>
      <div className={styles.kpiIconWrapper}>
        <div className={styles.kpiIcon} style={{ background: "#f7fafc" }}>
          <Loader
            size={20}
            color="#a0aec0"
            style={{ animation: "spin 1s linear infinite" }}
          />
        </div>
      </div>
      <div className={styles.kpiText}>
        <div
          className={styles.kpiValue}
          style={{
            background: "#f7fafc",
            borderRadius: "4px",
            height: "28px",
            width: "80px",
          }}
        />
        <div
          className={styles.kpiTitle}
          style={{
            background: "#f7fafc",
            borderRadius: "4px",
            height: "16px",
            width: "120px",
            marginTop: "8px",
          }}
        />
      </div>
    </div>
  </div>
);

const KPIGrid = ({ kpis, isLoading }) => {
  return (
    <div className={styles.kpiGrid}>
      {isLoading
        ? Array.from({ length: 4 }, (_, idx) => (
            <KPISkeleton key={`skeleton-${idx}`} />
          ))
        : kpis.map((kpi, idx) => (
            <div key={idx} className={styles.kpiCard}>
              <div className={styles.kpiContent}>
                <div className={styles.kpiIconWrapper}>
                  <div className={styles.kpiIcon}>
                    {iconMap[kpi.icon] || iconMap.Users}
                  </div>
                </div>
                <div className={styles.kpiText}>
                  <div className={styles.kpiValue}>{kpi.value}</div>
                  <div className={styles.kpiTitle}>{kpi.title}</div>
                </div>
              </div>
            </div>
          ))}
    </div>
  );
};

export default KPIGrid;
