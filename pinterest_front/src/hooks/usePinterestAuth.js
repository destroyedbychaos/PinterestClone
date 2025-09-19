import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { API_CONFIG, getAuthHeaders } from '@/config/api';
import { setCredentials, logout as logoutAction } from '../../store/slices/PinterestAuthSlice';
import axios from 'axios';

export const usePinterestAuth = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  
  const { isAuthenticated, token, user } = useSelector((state) => state.pinterestAuth);

  useEffect(() => {
    if (!token) return;
    const tokenExpiration = localStorage.getItem('pinterestAuthTokenExpiration');
    if (tokenExpiration && Date.now() > parseInt(tokenExpiration)) {
      logout();
      return;
    }
    if (!isAuthenticated) {
      verifyToken();
    }
  }, [token, isAuthenticated, dispatch]);

  const verifyToken = async () => {
    try {
      const response = await axios.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH_ME}`,
        { headers: getAuthHeaders(token) }
      );

      if (response.data.success) {
        dispatch(setCredentials({ user: response.data.payload, accessToken: token }));
      } else {
        logout();
      }
    } catch (error) {
      console.error('Error verifying Pinterest token:', error);
      logout();
    }
  };

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH_LOGIN}`,
        { email, password }
      );

      if (response.data.success) {
        const authToken = response.data.payload.accessToken;
        const userData = { email: email }; 

        dispatch(setCredentials({ user: userData, accessToken: authToken }));
        
        const expirationTime = Date.now() + (24 * 60 * 60 * 1000);
        localStorage.setItem('pinterestAuthTokenExpiration', expirationTime.toString());
        
        return userData;
      } else {
        throw new Error(response.data.message || 'Помилка авторизації');
      }
    } catch (error) {
      console.error('Error during Pinterest login:', error);
      throw new Error(error.response?.data?.message || error.message || 'Помилка авторизації');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email, password) => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH_REGISTER}`,
        { email, password }
      );

      if (response.data.success) {
        const authToken = response.data.payload.accessToken;
        const userData = { email: email }; 

        dispatch(setCredentials({ user: userData, accessToken: authToken }));
        
        const expirationTime = Date.now() + (24 * 60 * 60 * 1000);
        localStorage.setItem('pinterestAuthTokenExpiration', expirationTime.toString());
        
        return userData;
      } else {
        throw new Error(response.data.message || 'Помилка реєстрації');
      }
    } catch (error) {
      console.error('Error during Pinterest registration:', error);
      throw new Error(error.response?.data?.message || error.message || 'Помилка реєстрації');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    dispatch(logoutAction());
    localStorage.removeItem('pinterestAuthTokenExpiration');
    console.log('🔓 Pinterest logout completed');
  };

  const updateUserProfile = (updatedUser) => {
    dispatch(setCredentials({ user: updatedUser, accessToken: token }));
  };

  return {
    isAuthenticated,
    isLoading,
    token,
    user,
    login,
    register,
    logout,
    updateUserProfile,
    verifyToken
  };
};
