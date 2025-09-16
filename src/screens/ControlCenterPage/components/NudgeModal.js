import React, { useState } from "react";
import ReactDOM from "react-dom";
import { X, Sparkles, Send, Users } from "lucide-react";

const NudgeModal = ({ isOpen, onClose }) => {
  const [nudgeType, setNudgeType] = useState("points");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const nudgeTemplates = {
    points: {
      title: "Points Reminder",
      defaultMessage:
        "You have points waiting to be used! Visit us today and claim your rewards.",
      icon: <Sparkles size={20} />,
    },
    rewards: {
      title: "Reward Available",
      defaultMessage:
        "Congratulations! You have earned a reward. Come claim it before it expires.",
      icon: <Users size={20} />,
    },
    comeback: {
      title: "Come Back Offer",
      defaultMessage:
        "We miss you! Here's a special offer just for you - visit us this week.",
      icon: <Send size={20} />,
    },
  };

  const handleSend = async () => {
    setIsSending(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsSending(false);
    onClose();

    // You would integrate with your notification service here
    alert("Nudge sent successfully to eligible users!");
  };

  const resetForm = () => {
    setNudgeType("points");
    setMessage("");
    setIsSending(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  const selectedTemplate = nudgeTemplates[nudgeType];

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
          maxWidth: "500px",
          maxHeight: "90vh",
          overflow: "auto",
          position: "relative",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "24px 28px 16px",
            borderBottom: "1px solid #e9ecef",
            position: "sticky",
            top: 0,
            background: "#fff",
            zIndex: 1,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div
                style={{
                  background: "#e6fcf5",
                  padding: "8px",
                  borderRadius: "8px",
                  color: "#008A9B",
                }}
              >
                <Sparkles size={24} />
              </div>
              <h2
                style={{
                  margin: 0,
                  fontSize: "1.5rem",
                  fontWeight: 600,
                  color: "#232428",
                }}
              >
                Nudge Users
              </h2>
            </div>

            <button
              onClick={handleClose}
              disabled={isSending}
              style={{
                background: "none",
                border: "none",
                cursor: isSending ? "not-allowed" : "pointer",
                padding: "4px",
                color: "#6c757d",
                opacity: isSending ? 0.5 : 1,
              }}
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "24px 28px" }}>
          {/* Nudge Type Selection */}
          <div style={{ marginBottom: "24px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "12px",
                fontWeight: 600,
                color: "#232428",
              }}
            >
              Nudge Type
            </label>
            <div
              style={{
                display: "flex",
                gap: "8px",
                flexWrap: "wrap",
              }}
            >
              {Object.entries(nudgeTemplates).map(([key, template]) => (
                <button
                  key={key}
                  onClick={() => {
                    setNudgeType(key);
                    setMessage(template.defaultMessage);
                  }}
                  disabled={isSending}
                  style={{
                    background: nudgeType === key ? "#008A9B" : "#f8f9fa",
                    color: nudgeType === key ? "#fff" : "#495057",
                    border: `1px solid ${
                      nudgeType === key ? "#008A9B" : "#dee2e6"
                    }`,
                    borderRadius: "8px",
                    padding: "10px 16px",
                    cursor: isSending ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontWeight: 500,
                    opacity: isSending ? 0.7 : 1,
                  }}
                >
                  {template.icon}
                  {template.title}
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: 600,
                color: "#232428",
              }}
            >
              Message
            </label>
            <textarea
              value={message || selectedTemplate.defaultMessage}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isSending}
              placeholder="Enter your nudge message..."
              rows={4}
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "1px solid #dee2e6",
                borderRadius: "8px",
                fontSize: "1rem",
                resize: "vertical",
                boxSizing: "border-box",
                opacity: isSending ? 0.7 : 1,
              }}
            />
          </div>

          {/* Preview */}
          <div
            style={{
              background: "#f8f9fa",
              border: "1px solid #e9ecef",
              borderRadius: "8px",
              padding: "16px",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                fontSize: "0.9rem",
                fontWeight: 600,
                color: "#6c757d",
                marginBottom: "8px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              {selectedTemplate.icon}
              Preview
            </div>
            <div
              style={{
                color: "#232428",
                fontSize: "0.95rem",
                lineHeight: 1.5,
              }}
            >
              {message || selectedTemplate.defaultMessage}
            </div>
          </div>

          {/* Stats */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
              gap: "12px",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                background: "#e6fcf5",
                padding: "12px",
                borderRadius: "8px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "1.2rem",
                  fontWeight: 600,
                  color: "#008A9B",
                }}
              >
                247
              </div>
              <div
                style={{
                  fontSize: "0.8rem",
                  color: "#666",
                  marginTop: "2px",
                }}
              >
                Eligible Users
              </div>
            </div>
            <div
              style={{
                background: "#fff3cd",
                padding: "12px",
                borderRadius: "8px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "1.2rem",
                  fontWeight: 600,
                  color: "#f59e0b",
                }}
              >
                156
              </div>
              <div
                style={{
                  fontSize: "0.8rem",
                  color: "#666",
                  marginTop: "2px",
                }}
              >
                With Points
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "16px 28px 24px",
            borderTop: "1px solid #e9ecef",
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
          }}
        >
          <button
            onClick={handleClose}
            disabled={isSending}
            style={{
              background: "#f8f9fa",
              border: "1px solid #dee2e6",
              borderRadius: "8px",
              padding: "12px 24px",
              cursor: isSending ? "not-allowed" : "pointer",
              fontWeight: 500,
              opacity: isSending ? 0.7 : 1,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={isSending}
            style={{
              background: isSending ? "#6c757d" : "#008A9B",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "12px 24px",
              cursor: isSending ? "not-allowed" : "pointer",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            {isSending ? (
              <>
                <div
                  style={{
                    width: "16px",
                    height: "16px",
                    border: "2px solid #fff",
                    borderTop: "2px solid transparent",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                  }}
                />
                Sending...
              </>
            ) : (
              <>
                <Send size={16} />
                Send Nudge
              </>
            )}
          </button>
        </div>
      </div>

      {/* Add CSS animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default NudgeModal;
