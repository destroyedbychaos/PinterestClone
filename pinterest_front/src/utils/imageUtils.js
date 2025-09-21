import { API_CONFIG } from '../config/api.js';


const PLACEHOLDER_DATA_URI = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjMjYyNjI2Ii8+CjxwYXRoIGQ9Ik0xMDUgMTM1QzEwNSAxMjIuNzggMTE1Ljc4IDExMiAxMjggMTEySDE3MkMxODQuMjIgMTEyIDE5NSAxMjIuNzggMTk1IDEzNVYxNjVDMTk1IDE3Ny4yMiAxODQuMjIgMTg4IDE3MiAxODhIMTI4QzExNS43OCAxODggMTA1IDE3Ny4yMiAxMDUgMTY1VjEzNVoiIGZpbGw9IiM0NDQ0NDQiLz4KPHBhdGggZD0iTTEzNSA5NUMxMzUgMTAzLjI4IDEyOC4yOCAxMTAgMTIwIDExMEMxMTEuNzIgMTEwIDEwNSA1OCAxMDUgNTgiIHN0cm9rZT0iI0JDQkNCQyIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3Ryb2tlLXdpZHRoPSI2Ii8+CjxwYXRoIGQ9Ik0xOTUgOTVDMTk1IDEwMy4yOCAxODguMjggMTEwIDE4MCAxMTBDMTcxLjcyIDExMCAxNjUgNTggMTY1IDU4IiBzdHJva2U9IiNCQ0JDQkMiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIHN0cm9rZS13aWR0aD0iNiIvPgo8dGV4dCB4PSIxNTAiIHk9IjI0MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5ObyBJbWFnZTwvdGV4dD4KPC9zdmc+';

/**
 * 
 * @param {string} imageUrl 
 * @returns {string}
 */
export const getFullImageUrl = (imageUrl) => {
  if (!imageUrl) {
    return PLACEHOLDER_DATA_URI;
  }
  

  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  

  const baseUrl = API_CONFIG.BASE_URL.replace('/api', ''); 
  

  let cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.substring(0, baseUrl.length - 1) : baseUrl;
  let cleanImageUrl = imageUrl.startsWith('/') ? imageUrl.substring(1) : imageUrl;
  
  return `${cleanBaseUrl}/${cleanImageUrl}`;
};

/**
 * 
 * @param {string} imageUrl   
 * @param {string} placeholderText 
 * @returns {string} 
 */
export const getImageUrlWithFallback = (imageUrl, placeholderText = 'NFT') => {
  const fullUrl = getFullImageUrl(imageUrl);
  

  if (fullUrl.includes('data:image/svg+xml')) {
    return fullUrl;
  }
  
  return fullUrl;
};

/**
 * 
 * @param {Event} event 
 * @param {string} placeholderText -
 */
export const handleImageError = (event, placeholderText = 'No+Image') => {
  if (!event?.target) return;
  if (event.target.src.includes('data:image/svg+xml')) return;
  event.target.src = PLACEHOLDER_DATA_URI;
};

/**
 * 
 * @param {string} imageUrl
 * @returns {Promise<boolean>}
 */
export const checkImageExists = async (imageUrl) => {
  try {
    const fullUrl = getFullImageUrl(imageUrl);
    const response = await fetch(fullUrl, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.warn('Error checking image existence:', error);
    return false;
  }
};