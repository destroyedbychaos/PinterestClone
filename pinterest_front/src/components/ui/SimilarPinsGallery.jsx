import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import PropTypes from 'prop-types';
import similarPinsApi from '../../services/similarPinsApi';
import { getFullImageUrl } from '../../utils/imageUtils';
import './SimilarPinsGallery.css';

const SimilarPinsGallery = ({ pinId, onPinClick }) => {
  const [similarPins, setSimilarPins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (pinId && pinId !== 'undefined' && pinId !== 'null') {
      fetchSimilarPins();
    } else {
      console.log('Invalid pinId:', pinId);
      setLoading(false);
      setSimilarPins([]);
    }
  }, [pinId]);

  const fetchSimilarPins = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Fetching similar pins for pinId:', pinId);
      
      const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5228/api';
      let pins = null;
      

      try {
        console.log('📌 Using general recommendations API...');
        const token = localStorage.getItem('token');
        const headers = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch(`${API_BASE}/Pins/recommendations`, {
          headers
        });
        if (response.ok) {
          const data = await response.json();

          const filteredData = data.filter(p => 
            (p.Id || p.id) !== pinId && 
            (p.Id || p.id)?.toString() !== pinId?.toString()
          );
          pins = { Pins: filteredData.slice(0, 24) };
          console.log('✅ General recommendations success:', pins);
        } else if (response.status === 401) {
          console.log('❌ Unauthorized: User needs to login');

        } else {
          console.log('❌ General recommendations failed:', response.status, response.statusText);
        }
      } catch (fallbackError) {
        console.log('❌ General recommendations error:', fallbackError.message);
      }

      if (!pins?.Pins || pins.Pins.length === 0) {
        try {
          console.log('📌 Trying similar by tags...');
          pins = await similarPinsApi.getSimilarPinsByTags(pinId, 1, 24);
          console.log('✅ Similar by tags success:', pins);
        } catch (tagError) {
          console.log('❌ Similar by tags failed:', tagError.message);
          
          try {
            console.log('📌 Trying recommendations...');
            pins = await similarPinsApi.getPinRecommendations(pinId, 1, 24);
            console.log('✅ Recommendations success:', pins);
          } catch (recError) {
            console.log('❌ All APIs failed:', recError.message);
          }
        }
      }
      
      if (pins?.Pins && pins.Pins.length > 0) {
        console.log('📌 Setting similar pins:', pins.Pins.length, 'pins');
        setSimilarPins(pins.Pins);
      } else {
        console.log('❌ No pins found');
        setSimilarPins([]);
      }
    } catch (err) {
      console.error('Error fetching similar pins:', err);
      setError('Не вдалося завантажити схожі піни');
      setSimilarPins([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePinClick = (pin) => {
    if (onPinClick) {
      onPinClick(pin);
    }
  };

  if (loading) {
    return (
      <Box className="similar-pins-loading">
        <CircularProgress size={40} />
        <Typography variant="body2" color="textSecondary">
          Завантаження схожих пінів...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="similar-pins-error">
        <Typography variant="body2" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  if (!similarPins || similarPins.length === 0) {
    return (
      <Box className="similar-pins-empty">
        <Typography variant="body2" color="textSecondary">
          Схожі піни не знайдено
        </Typography>
      </Box>
    );
  }


  const columns = [[], [], [], [], [], []];
  similarPins.forEach((pin, index) => {
    const columnIndex = index % columns.length;
    columns[columnIndex].push(pin);
  });

  return (
    <Box className="similar-pins-gallery">
      <Typography className="similar-pins-title" variant="h6">
        Схожі піни
      </Typography>
      
      <Box className="gallery-columns">
        {columns.map((column, columnIndex) => (
          <Box key={columnIndex} className="gallery-column">
            {column.map((pin) => (
              <Box
                key={pin.Id || pin.id}
                className="gallery-pin-item"
                onClick={() => handlePinClick(pin)}
              >
                <img
                  className="gallery-pin-image"
                  src={getFullImageUrl(pin.ImageUrl || pin.imageUrl || pin.image)}
                  alt={pin.Title || pin.title || "Similar pin"}
                  onError={(e) => {
                    e.target.src = "https://placehold.co/267x267";
                  }}
                />
                <Box className="gallery-pin-overlay">
                  <Typography className="gallery-pin-title" variant="body2">
                    {pin.Title || pin.title || ""}
                  </Typography>
                  {pin.UserName || pin.userName ? (
                    <Typography className="gallery-pin-author" variant="caption">
                      {pin.UserName || pin.userName}
                    </Typography>
                  ) : null}
                </Box>
              </Box>
            ))}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

SimilarPinsGallery.propTypes = {
  pinId: PropTypes.string.isRequired,
  onPinClick: PropTypes.func
};

export default SimilarPinsGallery;
