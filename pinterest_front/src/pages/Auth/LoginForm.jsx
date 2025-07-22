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
                    maxHeight: '1080px',
                    gap: '48px',
                    borderTopRightRadius: '40px',
                    borderBottomRightRadius: '40px',
                    padding: '100px 160px',
                    boxShadow: '3px 0px 38.7px 2px rgba(1, 35, 63, 0.25)',
                    position: 'relative',
                    zIndex: 1,
                }}
                bgcolor={"white"}
            >
                <Typography
                    width={'516px'}
                    height={'64px'}
                    textAlign='center'
                    fontWeight='700'
                    fontStyle='Bold'
                    fontSize={'51px'}
                    color={theme.palette.blue[500]}
                    lineHeight={'100%'}
                >
                    Welcome to Aestify!
                </Typography>

                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', alignContent:'center', gap: '24px' }}>
                    <Box sx={{width: '464',
                        height: '230',
                        angle: '0 deg',
                        opacity: '1',
                        gap: '16px',
                    }}>
                        <Typography
                            color={theme.palette.blue[500]}
                            paddingLeft={'16px'}
                            paddingRight={'16px'}
                            gap={'10px'}
                            fontWeight="300"
                            fontStyle='Light'
                            fontSize={'16px'}
                            lineHeight={'100%'}
                            width={'432px'}
                            height={'20px'}
                            sx={{ mb: 1}}
                        >
                            E-mail address
                        </Typography>
                        <Box sx={{
                            padding: '16px 24px',
                            backgroundColor: '#D7E0F480',
                            borderRadius: '100px',
                            fontWeight: '400',
                            fontStyle: 'Regular',
                            fontSize: '21px',
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
                            fontSize={'16px'}
                            lineHeight={'100%'}
                            width={'432px'}
                            height={'20px'}
                            sx={{ mb: 1, mt: 2}}
                        >
                            Password
                        </Typography>
                        <Box sx={{
                            padding: '16px 24px',
                            backgroundColor: '#D7E0F480',
                            borderRadius: '100px',
                            fontWeight: '400',
                            fontStyle: 'Regular',
                            fontSize: '21px',
                            lineHeight: '100%',

                        }}>
                            <input
                                className={'input-field w-full  focus:outline-none'}
                                type="password"
                                color={theme.palette.dark[200]}
                                placeholder="Password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </Box>
                    </Box>
                    <Typography
                        onClick={() => navigate('/forgotpassword')}
                        sx={{
                            textAlign: 'right',
                            color: theme.palette.blue?.[500],
                            fontSize: '21px',
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
                            padding: '16px 24px',
                            gap: '16px',
                            mt: 1
                        }}
                        color="primary"
                        variant="contained"
                        type="submit"
                        disabled={isLoading}
                    >
                        <Typography color={'white'}>
                            {isLoading ? 'Loging in...' : 'Log in'}
                        </Typography>

                    </Button>

                    <Typography
                        textAlign={'center'}
                        fontStyle='Bold'
                        fontWeight={'700'}
                        color={theme.palette.blue[500]}
                        fontSize={'21px'}>
                        OR
                    </Typography>
                    <Box sx={{width: '464',
                        height: '64',
                        angle: '0 deg',
                        opacity: '1',
                        paddingTop: '16px',
                        paddingRight: '24px',
                        paddingBottom: '16px',
                        paddingLeft: '24px',
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
                            <svg width="30" height="31" viewBox="0 0 30 31" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M30 16.0041C30 7.70339 23.28 0.966553 15 0.966553C6.72003 0.966553 3.05176e-05 7.70339 3.05176e-05 16.0041C3.05176e-05 23.2823 5.16003 29.3425 12 30.741V20.5154H9.00003V16.0041H12V12.2447C12 9.34249 14.355 6.98159 17.25 6.98159H21V11.4929H18C17.175 11.4929 16.5 12.1696 16.5 12.9966V16.0041H21V20.5154H16.5V30.9666C24.075 30.2147 30 23.8087 30 16.0041Z" fill="#1877F2"/>
                            </svg>
                            <Box sx={{
                                textAlign: 'center',
                                fontStyle: 'Regular',
                                width: '384px',
                                fontSize:'21px',
                                fontWeight: '400',
                                height: '26px',
                                gap: '10px',
                                color: '#000D17',
                            }}
                            >
                                Continue with Facebook
                            </Box>
                        </Box>

                    </Box>
                    <Box sx={{width: '464',
                        height: '64',
                        angle: '0 deg',
                        opacity: '1',
                        paddingTop: '16px',
                        paddingRight: '24px',
                        paddingBottom: '16px',
                        paddingLeft: '24px',
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
                            <img width={'32px'} height={'32px'} src={'../../../src/assets/images/google.png'}/>
                            <Box sx={{
                                textAlign: 'center',
                                fontStyle: 'Regular',
                                width: '384px',
                                fontSize:'21px',
                                fontWeight: '400',
                                height: '26px',
                                gap: '10px',
                                color: '#000D17',
                            }}
                            >
                                Continue with Google
                            </Box>
                        </Box>

                    </Box>
                    <Box bgcolor={theme.palette.blue[50]} sx={{width: '464',
                        height: '64',
                        angle: '0 deg',
                        opacity: '1',
                        paddingTop: '16px',
                        paddingRight: '24px',
                        paddingBottom: '16px',
                        paddingLeft: '24px',
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
                            <svg width="28" height="28" viewBox="0 0 24 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1.75 0H22.25C23.216 0 24 0.784 24 1.75V15.75C24 16.2141 23.8156 16.6592 23.4874 16.9874C23.1592 17.3156 22.7141 17.5 22.25 17.5H1.75C1.28587 17.5 0.840752 17.3156 0.512563 16.9874C0.184374 16.6592 0 16.2141 0 15.75L0 1.75C0 0.784 0.784 0 1.75 0ZM1.5 4.412V15.75C1.5 15.888 1.612 16 1.75 16H22.25C22.3163 16 22.3799 15.9737 22.4268 15.9268C22.4737 15.8799 22.5 15.8163 22.5 15.75V4.412L12.98 10.845C12.388 11.245 11.612 11.245 11.02 10.845L1.5 4.412ZM1.5 1.75V2.602L11.86 9.602C11.9013 9.62994 11.9501 9.64488 12 9.64488C12.0499 9.64488 12.0987 9.62994 12.14 9.602L22.5 2.602V1.75C22.5 1.6837 22.4737 1.62011 22.4268 1.57322C22.3799 1.52634 22.3163 1.5 22.25 1.5H1.75C1.6837 1.5 1.62011 1.52634 1.57322 1.57322C1.52634 1.62011 1.5 1.6837 1.5 1.75Z" fill="#000D17"/>
                            </svg>

                            <Box sx={{
                                textAlign: 'center',
                                fontStyle: 'Regular',
                                width: '384px',
                                fontSize:'21px',
                                fontWeight: '400',
                                height: '26px',
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
                        height: '44px',
                        fontWeight: '300',
                        fontStyle:'Light',
                        fontSize:'16px',
                        cursor: 'pointer',
                        gap:'4px',
                    }}>
                        <Typography>
                            By continuing, you agree to our
                        </Typography>
                        <Typography color={theme.palette.text}>
                            Terms of Service and Privacy Policy.
                        </Typography>
                    </Box>
                    <Typography sx={{
                        cursor: 'pointer',
                        textAlign: 'center',
                        fontSize: '21px',
                        fontWeight: '500',
                        fontStyle: 'Medium',
                        paddingRight:'30px',
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