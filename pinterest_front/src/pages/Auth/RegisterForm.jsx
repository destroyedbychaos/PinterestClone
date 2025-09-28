﻿import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useRegisterMutation, useGoogleAuthMutation } from '../../../store/Auth/AuthApi.js';
import { setCredentials } from '../../../store/slices/AuthSlice.js';
import { Button, Typography, useTheme, Box } from '@mui/material';
import { useNavigate } from "react-router";
import InputField from '../../components/ui/Auth/InputField';
import SocialLoginButton from '../../components/ui/Auth/SocialLoginButton';
import AuthLayout from '../../components/ui/Auth/AuthLayout';
import { useGoogleLogin } from '@react-oauth/google';

const RegisterForm = () => {
    const theme = useTheme();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [register, { isLoading, error }] = useRegisterMutation();
    const [googleAuth, { isLoading: isGoogleLoading }] = useGoogleAuthMutation();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await register({
                email,
                password,
                dateOfBirth,
            }).unwrap();

            dispatch(setCredentials({
                user: { email: email },
                accessToken: response.payload.accessToken
            }));

            localStorage.setItem('userPassword', password);
            localStorage.setItem('isNewUser', 'true');
            navigate('/');
        } catch (err) {
            console.error('Registration error:', err);
        }
    };

    const handleGoogleSuccess = async (tokenResponse) => {
        try {
            // First, try to authenticate (for existing users)
            const response = await googleAuth({ 
                accessToken: tokenResponse.access_token 
            }).unwrap();
            console.log('Google auth response:', response);
            
            // ВИПРАВЛЕННЯ: правильно отримуємо токен з відповіді
            const accessToken = response.payload?.tokens?.accessToken || response.payload?.accessToken;
            
            dispatch(setCredentials({
                user: response.payload.user || { email: response.payload.user?.email || '' },
                accessToken: accessToken
            }));
            
            navigate('/');
        } catch (err) {
            // If authentication fails, it might be a new user needing registration
            if (err.status === 400) {
                // Fetch user info from Google
                const userInfo = await fetchGoogleUserInfo(tokenResponse.access_token);
                if (userInfo) {
                    setGoogleToken(tokenResponse.access_token);
                    setGoogleUserInfo(userInfo);
                    setShowGoogleDialog(true);
                }
            } else {
                console.error('Google auth error:', err);
            }
        }
    };

    const loginGoogle = useGoogleLogin({
        onSuccess: handleGoogleSuccess,
        onError: (error) => {
            console.error('Google login error:', error);
        }
    });

    return (
        <AuthLayout title="Create an account" subtitle={'Start Your Collection of Inspiration.'}>
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', alignContent: 'center', gap: '16px' }}>

                <InputField
                    label="E-mail address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="E-mail"
                    id="email"
                    required
                />

                <InputField
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    id="password"
                    required
                    showPassword={showPassword}
                    setShowPassword={setShowPassword}
                />

                <InputField
                    label="Date of birth"
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    placeholder="mm/dd/yyyy"
                    id="date"
                    required
                />
                <Button
                    sx={{
                        borderRadius: "100px",
                        padding: '12px 20px',
                        gap: '16px',
                        mt: 2,
                        textTransform: 'capitalize',
                    }}
                    color="primary"
                    variant="contained"
                    type="submit"
                    disabled={isLoading}
                >
                    <Typography color={'white'} fontSize={'18px'}>
                        {isLoading ? 'Creating account...' : 'Continue'}
                    </Typography>
                </Button>
                <Typography
                    textAlign={'center'}
                    fontStyle='Bold'
                    fontWeight={'700'}
                    color={theme.palette.blue[500]}
                    fontSize={'18px'}>
                    OR
                </Typography>

                <SocialLoginButton
                    icon={<img width={'26px'} height={'26px'} src={'../../../src/assets/images/google.png'} alt="Google" />}
                    text="Continue with Google"
                    onClick={loginGoogle}
                    disabled={isGoogleLoading}
                />

                <Box color={theme.palette.blue[500]} sx={{
                    pl: "60px",
                    display: 'flex',
                    textAlign: 'center',
                    flexDirection: 'column',
                    width: '375px',
                    height: '36px',
                    fontWeight: '300',
                    fontStyle: 'Light',
                    fontSize: '14px',
                    cursor: 'pointer',
                    gap: '2px',
                }}>
                    <Typography fontSize={'14px'}>
                        By continuing, you agree to our
                    </Typography>
                    <Typography color={theme.palette.text} fontSize={'14px'}>
                        Terms of Service and Privacy Policy.
                    </Typography>
                </Box>

                <Typography
                    sx={{
                        cursor: 'pointer',
                        textAlign: 'center',
                        fontSize: '19px',
                        fontWeight: '500',
                        fontStyle: 'Medium',
                        paddingRight: '10px',
                        color: theme.palette.blue[500],
                        mt: 2,
                    }}
                    onClick={() => navigate('/login')}
                >
                    Already a member? Log in
                </Typography>
            </Box>
        </AuthLayout>
    );
};

export default RegisterForm;