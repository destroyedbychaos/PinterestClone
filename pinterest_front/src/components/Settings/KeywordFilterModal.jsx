import React, { useState, useEffect } from 'react';
import { Dialog, Box, Typography, CircularProgress } from '@mui/material';
import styled from 'styled-components';
import socialPermissionsApi from '../../services/socialPermissionsApi';

const StyledDialog = styled(Dialog)`
  .MuiPaper-root {
    width: 848px;
    max-height: 792px;
    padding: 40px;
    background: white;
    box-shadow: -1px 10px 16px 1px rgba(1, 35, 63, 0.25);
    border-radius: 40px;
    display: flex;
    flex-direction: column;
    gap: 40px;
    margin: 20px;
  }
`;

const StyledHeader = styled(Box)`
  width: 100%;
  max-width: 768px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StyledTitle = styled(Typography)`
  color: #011D35;
  font-size: 28px;
  font-family: Geologica;
  font-weight: 600;
  word-wrap: break-word;
`;

const StyledCloseButton = styled.button`
  width: 40px;
  height: 40px;
  position: relative;
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    opacity: 0.8;
  }
`;

const StyledCloseIcon = styled.div`
  width: 21.70px;
  height: 21.73px;
  position: relative;
  
  &:before, &:after {
    content: '';
    position: absolute;
    background: #01233F;
    border-radius: 1px;
  }
  
  &:before {
    width: 21.70px;
    height: 2px;
    top: 50%;
    left: 0;
    transform: translateY(-50%) rotate(45deg);
  }
  
  &:after {
    width: 21.70px;
    height: 2px;
    top: 50%;
    left: 0;
    transform: translateY(-50%) rotate(-45deg);
  }
`;

const StyledDescription = styled(Typography)`
  align-self: stretch;
  color: #000D17;
  font-size: 21px;
  font-family: Geologica;
  font-weight: 400;
  word-wrap: break-word;
`;

const StyledInputContainer = styled(Box)`
  align-self: stretch;
  height: 366px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 8px;
`;

const StyledInputWrapper = styled(Box)`
  align-self: stretch;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 4px;
`;

const StyledTextArea = styled.textarea`
  align-self: stretch;
  flex: 1;
  padding: 24px;
  background: rgba(215, 224, 244, 0.50);
  border-radius: 40px;
  border: none;
  outline: none;
  resize: none;
  font-family: Geologica;
  font-size: 21px;
  font-weight: 400;
  color: #000D17;
  word-wrap: break-word;
  
  &::placeholder {
    color: #7B8D9B;
  }
  
  &:focus {
    background: rgba(215, 224, 244, 0.70);
  }
`;

const StyledLoadingContainer = styled(Box)`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
`;

const StyledSaveIndicator = styled(Box)`
  position: absolute;
  bottom: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(111, 145, 217, 0.1);
  border-radius: 20px;
  opacity: ${props => props.show ? 1 : 0};
  transition: opacity 0.3s ease;
`;

const StyledSaveText = styled(Typography)`
  color: #6F91D9;
  font-size: 14px;
  font-family: Geologica;
  font-weight: 400;
`;

const KeywordFilterModal = ({ open, onClose }) => {
  const [keywords, setKeywords] = useState([]);
  const [keywordText, setKeywordText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveTimeout, setSaveTimeout] = useState(null);

  useEffect(() => {
    if (open) {
      loadKeywords();
    }
  }, [open]);

  // Auto-save when text changes
  useEffect(() => {
    if (!isLoading && keywordText !== keywords.join('\n')) {
      // Clear existing timeout
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }
      
      // Set new timeout for auto-save
      const timeout = setTimeout(() => {
        saveKeywords();
      }, 1000); // Save after 1 second of no changes
      
      setSaveTimeout(timeout);
    }
    
    return () => {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }
    };
  }, [keywordText]);

  const loadKeywords = async () => {
    setIsLoading(true);
    try {
      const response = await socialPermissionsApi.getKeywordFilters();
      if (response && response.success && response.payload) {
        const keywordList = response.payload.keywords || [];
        setKeywords(keywordList);
        setKeywordText(keywordList.join('\n'));
      }
    } catch (error) {
      console.error('Error loading keywords:', error);
      setKeywords([]);
      setKeywordText('');
    } finally {
      setIsLoading(false);
    }
  };

  const saveKeywords = async () => {
    setIsSaving(true);
    try {
      // Parse keywords from text (one per line, filter empty lines)
      const keywordList = keywordText
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
      
      const response = await socialPermissionsApi.updateKeywordFilters({ 
        keywords: keywordList 
      });
      
      if (response && response.success) {
        setKeywords(keywordList);
      } else {
        console.error('Failed to save keywords:', response?.message);
      }
    } catch (error) {
      console.error('Error saving keywords:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTextChange = (e) => {
    setKeywordText(e.target.value);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <StyledLoadingContainer>
          <CircularProgress size={40} sx={{ color: '#6F91D9' }} />
        </StyledLoadingContainer>
      );
    }

    return (
      <StyledInputContainer>
        <StyledInputWrapper>
          <StyledTextArea
            value={keywordText}
            onChange={handleTextChange}
            placeholder="Start typing here..."
            rows={10}
          />
        </StyledInputWrapper>
      </StyledInputContainer>
    );
  };

  return (
    <StyledDialog open={open} onClose={onClose} maxWidth={false}>
      <StyledHeader>
        <StyledTitle>Keyword filter</StyledTitle>
        <StyledCloseButton onClick={onClose}>
          <StyledCloseIcon />
        </StyledCloseButton>
      </StyledHeader>
      
      <StyledDescription>
        Hide comments on your own or others' Aests that contain certain words or phrases by adding keywords, helping you avoid unwanted content.
      </StyledDescription>
      
      {renderContent()}
      
      <StyledSaveIndicator show={isSaving}>
        <CircularProgress size={16} sx={{ color: '#6F91D9' }} />
        <StyledSaveText>Saving...</StyledSaveText>
      </StyledSaveIndicator>
    </StyledDialog>
  );
};

export default KeywordFilterModal;