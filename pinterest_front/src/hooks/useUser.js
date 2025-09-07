import { useState } from 'react';
import { useNFTAuth } from '@/hooks/useNFTAuth';
import { API_CONFIG, getAuthHeaders, getMultipartHeaders } from '../config/api';
import axios from 'axios';

export const useUser = () => {
  const { token, updateUserProfile } = useNFTAuth();
  const [isLoading, setIsLoading] = useState(false);

  const getUserProfile = async (walletAddress) => {
    try {
      const response = await axios.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USER_PROFILE(walletAddress)}`
      );

      if (response.data.isSuccess) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Користувач не знайдений');
      }
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  };

  const updateProfile = async (walletAddress, profileData) => {
    setIsLoading(true);
    
    try {
      const response = await axios.put(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USER_UPDATE(walletAddress)}`,
        profileData,
        { headers: getAuthHeaders(token) }
      );

      if (response.data.isSuccess) {
        updateUserProfile(response.data.data);
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Помилка оновлення профілю');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };


  const uploadAvatar = async (walletAddress, avatarFile) => {
    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', avatarFile); 

      const response = await axios.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USER_UPLOAD_AVATAR(walletAddress)}`,
        formData,
        { headers: getMultipartHeaders(token) }
      );

      if (response.data.avatarUrl) {
        return response.data.avatarUrl;
      } else {
        throw new Error(response.data.error || 'Помилка завантаження аватара');
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error(error.message || 'Помилка завантаження аватара');
    } finally {
      setIsLoading(false);
    }
  };


  const uploadBanner = async (walletAddress, bannerFile) => {
    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', bannerFile); 

      const response = await axios.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USER_UPLOAD_BANNER(walletAddress)}`,
        formData,
        { headers: getMultipartHeaders(token) }
      );

      if (response.data.bannerUrl) {
        return response.data.bannerUrl;
      } else {
        throw new Error(response.data.error || 'Помилка завантаження банера');
      }
    } catch (error) {
      console.error('Error uploading banner:', error);
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error(error.message || 'Помилка завантаження банера');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    getUserProfile,
    updateProfile,
    uploadAvatar,
    uploadBanner
  };
};