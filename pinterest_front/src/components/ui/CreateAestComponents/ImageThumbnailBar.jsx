import React from 'react';
import { Box } from '@mui/material';
import { Icon as Iconify } from '@iconify/react';
import { useTheme } from '@mui/material';

const ImageThumbnailBar = ({ 
  uploadedFiles, 
  selectedImageIndex, 
  onImageSelect, 
  onAddMoreImages 
}) => {
  const theme = useTheme();

  return (
    <Box sx={{ 
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex', 
      justifyContent: 'center',
      gap: '20px', 
      backgroundColor: 'white',
      borderRadius: '40px 40px 0 0',
      padding: '24px 32px',
      boxShadow: ' 0 -5px 14px 0 rgba(111, 145, 217, 0.25)',
      zIndex: 1000,
    }}>
      {uploadedFiles.map((file, index) => (
        <Box
          key={file.id}
          onClick={() => onImageSelect(index)}
          sx={{
            width: 60,
            height: 60,
            borderRadius: '16px',
            overflow: 'hidden',
            cursor: 'pointer',
            border: selectedImageIndex === index ? '3px solid #3B82F6' : 'none',
            transition: 'all 0.3s ease',
            flexShrink: 0,
            position: 'relative',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)'
            }
          }}
        >
          <Box
            component="img"
            src={file.preview}
            alt={file.name}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
          {file.title && file.description && file.link && file.hashtags && (
            <Box
              sx={{
                position: 'absolute',
                top: 4,
                right: 4,
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: '#4CAF50',
                border: '2px solid white'
              }}
            />
          )}
        </Box>
      ))}
      
      <Box
        onClick={onAddMoreImages}
        sx={{
          width: 60,
          height: 60,
          borderRadius: '16px',
          backgroundColor: '#EAEFF9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          flexShrink: 0,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)'
          }
        }}
      >
        <Iconify color={theme.palette.dark[500]} icon="octicon:plus-24" width={32} height={32} />
      </Box>
    </Box>
  );
};

export default ImageThumbnailBar;