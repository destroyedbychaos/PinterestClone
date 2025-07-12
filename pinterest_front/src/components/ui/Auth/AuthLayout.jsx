import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const AuthLayout = ({ title, subtitle, children }) => {
    const theme = useTheme();

    return (
        <Box sx={{
            position: 'relative',
            minHeight: '100vh',
            width: '100%',
            fontFamily: 'Geologica, sans-serif',
            backgroundImage: 'url(../../../src/assets/images/image.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'top right',
            backgroundRepeat: 'no-repeat',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
        }}>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh',
                    maxWidth: '786px',
                    maxHeight: '810px',
                    gap: '24px',
                    borderTopRightRadius: '40px',
                    borderBottomRightRadius: '40px',
                    padding: '40px 80px',
                    boxShadow: '3px 0px 38.7px 2px rgba(1, 35, 63, 0.25)',
                    position: 'relative',
                    zIndex: 1,
                    overflow: 'hidden',
                }}
                bgcolor={"white"}
            >
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Typography
                        width={'516px'}
                        height={'48px'}
                        textAlign='center'
                        fontWeight='700'
                        fontStyle='Bold'
                        fontSize={'51px'}
                        color={theme.palette.blue[500]}
                        lineHeight={'100%'}
                    >
                        {title}
                    </Typography>
                    {subtitle && (
                        <Typography
                            marginTop={'30px'}
                            textAlign='center'
                            fontWeight='400'
                            fontSize={'21px'}
                            color={theme.palette.text.primary}
                            lineHeight={'140%'}
                        >
                            {subtitle}
                        </Typography>
                    )}
                </Box>
                {children}
            </Box>
        </Box>
    );
};

export default AuthLayout;