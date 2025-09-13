import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Avatar, List, ListItem, ListItemAvatar, ListItemText, IconButton } from '@mui/material';
import { Close, Search } from '@mui/icons-material';
import SendIcon from './icons/SendIcon';
import './SharePinModal.css';

const SharePinModal = ({ isOpen, onClose, onShare, pin }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => 
        user.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/Profile/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data || []);
        setFilteredUsers(data || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!selectedUser || !pin) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }

      const shareData = {
        PinId: pin.id || pin.Id,
        SharedWithUserId: selectedUser.id,
        Message: message.trim() || undefined
      };

      const response = await fetch('/api/PinShares', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(shareData)
      });

      if (response.ok) {
        console.log('Pin shared successfully');
        onShare && onShare(selectedUser, message);
        onClose();
      } else {
        const errorData = await response.json();
        console.error('Error sharing pin:', errorData);
      }
    } catch (error) {
      console.error('Error sharing pin:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <Box className="share-pin-overlay" onClick={onClose}>
      <Box className="share-pin-content" onClick={(e) => e.stopPropagation()}>
        <Box className="share-pin-header">
          <Typography className="share-pin-title">Share Pin</Typography>
          <IconButton className="close-button" onClick={onClose}>
            <Close />
          </IconButton>
        </Box>

        <Box className="share-pin-search">
          <TextField
            fullWidth
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search className="search-icon" />
            }}
          />
        </Box>

        <Box className="share-pin-users">
          <Typography className="users-title">Select user to share with:</Typography>
          <List className="users-list">
            {filteredUsers.map((user) => (
              <ListItem
                key={user.id}
                className={`user-item ${selectedUser?.id === user.id ? 'selected' : ''}`}
                onClick={() => setSelectedUser(user)}
              >
                <ListItemAvatar>
                  <Avatar src={user.avatarUrl} alt={user.displayName || user.userName}>
                    {(user.displayName || user.userName || user.email || 'U').charAt(0).toUpperCase()}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={user.displayName || user.userName || user.email}
                  secondary={user.userName && user.userName !== user.displayName ? `@${user.userName}` : ''}
                />
              </ListItem>
            ))}
          </List>
        </Box>

        {selectedUser && (
          <Box className="share-pin-message">
            <Typography className="message-title">
              Message to {selectedUser.displayName || selectedUser.userName || selectedUser.email}:
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Add a message (optional)..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </Box>
        )}

                 <Box className="share-pin-actions">
                     <Button
            className="share-button"
            variant="contained"
            disabled={!selectedUser}
            onClick={handleShare}
            startIcon={<SendIcon size={20} />}
          >
             Share Pin
           </Button>
         </Box>
      </Box>
    </Box>
  );
};

export default SharePinModal;
