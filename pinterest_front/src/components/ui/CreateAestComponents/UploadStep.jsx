import React from 'react';
import { Container, Paper, Typography, Button, Box } from '@mui/material';
import { Icon as Iconify } from '@iconify/react';
import { useTheme } from '@mui/material';

const UploadStep = ({ 
  isDragOver, 
  dragOverAnimation, 
  onFileSelect, 
  onSaveFromUrl,
  fileInputRef,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileInputChange
}) => {
  const theme = useTheme();

  return (
    <Container sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 8, fontFamily: 'Geologica' }}>
      {dragOverAnimation && (
        <Box sx={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(59, 130, 246, 0.05)',
          zIndex: 9999,
          pointerEvents: 'none',
          animation: 'fadeIn 0.2s ease-in-out',
          '@keyframes fadeIn': { from: { opacity: 0 }, to: { opacity: 1 } }
        }} />
      )}

      <Paper
        elevation={0}
        sx={{
          width: '490px', height: '500px',
          backgroundColor: isDragOver ? '#e8f0fe' : '#E8EDF9',
          borderRadius: '40px',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'all 0.2s ease',
          border: isDragOver ? '3px dashed #3b82f6' : '2px dashed transparent',
          mb: 4, transform: isDragOver ? 'scale(1.02)' : 'scale(1)',
          boxShadow: isDragOver ? '0 8px 32px rgba(59, 130, 246, 0.2)' : 'none',
          '&:hover': { backgroundColor: '#dde4f0', transform: 'scale(1.01)' }
        }}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={onFileSelect}
      >
        <Box sx={{
          mb: 3,
          transform: isDragOver ? 'scale(1.1) translateY(-5px)' : 'scale(1)',
          transition: 'transform 0.2s ease',
          opacity: isDragOver ? 1 : 0.8
        }}>
          <Iconify 
            icon="octicon:upload-24" 
            width={40} 
            height={40}
            color={theme.palette.text.primary}
          />
        </Box>
        
        <Typography sx={{ 
          color: theme.palette.blue[900],
          fontWeight: 500, fontSize: '21px', mb: 1,
          fontFamily: 'Geologica'
        }}>
          Choose a file
        </Typography>
        
        <Typography sx={{ 
          color: theme.palette.text.primary,
          fontWeight: 300, fontSize: '21px', mb: 2,
          fontFamily: 'Geologica, sans-serif'
        }}>
          or drag and drop it here
        </Typography>
        
        <Typography sx={{ 
          fontWeight: 300, fontSize: '16px',
          color: theme.palette.dark[300],
          fontFamily: 'Geologica, sans-serif'
        }}>
          .jpg files less than 20 MB recommended
        </Typography>
      </Paper>

      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.gif,.webp"
        multiple
        style={{ display: 'none' }}
        onChange={onFileInputChange}
      />

      <Typography sx={{ 
        color: theme.palette.text.primary,
        fontWeight: 700, fontSize: '21px', mb: 2,
        fontFamily: 'Geologica, sans-serif'
      }}>
        OR
      </Typography>

      <Button
        variant="text"
        onClick={onSaveFromUrl}
        sx={{
          color: theme.palette.dark[500],
          textTransform: 'none', fontSize: '21px',
          fontWeight: 500, gap: '10px',
          fontFamily: 'Geologica, sans-serif',
          '&:hover': { backgroundColor: 'transparent' }
        }}
      >
        Save from URL
      </Button>
    </Container>
  );
};

export default UploadStep;