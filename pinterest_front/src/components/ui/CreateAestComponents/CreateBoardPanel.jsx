import React, { useState, useMemo } from 'react';
import { Box, Paper, Typography, Switch, Button, IconButton, Avatar } from '@mui/material';
import { useTheme } from '@mui/material';
import { Icon as Iconify } from '@iconify/react';
import InputField from '../Auth/InputField';
import ActionButton from './ActionButton';
import { useGetAllUsersQuery } from '../../../../store/ProfileApi/ProfileApi';

const CreateBoardPanel = ({ onBack, onCreateBoard, isLoading, isborder = true, padding = '32px' }) => {
  const theme = useTheme();
  const [boardName, setBoardName] = useState('');
  const [searchPeople, setSearchPeople] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [invitedUsers, setInvitedUsers] = useState([]);
  const { data: allUsers, isFetching, error } = useGetAllUsersQuery();
  const usersArray = Array.isArray(allUsers?.payload) ? allUsers.payload : [];


  const normalizeUser = (user) => ({
    id: user.id,
    name: user.displayName || user.userName || 'Unknown User',
    username: user.userName || user.email || '',
    email: user.email,
    avatar: user.avatarUrl || '/api/placeholder/40/40'
  });

  const filteredUsers = useMemo(() => {
    if (!searchPeople.trim()) return usersArray.map(normalizeUser);
    
    const searchTerm = searchPeople.toLowerCase();
    return usersArray
      .filter(user =>
        (user.displayName?.toLowerCase().includes(searchTerm) ||
         user.userName?.toLowerCase().includes(searchTerm) ||
         user.email?.toLowerCase().includes(searchTerm))
      )
      .filter(
        user => !invitedUsers.find(invitedUser => invitedUser.id === user.id)
      )
      .map(normalizeUser);
  }, [searchPeople, invitedUsers, usersArray]);

  const handleCreate = () => {
    if (boardName.trim()) {
      onCreateBoard(boardName.trim(), isPrivate, invitedUsers);
      setBoardName('');
      setIsPrivate(false);
      setInvitedUsers([]);
    }
  };

  const handleInviteUser = (user) => {
    setInvitedUsers((prev) => [...prev, user]);
    setSearchPeople('');
  };

  const handleRemoveUser = (userId) => {
    setInvitedUsers((prev) => prev.filter((user) => user.id !== userId));
  };

  return (
    <Paper sx={{
      height: "650px", 
      borderRadius: "40px", 
      padding: padding,
      boxShadow: "none", 
      border: isborder ? "1px solid #B4C6EB" : "none",
      display: "flex", 
      flexDirection: "column"
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, position: 'relative' }}>
        <IconButton 
          onClick={onBack}
          sx={{ 
            p: 1,
            position: 'absolute',
            left: 0,
            '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' },
          }}
        >
          <Iconify icon="octicon:arrow-left-24" width={32} height={32} color='black' />
        </IconButton>

        <Typography sx={{
          fontWeight: 600, 
          fontSize: "28px",
          textAlign: "center",
          flex: 1,
          color: theme.palette.dark?.[600] || '#000',
          fontFamily: "Geologica, sans-serif"
        }}>
          Create new board
        </Typography>
      </Box>

      <Box sx={{ 
        flex: 1, 
        overflow: 'auto',
        display: 'flex', 
        flexDirection: 'column',
        '&::-webkit-scrollbar': {
          width: '6px',
        },
        '&::-webkit-scrollbar-track': {
          background: '#f1f1f1',
          borderRadius: '10px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#c1c1c1',
          borderRadius: '10px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          background: '#a1a1a1',
        },
      }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pb: 2 }}>
          <Box>
            <Typography sx={{
              fontSize: "18px",
              fontWeight: 400,
              ml:1,
              color: theme.palette.text?.primary || '#000',
              fontFamily: "Geologica, sans-serif"
            }}>
              Let's name it
            </Typography>
            <InputField
              label=""
              type="text"
              value={boardName}
              onChange={(e) => setBoardName(e.target.value)}
              placeholder="Board name"
              id="boardName"
              width="100%"
              required
            />
          </Box>

          <Box
            component="hr"
            sx={{
              border: 'none',
              borderTop: `1px solid ${theme.palette.blue?.[50] || '#e0e0e0'}`,
            }}
          />

          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center',ml:1 }}>
              <Typography sx={{
                fontSize: "21px",
                fontWeight: 400,
              }}>Private board</Typography>
              <Switch
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#D7E0F4',
                    '&:hover': {
                      backgroundColor: 'rgba(66, 133, 244, 0.08)',
                    },
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: '#4285F4',
                  },
                }}
              />
            </Box>
          </Box>

          <Box
            component="hr"
            sx={{
              border: 'none',
              borderTop: `1px solid ${theme.palette.blue?.[50] || '#e0e0e0'}`,
            }}
          />

          <Box>
            <Typography sx={{
              fontSize: "18px",
              ml:1,
              fontWeight: 400,
              color: theme.palette.text?.primary || '#000',
              mb: 1,
              fontFamily: "Geologica, sans-serif"
            }}>
              Invite collaborators (optional)
            </Typography>
            
            <InputField
              label=""
              type="text"
              value={searchPeople}
              onChange={(e) => setSearchPeople(e.target.value)}
              placeholder="Search people"
              id="searchPeople"
              width="100%"
            />

            {searchPeople && filteredUsers.length > 0 && (
              <Box sx={{ 
                borderRadius: '8px',
                mt: 1,
                backgroundColor: '#fff',
              }}>
                {filteredUsers.map((user) => (
                  <Box
                    key={user.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px 16px',
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'rgba(0,0,0,0.04)',
                      },
                    }}
                    onClick={() => handleInviteUser(user)}
                  >
                    <Avatar src={user.avatar} sx={{ width: 40, height: 40, mr: 2 }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontWeight: 500, fontSize: '16px' }}>
                        {user.name}
                      </Typography>
                      <Typography sx={{ color: theme.palette.text?.secondary || '#666', fontSize: '14px' }}>
                        {user.username}
                      </Typography>
                    </Box>
                    <ActionButton
                      variant="secondary"
                      width='100'
                      height='48px'
                    >
                      Invite
                    </ActionButton>
                  </Box>
                ))}
              </Box>
            )}

            {searchPeople && filteredUsers.length === 0 && (
              <Box sx={{ 
                textAlign: 'center', 
                py: 2, 
                color: theme.palette.text?.secondary || '#666',
                fontSize: '14px',
                mt: 1
              }}>
                No users found
              </Box>
            )}

            {invitedUsers.length > 0 && (
              <Box sx={{ mt: 3 }}>
                {invitedUsers.map((user) => (
                  <Box
                    key={user.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      mb: 2,
                      backgroundColor: '#fff',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar src={user.avatar} sx={{ width: 40, height: 40, mr: 2 }} />
                      <Box>
                        <Typography sx={{ fontWeight: 500, fontSize: '16px' }}>
                          {user.name || user.displayName || 'Unknown User'}
                        </Typography>
                        <Typography sx={{ color: theme.palette.text?.secondary || '#666', fontSize: '14px' }}>
                          {user.username || user.userName || user.email}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <ActionButton
                      variant="outlined"
                      width='100'
                      height='48px'
                      onClick={() => handleRemoveUser(user.id)}
                      sx={{
                        '&:hover': {
                          backgroundColor: 'rgba(255, 0, 0, 0.04)',
                          borderColor: 'rgba(255, 0, 0, 0.3)',
                        }
                      }}
                    >
                      Invited
                    </ActionButton>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      <Box sx={{ display: "flex", gap: 3, justifyContent: "center", mt: 3 }}>
        <ActionButton 
          onClick={onBack}
          disabled={isLoading}
          width={'100%'}
          color="secondary">
          
          Cancel
        </ActionButton>
        <ActionButton 
         width={'100%'}
          onClick={handleCreate}
          disabled={!boardName.trim() || isLoading}>
          {isLoading ? 'Creating...' : 'Create'}
        </ActionButton>
      </Box>
    </Paper>
  );
};

export default CreateBoardPanel;