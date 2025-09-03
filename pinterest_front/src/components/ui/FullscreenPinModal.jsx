import React, { useState } from 'react';
import { Box, IconButton } from '@mui/material';
import './FullscreenPinModal.css';

const FullscreenPinModal = ({ pin, isOpen, onClose, onZoomIn, onZoomOut }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  if (!isOpen || !pin) return null;

  const handleZoomIn = () => {
    setScale(prevScale => Math.min(prevScale * 1.2, 3));
  };

  const handleZoomOut = () => {
    setScale(prevScale => Math.max(prevScale / 1.2, 0.5));
  };

  const handleMouseDown = (e) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <Box className="fullscreen-pin-overlay" onClick={onClose}>
      <Box className="fullscreen-pin-content" onClick={(e) => e.stopPropagation()}>
        <Box className="fullscreen-pin-main">
                     <Box className="fullscreen-pin-image-container">
             <img 
               className="fullscreen-pin-image" 
               src={pin.imageUrl || "https://placehold.co/440x744"} 
               alt={pin.title || "Pin"} 
               style={{
                 transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
                 cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
               }}
               onMouseDown={handleMouseDown}
               onMouseMove={handleMouseMove}
               onMouseUp={handleMouseUp}
               onMouseLeave={handleMouseUp}
               draggable={false}
             />
           </Box>
          
                     {/* Кнопки керування в правому нижньому куті */}
           <Box className="fullscreen-pin-controls">
             <Box className="fullscreen-control-buttons">
               {/* Кнопка виходу з повноекранного режиму */}
               <IconButton className="fullscreen-control-button" onClick={onClose}>
                 <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30" fill="none">
                   <path d="M21.25 0C21.5815 0 21.8995 0.131696 22.1339 0.366116C22.3683 0.600537 22.5 0.918479 22.5 1.25V7.08333C22.5 7.31333 22.6867 7.5 22.9167 7.5H28.75C29.0815 7.5 29.3995 7.6317 29.6339 7.86612C29.8683 8.10054 30 8.41848 30 8.75C30 9.08152 29.8683 9.39946 29.6339 9.63388C29.3995 9.8683 29.0815 10 28.75 10H22.9167C22.1431 10 21.4013 9.69271 20.8543 9.14573C20.3073 8.59875 20 7.85688 20 7.08333V1.25C20 0.918479 20.1317 0.600537 20.3661 0.366116C20.6005 0.131696 20.9185 0 21.25 0ZM8.75 0C9.08152 0 9.39946 0.131696 9.63388 0.366116C9.8683 0.600537 10 0.918479 10 1.25V7.08333C10 7.85688 9.69271 8.59875 9.14573 9.14573C8.59875 9.69271 7.85688 10 7.08333 10H1.25C0.918479 10 0.600537 9.8683 0.366116 9.63388C0.131696 9.39946 0 9.08152 0 8.75C0 8.41848 0.131696 8.10054 0.366116 7.86612C0.600537 7.6317 0.918479 7.5 1.25 7.5H7.08333C7.19384 7.5 7.29982 7.4561 7.37796 7.37796C7.4561 7.29982 7.5 7.19384 7.5 7.08333V1.25C7.5 0.918479 7.6317 0.600537 7.86612 0.366116C8.10054 0.131696 8.41848 0 8.75 0ZM0 21.25C0 20.9185 0.131696 20.6005 0.366116 20.3661C0.600537 20.1317 0.918479 20 1.25 20H7.08333C8.69333 20 10 21.3067 10 22.9167V28.75C10 29.0815 9.8683 29.3995 9.63388 29.6339C9.39946 29.8683 9.08152 30 8.75 30C8.41848 30 8.10054 29.8683 7.86612 29.6339C7.6317 29.3995 7.5 29.0815 7.5 28.75V22.9167C7.5 22.8062 7.4561 22.7002 7.37796 22.622C7.29982 22.5439 7.19384 22.5 7.08333 22.5H1.25C0.918479 22.5 0.600537 22.3683 0.366116 22.1339C0.131696 21.8995 0 21.5815 0 21.25ZM20 22.9167C20 21.3067 21.3067 20 22.9167 20H28.75C29.0815 20 29.3995 20.1317 29.6339 20.3661C29.8683 20.6005 30 20.9185 30 21.25C30 21.5815 29.8683 21.8995 29.6339 22.1339C29.3995 22.3683 29.0815 22.5 28.75 22.5H22.9167C22.8062 22.5 22.7002 22.5439 22.622 22.622C22.5439 22.7002 22.5 22.8062 22.5 22.9167V28.75C22.5 29.0815 22.3683 29.3995 22.1339 29.6339C21.8995 29.8683 21.5815 30 21.25 30C20.9185 30 20.6005 29.8683 20.3661 29.6339C20.1317 29.3995 20 29.0815 20 28.75V22.9167Z" fill="#01233F"/>
                 </svg>
               </IconButton>
               
                               {/* Кнопка приближення */}
                <IconButton className="fullscreen-control-button" onClick={handleZoomIn}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 25 25" fill="none">
                    <path d="M12.5833 0.5C12.9149 0.5 13.2328 0.631696 13.4672 0.866116C13.7016 1.10054 13.8333 1.41848 13.8333 1.75V11.3333H23.4167C23.7482 11.3333 24.0661 11.465 24.3006 11.6995C24.535 11.9339 24.6667 12.2518 24.6667 12.5833C24.6667 12.9149 24.535 13.2328 24.3006 13.4672C24.0661 13.7016 23.7482 13.8333 23.4167 13.8333H13.8333V23.4167C13.8333 23.7482 13.7016 24.0661 13.4672 24.3006C13.2328 24.535 12.9149 24.6667 12.5833 24.6667C12.2518 24.6667 11.9339 24.535 11.6995 24.3006C11.465 24.0661 11.3333 23.7482 11.3333 23.4167V13.8333H1.75C1.41848 13.8333 1.10054 13.7016 0.866116 13.4672C0.631696 13.2328 0.5 12.9149 0.5 12.5833C0.5 12.2518 0.631696 11.9339 0.866116 11.6995C1.10054 11.465 1.41848 11.3333 1.75 11.3333H11.3333V1.75C11.3333 1.41848 11.465 1.10054 11.6995 0.866116C11.9339 0.631696 12.2518 0.5 12.5833 0.5Z" fill="#01233F"/>
                  </svg>
                </IconButton>
               
               {/* Кнопка скидання масштабу */}
               <IconButton className="fullscreen-control-button" onClick={resetView}>
                 <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none">
                   <path d="M7.5 21.25C7.5 20.9185 7.6317 20.6005 7.86612 20.3661C8.10054 20.1317 8.41848 20 8.75 20H31.25C31.5815 20 31.8995 20.1317 32.1339 20.3661C32.3683 20.6005 32.5 20.9185 32.5 21.25C32.5 21.5815 32.3683 21.8995 32.1339 22.1339C31.8995 22.3683 31.5815 22.5 31.25 22.5H8.75C8.41848 22.5 8.10054 22.3683 7.86612 22.1339C7.6317 21.8995 7.5 21.5815 7.5 21.25Z" fill="#01233F"/>
                 </svg>
               </IconButton>
             </Box>
           </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default FullscreenPinModal;
