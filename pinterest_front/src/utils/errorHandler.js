// Утиліта для обробки API помилок
export const handleApiError = (error) => {
  console.error('API Error:', error);

  // Помилки мережі
  if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK' || !error.response) {
    return 'Backend сервер недоступний. Перевірте чи запущений backend на http://localhost:5228';
  }

  // HTTP статус коди
  if (error.response) {
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return data?.message || 'Неправильний запит';
      case 401:
        return 'Необхідна авторизація. Підключіть гаманець та увійдіть в систему';
      case 403:
        return 'Доступ заборонено';
      case 404:
        return 'Ресурс не знайдено';
      case 422:
        return data?.message || 'Помилка валідації даних';
      case 500:
        return 'Внутрішня помилка сервера';
      default:
        return data?.message || `Помилка сервера (${status})`;
    }
  }

  // Загальні помилки
  return error.message || 'Невідома помилка';
};

// Перевірка доступності backend
export const checkBackendStatus = async () => {
  try {
    const response = await fetch('http://localhost:5228/api/health', {
      method: 'GET',
      timeout: 5000
    });
    return response.ok;
  } catch (error) {
    return false;
  }
};