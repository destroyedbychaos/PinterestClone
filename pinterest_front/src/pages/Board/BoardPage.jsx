import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Box, Typography, Avatar } from "@mui/material";
import MasonryGrid from "../../components/ui/MasonryGrid";
import PinViewModal from "../../components/PinViewModal";
import { apiUrl } from "../../env";
import SearchHeader from "../../components/layout/SearchHeader";
import { useNavigate } from "react-router-dom";

const API_BASE = apiUrl;

const BoardPage = () => {
  const { boardId } = useParams();
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPin, setSelectedPin] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBoard = async () => {
      try {
        const token = localStorage.getItem("token");
        
        const res = await fetch(`${API_BASE}/Boards/${boardId}`);
        if (!res.ok) throw new Error("Failed to fetch board");
        const boardData = await res.json();

        let owner = { name: "Unknown", avatarUrl: null };
        if (boardData.userId) {
          try {
            const ownerRes = await fetch(`${API_BASE}/Profile/user/${boardData.userId}`, {
              headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            if (ownerRes.ok) {
              const ownerData = await ownerRes.json();
              if (ownerData.success && ownerData.payload) {
                owner = {
                  name: ownerData.payload.displayName || ownerData.payload.userName || "Unknown",
                  avatarUrl: ownerData.payload.avatarUrl || null,
                  userName: ownerData.payload.userName || "unknown"
                };
              }
            } else {
              console.error("Failed to fetch user: ", ownerRes.status);
            }
          } catch (err) {
            console.error("Error fetching user:", err);
          }
        }

        const previewPins = [...(boardData.pins || [])];

        setBoard({ ...boardData, owner, pins: previewPins });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBoard();
  }, [boardId]);

  if (loading) {
    return <Box sx={{ mt: 8, textAlign: "center" }}>Loading...</Box>;
  }

  if (!board) {
    return <Typography sx={{ mt: 8, textAlign: "center" }}>Board not found</Typography>;
  }

  return (
    <Box sx={{ p: 4 }}>
      <SearchHeader title="Board" />

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 1,
          mt: 5,
          mb: 2,
        }}
      >
        {board.isPrivate && (
          <span role="img" aria-label="private" style={{ fontSize: "20px" }}>
            🔒
          </span>
        )}
        {board.isArchived && (
          <span role="img" aria-label="archived" style={{ fontSize: "20px" }}>
            🗁
          </span>
        )}
        <Typography
          variant="h4"
          sx={{ fontWeight: 700, textAlign: "center" }}
        >
          {board.name || "Untitled Board"}
        </Typography>
      </Box>

      <Box
        onClick={() => navigate(`/user/${board.owner.userName}`)}
        sx={{
          display: "flex",
          justifyContent: "center",
          mb: 2,
          cursor: "pointer",
        }}
      >
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 1,
            bgcolor: "#ffffff",
            px: 2,
            py: 1,
            borderRadius: "25px",
            border: "1px solid #cfd8f1",
            "&:hover": { backgroundColor: "#f5f7fa" },
          }}
        >
          <Avatar
            src={board.owner.avatarUrl}
            alt={board.owner.name}
            sx={{ width: 32, height: 32, bgcolor: "#cfd8f1" }}
          />
          <Typography
            variant="body2"
            color="text.primary"
            fontFamily="Geologica, sans-serif"
            fontWeight={700}
            fontSize="0.9rem"
          >
            {board.owner.name}
          </Typography>
        </Box>
      </Box>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mb: 3, textAlign: "center" }}
      >
        {board.pins.length} Pins | Updated{" "}
        {new Date(board.updatedAt).toLocaleDateString("en-GB").replace(/\//g, ".")}
      </Typography>

      <MasonryGrid
        pins={board.pins.map((p) => ({
          id: p.id,
          image: p.imageUrl,
          title: p.title,
          description: p.description,
          author: p.userName || p.author || "Unknown",
          tags: p.tags || "",
        }))}
        onPinClick={(pin) => setSelectedPin(pin)}
      />

      {selectedPin && (
        <PinViewModal
          pin={selectedPin}
          isOpen={!!selectedPin}
          onClose={() => setSelectedPin(null)}
        />
      )}
    </Box>
  );
};

export default BoardPage;