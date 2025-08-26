import axios from 'axios';

const API_URL = 'http://localhost:5228/api';

const createAxiosInstance = () => {
  const token = localStorage.getItem('token');
  return axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    }
  });
};

export const commentsApi = {

  getComments: async (pinId) => {
    try {
      const axiosInstance = createAxiosInstance();
      const response = await axiosInstance.get(`/comments/pin/${pinId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  },

  createComment: async (pinId, content) => {
    try {
      const axiosInstance = createAxiosInstance();
      const response = await axiosInstance.post('/comments', {
        pinId,
        content
      });
      return response.data;
    } catch (error) {
      console.error('Error creating comment:', error);
      throw error;
    }
  },

  deleteComment: async (commentId) => {
    try {
      const axiosInstance = createAxiosInstance();
      const response = await axiosInstance.delete(`/comments/${commentId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  }
};

export const pinsApi = {

  getPinLikes: async (pinId) => {
    try {
      const axiosInstance = createAxiosInstance();
      const response = await axiosInstance.get(`/pins/${pinId}/likes`);
      return response.data;
    } catch (error) {
      console.error('Error fetching pin likes:', error);
      throw error;
    }
  },

  togglePinLike: async (pinId) => {
    try {
      const axiosInstance = createAxiosInstance();
      const response = await axiosInstance.post(`/pins/${pinId}/like`);
      return response.data;
    } catch (error) {
      console.error('Error toggling pin like:', error);
      throw error;
    }
  }
};
