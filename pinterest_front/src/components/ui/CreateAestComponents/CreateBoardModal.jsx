import React from 'react';
import { Dialog, DialogContent } from '@mui/material';
import CreateBoardPanel from './CreateBoardPanel';

const CreateBoardModal = ({ open, onClose, onBack, onCreateBoard, isLoading }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "40px",
          overflow: "hidden"
        }
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        <CreateBoardPanel
          onBack={onBack || onClose}
          onCreateBoard={onCreateBoard}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CreateBoardModal;
