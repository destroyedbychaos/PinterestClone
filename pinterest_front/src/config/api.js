
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5228/api',
  TIMEOUT: 10000,
  

  ENDPOINTS: {
    AUTH_LOGIN: '/auth/login',
    AUTH_REGISTER: '/auth/register',
    AUTH_NONCE: '/auth/nonce',
    AUTH_VERIFY: '/auth/verify',
    AUTH_ME: '/auth/me',
    
  
    USER_PROFILE: (walletAddress) => `/users/${walletAddress}`,
    USER_UPDATE: (walletAddress) => `/users/${walletAddress}`,
    USER_NFTS: (walletAddress) => `/users/${walletAddress}/nfts`,
    USER_CREATED_NFTS: (walletAddress) => `/users/${walletAddress}/created-nfts`,
    USER_FAVORITES: (walletAddress) => `/users/${walletAddress}/favorites`,
    USER_ADD_FAVORITE: (walletAddress, nftId) => `/users/${walletAddress}/favorites/${nftId}`,
    USER_REMOVE_FAVORITE: (walletAddress, nftId) => `/users/${walletAddress}/favorites/${nftId}`,
    USER_UPLOAD_AVATAR: (walletAddress) => `/users/${walletAddress}/avatar`,
    USER_UPLOAD_BANNER: (walletAddress) => `/users/${walletAddress}/banner`,
    

    NFTS: '/nfts',
    NFT_DETAIL: (id) => `/nfts/${id}`,
    NFT_UPDATE: (id) => `/nfts/${id}`,
    NFT_DELETE: (id) => `/nfts/${id}`,
    NFT_MINT: (id) => `/nfts/${id}/mint`,
    NFT_BURN: (id) => `/nfts/${id}/burn`,
    
  
    MARKETPLACE: '/marketplace',
    MARKETPLACE_LIST: '/marketplace/list',
    MARKETPLACE_DELIST: (nftId) => `/marketplace/list/${nftId}`,
    MARKETPLACE_STATUS: (nftId) => `/marketplace/${nftId}`,
    MARKETPLACE_BUY: (nftId) => `/marketplace/buy/${nftId}`,
    MARKETPLACE_CONFIRM: '/marketplace/confirm',
    
  
    PAYMENTS_GAS_ESTIMATE: '/payments/gas-estimate',
    PAYMENTS_CONFIRM: '/payments/confirm',
    PAYMENTS_WEBHOOK: '/payments/webhook',
    PAYMENTS_BALANCE: '/payments/balance',
    PAYMENTS_TRANSFER: '/payments/transfer',
    PAYMENTS_TRANSACTION: (hash) => `/payments/transaction/${hash}`
  }
};

export const getAuthHeaders = (token) => ({
  'Content-Type': 'application/json',
  'Authorization': token ? `Bearer ${token}` : ''
});

export const getMultipartHeaders = (token) => ({
  'Authorization': token ? `Bearer ${token}` : ''

});

export const API_ERRORS = {
  UNAUTHORIZED: 'Необхідна авторизація',
  FORBIDDEN: 'Доступ заборонено',
  NOT_FOUND: 'Ресурс не знайдено',
  VALIDATION_ERROR: 'Помилка валідації данних',
  SERVER_ERROR: 'Помилка сервера',
  NETWORK_ERROR: 'Помилка мережі'
};

export const parseApiError = (error) => {
  if (!error.response) {
    return API_ERRORS.NETWORK_ERROR;
  }
  
  switch (error.response.status) {
    case 401:
      return API_ERRORS.UNAUTHORIZED;
    case 403:
      return API_ERRORS.FORBIDDEN;
    case 404:
      return API_ERRORS.NOT_FOUND;
    case 422:
      return API_ERRORS.VALIDATION_ERROR;
    case 500:
      return API_ERRORS.SERVER_ERROR;
    default:
      return error.response.data?.message || API_ERRORS.SERVER_ERROR;
  }
};