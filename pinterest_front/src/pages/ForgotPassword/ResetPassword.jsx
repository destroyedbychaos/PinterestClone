import React, { useState } from 'react'
import { Box, Button, Typography, useTheme, CircularProgress } from '@mui/material'
import { useNavigate, useLocation } from 'react-router-dom'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { Icon } from '@iconify/react'
import defaultUserAvatar from "../../assets/images/noImgUser.png"

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const theme = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  


  const { email, code } = location.state || {}
  
  React.useEffect(() => {
    if (!email || !code) {
      navigate('/forgotpassword')
    }
  }, [email, code, navigate])

  const validatePassword = (password) => {
    const minLength = password.length >= 6
    const hasNumber = /\d/.test(password)
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    
    return minLength && hasNumber && hasUpperCase && hasLowerCase
  }

  const validateNewPassword = (newPassword, confirmPassword) => {
    if (newPassword !== confirmPassword) {
      return 'Паролі не співпадають'
    }
    
    if (!validatePassword(newPassword)) {
      return 'Пароль має бути не менше 6 символів, включаючи цифри та великі/малі літери'
    }
    
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const validationError = validateNewPassword(newPassword, confirmPassword)
    if (validationError) {
      setError(validationError)
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
        const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email,
          code: code,
          newPassword: newPassword,
          confirmPassword: confirmPassword
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.message) {
          setError(data.message)
        } else {
          setError('Error changing password')
        }
        return
      }

      setSuccess(true)
      setTimeout(() => {
        navigate('/password-reset-success')
      }, 2000)
      
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
                      justifyContent: 'center',
                      alignItems: 'center',
                      padding: 3,
                      textAlign: 'center',
                      height: '100vh',
                      overflowY: 'auto',
                    }}
                  >
                            <Typography
                      sx={{
                        color: '#000D17',
                        textAlign: 'center',
                        fontFamily: 'Geologica',
                        fontSize: '51px',
                        fontStyle: 'normal',
                        fontWeight: 700,
                        lineHeight: 'normal',
                        mb: 2,
                        width: '492px'
                      }}
                    >
                      Change your password
                    </Typography>

                    <Typography
                      sx={{
                        color: '#000D17',
                        textAlign: 'center',
                        fontFamily: 'Geologica',
                        fontSize: '21px',
                        fontStyle: 'normal',
                        fontWeight: 400,
                        lineHeight: 'normal',
                        mb: 4,
                        width: '492px'
                      }}
                    >
                      Please create a new password for your account. Password must be at least 8 characters long, including numbers and upper/lowercase letters.
                    </Typography>

        {error && (
          <Box
            sx={{
              backgroundColor: '#ffebee',
              color: '#c62828',
              padding: '12px 16px',
              borderRadius: '16px',
              width: 264,
              textAlign: 'center',
              fontSize: 14,
              mb: 2,
              fontFamily: 'Geologica',
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
              borderRadius: '16px',
              width: 264,
              textAlign: 'center',
              fontSize: 14,
              mb: 2,
              fontFamily: 'Geologica',
            }}
          >
            Пароль успішно змінено!
          </Box>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ 
            display: 'flex',
            width: '848px',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '40px'
          }}
        >
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'flex-start',
                        gap: '8px', 
                        width: '464px' 
                      }}>
                        <Typography
                          sx={{
                            color: '#000D17',
                            textAlign: 'center',
                            fontFamily: 'Geologica',
                            fontSize: '16px',
                            fontStyle: 'normal',
                            fontWeight: 400,
                            lineHeight: 'normal',
                          }}
                        >
                          New password
                        </Typography>
            <Box
              sx={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <input
                type={showNewPassword ? 'text' : 'password'}
                placeholder="New password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value)
                  setError('')
                }}
                style={{
                  display: 'flex',
                  width: '464px',
                  padding: '16px 24px',
                  alignItems: 'center',
                  gap: '10px',
                  borderRadius: '100px',
                  background: 'rgba(215, 224, 244, 0.50)',
                  border: 'none',
                  fontSize: 16,
                  outline: 'none',
                  fontFamily: 'Geologica',
                  color: '#000D17',
                }}
                onFocus={(e) => {
                  e.target.style.backgroundColor = 'rgba(215, 224, 244, 0.80)'
                }}
                onBlur={(e) => {
                  e.target.style.backgroundColor = 'rgba(215, 224, 244, 0.50)'
                }}
              />
              <Box
                onClick={() => setShowNewPassword(!showNewPassword)}
                sx={{
                  position: 'absolute',
                  right: 16,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Icon
                  icon={showNewPassword ? 'mdi:eye-off' : 'mdi:eye'}
                  style={{ width: 20, height: 20, color: '#6F91D9' }}
                />
              </Box>
            </Box>
          </Box>

          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'flex-start',
            gap: '8px', 
            width: '464px' 
          }}>
            <Typography
              sx={{
                color: '#000D17',
                textAlign: 'center',
                fontFamily: 'Geologica',
                fontSize: '16px',
                fontStyle: 'normal',
                fontWeight: 400,
                lineHeight: 'normal',
              }}
            >
              Confirm password
            </Typography>
            <Box
              sx={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  setError('')
                }}
                style={{
                  display: 'flex',
                  width: '464px',
                  padding: '16px 24px',
                  alignItems: 'center',
                  gap: '10px',
                  borderRadius: '100px',
                  background: 'rgba(215, 224, 244, 0.50)',
                  border: 'none',
                  fontSize: 16,
                  outline: 'none',
                  fontFamily: 'Geologica',
                  color: '#000D17',
                }}
                onFocus={(e) => {
                  e.target.style.backgroundColor = 'rgba(215, 224, 244, 0.80)'
                }}
                onBlur={(e) => {
                  e.target.style.backgroundColor = 'rgba(215, 224, 244, 0.50)'
                }}
              />
              <Box
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                sx={{
                  position: 'absolute',
                  right: 16,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Icon
                  icon={showConfirmPassword ? 'mdi:eye-off' : 'mdi:eye'}
                  style={{ width: 20, height: 20, color: '#6F91D9' }}
                />
              </Box>
            </Box>
          </Box>

                                <Button
                        type="submit"
                        variant="contained"
                        disabled={loading || !newPassword || !confirmPassword}
                        sx={{
                          display: 'flex',
                          width: '464px',
                          padding: '16px 24px',
                          alignItems: 'center',
                          gap: '16px',
                          borderRadius: '100px',
                          background: 'var(--Blue-500, #6F91D9)',
                          color: 'white',
                          textTransform: 'none',
                          fontSize: '16px',
                          fontWeight: 600,
                          fontFamily: 'Geologica',
                          '&:hover': { backgroundColor: '#5A7BC7' },
                          '&:disabled': { backgroundColor: '#B4C6EB' },
                        }}
                      >
            {loading ? (
              <CircularProgress size={24} sx={{ color: 'white' }} />
            ) : (
              'Update password'
            )}
          </Button>
        </Box>
      </Box>
    </Box>
  )
}

export default ResetPassword 