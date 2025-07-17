import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useLoginMutation } from '../../../store/Auth/AuthApi.js'
import { setCredentials } from '../../../store/slices/AuthSlice.js'
import {TextField, Button, Box, Typography, useTheme, Grid, Icon} from '@mui/material'
import { useNavigate } from "react-router";

const LoginForm = () => {
    const theme = useTheme();
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [login, { isLoading, error }] = useLoginMutation()
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const response = await login({ email, password }).unwrap()

            dispatch(setCredentials({
                user: { email: email },
                accessToken: response.payload.accessToken
            }))

            navigate('/')
        } catch (err) {
            console.error('Помилка логіну:', err)
        }
    }

    return (
        <Box sx={{
            position: 'right',
            minHeight: '100vh',
            width: '100%',
            fontFamily: 'Geologica, sans-serif',
            backgroundImage: 'url(../../../src/assets/images/image.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'top',
            backgroundRepeat: 'no-repeat',
            backgroundOrigin: 'top right',
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
                <Typography
                    width={'516px'}
                    height={'48px'}
                    textAlign='center'
                    fontWeight='700'
                    fontStyle='Bold'
                    fontSize={'51px'}
                    color={theme.palette.blue[500]}
                    lineHeight={'100%'}
                    marginBottom={'15px'}
                >
                    Welcome to Aestify!
                </Typography>

                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', alignContent:'center', gap: '16px' }}>
                    <Box sx={{width: '464',
                        height: '180',
                        angle: '0 deg',
                        opacity: '1',
                        gap: '12px',
                    }}>
                        <Typography
                            color={theme.palette.blue[500]}
                            paddingLeft={'16px'}
                            paddingRight={'16px'}
                            gap={'10px'}
                            fontWeight="300"
                            fontStyle='Light'
                            fontSize={'14px'}
                            lineHeight={'100%'}
                            width={'432px'}
                            height={'18px'}
                            sx={{ mb: 0.5}}
                        >
                            E-mail address
                        </Typography>
                        <Box sx={{
                            height: '51px',
                            padding: '12px 20px',
                            backgroundColor: '#D7E0F480',
                            borderRadius: '100px',
                            fontWeight: '400',
                            fontStyle: 'Regular',
                            fontSize: '18px',
                            lineHeight: '100%',
                        }}>
                            <input
                                className={'input-field w-full focus:outline-none'}
                                type="email"
                                color={theme.palette.dark[200]}
                                placeholder="E-mail"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </Box>

                        <Typography
                            color={theme.palette.blue[500]}
                            paddingLeft={'16px'}
                            paddingRight={'16px'}
                            gap={'10px'}
                            fontWeight="300"
                            fontStyle='Light'
                            fontSize={'14px'}
                            lineHeight={'100%'}
                            width={'432px'}
                            height={'18px'}
                            sx={{ mb: 0.5, mt: 1.5}}
                        >
                            Password
                        </Typography>
                        <Box sx={{
                            height: '51px',
                            padding: '12px 20px',
                            backgroundColor: '#D7E0F480',
                            borderRadius: '100px',
                            fontWeight: '400',
                            fontStyle: 'Regular',
                            fontSize: '18px',
                            lineHeight: '100%',
                            display: 'flex',
                            alignItems: 'center',
                        }}>
                            <input
                                className={'input-field w-full focus:outline-none'}
                                type={showPassword ? "text" : "password"}
                                color={theme.palette.dark[200]}
                                placeholder="Password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <Icon
                                sx={{
                                    cursor: 'pointer',
                                    color: theme.palette.dark[300],
                                    ml: 1,
                                    '& svg': {
                                        fill: 'currentColor'
                                    }
                                }}
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ?
                                    <svg width="24" height="24" viewBox="0 0 24 24"><path d="M15.5 12a3.5 3.5 0 11-7 0 3.5 3.5 0 017 0z"/><path fill="currentColor" fillRule="evenodd" d="M12 3.5c-3.432 0-6.125 1.534-8.054 3.24C2.02 8.445.814 10.352.33 11.202a1.6 1.6 0 000 1.598c.484.85 1.69 2.758 3.616 4.46C5.876 18.966 8.568 20.5 12 20.5c3.432 0 6.125-1.534 8.054-3.24 1.926-1.704 3.132-3.611 3.616-4.461a1.6 1.6 0 000-1.598c-.484-.85-1.69-2.757-3.616-4.46C18.124 5.034 15.432 3.5 12 3.5zM1.633 11.945c.441-.774 1.551-2.528 3.307-4.08C6.69 6.314 9.045 5 12 5c2.955 0 5.309 1.315 7.06 2.864 1.756 1.553 2.866 3.307 3.307 4.08a.111.111 0 01.017.056.111.111 0 01-.017.056c-.441.774-1.551 2.527-3.307 4.08C17.31 17.685 14.955 19 12 19c-2.955 0-5.309-1.315-7.06-2.864-1.756-1.553-2.866-3.306-3.307-4.08A.11.11 0 011.616 12a.11.11 0 01.017-.055z"/></svg>
                                    :
                                    <svg width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M8.052 5.837A9.715 9.715 0 0112 5c2.955 0 5.309 1.315 7.06 2.864 1.756 1.553 2.866 3.307 3.307 4.08a.11.11 0 01.016.055.122.122 0 01-.017.06 16.766 16.766 0 01-1.53 2.218.75.75 0 101.163.946 18.253 18.253 0 001.67-2.42 1.607 1.607 0 00.001-1.602c-.485-.85-1.69-2.757-3.616-4.46C18.124 5.034 15.432 3.5 12 3.5c-1.695 0-3.215.374-4.552.963a.75.75 0 00.604 1.373z"/><path fill="currentColor" fillRule="evenodd" d="M19.166 17.987C17.328 19.38 14.933 20.5 12 20.5c-3.432 0-6.125-1.534-8.054-3.24C2.02 15.556.814 13.648.33 12.798a1.606 1.606 0 01.001-1.6A18.305 18.305 0 013.648 7.01L1.317 5.362a.75.75 0 11.866-1.224l20.5 14.5a.75.75 0 11-.866 1.224l-2.651-1.875zM4.902 7.898c-1.73 1.541-2.828 3.273-3.268 4.044a.118.118 0 00-.017.059c0 .015.003.034.016.055.441.774 1.551 2.527 3.307 4.08C6.69 17.685 9.045 19 12 19c2.334 0 4.29-.82 5.874-1.927l-3.516-2.487a3.5 3.5 0 01-5.583-3.949L4.902 7.899z"/></svg>
                                }
                            </Icon>
                        </Box>
                    </Box>
                    <Typography
                        sx={{
                            textAlign: 'right',
                            color: theme.palette.blue?.[500],
                            fontSize: '18px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            fontStyle: 'Medium',
                        }}
                    >
                        Forgot your password?
                    </Typography>
                    <Button
                        sx={{
                            borderRadius: "100px",
                            padding: '12px 20px',
                            gap: '16px',
                            mt: 2
                        }}
                        color="primary"
                        variant="contained"
                        type="submit"
                        disabled={isLoading}
                    >
                        <Typography color={'white'} fontSize={'18px'}>
                            {isLoading ? 'Loging in...' : 'Log in'}
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
                    <Box sx={{width: '464',
                        height: '52px',
                        angle: '0 deg',
                        opacity: '1',
                        paddingTop: '12px',
                        paddingRight: '20px',
                        paddingBottom: '12px',
                        paddingLeft: '20px',
                        borderRadius: '100px',
                        borderWidth: '1px',
                        borderColor: '#52697C',
                        color: 'white',
                    }}>
                        <Box sx={{
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'space-between',
                        }}>
                            <svg width="24" height="25" viewBox="0 0 30 31" fill="none" xmlns="http://www.w3.org/2000/svg"> {/* Reduced size */}
                                <path d="M30 16.0041C30 7.70339 23.28 0.966553 15 0.966553C6.72003 0.966553 3.05176e-05 7.70339 3.05176e-05 16.0041C3.05176e-05 23.2823 5.16003 29.3425 12 30.741V20.5154H9.00003V16.0041H12V12.2447C12 9.34249 14.355 6.98159 17.25 6.98159H21V11.4929H18C17.175 11.4929 16.5 12.1696 16.5 12.9966V16.0041H21V20.5154H16.5V30.9666C24.075 30.2147 30 23.8087 30 16.0041Z" fill="#1877F2"/>
                            </svg>
                            <Box sx={{
                                textAlign: 'center',
                                fontStyle: 'Regular',
                                width: '384px',
                                fontSize:'18px',
                                fontWeight: '400',
                                height: '22px',
                                gap: '10px',
                                color: '#000D17',
                            }}
                            >
                                Continue with Facebook
                            </Box>
                        </Box>
                    </Box>
                    <Box sx={{width: '464',
                        height: '52px',
                        angle: '0 deg',
                        opacity: '1',
                        paddingTop: '12px',
                        paddingRight: '20px',
                        paddingBottom: '12px',
                        paddingLeft: '20px',
                        borderRadius: '100px',
                        borderWidth: '1px',
                        borderColor: '#52697C',
                        color: 'white',
                    }}>
                        <Box sx={{
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'space-between',
                        }}>
                            <img width={'26px'} height={'26px'} src={'../../../src/assets/images/google.png'}/> {/* Reduced size */}
                            <Box sx={{
                                textAlign: 'center',
                                fontStyle: 'Regular',
                                width: '384px',
                                fontSize:'18px',
                                fontWeight: '400',
                                height: '22px',
                                gap: '10px',
                                color: '#000D17',
                            }}
                            >
                                Continue with Google
                            </Box>
                        </Box>
                    </Box>
                    <Box bgcolor={theme.palette.blue[50]} sx={{width: '464',
                        height: '52px',
                        angle: '0 deg',
                        opacity: '1',
                        paddingTop: '12px',
                        paddingRight: '20px',
                        paddingBottom: '12px',
                        paddingLeft: '20px',
                        borderRadius: '100px',
                        borderWidth: '1px',
                        borderColor: '#52697C',
                        color: 'white',
                    }}>
                        <Box sx={{
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'space-between',
                        }}>
                            <svg width="22" height="22" viewBox="0 0 24 18" fill="none" xmlns="http://www.w3.org/2000/svg"> {/* Reduced size */}
                                <path d="M1.75 0H22.25C23.216 0 24 0.784 24 1.75V15.75C24 16.2141 23.8156 16.6592 23.4874 16.9874C23.1592 17.3156 22.7141 17.5 22.25 17.5H1.75C1.28587 17.5 0.840752 17.3156 0.512563 16.9874C0.184374 16.6592 0 16.2141 0 15.75L0 1.75C0 0.784 0.784 0 1.75 0ZM1.5 4.412V15.75C1.5 15.888 1.612 16 1.75 16H22.25C22.3163 16 22.3799 15.9737 22.4268 15.9268C22.4737 15.8799 22.5 15.8163 22.5 15.75V4.412L12.98 10.845C12.388 11.245 11.612 11.245 11.02 10.845L1.5 4.412ZM1.5 1.75V2.602L11.86 9.602C11.9013 9.62994 11.9501 9.64488 12 9.64488C12.0499 9.64488 12.0987 9.62994 12.14 9.602L22.5 2.602V1.75C22.5 1.6837 22.4737 1.62011 22.4268 1.57322C22.3799 1.52634 22.3163 1.5 22.25 1.5H1.75C1.6837 1.5 1.62011 1.52634 1.57322 1.57322C1.52634 1.62011 1.5 1.6837 1.5 1.75Z" fill="#000D17"/>
                            </svg>

                            <Box sx={{
                                textAlign: 'center',
                                fontStyle: 'Regular',
                                width: '384px',
                                fontSize:'18px',
                                fontWeight: '400',
                                height: '22px',
                                gap: '10px',
                                color: '#000D17',
                            }}
                            >
                                Log in without Password
                            </Box>
                        </Box>
                    </Box>
                    <Box color={theme.palette.blue[500]} sx={{
                        pl:"60px",
                        display: 'flex',
                        textAlign: 'center',
                        flexDirection: 'column',
                        width:' 375px',
                        height: '36px',
                        fontWeight: '300',
                        fontStyle:'Light',
                        fontSize:'14px',
                        cursor: 'pointer',
                        gap:'2px',
                    }}>
                        <Typography fontSize={'14px'}>
                            By continuing, you agree to our
                        </Typography>
                        <Typography color={theme.palette.text} fontSize={'14px'}>
                            Terms of Service and Privacy Policy.
                        </Typography>
                    </Box>
                    <Typography sx={{
                        cursor: 'pointer',
                        textAlign: 'center',
                        fontSize: '19px',
                        fontWeight: '500',
                        fontStyle: 'Medium',
                        paddingRight:'10px',
                        color: theme.palette.blue[500],
                        mt: 2,
                    }}>
                        Not on Aestify yet? Sign Up
                    </Typography>
                </Box>
            </Box>
        </Box>
    )
}

export default LoginForm