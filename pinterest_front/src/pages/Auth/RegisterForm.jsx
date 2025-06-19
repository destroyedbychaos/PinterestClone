import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useRegisterMutation } from '../../../store/Auth/AuthApi.js'
import { setCredentials } from '../../../store/slices/AuthSlice.js'
import { TextField, Button, Box, Typography } from '@mui/material'
import { useNavigate } from "react-router";

const RegisterForm = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [firstname, setFirstname] = useState('')
    const [lastname, setLastname] = useState('')
    const [register, { isLoading, error }] = useRegisterMutation()
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            if (password != confirmPassword)
            {
                console.error('Паролі не збігаються')
            }
            const response = await register({
                email,
                password,
                firstname,
                lastname,
            }).unwrap()
            dispatch(setCredentials({
                user: response.user,
                accessToken: response.accessToken
            }))
            console.log('Успішна реєстрація:', response)
            navigate('/')
        } catch (err) {
            console.error('Помилка реєстрації:', err)
        }
    }

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 400, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 2, mt: 10 }}>
            <Typography variant="h5" align="center">Register</Typography>

            <TextField
                label="FirstName"
                type="text"
                value={firstname}
                onChange={(e) => setFirstname(e.target.value)}
                variant="outlined"
                required
            />
            <TextField
                label="LastName"
                type="text"
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
                variant="outlined"
                required
            />
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
            <TextField
                label="ConfirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                variant="outlined"
                required
            />
            <Button color={'error'} variant="contained" type="submit">
                Sign up
            </Button>
        </Box>
    )
}

export default RegisterForm