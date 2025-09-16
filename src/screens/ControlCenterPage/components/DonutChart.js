import React, { useMemo, useRef, useEffect, useState } from "react";
import { PieChart, TrendingUp } from "lucide-react";
import { formatNumber } from "../utils/formatters";
import styles from "../LaunchPadPage.module.css";

const DonutChart = ({ customers }) => {
  console.log(customers, "customers");

  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // ResizeObserver to track container size changes
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };

    // Initial measurement
    updateDimensions();

    // Set up ResizeObserver for responsive behavior
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Window resize fallback
    window.addEventListener("resize", updateDimensions);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateDimensions);
    };
  }, []);

  // Calculate responsive chart size based on container height
  const chartSize = useMemo(() => {
    const minSize = 120;
    const maxSize = 300;

    // Use container height to determine chart size, with constraints
    const availableHeight = dimensions.height - 120; // Account for header and footer
    const calculatedSize = Math.min(
      maxSize,
      Math.max(minSize, availableHeight * 0.6)
    );

    return calculatedSize;
  }, [dimensions]);

  // Generate colors for each customer segment
  const colors = useMemo(
    () => [
      "#008A9B",
      "#20c997",
      "#fd7e14",
      "#6f42c1",
      "#00a8bd",
      "#e83e8c",
      "#dc3545",
      "#ffc107",
      "#198754",
      "#0dcaf0",
    ],
    []
  );

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!customers || customers.length === 0) return [];

    const topCustomers = customers.slice(0, 10); // Show top 10 customers
    const totalPoints = topCustomers.reduce(
      (sum, customer) => sum + customer.points,
      0
    );

    let currentAngle = 0;

    return topCustomers.map((customer, idx) => {
      const percentage = (customer.points / totalPoints) * 100;
      const angle = (customer.points / totalPoints) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      currentAngle += angle;

      return {
        ...customer,
        percentage: percentage.toFixed(1),
        startAngle,
        endAngle,
        color: colors[idx % colors.length],
      };
    });
  }, [customers, colors]);

  // Responsive SVG donut chart properties
  const strokeWidth = Math.max(15, chartSize * 0.08); // Responsive stroke width
  const radius = (chartSize - strokeWidth) / 2;
  const center = chartSize / 2;

  // Create SVG path for each segment
  const createArcPath = (startAngle, endAngle, innerRadius, outerRadius) => {
    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;

    const x1 = center + Math.cos(startAngleRad) * outerRadius;
    const y1 = center + Math.sin(startAngleRad) * outerRadius;
    const x2 = center + Math.cos(endAngleRad) * outerRadius;
    const y2 = center + Math.sin(endAngleRad) * outerRadius;

    const x3 = center + Math.cos(endAngleRad) * innerRadius;
    const y3 = center + Math.sin(endAngleRad) * innerRadius;
    const x4 = center + Math.cos(startAngleRad) * innerRadius;
    const y4 = center + Math.sin(startAngleRad) * innerRadius;

    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    return [
      "M",
      x1,
      y1,
      "A",
      outerRadius,
      outerRadius,
      0,
      largeArcFlag,
      1,
      x2,
      y2,
      "L",
      x3,
      y3,
      "A",
      innerRadius,
      innerRadius,
      0,
      largeArcFlag,
      0,
      x4,
      y4,
      "Z",
    ].join(" ");
  };

  if (!customers || customers.length === 0) {
    return (
      <div
        ref={containerRef}
        className={styles.infoCard}
        style={{
          padding: "2rem",
          textAlign: "center",
          // minHeight: "320px",
          // height: "100%", // Allow full height usage
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <PieChart size={48} color="#e0e0e0" style={{ marginBottom: "16px" }} />
        <div
          style={{
            fontSize: "1.1rem",
            fontWeight: 600,
            color: "#666",
            marginBottom: "8px",
          }}
        >
          No Data Available
        </div>
        <div style={{ fontSize: "0.9rem", color: "#999" }}>
          Customer points data will appear here
        </div>
      </div>
    );
  }

  const totalPoints = chartData.reduce(
    (sum, customer) => sum + customer.points,
    0
  );

  // Responsive layout logic
  const isSmallHeight = dimensions.height < 400;
  const isVerySmallHeight = dimensions.height < 300;
  const legendMaxHeight = isVerySmallHeight
    ? "100px"
    : isSmallHeight
    ? "120px"
    : "240px";
  const footerColumns = isSmallHeight
    ? "repeat(3, 1fr)"
    : "repeat(auto-fit, minmax(120px, 1fr))";

  return (
    <div
      ref={containerRef}
      className={styles.infoCard}
      style={{
        padding: "1.5rem",
        // height: "100%", // Use full available height
        background: "linear-gradient(135deg, #f8f9fb 0%, #e6fcf5 100%)",
        border: "2px dashed #d1d5db",
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
          marginBottom: isSmallHeight ? "12px" : "16px",
          flexShrink: 0,
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
          <PieChart size={20} color="#008A9B" />
          <span style={{ fontSize: isSmallHeight ? "0.9rem" : "1rem" }}>
            Points Distribution
          </span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            color: "#008A9B",
            fontSize: isSmallHeight ? "0.8rem" : "0.9rem",
            fontWeight: 600,
          }}
        >
          <TrendingUp size={14} />
          {formatNumber(totalPoints)} total pts
        </div>
      </div>

      {/* Chart Container - Flexible */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: isSmallHeight ? "1rem" : "2rem",
          flexWrap: "wrap",
          justifyContent: "center",
          flex: 1,
          minHeight: 0, // Allow shrinking
        }}
      >
        {/* Responsive SVG Donut Chart */}
        <div
          style={{
            position: "relative",
            display: "inline-block",
            flexShrink: 0,
          }}
        >
          <svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${chartSize} ${chartSize}`}
            style={{
              transform: "rotate(-90deg)",
              maxWidth: `${chartSize}px`,
              maxHeight: `${chartSize}px`,
              width: `${chartSize}px`,
              height: `${chartSize}px`,
            }}
          >
            {/* Background circle */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="#f0f0f0"
              strokeWidth={strokeWidth}
            />

            {/* Chart segments */}
            {chartData.map((customer, idx) => (
              <path
                key={idx}
                d={createArcPath(
                  customer.startAngle,
                  customer.endAngle,
                  radius - strokeWidth / 2,
                  radius + strokeWidth / 2
                )}
                fill={customer.color}
                stroke="#fff"
                strokeWidth="2"
                style={{
                  filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
                  transition: "all 0.3s ease",
                }}
              />
            ))}
          </svg>

          {/* Center text - Responsive font size */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: `${Math.max(1.2, chartSize / 120)}rem`,
                fontWeight: 700,
                color: "#232428",
              }}
            >
              {chartData.length}
            </div>
            <div
              style={{
                fontSize: `${Math.max(0.7, chartSize / 200)}rem`,
                color: "#666",
                fontWeight: 500,
              }}
            >
              Customers
            </div>
          </div>
        </div>

        {/* Responsive Legend */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: isSmallHeight ? "4px" : "6px",
            maxHeight: legendMaxHeight,
            overflowY: "auto",
            paddingRight: "8px",
            flex: 1,
            minWidth: "200px",
          }}
        >
          {chartData.map((customer, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: isSmallHeight ? "4px 8px" : "6px 10px",
                background: "#f8f9fb",
                borderRadius: "6px",
                fontSize: isVerySmallHeight
                  ? "0.75rem"
                  : isSmallHeight
                  ? "0.8rem"
                  : "0.9rem",
              }}
            >
              {/* Color indicator */}
              <div
                style={{
                  width: isSmallHeight ? "8px" : "10px",
                  height: isSmallHeight ? "8px" : "10px",
                  borderRadius: "50%",
                  backgroundColor: customer.color,
                  flexShrink: 0,
                }}
              />

              {/* Customer info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontWeight: 600,
                    color: "#232428",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {customer.userName}
                </div>
                <div
                  style={{
                    color: "#666",
                    fontSize: isVerySmallHeight
                      ? "0.65rem"
                      : isSmallHeight
                      ? "0.7rem"
                      : "0.8rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "2px",
                  }}
                >
                  <span>{formatNumber(customer.points)} pts</span>
                  <span style={{ fontWeight: 600 }}>
                    {customer.percentage}%
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* Show more indicator */}
          {customers.length > 10 && (
            <div
              style={{
                padding: isSmallHeight ? "4px 8px" : "6px 10px",
                textAlign: "center",
                fontSize: isSmallHeight ? "0.7rem" : "0.8rem",
                color: "#666",
                fontStyle: "italic",
              }}
            >
              +{customers.length - 10} more customers
            </div>
          )}
        </div>
      </div>

      {/* Footer Stats - Responsive */}
      <div
        style={{
          marginTop: isSmallHeight ? "8px" : "16px",
          padding: isVerySmallHeight ? "8px" : isSmallHeight ? "12px" : "16px",
          background: "#f8f9fb",
          borderRadius: "8px",
          display: "grid",
          gridTemplateColumns: footerColumns,
          gap: isSmallHeight ? "8px" : "12px",
          textAlign: "center",
          flexShrink: 0,
        }}
      >
        <div>
          <div
            style={{
              fontSize: isVerySmallHeight
                ? "0.9rem"
                : isSmallHeight
                ? "1rem"
                : "1.2rem",
              fontWeight: 700,
              color: "#008A9B",
            }}
          >
            {formatNumber(Math.round(totalPoints / chartData.length))}
          </div>
          <div
            style={{
              fontSize: isSmallHeight ? "0.7rem" : "0.8rem",
              color: "#666",
              marginTop: "2px",
            }}
          >
            Avg Points
          </div>
        </div>

        <div>
          <div
            style={{
              fontSize: isVerySmallHeight
                ? "0.9rem"
                : isSmallHeight
                ? "1rem"
                : "1.2rem",
              fontWeight: 700,
              color: "#008A9B",
            }}
          >
            {Math.max(...chartData.map((c) => c.points)).toFixed(0)}
          </div>
          <div
            style={{
              fontSize: isSmallHeight ? "0.7rem" : "0.8rem",
              color: "#666",
              marginTop: "2px",
            }}
          >
            Highest
          </div>
        </div>

        <div>
          <div
            style={{
              fontSize: isVerySmallHeight
                ? "0.9rem"
                : isSmallHeight
                ? "1rem"
                : "1.2rem",
              fontWeight: 700,
              color: "#008A9B",
            }}
          >
            {Math.min(...chartData.map((c) => c.points)).toFixed(0)}
          </div>
          <div
            style={{
              fontSize: isSmallHeight ? "0.7rem" : "0.8rem",
              color: "#666",
              marginTop: "2px",
            }}
          >
            Lowest
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonutChart;
