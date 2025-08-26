// components/modals/CreateBoardModal.js
import React, { useState } from 'react';
import { Box, Paper, Typography, CircularProgress } from '@mui/material';
import { useTheme } from '@mui/material';
import StyledTextField from '../ui/CreateAestComponents/StyledTextField';
import ActionButton from '../ui/CreateAestComponents/ActionButton';

const CreateBoardModal = ({ open, onClose, onConfirm, isLoading }) => {
  const [boardName, setBoardName] = useState('');
  const theme = useTheme();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (boardName.trim()) {
      onConfirm(boardName.trim());
      setBoardName('');
    }
  };

  const handleClose = () => {
    setBoardName('');
    onClose();
  };

  if (!open) return null;

  return (
    <Box sx={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <Paper sx={{
        padding: '32px',
        borderRadius: '20px',
        width: '400px',
        maxWidth: '90vw'
      }}>
        <Typography sx={{
          fontSize: '24px',
          fontWeight: 600,
          textAlign: 'center',
          mb: 3,
          color: theme.palette.text.primary
        }}>
          Create new board
        </Typography>
        
        <form onSubmit={handleSubmit}>
          <StyledTextField
            label="Board name"
            placeholder="Enter board name"
            value={boardName}
            onChange={setBoardName}
            autoFocus={true}
          />
          
          <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'center' }}>
            <ActionButton
              onClick={handleClose}
              color="secondary"
              disabled={isLoading}
            >
              Cancel
            </ActionButton>
            <ActionButton
              onClick={() => handleSubmit({ preventDefault: () => {} })}
              disabled={!boardName.trim() || isLoading}
            >
              {isLoading ? <CircularProgress size={20} /> : 'Create'}
            </ActionButton>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default CreateBoardModal;