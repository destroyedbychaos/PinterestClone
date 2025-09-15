const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3003/api';

const similarPinsApi = {

  async getSimilarPinsByTags(pinId, pageNumber = 1, pageSize = 20) {
    try {
      const response = await fetch(`${API_BASE}/pins/${pinId}/similar-by-tags?pageNumber=${pageNumber}&pageSize=${pageSize}`);
      if (!response.ok) {
        throw new Error('Failed to fetch similar pins');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching similar pins by tags:', error);
      throw error;
    }
  },


  async getSimilarPinsByImage(pinId, pageNumber = 1, pageSize = 20) {
    try {
      const response = await fetch(`${API_BASE}/pins/${pinId}/similar-by-image?pageNumber=${pageNumber}&pageSize=${pageSize}`);
      if (!response.ok) {
        throw new Error('Failed to fetch similar pins by image');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching similar pins by image:', error);
      throw error;
    }
  },


  async getPinRecommendations(pinId, pageNumber = 1, pageSize = 20) {
    try {
      const response = await fetch(`${API_BASE}/pins/${pinId}/recommendations?pageNumber=${pageNumber}&pageSize=${pageSize}`);
      if (!response.ok) {
        throw new Error('Failed to fetch pin recommendations');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching pin recommendations:', error);
      throw error;
    }
  }
};

export default similarPinsApi;
