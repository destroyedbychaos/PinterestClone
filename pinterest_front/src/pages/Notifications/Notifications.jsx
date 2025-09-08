import React, { useState } from "react";
import NotificationsHeader from "../../components/layout/NotificationsHeader";
import { Button } from "@mui/material";

export default function Notifications() {
  const [activeTab, setActiveTab] = useState("all");
  const tabs = ["all", "saves", "likes", "comments", "follows", "other"];

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        background: "#fff",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <NotificationsHeader title="Notifications" />

      <div
        style={{
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
          gap: "16px",
          margin: "32px 0 24px 0",
          padding: "0 24px",
          flexWrap: "wrap",
        }}
      >
        {tabs.map((tab) => (
          <Button
            key={tab}
            onClick={() => setActiveTab(tab)}
            sx={{
              background: activeTab === tab ? "#fff" : "#EAEFF9",
              color: "#000D17",
              borderRadius: "100px",
              padding: "12px 24px",
              fontFamily: "'Geologica', sans-serif",
              fontSize: "24px",
              fontWeight: activeTab === tab ? 500 : 400,
              lineHeight: 1.2,
              textAlign: "center",
              whiteSpace: "nowrap",
              minHeight: "48px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: activeTab === tab ? "1px solid #CBD7F1" : "none",
              boxShadow:
                activeTab === tab ? "0 1px 3px rgba(0, 0, 0, 0.1)" : "none",
              textTransform: "capitalize",
              "&:hover": {
                background: activeTab === tab ? "#fff" : "#d1d9e8",
                transform: activeTab === tab ? "none" : "translateY(-1px)",
              },
              "&:active": {
                transform: "translateY(0)",
              },
            }}
          >
            {tab}
          </Button>
        ))}
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          gap: "24px",
          padding: "24px",
        }}
      >
        <div
          style={{
            flex: 1,
            background: "#fff",
            border: "1px solid #B4C6EB",
            borderRadius: "40px",
            padding: "40px",
          }}
        >
          <h2
            style={{
              fontFamily: "'Geologica', sans-serif",
              fontSize: "22px",
              fontWeight: 600,
              marginBottom: "16px",
            }}
          >
            Notifications
          </h2>
          <p style={{ color: "#6B7280", fontSize: "18px" }}>
            Showing:{" "}
            <span
              style={{ fontWeight: 600, textTransform: "capitalize" }}
            >
              {activeTab}
            </span>
          </p>
        </div>

        <div
          style={{
            flex: 1,
            background: "#fff",
            border: "1px solid #B4C6EB",
            borderRadius: "40px",
            padding: "40px"
          }}
        >
          <h2
            style={{
              fontFamily: "'Geologica', sans-serif",
              fontSize: "22px",
              fontWeight: 600,
              marginBottom: "16px",
            }}
          >
            Important notes
          </h2>
          <p style={{ color: "#6B7280", fontSize: "16px" }}>
            No important notes yet.
          </p>
        </div>
      </div>
    </div>
  );
}
