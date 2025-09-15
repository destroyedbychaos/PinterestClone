import React, { useState } from 'react';
import {
    DialogContent,
    Box,
    Typography,
    IconButton,
    CircularProgress,
    Alert
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import { StyledDialog, StyledTextField, ContinueButton } from '../ui/StyledComponents/OnBoardComponents';
import { WebsiteScraper } from '../../utils/corsProxyService';

const SaveFromUrlModal = ({ 
    open = false, 
    onClose = () => {}, 
    onOpenSelectAests = () => {},
    onImagesFound = () => {}
}) => {
    const [url, setUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [scraper] = useState(new WebsiteScraper());

    const validateUrl = (url) => {
        try {
            const urlObj = new URL(url);
            return ['http:', 'https:'].includes(urlObj.protocol);
        } catch {
            return false;
        }
    };

    const handleClose = () => {
        // Очищуємо поле пошуку при закритті модалки
        setUrl('');
        setError('');
        onClose();
    };

    const handleSave = async () => {
        if (!url.trim()) {
            setError('Please enter a website URL');
            return;
        }
    
        let processedUrl = url.trim();
        if (!processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
            processedUrl = 'https://' + processedUrl;
        }
    
        if (!validateUrl(processedUrl)) {
            setError('Invalid URL. Use format: https://example.com');
            return;
        }
    
        setIsLoading(true);
        setError('');
    
        try {
            console.log('Fetching images from website:', processedUrl);
            const images = await scraper.fetchImages(processedUrl);
    
            if (!images || images.length === 0) {
                setError('No images found on this page. Try a different website.');
                return;
            }
    
            console.log(`Found ${images.length} images`);
            
            if (onImagesFound) {
                onImagesFound(images, processedUrl);
            }
    
            setUrl('');
            onClose();
            onOpenSelectAests();
        } catch (err) {
            console.error('Error fetching images:', err);
            setError('Failed to load images from this website. The site may be blocking access or unavailable.');
        } finally {
            setIsLoading(false);
        }
    };
  

    const handleUrlChange = (e) => {
        setUrl(e.target.value);
        if (error) setError('');
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !isLoading) {
            handleSave();
        }
    };

    return (
        <StyledDialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
        >
            <DialogContent sx={{ p: 0, textAlign: 'left', width: '100%' }}>
                <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'left', 
                    gap: '24px',
                    width: '100%',
                    padding: '40px',
                    position: 'relative',
                }}>
                    <IconButton
                        onClick={handleClose}
                        sx={{ 
                            position: 'absolute',
                            top: '20px',
                            right: '20px',
                            color: '#000D17'
                        }}
                    >
                        <CloseIcon />
                    </IconButton>

                    <Typography 
                        sx={{ 
                            color: '#000D17',
                            fontFamily: 'Geologica',
                            fontSize: '28px',
                            fontStyle: 'normal',
                            fontWeight: '600',
                            lineHeight: 'normal'
                        }}
                    >
                        Save ideas from website
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Box sx={{
                        display: 'flex',
                        alignItems: 'space-between',
                    }}>
                        <Box sx={{ 
                            width: '100%',
                            maxWidth: '800px'
                        }}>
                            <StyledTextField
                                fullWidth
                                placeholder="Enter website"
                                value={url}
                                onChange={handleUrlChange}
                                onKeyPress={handleKeyPress}
                                disabled={isLoading}
                                variant="outlined"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        paddingLeft: '8px'
                                    }
                                }}
                            />
                        </Box>

                        <ContinueButton
                            onClick={handleSave}
                            disabled={!url.trim() || isLoading}
                            sx={{ ml: 2, minWidth: '200px' }}
                        >
                            {isLoading ? (
                                <CircularProgress size={24} sx={{ color: '#FFFFFF' }} />
                            ) : (
                                'Search'
                            )}
                        </ContinueButton>
                    </Box>
                    
                </Box>
            </DialogContent>
        </StyledDialog>
    );
};

export default SaveFromUrlModal;