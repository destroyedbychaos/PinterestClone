
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCurrentUser, shouldUpdateUserData } from '../utils/userUtils';

/**
 * 
 * @returns {Object} 
 */
export const useCurrentUser = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user && shouldUpdateUserData(user)) {
      fetchCurrentUser(dispatch).catch(console.error);
    }
  }, [user, dispatch]);

  return user;
};

/**
 * 
 * @returns {Function} 
 */
export const useRefreshUserData = () => {
  const dispatch = useDispatch();
  
  const refreshUserData = async (onSuccess = null, onError = null) => {
    try {
      await fetchCurrentUser(dispatch);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error refreshing user data:', error);
      if (onError) onError(error);
    }
  };
  
  return refreshUserData;
};
