import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Box, 
  Typography, 
  Button, 
  Avatar, 
  IconButton,
  Menu,
  MenuItem,
  Divider
} from '@mui/material';
import { 
  MoreVert
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import SideMenu from '../../components/layout/SideMenu';
import ProfileHeader from '../../components/layout/ProfileHeader';
import MasonryGrid from '../../components/ui/MasonryGrid';
import { 
  getUserDisplayName, 
  getUserAvatarInitial, 
  getUserUsername, 
  hasUserAvatar, 
  getUserAvatarUrl
} from '../../utils/userUtils';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { fetchSavedPins } from '../../utils/fetchSavedPins';

const defaultBannerSvg = (
  <svg width="1720" height="260" viewBox="0 0 1720 260" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="1720" height="260" rx="40" fill="#EAEFF9"/>
  </svg>
);

const defaultAvatarSvg = (
  <svg width="217" height="217" viewBox="0 0 217 217" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="4" width="209" height="209" rx="104.5" fill="#EAEFF9" stroke="white" strokeWidth="8"/>
  </svg>
);

const API_BASE = '/api';

const UserProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  

  const currentUser = useCurrentUser();

  const [userProfile, setUserProfile] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [activeTab, setActiveTab] = useState('Aests');
  const [pins, setPins] = useState([]);
  const [boards, setBoards] = useState([]);
  const [createdPins, setCreatedPins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [showAccountInfoModal, setShowAccountInfoModal] = useState(false);
  const [showShareProfileModal, setShowShareProfileModal] = useState(false);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showBlockConfirmModal, setShowBlockConfirmModal] = useState(false);
  const [showUnblockConfirmModal, setShowUnblockConfirmModal] = useState(false);
  const [showReportProfileModal, setShowReportProfileModal] = useState(false);
  const [reportMessage, setReportMessage] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  const [isProfileAccessible, setIsProfileAccessible] = useState(true);

  useEffect(() => {
    if (username) {
      setIsProfileAccessible(true);
      setIsBlocked(false);
      loadUserProfile();
    }
  }, [username]);



  useEffect(() => {
    if (userProfile && isProfileAccessible) {
      loadUserContent();
    }
  }, [userProfile, activeTab, isProfileAccessible]);

  
  useEffect(() => {
    const onProfileUpdate = () => {
      if (username) {
        loadUserProfile();
      }
    };
    window.addEventListener('profileUpdated', onProfileUpdate);
    return () => window.removeEventListener('profileUpdated', onProfileUpdate);
  }, [username]);

  const loadUserProfile = async () => {
    try {
      const response = await fetch(`${API_BASE}/profile/username/${username}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserProfile(data);
        setIsFollowing(data.isFollowing || false);
        setFollowersCount(data.followersCount || 0);
        setFollowingCount(data.followingCount || 0);
        
 
        setIsBlocked(data.isBlocked || false);
        setIsProfileAccessible(true);
      } else if (response.status === 404) {

        setIsProfileAccessible(false);
        toast.error('Профіль не знайдено');
        navigate('/');
      } else {
        toast.error('Error loading profile');
        navigate('/');
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      toast.error('Помилка завантаження профілю');
    }
  };

  const loadUserContent = async () => {
    let isMounted = true;
    

    if (!isProfileAccessible || isBlocked) {
      return;
    }
    
    try {
      setLoading(true);
      
      if (activeTab === 'Aests') {

        const token = localStorage.getItem('token');
        const targetUserId = userProfile?.id;
        
        if (targetUserId) {
          const list = await fetchSavedPins(token, userProfile?.displayName || userProfile?.userName, targetUserId);
          if (isMounted) {
            setPins(list);
          }
        } else {
          if (isMounted) {
            setPins([]);
          }
        }
      } else if (activeTab === 'Boards') {

        const response = await fetch(`${API_BASE}/boards/user/username/${username}?pageNumber=1&pageSize=20`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (response.ok && isMounted) {
          const data = await response.json();
          setBoards(data.boards || data.items || []);
        } else if (response.status === 404 && isMounted) {

          setBoards([]);
        }
      } else if (activeTab === 'Created') {

        const response = await fetch(`${API_BASE}/pins/user/${username}?pageNumber=1&pageSize=20`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (response.ok && isMounted) {
          const data = await response.json();
          setCreatedPins(data.pins || data.items || []);
        } else if (response.status === 404 && isMounted) {

          setCreatedPins([]);
        }
      }
    } catch (error) {
      console.error('Error loading user content:', error);
      if (isMounted) {
        toast.error('Error loading content');
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  };

  const handleFollow = async () => {
    if (!token) {
      toast.error('Потрібно увійти в систему');
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/profile/${userProfile.id}/${isFollowing ? 'unfollow' : 'follow'}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setIsFollowing(!isFollowing);
        setFollowersCount(prev => isFollowing ? prev - 1 : prev + 1);
        toast.success(isFollowing ? 'Відписано від користувача' : 'Підписано на користувача');
        

        window.dispatchEvent(new CustomEvent('profileUpdated'));
      } else {
        toast.error('Error subscribing');
      }
    } catch (error) {
      console.error('Error following user:', error);
      toast.error('Помилка при підписці');
    }
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAccountInfo = () => {
    setShowAccountInfoModal(true);
    handleMenuClose();
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleShareProfile = () => {
    setShowShareProfileModal(true);
    handleMenuClose();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Посилання на профіль скопійовано');
  };

  const handleShareTelegram = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Check out this profile: ${getUserDisplayName(userProfile)}`);
    window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
  };

  const handleShareX = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Check out this profile: ${getUserDisplayName(userProfile)}`);
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
  };

  const loadSuggestedUsers = async () => {
    try {
      console.log('Loading suggested users...');
      console.log('Token:', token ? 'Present' : 'Missing');
      
      const url = `${API_BASE}/profile/search?query=&page=1&pageSize=5`;
      console.log('Request URL:', url);
      
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      console.log('Request headers:', headers);
      
      const response = await fetch(url, { headers });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const data = await response.json();
        console.log('Suggested users data:', data);

        const users = data.items || data || [];
        console.log('Processed users:', users);
        setSuggestedUsers(users);
      } else {
        const errorText = await response.text();
        console.error('Failed to load suggested users:', response.status, errorText);
      }
    } catch (error) {
      console.error('Error loading suggested users:', error);
    }
  };

  useEffect(() => {
    if (showShareProfileModal) {
      loadSuggestedUsers();
    }
  }, [showShareProfileModal]);

  const handleSearchUsers = async (query) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/profile/search?query=${encodeURIComponent(query)}&page=1&pageSize=5`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
             if (response.ok) {
         const data = await response.json();

         const users = data.items || data || [];
         setSearchResults(users);
       }
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const handleSendToUser = (username) => {

    const newNotification = {
      id: Date.now(),
      type: 'profile_shared',
      from: currentUser?.userName || 'You',
      to: username,
      message: `Profile shared to ${username}`,
      timestamp: new Date().toLocaleTimeString(),
      read: false
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    setShowNotifications(true);
    

    setShowShareProfileModal(false);
    
    toast.success(`Profile shared to ${username}`);
  };

  const handleBlockUser = () => {
    if (isBlocked) {
      setShowUnblockConfirmModal(true);
    } else {
      setShowBlockConfirmModal(true);
    }
    handleMenuClose();
  };

  const checkBlockStatus = async (userId) => {
    try {
      const response = await fetch(`${API_BASE}/profile/${userId}/block-status`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setIsBlocked(data.isBlocked || false);
      } else if (response.status === 404) {

        setIsBlocked(false);
      }
    } catch (error) {
      console.error('Error checking block status:', error);
    }
  };

  const handleConfirmBlock = async () => {
    if (!token) {
      toast.error('Потрібно увійти в систему');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/profile/${userProfile.id}/block`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast.success('Користувача заблоковано');
        setShowBlockConfirmModal(false);
        setIsBlocked(true);
        navigate('/');
      } else {
        toast.error('Error blocking user');
      }
    } catch (error) {
      console.error('Error blocking user:', error);
      toast.error('Помилка при блокуванні');
    }
  };

  const handleConfirmUnblock = async () => {
    if (!token) {
      toast.error('Потрібно увійти в систему');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/profile/${userProfile.id}/block`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast.success('Користувача розблоковано');
        setShowUnblockConfirmModal(false);
        setIsBlocked(false);
      } else {
        toast.error('Error unblocking user');
      }
    } catch (error) {
      console.error('Error unblocking user:', error);
      toast.error('Помилка при розблокуванні');
    }
  };

  const handleReportUser = () => {
    setShowReportProfileModal(true);
    handleMenuClose();
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!reportMessage.trim()) {
      toast.error('Будь ласка, введіть текст скарги');
      return;
    }
    
    if (reportMessage.trim().length < 10) {
      toast.error('Текст скарги повинен містити мінімум 10 символів');
      return;
    }

    if (!token) {
      toast.error('Потрібно увійти в систему');
      return;
    }

    setIsSubmittingReport(true);
    try {
      const requestBody = {
        ProfileId: userProfile.id,
        ReportMessage: reportMessage.trim()
      };
      console.log('Sending profile report:', requestBody);
      
      const response = await fetch(`${API_BASE}/ProfileReports/report`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        toast.success('Скаргу успішно відправлено');
        setReportMessage('');
        setShowReportProfileModal(false);
      } else {
        const errorText = await response.text();
        console.error('Profile report error:', response.status, errorText);
        toast.error('Error sending report');
      }
    } catch (error) {
      console.error('Error reporting user:', error);
      toast.error('Помилка при відправці скарги');
    } finally {
      setIsSubmittingReport(false);
    }
  };


  const normalizedPins = useMemo(() => {
    return pins.map((pin) => {
      let image = pin.ImageUrl || pin.imageUrl || pin.image;
      if (image && !/^https?:\/\//.test(image)) {
        if (!image.startsWith("/")) image = "/images/" + image.replace(/^.*[\\/]/, "");
      }
      const rawTags = pin.Tags ?? pin.tags ?? '';
      const tags = Array.isArray(rawTags)
        ? rawTags.map((t) => String(t).trim()).filter(Boolean)
        : String(rawTags || "")
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean);
      return {
        id: pin.Id || pin.id,
        image,
        title: pin.Title || pin.title,
        description: pin.Description || pin.description,
        author: pin.UserName || pin.userName || userProfile?.displayName || userProfile?.userName,
        tags,
      };
    });
  }, [pins, userProfile]);

  const normalizedCreatedPins = useMemo(() => {
    return createdPins.map((pin) => {
      let image = pin.ImageUrl || pin.imageUrl || pin.image;
      if (image && !/^https?:\/\//.test(image)) {
        if (!image.startsWith("/")) image = "/images/" + image.replace(/^.*[\\/]/, "");
      }
      const rawTags = pin.Tags ?? pin.tags ?? '';
      const tags = Array.isArray(rawTags)
        ? rawTags.map((t) => String(t).trim()).filter(Boolean)
        : String(rawTags || "")
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean);
      return {
        id: pin.Id || pin.id,
        image,
        title: pin.Title || pin.title,
        description: pin.Description || pin.description,
        author: pin.UserName || pin.userName || userProfile?.displayName || userProfile?.userName,
        tags,
      };
    });
  }, [createdPins, userProfile]);



  if (!userProfile) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                        <Typography>Loading...</Typography>
      </Box>
    );
  }

  const displayName = getUserDisplayName(userProfile);
  const avatarUrl = getUserAvatarUrl(userProfile);
  const bannerUrl = userProfile.bannerUrl;

  return (
         <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#fff" }}>
       <Box>
         <SideMenu />
       </Box>


      <Box sx={{ flex: 1, px: 2 }}>
                 <ProfileHeader
           user={currentUser}
           onSearch={() => {}}
           searchRef={null}
           onFocusSearch={() => {}}
           onOpenNotifications={() => setShowNotifications(true)}

         />

        <Box sx={{ 
          bgcolor: "#fff", 
          borderRadius: "16px", 
          overflow: "hidden", 
          mt: "30px", 
          mx: "auto",
          maxWidth: "calc(100vw - 200px)",
          width: "100%"
        }}>
                     <Box
             sx={{
               width: "100%",
               height: 180,
               borderTopLeftRadius: "40px",
               borderTopRightRadius: "40px",
               overflow: "hidden",
               display: "flex",
               alignItems: "center",
               justifyContent: "center",
               bgcolor: "#EAEFF9",
             }}
           >
             {isBlocked ? (
               <Box
                 sx={{
                   width: "100%",
                   height: "100%",
                   bgcolor: "#f5f5f5",
                   display: "flex",
                   alignItems: "center",
                   justifyContent: "center",
                   color: "#999",
                   fontSize: "48px"
                 }}
               >
                 🚫
               </Box>
             ) : bannerUrl ? (
               <Box
                 component="img"
                 src={bannerUrl}
                 sx={{
                   width: "100%",
                   height: "100%",
                   objectFit: "cover",
                 }}
               />
             ) : (
               <Box sx={{ transform: "scale(0.1)" }}>
                 {defaultBannerSvg}
               </Box>
             )}
           </Box>

          <Box sx={{ position: "relative", px: 3, pb: 2, mt: -10 }}>
            <Box
              sx={{
                position: "relative",
                display: "inline-block",
                borderRadius: "50%",
                bgcolor: "#fff",
                p: 0.7,
                boxShadow: 1,
              }}
            >
                             {isBlocked ? (
                               <Box 
                                 sx={{ 
                                   width: 140, 
                                   height: 140, 
                                   borderRadius: "50%",
                                   bgcolor: "#f5f5f5",
                                   border: "4px solid white",
                                   boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                   display: "flex",
                                   alignItems: "center",
                                   justifyContent: "center",
                                   color: "#999",
                                   fontSize: "24px"
                                 }}
                               >
                                 🚫
                               </Box>
                                                           ) : hasUserAvatar(userProfile) ? (
                                <Avatar
                                  src={getUserAvatarUrl(userProfile)}
                                  alt="avatar"
                                  sx={{ width: 140, height: 140, borderRadius: "50%" }}
                                />
                             ) : (
                               <Box 
                                 sx={{ 
                                   width: 140, 
                                   height: 140, 
                                   borderRadius: "50%",
                                   bgcolor: "#EAEFF9",
                                   border: "4px solid white",
                                   boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                                 }}
                               />
                             )}
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                mt: -12,
                ml: "-25px",
                bgcolor: "#fff",
                borderTopLeftRadius: "40px",
                borderTopRightRadius: "40px",
                p: 2,
              }}
            >
                             <Box sx={{ ml: 24, flex: 1 }}>
                                   <Box sx={{ fontSize: 20, fontWeight: 700 }}>
                    {isBlocked ? 'Заблокований користувач' : displayName}
                  </Box>
                 {!isBlocked && (
                   <Box sx={{ color: "#6b7280", fontSize: 14, mt: 0.5, maxWidth: "400px" }}>
                     {userProfile.bio || "Looking for inspiration..."}
                   </Box>
                 )}
                 {!isBlocked && (
                   <Box sx={{ color: "#111827", fontSize: 14, mt: 0.5 }}>
                     <Box component="span" sx={{ fontWeight: 600 }}>
                       {followersCount} followers
                     </Box>{" "}
                     ·{" "}
                     <Box component="span" sx={{ fontWeight: 600 }}>
                       {followingCount} following
                     </Box>
                   </Box>
                 )}
               </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {currentUser?.id !== userProfile.id && !isBlocked ? (
                  <Button
                    variant="outlined"
                    size="medium"
                    onClick={handleFollow}
                                         sx={{
                       textTransform: "none",
                       borderRadius: 10,
                       px: 2.5,
                       py: 1,
                       bgcolor: isFollowing ? "#D7E0F4" : "#6F91D9",
                       color: isFollowing ? "#111827" : "#FFFFFF",
                       fontWeight: 500,
                       width: "164px",
                       border: isFollowing ? "1px solid #D7E0F4" : "none",
                       display: "flex",
                       alignItems: "center",
                       gap: 1.2,
                       fontSize: "1rem",
                       "&:hover": {
                         bgcolor: isFollowing ? "#C5D0E8" : "#5A7BC7",
                       }
                     }}
                  >
                                            {isFollowing ? 'Followed' : 'Follow'}
                  </Button>
                ) : !isBlocked && (
                  <Button
                    variant="outlined"
                    size="medium"
                    sx={{
                      textTransform: "none",
                      borderRadius: 10,
                      px: 2.5,
                      py: 1,
                      bgcolor: "#D7E0F4",
                      color: "#111827",
                      fontWeight: 500,
                      width: "164px",
                      border: "none",
                      display: "flex",
                      alignItems: "center",
                      gap: 1.2,
                      fontSize: "1rem",
                    }}
                    onClick={() => navigate('/profile-edit')}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M17.263 2.17717C17.5912 1.84924 18.0361 1.66504 18.5 1.66504C18.9639 1.66504 19.4089 1.84924 19.737 2.17717L22.323 4.76317C22.6509 5.09132 22.8351 5.53625 22.8351 6.00017C22.8351 6.46408 22.6509 6.90901 22.323 7.23717L19.53 10.0302L19.518 10.0432L8.69001 20.3782C8.49219 20.5673 8.25278 20.7074 7.99101 20.7872L2.46801 22.4672C2.33813 22.5063 2.20007 22.5095 2.06853 22.4764C1.93698 22.4433 1.81688 22.3751 1.72101 22.2792C1.62505 22.1833 1.55689 22.0632 1.52378 21.9316C1.49067 21.8001 1.49386 21.662 1.53301 21.5322L3.20601 16.0322C3.29375 15.7443 3.45425 15.4839 3.67201 15.2762L14.476 4.96317L17.263 2.17717ZM4.70801 16.3612C4.67708 16.3911 4.65406 16.4282 4.64101 16.4692L3.37701 20.6232L7.55401 19.3522C7.59151 19.3406 7.62576 19.3204 7.65401 19.2932L17.927 9.48717L14.987 6.54817L4.70801 16.3612ZM19 8.44017L21.263 6.17817C21.2863 6.15494 21.3048 6.12736 21.3174 6.09698C21.33 6.06661 21.3365 6.03405 21.3365 6.00117C21.3365 5.96828 21.33 5.93572 21.3174 5.90535C21.3048 5.87498 21.2863 5.84739 21.263 5.82417L18.677 3.23817C18.6538 3.21488 18.6262 3.19641 18.5958 3.18381C18.5655 3.17121 18.5329 3.16472 18.5 3.16472C18.4671 3.16472 18.4346 3.17121 18.4042 3.18381C18.3738 3.19641 18.3462 3.21488 18.323 3.23817L16.061 5.50017L19 8.44017Z"
                        fill="#000D17"
                      />
                    </svg>
                    Edit profile
                  </Button>
                )}
                
                {!isBlocked && (
                  <IconButton 
                    onClick={handleMenuOpen}
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: "#f5f5f5",
                      borderRadius: "50%",
                      "&:hover": {
                        bgcolor: "#e0e0e0"
                      }
                    }}
                  >
                    <MoreVert />
                  </IconButton>
                )}
              </Box>
            </Box>
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                display: 'inline-flex',
                padding: '20px',
                flexDirection: 'column',
                alignItems: 'flex-start',
                borderRadius: '40px',
                background: '#FFF',
                boxShadow: '-1px 10px 16px 1px rgba(1, 35, 63, 0.25)',
                minWidth: '200px',
                mt: 1
              }
            }}
          >
                                                      <MenuItem 
                 onClick={handleAccountInfo}
                 sx={{
                   borderRadius: '20px',
                   mb: 0.5,
                   width: '100%',
                   '&:hover': {
                     backgroundColor: '#f5f5f5'
                   }
                 }}
               >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ marginRight: '8px' }}>
                  <path d="M13 7.5C13 7.76522 12.8946 8.01957 12.7071 8.20711C12.5196 8.39464 12.2652 8.5 12 8.5C11.7348 8.5 11.4804 8.39464 11.2929 8.20711C11.1054 8.01957 11 7.76522 11 7.5C11 7.23478 11.1054 6.98043 11.2929 6.79289C11.4804 6.60536 11.7348 6.5 12 6.5C12.2652 6.5 12.5196 6.60536 12.7071 6.79289C12.8946 6.98043 13 7.23478 13 7.5ZM10 11.25C10 11.0511 10.079 10.8603 10.2197 10.7197C10.3603 10.579 10.5511 10.5 10.75 10.5H12.25C12.4489 10.5 12.6397 10.579 12.7803 10.7197C12.921 10.8603 13 11.0511 13 11.25V15.5H13.75C13.9489 15.5 14.1397 15.579 14.2803 15.7197C14.421 15.8603 14.5 16.0511 14.5 16.25C14.5 16.4489 14.421 16.6397 14.2803 16.7803C14.1397 16.921 13.9489 17 13.75 17H10.75C10.5511 17 10.3603 16.921 10.2197 16.7803C10.079 16.6397 10 16.4489 10 16.25C10 16.0511 10.079 15.8603 10.2197 15.7197C10.3603 15.579 10.5511 15.5 10.75 15.5H11.5V12H10.75C10.5511 12 10.3603 11.921 10.2197 11.7803C10.079 11.6397 10 11.4489 10 11.25Z" fill="#01233F"/>
                  <path d="M12 1C18.075 1 23 5.925 23 12C23 18.075 18.075 23 12 23C5.925 23 1 18.075 1 12C1 5.925 5.925 1 12 1ZM2.5 12C2.5 14.5196 3.50089 16.9359 5.28249 18.7175C7.06408 20.4991 9.48044 21.5 12 21.5C14.5196 21.5 16.9359 20.4991 18.7175 18.7175C20.4991 16.9359 21.5 14.5196 21.5 12C21.5 9.48044 20.4991 7.06408 18.7175 5.28249C16.9359 3.50089 14.5196 2.5 12 2.5C9.48044 2.5 7.06408 3.50089 5.28249 5.28249C3.50089 7.06408 2.5 9.48044 2.5 12Z" fill="#01233F"/>
                </svg>
                Account info
              </MenuItem>
             <MenuItem 
               onClick={handleShareProfile}
               sx={{
                 borderRadius: '20px',
                 mb: 0.5,
                 width: '100%',
                 '&:hover': {
                   backgroundColor: '#f5f5f5'
                 }
               }}
             >
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ marginRight: '8px' }}>
                 <path d="M20.0007 5.49973C20.0018 6.20316 19.7908 6.89058 19.3953 7.47226C18.9997 8.05394 18.438 8.50285 17.7834 8.76038C17.1288 9.01792 16.4118 9.07212 15.7259 8.91591C15.04 8.7597 14.4172 8.40033 13.9387 7.88473L8.8267 10.9057C9.06053 11.6163 9.06053 12.3831 8.8267 13.0937L13.9387 16.1147C14.5273 15.4836 15.3283 15.0922 16.1879 15.0157C17.0475 14.9391 17.905 15.1829 18.5958 15.7C19.2867 16.2172 19.7621 16.9714 19.9308 17.8177C20.0995 18.6641 19.9495 19.5429 19.5098 20.2854C19.07 21.0279 18.3714 21.5818 17.5482 21.8407C16.7249 22.0996 15.8351 22.0452 15.0495 21.688C14.2639 21.3307 13.638 20.6959 13.292 19.9053C12.946 19.1147 12.9042 18.2242 13.1747 17.4047L8.0627 14.3847C7.70453 14.7684 7.26461 15.0667 6.77554 15.2573C6.28647 15.4479 5.76078 15.526 5.23741 15.4859C4.71404 15.4458 4.2064 15.2884 3.7521 15.0255C3.2978 14.7626 2.90848 14.4008 2.61298 13.9669C2.31748 13.5331 2.12337 13.0384 2.04504 12.5193C1.96671 12.0003 2.00615 11.4703 2.16046 10.9686C2.31476 10.4669 2.57997 10.0063 2.93643 9.621C3.2929 9.23569 3.73148 8.93552 4.2197 8.74273C4.87376 8.4854 5.59015 8.43096 6.27558 8.58649C6.96102 8.74202 7.58375 9.10031 8.0627 9.61473L13.1747 6.59373C13.0171 6.11277 12.9657 5.60335 13.024 5.1006C13.0823 4.59784 13.249 4.11372 13.5125 3.68161C13.776 3.2495 14.1301 2.87968 14.5504 2.59766C14.9707 2.31563 15.4471 2.1281 15.9468 2.04801C16.4466 1.96792 16.9577 1.99716 17.4451 2.13372C17.9324 2.27029 18.3844 2.51093 18.7697 2.83904C19.1551 3.16716 19.4647 3.57495 19.6772 4.03429C19.8897 4.49363 20.0001 4.9936 20.0007 5.49973ZM18.5007 18.4997C18.5067 18.2334 18.4595 17.9685 18.3617 17.7207C18.264 17.4729 18.1177 17.2471 17.9315 17.0566C17.7453 16.866 17.5229 16.7146 17.2774 16.6113C17.0318 16.5079 16.7681 16.4546 16.5017 16.4545C16.2353 16.4544 15.9716 16.5076 15.726 16.6109C15.4804 16.7141 15.2579 16.8654 15.0716 17.0558C14.8853 17.2463 14.7389 17.472 14.6411 17.7198C14.5432 17.9676 14.4958 18.2324 14.5017 18.4987C14.5133 19.0213 14.7289 19.5186 15.1025 19.8841C15.4762 20.2496 15.978 20.4544 16.5007 20.4545C17.0234 20.4546 17.5254 20.2501 17.8992 19.8848C18.273 19.5194 18.4889 19.0223 18.5007 18.4997ZM18.5007 5.49973C18.5067 5.23339 18.4595 4.96853 18.3617 4.7207C18.264 4.47287 18.1177 4.24707 17.9315 4.05655C17.7453 3.86603 17.5229 3.71464 17.2774 3.61125C17.0318 3.50787 16.7681 3.45458 16.5017 3.45451C16.2353 3.45444 15.9716 3.5076 15.726 3.61086C15.4804 3.71413 15.2579 3.86541 15.0716 4.05584C14.8853 4.24626 14.7389 4.47199 14.6411 4.71977C14.5432 4.96755 14.4958 5.23238 14.5017 5.49873C14.5133 6.02129 14.7289 6.51856 15.1025 6.8841C15.4762 7.24963 15.978 7.45438 16.5007 7.45451C17.0234 7.45464 17.5254 7.25014 17.8992 6.8848C18.273 6.51945 18.4889 6.02228 18.5007 5.49973ZM5.5007 13.9997C5.76704 14.0057 6.0319 13.9585 6.27973 13.8608C6.52755 13.763 6.75335 13.6167 6.94387 13.4305C7.13439 13.2443 7.28579 13.0219 7.38917 12.7764C7.49256 12.5309 7.54585 12.2671 7.54592 12.0007C7.54598 11.7343 7.49282 11.4706 7.38956 11.225C7.2863 10.9794 7.13501 10.757 6.94459 10.5707C6.75416 10.3843 6.52843 10.238 6.28066 10.1401C6.03288 10.0422 5.76804 9.99484 5.5017 10.0007C4.97914 10.0123 4.48187 10.228 4.11633 10.6016C3.75079 10.9752 3.54605 11.477 3.54592 11.9997C3.54579 12.5224 3.75028 13.0244 4.11563 13.3982C4.48098 13.772 4.97814 13.9879 5.5007 13.9997Z" fill="#01233F"/>
               </svg>
               Share profile
             </MenuItem>
            {currentUser?.id !== userProfile.id && [
              <Divider key="divider" sx={{ width: '100%', my: 1 }} />,
                             <MenuItem 
                 key="block" 
                 onClick={handleBlockUser}
                 sx={{
                   borderRadius: '20px',
                   mb: 0.5,
                   width: '100%',
                   '&:hover': {
                     backgroundColor: '#f5f5f5'
                   }
                 }}
               >
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ marginRight: '8px' }}>
                   <path d="M12 1C18.075 1 23 5.925 23 12C23 18.075 18.075 23 12 23C5.925 23 1 18.075 1 12C1 5.925 5.925 1 12 1ZM5.834 19.227C7.55167 20.6972 9.73908 21.5035 12 21.5C14.5196 21.5 16.9359 20.4991 18.7175 18.7175C20.4991 16.9359 21.5 14.5196 21.5 12C21.5035 9.73908 20.6972 7.55167 19.227 5.834L5.834 19.227ZM2.5 12C2.49649 14.2609 3.30285 16.4483 4.773 18.166L18.166 4.773C16.4483 3.30285 14.2609 2.49649 12 2.5C9.48044 2.5 7.06408 3.50089 5.28249 5.28249C3.50089 7.06408 2.5 9.48044 2.5 12Z" fill="#01233F"/>
                 </svg>
                 {isBlocked ? 'Unblock' : 'Block'}
               </MenuItem>,
               !isBlocked && <MenuItem 
                 key="report" 
                 onClick={handleReportUser}
                 sx={{
                   borderRadius: '20px',
                   mb: 0.5,
                   width: '100%',
                   '&:hover': {
                     backgroundColor: '#f5f5f5'
                   }
                 }}
               >
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ marginRight: '8px' }}>
                   <path d="M1.5 4.25C1.5 3.284 2.284 2.5 3.25 2.5H20.75C21.716 2.5 22.5 3.284 22.5 4.25V16.75C22.5 17.2141 22.3156 17.6592 21.9874 17.9874C21.6592 18.3156 21.2141 18.5 20.75 18.5H11.164C11.1311 18.4999 11.0986 18.5064 11.0682 18.5189C11.0379 18.5314 11.0103 18.5498 10.987 18.573L7.487 22.073C7.28305 22.2762 7.02352 22.4144 6.74112 22.4703C6.45872 22.5262 6.16609 22.4973 5.90011 22.3871C5.63414 22.277 5.40673 22.0905 5.24655 21.8513C5.08636 21.6121 5.00058 21.3309 5 21.043V18.5H3.25C2.78587 18.5 2.34075 18.3156 2.01256 17.9874C1.68437 17.6592 1.5 17.2141 1.5 16.75V4.25ZM3.25 4C3.1837 4 3.12011 4.02634 3.07322 4.07322C3.02634 4.12011 3 4.1837 3 4.25V16.75C3 16.888 3.112 17 3.25 17H5.75C5.94891 17 6.13968 17.079 6.28033 17.2197C6.42098 17.3603 6.5 17.5511 6.5 17.75V20.94L9.927 17.513C10.255 17.1848 10.7 17.0002 11.164 17H20.75C20.8163 17 20.8799 16.9737 20.9268 16.9268C20.9737 16.8799 21 16.8163 21 16.75V4.25C21 4.1837 20.9737 4.12011 20.9268 4.07322C20.8799 4.02634 20.8163 4 20.75 4H3.25ZM12 6C12.1989 6 12.3897 6.07902 12.5303 6.21967C12.671 6.36032 12.75 6.55109 12.75 6.75V10.75C12.75 10.9489 12.671 11.1397 12.5303 11.2803C12.3897 11.421 12.1989 11.5 12 11.5C11.8011 11.5 11.6103 11.421 11.4697 11.2803C11.329 11.1397 11.25 10.9489 11.25 10.75V6.75C11.25 6.55109 11.329 6.36032 11.4697 6.21967C11.6103 6.07902 11.8011 6 12 6ZM12 15C11.7348 15 11.4804 14.8946 11.2929 14.7071C11.1054 14.5196 11 14.2652 11 14C11 13.7348 11.1054 13.4804 11.2929 13.2929C11.4804 13.1054 11.7348 13 12 13C12.2652 13 12.5196 13.1054 12.7071 13.2929C12.8946 13.4804 13 13.7348 13 14C13 14.2652 12.8946 14.5196 12.7071 14.7071C12.5196 14.8946 12.2652 15 12 15Z" fill="#01233F"/>
                 </svg>
                 Report
               </MenuItem>
            ]}
          </Menu>

          <Box sx={{ display: "flex", gap: 1.5, mt: 3, px: 2 }}>
            {["Aests", "Boards", "Created"].map((tab) => (
              <Button
                key={tab}
                onClick={() => !isBlocked && handleTabChange(tab)}
                variant="text"
                disabled={isBlocked}
                sx={{
                  textTransform: "none",
                  borderRadius: 6,
                  px: 2,
                  py: 1,
                  boxShadow: activeTab === tab ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
                  bgcolor: activeTab === tab ? "#FFFFFF" : "#EAEFF9",
                  color: isBlocked ? "#999" : "#111827",
                  border: activeTab === tab ? "1px solid #EAEFF9" : "none",
                  opacity: isBlocked ? 0.5 : 1,
                  cursor: isBlocked ? "not-allowed" : "pointer",
                  "&:hover": {
                    bgcolor: isBlocked ? "#EAEFF9" : "#EAEFF9",
                    borderColor: isBlocked ? "#EAEFF9" : "#CBD7F1",
                  },
                  "&:disabled": {
                    bgcolor: "#EAEFF9",
                    color: "#999",
                    cursor: "not-allowed",
                  },
                }}
              >
                {tab}
              </Button>
            ))}
          </Box>

          <Box sx={{ mt: 2, pb: 6 }}>

            {isBlocked && (
              <Box sx={{ 
                textAlign: 'center', 
                color: '#6b7280', 
                py: 6,
                px: 2,
                backgroundColor: '#f9f9f9',
                borderRadius: 2,
                mb: 2
              }}>
                <Typography variant="h6" sx={{ mb: 2, color: '#01233F' }}>
                  Цей користувач заблокований
                </Typography>
                <Typography variant="body2" sx={{ mb: 3 }}>
                  Ви заблокували цього користувача. Щоб побачити його контент, спочатку розблокуйте його.
                </Typography>
                <Button
                  onClick={handleBlockUser}
                  sx={{
                    padding: '8px 16px',
                    border: '2px solid #01233F',
                    background: 'white',
                    color: '#01233F',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textTransform: 'none',
                    '&:hover': {
                      background: '#01233F',
                      color: 'white',
                    },
                  }}
                >
                  Розблокувати користувача
                </Button>
              </Box>
            )}
            
            {activeTab === "Boards" && !isBlocked && (
              <>
                {loading ? (
                  <Box sx={{ textAlign: "center", mt: 4, color: "#7B8D9B" }}>Loading...</Box>
                ) : (
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                      gap: 2,
                      px: 2
                    }}
                  >
                    {boards.map((b) => (
                      <Box
                        key={b.Id || b.id}
                        sx={{ p: 2, border: "1px solid #eee", borderRadius: 2 }}
                      >
                        <Box sx={{ fontWeight: 600 }}>{b.Name || b.name}</Box>
                        <Box sx={{ color: "#6b7280", fontSize: 13 }}>
                          {b.Description || b.description || ""}
                        </Box>
                      </Box>
                    ))}
                                         {boards.length === 0 && (
                       <Box sx={{ 
                         textAlign: "center", 
                         color: "#6b7280", 
                         py: 6,
                         gridColumn: "1 / -1",
                         display: "flex",
                         justifyContent: "center",
                         alignItems: "center"
                       }}>
                         There are no boards yet...
                       </Box>
                     )}
                  </Box>
                )}
              </>
            )}

                         {activeTab === 'Aests' && !isBlocked && (
               <>
                 {loading ? (
                   <Box sx={{ textAlign: 'center', mt: 4, color: '#7B8D9B' }}>Loading...</Box>
                 ) : normalizedPins.length === 0 ? (
                   <Box sx={{ textAlign: 'center', color: '#6b7280', py: 6 }}>

                   </Box>
                 ) : (
                   <MasonryGrid 
                     pins={normalizedPins} 
                     limitedMenu 
                     disableUnsave={currentUser?.id !== userProfile?.id}
                   />
                 )}
               </>
             )}

            {activeTab === 'Created' && !isBlocked && (
              <>
                {loading ? (
                  <Box sx={{ textAlign: 'center', mt: 4, color: '#7B8D9B' }}>Loading...</Box>
                                 ) : normalizedCreatedPins.length === 0 ? (
                   <Box sx={{ textAlign: 'center', color: '#6b7280', py: 6 }}>
                     There are no created pins yet, let's create the first one!
                   </Box>
                ) : (
                  <MasonryGrid pins={normalizedCreatedPins} limitedMenu />
                )}
              </>
            )}
                     </Box>
         </Box>
       </Box>


       {showAccountInfoModal && (
         <Box
           sx={{
             position: 'fixed',
             top: 0,
             left: 0,
             right: 0,
             bottom: 0,
             backgroundColor: 'rgba(0, 0, 0, 0.5)',
             display: 'flex',
             alignItems: 'center',
             justifyContent: 'center',
             zIndex: 1300,
           }}
           onClick={() => setShowAccountInfoModal(false)}
         >
                       <Box
              sx={{
                backgroundColor: '#fff',
                borderRadius: '40px',
                padding: '40px',
                width: '558px',
                maxWidth: '90%',
                maxHeight: '80vh',
                overflow: 'auto',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '40px',
                boxShadow: '-1px 10px 16px 1px rgba(1, 35, 63, 0.25)',
              }}
              onClick={(e) => e.stopPropagation()}
            >

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: '100%',
                }}
              >
               <Typography
                 variant="h6"
                 sx={{
                   fontWeight: 700,
                   fontSize: '18px',
                   color: '#111827',
                 }}
               >
                 Account info
               </Typography>
               <IconButton
                 onClick={() => setShowAccountInfoModal(false)}
                 sx={{
                   width: 32,
                   height: 32,
                   color: '#6b7280',
                   '&:hover': {
                     backgroundColor: '#f3f4f6',
                   },
                 }}
               >
                 ×
               </IconButton>
             </Box>


              <Box sx={{ width: '100%' }}>
                               <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: '16px',
                    color: '#111827',
                    mb: 1,
                  }}
                >
                  {getUserDisplayName(userProfile)}
                </Typography>
                <Typography
                  sx={{
                    fontSize: '14px',
                    color: '#6b7280',
                    mb: 2,
                  }}
                >
                  @{getUserUsername(userProfile)}
                </Typography>
                                <Typography
                   sx={{
                     fontSize: '14px',
                     color: '#111827',
                   }}
                 >
                   Register date: 13/08/2025
                 </Typography>
             </Box>
           </Box>
         </Box>
               )}


        {showShareProfileModal && (
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1300,
            }}
            onClick={() => setShowShareProfileModal(false)}
          >
            <Box
              sx={{
                backgroundColor: '#fff',
                borderRadius: '40px',
                padding: '40px',
                width: '558px',
                maxWidth: '90%',
                maxHeight: '80vh',
                overflow: 'auto',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '40px',
                boxShadow: '-1px 10px 16px 1px rgba(1, 35, 63, 0.25)',
              }}
              onClick={(e) => e.stopPropagation()}
            >

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: '100%',
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    fontSize: '18px',
                    color: '#111827',
                  }}
                >
                  Share profile
                </Typography>
                <IconButton
                  onClick={() => setShowShareProfileModal(false)}
                  sx={{
                    width: 32,
                    height: 32,
                    color: '#6b7280',
                    '&:hover': {
                      backgroundColor: '#f3f4f6',
                    },
                  }}
                >
                  ×
                </IconButton>
              </Box>


              <Box sx={{ width: '100%' }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-around',
                    alignItems: 'center',
                    mb: 4,
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      cursor: 'pointer',
                    }}
                    onClick={handleCopyLink}
                  >
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        backgroundColor: '#D7E0F4',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 1,
                      }}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" stroke="#01233F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </Box>
                    <Typography sx={{ fontSize: '14px', color: '#111827' }}>
                      Copy link
                    </Typography>
                  </Box>


                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      cursor: 'pointer',
                    }}
                    onClick={handleShareTelegram}
                  >
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        backgroundColor: '#0088CC',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 1,
                      }}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </Box>
                    <Typography sx={{ fontSize: '14px', color: '#111827' }}>
                      Telegram
                    </Typography>
                  </Box>


                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      cursor: 'pointer',
                    }}
                    onClick={handleShareX}
                  >
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        backgroundColor: '#000000',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 1,
                      }}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="white"/>
                      </svg>
                    </Box>
                    <Typography sx={{ fontSize: '14px', color: '#111827' }}>
                      X
                    </Typography>
                  </Box>
                </Box>


                <Box sx={{ mb: 4 }}>
                  <Box
                    sx={{
                      position: 'relative',
                      width: '100%',
                    }}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        left: 16,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#6b7280',
                      }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </Box>
                                         <input
                       type="text"
                       placeholder="Search people"
                       value={searchQuery}
                       onChange={(e) => handleSearchUsers(e.target.value)}
                       style={{
                         width: '100%',
                         padding: '16px 16px 16px 48px',
                         border: 'none',
                         borderRadius: '24px',
                         backgroundColor: '#f3f4f6',
                         fontSize: '16px',
                         outline: 'none',
                       }}
                     />
                  </Box>
                </Box>


                <Box sx={{ width: '100%' }}>
                                     <Typography
                     sx={{
                       fontSize: '16px',
                       fontWeight: 600,
                       color: '#111827',
                       mb: 2,
                     }}
                   >
                     {searchQuery ? 'Search Results' : 'Suggested'}
                   </Typography>
                   

                                        {(searchQuery ? searchResults : suggestedUsers).length > 0 ? (
                       (searchQuery ? searchResults : suggestedUsers).map((user, index) => (
                         <Box
                           key={user.id || index}
                           sx={{
                             display: 'flex',
                             alignItems: 'center',
                             justifyContent: 'space-between',
                             py: 2,
                             borderBottom: index < (searchQuery ? searchResults : suggestedUsers).length - 1 ? '1px solid #f3f4f6' : 'none',
                           }}
                         >
                                             <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                   <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: '50%',
                              backgroundColor: hasUserAvatar(user) ? 'transparent' : '#EAEFF9',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontWeight: 600,
                              overflow: 'hidden',
                            }}
                          >
                            {hasUserAvatar(user) ? (
                              <img 
                                src={getUserAvatarUrl(user)} 
                                alt={getUserDisplayName(user)}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            ) : (
                              <span style={{ color: '#6b7280' }}>
                                {getUserAvatarInitial(user)}
                              </span>
                            )}
                          </Box>
                         <Box>
                                                       <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>
                              {getUserDisplayName(user)}
                            </Typography>
                            <Typography sx={{ fontSize: '12px', color: '#6b7280' }}>
                              @{getUserUsername(user)}
                            </Typography>
                         </Box>
                       </Box>
                       <Button
                         variant="outlined"
                         size="small"
                         onClick={() => handleSendToUser(user.userName)}
                         sx={{
                           textTransform: 'none',
                           borderRadius: '20px',
                           px: 2,
                           py: 0.5,
                           borderColor: '#d1d5db',
                           color: '#111827',
                           fontSize: '12px',
                           '&:hover': {
                             borderColor: '#9ca3af',
                             backgroundColor: '#f9fafb',
                           },
                         }}
                       >
                                                  Send
                       </Button>
                       </Box>
                     ))
                   ) : (
                     <Box sx={{ textAlign: 'center', py: 4, color: '#6b7280' }}>
                       {searchQuery ? 'No users found' : 'Loading users...'}
                     </Box>
                   )}
                </Box>
              </Box>
            </Box>
          </Box>
                 )}


               <style dangerouslySetInnerHTML={{
                 __html: `
                   @keyframes slideIn {
                     from {
                       transform: translateX(100%);
                     }
                     to {
                       transform: translateX(0);
                     }
                   }
                   
                   @keyframes modalSlideIn {
                     from {
                       opacity: 0;
                       transform: translateY(-20px) scale(0.95);
                     }
                     to {
                       opacity: 1;
                       transform: translateY(0) scale(1);
                     }
                   }
                 `
               }} />


               {showBlockConfirmModal && (
                 <Box
                   sx={{
                     position: 'fixed',
                     top: 0,
                     left: 0,
                     right: 0,
                     bottom: 0,
                     backgroundColor: 'rgba(0, 0, 0, 0.5)',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center',
                     zIndex: 1300,
                   }}
                   onClick={() => setShowBlockConfirmModal(false)}
                 >
                   <Box
                     sx={{
                       display: 'flex',
                       width: '558px',
                       padding: '40px',
                       flexDirection: 'column',
                       alignItems: 'flex-start',
                       gap: '40px',
                       borderRadius: '40px',
                       background: '#FFF',
                       boxShadow: '-1px 10px 16px 1px rgba(1, 35, 63, 0.25)',
                     }}
                     onClick={(e) => e.stopPropagation()}
                   >
                     <Typography
                       variant="h5"
                       sx={{
                         fontWeight: 600,
                         color: '#111827',
                         fontSize: '24px',
                         lineHeight: '32px',
                       }}
                     >
                       Are you sure you want to block this person?
                     </Typography>
                     
                     <Box sx={{ width: '100%' }}>
                       <Typography
                         sx={{
                           color: '#dc2626',
                           fontSize: '16px',
                           fontWeight: 500,
                           mb: 2,
                         }}
                       >
                         They will no longer be able to:
                       </Typography>
                       <Box sx={{ pl: 2 }}>
                         <Typography sx={{ fontSize: '16px', color: '#111827', mb: 1 }}>
                           • See your profile and saved Aests
                         </Typography>
                         <Typography sx={{ fontSize: '16px', color: '#111827', mb: 1 }}>
                           • Follow you
                         </Typography>
                         <Typography sx={{ fontSize: '16px', color: '#111827' }}>
                           • Message you
                         </Typography>
                       </Box>
                     </Box>

                     <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
                       <Button
                         variant="outlined"
                         onClick={() => setShowBlockConfirmModal(false)}
                         sx={{
                           flex: 1,
                           textTransform: 'none',
                           borderRadius: '100px',
                           py: 1.5,
                           borderColor: '#d1d5db',
                           color: '#111827',
                           '&:hover': {
                             borderColor: '#9ca3af',
                             backgroundColor: '#f9fafb',
                           },
                         }}
                       >
                         Cancel
                       </Button>
                       <Button
                         variant="contained"
                         onClick={handleConfirmBlock}
                         sx={{
                           flex: 1,
                           textTransform: 'none',
                           borderRadius: '100px',
                           py: 1.5,
                           backgroundColor: '#dc2626',
                           '&:hover': {
                             backgroundColor: '#b91c1c',
                           },
                         }}
                       >
                         Block
                       </Button>
                     </Box>
                   </Box>
                 </Box>
               )}


               {showUnblockConfirmModal && (
                 <Box
                   sx={{
                     position: 'fixed',
                     top: 0,
                     left: 0,
                     right: 0,
                     bottom: 0,
                     backgroundColor: 'rgba(0, 0, 0, 0.5)',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center',
                     zIndex: 1300,
                   }}
                   onClick={() => setShowUnblockConfirmModal(false)}
                 >
                   <Box
                     sx={{
                       display: 'flex',
                       width: '558px',
                       padding: '40px',
                       flexDirection: 'column',
                       alignItems: 'flex-start',
                       gap: '40px',
                       borderRadius: '40px',
                       background: '#FFF',
                       boxShadow: '-1px 10px 16px 1px rgba(1, 35, 63, 0.25)',
                     }}
                     onClick={(e) => e.stopPropagation()}
                   >
                     <Typography
                       variant="h5"
                       sx={{
                         fontWeight: 600,
                         color: '#111827',
                         fontSize: '24px',
                         lineHeight: '32px',
                       }}
                     >
                       Are you sure you want to unblock this person?
                     </Typography>
                     
                     <Box sx={{ width: '100%' }}>
                       <Typography
                         sx={{
                           color: '#059669',
                           fontSize: '16px',
                           fontWeight: 500,
                           mb: 2,
                         }}
                       >
                         They will be able to:
                       </Typography>
                       <Box sx={{ pl: 2 }}>
                         <Typography sx={{ fontSize: '16px', color: '#111827', mb: 1 }}>
                           • See your profile and saved Aests
                         </Typography>
                         <Typography sx={{ fontSize: '16px', color: '#111827', mb: 1 }}>
                           • Follow you
                         </Typography>
                         <Typography sx={{ fontSize: '16px', color: '#111827' }}>
                           • Message you
                         </Typography>
                       </Box>
                     </Box>

                     <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
                       <Button
                         variant="outlined"
                         onClick={() => setShowUnblockConfirmModal(false)}
                         sx={{
                           flex: 1,
                           textTransform: 'none',
                           borderRadius: '100px',
                           py: 1.5,
                           borderColor: '#d1d5db',
                           color: '#111827',
                           '&:hover': {
                             borderColor: '#9ca3af',
                             backgroundColor: '#f9fafb',
                           },
                         }}
                       >
                         Cancel
                       </Button>
                       <Button
                         variant="contained"
                         onClick={handleConfirmUnblock}
                         sx={{
                           flex: 1,
                           textTransform: 'none',
                           borderRadius: '100px',
                           py: 1.5,
                           backgroundColor: '#059669',
                           '&:hover': {
                             backgroundColor: '#047857',
                           },
                         }}
                       >
                         Unblock
                       </Button>
                     </Box>
                   </Box>
                 </Box>
               )}


               {showReportProfileModal && (
                 <Box
                   sx={{
                     position: 'fixed',
                     top: 0,
                     left: 0,
                     right: 0,
                     bottom: 0,
                     backgroundColor: 'rgba(0, 0, 0, 0.5)',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center',
                     zIndex: 1300,
                     backdropFilter: 'blur(4px)',
                   }}
                   onClick={() => !isSubmittingReport && setShowReportProfileModal(false)}
                 >
                   <Box
                     sx={{
                       background: 'white',
                       borderRadius: '24px',
                       boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                       maxWidth: '500px',
                       width: '90%',
                       maxHeight: '80vh',
                       overflow: 'hidden',
                       animation: 'modalSlideIn 0.3s ease-out',
                     }}
                     onClick={(e) => e.stopPropagation()}
                   >

                     <Box
                       sx={{
                         display: 'flex',
                         alignItems: 'center',
                         justifyContent: 'space-between',
                         padding: '24px 24px 0 24px',
                         borderBottom: '1px solid #f0f0f0',
                       }}
                     >
                       <Typography
                         variant="h6"
                         sx={{
                           margin: 0,
                           fontSize: '20px',
                           fontWeight: 600,
                           color: '#333',
                         }}
                       >
                         Повідомити про профіль
                       </Typography>
                       <IconButton
                         onClick={() => !isSubmittingReport && setShowReportProfileModal(false)}
                         disabled={isSubmittingReport}
                         sx={{
                           background: 'none',
                           border: 'none',
                           cursor: 'pointer',
                           padding: '8px',
                           borderRadius: '50%',
                           color: '#666',
                           transition: 'all 0.2s ease',
                           display: 'flex',
                           alignItems: 'center',
                           justifyContent: 'center',
                           '&:hover': {
                             background: '#f5f5f5',
                             color: '#333',
                           },
                           '&:disabled': {
                             opacity: 0.5,
                             cursor: 'not-allowed',
                           },
                         }}
                       >
                         <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                           <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                         </svg>
                       </IconButton>
                     </Box>
                     

                     <Box sx={{ padding: '24px' }}>
                       <Typography
                         sx={{
                           margin: '0 0 20px 0',
                           color: '#666',
                           fontSize: '14px',
                           lineHeight: 1.5,
                         }}
                       >
                         Повідомте нам, що вас не влаштовує в цьому профілі. Ми розглянемо вашу скаргу.
                       </Typography>
                       
                       <Box
                         component="form"
                         onSubmit={handleReportSubmit}
                         sx={{
                           display: 'flex',
                           flexDirection: 'column',
                           gap: '20px',
                         }}
                       >
                         <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                           <Typography
                             component="label"
                             sx={{
                               fontWeight: 500,
                               color: '#333',
                               fontSize: '14px',
                             }}
                           >
                             Текст скарги:
                           </Typography>
                           <Box
                             component="textarea"
                             value={reportMessage}
                             onChange={(e) => setReportMessage(e.target.value)}
                             placeholder="Опишіть проблему з цим профілем..."
                             rows={5}
                             required
                             disabled={isSubmittingReport}
                             maxLength="1000"
                             sx={{
                               width: '100%',
                               padding: '12px 16px',
                               border: '2px solid #e0e0e0',
                               borderRadius: '12px',
                               fontSize: '14px',
                               fontFamily: 'inherit',
                               resize: 'vertical',
                               minHeight: '120px',
                               transition: 'border-color 0.2s ease',
                               boxSizing: 'border-box',
                               '&:focus': {
                                 outline: 'none',
                                 borderColor: '#01233F',
                               },
                               '&:disabled': {
                                 background: '#f9f9f9',
                                 color: '#999',
                                 cursor: 'not-allowed',
                               },
                             }}
                           />
                           <Box
                             sx={{
                               textAlign: 'right',
                               fontSize: '12px',
                               color: '#999',
                               marginTop: '4px',
                             }}
                           >
                             {reportMessage.length}/1000 символів
                             {reportMessage.trim().length > 0 && reportMessage.trim().length < 10 && (
                               <Box component="span" sx={{ color: 'red', marginLeft: '10px' }}>
                                 Мінімум 10 символів
                               </Box>
                             )}
                           </Box>
                         </Box>
                         
                         <Box
                           sx={{
                             display: 'flex',
                             gap: '12px',
                             justifyContent: 'flex-end',
                             marginTop: '8px',
                           }}
                         >
                           <Button
                             type="button"
                             onClick={() => setShowReportProfileModal(false)}
                             disabled={isSubmittingReport}
                             sx={{
                               padding: '12px 24px',
                               border: '2px solid #e0e0e0',
                               background: 'white',
                               color: '#666',
                               borderRadius: '12px',
                               fontSize: '14px',
                               fontWeight: 500,
                               cursor: 'pointer',
                               transition: 'all 0.2s ease',
                               textTransform: 'none',
                               '&:hover': {
                                 borderColor: '#ccc',
                                 background: '#f9f9f9',
                               },
                               '&:disabled': {
                                 background: '#ccc',
                                 cursor: 'not-allowed',
                               },
                             }}
                           >
                             Cancel
                           </Button>
                           <Button
                             type="submit"
                             disabled={isSubmittingReport || !reportMessage.trim() || reportMessage.trim().length < 10}
                             sx={{
                               padding: '12px 24px',
                               border: 'none',
                               background: '#01233F',
                               color: 'white',
                               borderRadius: '12px',
                               fontSize: '14px',
                               fontWeight: 500,
                               cursor: 'pointer',
                               transition: 'all 0.2s ease',
                               textTransform: 'none',
                               '&:hover': {
                                 background: '#001a2e',
                                 transform: 'translateY(-1px)',
                               },
                               '&:disabled': {
                                 background: '#ccc',
                                 cursor: 'not-allowed',
                                 transform: 'none',
                               },
                             }}
                           >
                             {isSubmittingReport ? 'Відправка...' : 'Відправити скаргу'}
                           </Button>
                         </Box>
                       </Box>
                     </Box>
                   </Box>
                 </Box>
               )}
        </Box>
      );
    };

export default UserProfile;
