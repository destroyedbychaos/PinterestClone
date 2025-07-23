import React, { useState, useRef, useEffect } from 'react'
import { Box, Button, Typography, useTheme, CircularProgress } from '@mui/material'
import { useNavigate, useLocation } from 'react-router-dom'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { Icon } from '@iconify/react'
import defaultUserAvatar from "../../assets/images/noImgUser.png"

const VerifyCode = () => {
  const [code, setCode] = useState(['', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendLoading, setResendLoading] = useState(false)
  const theme = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  
  const email = location.state?.email || new URLSearchParams(location.search).get('email')
  
  const inputRefs = useRef([])

  useEffect(() => {
    if (!email) {
      navigate('/forgotpassword')
    }
  }, [email, navigate])

  const handleCodeChange = (index, value) => {
    if (value.length > 1) return

    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)

    if (value && inputRefs.current[index]) {
      const input = inputRefs.current[index]
      input.style.transform = 'scale(1.08)'
      input.style.boxShadow = '0 6px 20px rgba(111, 145, 217, 0.4)'
      
      setTimeout(() => {
        input.style.transform = 'scale(1.05)'
        input.style.boxShadow = '0 4px 12px rgba(111, 145, 217, 0.3)'
      }, 120)
    }

    if (value && index < 3) {
      setTimeout(() => {
        inputRefs.current[index + 1]?.focus()
      }, 150)
    }

    setError('')
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const codeString = code.join('')
    if (codeString.length !== 4) {
      setError('Будь ласка, введіть 4-значний код')
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/auth/verify-reset-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email,
          code: codeString 
        }),
      })

      const data = await response.json()

                        if (!response.ok) {
                    if (data.message) {
                      setError(data.message)
                    } else {
                      setError('Невірний код або код застарів')
                    }
                    return
                  }

                  navigate('/reset-password', {
                    state: {
                      email: email,
                      code: codeString
                    }
                  })
      
    } catch (err) {
      setError('Помилка з\'єднання. Перевірте ваше інтернет-з\'єднання.')
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    setResendLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

                        if (!response.ok) {
                    if (data.message) {
                      setError(data.message)
                    } else {
                      setError('Не вдалося надіслати код. Спробуйте пізніше.')
                    }
                    return
                  }
                  setError('')
    
      
    } catch (err) {
      setError('Помилка з\'єднання. Перевірте ваше інтернет-з\'єднання.')
    } finally {
      setResendLoading(false)
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
            onClick={() => navigate('/forgotpassword')}
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
            mb: 2
          }}
        >
          Enter Verification Code
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
            maxWidth: 500
          }}
        >
          We've sent a 4-digit verification code to your email address. 
          Please enter it below to proceed with your password reset.
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



        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 3, 
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            maxWidth: 400
          }}
        >
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            {[0, 1, 2, 3].map((index) => (
              <Box
                key={index}
                sx={{
                  position: 'relative',
                  width: '48px',
                  height: '48px',
                }}
              >
                <input
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  maxLength={1}
                  value={code[index]}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  style={{
                    display: 'flex',
                    width: '48px',
                    height: '48px',
                    padding: '16px',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '10px',
                    borderRadius: '16px',
                    background: 'rgba(215, 224, 244, 0.50)',
                    border: 'none',
                    fontSize: '24px',
                    textAlign: 'center',
                    outline: 'none',
                    color: '#000D17',
                    fontFamily: 'Geologica',
                    fontWeight: 600,
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: code[index] ? 'scale(1.05)' : 'scale(1)',
                    boxShadow: code[index] ? '0 4px 12px rgba(111, 145, 217, 0.3)' : 'none',
                  }}
                  onFocus={(e) => {
                    e.target.style.background = 'rgba(215, 224, 244, 0.80)'
                    e.target.style.transform = 'scale(1.05)'
                    e.target.style.boxShadow = '0 4px 12px rgba(111, 145, 217, 0.3)'
                  }}
                  onBlur={(e) => {
                    e.target.style.background = code[index] ? 'rgba(215, 224, 244, 0.70)' : 'rgba(215, 224, 244, 0.50)'
                    e.target.style.transform = code[index] ? 'scale(1.05)' : 'scale(1)'
                    e.target.style.boxShadow = code[index] ? '0 4px 12px rgba(111, 145, 217, 0.3)' : 'none'
                  }}
                />
                
                {!code[index] && (
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: '8px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '20px',
                      height: '2px',
                      background: '#6F91D9',
                      borderRadius: '1px',
                      pointerEvents: 'none',
                      animation: 'blink 2s ease-in-out infinite',
                      '@keyframes blink': {
                        '0%, 40%': { opacity: 1 },
                        '50%, 90%': { opacity: 0.2 },
                        '100%': { opacity: 1 },
                      },
                    }}
                  />
                )}
              </Box>
            ))}
          </Box>

          <Button
            type="submit"
            variant="contained"
            disabled={loading || code.join('').length !== 4}
            sx={{
              display: 'flex',
              width: '264px',
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
              'Submit'
            )}
          </Button>
        </Box>

        <Typography
          onClick={handleResendCode}
          disabled={resendLoading}
          sx={{
            marginTop: 3,
            fontSize: '16px',
            color: '#000D17',
            cursor: resendLoading ? 'not-allowed' : 'pointer',
            opacity: resendLoading ? 0.6 : 1,
            fontFamily: 'Geologica',
            fontWeight: 400,
            textAlign: 'center',
          }}
        >
          {resendLoading ? 'Надсилання...' : (
            <>
              Didn't receive the code?{' '}
              <span style={{ color: '#6F91D9', cursor: 'pointer' }}>
                Resend code
              </span>
            </>
          )}
        </Typography>
      </Box>
    </Box>
  )
}

export default VerifyCode 