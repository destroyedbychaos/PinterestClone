import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
const SocialLoginButton = ({ icon, text, bgColor, onClick }) => {
    const theme = useTheme();
    return (
        <Box
            sx={{
                width: '464px',
                height: '52px',
                padding: '12px 20px',
                borderRadius: '100px',
                border: '1px solid #52697C',
                backgroundColor: bgColor || 'transparent',
                cursor: 'pointer',
            }}
            onClick={onClick}
        >
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
            }}>
                {icon}
                <Typography
                    sx={{
                        width: '100%',
                        fontSize: '18px',
                        fontWeight: '400',
                        textAlign: 'center',
                        color: theme.palette.text.primary,
                    }}
                >
                    {text}
                </Typography>
            </Box>
        </Box>
    );
};

export default SocialLoginButton;