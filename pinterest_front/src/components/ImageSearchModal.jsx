import React, { useRef, useState, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Button,
  CircularProgress,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SettingsIcon from '@mui/icons-material/Settings';

const API_BASE = '/api';

const ImageSearchModal = ({ open, onClose, onSearchResults, onSearchStart }) => {
  const fileInputRef = useRef();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedSearchArea, setSelectedSearchArea] = useState('full');
  const [selectionCoords, setSelectionCoords] = useState({ x: 25, y: 25, width: 50, height: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeCorner, setResizeCorner] = useState(null);

  const resetSelectionCoords = () => {
    setSelectionCoords({ x: 25, y: 25, width: 50, height: 50 });
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        if (showSettings) {
          handleSettingsClose();
        } else if (open) {
          handleClose();
        }
      }
    };

    if (open || showSettings) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, showSettings]);

  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      if (isDragging) {
        handleMouseMove(e);
      } else if (isResizing && resizeCorner) {
        handleCornerResize(resizeCorner, e);
      }
    };

    const handleGlobalMouseUp = (e) => {
      if (isDragging) {
        handleMouseUp();
      }
      if (isResizing) {
        setIsResizing(false);
        setResizeCorner(null);
      }
    };

    if (showSettings && (isDragging || isResizing)) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, isResizing, showSettings]);

  if (!open) {
    return null;
  }

  const handleFileSelect = (file) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result);
      };
      reader.readAsDataURL(file);
      setSelectedSearchArea('full');
      resetSelectionCoords();
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragIn = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragActive(true);
    }
  };

  const handleDragOut = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;

    setLoading(true);
    onSearchStart?.();
    try {
      const formData = new FormData();
      formData.append('ImageFile', selectedFile);
      formData.append('SearchArea', selectedSearchArea);
      
      if (selectedSearchArea === 'custom') {
        formData.append('SelectionCoords', JSON.stringify(selectionCoords));
      }

      const response = await fetch(`${API_BASE}/Pins/search-by-image`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const results = data.Pins || data.pins || [];
        onSearchResults?.(results);
        handleClear();
        resetSelectionCoords();
        handleClose();
      }
    } catch (error) {
      console.error('Error during image search:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    resetSelectionCoords();
    setSelectedSearchArea('full');
  };

  const handleBack = () => {
    handleClear();
    onClose();
  };

  const handleClose = () => {
    handleClear();
    onClose();
  };

  const handleSettingsClick = () => {
    setShowSettings(true);
    resetSelectionCoords();
    setSelectedSearchArea('full');
  };

  const handleSettingsClose = () => {
    setShowSettings(false);
    resetSelectionCoords();
    setSelectedSearchArea('full');
  };

  const handleApplySettings = () => {
    setSelectedSearchArea('custom');
    setShowSettings(false);
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    e.preventDefault();
    
    const container = document.querySelector('[data-image-container]');
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    
    const sensitivity = 0.04;
    const deltaXPercent = (deltaX / rect.width) * 100 * sensitivity;
    const deltaYPercent = (deltaY / rect.height) * 100 * sensitivity;
    const minMovement = 0.01;
    
    setSelectionCoords(prev => {
      const newX = Math.max(0, Math.min(100 - prev.width, prev.x + deltaXPercent));
      const newY = Math.max(0, Math.min(100 - prev.height, prev.y + deltaYPercent));
      
      const xChanged = Math.abs(newX - prev.x) >= minMovement;
      const yChanged = Math.abs(newY - prev.y) >= minMovement;
      
      if (!xChanged && !yChanged) {
        return prev;
      }
      
      return {
        x: newX,
        y: newY,
        width: prev.width,
        height: prev.height
      };
    });
    
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleCornerResize = (corner, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isResizing) {
      setIsResizing(true);
      setResizeCorner(corner);
      setDragStart({ x: e.clientX, y: e.clientY });
      return;
    }
    
    const container = document.querySelector('[data-image-container]');
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    
    const sensitivity = 0.06;
    const deltaXPercent = (deltaX / rect.width) * 100 * sensitivity;
    const deltaYPercent = (deltaY / rect.height) * 100 * sensitivity;
    const minMovement = 0.02;
    
    setSelectionCoords(prev => {
      let newCoords = { ...prev };
      
      switch (corner) {
        case 'topLeft':
          newCoords.x = Math.max(0, Math.min(prev.x + prev.width - 5, prev.x + deltaXPercent));
          newCoords.y = Math.max(0, Math.min(prev.y + prev.height - 5, prev.y + deltaYPercent));
          newCoords.width = prev.x + prev.width - newCoords.x;
          newCoords.height = prev.y + prev.height - newCoords.y;
          break;
        case 'topRight':
          newCoords.y = Math.max(0, Math.min(prev.y + prev.height - 5, prev.y + deltaYPercent));
          newCoords.width = Math.max(5, prev.width + deltaXPercent);
          newCoords.height = prev.y + prev.height - newCoords.y;
          break;
        case 'bottomLeft':
          newCoords.x = Math.max(0, Math.min(prev.x + prev.width - 5, prev.x + deltaXPercent));
          newCoords.width = prev.x + prev.width - newCoords.x;
          newCoords.height = Math.max(5, prev.height + deltaYPercent);
          break;
        case 'bottomRight':
          newCoords.width = Math.max(5, prev.width + deltaXPercent);
          newCoords.height = Math.max(5, prev.height + deltaYPercent);
          break;
      }
      
      const widthChanged = Math.abs(newCoords.width - prev.width) >= minMovement;
      const heightChanged = Math.abs(newCoords.height - prev.height) >= minMovement;
      const xChanged = Math.abs(newCoords.x - prev.x) >= minMovement;
      const yChanged = Math.abs(newCoords.y - prev.y) >= minMovement;
      
      if (!widthChanged && !heightChanged && !xChanged && !yChanged) {
        return prev;
      }
      
      return newCoords;
    });
    
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  return (
    <>
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgcolor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 9998,
        }}
        onClick={handleClose}
      />
      
      <Box
        sx={{
          position: 'fixed',
          top: 30,
          left: '53%',
          transform: 'translateX(-50%)',
          width: '95%',
          maxWidth: 730,
          bgcolor: '#fff',
          borderRadius: '24px',
          p: 3,
          boxShadow: 12,
          zIndex: 9999,
          overflowY: 'auto',
          maxHeight: '90vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <IconButton onClick={handleBack} size="small">
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" fontWeight={600}>
              Search by image
            </Typography>
            {selectedSearchArea === 'custom' && (
              <Typography variant="caption" color="text.secondary" display="block">
                Search in selected area
              </Typography>
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {selectedFile && (
              <IconButton onClick={handleSettingsClick} size="small" sx={{ color: '#666' }}>
                <SettingsIcon />
              </IconButton>
            )}
            <IconButton onClick={handleClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        {!previewUrl ? (
          <Box
            onDragEnter={handleDragIn}
            onDragLeave={handleDragOut}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            sx={{
              border: '2px dashed',
              borderColor: dragActive ? 'primary.main' : '#e0e0e0',
              borderRadius: '12px',
              p: 4,
              textAlign: 'center',
              bgcolor: dragActive ? 'primary.50' : '#f8f9fa',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              minHeight: 200,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: 'primary.50',
              },
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <CloudUploadIcon sx={{ fontSize: 48, color: '#666', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" mb={1}>
              Choose a file
            </Typography>
            <Typography variant="body2" color="text.secondary">
              or drag and drop it here
            </Typography>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
              style={{ display: 'none' }}
            />
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ position: 'relative', display: 'inline-block' }}>
              <Box
                component="img"
                src={previewUrl}
                alt="Preview"
                sx={{
                  width: '100%',
                  maxHeight: 300,
                  objectFit: 'contain',
                  borderRadius: '12px',
                  mb: 3,
                  border: '1px solid #e0e0e0',
                }}
              />
              
              {selectedSearchArea === 'custom' && !showSettings && (
                <>
                  <Box
                    sx={{
                      position: 'absolute',
                      top: `${selectionCoords.y}%`,
                      left: `${selectionCoords.x}%`,
                      width: `${selectionCoords.width}%`,
                      height: `${selectionCoords.height}%`,
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      borderRadius: '4px',
                      pointerEvents: 'none',
                      border: '2px solid rgba(255, 255, 255, 0.8)',
                    }}
                  />
                  
                  <Box
                    sx={{
                      position: 'absolute',
                      top: `${selectionCoords.y}%`,
                      left: `${selectionCoords.x}%`,
                      width: `${selectionCoords.width}%`,
                      height: `${selectionCoords.height}%`,
                      border: '2px solid rgba(255, 255, 255, 1)',
                      borderRadius: '4px',
                      pointerEvents: 'none',
                    }}
                  />
                </>
              )}
            </Box>
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
          <Button
            variant="outlined"
            onClick={handleClear}
            disabled={!selectedFile}
            sx={{ 
              flex: 1,
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 500,
            }}
          >
            Clear
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!selectedFile || loading}
            sx={{ 
              flex: 1,
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 500,
            }}
          >
            {loading ? <CircularProgress size={20} /> : (
                              selectedSearchArea === 'custom' ? 'Search by area' : 'Search by image'
            )}
          </Button>
        </Box>
      </Box>

      {showSettings && (
        <>
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 10000,
            }}
            onClick={handleSettingsClose}
          />
          
          <Box
            sx={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '90%',
              maxWidth: 600,
              bgcolor: '#fff',
              borderRadius: '16px',
              p: 0,
              boxShadow: 12,
              zIndex: 10001,
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              p: 2,
              borderBottom: '1px solid #e0e0e0'
            }}>
              <Typography variant="h6" fontWeight={600}>
                Select Search Area
              </Typography>
              <IconButton onClick={handleSettingsClose} size="small">
                <CloseIcon />
              </IconButton>
            </Box>

            <Box sx={{ position: 'relative', p: 2 }} data-image-container>
              <Box
                component="img"
                src={previewUrl}
                alt="Selection Preview"
                sx={{
                  width: '100%',
                  maxHeight: 400,
                  objectFit: 'contain',
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0',
                }}
              />
              
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                  borderRadius: '8px',
                  pointerEvents: 'none',
                }}
              />
              
              <Box
                sx={{
                  position: 'absolute',
                  top: `${selectionCoords.y}%`,
                  left: `${selectionCoords.x}%`,
                  width: `${selectionCoords.width}%`,
                  height: `${selectionCoords.height}%`,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '4px',
                  pointerEvents: 'none',
                }}
              />
              
              <Box
                sx={{
                  position: 'absolute',
                  top: `${selectionCoords.y}%`,
                  left: `${selectionCoords.x}%`,
                  width: `${selectionCoords.width}%`,
                  height: `${selectionCoords.height}%`,
                  cursor: 'move',
                  border: '2px solid rgba(255, 255, 255, 0.8)',
                  borderRadius: '4px',
                  transition: 'all 0.02s ease-out',
                  '&:hover': {
                    border: '2px solid rgba(255, 255, 255, 1)',
                  },
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleMouseDown(e);
                }}
                onMouseEnter={(e) => e.currentTarget.style.border = '2px solid rgba(255, 255, 255, 1)'}
                onMouseLeave={(e) => e.currentTarget.style.border = '2px solid rgba(255, 255, 255, 0.8)'}
              >
                <Box
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleCornerResize('topLeft', e);
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  sx={{
                    position: 'absolute',
                    top: '-15px',
                    left: '-15px',
                    width: '30px',
                    height: '30px',
                    border: '4px solid #fff',
                    borderRight: 'none',
                    borderBottom: 'none',
                    borderRadius: '12px 0 0 0',
                    cursor: 'nw-resize',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    transition: 'all 0.03s ease-out',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    },
                  }}
                />
                
                <Box
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleCornerResize('topRight', e);
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  sx={{
                    position: 'absolute',
                    top: '-15px',
                    right: '-15px',
                    width: '30px',
                    height: '30px',
                    border: '4px solid #fff',
                    borderLeft: 'none',
                    borderBottom: 'none',
                    borderRadius: '0 12px 0 0',
                    cursor: 'ne-resize',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    transition: 'all 0.03s ease-out',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    },
                  }}
                />
                
                <Box
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleCornerResize('bottomLeft', e);
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  sx={{
                    position: 'absolute',
                    bottom: '-15px',
                    left: '-15px',
                    width: '30px',
                    height: '30px',
                    border: '4px solid #fff',
                    borderRight: 'none',
                    borderTop: 'none',
                    borderRadius: '0 0 0 12px',
                    cursor: 'sw-resize',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    transition: 'all 0.03s ease-out',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    },
                  }}
                />
                
                <Box
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleCornerResize('bottomRight', e);
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  sx={{
                    position: 'absolute',
                    bottom: '-15px',
                    right: '-15px',
                    width: '30px',
                    height: '30px',
                    border: '4px solid #fff',
                    borderLeft: 'none',
                    borderTop: 'none',
                    borderRadius: '0 0 12px 0',
                    cursor: 'se-resize',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    transition: 'all 0.03s ease-out',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    },
                  }}
                />
              </Box>
            </Box>

            <Box sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                Click and drag the corner brackets to resize, or drag the selection area to move it
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, p: 2 }}>
              <Button
                variant="outlined"
                onClick={handleSettingsClose}
                sx={{ 
                  flex: 1,
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 500,
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleApplySettings}
                sx={{ 
                  flex: 1,
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 500,
                }}
              >
                Apply Selection
              </Button>
            </Box>
          </Box>
        </>
      )}
    </>
  );
};

export default ImageSearchModal; 