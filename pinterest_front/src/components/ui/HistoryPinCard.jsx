import React, { useState } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

const PinContainer = styled.div`
  width: 100%;
  height: ${props => props.height || '412px'};
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 40px;
  overflow: hidden;

  &:hover {
    transform: scale(1.02);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: scale(0.98);
  }

  @media (max-width: 1200px) {
    height: auto;
    min-height: 200px;
  }

  @media (max-width: 768px) {
    height: auto;
    min-height: 250px;
  }
`;

const PinImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  border-radius: 40px;
  transition: opacity 0.3s ease;
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.1) 0%,
    rgba(0, 0, 0, 0) 30%,
    rgba(0, 0, 0, 0) 70%,
    rgba(0, 0, 0, 0.3) 100%
  );
  border-radius: 40px;
  opacity: 0;
  transition: opacity 0.3s ease;

  ${PinContainer}:hover & {
    opacity: 1;
  }
`;

const TimeInfo = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(255, 255, 255, 0.9);
  color: #000D17;
  font-size: 12px;
  font-family: Geologica, sans-serif;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 12px;
  backdrop-filter: blur(8px);
  opacity: 0;
  transform: translateY(-10px);
  transition: all 0.3s ease;

  ${PinContainer}:hover & {
    opacity: 1;
    transform: translateY(0);
  }
`;

const LoadingSpinner = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 24px;
  height: 24px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #B4C6EB;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: translate(-50%, -50%) rotate(0deg); }
    100% { transform: translate(-50%, -50%) rotate(360deg); }
  }
`;

const ErrorState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: #f5f5f5;
  color: #666;
  font-size: 14px;
  border-radius: 40px;
  border: 2px dashed #ddd;
`;

const PinInfo = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.8) 0%,
    rgba(0, 0, 0, 0.4) 50%,
    transparent 100%
  );
  color: white;
  padding: 16px;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.3s ease;

  ${PinContainer}:hover & {
    opacity: 1;
    transform: translateY(0);
  }
`;

const PinTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
  font-family: Geologica, sans-serif;
`;

const PinAuthor = styled.div`
  font-size: 12px;
  opacity: 0.8;
  font-family: Geologica, sans-serif;
`;

const HistoryPinCard = ({ 
  image, 
  height, 
  viewedAt, 
  onClick, 
  alt = "History pin",
  title,
  author,
  className = ""
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(false);
  };

  const formatViewTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Щойно';
    if (diffInHours < 24) return `${diffInHours}г тому`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Вчора';
    if (diffInDays < 7) return `${diffInDays}д тому`;
    
    return date.toLocaleDateString('uk-UA', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <PinContainer 
      height={height} 
      onClick={handleClick}
      className={className}
    >
      {!imageLoaded && !imageError && <LoadingSpinner />}
      
      {imageError ? (
        <ErrorState>
          Зображення недоступне
        </ErrorState>
      ) : (
        <PinImage
          src={image}
          alt={alt}
          onLoad={handleImageLoad}
          onError={handleImageError}
          style={{ opacity: imageLoaded ? 1 : 0 }}
        />
      )}
      
      <Overlay />
      
      {viewedAt && (
        <TimeInfo>
          {formatViewTime(viewedAt)}
        </TimeInfo>
      )}

      {(title || author) && (
        <PinInfo>
          {title && <PinTitle>{title}</PinTitle>}
          {author && <PinAuthor>{author}</PinAuthor>}
        </PinInfo>
      )}
    </PinContainer>
  );
};

HistoryPinCard.propTypes = {
  image: PropTypes.string.isRequired,
  height: PropTypes.string,
  viewedAt: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.instanceOf(Date)]),
  onClick: PropTypes.func,
  alt: PropTypes.string,
  title: PropTypes.string,
  author: PropTypes.string,
  className: PropTypes.string
};

export default HistoryPinCard;
