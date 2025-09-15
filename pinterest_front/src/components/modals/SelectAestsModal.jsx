import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    Box,
    Typography,
    Button,
    IconButton,
    CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';

import { StyledDialog, MasonryGrid, VibeCard, VibeImage, ContinueButton } from '../ui/StyledComponents/OnBoardComponents';
import { ArrowBack } from '@mui/icons-material';
import { WebsiteScraper } from '../../utils/corsProxyService';

const SelectAestsModal = ({ 
    open = false, 
    onClose = () => {}, 
    onBack = () => {},
    onSave = () => {},
    scrapedImages = [],
    websiteUrl = ''
}) => {
    const [selectedAests, setSelectedAests] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [scraper] = useState(new WebsiteScraper());

    const handleClose = () => {
        setSelectedAests([]);
        onClose();
    };

    const handleBack = () => {
        setSelectedAests([]);
        if (onBack) {
            onBack();
        }
    };

    const handleAestToggle = (aestId) => {
        setSelectedAests(prev => {
            if (prev.includes(aestId)) {
                return prev.filter(id => id !== aestId);
            }
            if (prev.length >= 10) {
                return prev;
            }
            return [...prev, aestId];
        });
    };
    
    const handleSave = async () => {
        if (selectedAests.length === 0) return;
    
        setIsLoading(true);
        try {
            const selectedImagesData = scrapedImages.filter(img => selectedAests.includes(img.id));
            
            console.log(`Converting ${selectedImagesData.length} selected images to files`);
            
            const fileConversions = selectedImagesData.map(async (img) => {
                try {
                    const previewUrl = await scraper.createPreviewUrl(img.url);
                    const domain = websiteUrl.replace(/https?:\/\/(www\.)?/, '').split('/')[0];
                    
                    return {
                        id: img.id,
                        name: `image_${img.id}`,
                        size: 0,
                        preview: previewUrl,
                        file: null,
                        title: '',
                        description: img.alt || `Image from ${domain}`,
                        link: websiteUrl,
                        hashtags: `${domain.split('.')[0]}`,
                        hasStoredFile: false,
                        originalUrl: img.url,
                        isFromWebsite: true
                    };
                } catch (error) {
                    console.error(`Failed to process image ${img.id}:`, error);
                    return null;
                }
            });
            
            const results = await Promise.all(fileConversions);
            const validFiles = results.filter(f => f !== null);
            
            if (validFiles.length === 0) {
                throw new Error('Failed to process any images');
            }
            
            console.log(`Successfully processed ${validFiles.length} images`);
            onSave(validFiles);
            
        } catch (err) {
            console.error('Error saving images:', err);
        } finally {
            setIsLoading(false);
        }
    };
    
  

    const isStepValid = selectedAests.length > 0;

    return (
        <StyledDialog
        open={open} 
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        dialogwidth={'1000px'}
        >
            <DialogContent sx={{ p: 0, textAlign: 'center', width: '100%' }}>
                <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    gap: '24px',
                    width: '100%',
                    padding: '30px',
                    position: 'relative',
                    maxHeight: '80vh',
                    overflow: 'hidden'
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
                    
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingRight:'50%',
                        paddingBottom:'10px',
                    }}>
                        <Button 
                            onClick={handleBack}
                            sx={{ 
                                minWidth: 'auto', 
                                pr: 3, 
                                color: '#000D17',
                                '& .MuiSvgIcon-root': {
                                    fontSize: '32px'
                                }
                            }}
                        >
                            <ArrowBackIcon/>
                        </Button>
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
                    </Box>
                    
                    <Typography 
                        sx={{ 
                            color: '#000D17',
                            fontFamily: 'Geologica',
                            fontSize: '21px',
                            fontStyle: 'normal',
                            fontWeight: '400',
                            lineHeight: 'normal'
                        }}
                    >
                       Select up to 10 images.
                    </Typography>

                    <Box sx={{
                        width: '100%',
                        maxWidth: '900px',
                        maxHeight: '400px',
                        overflowY: 'auto',
                        py: 2,
                        px: 2,
                        '&::-webkit-scrollbar': {
                            width: '6px',
                        },
                        '&::-webkit-scrollbar-track': {
                            background: 'rgba(0,0,0,0.1)',
                            borderRadius: '10px',
                        },
                        '&::-webkit-scrollbar-thumb': {
                            background: 'gray',
                            borderRadius: '10px',
                        }
                    }}>
                        <MasonryGrid>
                            {scrapedImages.map((aest) => {
                                const isSelected = selectedAests.includes(aest.id);
                                
                                return (
                                    <VibeCard 
                                        key={aest.id}
                                        height={aest.height < 400}
                                        selected={isSelected}
                                        onClick={() => handleAestToggle(aest.id)}
                                    >
                                        <VibeImage 
                                            src={aest.url} 
                                            alt={aest.alt || aest.title}
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.parentElement.style.background = '#6F91D9';
                                            }}
                                        />
                                    </VibeCard>
                                );
                            })}
                        </MasonryGrid>
                    </Box>

                    <ContinueButton
                        onClick={handleSave}
                        disabled={!isStepValid || isLoading}
                        sx={{
                            width: '460px',
                            height: '58px',
                        }}
                    >
                        {isLoading ? (
                            <CircularProgress size={20} sx={{ color: '#FFFFFF' }} />
                        ) : (
                            'Continue'
                        )}
                    </ContinueButton>
                </Box>
            </DialogContent>
        </StyledDialog>
    );
};

export default SelectAestsModal;