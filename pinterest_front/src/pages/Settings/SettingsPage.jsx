import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  RadioGroup,
  FormControlLabel,
  Radio,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { KeyboardArrowDown, Visibility, VisibilityOff, CalendarToday } from '@mui/icons-material';
import SideMenu from '../../components/layout/SideMenu';
import settingsApi from '../../services/settingsApi';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { logout, updateUser } from '../../../store/slices/AuthSlice';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import './SettingsPage.css';
import '../../components/layout/DiscoverHeader.css';

const SettingsPage = () => {
  const user = useCurrentUser();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const profileRef = useRef(null);
  const userMenuRef = useRef(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [activeTab, setActiveTab] = useState('Account management');
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState(null);
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changePasswordError, setChangePasswordError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    phoneNumber: '',
    password: '•••••••••',
    displayName: '',
    userName: '',
    bio: '',
    birthDate: '',
    gender: 'Female',
    country: 'Ukraine (Україна)',
    language: 'English (UK)',
    isProfilePublic: true
  });


  const savePasswordToStorage = (password) => {
    localStorage.setItem('userPassword', password);
  };


  const getPasswordFromStorage = () => {
    return localStorage.getItem('userPassword');
  };

  const tabs = [
    'Account management',
    'Profile visibility',
    'Set up your home feed',
    'Social permissions',
    'Notifications',
    'Security'
  ];

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await settingsApi.getCurrentSettings();
        console.log('Settings from server:', settings);
        

        let formattedBirthDate = '';
        if (settings.birthDate) {
          const date = new Date(settings.birthDate);
          formattedBirthDate = date.toISOString().split('T')[0]; 
          console.log('Formatted birthDate:', formattedBirthDate);
        }
        
        setFormData(prev => ({
          ...prev,
          ...settings,
          birthDate: formattedBirthDate,
          password: settings.password || '•••••••••' 
        }));
      } catch (error) {
        console.error('Error fetching settings:', error);
   
        if (user) {
          let formattedBirthDate = '';
          if (user.birthDate) {
            const date = new Date(user.birthDate);
            formattedBirthDate = date.toISOString().split('T')[0];
          }
          
          setFormData(prev => ({
            ...prev,
            email: user.email || '',
            phoneNumber: user.phoneNumber || '',
            displayName: user.displayName || '',
            userName: user.userName || '',
            bio: user.bio || '',
            birthDate: formattedBirthDate,
            gender: user.gender || 'Female',
            country: user.country || 'Ukraine (Україна)',
            language: user.language || 'English (UK)',
            isProfilePublic: user.isProfilePublic !== undefined ? user.isProfilePublic : true,
            password: 'TestPassword123!'
          }));
        }
      }
    };

    fetchSettings();
  }, [user]);


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

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handlePasswordVisibility = async () => {
    if (!showPassword) {
      if (!currentPassword) {
        setIsLoadingPassword(true);
        try {
          const storedPassword = getPasswordFromStorage();
          if (storedPassword) {
            setCurrentPassword(storedPassword);
            setShowPassword(true);
          } else {

            setShowPassword(true);
          }
        } catch (error) {
          console.error('Error fetching password:', error);
          setShowPassword(true);
        } finally {
          setIsLoadingPassword(false);
        }
      } else {
        setShowPassword(true);
      }
    } else {
      setShowPassword(false);
    }
  };



  const handleSaveSettings = async () => {
    try {
      const settingsData = {
        email: formData.email || null,
        phoneNumber: formData.phoneNumber || null,
        bio: formData.bio || null,
        birthDate: formData.birthDate ? new Date(formData.birthDate).toISOString() : null,
        gender: formData.gender || null,
        country: formData.country || null,
        language: formData.language || null,
        isProfilePublic: formData.isProfilePublic !== undefined ? formData.isProfilePublic : true
      };
      await settingsApi.updateSettings(settingsData);
      
 
      dispatch(updateUser(settingsData));
      
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings');
    }
  };

 
  const handleInputChange = (field, value) => {
    console.log(`Field ${field} changed to:`, value);
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    clearTimeout(window.saveTimeout);
    window.saveTimeout = setTimeout(async () => {
      try {
        setIsSaving(true);
        const settingsData = {
          email: formData.email || null,
          phoneNumber: formData.phoneNumber || null,
          bio: formData.bio || null,
          birthDate: formData.birthDate ? new Date(formData.birthDate).toISOString() : null,
          gender: formData.gender || null,
          country: formData.country || null,
          language: formData.language || null,
          isProfilePublic: formData.isProfilePublic !== undefined ? formData.isProfilePublic : true
        };
        
        console.log('Original birthDate:', formData.birthDate);
        console.log('Processed birthDate:', formData.birthDate ? new Date(formData.birthDate).toISOString() : null);
        
        const changedData = {};
        Object.keys(settingsData).forEach(key => {
          const currentValue = settingsData[key];
          const userValue = user[key];
          
          console.log(`Comparing ${key}:`, { currentValue, userValue });
          
          if (currentValue !== userValue && 
              !(currentValue === '' && (userValue === null || userValue === undefined || userValue === '')) &&
              !(userValue === '' && (currentValue === null || currentValue === undefined))) {
            changedData[key] = currentValue;
            console.log(`Field ${key} marked as changed`);
          }
        });

        if (Object.keys(changedData).length > 0) {
          await settingsApi.updateSettings(changedData);
          console.log('Settings auto-saved:', changedData);
          
          dispatch(updateUser(changedData));
        }
      } catch (error) {
        console.error('Error auto-saving settings:', error);
      } finally {
        setIsSaving(false);
      }
    }, 1000);
  };

  const handleChangePassword = () => {
    setShowChangePasswordModal(true);
  };

  const handleChangePasswordSubmit = async () => {
    try {
      setChangePasswordError(''); 

      if (!newPassword || !confirmPassword) {
        setChangePasswordError('Please fill in all fields');
        return;
      }

      if (newPassword !== confirmPassword) {
        setChangePasswordError('Passwords do not match!');
        return;
      }

      await settingsApi.changePassword({
        currentPassword: null, 
        newPassword: newPassword
      });

      setCurrentPassword(newPassword);
      
      savePasswordToStorage(newPassword);
      
      setFormData(prev => ({
        ...prev,
        password: newPassword
      }));

      setShowChangePasswordModal(false);
      setNewPassword('');
      setConfirmPassword('');
      setShowNewPassword(false);
      setShowConfirmPassword(false);
      setChangePasswordError('');

      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error changing password:', error);
      setChangePasswordError('Error changing password. Please try again.');
    }
  };

  const handleChangePasswordModalClose = () => {
    setShowChangePasswordModal(false);
    setNewPassword('');
    setConfirmPassword('');
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setChangePasswordError('');
  };

  const handleDeactivateAccount = () => {
    navigate('/account-deactivation');
  };

  const handleDeleteAccount = () => {
    navigate('/account-deletion');
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <Box className="settings-container" sx={{ position: 'relative' }}>
      <SideMenu />
      
      <Box className="settings-main-content">
        <div
          className="discover-header__profile"
          ref={profileRef}
          tabIndex={0}
          onClick={() => setShowUserMenu(v => !v)}
          style={{ 
            position: "absolute", 
            top: "20px", 
            right: "40px", 
            cursor: "pointer",
            zIndex: 1001
          }}
        >
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt="avatar" className="discover-header__avatar-img" />
          ) : (
            <span className="discover-header__avatar-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eaeff9', borderRadius: '50%', width: 48, height: 48 }}>
            </span>
          )}
          <span className="discover-header__profile-name">
            {user?.displayName || user?.userName || user?.email}
          </span>
        </div>

        {showUserMenu && (
          <div 
            className="profile-dropdown-menu" 
            ref={userMenuRef} 
            tabIndex={-1}
            style={{
              position: 'absolute',
              top: '80px',
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

        <Typography className="settings-title">
          Settings
        </Typography>

        <Box className="settings-section-header">
          <Typography className="settings-section-title">
            Account management
          </Typography>
          <Typography className="settings-section-subtitle">
            Make changes to your personal information.
          </Typography>
        </Box>

        <Box className="settings-tabs-container">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`settings-tab-button ${activeTab === tab ? 'settings-tab-active' : ''}`}
              onClick={() => handleTabChange(tab)}
            >
              <Typography className="settings-tab-text">
                {tab}
              </Typography>
            </button>
          ))}
        </Box>

        <Box className="settings-content-area">
          {activeTab === 'Account management' ? (
            <Box className="settings-cards-container">

              <Card className="settings-card">
                <CardContent className="settings-card-content">
                  <Typography className="settings-card-title">
                    Log in
                  </Typography>
                  
                  <Box className="settings-form-section">
                    <Box className="settings-field-group">
                      <Typography className="settings-field-label">
                        E-mail address
                      </Typography>
                      <TextField
                        className="settings-input"
                        value={formData.email || ''}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="vitadidovets123@gmail.com"
                        fullWidth
                      />
                    </Box>

                    <Box className="settings-field-group">
                      <Typography className="settings-field-label">
                        Phone number
                      </Typography>
                      <TextField
                        className="settings-input"
                        value={formData.phoneNumber || ''}
                        onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                        placeholder="Enter your phone number"
                        fullWidth
                      />
                    </Box>

                    <Box className="settings-field-group">
                      <Typography className="settings-field-label">
                        Password
                      </Typography>
                      <TextField
                        className="settings-input"
                        type={showPassword ? 'text' : 'password'}
                        value={showPassword ? (currentPassword || formData.password) : formData.password}
                        disabled
                        fullWidth
                        InputProps={{
                          endAdornment: (
                            <IconButton 
                              onClick={handlePasswordVisibility}
                              disabled={isLoadingPassword}
                            >
                              {isLoadingPassword ? (
                                <Box sx={{ width: 20, height: 20, border: '2px solid #ccc', borderTop: '2px solid #666', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                              ) : (
                                showPassword ? <VisibilityOff /> : <Visibility />
                              )}
                            </IconButton>
                          ),
                        }}
                      />
                    </Box>

                    <Button 
                      className="settings-button"
                      onClick={handleChangePassword}
                      fullWidth
                    >
                      Change password
                    </Button>
                  </Box>
                </CardContent>
              </Card>

              <Card className="settings-card">
                <CardContent className="settings-card-content">
                  <Typography className="settings-card-title">
                    Personal information
                  </Typography>
                  
                  <Box className="settings-form-section">
                    <Box className="settings-field-group">
                      <Typography className="settings-field-label">
                        Date of birth
                      </Typography>
                      <TextField
                        className="settings-input"
                        type="date"
                        value={formData.birthDate || ''}
                        onChange={(e) => handleInputChange('birthDate', e.target.value)}
                        placeholder="01/03/2005"
                        fullWidth
                      />
                    </Box>

                    <Box className="settings-field-group">
                      <Typography className="settings-field-label">
                        Gender
                      </Typography>
                      <RadioGroup
                        className="settings-radio-group"
                        value={formData.gender || 'Female'}
                        onChange={(e) => handleInputChange('gender', e.target.value)}
                        row
                      >
                        <FormControlLabel value="Female" control={<Radio />} label="Female" />
                        <FormControlLabel value="Male" control={<Radio />} label="Male" />
                        <FormControlLabel value="Other" control={<Radio />} label="Other" />
                      </RadioGroup>
                    </Box>

                    <Box className="settings-field-group">
                      <Typography className="settings-field-label">
                        Country
                      </Typography>
                      <FormControl fullWidth className="settings-select">
                        <Select
                          value={formData.country || 'Ukraine (Україна)'}
                          onChange={(e) => handleInputChange('country', e.target.value)}
                          IconComponent={KeyboardArrowDown}
                        >
                          <MenuItem value="Ukraine (Україна)">Ukraine (Україна)</MenuItem>
                          <MenuItem value="United States">United States</MenuItem>
                          <MenuItem value="United Kingdom">United Kingdom</MenuItem>
                          <MenuItem value="Canada">Canada</MenuItem>
                          <MenuItem value="Germany">Germany</MenuItem>
                          <MenuItem value="France">France</MenuItem>
                          <MenuItem value="Poland">Poland</MenuItem>
                          <MenuItem value="Belarus">Belarus</MenuItem>
                          <MenuItem value="Kazakhstan">Kazakhstan</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>

                    <Box className="settings-field-group">
                      <Typography className="settings-field-label">
                        Language
                      </Typography>
                      <FormControl fullWidth className="settings-select">
                        <Select
                          value={formData.language || 'English (UK)'}
                          onChange={(e) => handleInputChange('language', e.target.value)}
                          IconComponent={KeyboardArrowDown}
                        >
                          <MenuItem value="English (UK)">English (UK)</MenuItem>
                          <MenuItem value="English (US)">English (US)</MenuItem>
                          <MenuItem value="Ukrainian">Ukrainian</MenuItem>
                          <MenuItem value="German">German</MenuItem>
                          <MenuItem value="French">French</MenuItem>
                          <MenuItem value="Polish">Polish</MenuItem>
                          <MenuItem value="Spanish">Spanish</MenuItem>
                          <MenuItem value="Italian">Italian</MenuItem>
                          <MenuItem value="Portuguese">Portuguese</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              <Card className="settings-card">
                <CardContent className="settings-card-content">
                  <Typography className="settings-card-title">
                    Deactivation and deletion
                  </Typography>
                  
                  <Box className="settings-form-section">
                    <Box className="settings-action-group">
                      <Typography className="settings-action-title">
                        Deactivation and deletion
                      </Typography>
                      <Typography className="settings-action-description">
                        Temporarily hide your profile, Aests and boards
                      </Typography>
                    </Box>
                    <Button 
                      className="settings-button"
                      onClick={handleDeactivateAccount}
                      fullWidth
                    >
                      Deactivate account
                    </Button>
                  </Box>

                  <Box className="settings-form-section">
                    <Box className="settings-action-group">
                      <Typography className="settings-action-title">
                        Delete your data and account
                      </Typography>
                      <Typography className="settings-action-description">
                        Permanently delete your data and everything associated with your account
                      </Typography>
                    </Box>
                    <Button 
                      className="settings-button-danger"
                      onClick={handleDeleteAccount}
                      fullWidth
                    >
                      Delete account
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          ) : (
            <Box className="settings-coming-soon">
              <Typography variant="h5">
                {activeTab} - Coming Soon
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      <Dialog 
        open={showChangePasswordModal} 
        onClose={handleChangePasswordModalClose}
        maxWidth="sm"
        PaperProps={{
          sx: {
            width: '558px',
            padding: '40px',
            background: 'white',
            boxShadow: '-1px 10px 16px 1px rgba(1, 35, 63, 0.25)',
            borderRadius: '40px',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            gap: '40px',
            display: 'inline-flex',
            margin: '20px'
          }
        }}
      >
        <Box sx={{ 
          alignSelf: 'stretch', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          display: 'inline-flex'
        }}>
          <Typography sx={{ 
            color: '#011D35', 
            fontSize: 28, 
            fontFamily: 'Geologica', 
            fontWeight: '600', 
            wordWrap: 'break-word'
          }}>
            Change password
          </Typography>
          <Box sx={{ 
            width: '40px', 
            height: '40px', 
            position: 'relative',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }} onClick={handleChangePasswordModalClose}>
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none">
              <path d="M9.53329 9.53367C9.76767 9.29959 10.0854 9.16811 10.4166 9.16811C10.7479 9.16811 11.0656 9.29959 11.3 9.53367L20 18.2337L28.7 9.53367C28.8527 9.36913 29.0471 9.24885 29.2625 9.18549C29.4779 9.12213 29.7064 9.11805 29.924 9.17367C30.1415 9.2293 30.34 9.34256 30.4986 9.50154C30.6572 9.66052 30.7699 9.85932 30.825 10.077C30.8805 10.2943 30.8765 10.5225 30.8134 10.7378C30.7504 10.953 30.6306 11.1473 30.4666 11.3003L21.7666 20.0003L30.4666 28.7003C30.6312 28.8531 30.7515 29.0475 30.8148 29.2629C30.8782 29.4783 30.8822 29.7068 30.8266 29.9244C30.771 30.1419 30.6577 30.3404 30.4988 30.499C30.3398 30.6575 30.141 30.7703 29.9233 30.8253C29.706 30.8809 29.4778 30.8769 29.2625 30.8138C29.0473 30.7508 28.853 30.631 28.7 30.467L20 21.767L11.3 30.467C11.063 30.6881 10.7495 30.8085 10.4256 30.8029C10.1016 30.7973 9.79242 30.6661 9.56329 30.437C9.33417 30.2079 9.20298 29.8987 9.19738 29.5747C9.19179 29.2507 9.31222 28.9373 9.53329 28.7003L18.2333 20.0003L9.53329 11.3003C9.29921 11.066 9.16772 10.7483 9.16772 10.417C9.16772 10.0858 9.29921 9.76805 9.53329 9.53367Z" fill="#000D17"/>
            </svg>
          </Box>
        </Box>

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
            gap: '8px', 
            display: 'flex'
          }}>
            <Box sx={{ 
              alignSelf: 'stretch', 
              paddingLeft: '16px', 
              paddingRight: '16px', 
              justifyContent: 'center', 
              alignItems: 'center', 
              gap: '10px', 
              display: 'inline-flex'
            }}>
              <Typography sx={{ 
                flex: '1 1 0', 
                color: '#01233F', 
                fontSize: 16, 
                fontFamily: 'Geologica', 
                fontWeight: '300', 
                wordWrap: 'break-word'
              }}>
                New password
              </Typography>
            </Box>
            <Box sx={{ 
              alignSelf: 'stretch', 
              flexDirection: 'column', 
              justifyContent: 'flex-start', 
              alignItems: 'flex-start', 
              gap: '4px', 
              display: 'flex'
            }}>
              <Box sx={{ 
                alignSelf: 'stretch', 
                paddingLeft: '24px', 
                paddingRight: '24px', 
                paddingTop: '16px', 
                paddingBottom: '16px', 
                background: 'var(--Imput, rgba(215, 224, 244, 0.50))', 
                borderRadius: '100px', 
                justifyContent: 'flex-start', 
                alignItems: 'center', 
                gap: '10px', 
                display: 'inline-flex'
              }}>
                <TextField
                  fullWidth
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password"
                  variant="standard"
                  sx={{
                    '& .MuiInput-root': {
                      color: '#7B8D9B',
                      fontSize: '21px',
                      fontFamily: 'Geologica',
                      fontWeight: '400',
                      '& input::placeholder': {
                        color: '#7B8D9B',
                        opacity: 1
                      }
                    },
                    '& .MuiInput-underline:before': { borderBottom: 'none' },
                    '& .MuiInput-underline:after': { borderBottom: 'none' },
                    '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottom: 'none' }
                  }}
                />
                <Box sx={{ 
                  width: '24px', 
                  height: '24px', 
                  position: 'relative',
                  cursor: 'pointer'
                }} onClick={() => setShowNewPassword(!showNewPassword)}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M8.05207 5.837C9.29483 5.28429 10.6399 4.99912 12.0001 5C14.9551 5 17.3091 6.315 19.0601 7.864C20.8161 9.417 21.9261 11.171 22.3671 11.944C22.3777 11.9604 22.3832 11.9795 22.3831 11.999C22.3839 12.0203 22.378 12.0413 22.3661 12.059C21.9156 12.8377 21.404 13.5793 20.8361 14.277C20.77 14.3529 20.7199 14.4413 20.6887 14.5369C20.6575 14.6326 20.6459 14.7335 20.6545 14.8337C20.6631 14.934 20.6918 15.0314 20.7389 15.1203C20.786 15.2093 20.8504 15.2878 20.9285 15.3513C21.0065 15.4148 21.0965 15.4619 21.1932 15.4899C21.2898 15.5178 21.3911 15.5261 21.491 15.5141C21.5909 15.5022 21.6873 15.4702 21.7746 15.4202C21.8619 15.3702 21.9382 15.3031 21.9991 15.223C22.6208 14.4632 23.1793 13.6539 23.6691 12.803C23.809 12.5593 23.8828 12.2832 23.883 12.0021C23.8831 11.7211 23.8097 11.4449 23.6701 11.201C23.1851 10.351 21.9801 8.444 20.0541 6.741C18.1241 5.034 15.4321 3.5 12.0001 3.5C10.3051 3.5 8.78507 3.874 7.44807 4.463C7.26698 4.54373 7.12523 4.69289 7.05381 4.87785C6.98239 5.06281 6.98712 5.26853 7.06696 5.45001C7.14679 5.6315 7.29525 5.77398 7.47985 5.84632C7.66446 5.91865 7.87019 5.91594 8.05207 5.837ZM19.1661 17.987C17.3281 19.38 14.9331 20.5 12.0001 20.5C8.56807 20.5 5.87507 18.966 3.94607 17.26C2.02007 15.556 0.814071 13.648 0.330071 12.798C0.189793 12.5547 0.116036 12.2787 0.116211 11.9979C0.116387 11.717 0.190489 11.4411 0.331071 11.198C1.22591 9.64725 2.34349 8.23622 3.64807 7.01L1.31707 5.362C1.23355 5.30645 1.16202 5.2347 1.10671 5.15102C1.05141 5.06733 1.01346 4.9734 0.995097 4.87478C0.976739 4.77617 0.978349 4.67487 0.999833 4.57689C1.02132 4.4789 1.06224 4.38623 1.12018 4.30434C1.17811 4.22245 1.25189 4.15302 1.33713 4.10015C1.42238 4.04728 1.51736 4.01205 1.61647 3.99654C1.71557 3.98103 1.81678 3.98556 1.9141 4.00985C2.01143 4.03415 2.10289 4.07773 2.18307 4.138L22.6831 18.638C22.7666 18.6936 22.8381 18.7653 22.8934 18.849C22.9487 18.9327 22.9867 19.0266 23.005 19.1252C23.0234 19.2238 23.0218 19.3251 23.0003 19.4231C22.9788 19.5211 22.9379 19.6138 22.88 19.6957C22.822 19.7775 22.7483 19.847 22.663 19.8999C22.5778 19.9527 22.4828 19.988 22.3837 20.0035C22.2846 20.019 22.1834 20.0144 22.086 19.9901C21.9887 19.9658 21.8973 19.9223 21.8171 19.862L19.1661 17.987ZM4.90207 7.898C3.17207 9.439 2.07407 11.171 1.63407 11.942C1.62236 11.9594 1.61641 11.98 1.61707 12.001C1.61574 12.0163 1.62107 12.0347 1.63307 12.056C2.07407 12.83 3.18407 14.583 4.94007 16.136C6.69007 17.685 9.04507 19 12.0001 19C14.3341 19 16.2901 18.18 17.8741 17.073L14.3581 14.586C13.7684 15.1243 13.0125 15.4448 12.2156 15.4944C11.4188 15.544 10.6289 15.3197 9.97713 14.8586C9.32532 14.3976 8.85072 13.7275 8.63208 12.9597C8.41343 12.1918 8.46389 11.3722 8.77507 10.637L4.90207 7.899V7.898Z" fill="#52697C"/>
                  </svg>
                </Box>
              </Box>
            </Box>
          </Box>

          <Box sx={{ 
            alignSelf: 'stretch', 
            flexDirection: 'column', 
            justifyContent: 'flex-start', 
            alignItems: 'flex-start', 
            gap: '8px', 
            display: 'flex'
          }}>
            <Box sx={{ 
              alignSelf: 'stretch', 
              paddingLeft: '16px', 
              paddingRight: '16px', 
              justifyContent: 'center', 
              alignItems: 'center', 
              gap: '10px', 
              display: 'inline-flex'
            }}>
              <Typography sx={{ 
                flex: '1 1 0', 
                color: '#01233F', 
                fontSize: 16, 
                fontFamily: 'Geologica', 
                fontWeight: '300', 
                wordWrap: 'break-word'
              }}>
                Confirm password
              </Typography>
            </Box>
            <Box sx={{ 
              alignSelf: 'stretch', 
              flexDirection: 'column', 
              justifyContent: 'flex-start', 
              alignItems: 'flex-start', 
              gap: '4px', 
              display: 'flex'
            }}>
              <Box sx={{ 
                alignSelf: 'stretch', 
                paddingLeft: '24px', 
                paddingRight: '24px', 
                paddingTop: '16px', 
                paddingBottom: '16px', 
                background: 'var(--Imput, rgba(215, 224, 244, 0.50))', 
                borderRadius: '100px', 
                justifyContent: 'flex-start', 
                alignItems: 'center', 
                gap: '10px', 
                display: 'inline-flex'
              }}>
                <TextField
                  fullWidth
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  variant="standard"
                  sx={{
                    '& .MuiInput-root': {
                      color: '#7B8D9B',
                      fontSize: '21px',
                      fontFamily: 'Geologica',
                      fontWeight: '400',
                      '& input::placeholder': {
                        color: '#7B8D9B',
                        opacity: 1
                      }
                    },
                    '& .MuiInput-underline:before': { borderBottom: 'none' },
                    '& .MuiInput-underline:after': { borderBottom: 'none' },
                    '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottom: 'none' }
                  }}
                />
                <Box sx={{ 
                  width: '24px', 
                  height: '24px', 
                  position: 'relative',
                  cursor: 'pointer'
                }} onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M8.05207 5.837C9.29483 5.28429 10.6399 4.99912 12.0001 5C14.9551 5 17.3091 6.315 19.0601 7.864C20.8161 9.417 21.9261 11.171 22.3671 11.944C22.3777 11.9604 22.3832 11.9795 22.3831 11.999C22.3839 12.0203 22.378 12.0413 22.3661 12.059C21.9156 12.8377 21.404 13.5793 20.8361 14.277C20.77 14.3529 20.7199 14.4413 20.6887 14.5369C20.6575 14.6326 20.6459 14.7335 20.6545 14.8337C20.6631 14.934 20.6918 15.0314 20.7389 15.1203C20.786 15.2093 20.8504 15.2878 20.9285 15.3513C21.0065 15.4148 21.0965 15.4619 21.1932 15.4899C21.2898 15.5178 21.3911 15.5261 21.491 15.5141C21.5909 15.5022 21.6873 15.4702 21.7746 15.4202C21.8619 15.3702 21.9382 15.3031 21.9991 15.223C22.6208 14.4632 23.1793 13.6539 23.6691 12.803C23.809 12.5593 23.8828 12.2832 23.883 12.0021C23.8831 11.7211 23.8097 11.4449 23.6701 11.201C23.1851 10.351 21.9801 8.444 20.0541 6.741C18.1241 5.034 15.4321 3.5 12.0001 3.5C10.3051 3.5 8.78507 3.874 7.44807 4.463C7.26698 4.54373 7.12523 4.69289 7.05381 4.87785C6.98239 5.06281 6.98712 5.26853 7.06696 5.45001C7.14679 5.6315 7.29525 5.77398 7.47985 5.84632C7.66446 5.91865 7.87019 5.91594 8.05207 5.837ZM19.1661 17.987C17.3281 19.38 14.9331 20.5 12.0001 20.5C8.56807 20.5 5.87507 18.966 3.94607 17.26C2.02007 15.556 0.814071 13.648 0.330071 12.798C0.189793 12.5547 0.116036 12.2787 0.116211 11.9979C0.116387 11.717 0.190489 11.4411 0.331071 11.198C1.22591 9.64725 2.34349 8.23622 3.64807 7.01L1.31707 5.362C1.23355 5.30645 1.16202 5.2347 1.10671 5.15102C1.05141 5.06733 1.01346 4.9734 0.995097 4.87478C0.976739 4.77617 0.978349 4.67487 0.999833 4.57689C1.02132 4.4789 1.06224 4.38623 1.12018 4.30434C1.17811 4.22245 1.25189 4.15302 1.33713 4.10015C1.42238 4.04728 1.51736 4.01205 1.61647 3.99654C1.71557 3.98103 1.81678 3.98556 1.9141 4.00985C2.01143 4.03415 2.10289 4.07773 2.18307 4.138L22.6831 18.638C22.7666 18.6936 22.8381 18.7653 22.8934 18.849C22.9487 18.9327 22.9867 19.0266 23.005 19.1252C23.0234 19.2238 23.0218 19.3251 23.0003 19.4231C22.9788 19.5211 22.9379 19.6138 22.88 19.6957C22.822 19.7775 22.7483 19.847 22.663 19.8999C22.5778 19.9527 22.4828 19.988 22.3837 20.0035C22.2846 20.019 22.1834 20.0144 22.086 19.9901C21.9887 19.9658 21.8973 19.9223 21.8171 19.862L19.1661 17.987ZM4.90207 7.898C3.17207 9.439 2.07407 11.171 1.63407 11.942C1.62236 11.9594 1.61641 11.98 1.61707 12.001C1.61574 12.0163 1.62107 12.0347 1.63307 12.056C2.07407 12.83 3.18407 14.583 4.94007 16.136C6.69007 17.685 9.04507 19 12.0001 19C14.3341 19 16.2901 18.18 17.8741 17.073L14.3581 14.586C13.7684 15.1243 13.0125 15.4448 12.2156 15.4944C11.4188 15.544 10.6289 15.3197 9.97713 14.8586C9.32532 14.3976 8.85072 13.7275 8.63208 12.9597C8.41343 12.1918 8.46389 11.3722 8.77507 10.637L4.90207 7.899V7.898Z" fill="#52697C"/>
                  </svg>
                </Box>
              </Box>
            </Box>
          </Box>

          {changePasswordError && (
            <Box sx={{ 
              padding: '12px 16px', 
              backgroundColor: '#ffebee', 
              borderRadius: '8px',
              border: '1px solid #f44336'
            }}>
              <Typography sx={{ 
                color: '#d32f2f', 
                fontSize: '14px',
                fontFamily: 'Geologica'
              }}>
                {changePasswordError}
              </Typography>
            </Box>
          )}
        </Box>


        <Box sx={{ 
          alignSelf: 'stretch', 
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
          cursor: 'pointer'
        }} onClick={handleChangePasswordSubmit}>
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
              Change password
            </Typography>
          </Box>
        </Box>
      </Dialog>

      <Dialog 
        open={showSuccessModal} 
        onClose={() => setShowSuccessModal(false)}
        maxWidth="sm"
        PaperProps={{
          sx: {
            display: 'flex',
            width: '400px',
            padding: '40px',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px',
            borderRadius: '40px',
            background: 'var(--White, #FFF)',
            boxShadow: '-1px 10px 16px 1px rgba(1, 35, 63, 0.25)',
            margin: '20px'
          }
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: '#4CAF50',
          mb: 2
        }}>
          <Typography variant="h4" sx={{ color: 'white', fontSize: '32px' }}>
            ✓
          </Typography>
        </Box>
        
        <Typography variant="h6" sx={{ 
          fontWeight: 600,
          color: '#000D17',
          fontSize: '24px',
          fontFamily: 'Geologica',
          textAlign: 'center'
        }}>
          Password changed successfully!
        </Typography>
        
        <Typography variant="body2" sx={{ 
          color: '#52697C',
          fontSize: '16px',
          fontFamily: 'Geologica',
          textAlign: 'center',
          lineHeight: 1.5
        }}>
          Your password has been successfully updated. You can now use the new password to log in to the system.
        </Typography>
        
        <Button 
          onClick={() => setShowSuccessModal(false)}
          variant="contained"
          sx={{
            borderRadius: '100px',
            backgroundColor: '#D7E0F4',
            color: '#000D17',
            py: 2,
            px: 4,
            fontSize: '18px',
            fontFamily: 'Geologica',
            fontWeight: 400,
            textTransform: 'none',
            '&:hover': {
              backgroundColor: '#CBD7F1'
            }
          }}
        >
          OK
        </Button>
      </Dialog>
    </Box>
  );
};

export default SettingsPage;
