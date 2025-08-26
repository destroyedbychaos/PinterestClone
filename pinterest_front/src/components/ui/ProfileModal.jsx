import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
  z-index: 1000;
  padding: 16px;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  width: 320px;
  max-height: 80vh;
  overflow-y: auto;
  animation: slideIn 0.3s ease-out;

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-20px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
`;

const ProfileHeader = styled.div`
  padding: 24px 20px 16px 20px;
  border-bottom: 1px solid #f0f0f0;
`;

const ProfileInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`;

const Avatar = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
`;

const UserDetails = styled.div`
  flex: 1;
`;

const UserName = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #000D17;
  margin-bottom: 4px;
`;

const UserEmail = styled.div`
  font-size: 14px;
  color: #52697C;
`;

const SettingsButton = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 16px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  color: #000D17;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background: #e9ecef;
    border-color: #dee2e6;
  }
`;

const MenuSection = styled.div`
  padding: 8px 0;
`;

const MenuItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  color: #000D17;

  &:hover {
    background: #f8f9fa;
  }

  ${props => props.danger && `
    color: #dc3545;
    
    &:hover {
      background: #fdf2f2;
    }
  `}
`;

const MenuIcon = styled.div`
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
`;

const MenuText = styled.span`
  font-size: 14px;
  font-weight: 500;
`;

const Divider = styled.div`
  height: 1px;
  background: #f0f0f0;
  margin: 8px 0;
`;

const LogoutButton = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  color: #dc3545;

  &:hover {
    background: #fdf2f2;
  }
`;

const LogoutText = styled.span`
  font-size: 14px;
  font-weight: 500;
`;

const ProfileModal = ({ isOpen, onClose, anchorEl }) => {
  const user = useSelector(state => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const modalRef = useRef();

  const handleLogout = () => {

    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');

    onClose();
    navigate('/login');
  };

  const handleProfileClick = () => {
    onClose();
    navigate('/profile-boards');
  };

  const handleSettingsClick = () => {
    onClose();
    navigate('/settings');
  };

  const handleSavedClick = () => {
    onClose();
    navigate('/saved');
  };

  const handleHistoryClick = () => {
    onClose();
    navigate('/history');
  };

  const handleAccountDeactivation = () => {
    onClose();
    navigate('/account-deactivation');
  };

  const handleAccountDeletion = () => {
    onClose();
    navigate('/account-deletion');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <ModalOverlay>
      <ModalContent ref={modalRef}>
        <ProfileHeader>
          <ProfileInfo>
            <Avatar 
              src={user?.avatarUrl || "https://placehold.co/48x48"} 
              alt="User avatar"
            />
            <UserDetails>
              <UserName>{user?.displayName || "Користувач"}</UserName>
              <UserEmail>{user?.email || "user@example.com"}</UserEmail>
            </UserDetails>
          </ProfileInfo>
          <SettingsButton to="/profile-edit" onClick={onClose}>
            <MenuIcon>⚙️</MenuIcon>
            <span>Редагувати профіль</span>
          </SettingsButton>
        </ProfileHeader>

        <MenuSection>
          <MenuItem onClick={handleProfileClick}>
            <MenuIcon>👤</MenuIcon>
            <MenuText>Мій профіль</MenuText>
          </MenuItem>
          
          <MenuItem onClick={handleSavedClick}>
            <MenuIcon>💾</MenuIcon>
            <MenuText>Збережені піни</MenuText>
          </MenuItem>
          
          <MenuItem onClick={handleHistoryClick}>
            <MenuIcon>📚</MenuIcon>
            <MenuText>Історія переглядів</MenuText>
          </MenuItem>
        </MenuSection>

        <MenuSection>
          <MenuItem onClick={handleSettingsClick}>
            <MenuIcon>⚙️</MenuIcon>
            <MenuText>Налаштування</MenuText>
          </MenuItem>
          
          <MenuItem onClick={handleAccountDeactivation} danger>
            <MenuIcon>🚫</MenuIcon>
            <MenuText>Деактивувати акаунт</MenuText>
          </MenuItem>
        </MenuSection>

        <Divider />

        <MenuSection>
          <LogoutButton onClick={handleLogout}>
            <MenuIcon>🚪</MenuIcon>
            <LogoutText>Вийти</LogoutText>
          </LogoutButton>
        </MenuSection>
      </ModalContent>
    </ModalOverlay>
  );
};

export default ProfileModal;
