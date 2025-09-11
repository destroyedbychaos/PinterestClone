import React from 'react';
import { Button } from '@mui/material';
import { useTheme } from '@mui/material';

const ActionButton = ({ 
  children, 
  onClick, 
  variant = 'contained', 
  disabled = false,
  width = '300px',
  color = 'primary'
}) => {
  const theme = useTheme();

  const getButtonStyles = () => {
    const baseStyles = {
      borderRadius: '100px',
      textTransform: 'none',
      height: '58px',
      width,
      fontWeight: 400,
      fontSize: '18px',
      px: 3,
      py: 1.5,
      fontFamily: 'Geologica, sans-serif',
    };

    if (variant === 'outlined' || color === 'secondary') {
      return {
        ...baseStyles,
        backgroundColor: theme.palette.blue[50],
        color: theme.palette.text.primary,
        border: 'none',
        boxShadow: 'none',
        '&:hover': {
          backgroundColor: '#B5BFD1',
          border: 'none',
          boxShadow: 'none'
        }
      };
    }

    if (color === 'danger') {
      return {
        ...baseStyles,
        backgroundColor: '#E62C2F',
        color: 'white',
        boxShadow: 'none',
      };
    }

    return {
      ...baseStyles,
      backgroundColor: disabled ? '#CBD7F1' : '#6F91D9',
      color: 'white',
      boxShadow: 'none',
      transition: 'all 0.3s ease',
      cursor: disabled ? 'not-allowed' : 'pointer',
      '&:hover': {
        boxShadow: !disabled ? '0 4px 12px rgba(59, 130, 246, 0.4)' : 'none',
      },
      '&:disabled': {
        backgroundColor: '#CBD7F1',
        color: 'white'
      }
    };
  };

  return (
    <Button
      variant={variant}
      onClick={onClick}
      disabled={disabled}
      sx={getButtonStyles()}
    >
      {children}
    </Button>
  );
};

export default ActionButton;