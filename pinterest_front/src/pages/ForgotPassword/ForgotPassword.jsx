import React, { useState } from 'react'
import { Box, Button, Typography, useTheme, CircularProgress,} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { Icon } from '@iconify/react'
import defaultUserAvatar from "../../assets/images/noImgUser.png"

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const theme = useTheme()
  const navigate = useNavigate()

  const handleSendCode = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.message && data.message.includes('не знайдено')) {
          setError('Користувача з такою поштою не знайдено')
        } else if (data.message) {
          setError(data.message)
        } else {
          setError('Something went wrong. Please try again.')
        }
        return
      }

      setSuccess(true)
      setTimeout(() => {
        navigate('/verify-code', { state: { email } })
      }, 1000)
    } catch (err) {
              setError('Connection error. Please check your internet connection.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        fontFamily: 'Geologica, sans-serif',
        backgroundColor: 'white',
        overflow: 'hidden',
      }}
    >

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',  
          alignItems: 'center',
          padding: 3,
          paddingTop: 20,                  
          textAlign: 'center',
          height: '100vh',
          overflowY: 'auto',
        }}
      >
        <Typography
          fontWeight={700}
          fontSize={28}
          color="#0E0E0E"
        >
          Forgot your password?
        </Typography>

        <Typography
          sx={{ fontSize: 14, color: '#4A4A4A', mt: 1, mb: 4 }}
        >
          No worries! Enter your email address below
          <br />
          and we’ll send you a password reset link.
        </Typography>

        <Box
          component="form"
          onSubmit={handleSendCode}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          <Box
            sx={{
              padding: '16px 24px',
              backgroundColor: '#f1f4fb',
              borderRadius: '100px',
              width: 300,
            }}
          >
            <input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                        setError('')
        setSuccess(false)
              }}
              required
              className="input-field w-full focus:outline-none"
              style={{
                border: 'none',
                background: 'transparent',
                width: '100%',
                fontSize: 16,
                outline: 'none',
              }}
            />
          </Box>

          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              borderRadius: '100px',
              backgroundColor: '#769af5',
              color: 'white',
              width: 300,
              padding: '12px 16px',
              textTransform: 'none',
              fontSize: 14,
              fontWeight: 600,
              '&:hover': { backgroundColor: '#5e86f0' },
            }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: 'white' }} />
            ) : (
              'Send code'
            )}
          </Button>
        </Box>



        {error && (
          <Box
            sx={{
              backgroundColor: '#ffebee',
              color: '#c62828',
              padding: '12px 16px',
              borderRadius: '8px',
              width: 300,
              textAlign: 'center',
              fontSize: 14,
            }}
          >
            {error}
          </Box>
        )}



        {success && (
          <Box
            sx={{
              backgroundColor: '#e8f5e8',
              color: '#2e7d32',
              padding: '12px 16px',
              borderRadius: '8px',
              width: 300,
              textAlign: 'center',
              fontSize: 14,
            }}
          >
            Код для скидання пароля надіслано на вашу пошту
          </Box>
        )}

        <Typography
          sx={{
            marginTop: 2.5,
            fontSize: 14,
            color: '#1e1e1e',
            cursor: 'pointer',
          }}
        >
          Need a help?
        </Typography>
      </Box>
    </Box>
  )
}

export default ForgotPassword
