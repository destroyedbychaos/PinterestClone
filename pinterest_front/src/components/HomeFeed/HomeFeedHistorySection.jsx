import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import styled from 'styled-components';
import historyApiService from '../../services/historyApi';
import homeFeedApi from '../../services/homeFeedApi';


const PinContainer = styled.div`
  position: relative;
  cursor: ${props => props.$isExcluded ? 'pointer' : 'default'};
  border-radius: 40px;
  overflow: hidden;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(${props => props.$isExcluded ? '1.02' : '1.01'});
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 40px;
  }
`;

const SelectButton = styled.button`
  width: 48px;
  height: 48px;
  padding: 16px;
  position: absolute;
  top: 16px;
  right: 16px;
  background: ${props => props.selected ? '#6F91D9' : 'white'};
  border: none;
  border-radius: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }

  &:disabled {
    cursor: not-allowed;
  }

  svg {
    width: 24px;
    height: 24px;
  }
`;

const LoadingDots = styled.div`
  display: flex;
  gap: 2px;
  
  .dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: ${props => props.color || 'white'};
    animation: pulse 1.4s infinite ease-in-out;
    
    &:nth-child(1) {
      animation-delay: -0.32s;
    }
    
    &:nth-child(2) {
      animation-delay: -0.16s;
    }
    
    &:nth-child(3) {
      animation-delay: 0s;
    }
  }
  
  @keyframes pulse {
    0%, 80%, 100% {
      transform: scale(0.8);
      opacity: 0.5;
    }
    40% {
      transform: scale(1);
      opacity: 1;
    }
  }
`;

const DarkOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 13, 23, 0.50);
  border-radius: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const OverlayText = styled.div`
  color: white;
  font-size: 21px;
  font-family: Geologica;
  font-weight: 400;
  text-align: center;
  padding: 0 20px;
`;

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="white">
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
  </svg>
);

const HomeFeedHistorySection = () => {
  const [historyData, setHistoryData] = useState({ today: [], yesterday: [], older: [] });
  const [excludedPins, setExcludedPins] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [updatingPin, setUpdatingPin] = useState(null);

  const groupHistoryByDate = (views) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const grouped = {
      today: [],
      yesterday: [],
      older: []
    };

    views.forEach(view => {
      const viewDate = new Date(view.viewedAt);
      const viewDateOnly = new Date(viewDate.getFullYear(), viewDate.getMonth(), viewDate.getDate());

      let dateKey;
      if (viewDateOnly.getTime() === today.getTime()) {
        dateKey = 'today';
      } else if (viewDateOnly.getTime() === yesterday.getTime()) {
        dateKey = 'yesterday';  
      } else {
        dateKey = 'older';
      }

      grouped[dateKey].push(view);
    });

    return grouped;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        const [historyResponse, excludedResponse] = await Promise.all([
          historyApiService.getUserViewHistory(),
          homeFeedApi.getExcludedPins()
        ]);

        if (historyResponse.success && historyResponse.payload?.views) {
          const groupedData = groupHistoryByDate(historyResponse.payload.views);
          setHistoryData(groupedData);
        }

        if (excludedResponse && excludedResponse.success && excludedResponse.payload) {
          const hiddenPinIds = excludedResponse.payload.map(id => id.toString());
          setExcludedPins(new Set(hiddenPinIds));
        }

      } catch (error) {
        console.error('Помилка завантаження даних:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleTogglePin = async (pinId, isCurrentlyExcluded) => {
    try {
      setUpdatingPin(pinId);
      
      if (isCurrentlyExcluded) {
        const response = await homeFeedApi.includePinInRecommendations(pinId);
        if (response && response.success) {
          setExcludedPins(prev => {
            const newSet = new Set(prev);
            newSet.delete(pinId.toString());
            return newSet;
          });
        }
      } else {

        const response = await homeFeedApi.excludePinFromRecommendations(pinId);
        if (response && response.success) {
          setExcludedPins(prev => new Set([...prev, pinId.toString()]));
        }
      }
    } catch (error) {
      console.error('Помилка оновлення налаштувань піна:', error);
    } finally {
      setUpdatingPin(null);
    }
  };

  const renderPin = (view, size) => {
    const isExcluded = excludedPins.has(view.pinId.toString());
    const isUpdating = updatingPin === view.pinId;
    
    let dimensions;
    switch (size) {
      case 'square':
        dimensions = { width: 267, height: 267 };
        break;
      case 'middle':
        dimensions = { width: 267, height: 412 };
        break;
      case 'big':
        dimensions = { width: 267, height: 558 };
        break;
      default:
        dimensions = { width: 267, height: 412 };
    }

    const handlePinClick = (e) => {

      if (e.target.closest('button')) {
        return;
      }
      
      if (isExcluded) {
        handleTogglePin(view.pinId, isExcluded);
      }
    };

    return (
      <PinContainer 
        key={view.pinId}
        style={dimensions}
        onClick={handlePinClick}
        $isExcluded={isExcluded}
      >
        <img 
          src={view.pinImageUrl || 'https://placehold.co/267x412'} 
          alt={view.pinTitle || 'Pin'} 
        />
        
        {isExcluded && (
          <DarkOverlay>
            <OverlayText>This Aest won't get suggestions</OverlayText>
          </DarkOverlay>
        )}
        
        <SelectButton
          selected={!isExcluded}
          onClick={() => handleTogglePin(view.pinId, isExcluded)}
          disabled={isUpdating}
        >
          {isUpdating ? (
            <LoadingDots color={isExcluded ? '#6F91D9' : 'white'}>
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
            </LoadingDots>
          ) : (
            !isExcluded && <CheckIcon />
          )}
        </SelectButton>
      </PinContainer>
    );
  };

  const renderSection = (title, pins) => {
    if (pins.length === 0) return null;

    const columns = [[], [], [], [], [], []]; 
    pins.forEach((pin, index) => {
      const colIndex = index % 6;
      columns[colIndex].push(pin);
    });

    return (
      <Box sx={{ mb: 6 }}>
        <Typography sx={{
          color: '#000D17',
          fontSize: 28,
          fontFamily: 'Geologica',
          fontWeight: '600',
          mb: 5
        }}>
          {title}
        </Typography>
        
        <Box sx={{
          display: 'flex',
          gap: 3,
          alignItems: 'flex-start'
        }}>
          {columns.map((columnPins, colIndex) => (
            <Box key={colIndex} sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 3,
              flex: 1
            }}>
              {columnPins.map((pin, pinIndex) => {

                let size = 'middle';
                if ((colIndex + pinIndex) % 3 === 0) size = 'big';
                else if ((colIndex + pinIndex) % 2 === 0) size = 'square';
                
                return renderPin(pin, size);
              })}
            </Box>
          ))}
        </Box>
      </Box>
    );
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: 200 
      }}>
        <CircularProgress />
        <Typography sx={{ ml: 2, color: '#52697C' }}>
          Завантаження історії...
        </Typography>
      </Box>
    );
  }

  const hasAnyHistory = historyData.today.length > 0 || 
                       historyData.yesterday.length > 0 || 
                       historyData.older.length > 0;

  if (!hasAnyHistory) {
    return (
      <Box sx={{ 
        textAlign: 'center', 
        py: 4,
        color: '#52697C',
        fontSize: 16,
        fontFamily: 'Geologica'
      }}>
        У вас поки немає історії перегляду пінів
      </Box>
    );
  }

  return (
    <Box sx={{
      width: 1720,
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'center',
      gap: 6,
      display: 'inline-flex'
    }}>
      {/* Header */}
      <Box sx={{
        alignSelf: 'stretch',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        gap: 5,
        display: 'flex'
      }}>
        <Typography sx={{
          alignSelf: 'stretch',
          textAlign: 'center',
          color: '#000D17',
          fontSize: 28,
          fontFamily: 'Geologica',
          fontWeight: '600'
        }}>
          Activity
        </Typography>
        <Typography sx={{
          width: 476,
          textAlign: 'center',
          color: '#000D17',
          fontSize: 21,
          fontFamily: 'Geologica',
          fontWeight: '400'
        }}>
          Hide ideas related to Aests you've recently saved or viewed up close.
        </Typography>
      </Box>

      {/* History sections */}
      <Box sx={{
        alignSelf: 'stretch',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        gap: 6,
        display: 'flex'
      }}>
        {renderSection('Today', historyData.today)}
        {renderSection('Yesterday', historyData.yesterday)}
        {renderSection('August, 19', historyData.older)}
      </Box>
    </Box>
  );
};

export default HomeFeedHistorySection;
