import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3003/api';

const socialPermissionsApi = {

  getSocialPermissions: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/SocialPermissions`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching social permissions:', error);
      throw error;
    }
  },

  updateSocialPermissions: async (settings) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_BASE_URL}/SocialPermissions`, settings, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating social permissions:', error);
      throw error;
    }
  },

  getBlockedUsers: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/SocialPermissions/blocked-users`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching blocked users:', error);
      throw error;
    }
  },

  blockUser: async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/SocialPermissions/block-user`, 
        { userId }, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error blocking user:', error);
      throw error;
    }
  },

  unblockUser: async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${API_BASE_URL}/SocialPermissions/unblock-user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error unblocking user:', error);
      throw error;
    }
  },

  getKeywordFilters: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/SocialPermissions/keyword-filters`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching keyword filters:', error);
      throw error;
    }
  },

  updateKeywordFilters: async (keywords) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_BASE_URL}/SocialPermissions/keyword-filters`, 
        { keywords }, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating keyword filters:', error);
      throw error;
    }
  }
};

export default socialPermissionsApi;
