import React from 'react';
import { Modal, Box, Typography, Backdrop } from '@mui/material';
import { useTheme } from '@mui/material';
import  ActionButton  from '../CreateAestComponents/ActionButton';

const DeleteModal = ({ open, onClose, onConfirm }) => {
  const theme = useTheme();

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 300,
        sx: {
          backgroundColor: 'rgba(1, 35, 63, 0.20)',
        }
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 530,
          height: 290,
          boxShadow:'-1px 10px 16px 1px rgba(1, 35, 63, 0.25)',
          backgroundColor: 'white',
          borderRadius: '40px',
          padding: '32px',
          gap:'32px',
          outline: 'none',
          textAlign: 'center',
          fontFamily: 'Geologica, sans-serif',
        }}
      >
        <Typography
          sx={{
            fontSize: '38px',
            fontWeight: 600,
            color: theme.palette.text.primary,
            mb: 4,
            fontFamily: 'Geologica, sans-serif',
          }}
        >
          Delete image?
        </Typography>
        
        <Typography
          sx={{
            fontSize: '21px',
            fontWeight: 400,
            color: theme.palette.text.primary,
            mb: 5,
            fontFamily: 'Geologica, sans-serif',
          }}
        >
          Your progress will be lost.
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center' }}>
          <ActionButton 
            onClick={onClose}
            color="secondary"
            width="220px"
          >
            Cancel
          </ActionButton>
          
          <ActionButton 
            onClick={onConfirm}
            color="danger"
            width="220px"
          >
            Delete
          </ActionButton>
        </Box>
      </Box>
    </Modal>
  );
};

export default DeleteModal ;