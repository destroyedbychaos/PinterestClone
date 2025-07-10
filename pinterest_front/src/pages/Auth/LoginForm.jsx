import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useLoginMutation } from '../../../store/Auth/AuthApi.js'
import { setCredentials } from '../../../store/slices/AuthSlice.js'
import { TextField, Button, Box, Typography } from '@mui/material'
import { useNavigate } from "react-router";
const LoginForm = () => {
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
        <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 400, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 2,mt:10 }}>
            <Typography variant="h5" align="center">Login</Typography>

            <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                variant="outlined"
                required
            />
            <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                variant="outlined"
                required
            />
            <Button color={'error'} variant="contained" type="submit">
                Sign in
            </Button>
        </Box>
    )
}

export default LoginForm
