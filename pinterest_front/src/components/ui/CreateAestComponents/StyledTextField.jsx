import React from 'react';
import { TextField, Typography, Box } from '@mui/material';
import { useTheme } from '@mui/material';

const StyledTextField = ({ 
  label, 
  placeholder, 
  value, 
  onChange, 
  multiline = false, 
  rows = 1 
}) => {
  const theme = useTheme();

  const textFieldStyles = {
    '& .MuiOutlinedInput-root': {
      borderRadius: multiline ? '40px' : '100px',
      backgroundColor: 'rgba(215, 224, 244, 0.50)',
      border: 'none',
      fontWeight: 400,
      fontSize: '18px',
      paddingLeft: '10px',
      '& fieldset': {
        border: 'none'
      },
      '&:hover fieldset': {
        border: 'none'
      },
      '& input, & textarea': {
        paddingLeft: '14px',
      }
    },
    '& .MuiInputBase-input::placeholder': {
      color: theme.palette.dark[200],
      opacity: 1,
      paddingLeft: '0px',
    }
  };

  return (
    <Box>
      <Typography
        sx={{ 
          mb: 1, 
          ml: 2,
          fontWeight: 300,
          fontSize: '15px',
          color: theme.palette.dark[500],
        }}
      >
        {label}
      </Typography>
      <TextField
        fullWidth
        multiline={multiline}
        rows={multiline ? rows : undefined}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        sx={textFieldStyles}
      />
    </Box>
  );
};
export default StyledTextField;