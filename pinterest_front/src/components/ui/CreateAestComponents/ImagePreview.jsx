import React from 'react';
import { Box, Paper } from '@mui/material';

const ImagePreview = ({ file, width = "400px", height = "650px" }) => {
  if (!file) return null;

  return (
    <Box sx={{ width, height }}>
      <Paper
        sx={{
          borderRadius: "40px",
          overflow: "hidden",
          background: "#f5f5f5",
          width,
          height,
          boxShadow: "none",
        }}
      >
        <Box
          component="img"
          src={file.preview}
          alt={file.name}
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </Paper>
    </Box>
  );
};
export default ImagePreview;