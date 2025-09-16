import React from "react";
import ReactDOM from "react-dom";
import { AlertTriangle, X, Trash2, Pause, Play } from "lucide-react";

const ConfirmationModal = ({ isOpen, config, onClose }) => {
  if (!isOpen || !config) return null;

  const getIcon = () => {
    switch (config.variant) {
      case "danger":
        return <Trash2 size={24} color="#e03131" />;
      case "warning":
        return <Pause size={24} color="#f59e0b" />;
      case "success":
        return <Play size={24} color="#10b981" />;
      default:
        return <AlertTriangle size={24} color="#6b7280" />;
    }
  };

  const getButtonStyle = () => {
    switch (config.variant) {
      case "danger":
        return { background: "#e03131", color: "#fff" };
      case "warning":
        return { background: "#f59e0b", color: "#fff" };
      case "success":
        return { background: "#10b981", color: "#fff" };
      default:
        return { background: "#6b7280", color: "#fff" };
    }
  };

  const handleConfirm = () => {
    if (config.onConfirm) {
      config.onConfirm();
    }
    onClose();
  };

  const modalContent = (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "400px",
          position: "relative",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "24px 24px 16px",
            borderBottom: "1px solid #e9ecef",
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
                alignItems: "center",
                gap: "12px",
              }}
            >
              {getIcon()}
              <h2
                style={{
                  margin: 0,
                  fontSize: "1.25rem",
                  fontWeight: 600,
                  color: "#232428",
                }}
              >
                {config.title}
              </h2>
            </div>

            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px",
                color: "#6c757d",
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "24px" }}>
          <p
            style={{
              margin: 0,
              color: "#495057",
              fontSize: "1rem",
              lineHeight: 1.5,
            }}
          >
            {config.message}
          </p>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "16px 24px 24px",
            borderTop: "1px solid #e9ecef",
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
          }}
        >
          <button
            onClick={onClose}
            style={{
              background: "#f8f9fa",
              border: "1px solid #dee2e6",
              borderRadius: "8px",
              padding: "10px 20px",
              cursor: "pointer",
              fontWeight: 500,
              color: "#495057",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            style={{
              ...getButtonStyle(),
              border: "none",
              borderRadius: "8px",
              padding: "10px 20px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            {config.confirmText || "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default ConfirmationModal;
