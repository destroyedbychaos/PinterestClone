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
          setError('Щось пішло не так. Спробуйте ще раз.')
        }
        return
      }

      setSuccess(true)
      setTimeout(() => {
        navigate('/verify-code', { state: { email } })
      }, 1000)
    } catch (err) {
      setError('Помилка з\'єднання. Перевірте ваше інтернет-з\'єднання.')
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
          width: '144px',
          height: '100vh',
          backgroundColor: theme.palette.blue?.[50],
          display: 'flex',
          padding: '44px 0',
          alignItems: 'flex-start',
          gap: '10px',
          flexShrink: 0,
          position: 'relative',
          zIndex: 0,
        }}
      >
        <Box
          sx={{
            width: '108px',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '46px',
            flexShrink: 0,
            justifyContent: 'space-between',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              gap: '46px',
            }}
          >
            <Box sx={{ width: 35, height: 35 }}>
              <img
                src={defaultUserAvatar}
                alt="Logo"
                width="35"
                height="35"
              />
            </Box>
            <Box
              sx={{
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <Icon
                icon="octicon:unverified-24"
                style={{ width: 35, height: 35, borderRadius: 40 }}
              />
            </Box>
          </Box>

          <Box
            onClick={() => navigate('/login')}
            sx={{
              position: 'absolute',
              top: 20,
              right: -20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 3,
            }}
          >
            <ArrowBackIcon
              sx={{ color: theme.palette.blue?.[700] || '#000D17' }}
            />
          </Box>
        </Box>

        <Box
          sx={{
            width: '36px',
            height: '100vh',
            backgroundColor: 'white',
            zIndex: 2,
            borderRadius: '40px 0 0 0',
            position: 'absolute',
            top: 0,
            right: 0,
          }}
        />
      </Box>

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
