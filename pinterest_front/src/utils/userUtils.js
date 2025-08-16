import { apiUrl } from "../env";

/**
 * 
 * @param {Object} user 
 * @returns {string} 
 */
export const getUserDisplayName = (user) => {
  if (!user) return 'User';
  return user.displayName || user.userName || (user.email ? user.email.split('@')[0] : 'User');
};

/**
 * 
 * @param {Object} user 
 * @returns {string} 
 */
export const getUserAvatarInitial = (user) => {
  if (!user) return 'U';
  const displayName = getUserDisplayName(user);
  return displayName.charAt(0).toUpperCase();
};

/**
 * 
 * @param {Object} user 
 * @returns {string} 
 */
export const getUserUsername = (user) => {
  if (!user) return 'user';
  return user.userName || (user.email ? user.email.split('@')[0] : 'user');
};

/**
 * 
 * @param {Object} user 
 * @returns {string}
 */
export const getUserEmail = (user) => {
  if (!user) return '';
  return user.email || '';
};

/**
 * 
 * @param {Object} user 
 * @returns {boolean}
 */
export const hasUserAvatar = (user) => {
  if (!user) return false;
  return !!user.avatarUrl;
};

/**
 * 
 * @param {Object} user 
 * @returns {string} 
 */
export const getUserAvatarUrl = (user) => {
  if (!user) return null;
  return user.avatarUrl || null;
};

/**
 * 
 * @param {Function} dispatch 
 * @returns {Promise<Object>}
 */
export const fetchCurrentUser = async (dispatch) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch(`${apiUrl}/profile/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }

    const userData = await response.json();
    

    localStorage.setItem('authState', JSON.stringify({
      user: userData,
      token: token,
      isAuthenticated: true
    }));
    

    dispatch({
      type: 'auth/setCredentials',
      payload: {
        user: userData,
        accessToken: token
      }
    });

    return userData;
  } catch (error) {
    console.error('Error fetching current user:', error);
    throw error;
  }
};

/**
 * 
 * @param {Object} user 
 * @returns {boolean}
 */
export const shouldUpdateUserData = (user) => {
  if (!user) return true;
  

  return !user.displayName && !user.userName && !user.avatarUrl && user.email;
};

/**
 *
 * @param {Function} dispatch 
 * @param {Function} onSuccess 
 * @param {Function} onError 
 */
export const refreshUserData = async (dispatch, onSuccess = null, onError = null) => {
  try {
    await fetchCurrentUser(dispatch);
    if (onSuccess) onSuccess();
  } catch (error) {
    console.error('Error refreshing user data:', error);
    if (onError) onError(error);
  }
};

/**
 * 
 * @param {Object} response 
 * @returns {boolean}
 */
export const shouldRefreshUserData = (response) => {

  const successOperations = [
    'Profile updated successfully',
    'Avatar uploaded successfully',
    'Banner uploaded successfully',
    'Profile reset successfully'
  ];
  
  return response.ok && successOperations.some(operation => 
    response.statusText.includes(operation) || 
    (response.body && response.body.toString().includes(operation))
  );
};

/**
 * 
 * @param {Function} dispatch 
 */
export const testUserDataUpdate = async (dispatch) => {
  try {
    console.log('Testing user data update...');
    await fetchCurrentUser(dispatch);
    console.log('User data updated successfully');
  } catch (error) {
    console.error('Error testing user data update:', error);
  }
};
