import React, { useState } from 'react'
import { Box, Button, Typography, useTheme, Snackbar, Alert, CircularProgress } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { Icon } from '@iconify/react'
import defaultUserAvatar from "../../assets/images/noImgUser.png";


const ForgotPassword1 = () => {
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Something went wrong.')
      }

      setSuccess(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', fontFamily: 'Geologica, sans-serif', backgroundColor: 'white' }}>
      <Box sx={{
        width: '90px',
        background: 'linear-gradient(180deg, #dbe5fa 0%, #dbe5fa 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '24px',
        paddingBottom: '24px',
        position: 'relative',
      }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          <Box sx={{ width: 35, height: 35 }}>
            <img src={defaultUserAvatar} alt="Logo" width="35" height="35" />
          </Box>
          <Box sx={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Icon icon="octicon:unverified-24" style={{ width: '35px', height: '35px', borderRadius: '40px' }} />
          </Box>
        </Box>

        <Box onClick={() => navigate(-1)} sx={{
          position: 'absolute',
          top: 20,
          right: -45,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}>
          <ArrowBackIcon sx={{ color: theme.palette.blue?.[700] || '#000D17' }} />
        </Box>
      </Box>

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '24px', textAlign: 'center' }}>
        <Typography fontWeight={700} fontSize={'28px'} color={'#0E0E0E'}>
          Forgot your password?
        </Typography>
        <Typography sx={{ fontSize: '14px', color: '#4A4A4A', mt: 1, mb: 4 }}>
          No worries! Enter your email address below <br />
          and we’ll send you a password reset link.
        </Typography>

        <Box component="form" onSubmit={handleSendCode} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ padding: '16px 24px', backgroundColor: '#f1f4fb', borderRadius: '100px', width: '300px' }}>
            <input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input-field w-full focus:outline-none"
              style={{
                border: 'none',
                background: 'transparent',
                width: '100%',
                fontSize: '16px',
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
              width: '300px',
              padding: '12px 16px',
              textTransform: 'none',
              fontSize: '14px',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: '#5e86f0',
              },
            }}
          >
            {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Send code'}
          </Button>
        </Box>

        <Typography sx={{ marginTop: '20px', fontSize: '14px', color: '#1e1e1e', cursor: 'pointer' }}>
          Need a help?
        </Typography>
      </Box>

      
    </Box>
  )
}

export default ForgotPassword1
