import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

import SideMenu from "../../components/layout/SideMenu";
import SearchHeader from "../../components/layout/SearchHeader";
import SearchFilterModal from "../../components/SearchFilterModal";
import { apiUrl } from "../../env";

const API_BASE = apiUrl;

const SearchBoards = () => {
  const { user } = useSelector((state) => state.auth);
  const [boards, setBoards] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [showSearchFilterModal, setShowSearchFilterModal] = useState(false);

  const searchRef = useRef(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchBoardsAndUsers = async () => {
      setLoading(true);
      try {
        const boardsRes = await fetch(`${API_BASE}/Boards?pageNumber=1&pageSize=40`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!boardsRes.ok) throw new Error("Failed to fetch boards");
        const boardsData = await boardsRes.json();
        const boardsRaw = boardsData.boards || boardsData.Boards || [];

        const usersRes = await fetch(`${API_BASE}/Profile/users`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const usersData = await usersRes.json();
        const usersMap = {};
        if (usersData.success && Array.isArray(usersData.payload)) {
          usersData.payload.forEach((user) => {
            usersMap[user.id] = user.displayName || user.userName || "Unknown";
          });
        }

        const boardsWithPins = await Promise.all(
          boardsRaw.map(async (b) => {
            let pins = [];
            try {
              const pinsRes = await fetch(`${API_BASE}/Pins/board/${b.id}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
              });
              if (pinsRes.ok) {
                const pinsData = await pinsRes.json();
                pins = pinsData.pins || [];
              }
            } catch {
              pins = [];
            }

            const previewPins = [...pins.slice(0, 4)];
            while (previewPins.length < 4) {
              previewPins.push({
                id: `empty-${previewPins.length}`,
                title: "",
                description: "",
                imageUrl: "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=",
                author: "",
                tags: "",
              });
            }

            return {
              id: b.id,
              title: b.name || "Untitled Board",
              description: b.description || "",
              ownerName: usersMap[b.userId] || "Unknown",
              pins: previewPins,
              updatedAt: b.updatedAt || Date.now(),
            };
          })
        );

        setBoards(boardsWithPins);
        setResults(boardsWithPins);
      } catch (err) {
        console.error(err);
        setBoards([]);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBoardsAndUsers();
  }, [token]);

  useEffect(() => {
    if (!query.trim()) {
      setResults(boards);
    } else {
      setResults(
        boards.filter(
          (b) =>
            b.title.toLowerCase().includes(query.toLowerCase()) ||
            b.description.toLowerCase().includes(query.toLowerCase())
        )
      );
    }
  }, [query, boards]);

  const handleBoardClick = (board) => {
    navigate(`/board/${board.id}`);
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#fff" }}>
      <SideMenu />
      <Box sx={{ flex: 1 }}>
        <SearchHeader
          user={user}
          searchRef={searchRef}
          onLogin={() => navigate("/login")}
          onSignup={() => navigate("/register")}
          onSearch={(value) => setQuery(value)}
        />

        <Box sx={{ p: "0 24px", mt: 2 }}>
            <Box
              component="button"
              onClick={() => setShowSearchFilterModal((prev) => !prev)}
              sx={{
                backgroundColor: "#EAEFF9",
                color: "#000D17",
                border: "none",
                borderRadius: "100px",
                padding: "12px 24px",
                fontFamily: "Geologica, sans-serif",
                fontSize: "24px",
                fontWeight: 400,
                lineHeight: 1.2,
                textAlign: "center",
                cursor: "pointer",
                minHeight: "48px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                whiteSpace: "nowrap",
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor: "#d1d9e8",
                  transform: "translateY(-1px)",
                },
                "&:active": {
                  transform: "translateY(0)",
                },
                "&.active": {
                  backgroundColor: "#fff",
                  border: "1px solid #CBD7F1",
                  fontWeight: 500,
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                },
              }}
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M14.6667 24.3335C14.6667 24.0683 14.772 23.8139 14.9596 23.6264C15.1471 23.4389 15.4015 23.3335 15.6667 23.3335H27C27.2652 23.3335 27.5196 23.4389 27.7071 23.6264C27.8946 23.8139 28 24.0683 28 24.3335C28 24.5987 27.8946 24.8531 27.7071 25.0406C27.5196 25.2281 27.2652 25.3335 27 25.3335H15.6667C15.4015 25.3335 15.1471 25.2281 14.9596 25.0406C14.772 24.8531 14.6667 24.5987 14.6667 24.3335ZM4 8.3335C4 8.06828 4.10536 7.81393 4.29289 7.62639C4.48043 7.43885 4.73478 7.3335 5 7.3335H15C15.2652 7.3335 15.5196 7.43885 15.7071 7.62639C15.8946 7.81393 16 8.06828 16 8.3335C16 8.59871 15.8946 8.85307 15.7071 9.0406C15.5196 9.22814 15.2652 9.3335 15 9.3335H5C4.73478 9.3335 4.48043 9.22814 4.29289 9.0406C4.10536 8.85307 4 8.59871 4 8.3335ZM21.3333 16.3335C21.3333 16.0683 21.4387 15.8139 21.6262 15.6264C21.8138 15.4389 22.0681 15.3335 22.3333 15.3335H27C27.2652 15.3335 27.5196 15.4389 27.7071 15.6264C27.8946 15.8139 28 16.0683 28 16.3335C28 16.5987 27.8946 16.8531 27.7071 17.0406C27.5196 17.2281 27.2652 17.3335 27 17.3335H22.3333C22.0681 17.3335 21.8138 17.2281 21.6262 17.0406C21.4387 16.8531 21.3333 16.5987 21.3333 16.3335ZM11.6667 21.3335C11.9319 21.3335 12.1862 21.4389 12.3738 21.6264C12.5613 21.8139 12.6667 22.0683 12.6667 22.3335V26.3335C12.6667 26.5987 12.5613 26.8531 12.3738 27.0406C12.1862 27.2281 11.9319 27.3335 11.6667 27.3335C11.4015 27.3335 11.1471 27.2281 10.9596 27.0406C10.772 26.8531 10.6667 26.5987 10.6667 26.3335V22.3335C10.6667 22.0683 10.772 21.8139 10.9596 21.6264C11.1471 21.4389 11.4015 21.3335 11.6667 21.3335Z"
                  fill="#000D17"
                />
                <path
                  d="M4 24.3335C4 24.0683 4.10536 23.8139 4.29289 23.6264C4.48043 23.4389 4.73478 23.3335 5 23.3335H11C11.2652 23.3335 11.5196 23.4389 11.7071 23.6264C11.8946 23.8139 12 24.0683 12 24.3335C12 24.5987 11.8946 24.8531 11.7071 25.0406C11.5196 25.2281 11.2652 25.3335 11 25.3335H5C4.73478 25.3335 4.48043 25.2281 4.29289 25.0406C4.10536 24.8531 4 24.5987 4 24.3335ZM4 16.3335C4 16.0683 4.10536 15.8139 4.29289 15.6264C4.48043 15.4389 4.73478 15.3335 5 15.3335H16.3333C16.5985 15.3335 16.8529 15.4389 17.0404 15.6264C17.228 15.8139 17.3333 16.0683 17.3333 16.3335C17.3333 16.5987 17.228 16.8531 17.0404 17.0406C16.8529 17.2281 16.5985 17.3335 16.3333 17.3335H5C4.73478 17.3335 4.48043 17.2281 4.29289 17.0406C4.10536 16.8531 4 16.5987 4 16.3335ZM22.3333 13.3335C22.5986 13.3335 22.8529 13.4389 23.0404 13.6264C23.228 13.8139 23.3333 14.0683 23.3333 14.3335V18.3335C23.3333 18.5987 23.228 18.8531 23.0404 19.0406C22.8529 19.2281 22.5986 19.3335 22.3333 19.3335C22.0681 19.3335 21.8138 19.2281 21.6262 19.0406C21.4387 18.8531 21.3333 18.5987 21.3333 18.3335V14.3335C21.3333 14.0683 21.4387 13.8139 21.6262 13.6264C21.8138 13.4389 22.0681 13.3335 22.3333 13.3335ZM18.6667 8.3335C18.6667 8.06828 18.772 7.81393 18.9596 7.62639C19.1471 7.43885 19.4015 7.3335 19.6667 7.3335H27C27.2652 7.3335 27.5196 7.43885 27.7071 7.62639C27.8946 7.81393 28 8.06828 28 8.3335C28 8.59871 27.8946 8.85307 27.7071 9.0406C27.5196 9.22814 27.2652 9.3335 27 9.3335H19.6667C19.4015 9.3335 19.1471 9.22814 18.9596 9.0406C18.772 8.85307 18.6667 8.59871 18.6667 8.3335ZM15 5.3335C15.2652 5.3335 15.5196 5.43885 15.7071 5.62639C15.8946 5.81393 16 6.06828 16 6.3335V10.3335C16 10.5987 15.8946 10.8531 15.7071 11.0406C15.5196 11.2281 15.2652 11.3335 15 11.3335C14.7348 11.3335 14.4804 11.2281 14.2929 11.0406C14.1054 10.8531 14 10.5987 14 10.3335V6.3335C14 6.06828 14.1054 5.81393 14.2929 5.62639C14.4804 5.43885 14.7348 5.3335 15 5.3335Z"
                  fill="#000D17"
                />
              </svg>
            </Box>

          {loading ? (
            <Box sx={{ mt: 4, textAlign: "center" }}>Loading...</Box>
          ) : results.length > 0 ? (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                gap: 1,
                mt: 3,
              }}
            >
              {results.map((board) => (
                <Box
                  key={board.id}
                  onClick={() => handleBoardClick(board)}
                  sx={{
                    backgroundColor: "#ffffff",
                    borderRadius: "16px",
                    height: "400px",
                    padding: 2,
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      backgroundColor: "#EAEFF9",
                      transform: "translateY(-1px)",
                    },
                    "&:active": { transform: "translateY(0)" },
                  }}
                >
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "2fr 1fr",
                      gridTemplateRows: "1fr 1fr",
                      gap: 1,
                      width: "100%",
                      height: "calc(100% - 110px)",
                    }}
                  >
                    {board.pins.slice(0, 3).map((pin, idx) => {
                      const style = {
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "4px",
                      };
                      if (idx === 0) {
                        return (
                          <img
                            key={idx}
                            src={pin.imageUrl}
                            alt={`Board ${board.title} preview ${idx + 1}`}
                            style={{ ...style, gridRow: "1 / span 2" }}
                          />
                        );
                      } else {
                        return (
                          <img
                            key={idx}
                            src={pin.imageUrl}
                            alt={`Board ${board.title} preview ${idx + 1}`}
                            style={style}
                          />
                        );
                      }
                    })}
                  </Box>

                  <Box
                    sx={{
                      width: "100%",
                      textAlign: "center",
                      mt: 2,
                      height: "100px",
                      padding: "3%",
                      borderRadius: "8px",
                      backgroundColor: "#ffffff",
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {board.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      by {board.ownerName ?? "Unknown"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {board.pins.length} Pins | Updated{" "}
                      {new Date(board.updatedAt)
                        .toLocaleDateString("en-GB")
                        .replace(/\//g, ".")}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          ) : (
            <Typography sx={{ mt: 4, textAlign: "center" }}>No boards found</Typography>
          )}
        </Box>
      </Box>

      <SearchFilterModal
        open={showSearchFilterModal}
        onClose={() => setShowSearchFilterModal(false)}
      />
    </Box>
  );
};

export default SearchBoards;