import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useWeb3 } from '../contexts/Web3Context';
import { API_CONFIG, getAuthHeaders } from '../config/api';
import { setCredentials, logout as logoutAction } from '../../store/slices/AuthSlice';
import axios from 'axios';

// Глобальний семафор для запобігання багаторазових логінів
let globalLoginSemaphore = false;

export const useAuth = () => {
  const dispatch = useDispatch();
  const { account, signMessage } = useWeb3();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoginInProgress, setIsLoginInProgress] = useState(false);
  
  // Отримуємо стан з Redux
  const { isAuthenticated, token, user } = useSelector((state) => state.auth);

  // Перевірка автентифікації при завантаженні
  useEffect(() => {
    if (token && account) {
      // Перевірка чи токен не прострочений локально
      const tokenExpiration = localStorage.getItem('authTokenExpiration');
      if (tokenExpiration && Date.now() > parseInt(tokenExpiration)) {
        console.log('🕐 Токен прострочений локально, виходимо');
        logout();
        return;
      }
      
      // Перевірка чи підключений той самий кошелек що й в токені
      const savedWalletAddress = localStorage.getItem('authWalletAddress');
      if (savedWalletAddress && savedWalletAddress.toLowerCase() !== account.toLowerCase()) {
        console.log('🔄 Змінено кошелек, виходимо з поточної сесії');
        logout();
        return;
      }
      
      // Перевіряємо токен тільки якщо користувач не авторизований
      if (!isAuthenticated) {
        verifyToken();
      }
    }
  }, [token, account, isAuthenticated, dispatch]);



  // Перевірка валідності токена
  const verifyToken = async () => {
    try {
      const response = await axios.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH_ME}`,
        { headers: getAuthHeaders(token) }
      );

      if (response.data.isSuccess) {
        dispatch(setCredentials({ user: response.data.data, accessToken: token }));
      } else {
        logout();
      }
    } catch (error) {
      console.error('Error verifying token:', error);
      logout();
    }
  };

  // Вхід через Web3
  const login = async () => {
    if (!account) {
      throw new Error('Спочатку підключіть гаманець');
    }

    // Глобальний захист від багаторазових викликів
    if (globalLoginSemaphore) {
      console.log('🚫 Глобальний семафор: логін вже в процесі, пропускаємо');
      return;
    }

    // Локальний захист від багаторазових викликів
    if (isLoginInProgress) {
      console.log('🚫 Локальний захист: логін вже в процесі, пропускаємо повторний виклик');
      return;
    }

    // Перевірка чи користувач вже авторизований
    if (isAuthenticated && token) {
      console.log('✅ Користувач вже авторизований, пропускаємо логін');
      return user;
    }

    console.log('🚀 Починаємо процес логіну для:', account);
    
    // Встановлюємо глобальний та локальний семафори
    globalLoginSemaphore = true;
    setIsLoading(true);
    setIsLoginInProgress(true);
    
    try {
      // 1. Отримання nonce
      const nonceResponse = await axios.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH_NONCE}`,
        { walletAddress: account }
      );

      if (!nonceResponse.data.isSuccess) {
        throw new Error(nonceResponse.data.message || 'Помилка отримання nonce');
      }

      const nonce = nonceResponse.data.data.nonce;
      const message = nonceResponse.data.data.message;
      
      console.log('📝 Отримано nonce та message, запитуємо підпис у користувача...');
      // 2. Підпис повідомлення (використовуємо message з backend) - ТУТ ЄДИНИЙ ЗАПИТ ПІДПИСУ!
      const signature = await signMessage(message);
      console.log('✍️ Підпис отримано, верифікуємо...');

      // 3. Верифікація підпису
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
        
        // Оновлюємо Redux store
        dispatch(setCredentials({ user: userData, accessToken: authToken }));
        
        // Зберігаємо час експірації токену (приблизно 24 години від поточного часу)
        const expirationTime = Date.now() + (24 * 60 * 60 * 1000);
        localStorage.setItem('authTokenExpiration', expirationTime.toString());
        
        // Зберігаємо адресу кошелька для перевірки при відновленні
        localStorage.setItem('authWalletAddress', account);
        
        console.log('✅ Авторизація успішна для:', account);
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
      // Скидаємо семафори
      globalLoginSemaphore = false;
      setIsLoading(false);
      setIsLoginInProgress(false);
      console.log('🔓 Семафори скинуті, логін завершено');
    }
  };

  // Вихід
  const logout = () => {
    // Скидаємо глобальний семафор при виході
    globalLoginSemaphore = false;
    dispatch(logoutAction());
    setIsLoginInProgress(false);
    localStorage.removeItem('authTokenExpiration');
    localStorage.removeItem('authWalletAddress');
    console.log('🔓 Вихід: всі семафори скинуті');
  };

  // Оновлення профілю користувача
  const updateUserProfile = (updatedUser) => {
    dispatch(setCredentials({ user: updatedUser, accessToken: token }));
  };

  // Автоматична авторизація при підключенні кошелька
  useEffect(() => {
    const handleWalletConnected = async (event) => {
      const walletAddress = event.detail;
      console.log('🎯 Подія walletConnected отримана для:', walletAddress);
      
      // Перевірки для запобігання зайвих логінів
      if (!walletAddress || walletAddress !== account) {
        console.log('❌ Адреса не співпадає з поточним account');
        return;
      }
      
      if (globalLoginSemaphore) {
        console.log('🚫 Глобальний семафор активний, пропускаємо автологін');
        return;
      }
      
      if (isAuthenticated || token) {
        console.log('✅ Користувач вже авторизований, пропускаємо автологін');
        return;
      }

      if (isLoginInProgress) {
        console.log('🔄 Локальний логін вже в процесі, пропускаємо');
        return;
      }

      // Невелика затримка щоб account встиг оновитись
      setTimeout(async () => {
        // Додаткова перевірка семафору перед викликом login
        if (globalLoginSemaphore) {
          console.log('🚫 Семафор активний під час setTimeout, пропускаємо автологін');
          return;
        }
        
        try {
          console.log('🚀 Запускаємо автоматичний логін для:', walletAddress);
          await login();
        } catch (error) {
          console.log('❌ Auto-login failed, user can login manually:', error.message);
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