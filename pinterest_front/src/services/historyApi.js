import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5228/api';

const getAuthToken = () => {
  return localStorage.getItem('token');
};

const historyApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

historyApi.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const historyApiService = {
  addPinView: async (pinId, source = 'unknown', viewDuration = null, isCompleteView = false) => {
    try {
      console.log('📤 Відправляю запит на додавання перегляду:', { pinId, source, viewDuration, isCompleteView });
      const response = await historyApi.post('/PinViewHistory/add-pin-view', {
        pinId,
        source,
        viewDuration,
        isCompleteView
      });
      console.log('📥 Відповідь сервера:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Помилка додавання перегляду:', error);
      throw error;
    }
  },

  getUserViewHistory: async (page = 1, pageSize = 50) => {
    try {
      console.log('📤 Запитую історію переглядів:', { page, pageSize });
      const response = await historyApi.get(`/PinViewHistory/user-history?page=${page}&pageSize=${pageSize}`);
      console.log('📥 Отримана історія:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Помилка отримання історії:', error);
      throw error;
    }
  },

  getUserViewHistoryByDate: async (date) => {
    try {
      const formattedDate = date.toISOString().split('T')[0];
      const response = await historyApi.get(`/PinViewHistory/user-history-by-date/${formattedDate}`);
      return response.data;
    } catch (error) {
      console.error('Error getting user view history by date:', error);
      throw error;
    }
  },

  getUserViewHistoryByDateRange: async (startDate, endDate) => {
    try {
      const response = await historyApi.get('/PinViewHistory/user-history-by-date-range', {
        params: {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting user view history by date range:', error);
      throw error;
    }
  },

  hasUserViewedPin: async (pinId) => {
    try {
      const response = await historyApi.get(`/PinViewHistory/has-user-viewed-pin/${pinId}`);
      return response.data;
    } catch (error) {
      console.error('Error checking if user viewed pin:', error);
      throw error;
    }
  },

  deleteUserViewHistory: async () => {
    try {
      const response = await historyApi.delete('/PinViewHistory/delete-user-history');
      return response.data;
    } catch (error) {
      console.error('Error deleting user view history:', error);
      throw error;
    }
  }
};

export default historyApiService;
