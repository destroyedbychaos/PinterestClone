import React, { useEffect, useMemo, useState } from "react";
import NotificationsHeader from "../../components/layout/NotificationsHeader";
import { Button, Avatar } from "@mui/material";
import { useSelector } from "react-redux";
import axios from "axios";
import { apiUrl } from "../../env.js";
import { format, isToday, isYesterday } from "date-fns";
import { enUS } from "date-fns/locale";

const API_BASE = apiUrl;

export default function Notifications() {
  const [activeTab, setActiveTab] = useState("all");
  const tabs = ["all", "likes", "comments", "follows", "other"];

  const authState = useSelector((state) => state.auth);
  const token = useMemo(() => localStorage.getItem("token"), [authState?.token]);

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!token) return;

      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE}/notifications`, {
          params: { type: activeTab },
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        setNotifications([]);
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [activeTab, token]);

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
              boxShadow: activeTab === tab ? "0 1px 3px rgba(0, 0, 0, 0.1)" : "none",
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

          {loading ? (
            <p>Loading...</p>
          ) : notifications.length > 0 ? (
            Object.entries(
              notifications
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .reduce((groups, note) => {
                  const date = new Date(note.createdAt);
                  let dateLabel = format(date, "dd MMM yyyy", { locale: enUS });
                  if (isToday(date)) dateLabel = "Today";
                  else if (isYesterday(date)) dateLabel = "Yesterday";

                  if (!groups[dateLabel]) groups[dateLabel] = [];
                  groups[dateLabel].push(note);
                  return groups;
                }, {})
            ).map(([date, notes]) => (
              <div key={date} style={{ marginBottom: "32px" }}>
                <h3
                  style={{
                    fontFamily: "'Geologica', sans-serif",
                    fontSize: "20px",
                    fontWeight: 600,
                    margin: "16px 0",
                  }}
                >
                  {date}
                </h3>

                {notes.map((note) => (
                  <div
                    key={note.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "16px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <Avatar
                        src={note.user?.avatarUrl}
                        alt={note.user?.displayName || note.username || "User"}
                      >
                        {(!note.user?.avatarUrl && note.username) ? note.username[0].toUpperCase() : ""}
                      </Avatar>
                      <div>
                        {note.message && (
                          <p
                            style={{
                              margin: 0,
                              fontWeight: 600,
                              fontSize: "19px",
                              lineHeight: "100%",
                              letterSpacing: "0%",
                              color: "#000D17",
                            }}
                          >
                            {note.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {note.pinImage && (
                      <img
                        src={note.pinImage}
                        alt="pin"
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: "8px",
                          objectFit: "cover",
                        }}
                        onError={(e) => (e.currentTarget.style.display = "none")}
                      />
                    )}

                    {note.type === "follow" && (
                      <Button
                        variant="contained"
                        sx={{
                          borderRadius: "24px",
                          textTransform: "none",
                          background: "#4A6CF7",
                        }}
                      >
                        Follow
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ))
          ) : (
            <p style={{ color: "#6B7280", fontSize: "18px" }}>No notifications yet.</p>
          )}
        </div>

        <div
          style={{
            flex: 1,
            background: "#fff",
            border: "1px solid #B4C6EB",
            borderRadius: "40px",
            padding: "40px",
            maxHeight: "300px",
            display: "flex",
            flexDirection: "column",
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
          <p style={{ color: "#6B7280", fontSize: "16px", textAlign: "center" }}>
            No important notes yet.
          </p>
        </div>
      </div>
    </div>
  );
}
