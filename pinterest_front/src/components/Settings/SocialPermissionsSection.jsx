import React, { useState, useEffect } from 'react';
import { Box, Typography, Button } from '@mui/material';
import styled from 'styled-components';
import socialPermissionsApi from '../../services/socialPermissionsApi';
import KeywordFilterModal from './KeywordFilterModal';
import BlacklistModal from './BlacklistModal';
import SocialPermissionsTest from './SocialPermissionsTest';

const RadioIcon = ({ selected }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="11" stroke="#6F91D9" strokeWidth="1" fill="transparent"/>
    {selected && (
      <circle cx="12" cy="12" r="8" fill="#6F91D9"/>
    )}
  </svg>
);

const RadioButton = styled.button`
  width: 24px;
  height: 24px;
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
  aspect-ratio: 1/1;
  padding: 0;

  &:hover {
    transform: scale(1.05);
  }
`;

const ToggleSwitch = styled.button`
  width: 64px;
  height: 32px;
  padding: 4px;
  background: ${props => props.$enabled ? '#6F91D9' : '#D7E0F4'};
  border-radius: 100px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: ${props => props.$enabled ? 'flex-end' : 'flex-start'};
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.02);
  }
`;

const ToggleKnob = styled.div`
  width: 24px;
  height: 24px;
  background: white;
  border-radius: 50%;
  box-shadow: 1px 2px 2.3px rgba(1, 35, 63, 0.25);
  transition: all 0.3s ease;
`;

const StyledCard = styled(Box)`
  width: 557px;
  padding: 40px;
  border-radius: 40px;
  border: 1px solid #B4C6EB;
  background: white;
  display: flex;
  flex-direction: column;
  gap: 40px;
`;

const StyledButton = styled(Button)`
  width: 464px;
  padding: 16px 24px;
  background: #D7E0F4 !important;
  border-radius: 100px !important;
  text-transform: none !important;
  color: #000D17 !important;
  font-size: 21px !important;
  font-family: Geologica !important;
  font-weight: 400 !important;
  
  &:hover {
    background: #CBD7F1 !important;
    transform: scale(1.02);
  }
`;

const SocialPermissionsSection = () => {
  const [settings, setSettings] = useState({
    mentionsSetting: 'anyone', 
    friendsMessagesSetting: 'inbox', 
    followersMessagesSetting: 'request',
    followingMessagesSetting: 'inbox',
    everyoneMessagesSetting: 'dont_receive',
    allowComments: true,
    filterMyComments: true,
    filterOthersComments: false
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showKeywordModal, setShowKeywordModal] = useState(false);
  const [showBlacklistModal, setShowBlacklistModal] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        const response = await socialPermissionsApi.getSocialPermissions();
        console.log('Social permissions response:', response); // Для дебагу
        
        // Перевіряємо структуру відповіді
        if (response && response.success && response.payload) {
          setSettings(response.payload);
        } else if (response && response.success && response.data) {
          setSettings(response.data);
        } else if (response) {
          // Якщо відповідь - це безпосередньо дані
          setSettings(response);
        }
      } catch (error) {
        console.error('Error loading social permissions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const saveSettings = async () => {
        try {
          setIsSaving(true);
          console.log('Saving social permissions:', settings); // Для дебагу
          const response = await socialPermissionsApi.updateSocialPermissions(settings);
          console.log('Save response:', response); // Для дебагу
        } catch (error) {
          console.error('Error saving social permissions:', error);
        } finally {
          setIsSaving(false);
        }
      };

      const timeoutId = setTimeout(saveSettings, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [settings, isLoading]);

  const handleMentionChange = (value) => {
    setSettings(prev => ({
      ...prev,
      mentionsSetting: value
    }));
  };

  const handleMessageChange = (category, value) => {
    setSettings(prev => ({
      ...prev,
      [`${category}MessagesSetting`]: value
    }));
  };

  const handleCommentToggle = (setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleBlacklistClick = () => {
    setShowBlacklistModal(true);
  };

  const handleKeywordFilterClick = () => {
    setShowKeywordModal(true);
  };

  return (
    <Box className="settings-cards-container">
      <Box sx={{ 
        flexDirection: 'column', 
        justifyContent: 'flex-start', 
        alignItems: 'center', 
        gap: 3, 
        display: 'inline-flex',
        mb: 6
      }}>
        <Typography sx={{ 
          textAlign: 'center', 
          color: '#000D17', 
          fontSize: 38, 
          fontFamily: 'Geologica', 
          fontWeight: '700', 
          wordWrap: 'break-word'
        }}>
          Social permissions
        </Typography>
        <Typography sx={{ 
          textAlign: 'center', 
          color: '#52697C', 
          fontSize: 21, 
          fontFamily: 'Geologica', 
          fontWeight: '400', 
          wordWrap: 'break-word'
        }}>
          Decide how people can interact with you on Aestify.
        </Typography>
      </Box>

      <Box sx={{ 
        width: '100%',
        maxWidth: 1720,
        justifyContent: 'space-between', 
        alignItems: 'flex-start', 
        display: 'flex',
        gap: 3,
        flexWrap: 'wrap'
      }}>
        {/* Left Column - Mentions & Blocked Accounts */}
        <Box sx={{ 
          alignSelf: 'stretch', 
          flexDirection: 'column', 
          justifyContent: 'flex-start', 
          alignItems: 'flex-start', 
          gap: 3, 
          display: 'inline-flex'
        }}>
          {/* Mentions Card */}
          <StyledCard>
            <Typography sx={{ 
              alignSelf: 'stretch', 
              color: '#000D17', 
              fontSize: 28, 
              fontFamily: 'Geologica', 
              fontWeight: '600', 
              wordWrap: 'break-word'
            }}>
              Mentions
            </Typography>
            <Typography sx={{ 
              color: '#000D17', 
              fontSize: 21, 
              fontFamily: 'Geologica', 
              fontWeight: '400', 
              wordWrap: 'break-word'
            }}>
              Choose who can @mention you
            </Typography>
            <Box sx={{ 
              alignSelf: 'stretch', 
              flexDirection: 'column', 
              justifyContent: 'flex-start', 
              alignItems: 'flex-start', 
              gap: 3, 
              display: 'flex'
            }}>
              <Box sx={{ 
                justifyContent: 'flex-start', 
                alignItems: 'center', 
                gap: 2, 
                display: 'inline-flex'
              }}>
                <RadioButton 
                  onClick={() => handleMentionChange('anyone')}
                >
                  <RadioIcon selected={settings.mentionsSetting === 'anyone'} />
                </RadioButton>
                <Typography sx={{ 
                  color: '#000D17', 
                  fontSize: 21, 
                  fontFamily: 'Geologica', 
                  fontWeight: '400', 
                  wordWrap: 'break-word'
                }}>
                  Anyone on Aestify
                </Typography>
              </Box>
              <Box sx={{ 
                justifyContent: 'flex-start', 
                alignItems: 'center', 
                gap: 2, 
                display: 'inline-flex'
              }}>
                <RadioButton 
                  onClick={() => handleMentionChange('following')}
                >
                  <RadioIcon selected={settings.mentionsSetting === 'following'} />
                </RadioButton>
                <Typography sx={{ 
                  color: '#000D17', 
                  fontSize: 21, 
                  fontFamily: 'Geologica', 
                  fontWeight: '400', 
                  wordWrap: 'break-word'
                }}>
                  Only people you follow
                </Typography>
              </Box>
              <Box sx={{ 
                justifyContent: 'flex-start', 
                alignItems: 'center', 
                gap: 2, 
                display: 'inline-flex'
              }}>
                <RadioButton 
                  onClick={() => handleMentionChange('nobody')}
                >
                  <RadioIcon selected={settings.mentionsSetting === 'nobody'} />
                </RadioButton>
                <Typography sx={{ 
                  color: '#000D17', 
                  fontSize: 21, 
                  fontFamily: 'Geologica', 
                  fontWeight: '400', 
                  wordWrap: 'break-word'
                }}>
                  Nobody
                </Typography>
              </Box>
            </Box>
          </StyledCard>

          {/* Blocked Accounts Card */}
          <StyledCard>
            <Typography sx={{ 
              alignSelf: 'stretch', 
              color: '#000D17', 
              fontSize: 28, 
              fontFamily: 'Geologica', 
              fontWeight: '600', 
              wordWrap: 'break-word'
            }}>
              Blocked accounts
            </Typography>
            <Typography sx={{ 
              width: 477, 
              color: '#000D17', 
              fontSize: 21, 
              fontFamily: 'Geologica', 
              fontWeight: '400', 
              wordWrap: 'break-word'
            }}>
              Manage who can't see your profile, Aests, etc.
            </Typography>
            <StyledButton onClick={handleBlacklistClick}>
              Blacklist
            </StyledButton>
          </StyledCard>
        </Box>

        {/* Middle Column - Messages */}
        <StyledCard sx={{ alignSelf: 'stretch' }}>
          <Typography sx={{ 
            alignSelf: 'stretch', 
            color: '#000D17', 
            fontSize: 28, 
            fontFamily: 'Geologica', 
            fontWeight: '600', 
            wordWrap: 'break-word'
          }}>
            Messages
          </Typography>
          <Typography sx={{ 
            alignSelf: 'stretch', 
            color: '#000D17', 
            fontSize: 21, 
            fontFamily: 'Geologica', 
            fontWeight: '400', 
            wordWrap: 'break-word'
          }}>
            Choose if messages go to your inbox, requests, or nowhere at all.
          </Typography>

          {/* Friends */}
          <Box sx={{ 
            alignSelf: 'stretch', 
            flexDirection: 'column', 
            justifyContent: 'flex-start', 
            alignItems: 'flex-start', 
            gap: 3, 
            display: 'flex'
          }}>
            <Typography sx={{ 
              color: '#000D17', 
              fontSize: 21, 
              fontFamily: 'Geologica', 
              fontWeight: '600', 
              wordWrap: 'break-word'
            }}>
              Friends
            </Typography>
            <Box sx={{ 
              alignSelf: 'stretch', 
              justifyContent: 'flex-start', 
              alignItems: 'flex-start', 
              gap: 5, 
              display: 'inline-flex'
            }}>
              <Box sx={{ 
                justifyContent: 'flex-start', 
                alignItems: 'center', 
                gap: 2, 
                display: 'flex'
              }}>
                <RadioButton 
                  onClick={() => handleMessageChange('friends', 'inbox')}
                >
                  <RadioIcon selected={settings.friendsMessagesSetting === 'inbox'} />
                </RadioButton>
                <Typography sx={{ 
                  color: '#000D17', 
                  fontSize: 21, 
                  fontFamily: 'Geologica', 
                  fontWeight: '400', 
                  wordWrap: 'break-word'
                }}>
                  Inbox
                </Typography>
              </Box>
              <Box sx={{ 
                justifyContent: 'flex-start', 
                alignItems: 'center', 
                gap: 2, 
                display: 'flex'
              }}>
                <RadioButton 
                  onClick={() => handleMessageChange('friends', 'request')}
                >
                  <RadioIcon selected={settings.friendsMessagesSetting === 'request'} />
                </RadioButton>
                <Typography sx={{ 
                  color: '#000D17', 
                  fontSize: 21, 
                  fontFamily: 'Geologica', 
                  fontWeight: '400', 
                  wordWrap: 'break-word'
                }}>
                  Request
                </Typography>
              </Box>
              <Box sx={{ 
                justifyContent: 'flex-start', 
                alignItems: 'center', 
                gap: 2, 
                display: 'flex'
              }}>
                <RadioButton 
                  onClick={() => handleMessageChange('friends', 'dont_receive')}
                >
                  <RadioIcon selected={settings.friendsMessagesSetting === 'dont_receive'} />
                </RadioButton>
                <Typography sx={{ 
                  color: '#000D17', 
                  fontSize: 21, 
                  fontFamily: 'Geologica', 
                  fontWeight: '400', 
                  wordWrap: 'break-word'
                }}>
                  Don't receive
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Followers */}
          <Box sx={{ 
            alignSelf: 'stretch', 
            flexDirection: 'column', 
            justifyContent: 'flex-start', 
            alignItems: 'flex-start', 
            gap: 3, 
            display: 'flex'
          }}>
            <Typography sx={{ 
              color: '#000D17', 
              fontSize: 21, 
              fontFamily: 'Geologica', 
              fontWeight: '600', 
              wordWrap: 'break-word'
            }}>
              Followers
            </Typography>
            <Box sx={{ 
              alignSelf: 'stretch', 
              justifyContent: 'flex-start', 
              alignItems: 'flex-start', 
              gap: 5, 
              display: 'inline-flex'
            }}>
              <Box sx={{ 
                justifyContent: 'flex-start', 
                alignItems: 'center', 
                gap: 2, 
                display: 'flex'
              }}>
                <RadioButton 
                  onClick={() => handleMessageChange('followers', 'inbox')}
                >
                  <RadioIcon selected={settings.followersMessagesSetting === 'inbox'} />
                </RadioButton>
                <Typography sx={{ 
                  color: '#000D17', 
                  fontSize: 21, 
                  fontFamily: 'Geologica', 
                  fontWeight: '400', 
                  wordWrap: 'break-word'
                }}>
                  Inbox
                </Typography>
              </Box>
              <Box sx={{ 
                justifyContent: 'flex-start', 
                alignItems: 'center', 
                gap: 2, 
                display: 'flex'
              }}>
                <RadioButton 
                  onClick={() => handleMessageChange('followers', 'request')}
                >
                  <RadioIcon selected={settings.followersMessagesSetting === 'request'} />
                </RadioButton>
                <Typography sx={{ 
                  color: '#000D17', 
                  fontSize: 21, 
                  fontFamily: 'Geologica', 
                  fontWeight: '400', 
                  wordWrap: 'break-word'
                }}>
                  Request
                </Typography>
              </Box>
              <Box sx={{ 
                justifyContent: 'flex-start', 
                alignItems: 'center', 
                gap: 2, 
                display: 'flex'
              }}>
                <RadioButton 
                  onClick={() => handleMessageChange('followers', 'dont_receive')}
                >
                  <RadioIcon selected={settings.followersMessagesSetting === 'dont_receive'} />
                </RadioButton>
                <Typography sx={{ 
                  color: '#000D17', 
                  fontSize: 21, 
                  fontFamily: 'Geologica', 
                  fontWeight: '400', 
                  wordWrap: 'break-word'
                }}>
                  Don't receive
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Following */}
          <Box sx={{ 
            alignSelf: 'stretch', 
            flexDirection: 'column', 
            justifyContent: 'flex-start', 
            alignItems: 'flex-start', 
            gap: 3, 
            display: 'flex'
          }}>
            <Typography sx={{ 
              color: '#000D17', 
              fontSize: 21, 
              fontFamily: 'Geologica', 
              fontWeight: '600', 
              wordWrap: 'break-word'
            }}>
              Following
            </Typography>
            <Box sx={{ 
              alignSelf: 'stretch', 
              justifyContent: 'flex-start', 
              alignItems: 'flex-start', 
              gap: 5, 
              display: 'inline-flex'
            }}>
              <Box sx={{ 
                justifyContent: 'flex-start', 
                alignItems: 'center', 
                gap: 2, 
                display: 'flex'
              }}>
                <RadioButton 
                  onClick={() => handleMessageChange('following', 'inbox')}
                >
                  <RadioIcon selected={settings.followingMessagesSetting === 'inbox'} />
                </RadioButton>
                <Typography sx={{ 
                  color: '#000D17', 
                  fontSize: 21, 
                  fontFamily: 'Geologica', 
                  fontWeight: '400', 
                  wordWrap: 'break-word'
                }}>
                  Inbox
                </Typography>
              </Box>
              <Box sx={{ 
                justifyContent: 'flex-start', 
                alignItems: 'center', 
                gap: 2, 
                display: 'flex'
              }}>
                <RadioButton 
                  onClick={() => handleMessageChange('following', 'request')}
                >
                  <RadioIcon selected={settings.followingMessagesSetting === 'request'} />
                </RadioButton>
                <Typography sx={{ 
                  color: '#000D17', 
                  fontSize: 21, 
                  fontFamily: 'Geologica', 
                  fontWeight: '400', 
                  wordWrap: 'break-word'
                }}>
                  Request
                </Typography>
              </Box>
              <Box sx={{ 
                justifyContent: 'flex-start', 
                alignItems: 'center', 
                gap: 2, 
                display: 'flex'
              }}>
                <RadioButton 
                  onClick={() => handleMessageChange('following', 'dont_receive')}
                >
                  <RadioIcon selected={settings.followingMessagesSetting === 'dont_receive'} />
                </RadioButton>
                <Typography sx={{ 
                  color: '#000D17', 
                  fontSize: 21, 
                  fontFamily: 'Geologica', 
                  fontWeight: '400', 
                  wordWrap: 'break-word'
                }}>
                  Don't receive
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Everyone else */}
          <Box sx={{ 
            alignSelf: 'stretch', 
            flexDirection: 'column', 
            justifyContent: 'flex-start', 
            alignItems: 'flex-start', 
            gap: 3, 
            display: 'flex'
          }}>
            <Typography sx={{ 
              color: '#000D17', 
              fontSize: 21, 
              fontFamily: 'Geologica', 
              fontWeight: '600', 
              wordWrap: 'break-word'
            }}>
              Everyone else
            </Typography>
            <Box sx={{ 
              alignSelf: 'stretch', 
              justifyContent: 'flex-start', 
              alignItems: 'flex-start', 
              gap: 5, 
              display: 'inline-flex'
            }}>
              <Box sx={{ 
                justifyContent: 'flex-start', 
                alignItems: 'center', 
                gap: 2, 
                display: 'flex'
              }}>
                <RadioButton 
                  onClick={() => handleMessageChange('everyone', 'inbox')}
                >
                  <RadioIcon selected={settings.everyoneMessagesSetting === 'inbox'} />
                </RadioButton>
                <Typography sx={{ 
                  color: '#000D17', 
                  fontSize: 21, 
                  fontFamily: 'Geologica', 
                  fontWeight: '400', 
                  wordWrap: 'break-word'
                }}>
                  Inbox
                </Typography>
              </Box>
              <Box sx={{ 
                justifyContent: 'flex-start', 
                alignItems: 'center', 
                gap: 2, 
                display: 'flex'
              }}>
                <RadioButton 
                  onClick={() => handleMessageChange('everyone', 'request')}
                >
                  <RadioIcon selected={settings.everyoneMessagesSetting === 'request'} />
                </RadioButton>
                <Typography sx={{ 
                  color: '#000D17', 
                  fontSize: 21, 
                  fontFamily: 'Geologica', 
                  fontWeight: '400', 
                  wordWrap: 'break-word'
                }}>
                  Request
                </Typography>
              </Box>
              <Box sx={{ 
                justifyContent: 'flex-start', 
                alignItems: 'center', 
                gap: 2, 
                display: 'flex'
              }}>
                <RadioButton 
                  onClick={() => handleMessageChange('everyone', 'dont_receive')}
                >
                  <RadioIcon selected={settings.everyoneMessagesSetting === 'dont_receive'} />
                </RadioButton>
                <Typography sx={{ 
                  color: '#000D17', 
                  fontSize: 21, 
                  fontFamily: 'Geologica', 
                  fontWeight: '400', 
                  wordWrap: 'break-word'
                }}>
                  Don't receive
                </Typography>
              </Box>
            </Box>
          </Box>
        </StyledCard>

        {/* Right Column - Comments */}
        <StyledCard sx={{ alignSelf: 'stretch' }}>
          <Typography sx={{ 
            alignSelf: 'stretch', 
            color: '#000D17', 
            fontSize: 28, 
            fontFamily: 'Geologica', 
            fontWeight: '600', 
            wordWrap: 'break-word'
          }}>
            Comments
          </Typography>

          {/* Allow comments on your Aests */}
          <Box sx={{ 
            alignSelf: 'stretch', 
            justifyContent: 'center', 
            alignItems: 'center', 
            gap: 5, 
            display: 'inline-flex'
          }}>
            <Box sx={{ 
              flex: '1 1 0', 
              flexDirection: 'column', 
              justifyContent: 'flex-start', 
              alignItems: 'flex-start', 
              gap: 2, 
              display: 'inline-flex'
            }}>
              <Typography sx={{ 
                alignSelf: 'stretch', 
                color: '#000D17', 
                fontSize: 21, 
                fontFamily: 'Geologica', 
                fontWeight: '600', 
                wordWrap: 'break-word'
              }}>
                Allow comments on your Aests
              </Typography>
              <Typography sx={{ 
                alignSelf: 'stretch', 
                color: '#000D17', 
                fontSize: 21, 
                fontFamily: 'Geologica', 
                fontWeight: '400', 
                wordWrap: 'break-word'
              }}>
                Comments are on by default for all your Aests, new and existing.
              </Typography>
            </Box>
            <ToggleSwitch 
              $enabled={settings.allowComments}
              onClick={() => handleCommentToggle('allowComments')}
            >
              <ToggleKnob />
            </ToggleSwitch>
          </Box>

          {/* Filter comments on my Aests */}
          <Box sx={{ 
            alignSelf: 'stretch', 
            justifyContent: 'center', 
            alignItems: 'center', 
            gap: 5, 
            display: 'inline-flex'
          }}>
            <Box sx={{ 
              flex: '1 1 0', 
              flexDirection: 'column', 
              justifyContent: 'flex-start', 
              alignItems: 'flex-start', 
              gap: 2, 
              display: 'inline-flex'
            }}>
              <Typography sx={{ 
                alignSelf: 'stretch', 
                color: '#000D17', 
                fontSize: 21, 
                fontFamily: 'Geologica', 
                fontWeight: '600', 
                wordWrap: 'break-word'
              }}>
                Filter comments on my Aests
              </Typography>
              <Typography sx={{ 
                alignSelf: 'stretch', 
                color: '#000D17', 
                fontSize: 21, 
                fontFamily: 'Geologica', 
                fontWeight: '400', 
                wordWrap: 'break-word'
              }}>
                Hide comments on your Aests that include certain words or phrases.
              </Typography>
            </Box>
            <ToggleSwitch 
              $enabled={settings.filterMyComments}
              onClick={() => handleCommentToggle('filterMyComments')}
            >
              <ToggleKnob />
            </ToggleSwitch>
          </Box>

          {/* Filter comments on others' Aests */}
          <Box sx={{ 
            alignSelf: 'stretch', 
            justifyContent: 'center', 
            alignItems: 'center', 
            gap: 5, 
            display: 'inline-flex'
          }}>
            <Box sx={{ 
              flex: '1 1 0', 
              flexDirection: 'column', 
              justifyContent: 'flex-start', 
              alignItems: 'flex-start', 
              gap: 2, 
              display: 'inline-flex'
            }}>
              <Typography sx={{ 
                alignSelf: 'stretch', 
                color: '#000D17', 
                fontSize: 21, 
                fontFamily: 'Geologica', 
                fontWeight: '600', 
                wordWrap: 'break-word'
              }}>
                Filter comments on others' Aests
              </Typography>
              <Typography sx={{ 
                alignSelf: 'stretch', 
                color: '#000D17', 
                fontSize: 21, 
                fontFamily: 'Geologica', 
                fontWeight: '400', 
                wordWrap: 'break-word'
              }}>
                Hide comments on others' Aests with certain words or phrases.
              </Typography>
            </Box>
            <ToggleSwitch 
              $enabled={settings.filterOthersComments}
              onClick={() => handleCommentToggle('filterOthersComments')}
            >
              <ToggleKnob />
            </ToggleSwitch>
          </Box>

          {/* Keyword filter button */}
          <StyledButton onClick={handleKeywordFilterClick}>
            Keyword filter
          </StyledButton>
        </StyledCard>
      </Box>

      {/* Keyword Filter Modal */}
      <KeywordFilterModal 
        open={showKeywordModal} 
        onClose={() => setShowKeywordModal(false)} 
      />

      {/* Blacklist Modal */}
      <BlacklistModal 
        open={showBlacklistModal} 
        onClose={() => setShowBlacklistModal(false)} 
      />
      
      {/* Тестовий компонент - видалити після тестування */}
      <SocialPermissionsTest />
    </Box>
  );
};

export default SocialPermissionsSection;
