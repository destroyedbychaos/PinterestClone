import React from 'react';
import { Box, styled } from '@mui/material';

const BackgroundContainer = styled(Box)({
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    padding: '20px',
    opacity: 0.4,
    filter: 'blur(1px)',
});

const BackgroundImage = styled(Box)({
    borderRadius: '20px',
    minHeight: '250px',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
});


export default OnboardingBackground; 