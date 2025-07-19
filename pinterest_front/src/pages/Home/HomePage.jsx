import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Box, Container, Typography, Button } from '@mui/material';
import OnboardingModal from '../../components/OnboardingModal';

const HomePage = () => {
    const [showOnboarding, setShowOnboarding] = useState(false);
    const { user } = useSelector((state) => state.auth);

    useEffect(() => {
        const isNewUser = localStorage.getItem('isNewUser');
        if (isNewUser === 'true') {
            setShowOnboarding(true);
            localStorage.removeItem('isNewUser');
        }
    }, []);

    const handleOnboardingComplete = (userData) => {
        console.log('Onboarding completed:', userData);
        setShowOnboarding(false);
    };

    return (
        <Container maxWidth="lg">
            <Box sx={{ 
                minHeight: '100vh', 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <Typography 
                    variant="h1" 
                    sx={{ 
                        fontWeight: '700',
                        color: '#000D17',
                        textAlign: 'center',
                        fontSize: { xs: '2rem', md: '3rem' }
                    }}
                >
                    Home
                </Typography>
            </Box>

            <OnboardingModal
                open={showOnboarding}
                onClose={() => setShowOnboarding(false)}
                onComplete={handleOnboardingComplete}
            />
        </Container>
    );
};

export default HomePage;