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