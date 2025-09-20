import React from "react";
import { Box, Button, Typography } from "@mui/material";
import "./BoardOptionsModal.css";

const BoardOptionsModal = ({
  isOpen,
  onClose,
  onEdit,
  onShare,
  onDelete,
  onReport,
  onArchiveToggle,
  onPrivacyToggle,
  board,
  position,
}) => {
  if (!isOpen) return null;

  return (
    <Box className="board-options-overlay" onClick={onClose}>
      <Box
        className="board-options-content"
        onClick={(e) => e.stopPropagation()}
        sx={{
          position: "fixed",
          left: position?.x || "50%",
          top: position?.y || "50%",
          transform: position ? "none" : "translate(-50%, -50%)",
          zIndex: 10001,
        }}
      >
        <Button className="board-option-button" onClick={onArchiveToggle}>
          <Box className="board-option-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M21 8V20C21 20.53 20.79 21.04 20.41 21.41C20.04 21.79 19.53 22 19 22H5C4.47 22 3.96 21.79 3.59 21.41C3.21 21.04 3 20.53 3 20V8" stroke="#01233F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 8H3L7 2H17L21 8Z" stroke="#01233F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Box>
          <Typography className="board-option-text">
            {board?.isArchived ? "Unarchive Board" : "Archive Board"}
          </Typography>
        </Button>

        <Button className="board-option-button" onClick={onPrivacyToggle}>
          <Box className="board-option-icon">
            {board?.isPrivate ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M17 8V6C17 3.79 15.21 2 13 2C10.79 2 9 3.79 9 6V8" stroke="#01233F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="5" y="8" width="14" height="14" rx="2" ry="2" stroke="#01233F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect x="5" y="11" width="14" height="10" rx="2" ry="2" stroke="#01233F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7 11V7C7 4.79 8.79 3 11 3C13.21 3 15 4.79 15 7V11" stroke="#01233F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </Box>
          <Typography className="board-option-text">
            {board?.isPrivate ? "Make Public" : "Make Private"}
          </Typography>
        </Button>

        <Button className="board-option-button" onClick={onDelete}>
          <Box className="board-option-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M3 6H5H21" stroke="#01233F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M19 6V20C19 20.53 18.79 21.04 18.41 21.41C18.04 21.79 17.53 22 17 22H7C6.47 22 5.96 21.79 5.59 21.41C5.21 21.04 5 20.53 5 20V6M8 6V4C8 3.47 8.21 2.96 8.59 2.59C8.96 2.21 9.47 2 10 2H14C14.53 2 15.04 2.21 15.41 2.59C15.79 2.96 16 3.47 16 4V6" stroke="#01233F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Box>
          <Typography className="board-option-text">Delete Board</Typography>
        </Button>
      </Box>
    </Box>
  );
};

export default BoardOptionsModal;