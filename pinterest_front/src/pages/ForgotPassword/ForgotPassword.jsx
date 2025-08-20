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
            <Box sx={{ width: 35.693, height: 38.482 }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="35.693" height="38.482" viewBox="0 0 36 40" fill="none">
                <path d="M35.8465 21.9758L34.028 22.6942L33.317 22.9786V23.727C33.3172 24.2429 33.2796 24.7582 33.2048 25.2686C33.1524 25.6279 32.7348 28.8781 29.5737 31.3208C27.7244 32.7494 24.5984 34.074 20.0932 33.0959C16.7135 32.3625 13.8577 30.1353 11.6403 29.2792C11.1276 29.0816 10.5701 28.9798 10.0313 28.8676C9.48048 28.7533 8.92311 28.6733 8.36239 28.6281C7.64544 28.567 6.9248 28.562 6.20707 28.6131C5.80294 28.6431 5.39134 28.688 4.98721 28.7553C4.66541 28.8077 3.19111 28.9424 1.99894 29.8884C1.61577 30.193 0.806776 31.1546 0.153442 32.3528C0.153442 32.3528 1.35085 27.65 1.98248 27.5018C2.1097 27.4719 2.22944 27.4419 2.35667 27.4195C2.97033 27.2922 3.59897 27.195 4.23509 27.1276C4.60928 27.0902 4.98347 27.0602 5.36514 27.0378C5.69443 27.0228 6.01623 27.0079 6.34552 27.0004C6.53261 26.9929 6.7197 26.9929 6.89932 26.9929C7.4157 26.9929 7.93208 27.0079 8.44846 27.0303C8.96484 27.0528 9.4887 27.0902 10.0051 27.1276L10.3942 27.165L10.7984 27.2024C11.1043 27.231 11.4117 27.241 11.7189 27.2324C12.9462 27.2099 14.1586 27.2893 15.2737 26.8178C15.8284 26.5823 16.3617 26.2994 16.8677 25.9721C17.3317 25.6653 17.7957 25.351 18.2372 25.0142C19.144 24.338 19.9881 23.5816 20.7593 22.7541C21.5464 21.9115 22.2321 20.9797 22.8023 19.9776C23.0863 19.4657 23.3363 18.9357 23.5507 18.391C23.6031 18.2489 23.6555 18.1141 23.7004 17.972C23.7453 17.8298 23.7902 17.6876 23.8351 17.5529C23.88 17.4182 23.9174 17.261 23.9548 17.1188C23.9923 16.9766 24.0297 16.8269 24.0596 16.6847C24.1831 16.0982 24.2582 15.5025 24.2841 14.9036C24.304 14.3007 24.2714 13.6973 24.1868 13.1C24.101 12.4987 23.9659 11.9055 23.7827 11.3264C23.6854 11.0345 23.5806 10.7576 23.4684 10.4732C23.4085 10.331 23.3486 10.1963 23.2813 10.0541C23.2139 9.91193 23.1466 9.77722 23.0792 9.64252C22.7967 9.10583 22.4713 8.59278 22.1063 8.10834C21.7443 7.62291 21.3465 7.16514 20.9164 6.73881C20.0745 5.90089 19.1288 5.17406 18.1025 4.576L16.8423 3.82014L15.8619 4.79303C15.5355 5.1141 15.2282 5.45394 14.9414 5.81082C14.657 6.16256 14.3876 6.52927 14.1406 6.89597C13.6511 7.63289 13.2278 8.41175 12.8759 9.22342C12.1981 10.7989 11.7568 12.4658 11.5662 14.1702C11.3762 15.8281 11.4039 17.5037 11.6485 19.1544C11.7654 19.9691 11.9405 20.7744 12.1724 21.5642C12.3913 22.3532 12.6715 23.1239 13.0106 23.8692C13.2216 23.3281 13.3286 23.0677 13.4035 22.8357C13.4881 22.5529 13.5553 22.2652 13.6048 21.9743C13.6724 21.6313 13.704 21.2821 13.6991 20.9325C13.6886 20.3017 13.6991 19.6798 13.723 19.0571C13.7913 17.5622 14.0094 16.078 14.3741 14.6267C14.7408 13.1898 15.2347 11.8203 15.9083 10.563C16.3266 9.76973 16.823 9.02014 17.3901 8.32537C17.715 8.58699 18.0248 8.86684 18.3181 9.16355C18.6315 9.47568 18.924 9.80818 19.1937 10.1589C19.4555 10.5037 19.6931 10.8663 19.9046 11.244C20.1153 11.6166 20.2979 12.0043 20.4509 12.404C20.6021 12.8001 20.7197 13.2082 20.8027 13.6239C20.8861 14.0408 20.9362 14.4637 20.9523 14.8886C20.9659 15.3186 20.9458 15.749 20.8925 16.1758C20.7778 17.0562 20.5305 17.914 20.1591 18.7203C19.7686 19.564 19.2787 20.3579 18.6997 21.0852C18.4079 21.4519 18.0786 21.8111 17.7493 22.1554C17.667 22.2452 17.5846 22.3275 17.4948 22.4098L17.2329 22.6643L16.956 22.9038C16.8662 22.9861 16.7689 23.0684 16.6716 23.1432C16.2974 23.4576 15.9008 23.7644 15.4967 24.0563C15.1226 24.3186 14.7271 24.549 14.3142 24.7448C13.8995 24.9346 13.4687 25.0874 13.027 25.2013C12.5861 25.3122 12.1344 25.3749 11.6799 25.3884C11.4529 25.402 11.2251 25.397 10.9989 25.3734L10.8118 25.3584L10.6098 25.3435L10.2056 25.3135C9.65933 25.2761 9.11302 25.2462 8.5667 25.2237C7.37678 25.1863 6.17189 25.1863 4.95952 25.2612L12.801 0.759277H23.2109L28.1877 16.2432C27.2533 16.4731 26.4011 16.9575 25.7255 17.6427C25.4312 17.94 25.177 18.2746 24.9696 18.638C24.5771 19.3241 24.3395 20.0879 24.2736 20.8757C24.2387 21.2442 24.2412 21.6153 24.2811 21.9833C24.3136 22.3391 24.3736 22.6919 24.4607 23.0385L24.4907 23.1657L24.5281 23.2929C24.5486 23.3765 24.5735 23.459 24.6029 23.5399C24.6528 23.7045 24.7127 23.8692 24.7825 24.0338C24.91 24.3522 25.0574 24.6621 25.2241 24.9618C25.0744 20.6878 26.9843 19.4178 27.1639 19.2681C27.3453 19.1256 27.538 18.9979 27.7401 18.8865C27.9448 18.7786 28.1606 18.6933 28.3837 18.632C28.4735 18.6021 28.5633 18.5871 28.6606 18.5647C28.7991 18.5369 28.939 18.5169 29.0797 18.5048C29.1171 18.5048 29.1546 18.4973 29.1845 18.4973C29.6186 18.4749 30.3654 18.5931 30.7995 18.7278C30.9041 18.7586 31.0066 18.7961 31.1063 18.8401C31.464 18.9841 31.7953 19.1864 32.0867 19.4388C32.4674 19.7746 32.7755 20.1846 32.9922 20.6437L33.2018 21.0852L33.6658 21.2424L35.8465 21.9758Z" fill="#6F91D9"/>
                <path d="M14.1883 33.4259C14.4053 33.5681 14.6299 33.7103 14.8918 33.8525L13.8515 39.2408H0.448105L3.11233 30.9413C3.36678 30.8515 3.63619 30.7766 3.90561 30.7018C4.13012 30.6419 4.34715 30.597 4.57166 30.5521C4.79618 30.5072 5.02069 30.4773 5.2452 30.4548C5.35746 30.4399 5.46972 30.4324 5.58197 30.4174C5.69423 30.4024 5.80649 30.4024 5.91874 30.4024C6.14326 30.3875 6.36777 30.395 6.59228 30.4024C7.04176 30.4161 7.48956 30.4636 7.93188 30.5446C8.37756 30.6227 8.81757 30.7302 9.24902 30.8664C9.6836 31.0038 10.1107 31.1637 10.5287 31.3454C10.9553 31.525 11.3669 31.7271 11.7785 31.9441C11.9881 32.0564 12.1901 32.1611 12.3997 32.2809L12.7065 32.453L12.8562 32.5428L12.8936 32.5653L12.9236 32.5802L12.9834 32.6176L13.5447 32.9843C13.7543 33.1415 13.9638 33.2837 14.1883 33.4259Z" fill="#6F91D9"/>
                <path d="M32.9576 31.0759L35.5844 39.2407H22.1286L21.4176 35.7084C21.6945 35.7234 21.9714 35.7383 22.2483 35.7458C23.3856 35.7659 24.5211 35.6503 25.631 35.4015C26.7429 35.1594 27.8211 34.7825 28.8415 34.279C29.8558 33.7824 30.7995 33.1533 31.648 32.408C32.1197 32 32.5577 31.5545 32.9576 31.0759Z" fill="#6F91D9"/>
              </svg>
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
