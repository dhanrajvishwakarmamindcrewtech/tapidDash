import React from "react";
import { Loader } from "lucide-react";

const LoadingSpinner = ({
  size = "medium",
  message = "Loading...",
  fullScreen = false,
}) => {
  const sizeMap = {
    small: 20,
    medium: 32,
    large: 48,
  };

  const containerStyle = fullScreen
    ? {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(255, 255, 255, 0.9)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }
    : {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      };

  return (
    <div style={containerStyle}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "16px",
        }}
      >
        {/* Spinner */}
        <div
          style={{
            animation: "spin 1s linear infinite",
          }}
        >
          <Loader size={sizeMap[size]} color="#008A9B" />
        </div>

        {/* Message */}
        {message && (
          <div
            style={{
              color: "#666",
              fontSize: size === "small" ? "0.9rem" : "1rem",
              fontWeight: 500,
              textAlign: "center",
            }}
          >
            {message}
          </div>
        )}
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

export default LoadingSpinner;
