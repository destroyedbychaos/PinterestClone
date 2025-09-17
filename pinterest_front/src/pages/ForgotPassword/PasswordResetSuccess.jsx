import React from 'react'
import { Box, Button, Typography, useTheme } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { Icon } from '@iconify/react'
import defaultUserAvatar from "../../assets/images/noImgUser.png"

const PasswordResetSuccess = () => {
  const theme = useTheme()
  const navigate = useNavigate()

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
        }}
      >
        <Box
          sx={{
            display: 'flex',
            width: '849px',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '40px'
          }}
        >
          <Typography
            sx={{
              color: 'var(--Dark-900, #000D17)',
              textAlign: 'center',
              fontFamily: 'Geologica',
              fontSize: '51px',
              fontStyle: 'normal',
              fontWeight: 700,
              lineHeight: 'normal',
              alignSelf: 'stretch'
            }}
          >
            Password Successfully Reset
          </Typography>

          <Typography
            sx={{
              color: 'var(--Dark-900, #000D17)',
              textAlign: 'center',
              fontFamily: 'Geologica',
              fontSize: '21px',
              fontStyle: 'normal',
              fontWeight: 400,
              lineHeight: 'normal'
            }}
          >
            Your password has been successfully reset. You can now use your new password to log in.
          </Typography>

          <Button
            onClick={() => navigate('/login')}
            variant="contained"
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
            }}
          >
            Go to Log in
          </Button>
        </Box>
      </Box>
    </Box>
  )
}

export default PasswordResetSuccess 