import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, Button, Avatar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import SideMenu from '../../components/layout/SideMenu';
import settingsApi from '../../services/settingsApi';
import { logout } from '../../../store/slices/AuthSlice';
import '../../components/layout/DiscoverHeader.css';
import './AccountDeactivation.css';

const AccountDeactivation = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useCurrentUser();
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [userSettings, setUserSettings] = useState(null);
  const [showDeactivationModal, setShowDeactivationModal] = useState(false);
  const profileRef = useRef(null);
  const userMenuRef = useRef(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await settingsApi.getCurrentSettings();
        console.log('Settings from backend:', settings);
        setUserSettings(settings);
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };

    fetchSettings();
  }, []);

  useEffect(() => {
    console.log('User object:', user);
    console.log('User settings:', userSettings);
    console.log('Email to display:', userSettings?.email || user?.email);
  }, [user, userSettings]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target) &&
          userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleBack = () => {
    navigate('/settings');
  };

  const handleDeactivate = () => {
    setShowDeactivationModal(true);
  };

  const handleConfirmDeactivation = async () => {
    setIsDeactivating(true);
    try {
      const response = await settingsApi.deactivateAccount();
      console.log('Deactivation response:', response);
      
      alert('Account deactivated successfully! You will be logged out and redirected to the home page.');
      
      dispatch(logout());
      
      navigate('/');
    } catch (error) {
      console.error('Error deactivating account:', error);
      
      let errorMessage = 'Error deactivating account. Please try again.';
      
      if (error.response) {
        if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.status === 401) {
          errorMessage = 'You are not authorized to perform this action.';
        } else if (error.response.status === 400) {
          errorMessage = 'Invalid request. Please check your data.';
        }
      }
      
      alert(errorMessage);
    } finally {
      setIsDeactivating(false);
      setShowDeactivationModal(false);
    }
  };

  const handleCancelDeactivation = () => {
    setShowDeactivationModal(false);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <Box className="deactivation-container">
      <SideMenu />
      
      <Box className="deactivation-main-content">

        <div
          className="discover-header__profile"
          ref={profileRef}
          tabIndex={0}
          onClick={() => setShowUserMenu(v => !v)}
          style={{ 
            position: "absolute", 
            top: "48px", 
            right: "40px", 
            cursor: "pointer",
            zIndex: 1001,
            width: '267px',
            height: '64px',
            padding: '8px',
            background: 'white',
            borderRadius: '100px',
            outline: '1px #CBD7F1 solid',
            outlineOffset: '-1px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          {user?.avatarUrl ? (
            <img 
              src={user.avatarUrl} 
              alt="avatar" 
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '9999px'
              }}
            />
          ) : (
            <span style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              background: '#eaeff9', 
              borderRadius: '50%', 
              width: 42, 
              height: 42 
            }}>
            </span>
          )}
          <div style={{
            width: '192px',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '10px',
            display: 'flex'
          }}>
            <span style={{
              flex: '1 1 0',
              textAlign: 'center',
              color: '#000D17',
              fontSize: '21px',
              fontFamily: 'Geologica',
              fontWeight: '600',
              wordWrap: 'break-word'
            }}>
              {user?.displayName || user?.userName || user?.email}
            </span>
          </div>
        </div>

        {showUserMenu && (
          <div 
            className="profile-dropdown-menu" 
            ref={userMenuRef} 
            tabIndex={-1}
            style={{
              position: 'absolute',
              top: '120px',
              right: '40px',
              zIndex: 1000
            }}
          >
            <div className="profile-dropdown-menu__current">Currently in</div>
            <div className="profile-dropdown-menu__user">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="avatar" className="profile-dropdown-menu__avatar" />
              ) : (
                <span className="profile-dropdown-menu__avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eaeff9', borderRadius: '50%', width: 56, height: 56 }}>
                </span>
              )}
              <div className="profile-dropdown-menu__info">
                <div className="profile-dropdown-menu__name">{user?.displayName || user?.userName || user?.email}</div>
                <div className="profile-dropdown-menu__username">@{user?.userName || user?.displayName || user?.email}</div>
              </div>
            </div>
            <div className="profile-dropdown-menu__accounts">Your accounts</div>
            <button className="profile-dropdown-menu__btn" onClick={() => { setShowUserMenu(false); navigate('/register'); }}>Add account</button>
            <button className="profile-dropdown-menu__btn profile-dropdown-menu__btn--logout" onClick={() => {
              dispatch(logout());
              setShowUserMenu(false);
              window.location.reload();
            }}>Log out</button>
          </div>
        )}

        <div style={{
          left: '40px',
          top: '48px',
          position: 'absolute',
          justifyContent: 'flex-start',
          alignItems: 'center',
          gap: '48px',
          display: 'inline-flex'
        }}>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="48" 
            height="48" 
            viewBox="0 0 48 48" 
            fill="none"
            onClick={handleBack}
            style={{ 
              cursor: 'pointer'
            }}
          >
            <path d="M21.5601 38.0596C21.2789 38.3405 20.8976 38.4983 20.5001 38.4983C20.1026 38.4983 19.7214 38.3405 19.4401 38.0596L6.94015 25.5596C6.65924 25.2784 6.50146 24.8971 6.50146 24.4996C6.50146 24.1021 6.65924 23.7209 6.94015 23.4396L19.4401 10.9396C19.6235 10.7422 19.8567 10.5978 20.1152 10.5218C20.3737 10.4458 20.6479 10.4409 20.909 10.5076C21.17 10.5744 21.4082 10.7103 21.5985 10.9011C21.7888 11.0918 21.9241 11.3304 21.9901 11.5916C22.0568 11.8524 22.052 12.1263 21.9763 12.3846C21.9007 12.6428 21.7569 12.876 21.5601 13.0596L11.6201 22.9996H40.5001C40.898 22.9996 41.2795 23.1577 41.5608 23.439C41.8421 23.7203 42.0001 24.1018 42.0001 24.4996C42.0001 24.8975 41.8421 25.279 41.5608 25.5603C41.2795 25.8416 40.898 25.9996 40.5001 25.9996H11.6201L21.5601 35.9396C21.841 36.2209 21.9988 36.6021 21.9988 36.9996C21.9988 37.3971 21.841 37.7784 21.5601 38.0596Z" fill="#01233F"/>
          </svg>
          <span style={{
            textAlign: 'center',
            color: '#000D17',
            fontSize: '51px',
            fontFamily: 'Geologica',
            fontWeight: '700',
            wordWrap: 'break-word'
          }}>
            Account deactivation
          </span>
        </div>

        <div style={{
          width: '874px',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          position: 'absolute',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'center',
          gap: '40px',
          display: 'inline-flex'
        }}>
          <div style={{
            borderRadius: '40px',
            justifyContent: 'flex-start',
            alignItems: 'flex-end',
            gap: '24px',
            display: 'inline-flex'
          }}>
            {user?.avatarUrl ? (
              <img 
                src={user.avatarUrl} 
                alt="avatar" 
                style={{
                  width: '77px',
                  height: '77px',
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
              />
            ) : (
              <span style={{
                width: '77px',
                height: '77px',
                borderRadius: '50%',
                background: '#eaeff9',
                display: 'block'
              }} />
            )}
            <div style={{
              width: '280px',
              flexDirection: 'column',
              justifyContent: 'flex-start',
              alignItems: 'flex-start',
              gap: '16px',
              display: 'inline-flex'
            }}>
              <span style={{
                alignSelf: 'stretch',
                color: '#000D17',
                fontSize: '28px',
                fontFamily: 'Geologica',
                fontWeight: '700',
                wordWrap: 'break-word'
              }}>
                {user?.displayName || user?.userName || user?.email}
              </span>
              <span style={{
                alignSelf: 'stretch',
                color: '#52697C',
                fontSize: '21px',
                fontFamily: 'Geologica',
                fontWeight: '400',
                wordWrap: 'break-word'
              }}>
                {userSettings?.email || user?.email || 'Email not available'}
              </span>
            </div>
          </div>
          
          <div style={{
            alignSelf: 'stretch',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'center',
            gap: '32px',
            display: 'flex'
          }}>
            <div style={{
              alignSelf: 'stretch',
              flexDirection: 'column',
              justifyContent: 'flex-start',
              alignItems: 'center',
              gap: '24px',
              display: 'flex'
            }}>
              <span style={{
                textAlign: 'center',
                color: '#000D17',
                fontSize: '38px',
                fontFamily: 'Geologica',
                fontWeight: '700',
                wordWrap: 'break-word'
              }}>
                Deactivate your account
              </span>
              <span style={{
                textAlign: 'center',
                color: '#52697C',
                fontSize: '21px',
                fontFamily: 'Geologica',
                fontWeight: '400',
                wordWrap: 'break-word'
              }}>
                Deactivating your account means no one will see your Aests or your profile.<br/>
                You can reactivate your account at any time. If you want to use Aestify again, just log in.
              </span>
            </div>
            
            <button
              onClick={handleDeactivate}
              disabled={isDeactivating}
              style={{
                width: '464px',
                paddingLeft: '24px',
                paddingRight: '24px',
                paddingTop: '16px',
                paddingBottom: '16px',
                background: '#6F91D9',
                borderRadius: '100px',
                justifyContent: 'flex-start',
                alignItems: 'center',
                gap: '16px',
                display: 'inline-flex',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <div style={{
                flex: '1 1 0',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '10px',
                display: 'flex'
              }}>
                <span style={{
                  color: 'white',
                  fontSize: '21px',
                  fontFamily: 'Geologica',
                  fontWeight: '400',
                  wordWrap: 'break-word'
                }}>
                  {isDeactivating ? 'Deactivating...' : 'Continue'}
                </span>
              </div>
            </button>
          </div>
                 </div>
       </Box>

       {showDeactivationModal && (
         <Box sx={{
           position: 'fixed',
           top: 0,
           left: 0,
           right: 0,
           bottom: 0,
           backgroundColor: 'rgba(0, 0, 0, 0.5)',
           display: 'flex',
           alignItems: 'center',
           justifyContent: 'center',
           zIndex: 9999
         }} onClick={handleCancelDeactivation}>
           <Box sx={{
             width: '558px',
             padding: '40px',
             background: 'white',
             boxShadow: '-1px 10px 16px 1px rgba(1, 35, 63, 0.25)',
             borderRadius: '40px',
             flexDirection: 'column',
             justifyContent: 'flex-start',
             alignItems: 'flex-start',
             gap: '40px',
             display: 'inline-flex'
           }} onClick={(e) => e.stopPropagation()}>

             <Typography sx={{
               alignSelf: 'stretch',
               textAlign: 'center',
               color: '#000D17',
               fontSize: 38,
               fontFamily: 'Geologica',
               fontWeight: '600',
               wordWrap: 'break-word'
             }}>
               Are you sure you want to deactivate your account?
             </Typography>

             <Box sx={{
               alignSelf: 'stretch',
               flexDirection: 'column',
               justifyContent: 'flex-start',
               alignItems: 'flex-start',
               gap: '16px',
               display: 'flex'
             }}>
               <Box sx={{
                 alignSelf: 'stretch',
                 flexDirection: 'column',
                 justifyContent: 'flex-start',
                 alignItems: 'flex-start',
                 gap: '16px',
                 display: 'flex'
               }}>
                 <Typography sx={{
                   alignSelf: 'stretch',
                   textAlign: 'center',
                   color: '#000D17',
                   fontSize: 21,
                   fontFamily: 'Geologica',
                   fontWeight: '400',
                   wordWrap: 'break-word'
                 }}>
                   Your account and content will not be visible to others. If you want to use Aestify again, log in again with this email address:
                 </Typography>
               </Box>
               <Typography sx={{
                 alignSelf: 'stretch',
                 textAlign: 'center',
                 color: '#000D17',
                 fontSize: 21,
                 fontFamily: 'Geologica',
                 fontWeight: '600',
                 wordWrap: 'break-word'
               }}>
                 {userSettings?.email || user?.email || 'Email not available'}
               </Typography>
             </Box>

             <Box sx={{
               alignSelf: 'stretch',
               justifyContent: 'flex-start',
               alignItems: 'flex-start',
               gap: '24px',
               display: 'inline-flex'
             }}>

               <Box sx={{
                 flex: '1 1 0',
                 paddingLeft: '24px',
                 paddingRight: '24px',
                 paddingTop: '16px',
                 paddingBottom: '16px',
                 background: '#D7E0F4',
                 borderRadius: '100px',
                 justifyContent: 'flex-start',
                 alignItems: 'center',
                 gap: '16px',
                 display: 'flex',
                 cursor: 'pointer'
               }} onClick={handleCancelDeactivation}>
                 <Box sx={{
                   flex: '1 1 0',
                   justifyContent: 'center',
                   alignItems: 'center',
                   gap: '10px',
                   display: 'flex'
                 }}>
                   <Typography sx={{
                     color: '#000D17',
                     fontSize: 21,
                     fontFamily: 'Geologica',
                     fontWeight: '400',
                     wordWrap: 'break-word'
                   }}>
                     No
                   </Typography>
                 </Box>
               </Box>


               <Box sx={{
                 width: '227px',
                 paddingLeft: '24px',
                 paddingRight: '24px',
                 paddingTop: '16px',
                 paddingBottom: '16px',
                 background: '#E62C2F',
                 borderRadius: '100px',
                 justifyContent: 'flex-start',
                 alignItems: 'center',
                 gap: '16px',
                 display: 'flex',
                 cursor: 'pointer'
               }} onClick={handleConfirmDeactivation}>
                 <Box sx={{
                   flex: '1 1 0',
                   justifyContent: 'center',
                   alignItems: 'center',
                   gap: '10px',
                   display: 'flex'
                 }}>
                   <Typography sx={{
                     color: 'white',
                     fontSize: 21,
                     fontFamily: 'Geologica',
                     fontWeight: '400',
                     wordWrap: 'break-word'
                   }}>
                     {isDeactivating ? 'Deactivating...' : 'Yes, deactivate'}
                   </Typography>
                 </Box>
               </Box>
             </Box>
           </Box>
         </Box>
       )}
     </Box>
   );
 };

export default AccountDeactivation;
