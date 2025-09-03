import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import './PinOptionsModal.css';

const PinOptionsModal = ({ isOpen, onClose, onEdit, onDownload, onShare, onHide, onReport, pin, position }) => {
  if (!isOpen) return null;

  return (
    <Box className="pin-options-overlay" onClick={onClose}>
      <Box 
        className="pin-options-content" 
        onClick={(e) => e.stopPropagation()}
        sx={{
          position: 'fixed',
          left: position?.x || '50%',
          top: position?.y || '50%',
          transform: position ? 'none' : 'translate(-50%, -50%)',
          zIndex: 10001
        }}
      >

        <Button className="pin-option-button" onClick={onEdit}>
          <Box className="pin-option-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="#01233F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M18.5 2.50023C18.8978 2.10244 19.4374 1.87891 20 1.87891C20.5626 1.87891 21.1022 2.10244 21.5 2.50023C21.8978 2.89801 22.1213 3.43762 22.1213 4.00023C22.1213 4.56284 21.8978 5.10244 21.5 5.50023L12 15.0002L8 16.0002L9 12.0002L18.5 2.50023Z" stroke="#01233F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Box>
          <Typography className="pin-option-text">Edit</Typography>
        </Button>


        <Button className="pin-option-button" onClick={onDownload}>
          <Box className="pin-option-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="#01233F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 10L12 15L17 10" stroke="#01233F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 15V3" stroke="#01233F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Box>
          <Typography className="pin-option-text">Download image</Typography>
        </Button>


        <Button className="pin-option-button" onClick={onShare}>
          <Box className="pin-option-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M4 12V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V12" stroke="#01233F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 6L12 2L8 6" stroke="#01233F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 2V15" stroke="#01233F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Box>
          <Typography className="pin-option-text">Share</Typography>
        </Button>

 
        <Button className="pin-option-button" onClick={onHide}>
          <Box className="pin-option-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M17.94 17.94C16.2306 19.243 14.1491 19.9649 12 20C5 20 1 12 1 12C2.48788 9.65402 4.29538 7.53263 6.36 5.68M11 3.05C11.3294 3.01773 11.6587 3.00144 11.99 3C19 3 23 11 23 11C22.1839 12.5086 21.2999 13.9792 20.35 15.41M14.12 14.12C13.8454 14.4148 13.5141 14.6512 13.1462 14.8151C12.7782 14.9791 12.3809 15.0673 11.9781 15.0744C11.5753 15.0815 11.1743 15.0074 10.801 14.8565C10.4277 14.7056 10.0897 14.4811 9.80385 14.1962C9.51797 13.9113 9.29339 13.5727 9.14253 13.1989C8.99168 12.8251 8.91751 12.4237 8.92456 12.0208C8.93161 11.6179 9.01977 11.2209 9.1837 10.8533C9.34764 10.4858 9.58399 10.1549 9.87868 9.88069" stroke="#01233F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M1 1L23 23" stroke="#01233F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Box>
          <Typography className="pin-option-text">Hide</Typography>
        </Button>


        <Button className="pin-option-button" onClick={onReport}>
          <Box className="pin-option-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M4 15C4 15 5 14 8 14C11 14 13 16 16 16C19 16 20 15 20 15V3C20 3 19 4 16 4C13 4 11 2 8 2C5 2 4 3 4 3V15Z" stroke="#01233F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M4 22V15" stroke="#01233F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Box>
          <Typography className="pin-option-text">Report</Typography>
        </Button>
      </Box>
    </Box>
  );
};

export default PinOptionsModal;
