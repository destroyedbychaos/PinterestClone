import React from 'react';
import { Snackbar, Alert, Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Icon as Iconify } from '@iconify/react';

// Custom styled Alert component
const StyledAlert = styled(Alert)(({ theme, severity }) => {
  const getColors = () => {
    switch (severity) {
      case 'success':
        return {
          background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
          color: '#FFFFFF',
          iconColor: '#FFFFFF'
        };
      case 'error':
        return {
          background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
          color: '#FFFFFF',
          iconColor: '#FFFFFF'
        };
      case 'warning':
        return {
          background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
          color: '#FFFFFF',
          iconColor: '#FFFFFF'
        };
      case 'info':
      default:
        return {
          background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
          color: '#FFFFFF',
          iconColor: '#FFFFFF'
        };
    }
  };

  const colors = getColors();

  return {
    background: colors.background,
    color: colors.color,
    borderRadius: '16px',
    padding: '12px 20px',
    minWidth: '320px',
    maxWidth: '500px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(0, 0, 0, 0.08)',
    border: 'none',
    fontFamily: '"Geologica", sans-serif',
    
    '& .MuiAlert-icon': {
      color: colors.iconColor,
      marginRight: '12px',
      fontSize: '24px',
      alignSelf: 'center'
    },
    
    '& .MuiAlert-message': {
      padding: 0,
      display: 'flex',
      alignItems: 'center',
      flex: 1
    },
    
    '& .MuiAlert-action': {
      color: colors.iconColor,
      marginRight: 0,
      marginLeft: '12px',
      padding: '4px',
      
      '& .MuiIconButton-root': {
        color: colors.iconColor,
        padding: '4px',
        
        '&:hover': {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '8px'
        }
      }
    }
  };
});

// Custom icons for different severities
const getCustomIcon = (severity) => {
  switch (severity) {
    case 'success':
      return 'mdi:check-circle';
    case 'error':
      return 'mdi:alert-circle';
    case 'warning':
      return 'mdi:alert';
    case 'info':
    default:
      return 'mdi:information';
  }
};

// Enhanced Toast Component
const EnhancedToast = ({ 
  open, 
  message, 
  severity = 'info', 
  onClose, 
  autoHideDuration = 6000,
  anchorOrigin = { vertical: 'top', horizontal: 'center' }
}) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={anchorOrigin}
      sx={{
        '& .MuiSnackbar-root': {
          top: '24px !important'
        }
      }}
      TransitionProps={{
        timeout: 300
      }}
    >
      <StyledAlert 
        onClose={onClose} 
        severity={severity}
        icon={
          <Iconify 
            icon={getCustomIcon(severity)} 
            width={24} 
            height={24}
          />
        }
        sx={{
          animation: 'slideInDown 0.3s ease-out',
          '@keyframes slideInDown': {
            '0%': {
              transform: 'translateY(-100px)',
              opacity: 0
            },
            '100%': {
              transform: 'translateY(0)',
              opacity: 1
            }
          }
        }}
      >
        <Typography
          sx={{
            fontSize: '14px',
            fontWeight: 500,
            lineHeight: 1.4,
            fontFamily: '"Geologica", sans-serif'
          }}
        >
          {message}
        </Typography>
      </StyledAlert>
    </Snackbar>
  );
};

export default EnhancedToast;