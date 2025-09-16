import React, { useState, useMemo } from "react";
import { BarChart3, TrendingUp, Sparkles } from "lucide-react";
import { formatCurrency, formatNumber } from "../utils/formatters";
import { UI_CONFIG } from "../config/uiConfig";
import styles from "../LaunchPadPage.module.css";

const PerformanceGrid = ({ data, hasCampaign, onNudgeUsers }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const cardsPerPage = UI_CONFIG.pagination.cardsPerPage;

  const performanceData = useMemo(() => {
    if (!data) return [];

    return [
      {
        title: "Revenue Analytics",
        icon: <BarChart3 size={24} />,
        metrics: [
          { label: "Total Revenue", value: formatCurrency(data.totalRevenue) },
          {
            label: "Avg Order Value",
            value: formatCurrency(data.avgOrderValue),
          },
          // { label: "Revenue Growth", value: "+12.5%" },
        ],
      },
      {
        title: "Customer Insights",
        icon: <TrendingUp size={24} />,
        metrics: [
          {
            label: "Total Customers",
            value: formatNumber(data.totalCustomers),
          },
          {
            label: "Active Users",
            value: formatNumber(Math.floor(data.totalCustomers * 0.7)),
          },
          // { label: "Retention Rate", value: "68%" },
        ],
      },
      {
        title: "Transaction Analysis",
        icon: <Sparkles size={24} />,
        metrics: [
          {
            label: "Total Transactions",
            value: formatNumber(data.totalTransactions),
          },
          // { label: "Success Rate", value: "98.2%" },
          {
            label: "Daily Average",
            value: formatNumber(Math.floor(data.totalTransactions / 30)),
          },
        ],
      },
      // {
      //   title: "Growth Metrics",
      //   icon: <RefreshCw size={24} />,
      //   metrics: [
      //     { label: "Monthly Growth", value: "+15.3%" },
      //     { label: "Customer Growth", value: "+8.7%" },
      //     { label: "Revenue Growth", value: "+12.1%" },
      //   ],
      // },
    ];
  }, [data]);

  const currentCards = useMemo(() => {
    const startIndex = currentPage * cardsPerPage;
    return performanceData.slice(startIndex, startIndex + cardsPerPage);
  }, [performanceData, currentPage, cardsPerPage]);

  const totalPages = Math.ceil(performanceData.length / cardsPerPage);

  if (!data) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "2rem",
          color: "#666",
          fontSize: "1.1rem",
        }}
      >
        Loading performance data...
      </div>
    );
  }

  return (
    <div>
      {/* Section Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "1rem",
        }}
      >
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: 600,
            color: "#232428",
            marginBottom: "1.5rem",
          }}
        >
          {UI_CONFIG.sections.myPerformance}
        </h2>

        {/* {hasCampaign && (
          <button
            onClick={onNudgeUsers}
            style={{
              background: "#008A9B",
              color: "#fff",
              border: "none",
              padding: "8px 16px",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "0.9rem",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Sparkles size={16} />
            Nudge Users
          </button>
        )} */}
      </div>

      {/* Performance Cards Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "1.5rem",
          marginBottom: "2rem",
        }}
      >
        {currentCards.map((card, idx) => (
          <div
            key={idx}
            className={styles.infoCard}
            style={{
              background: "#fff",
              border: "1px solid #e9ecef",
              borderRadius: "12px",
              padding: "1.5rem",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
          >
            {/* Card Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "1.5rem",
              }}
            >
              <div
                style={{
                  background: "#f0f9ff",
                  padding: "8px",
                  borderRadius: "8px",
                  color: "#008A9B",
                }}
              >
                {card.icon}
              </div>
              <h3
                style={{
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  color: "#232428",
                  margin: 0,
                }}
              >
                {card.title}
              </h3>
            </div>

            {/* Metrics */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              {card.metrics.map((metric, metricIdx) => (
                <div
                  key={metricIdx}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      color: "#666",
                      fontSize: "0.9rem",
                    }}
                  >
                    {metric.label}
                  </span>
                  <span
                    style={{
                      fontWeight: 600,
                      color: "#232428",
                      fontSize: "1rem",
                    }}
                  >
                    {metric.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "8px",
            marginTop: "1.5rem",
          }}
        >
          {Array.from({ length: totalPages }, (_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentPage(idx)}
              style={{
                background: currentPage === idx ? "#008A9B" : "#f5f5f5",
                color: currentPage === idx ? "#fff" : "#666",
                border: "none",
                width: "32px",
                height: "32px",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      )}

      {/* Donut Chart Section */}
      {/* {data.topCustomers && data.topCustomers.length > 0 && (
        <div style={{ marginTop: "2rem" }}>
          <DonutChart customers={data.topCustomers} />
        </div>
      )} */}
    </div>
  );
};

export default PerformanceGrid;
