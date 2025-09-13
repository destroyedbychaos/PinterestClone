import React from "react";
import { Box, Typography, Avatar, IconButton, Modal } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";

const BoardViewModal = ({ board, isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen || !board) return null;

  const handleBoardClick = () => {
    onClose();
    navigate(`/board/${board.id}`);
  };

  return (
    <Modal open={isOpen} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "90%",
          maxWidth: "1200px",
          maxHeight: "90vh",
          bgcolor: "white",
          borderRadius: 3,
          boxShadow: 24,
          p: 3,
          overflowY: "auto",
        }}
      >

        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", top: 12, right: 12 }}
        >
          <CloseIcon />
        </IconButton>
        <Box
          onClick={handleBoardClick}
          sx={{
            backgroundColor: "#EAEFF9",
            color: "#1a1a1a",
            border: "none",
            borderRadius: "16px",
            padding: 2,
            fontFamily: "Geologica, sans-serif",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            transition: "all 0.2s ease",
            "&:hover": { backgroundColor: "#d1d9e8", transform: "translateY(-1px)" },
            "&:active": { transform: "translateY(0)" },
          }}
        >

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gridTemplateRows: "repeat(2, 80px)",
              gap: 2,
              width: "100%",
              mb: 2,
            }}
          >
            {(board.previewImages || []).slice(0, 4).map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`Board ${board.title} preview ${idx + 1}`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: "8px",
                }}
              />
            ))}
          </Box>

          <Typography
            variant="h6"
            sx={{ fontWeight: 600, textAlign: "center" }}
          >
            {board.title}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          by {board.ownerName || "Unknown"}
        </Typography>
      </Box>
    </Modal>
  );
};

export default BoardViewModal;