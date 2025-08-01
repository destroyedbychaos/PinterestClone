import { API_CONFIG } from '../config/api.js';

/**
 * Формує повний URL для зображення
 * @param {string} imageUrl - URL зображення (може бути відносним або повним)
 * @returns {string} - Повний URL зображення
 */
export const getFullImageUrl = (imageUrl) => {
  if (!imageUrl) {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjM0I0MjU5Ii8+CjxwYXRoIGQ9Ik0xNTAgNzVMMTgwIDEyNUwxNTAgMTc1TDEyMCAxMjVMMTUwIDc1WiIgZmlsbD0iIzZCNzM4MCIvPgo8dGV4dCB4PSIxNTAiIHk9IjI0MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Tm8gSW1hZ2U8L3RleHQ+Cjwvc3ZnPgo=';
  }
  
  // Якщо URL вже повний (починається з http:// або https://)
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // Якщо URL відносний, додаємо базовий URL бекенду
  const baseUrl = API_CONFIG.BASE_URL.replace('/api', ''); // Прибираємо /api з кінця
  
  // Переконуємося що imageUrl починається з /
  const normalizedImageUrl = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
  
  return `${baseUrl}${normalizedImageUrl}`;
};

/**
 * Створює fallback URL для зображення
 * @param {string} imageUrl - Оригінальний URL зображення  
 * @param {string} placeholderText - Текст для placeholder
 * @returns {string} - URL з fallback
 */
export const getImageUrlWithFallback = (imageUrl, placeholderText = 'NFT') => {
  const fullUrl = getFullImageUrl(imageUrl);
  
  // Якщо це наш fallback, повертаємо як є
  if (fullUrl.includes('data:image/svg+xml')) {
    return fullUrl;
  }
  
  return fullUrl;
};

/**
 * Обробляє помилку завантаження зображення
 * @param {Event} event - Подія onError
 * @param {string} placeholderText - Текст для placeholder
 */
export const handleImageError = (event, placeholderText = 'No+Image') => {
  if (event.target.src.includes('data:image/svg+xml')) {
    return; // Вже є наш fallback, не змінюємо
  }
  
  // Використовуємо DiceBear як fallback
  const seed = Math.random().toString(36).substring(7);
  event.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
};

/**
 * Перевіряє чи існує зображення за URL
 * @param {string} imageUrl - URL зображення
 * @returns {Promise<boolean>} - true якщо зображення існує
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