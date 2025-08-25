import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/slices/AuthSlice';

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found, redirecting to login');
      dispatch(logout());
      navigate('/login');
    }
  }, [dispatch, navigate]);

  const token = localStorage.getItem('token');
  if (!token) {
    return null; 
  }

  return children;
};

export default ProtectedRoute;
