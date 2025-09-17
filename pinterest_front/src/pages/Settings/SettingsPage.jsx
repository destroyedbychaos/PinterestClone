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
import followingApi from '../../services/followingApi';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { logout, updateUser } from '../../../store/slices/AuthSlice';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { interestCategories } from '../../components/data/interestCategories.js';
import { getUserAvatarInitial } from '../../utils/userUtils.js';
import HomeFeedHistorySection from '../../components/HomeFeed/HomeFeedHistorySection.jsx';
import SocialPermissionsSection from '../../components/Settings/SocialPermissionsSection.jsx';


const getUserAvatar = (user) => {
  console.log('getUserAvatar called with user:', user);
  
  if (!user) {
    console.log('User is null/undefined, using default');
    return '/assets/images/noImgUser.png';
  }
  
  if (user?.avatarUrl) {
    console.log('Using avatarUrl:', user.avatarUrl);
    return user.avatarUrl;
  }
  

  console.log('Using local default avatar');
  return '/assets/images/noImgUser.png';
};
import {
  StyledDialog,
  InterestCard,
  ImageContainer,
  CardImage,
  ContinueButton
} from '../../components/ui/StyledComponents/OnBoardComponents.jsx';

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
  const [showInterestsModal, setShowInterestsModal] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [followingUsers, setFollowingUsers] = useState([]);
  const [isLoadingFollowing, setIsLoadingFollowing] = useState(false);

  const [boardToggles, setBoardToggles] = useState({
    'Architecture': false,
    'Beautiful photoshoots': true,
    'Mobile wallpapers': true,
    'Recipes': true,
    'Beautiful flowers': true,
    'Japan': true,
    'Sunsets': true,
    'Nature': true,
    'Travel': false,
    'Food': true,
    'Art': true,
    'Design': true
  });

  const [formData, setFormData] = useState({
    email: '',
    password: '•••••••••',
    displayName: '',
    userName: '',
    bio: '',
    birthDate: '',
    gender: 'Female',
    country: 'Ukraine (Україна)',
    language: 'English (UK)',
    isProfilePublic: true,
    isSearchPrivate: false
  });
  
  const [originalData, setOriginalData] = useState({
    email: '',
    password: '•••••••••',
    displayName: '',
    userName: '',
    bio: '',
    birthDate: '',
    gender: 'Female',
    country: 'Ukraine (Україна)',
    language: 'English (UK)',
    isProfilePublic: true,
    isSearchPrivate: false
  });

 
  const handleBoardToggle = (boardName) => {
    setBoardToggles(prev => ({
      ...prev,
      [boardName]: !prev[boardName]
    }));
  };


  const loadFollowingUsers = async () => {
    try {
      setIsLoadingFollowing(true);
      console.log('Current user:', user);
      console.log('User username:', user?.userName);
      
      if (!user?.userName) {
        console.error('User not found or username is missing');
        setFollowingUsers([]);
        return;
      }
      
      console.log('Loading following users for username:', user.userName);
      const followingData = await followingApi.getMyFollowing(user.userName);
      console.log('Following data received:', followingData);
      

      if (Array.isArray(followingData)) {
        console.log('Following users structure:', followingData.map(u => ({
          id: u.id,
          userName: u.userName,
          displayName: u.displayName,
          email: u.email,
          avatarUrl: u.avatarUrl
        })));
      }
      
      setFollowingUsers(followingData);
    } catch (error) {
      console.error('Error loading following users:', error);

      setFollowingUsers([]);
    } finally {
      setIsLoadingFollowing(false);
    }
  };

  const handleUnfollow = async (userId) => {
    try {
      await followingApi.unfollowUser(userId);

      await loadFollowingUsers();
    } catch (error) {
      console.error('Error unfollowing user:', error);
    }
  };

  const handleUserClick = (user) => {
    if (user?.userName) {
      navigate(`/user/${user.userName}`);
      setShowFollowingModal(false);
    }
  };



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
        
        console.log('Received settings from server:', settings);
        console.log('gender from server:', settings.gender);
        console.log('isProfilePublic from server:', settings.isProfilePublic);
        console.log('isSearchPrivate from server:', settings.isSearchPrivate);
        
        const newData = {
          email: settings.email || '',

          displayName: settings.displayName || '',
          userName: settings.userName || '',
          bio: settings.bio || '',
          birthDate: formattedBirthDate,
          gender: settings.gender !== undefined && settings.gender !== null ? settings.gender : 'Female',
          country: settings.country !== undefined && settings.country !== null ? settings.country : 'Ukraine (Україна)',
          language: settings.language !== undefined && settings.language !== null ? settings.language : 'English (UK)',
          isProfilePublic: settings.isProfilePublic !== undefined ? settings.isProfilePublic : true,
          isSearchPrivate: settings.isSearchPrivate !== undefined ? settings.isSearchPrivate : false,
          password: settings.password || '•••••••••' 
        };
        
        console.log('Setting formData from server settings:', newData);
        console.log('Gender in new formData:', newData.gender);
        console.log('Setting originalData to:', newData);
        
        setFormData(newData);
        setOriginalData(newData);
        

      } catch (error) {
        console.error('Error fetching settings:', error);
   
        if (user) {
          let formattedBirthDate = '';
          if (user.birthDate) {
            const date = new Date(user.birthDate);
            formattedBirthDate = date.toISOString().split('T')[0];
          }
          
          console.log('Using fallback user data:', user);
          console.log('gender from user:', user.gender);
          console.log('isProfilePublic from user:', user.isProfilePublic);
          console.log('isSearchPrivate from user:', user.isSearchPrivate);
          
          const newData = {
            email: user.email || '',
  
            displayName: user.displayName || '',
            userName: user.userName || '',
            bio: user.bio || '',
            birthDate: formattedBirthDate,
            gender: user.gender !== undefined && user.gender !== null ? user.gender : 'Female',
            country: user.country !== undefined && user.country !== null ? user.country : 'Ukraine (Україна)',
            language: user.language !== undefined && user.language !== null ? user.language : 'English (UK)',
            isProfilePublic: user.isProfilePublic !== undefined ? user.isProfilePublic : true,
            isSearchPrivate: user.isSearchPrivate !== undefined ? user.isSearchPrivate : false,
            password: 'TestPassword123!'
          };
          console.log('Setting formData from fallback user data:', newData);
          console.log('Gender in fallback formData:', newData.gender);
          console.log('Setting originalData to (fallback):', newData);
          
          setFormData(newData);
          setOriginalData(newData);
          

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
    console.log(`Previous formData:`, formData);
    

    
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };
      console.log(`New formData after ${field} change:`, newData);
      return newData;
    });

    clearTimeout(window.saveTimeout);
    window.saveTimeout = setTimeout(async () => {
      try {
        setIsSaving(true);

        const currentFormData = {
          ...formData,
          [field]: value
        };
        
        console.log('Current formData with updated field:', currentFormData);
        console.log('Updated field value:', currentFormData[field]);
        
        const settingsData = {
          email: currentFormData.email || null,

          bio: currentFormData.bio || null,
          birthDate: currentFormData.birthDate ? new Date(currentFormData.birthDate).toISOString() : null,
          gender: currentFormData.gender !== undefined && currentFormData.gender !== '' ? currentFormData.gender : null,
          country: currentFormData.country !== undefined && currentFormData.country !== '' ? currentFormData.country : null,
          language: currentFormData.language !== undefined && currentFormData.language !== '' ? currentFormData.language : null,
          isProfilePublic: currentFormData.isProfilePublic !== undefined ? currentFormData.isProfilePublic : true,
          isSearchPrivate: currentFormData.isSearchPrivate !== undefined ? currentFormData.isSearchPrivate : false
        };
        
        console.log('Original birthDate:', formData.birthDate);
        console.log('Processed birthDate:', formData.birthDate ? new Date(formData.birthDate).toISOString() : null);
        
        const changedData = {};
        Object.keys(settingsData).forEach(key => {
          const currentValue = settingsData[key];
          const originalValue = originalData[key];
          
          console.log(`Comparing ${key}:`, { currentValue, originalValue });
          
          if (currentValue !== originalValue && 
              !(currentValue === '' && (originalValue === null || originalValue === undefined || originalValue === '')) &&
              !(originalValue === '' && (currentValue === null || currentValue === undefined))) {
            changedData[key] = currentValue;
            console.log(`Field ${key} marked as changed`);
          }
        });
        
        console.log('Final settingsData:', settingsData);
        console.log('Gender in settingsData:', settingsData.gender);
        console.log('Original data:', originalData);
        console.log('Changed data:', changedData);

        if (Object.keys(changedData).length > 0) {
          await settingsApi.updateSettings(changedData);
          console.log('Settings auto-saved:', changedData);
          

          setOriginalData(prev => {
            const newOriginalData = {
              ...prev,
              ...changedData
            };
            console.log('Updated originalData:', newOriginalData);
            return newOriginalData;
          });
          
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

  const handleToggleChange = (field, value) => {
    console.log(`Toggle ${field} changed to:`, value);
    console.log('Current formData before change:', formData);
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };
      console.log('New formData after change:', newData);
      return newData;
    });

    clearTimeout(window.saveTimeout);
    window.saveTimeout = setTimeout(async () => {
      try {
        setIsSaving(true);
        const settingsData = {
          [field]: value
        };
        
        console.log('Saving toggle settings to server:', settingsData);
        const response = await settingsApi.updateSettings(settingsData);
        console.log('Server response:', response);
        console.log('Toggle auto-saved successfully:', settingsData);
        
        dispatch(updateUser(settingsData));
      } catch (error) {
        console.error('Error auto-saving toggle:', error);
        if (error.response) {
          console.error('Server error response:', error.response.data);
        }
      } finally {
        setIsSaving(false);
      }
    }, 1000);
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
            cursor: "pointer"
          }}
        >
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt="avatar" className="discover-header__avatar-img" />
          ) : (
              <span className="" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eaeff9', borderRadius: '50%', width: 48, height: 48, color: '#6b7280', fontSize: '16px', fontWeight: 600 }}>
                {getUserAvatarInitial(user)}
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
                        {console.log('RadioGroup gender value:', formData.gender || 'Female')}
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
          ) : activeTab === 'Profile visibility' ? (
            <Box className="settings-cards-container">
              <Box sx={{ 
                flexDirection: 'column', 
                justifyContent: 'flex-start', 
                alignItems: 'center', 
                gap: 3, 
                display: 'inline-flex',
                mb: 6
              }}>
                <Box sx={{ 
                  textAlign: 'center', 
                  color: '#000D17', 
                  fontSize: 38, 
                  fontFamily: 'Geologica', 
                  fontWeight: '700', 
                  wordWrap: 'break-word'
                }}>
                  Profile visibility
                </Box>
                <Box sx={{ 
                  textAlign: 'center', 
                  color: '#52697C', 
                  fontSize: 21, 
                  fontFamily: 'Geologica', 
                  fontWeight: '400', 
                  wordWrap: 'break-word'
                }}>
                  Control who can see your profile both on and outside of Aestify.
                </Box>
              </Box>
              
              <Box sx={{ 
                justifyContent: 'flex-start', 
                alignItems: 'flex-start', 
                gap: 3, 
                display: 'inline-flex'
              }}>
                <Box sx={{ 
                  width: 557, 
                  alignSelf: 'stretch', 
                  padding: 5, 
                  borderRadius: 5, 
                  outline: '1px #B4C6EB solid', 
                  outlineOffset: '-1px', 
                  flexDirection: 'column', 
                  justifyContent: 'flex-start', 
                  alignItems: 'flex-start', 
                  gap: 5, 
                  display: 'inline-flex'
                }}>
                  <Box sx={{ 
                    alignSelf: 'stretch', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    display: 'inline-flex'
                  }}>
                    <Box sx={{ 
                      color: '#000D17', 
                      fontSize: 28, 
                      fontFamily: 'Geologica', 
                      fontWeight: '600', 
                      wordWrap: 'break-word'
                    }}>
                      Private profile
                    </Box>
                    <Box 
                      onClick={() => handleToggleChange('isProfilePublic', !formData.isProfilePublic)}
                      sx={{ 
                        width: 64, 
                        height: 32, 
                        paddingLeft: 0.5, 
                        paddingRight: 0.5, 
                        background: formData.isProfilePublic ? '#D7E0F4' : '#6F91D9', 
                        borderRadius: 100, 
                        justifyContent: formData.isProfilePublic ? 'flex-start' : 'flex-end', 
                        alignItems: 'center', 
                        display: 'flex',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <Box sx={{ 
                        width: 24, 
                        height: 24, 
                        background: 'white', 
                        boxShadow: '1px 2px 2.299999952316284px rgba(1, 35, 63, 0.25)', 
                        borderRadius: 9999 
                      }} />
                    </Box>
                  </Box>
                  <Box sx={{ 
                    alignSelf: 'stretch', 
                    flexDirection: 'column', 
                    justifyContent: 'flex-start', 
                    alignItems: 'flex-start', 
                    gap: 2, 
                    display: 'flex'
                  }}>
                    <Box sx={{ 
                      alignSelf: 'stretch', 
                      color: '#000D17', 
                      fontSize: 21, 
                      fontFamily: 'Geologica', 
                      fontWeight: '400', 
                      wordWrap: 'break-word'
                    }}>
                      If you set your profile to private, only people you approve will be able to view your profile, Aests, boards, followers, and following lists.
                    </Box>
                  </Box>
                </Box>
                
                <Box sx={{ 
                  width: 557, 
                  alignSelf: 'stretch', 
                  padding: 5, 
                  borderRadius: 5, 
                  outline: '1px #B4C6EB solid', 
                  outlineOffset: '-1px', 
                  flexDirection: 'column', 
                  justifyContent: 'flex-start', 
                  alignItems: 'flex-start', 
                  gap: 5, 
                  display: 'inline-flex'
                }}>
                  <Box sx={{ 
                    alignSelf: 'stretch', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    display: 'inline-flex'
                  }}>
                    <Box sx={{ 
                      color: '#000D17', 
                      fontSize: 28, 
                      fontFamily: 'Geologica', 
                      fontWeight: '600', 
                      wordWrap: 'break-word'
                    }}>
                      Search privacy
                    </Box>
                    <Box 
                      onClick={() => handleToggleChange('isSearchPrivate', !formData.isSearchPrivate)}
                      sx={{ 
                        width: 64, 
                        height: 32, 
                        paddingLeft: 0.5, 
                        paddingRight: 0.5, 
                        background: formData.isSearchPrivate ? '#6F91D9' : '#D7E0F4', 
                        borderRadius: 100, 
                        justifyContent: formData.isSearchPrivate ? 'flex-end' : 'flex-start', 
                        alignItems: 'center', 
                        display: 'flex',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <Box sx={{ 
                        width: 24, 
                        height: 24, 
                        background: 'white', 
                        boxShadow: '1px 2px 2.299999952316284px rgba(1, 35, 63, 0.25)', 
                        borderRadius: 9999 
                      }} />
                    </Box>
                  </Box>
                  <Box sx={{ 
                    alignSelf: 'stretch', 
                    flexDirection: 'column', 
                    justifyContent: 'flex-start', 
                    alignItems: 'flex-start', 
                    gap: 2, 
                    display: 'flex'
                  }}>
                    <Box sx={{ 
                      alignSelf: 'stretch', 
                      color: '#000D17', 
                      fontSize: 21, 
                      fontFamily: 'Geologica', 
                      fontWeight: '400', 
                      wordWrap: 'break-word'
                    }}>
                      Keep your profile and boards hidden from search engines (e.g. Google).
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          ) : activeTab === 'Set up your home feed' ? (
            <Box className="settings-cards-container">
              <Box sx={{ 
                flexDirection: 'column', 
                justifyContent: 'flex-start', 
                alignItems: 'center', 
                gap: 3, 
                display: 'inline-flex',
                mb: 6
              }}>
                <Box sx={{ 
                  textAlign: 'center', 
                  color: '#000D17', 
                  fontSize: 38, 
                  fontFamily: 'Geologica', 
                  fontWeight: '700', 
                  wordWrap: 'break-word'
                }}>
                  Set up your home feed
                </Box>
                <Box sx={{ 
                  textAlign: 'center', 
                  color: '#52697C', 
                  fontSize: 21, 
                  fontFamily: 'Geologica', 
                  fontWeight: '400', 
                  wordWrap: 'break-word'
                }}>
                  Make Aestify feel more like you. Update the info we use to suggest ideas. <br/>Don't worry — no one else will see it.
                </Box>
              </Box>
              
              <Box sx={{ 
                justifyContent: 'flex-start', 
                alignItems: 'flex-start', 
                gap: 3, 
                display: 'inline-flex',
                mb: 6
              }}>
                <Box sx={{ 
                  width: 557, 
                  alignSelf: 'stretch', 
                  padding: 5, 
                  borderRadius: 5, 
                  outline: '1px #B4C6EB solid', 
                  outlineOffset: '-1px', 
                  flexDirection: 'column', 
                  justifyContent: 'flex-start', 
                  alignItems: 'flex-start', 
                  gap: 5, 
                  display: 'inline-flex'
                }}>
                  <Box sx={{ 
                    alignSelf: 'stretch', 
                    color: '#000D17', 
                    fontSize: 28, 
                    fontFamily: 'Geologica', 
                    fontWeight: '600', 
                    wordWrap: 'break-word'
                  }}>
                    Interests
                  </Box>
                  <Box sx={{ 
                    alignSelf: 'stretch', 
                    color: '#000D17', 
                    fontSize: 21, 
                    fontFamily: 'Geologica', 
                    fontWeight: '400', 
                    wordWrap: 'break-word'
                  }}>
                    Add interests to discover more related ideas. Remove them to stop seeing ideas you don't care about.
                  </Box>
                  <Button 
                    onClick={() => setShowInterestsModal(true)}
                    sx={{ 
                      alignSelf: 'stretch', 
                      paddingLeft: 3, 
                      paddingRight: 3, 
                      paddingTop: 2, 
                      paddingBottom: 2, 
                      background: '#D7E0F4', 
                      borderRadius: '100px', 
                      justifyContent: 'flex-start', 
                      alignItems: 'center', 
                      gap: 2, 
                      display: 'inline-flex',
                      textTransform: 'none',
                      color: '#000D17',
                      fontSize: 21,
                      fontFamily: 'Geologica',
                      fontWeight: '400',
                      '&:hover': {
                        background: '#CBD7F1'
                      }
                    }}
                  >
                    Change interests
                  </Button>
                </Box>
                
                <Box sx={{ 
                  width: 557, 
                  height: 519, 
                  paddingTop: 5, 
                  paddingBottom: 5, 
                  paddingLeft: 5, 
                  paddingRight: 5, 
                  borderRadius: 5, 
                  outline: '1px #B4C6EB solid', 
                  outlineOffset: '-1px', 
                  flexDirection: 'column', 
                  justifyContent: 'flex-start', 
                  alignItems: 'flex-start', 
                  gap: 5, 
                  display: 'inline-flex',
                  overflow: 'hidden'
                }}>
                  <Box sx={{ 
                    width: '100%', 
                    maxWidth: 477, 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    display: 'inline-flex'
                  }}>
                    <Box sx={{ 
                      color: '#000D17', 
                      fontSize: 28, 
                      fontFamily: 'Geologica', 
                      fontWeight: '600', 
                      wordWrap: 'break-word'
                    }}>
                      Boards
                    </Box>
                    <Box sx={{ 
                      width: 32, 
                      height: 32, 
                      position: 'relative'
                    }}>
                      <Box sx={{ 
                        width: 24, 
                        height: 24, 
                        left: 4, 
                        top: 4, 
                        position: 'absolute', 
                        background: '#01233F' 
                      }} />
                    </Box>
                  </Box>
                  <Box sx={{ 
                    width: '100%', 
                    maxWidth: 477, 
                    color: '#000D17', 
                    fontSize: 21, 
                    fontFamily: 'Geologica', 
                    fontWeight: '400', 
                    wordWrap: 'break-word'
                  }}>
                    Turn off a board to stop seeing related ideas. Your board itself won't be affected.
                  </Box>
                  <Box sx={{ 
                    alignSelf: 'stretch', 
                    flex: '1 1 0', 
                    display: 'flex',
                    gap: 2.5,
                    overflow: 'hidden'
                  }}>
                    <Box sx={{ 
                      flex: 1,
                      height: 320,
                      overflowY: 'auto',
                      overflowX: 'hidden',
                      '&::-webkit-scrollbar': {
                        width: '17px'
                      },
                      '&::-webkit-scrollbar-track': {
                        background: '#F1F1F1',
                        borderRadius: '8px'
                      },
                      '&::-webkit-scrollbar-thumb': {
                        background: '#C1C1C1',
                        borderRadius: '8px',
                        '&:hover': {
                          background: '#A0A0A0'
                        }
                      },
                      '&::-webkit-scrollbar-button': {
                        display: 'none'
                      }
                    }}>
                      <Box sx={{ 
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                        paddingRight: 2
                      }}>
                        {/* Board items */}
                        {[
                          { name: 'Architecture', count: '1 Aest', isPrivate: true },
                          { name: 'Beautiful photoshoots', count: '5 Aests', isPrivate: true },
                          { name: 'Mobile wallpapers', count: '3,5k Aests', isPrivate: false },
                          { name: 'Recipes', count: '495 Aests', isPrivate: false },
                          { name: 'Beautiful flowers', count: '1,5k Aests', isPrivate: false },
                          { name: 'Japan', count: '345 Aests', isPrivate: false },
                          { name: 'Sunsets', count: '1,2k Aests', isPrivate: false },
                          { name: 'Nature', count: '2,1k Aests', isPrivate: false },
                          { name: 'Travel', count: '890 Aests', isPrivate: false },
                          { name: 'Food', count: '1,7k Aests', isPrivate: false },
                          { name: 'Art', count: '456 Aests', isPrivate: false },
                          { name: 'Design', count: '3,2k Aests', isPrivate: false }
                        ].map((board, index) => (
                          <Box key={index} sx={{ 
                            display: 'flex',
                            alignItems: 'center',
                            gap: 3,
                            minHeight: 80
                          }}>
                            <Box sx={{ 
                              flex: 1,
                              height: 80, 
                              paddingLeft: 1, 
                              paddingRight: 1, 
                              background: 'white', 
                              borderRadius: 2.5, 
                              display: 'flex',
                              alignItems: 'center',
                              gap: 3
                            }}>
                              <Box sx={{ 
                                width: 64, 
                                height: 64, 
                                borderRadius: 2.5,
                                background: '#f0f0f0',
                                flexShrink: 0
                              }} />
                              <Box sx={{ 
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                gap: 1,
                                minWidth: 0
                              }}>
                                <Box sx={{ 
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1
                                }}>
                                  {board.isPrivate && (
                                    <Box sx={{ 
                                      width: 16, 
                                      height: 16, 
                                      position: 'relative',
                                      flexShrink: 0
                                    }}>
                                      <Box sx={{ 
                                        width: 12, 
                                        height: 14, 
                                        left: 2, 
                                        top: 0.67, 
                                        position: 'absolute', 
                                        background: '#01233F' 
                                      }} />
                                    </Box>
                                  )}
                                  <Box sx={{ 
                                    color: '#000D17', 
                                    fontSize: 21, 
                                    fontFamily: 'Geologica', 
                                    fontWeight: '600', 
                                    wordWrap: 'break-word',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                  }}>
                                    {board.name}
                                  </Box>
                                </Box>
                                <Box sx={{ 
                                  color: '#52697C', 
                                  fontSize: 16, 
                                  fontFamily: 'Geologica', 
                                  fontWeight: '400', 
                                  wordWrap: 'break-word'
                                }}>
                                  {board.count}
                                </Box>
                              </Box>
                            </Box>
                            <Box 
                              onClick={() => handleBoardToggle(board.name)}
                              sx={{ 
                                width: 64, 
                                height: 32, 
                                paddingLeft: 0.5, 
                                paddingRight: 0.5, 
                                background: boardToggles[board.name] ? '#6F91D9' : '#D7E0F4', 
                                borderRadius: 100, 
                                justifyContent: boardToggles[board.name] ? 'flex-end' : 'flex-start', 
                                alignItems: 'center', 
                                display: 'flex',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                flexShrink: 0,
                                '&:hover': {
                                  background: boardToggles[board.name] ? '#5A7BC7' : '#C7D0E4'
                                }
                              }}
                            >
                              <Box sx={{ 
                                width: 24, 
                                height: 24, 
                                background: 'white', 
                                boxShadow: '1px 2px 2.299999952316284px rgba(1, 35, 63, 0.25)', 
                                borderRadius: 9999 
                              }} />
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  </Box>
                </Box>
                
                <Box sx={{ 
                  width: 557, 
                  alignSelf: 'stretch', 
                  padding: 5, 
                  borderRadius: 5, 
                  outline: '1px #B4C6EB solid', 
                  outlineOffset: '-1px', 
                  flexDirection: 'column', 
                  justifyContent: 'flex-start', 
                  alignItems: 'flex-start', 
                  gap: 5, 
                  display: 'inline-flex'
                }}>
                  <Box sx={{ 
                    alignSelf: 'stretch', 
                    color: '#000D17', 
                    fontSize: 28, 
                    fontFamily: 'Geologica', 
                    fontWeight: '600', 
                    wordWrap: 'break-word'
                  }}>
                    Following
                  </Box>
                  <Box sx={{ 
                    alignSelf: 'stretch', 
                    color: '#000D17', 
                    fontSize: 21, 
                    fontFamily: 'Geologica', 
                    fontWeight: '400', 
                    wordWrap: 'break-word'
                  }}>
                    Stop seeing Pins from a person or brand by unfollowing. They won't be notified.
                  </Box>
                  <Button 
                    onClick={() => {
                      console.log('Button clicked, current user:', user);
                      if (!user?.userName) {
                        console.error('User not found or username is missing');
                        return;
                      }
                      console.log('Opening following modal for user:', user.userName);
                      setShowFollowingModal(true);
                      loadFollowingUsers();
                    }}
                    sx={{ 
                      alignSelf: 'stretch', 
                      paddingLeft: 3, 
                      paddingRight: 3, 
                      paddingTop: 2, 
                      paddingBottom: 2, 
                      background: '#D7E0F4', 
                      borderRadius: '100px', 
                      justifyContent: 'flex-start', 
                      alignItems: 'center', 
                      gap: 2, 
                      display: 'inline-flex',
                      textTransform: 'none',
                      color: '#000D17',
                      fontSize: 21,
                      fontFamily: 'Geologica',
                      fontWeight: '400',
                      '&:hover': {
                        background: '#CBD7F1'
                      }
                    }}
                  >
                    Change following list
                  </Button>
                </Box>
              </Box>
              
              {/* Історія перегляду з новим дизайном */}
              <HomeFeedHistorySection />
            </Box>
          ) : activeTab === 'Social permissions' ? (
            <SocialPermissionsSection />
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

      <StyledDialog 
        open={showInterestsModal} 
        onClose={() => setShowInterestsModal(false)}
        dialogwidth="1200px"
      >
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
          width: '100%',
          height: '600px',
          justifyContent: 'center'
        }}>
          <Box sx={{
            display: 'flex',
            width: '100%',
            maxWidth: '1200px',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Box sx={{ width: 40 }} />
            
            <Typography 
              sx={{ 
                color: '#000D17',
                fontFamily: 'Geologica',
                fontSize: '21px',
                fontStyle: 'normal',
                fontWeight: '400',
                lineHeight: 'normal'
              }}
            >
              Change interests
            </Typography>
            
            <Box 
              sx={{ 
                width: '40px', 
                height: '40px', 
                position: 'relative',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }} 
              onClick={() => setShowInterestsModal(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none">
                <path d="M9.53329 9.53367C9.76767 9.29959 10.0854 9.16811 10.4166 9.16811C10.7479 9.16811 11.0656 9.29959 11.3 9.53367L20 18.2337L28.7 9.53367C28.8527 9.36913 29.0471 9.24885 29.2625 9.18549C29.4779 9.12213 29.7064 9.11805 29.924 9.17367C30.1415 9.2293 30.34 9.34256 30.4986 9.50154C30.6572 9.66052 30.7699 9.85932 30.825 10.077C30.8805 10.2943 30.8765 10.5225 30.8134 10.7378C30.7504 10.953 30.6306 11.1473 30.4666 11.3003L21.7666 20.0003L30.4666 28.7003C30.6312 28.8531 30.7515 29.0475 30.8148 29.2629C30.8782 29.4783 30.8822 29.7068 30.8266 29.9244C30.771 30.1419 30.6577 30.3404 30.4988 30.499C30.3398 30.6575 30.141 30.7703 29.9233 30.8253C29.706 30.8809 29.4778 30.8769 29.2625 30.8138C29.0473 30.7508 28.853 30.631 28.7 30.467L20 21.767L11.3 30.467C11.063 30.6881 10.7495 30.8085 10.4256 30.8029C10.1016 30.7973 9.79242 30.6661 9.56329 30.437C9.33417 30.2079 9.20298 29.8987 9.19738 29.5747C9.19179 29.2507 9.31222 28.9373 9.53329 28.7003L18.2333 20.0003L9.53329 11.3003C9.29921 11.066 9.16772 10.7483 9.16772 10.417C9.16772 10.0858 9.29921 9.76805 9.53329 9.53367Z" fill="#000D17"/>
              </svg>
            </Box>
          </Box>

          <Typography 
            sx={{ 
              alignSelf: 'stretch',
              color: '#000D17',
              textAlign: 'center',
              fontFamily: 'Geologica',
              fontSize: '51px',
              fontStyle: 'normal',
              fontWeight: '700',
              lineHeight: 'normal'
            }}
          >
            Customize your feed
          </Typography>

          <Typography 
            sx={{ 
              alignSelf: 'stretch',
              color: '#000D17',
              textAlign: 'center',
              fontFamily: 'Geologica',
              fontSize: '21px',
              fontStyle: 'normal',
              fontWeight: '400',
              lineHeight: 'normal'
            }}
          >
            Select at least one of your interest.
          </Typography>

          <Box sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '20px',
            justifyContent: 'center',
            width: '100%',
            maxWidth: '1200px',
            maxHeight: '400px',
            overflowY: 'auto',
            py: 2,
            px: 4,
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'rgba(0,0,0,0.1)',
              borderRadius: '10px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'gray',
              borderRadius: '10px',
            }
          }}>
            {interestCategories.map((interest) => (
              <InterestCard 
                key={interest.id}
                onClick={() => {
                  const newSelected = [...selectedInterests];
                  if (newSelected.includes(interest.id)) {
                    const filtered = newSelected.filter(id => id !== interest.id);
                    setSelectedInterests(filtered);
                  } else {
                    if (newSelected.length < 3) {
                      setSelectedInterests([...newSelected, interest.id]);
                    }
                  }
                }}
              >
                <ImageContainer selected={selectedInterests.includes(interest.id)}>
                  <CardImage 
                    src={interest.image} 
                    alt={interest.title}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.style.background = '#6F91D9';
                    }}
                  />
                </ImageContainer>
                <Typography 
                  sx={{ 
                    color: '#000D17',
                    textAlign: 'center',
                    fontFamily: 'Geologica',
                    fontSize: '16px',
                    fontStyle: 'normal',
                    fontWeight: '500',
                    lineHeight: 'normal'
                  }}
                >
                  {interest.title}
                </Typography>
              </InterestCard>
            ))}
          </Box>

          <ContinueButton
            onClick={() => {
              if (selectedInterests.length > 0) {

                console.log('Selected interests:', selectedInterests);
                setShowInterestsModal(false);
              }
            }}
            disabled={selectedInterests.length === 0}
          >
            Confirm
          </ContinueButton>
        </Box>
      </StyledDialog>

      <Dialog 
        open={showFollowingModal} 
        onClose={() => setShowFollowingModal(false)}
        maxWidth="md"
        PaperProps={{
          sx: {
            width: '848px',
            height: '792px',
            maxHeight: '792px',
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
          width: '100%', 
          maxWidth: 768, 
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
            Following
          </Typography>
          <Box 
            sx={{ 
              width: '40px', 
              height: '40px', 
              position: 'relative',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }} 
            onClick={() => setShowFollowingModal(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none">
              <path d="M9.53329 9.53367C9.76767 9.29959 10.0854 9.16811 10.4166 9.16811C10.7479 9.16811 11.0656 9.29959 11.3 9.53367L20 18.2337L28.7 9.53367C28.8527 9.36913 29.0471 9.24885 29.2625 9.18549C29.4779 9.12213 29.7064 9.11805 29.924 9.17367C30.1415 9.2293 30.34 9.34256 30.4986 9.50154C30.6572 9.66052 30.7699 9.85932 30.825 10.077C30.8805 10.2943 30.8765 10.5225 30.8134 10.7378C30.7504 10.953 30.6306 11.1473 30.4666 11.3003L21.7666 20.0003L30.4666 28.7003C30.6312 28.8531 30.7515 29.0475 30.8148 29.2629C30.8782 29.4783 30.8822 29.7068 30.8266 29.9244C30.771 30.1419 30.6577 30.3404 30.4988 30.499C30.3398 30.6575 30.141 30.7703 29.9233 30.8253C29.706 30.8809 29.4778 30.8769 29.2625 30.8138C29.0473 30.7508 28.853 30.631 28.7 30.467L20 21.767L11.3 30.467C11.063 30.6881 10.7495 30.8085 10.4256 30.8029C10.1016 30.7973 9.79242 30.6661 9.56329 30.437C9.33417 30.2079 9.20298 29.8987 9.19738 29.5747C9.19179 29.2507 9.31222 28.9373 9.53329 28.7003L18.2333 20.0003L9.53329 11.3003C9.29921 11.066 9.16772 10.7483 9.16772 10.417C9.16772 10.0858 9.29921 9.76805 9.53329 9.53367Z" fill="#000D17"/>
            </svg>
          </Box>
        </Box>

        <Box sx={{ 
          width: '100%', 
          height: 64, 
          maxWidth: 768, 
          paddingLeft: 3, 
          paddingRight: 3, 
          paddingTop: 2, 
          paddingBottom: 2, 
          background: '#EAEFF9', 
          borderRadius: '100px', 
          justifyContent: 'flex-start', 
          alignItems: 'center', 
          gap: 2, 
          display: 'inline-flex'
        }}>
          <Box sx={{ 
            width: 24, 
            height: 24, 
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8.5 3C11.5376 3 14 5.46243 14 8.5C14 9.74832 13.5841 10.8998 12.8834 11.8226L17.0303 15.9697C17.3232 16.2626 17.3232 16.7374 17.0303 17.0303C16.7374 17.3232 16.2626 17.3232 15.9697 17.0303L11.8226 12.8834C10.8998 13.5841 9.74832 14 8.5 14C5.46243 14 3 11.5376 3 8.5C3 5.46243 5.46243 3 8.5 3ZM8.5 4.5C6.29086 4.5 4.5 6.29086 4.5 8.5C4.5 10.7091 6.29086 12.5 8.5 12.5C10.7091 12.5 12.5 10.7091 12.5 8.5C12.5 6.29086 10.7091 4.5 8.5 4.5Z" fill="#52697C"/>
            </svg>
          </Box>
          <TextField
            placeholder="Search people"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              flex: 1,
              '& .MuiOutlinedInput-root': {
                background: 'transparent',
                border: 'none',
                '& fieldset': {
                  border: 'none',
                },
                '&:hover fieldset': {
                  border: 'none',
                },
                '&.Mui-focused fieldset': {
                  border: 'none',
                },
              },
              '& .MuiInputBase-input': {
                color: '#7B8D9B',
                fontSize: '21px',
                fontFamily: 'Geologica',
                fontWeight: '400',
                '&::placeholder': {
                  color: '#7B8D9B',
                  opacity: 1,
                },
              },
            }}
          />
        </Box>

        <Box sx={{ 
          alignSelf: 'stretch', 
          flex: '1 1 0', 
          justifyContent: 'flex-start', 
          alignItems: 'flex-start', 
          gap: 2.5, 
          display: 'inline-flex',
          overflow: 'hidden'
        }}>
          <Box sx={{ 
            flex: '1 1 0', 
            alignSelf: 'stretch', 
            overflow: 'hidden', 
            flexDirection: 'column', 
            justifyContent: 'flex-start', 
            alignItems: 'flex-start', 
            gap: 3, 
            display: 'inline-flex',
            overflowY: 'auto',
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'rgba(0,0,0,0.1)',
              borderRadius: '10px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'gray',
              borderRadius: '10px',
            }
          }}>
            {!user?.userName ? (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: 200 
              }}>
                <Typography sx={{ 
                  color: '#52697C', 
                  fontSize: 16, 
                  fontFamily: 'Geologica', 
                  fontWeight: '400' 
                }}>
                  User not found. Please refresh the page.
                </Typography>
              </Box>
            ) : isLoadingFollowing ? (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: 200 
              }}>
                <Typography sx={{ 
                  color: '#52697C', 
                  fontSize: 16, 
                  fontFamily: 'Geologica', 
                  fontWeight: '400' 
                }}>
                  Loading following users...
                </Typography>
              </Box>
            ) : followingUsers.length === 0 ? (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: 200 
              }}>
                <Typography sx={{ 
                  color: '#52697C', 
                  fontSize: 16, 
                  fontFamily: 'Geologica', 
                  fontWeight: '400' 
                }}>
                  You are not following anyone yet.
                </Typography>
              </Box>
            ) : (
                               followingUsers
                   .filter(user => 
                     (user.displayName || user.userName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                     (user.userName || '').toLowerCase().includes(searchQuery.toLowerCase())
                   )
                   .map((user) => {
                     console.log('Rendering user in list:', user);
                     return (
                  <Box key={user.id} sx={{ 
                    alignSelf: 'stretch', 
                    justifyContent: 'flex-start', 
                    alignItems: 'center', 
                    gap: 3, 
                    display: 'inline-flex'
                  }}>
                                      <Box 
                    onClick={() => handleUserClick(user)}
                    title={`Click to view ${user.displayName || user.userName}'s profile`}
                    sx={{ 
                      flex: '1 1 0', 
                      justifyContent: 'flex-start', 
                      alignItems: 'center', 
                      gap: 3, 
                      display: 'flex',
                      cursor: 'pointer',
                      '&:hover': {
                        opacity: 0.8
                      },
                      transition: 'opacity 0.2s ease'
                    }}
                  >
                    <Avatar 
                      src={(() => {
                        console.log('About to call getUserAvatar with user:', user);
                        const avatarUrl = getUserAvatar(user);
                        console.log('getUserAvatar returned:', avatarUrl);
                        return avatarUrl;
                      })()}
                      onError={(e) => {
                        console.log('Avatar load error for user:', user);
                        console.log('Avatar URL that failed:', e.target.src);

                        e.target.src = '/assets/images/noImgUser.png';
                      }}
                      onLoad={(e) => {
                        console.log('Avatar loaded successfully for user:', user);
                        console.log('Avatar URL that loaded:', e.target.src);
                        console.log('Avatar element:', e.target);
                        console.log('Avatar natural width:', e.target.naturalWidth);
                        console.log('Avatar natural height:', e.target.naturalHeight);

                        e.target.style.opacity = '1';
                      }}
                      sx={{ 
                        width: 56, 
                        height: 56, 
                        borderRadius: '9999px',
                        border: '2px solid #EAEFF9',
                        opacity: 1,
                        transition: 'opacity 0.3s ease'
                      }}
                    />
                    <Box sx={{ 
                      flex: '1 1 0', 
                      flexDirection: 'column', 
                      justifyContent: 'flex-start', 
                      alignItems: 'flex-start', 
                      gap: 1, 
                      display: 'inline-flex'
                    }}>
                      <Typography sx={{ 
                        alignSelf: 'stretch', 
                        color: '#000D17', 
                        fontSize: 21, 
                        fontFamily: 'Geologica', 
                        fontWeight: '600', 
                        wordWrap: 'break-word'
                      }}>
                        {user.displayName || user.userName}
                      </Typography>
                      <Typography sx={{ 
                        alignSelf: 'stretch', 
                        color: '#52697C', 
                        fontSize: 16, 
                        fontFamily: 'Geologica', 
                        fontWeight: '400', 
                        wordWrap: 'break-word'
                      }}>
                        @{user.userName}
                      </Typography>
                    </Box>
                  </Box>
                    <Button 
                      onClick={() => handleUnfollow(user.id)}
                      sx={{ 
                        width: 160, 
                        height: 48, 
                        paddingLeft: 3, 
                        paddingRight: 3, 
                        paddingTop: 2, 
                        paddingBottom: 2, 
                        background: '#D7E0F4', 
                        borderRadius: '100px', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        gap: 2, 
                        display: 'flex',
                        textTransform: 'none',
                        color: '#000D17',
                        fontSize: 16,
                        fontFamily: 'Geologica',
                        fontWeight: '400',
                        '&:hover': {
                          background: '#C7D0E4',
                          transform: 'scale(1.02)'
                        },
                        transition: 'all 0.2s ease'
                      }}
                    >
                      Unfollow
                    </Button>
                     </Box>
                   );
                   })
               )}
          </Box>
        </Box>
      </Dialog>


    </Box>
  );
};

export default SettingsPage;
