import React, { useState } from 'react'
import { Box, Button, Typography, useTheme, CircularProgress } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'


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
    <Box sx={{ minHeight: '100vh', display: 'flex', fontFamily: 'Geologica, sans-serif', backgroundColor: 'white', paddingBottom:'80px',paddingRight:'60px' }}>
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
      }}>
        <Box onClick={() => navigate(-1)} sx={{
          position: 'absolute',
          top: 30,
          right: -35,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}>
          <Icon icon="octicon:arrow-left-24" style={{ width: '34px', height: '34px', color:'#01233F'}} />
        </Box>
      </Box>

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '24px', textAlign: 'center' }}>
        <Typography fontWeight={700} fontSize={'41px'} color={'#0E0E0E'}>
          Forgot your password?
        </Typography>
        <Typography color={theme.palette.text.primary} fontWeight={400} sx={{ fontSize: '17px', mt: 1, mb: 4 }}>
          No worries! Enter your email address below <br />
          and we’ll send you a password reset link.
        </Typography>

        <Box component="form" onSubmit={handleSendCode} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ padding: '12px 24px',height:'50px',fontWeight:'400', backgroundColor: '#f1f4fb', borderRadius: '100px', width: '400px', }}>
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
            backgroundColor={theme.palette.blue[500]}
            disabled={loading}
            sx={{
              borderRadius: '100px',
              color: 'white',
              width: '400px',
              height: '50px',
              padding: '12px 16px',
              textTransform: 'none',
              fontSize: '18px',
              fontWeight: 400,
            }}
          >
            {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Send code'}
          </Button>
        </Box>

        <Typography color={theme.palette.text.primary} sx={{ marginTop: '20px', fontSize: '18px', color: '#1e1e1e', cursor: 'pointer' }}>
          Need a help?
        </Typography>
      </Box>

      
    </Box>
  )
}

export default ForgotPassword1
