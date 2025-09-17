import React, { useState, useEffect } from 'react';
import { Dialog, Box, Typography, CircularProgress } from '@mui/material';
import styled from 'styled-components';
import socialPermissionsApi from '../../services/socialPermissionsApi';

const StyledDialog = styled(Dialog)`
  .MuiPaper-root {
    width: 848px;
    height: 792px;
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

const StyledUserListContainer = styled(Box)`
  align-self: stretch;
  flex: 1;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 20px;
`;

const StyledUserList = styled(Box)`
  flex: 1;
  align-self: stretch;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 24px;
  overflow-y: auto;
  padding-right: 8px;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: rgba(0,0,0,0.1);
    border-radius: 10px;
  }
  &::-webkit-scrollbar-thumb {
    background: gray;
    border-radius: 10px;
  }
`;

const StyledUserItem = styled(Box)`
  align-self: stretch;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 24px;
`;

const StyledUserInfo = styled(Box)`
  flex: 1;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 24px;
`;

const StyledAvatar = styled.img`
  width: 56px;
  height: 56px;
  border-radius: 9999px;
  object-fit: cover;
`;

const StyledUserDetails = styled(Box)`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 8px;
`;

const StyledUserName = styled(Typography)`
  align-self: stretch;
  color: #000D17;
  font-size: 21px;
  font-family: Geologica;
  font-weight: 600;
  word-wrap: break-word;
`;

const StyledUserHandle = styled(Typography)`
  align-self: stretch;
  color: #52697C;
  font-size: 16px;
  font-family: Geologica;
  font-weight: 400;
  word-wrap: break-word;
`;

const StyledUnblockButton = styled.button`
  width: 160px;
  height: 48px;
  padding: 16px 24px;
  background: #D7E0F4;
  border-radius: 100px;
  border: none;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  
  &:hover {
    background: #CBD7F1;
  }
  
  &:disabled {
    background: #EAEFF9;
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const StyledUnblockText = styled(Typography)`
  color: #000D17;
  font-size: 16px;
  font-family: Geologica;
  font-weight: 400;
  word-wrap: break-word;
`;

const StyledLoadingContainer = styled(Box)`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const StyledEmptyState = styled(Box)`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const StyledEmptyText = styled(Typography)`
  color: #52697C;
  font-size: 18px;
  font-family: Geologica;
  font-weight: 400;
  text-align: center;
`;

const BlacklistModal = ({ open, onClose }) => {
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState(null);

  useEffect(() => {
    if (open) {
      loadBlockedUsers();
    }
  }, [open]);

  const loadBlockedUsers = async () => {
    setIsLoading(true);
    try {
      const response = await socialPermissionsApi.getBlockedUsers();
      if (response && response.success && response.payload) {
        setBlockedUsers(response.payload);
      } else if (response && response.success && response.data) {
        // Альтернативний шлях для відповіді
        setBlockedUsers(response.data);
      } else if (Array.isArray(response)) {
        // Якщо відповідь - це масив
        setBlockedUsers(response);
      } else {
        setBlockedUsers([]);
      }
    } catch (error) {
      console.error('Error loading blocked users:', error);
      setBlockedUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnblockUser = async (blockedUserId) => {
    setUpdatingUserId(blockedUserId);
    try {
      const response = await socialPermissionsApi.unblockUser(blockedUserId);
      if (response && response.success) {
        await loadBlockedUsers(); // Reload the list
      } else {
        console.error('Failed to unblock user:', response?.message);
      }
    } catch (error) {
      console.error('Error unblocking user:', error);
    } finally {
      setUpdatingUserId(null);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <StyledLoadingContainer>
          <CircularProgress size={40} sx={{ color: '#6F91D9' }} />
        </StyledLoadingContainer>
      );
    }

    if (blockedUsers.length === 0) {
      return (
        <StyledEmptyState>
          <StyledEmptyText>
            No blocked users found.
          </StyledEmptyText>
        </StyledEmptyState>
      );
    }

    return (
      <StyledUserList>
        {blockedUsers.map((user) => (
          <StyledUserItem key={user.id}>
            <StyledUserInfo>
              <StyledAvatar 
                src={user.avatarUrl || '/assets/images/noImgUser.png'} 
                alt={user.displayName}
                onError={(e) => {
                  e.target.src = '/assets/images/noImgUser.png';
                }}
              />
              <StyledUserDetails>
                <StyledUserName>{user.displayName}</StyledUserName>
                <StyledUserHandle>@{user.userName}</StyledUserHandle>
              </StyledUserDetails>
            </StyledUserInfo>
            <StyledUnblockButton
              onClick={() => handleUnblockUser(user.id)}
              disabled={updatingUserId === user.id}
            >
              {updatingUserId === user.id ? (
                <CircularProgress size={20} sx={{ color: '#000D17' }} />
              ) : (
                <StyledUnblockText>Unblock</StyledUnblockText>
              )}
            </StyledUnblockButton>
          </StyledUserItem>
        ))}
      </StyledUserList>
    );
  };

  return (
    <StyledDialog open={open} onClose={onClose} maxWidth={false}>
      <StyledHeader>
        <StyledTitle>Blacklist</StyledTitle>
        <StyledCloseButton onClick={onClose}>
          <StyledCloseIcon />
        </StyledCloseButton>
      </StyledHeader>
      
      <StyledUserListContainer>
        {renderContent()}
      </StyledUserListContainer>
    </StyledDialog>
  );
};

export default BlacklistModal;