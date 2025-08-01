import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Avatar,
  Typography,
  Button,
  Grid,
  Chip,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tab,
  Tabs,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import {
  Edit,
  ContentCopy,
  OpenInNew,
  Twitter,
  Instagram,
  Language,
  Upload,
  Close
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { useWeb3 } from '../../contexts/Web3Context';
import { useNFT } from '../../hooks/useNFT';
import { usePayments } from '../../hooks/usePayments';
import { API_CONFIG, getAuthHeaders, getMultipartHeaders } from '../../config/api';
import { BLOCKCHAIN_CONFIG } from '../../config/blockchain';
import MarketplaceGrid from './MarketplaceGrid';
import { toast } from 'react-toastify';
import axios from 'axios';

const UserProfile = ({ walletAddress, isOwnProfile = false }) => {
  const { token } = useAuth();
  const { formatAddress, account } = useWeb3();
  const { getUserNFTs, getUserFavorites } = useNFT();
  const { balance } = usePayments();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editForm, setEditForm] = useState({
    nickname: '',
    bio: '',
    website: '',
    twitter: '',
    instagram: '',
    discord: ''
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Завантаження профілю
  useEffect(() => {
    loadProfile();
  }, [walletAddress]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USER_PROFILE(walletAddress)}`
      );

      if (response.data.success) {
        const userData = response.data.data;
        setProfile(userData);
        setEditForm({
          nickname: userData.displayName || '',
          bio: userData.bio || '',
          website: userData.website || '',
          twitter: userData.twitter || '',
          instagram: userData.instagram || '',
          discord: userData.discord || ''
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Помилка завантаження профілю');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async () => {
    setIsUpdating(true);
    
    try {
      // Оновлення основної інформації
      const updateResponse = await axios.put(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USER_UPDATE(walletAddress)}`,
        {
          nickname: editForm.nickname,
          bio: editForm.bio,
          website: editForm.website,
          twitter: editForm.twitter,
          instagram: editForm.instagram,
          discord: editForm.discord
        },
        { headers: getAuthHeaders(token) }
      );

      if (updateResponse.data.success) {
        // Завантаження аватару
        if (avatarFile) {
          const avatarFormData = new FormData();
          avatarFormData.append('file', avatarFile);
          
          await axios.post(
            `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USER_UPLOAD_AVATAR(walletAddress)}`,
            avatarFormData,
            { headers: getMultipartHeaders(token) }
          );
        }

        // Завантаження банеру
        if (bannerFile) {
          const bannerFormData = new FormData();
          bannerFormData.append('file', bannerFile);
          
          await axios.post(
            `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USER_UPLOAD_BANNER(walletAddress)}`,
            bannerFormData,
            { headers: getMultipartHeaders(token) }
          );
        }

        toast.success('Профіль оновлено успішно');
        setShowEditDialog(false);
        loadProfile();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Помилка оновлення профілю');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    toast.success('Адресу скопійовано');
  };

  const handleOpenInExplorer = () => {
    window.open(`${BLOCKCHAIN_CONFIG.POLYGON_BLOCK_EXPLORER}/address/${walletAddress}`, '_blank');
  };

  const handleFileChange = (event, type) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Оберіть файл зображення');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB
        toast.error('Розмір файлу не може перевищувати 5MB');
        return;
      }

      if (type === 'avatar') {
        setAvatarFile(file);
      } else {
        setBannerFile(file);
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (!profile) {
    return (
      <Alert severity="error">
        Профіль не знайдено
      </Alert>
    );
  }

  return (
    <Box>
      {/* Банер */}
      <Card sx={{ mb: 3 }}>
        <Box
          sx={{
            height: 200,
            backgroundImage: profile.bannerUrl ? `url(${profile.bannerUrl})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative',
            borderRadius: '4px 4px 0 0',
            backgroundColor: profile.bannerUrl ? 'transparent' : '#1f2937'
          }}
        >
          {isOwnProfile && (
            <IconButton
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                bgcolor: 'rgba(255,255,255,0.8)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
              }}
              onClick={() => setShowEditDialog(true)}
            >
              <Edit />
            </IconButton>
          )}
        </Box>

        <CardContent>
          <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3}>
            {/* Аватар та основна інформація */}
            <Box display="flex" flexDirection="column" alignItems="center" minWidth={200}>
              <Avatar
                src={profile.avatarUrl}
                sx={{
                  width: 120,
                  height: 120,
                  mt: -8,
                  border: '4px solid white',
                  boxShadow: 2
                }}
              />
              
              <Typography variant="h5" sx={{ mt: 2, textAlign: 'center' }}>
                {profile.displayName || formatAddress(walletAddress)}
              </Typography>
              
              <Box display="flex" alignItems="center" gap={1} mt={1}>
                <Typography variant="body2" color="text.secondary" fontFamily="monospace">
                  {formatAddress(walletAddress)}
                </Typography>
                <IconButton size="small" onClick={handleCopyAddress}>
                  <ContentCopy fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={handleOpenInExplorer}>
                  <OpenInNew fontSize="small" />
                </IconButton>
              </Box>

              {/* Баланс */}
              <Chip
                label={`${balance} MATIC`}
                color="primary"
                sx={{ mt: 2 }}
              />
            </Box>

            {/* Детальна інформація */}
            <Box flex={1}>
              {profile.bio && (
                <Typography variant="body1" paragraph>
                  {profile.bio}
                </Typography>
              )}

              {/* Соціальні мережі */}
              <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
                {profile.website && (
                  <Button
                    startIcon={<Language />}
                    href={profile.website}
                    target="_blank"
                    size="small"
                  >
                    Сайт
                  </Button>
                )}
                {profile.twitter && (
                  <Button
                    startIcon={<Twitter />}
                    href={`https://twitter.com/${profile.twitter}`}
                    target="_blank"
                    size="small"
                  >
                    Twitter
                  </Button>
                )}
                {profile.instagram && (
                  <Button
                    startIcon={<Instagram />}
                    href={`https://instagram.com/${profile.instagram}`}
                    target="_blank"
                    size="small"
                  >
                    Instagram
                  </Button>
                )}
              </Box>

              {/* Статистика */}
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography variant="h6" color="primary">0</Typography>
                  <Typography variant="body2" color="text.secondary">NFT створено</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="h6" color="primary">0</Typography>
                  <Typography variant="body2" color="text.secondary">NFT куплено</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="h6" color="primary">0</Typography>
                  <Typography variant="body2" color="text.secondary">NFT продано</Typography>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Таби з NFT */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
            <Tab label="Створені NFT" />
            <Tab label="Колекція" />
            {isOwnProfile && <Tab label="Улюблені" />}
          </Tabs>
        </Box>

        <CardContent>
          {activeTab === 0 && (
            <MarketplaceGrid showMyNFTs walletAddress={walletAddress} />
          )}
          {activeTab === 1 && (
            <MarketplaceGrid showMyNFTs walletAddress={walletAddress} />
          )}
          {activeTab === 2 && isOwnProfile && (
            <MarketplaceGrid showFavorites walletAddress={walletAddress} />
          )}
        </CardContent>
      </Card>

      {/* Діалог редагування профілю */}
      <Dialog open={showEditDialog} onClose={() => setShowEditDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Редагувати профіль
          <IconButton
            onClick={() => setShowEditDialog(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Ім'я користувача"
                value={editForm.nickname}
                onChange={(e) => setEditForm(prev => ({ ...prev, nickname: e.target.value }))}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Біографія"
                value={editForm.bio}
                onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Вебсайт"
                value={editForm.website}
                onChange={(e) => setEditForm(prev => ({ ...prev, website: e.target.value }))}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Twitter"
                value={editForm.twitter}
                onChange={(e) => setEditForm(prev => ({ ...prev, twitter: e.target.value }))}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Instagram"
                value={editForm.instagram}
                onChange={(e) => setEditForm(prev => ({ ...prev, instagram: e.target.value }))}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>Зображення</Typography>
            </Grid>

            <Grid item xs={6}>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="avatar-upload"
                type="file"
                onChange={(e) => handleFileChange(e, 'avatar')}
              />
              <label htmlFor="avatar-upload">
                <Button variant="outlined" component="span" startIcon={<Upload />} fullWidth>
                  Завантажити аватар
                </Button>
              </label>
              {avatarFile && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {avatarFile.name}
                </Typography>
              )}
            </Grid>

            <Grid item xs={6}>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="banner-upload"
                type="file"
                onChange={(e) => handleFileChange(e, 'banner')}
              />
              <label htmlFor="banner-upload">
                <Button variant="outlined" component="span" startIcon={<Upload />} fullWidth>
                  Завантажити банер
                </Button>
              </label>
              {bannerFile && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {bannerFile.name}
                </Typography>
              )}
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setShowEditDialog(false)}>Скасувати</Button>
          <Button
            variant="contained"
            onClick={handleEditSubmit}
            disabled={isUpdating}
            startIcon={isUpdating ? <CircularProgress size={20} /> : null}
          >
            Зберегти
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserProfile;