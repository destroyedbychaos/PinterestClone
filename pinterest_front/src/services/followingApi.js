import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5228/api';

const followingApi = {

  getMyFollowing: async (userName) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!userName) {
        throw new Error('Username is required');
      }

      const response = await axios.get(`${API_BASE_URL}/profile/following?userName=${userName}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Following users response:', response.data);
      console.log('Response data type:', typeof response.data);
      console.log('Response data is array:', Array.isArray(response.data));
      if (Array.isArray(response.data)) {
        console.log('First user in response:', response.data[0]);
      }
      return response.data;
    } catch (error) {
      console.error('Error fetching following users:', error);
      throw error;
    }
  },

  unfollowUser: async (targetUserId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/profile/${targetUserId}/unfollow`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Unfollow response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error unfollowing user:', error);
      throw error;
    }
  },

  followUser: async (targetUserId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/profile/${targetUserId}/follow`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Follow response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error following user:', error);
      throw error;
    }
  },

  searchUsers: async (query, page = 1, pageSize = 20) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/profile/search?query=${encodeURIComponent(query)}&page=${page}&pageSize=${pageSize}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Search users response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }
};

export default followingApi;
