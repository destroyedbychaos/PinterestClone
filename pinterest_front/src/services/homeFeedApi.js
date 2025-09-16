import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3003/api';

const homeFeedApi = {

  excludePinFromRecommendations: async (pinId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/HiddenPins/hide`, 
        pinId.toString(), 
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error excluding pin from recommendations:', error);
      throw error;
    }
  },

  includePinInRecommendations: async (pinId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${API_BASE_URL}/HiddenPins/unhide/${pinId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error including pin in recommendations:', error);
      throw error;
    }
  },

  getExcludedPins: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/HiddenPins/hidden-ids`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching excluded pins:', error);
      throw error;
    }
  }
};

export default homeFeedApi;
