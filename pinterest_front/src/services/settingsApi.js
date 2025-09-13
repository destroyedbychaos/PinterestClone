import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5228/api';

const settingsApi = {

  getCurrentSettings: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/profile/settings`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('Raw response from getCurrentSettings:', response.data);
      console.log('Gender from API response:', response.data.gender);
      return response.data;
    } catch (error) {
      console.error('Error fetching settings:', error);
      throw error;
    }
  },

  updateSettings: async (settingsData) => {
    try {
      const token = localStorage.getItem('token');
      console.log('Sending settings data:', settingsData);
      console.log('Gender in settingsData:', settingsData.gender);
      const response = await axios.put(`${API_BASE_URL}/profile/settings`, settingsData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('Response from updateSettings:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating settings:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      throw error;
    }
  },

  changePassword: async (passwordData) => {
    try {
      const token = localStorage.getItem('token');
      const requestData = {
        newPassword: passwordData.newPassword
      };
      
      if (passwordData.currentPassword) {
        requestData.currentPassword = passwordData.currentPassword;
      }
      
      const response = await axios.post(`${API_BASE_URL}/profile/change-password`, requestData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  },

  deactivateAccount: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/profile/deactivate`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error deactivating account:', error);
      throw error;
    }
  },

  deleteAccount: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${API_BASE_URL}/profile/delete`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  },

  updatePersonalInfo: async (personalData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_BASE_URL}/profile/personal-info`, personalData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating personal info:', error);
      throw error;
    }
  },


};

export default settingsApi;
