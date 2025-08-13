import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useWeb3 } from '../contexts/Web3Context';
import { API_CONFIG, getAuthHeaders } from '../config/api';
import { setCredentials, logout as logoutAction } from '../../store/slices/AuthSlice';
import axios from 'axios';


let globalLoginSemaphore = false;

export const useAuth = () => {
  const dispatch = useDispatch();
  const { account, signMessage } = useWeb3();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoginInProgress, setIsLoginInProgress] = useState(false);
  

  const { isAuthenticated, token, user, origin } = useSelector((state) => state.auth);


  useEffect(() => {

    if (!token) return;
    const tokenExpiration = localStorage.getItem('authTokenExpiration');
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

      if (response.data.isSuccess) {
        dispatch(setCredentials({ user: response.data.data, accessToken: token, origin: origin || 'site' }));
      } else {
        logout();
      }
    } catch (error) {
      console.error('Error verifying token:', error);
      logout();
    }
  };

 
  const login = async () => {
    if (!account) {
      throw new Error('Спочатку підключіть гаманець');
    }

    if (globalLoginSemaphore) {
      console.log(' Глобальний семафор: логін вже в процесі, пропускаємо');
      return;
    }
  
    if (isLoginInProgress) {
      console.log(' Локальний захист: логін вже в процесі, пропускаємо повторний виклик');
      return;
    }

    if (isAuthenticated && token && origin === 'marketplace') {
      console.log(' Користувач вже авторизований у marketplace, пропускаємо логін');
      return user;
    }

    console.log('🚀 Починаємо процес логіну для:', account);
    
    globalLoginSemaphore = true;
    setIsLoading(true);
    setIsLoginInProgress(true);
    
    try {

      const nonceResponse = await axios.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH_NONCE}`,
        { walletAddress: account }
      );

      if (!nonceResponse.data.isSuccess) {
        throw new Error(nonceResponse.data.message || 'Помилка отримання nonce');
      }

      const nonce = nonceResponse.data.data.nonce;
      const message = nonceResponse.data.data.message;
      
      console.log(' Отримано nonce та message, запитуємо підпис у користувача...');

      const signature = await signMessage(message);
      console.log(' Підпис отримано, верифікуємо...');

      const verifyResponse = await axios.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH_VERIFY}`,
        {
          walletAddress: account,
          signature: signature,
          nonce: nonce
        }
      );

      if (verifyResponse.data.isSuccess) {
        const authToken = verifyResponse.data.data.accessToken;
        const userData = verifyResponse.data.data.user;

        dispatch(setCredentials({ user: userData, accessToken: authToken, origin: 'marketplace' }));
        

        const expirationTime = Date.now() + (24 * 60 * 60 * 1000);
        localStorage.setItem('authTokenExpiration', expirationTime.toString());
        

        localStorage.setItem('authWalletAddress', account);
        
        console.log(' Авторизація успішна для:', account);
        return userData;
      } else {
        throw new Error(verifyResponse.data.message || 'Помилка авторизації');
      }
    } catch (error) {
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        throw new Error('Backend сервер недоступний. Перевірте чи запущений backend на порту 5228');
      }
      console.error('Error during login:', error);
      throw new Error(error.response?.data?.message || error.message || 'Помилка авторизації');
    } finally {

      globalLoginSemaphore = false;
      setIsLoading(false);
      setIsLoginInProgress(false);
      console.log('🔓 Семафори скинуті, логін завершено');
    }
  };


  const logout = () => {

    globalLoginSemaphore = false;
    dispatch(logoutAction());
    setIsLoginInProgress(false);
    localStorage.removeItem('authTokenExpiration');
    localStorage.removeItem('authWalletAddress');
    console.log('🔓 Вихід: всі семафори скинуті');
  };

  const updateUserProfile = (updatedUser) => {
    dispatch(setCredentials({ user: updatedUser, accessToken: token }));
  };


  useEffect(() => {
    const handleWalletConnected = async (event) => {
      const walletAddress = event.detail;
      console.log('🎯 Подія walletConnected отримана для:', walletAddress);
      

      if (!walletAddress || walletAddress !== account) {
        console.log('❌ Адреса не співпадає з поточним account');
        return;
      }
      
      if (globalLoginSemaphore) {
        console.log(' Глобальний семафор активний, пропускаємо автологін');
        return;
      }
      
      if (isAuthenticated || token) {
        console.log(' Користувач вже авторизований, пропускаємо автологін');
        return;
      }

      if (isLoginInProgress) {
        console.log(' Локальний логін вже в процесі, пропускаємо');
        return;
      }


      setTimeout(async () => {
        if (globalLoginSemaphore) {
          console.log(' Семафор активний під час setTimeout, пропускаємо автологін');
          return;
        }
        
        try {
          console.log(' Запускаємо автоматичний логін для:', walletAddress);
          await login();
        } catch (error) {
          console.log(' Auto-login failed, user can login manually:', error.message);
        }
      }, 500);
    };

    window.addEventListener('walletConnected', handleWalletConnected);
    return () => window.removeEventListener('walletConnected', handleWalletConnected);
  }, [account, isAuthenticated, token, isLoginInProgress, dispatch]);

  return {
    isAuthenticated,
    isLoading,
    token,
    user,
    login,
    logout,
    updateUserProfile,
    verifyToken
  };
};