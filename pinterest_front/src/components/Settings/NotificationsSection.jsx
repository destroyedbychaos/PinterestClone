import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import styled from 'styled-components';
import notificationSettingsApi from '../../services/notificationSettingsApi';

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

const StyledTitle = styled(Typography)`
  color: #000D17;
  font-size: 28px;
  font-family: Geologica;
  font-weight: 600;
  word-wrap: break-word;
`;

const StyledSubtitle = styled(Typography)`
  color: #000D17;
  font-size: 21px;
  font-family: Geologica;
  font-weight: 600;
  word-wrap: break-word;
`;

const StyledDescription = styled(Typography)`
  color: #000D17;
  font-size: 21px;
  font-family: Geologica;
  font-weight: 400;
  word-wrap: break-word;
`;

const StyledToggleLabel = styled(Typography)`
  color: #000D17;
  font-size: 21px;
  font-family: Geologica;
  font-weight: 400;
  word-wrap: break-word;
`;

const StyledMainTitle = styled(Typography)`
  color: #000D17;
  font-size: 38px;
  font-family: Geologica;
  font-weight: 700;
  text-align: center;
  word-wrap: break-word;
`;

const StyledMainDescription = styled(Typography)`
  color: #52697C;
  font-size: 21px;
  font-family: Geologica;
  font-weight: 400;
  text-align: center;
  word-wrap: break-word;
`;

const NotificationsSection = () => {
  const [settings, setSettings] = useState({
    // Default values matching backend defaults
    savesPush: true,
    savesInApp: true,
    likesPush: true,
    likesInApp: true,
    commentsPush: true,
    commentsInApp: true,
    commentInteractionsPush: true,
    commentInteractionsInApp: true,
    mentionsPush: true,
    mentionsInApp: true,
    remindersPush: false,
    remindersInApp: false,
    newAestsFromFollowedPush: true,
    newAestsFromFollowedInApp: false,
    newAestsFromSuggestedPush: false,
    newAestsFromSuggestedInApp: false,
    boardRecommendationsPush: true,
    boardRecommendationsInApp: true,
    boardRecommendationsEmail: false,
    searchRecommendationsPush: true,
    searchRecommendationsInApp: true,
    searchRecommendationsEmail: false,
    aestsInspiredByActivityPush: false,
    aestsInspiredByActivityInApp: false,
    aestsInspiredByActivityEmail: false,
    aestsPickedForYouPush: true,
    aestsPickedForYouInApp: true,
    aestsPickedForYouEmail: true,
    popularAestsPush: false,
    popularAestsInApp: false,
    popularAestsEmail: true,
    groupBoardUpdatesPush: false,
    groupBoardUpdatesInApp: false,
    groupBoardUpdatesEmail: true,
    groupBoardInvitationsPush: true,
    groupBoardInvitationsInApp: true,
    groupBoardInvitationsEmail: false,
    messagesPush: true,
    messagesInApp: true,
    aestifyAnnouncementsEmail: true,
    surveysAndQuizzesEmail: true,
    reportsAndViolationsEmail: true,
    pushEnabled: true,
    browserPushEnabled: true,
    inAppEnabled: true,
    emailEnabled: false
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        const response = await notificationSettingsApi.getNotificationSettings();
        
        if (response && response.success && response.payload) {
          setSettings(response.payload);
        } else if (response && response.success && response.data) {
          setSettings(response.data);
        } else if (response) {
          setSettings(response);
        }
      } catch (error) {
        console.error('Error loading notification settings:', error);
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
          await notificationSettingsApi.updateNotificationSettings(settings);
        } catch (error) {
          console.error('Error saving notification settings:', error);
        } finally {
          setIsSaving(false);
        }
      };

      const timeoutId = setTimeout(saveSettings, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [settings, isLoading]);

  const handleToggle = (settingName) => {
    setSettings(prev => ({
      ...prev,
      [settingName]: !prev[settingName]
    }));
  };

  const ToggleRow = ({ label, settingName }) => (
    <Box sx={{ 
      alignSelf: 'stretch', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      display: 'flex'
    }}>
      <StyledToggleLabel>{label}</StyledToggleLabel>
      <ToggleSwitch 
        $enabled={settings[settingName]}
        onClick={() => handleToggle(settingName)}
      >
        <ToggleKnob />
      </ToggleSwitch>
    </Box>
  );

  const NotificationGroup = ({ title, description, children }) => (
    <Box sx={{ 
      alignSelf: 'stretch', 
      flexDirection: 'column', 
      justifyContent: 'flex-start', 
      alignItems: 'flex-start', 
      gap: 3, 
      display: 'flex'
    }}>
      <Box sx={{ 
        alignSelf: 'stretch', 
        flexDirection: 'column', 
        justifyContent: 'flex-start', 
        alignItems: 'flex-start', 
        gap: 2, 
        display: 'flex'
      }}>
        <StyledSubtitle>{title}</StyledSubtitle>
        <StyledDescription>{description}</StyledDescription>
      </Box>
      <Box sx={{ 
        alignSelf: 'stretch', 
        flexDirection: 'column', 
        justifyContent: 'flex-start', 
        alignItems: 'flex-start', 
        gap: 2, 
        display: 'flex'
      }}>
        {children}
      </Box>
    </Box>
  );

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      width: '100%', 
      flexDirection: 'column', 
      justifyContent: 'flex-start', 
      alignItems: 'center', 
      gap: 3, 
      display: 'flex'
    }}>
      {/* Header */}
      <Box sx={{ 
        flexDirection: 'column', 
        justifyContent: 'flex-start', 
        alignItems: 'center', 
        gap: 3, 
        display: 'flex'
      }}>
        <StyledMainTitle>Notifications</StyledMainTitle>
        <StyledMainDescription>
          We'll always keep you updated on important changes.<br/>
          You can choose what other information you'd like to receive.
        </StyledMainDescription>
      </Box>

      {/* Cards Grid */}
      <Box sx={{ 
        width: '100%', 
        maxWidth: '1721px',
        flexDirection: 'column', 
        justifyContent: 'flex-start', 
        alignItems: 'flex-start', 
        gap: 3, 
        display: 'flex'
      }}>
        {/* First Row */}
        <Box sx={{ 
          alignSelf: 'stretch', 
          justifyContent: 'flex-start', 
          alignItems: 'flex-start', 
          gap: '25px', 
          display: 'flex',
          flexWrap: 'wrap'
        }}>
          {/* Aests you created */}
          <StyledCard>
            <StyledTitle>Aests you created</StyledTitle>
            
            <NotificationGroup
              title="Saves"
              description="Get notified when someone saves an Aest you created"
            >
              <ToggleRow label="Push" settingName="savesPush" />
              <ToggleRow label="In-app" settingName="savesInApp" />
            </NotificationGroup>

            <NotificationGroup
              title="Likes"
              description="Get notified when someone likes an Aest you created"
            >
              <ToggleRow label="Push" settingName="likesPush" />
              <ToggleRow label="In-app" settingName="likesInApp" />
            </NotificationGroup>

            <NotificationGroup
              title="Comments"
              description="Get notified when someone comments on an Aest you created."
            >
              <ToggleRow label="Push" settingName="commentsPush" />
              <ToggleRow label="In-app" settingName="commentsInApp" />
            </NotificationGroup>
          </StyledCard>

          {/* Someone's Aests */}
          <StyledCard>
            <StyledTitle>Someone's Aests</StyledTitle>
            
            <NotificationGroup
              title="Comments"
              description="Get notified when someone likes or replies to your comment"
            >
              <ToggleRow label="Push" settingName="commentInteractionsPush" />
              <ToggleRow label="In-app" settingName="commentInteractionsInApp" />
            </NotificationGroup>

            <NotificationGroup
              title="Mentions"
              description="Get notified when someone mentions you in a comment"
            >
              <ToggleRow label="Push" settingName="mentionsPush" />
              <ToggleRow label="In-app" settingName="mentionsInApp" />
            </NotificationGroup>

            <NotificationGroup
              title="Reminders"
              description="Get notified to rediscover your saved Aests"
            >
              <ToggleRow label="Push" settingName="remindersPush" />
              <ToggleRow label="In-app" settingName="remindersInApp" />
            </NotificationGroup>
          </StyledCard>

          {/* Activity from creators */}
          <StyledCard>
            <StyledTitle>Activity from creators</StyledTitle>
            
            <NotificationGroup
              title="New Aests from creators you follow"
              description="Get notified when a creator you follow posts new Pins"
            >
              <ToggleRow label="Push" settingName="newAestsFromFollowedPush" />
              <ToggleRow label="In-app" settingName="newAestsFromFollowedInApp" />
            </NotificationGroup>

            <NotificationGroup
              title="New Aests from creators you might like"
              description="Find out about new Aests from suggested creators"
            >
              <ToggleRow label="Push" settingName="newAestsFromSuggestedPush" />
              <ToggleRow label="In-app" settingName="newAestsFromSuggestedInApp" />
            </NotificationGroup>
          </StyledCard>
        </Box>

        {/* Second Row */}
        <Box sx={{ 
          alignSelf: 'stretch', 
          justifyContent: 'flex-start', 
          alignItems: 'flex-start', 
          gap: '25px', 
          display: 'flex',
          flexWrap: 'wrap'
        }}>
          {/* Boards and searches */}
          <StyledCard>
            <StyledTitle>Boards and searches</StyledTitle>
            
            <NotificationGroup
              title="Boards you might like"
              description="Get board recommendations"
            >
              <ToggleRow label="Push" settingName="boardRecommendationsPush" />
              <ToggleRow label="In-app" settingName="boardRecommendationsInApp" />
              <ToggleRow label="E-mail" settingName="boardRecommendationsEmail" />
            </NotificationGroup>

            <NotificationGroup
              title="Searches you might like"
              description="Get personalised search terms to help you discover more of what you love"
            >
              <ToggleRow label="Push" settingName="searchRecommendationsPush" />
              <ToggleRow label="In-app" settingName="searchRecommendationsInApp" />
              <ToggleRow label="E-mail" settingName="searchRecommendationsEmail" />
            </NotificationGroup>
          </StyledCard>

          {/* Aests recommendations */}
          <StyledCard>
            <StyledTitle>Aests recommendations</StyledTitle>
            
            <NotificationGroup
              title="Aests inspired by your recent activity"
              description="Get a round-up of top home feed content you might have missed"
            >
              <ToggleRow label="Push" settingName="aestsInspiredByActivityPush" />
              <ToggleRow label="In-app" settingName="aestsInspiredByActivityInApp" />
              <ToggleRow label="E-mail" settingName="aestsInspiredByActivityEmail" />
            </NotificationGroup>

            <NotificationGroup
              title="Aests picked for you"
              description="Get Aest recommendations based on your activity, interests and boards"
            >
              <ToggleRow label="Push" settingName="aestsPickedForYouPush" />
              <ToggleRow label="In-app" settingName="aestsPickedForYouInApp" />
              <ToggleRow label="E-mail" settingName="aestsPickedForYouEmail" />
            </NotificationGroup>

            <NotificationGroup
              title="Popular Aests"
              description="Get Aest recommendations for what's popular in your interests"
            >
              <ToggleRow label="Push" settingName="popularAestsPush" />
              <ToggleRow label="In-app" settingName="popularAestsInApp" />
              <ToggleRow label="E-mail" settingName="popularAestsEmail" />
            </NotificationGroup>
          </StyledCard>

          {/* Social */}
          <StyledCard>
            <StyledTitle>Social</StyledTitle>
            
            <NotificationGroup
              title="Group board updates"
              description="Get notified about group board activity"
            >
              <ToggleRow label="Push" settingName="groupBoardUpdatesPush" />
              <ToggleRow label="In-app" settingName="groupBoardUpdatesInApp" />
              <ToggleRow label="E-mail" settingName="groupBoardUpdatesEmail" />
            </NotificationGroup>

            <NotificationGroup
              title="Group board invitations"
              description="Get notified when you send or receive an invitation to join a group board"
            >
              <ToggleRow label="Push" settingName="groupBoardInvitationsPush" />
              <ToggleRow label="In-app" settingName="groupBoardInvitationsInApp" />
              <ToggleRow label="E-mail" settingName="groupBoardInvitationsEmail" />
            </NotificationGroup>

            <NotificationGroup
              title="Messages"
              description="Get notified when someone sends you a message"
            >
              <ToggleRow label="Push" settingName="messagesPush" />
              <ToggleRow label="In-app" settingName="messagesInApp" />
            </NotificationGroup>
          </StyledCard>
        </Box>

        {/* Third Row */}
        <Box sx={{ 
          justifyContent: 'flex-start', 
          alignItems: 'flex-start', 
          gap: '25px', 
          display: 'flex',
          flexWrap: 'wrap'
        }}>
          {/* Others */}
          <StyledCard>
            <StyledTitle>Others</StyledTitle>
            
            <NotificationGroup
              title="Aestify announcements"
              description="Stay up to date with the latest Aestify news"
            >
              <ToggleRow label="E-mail" settingName="aestifyAnnouncementsEmail" />
            </NotificationGroup>

            <NotificationGroup
              title="Surveys and quizzes"
              description="Participate in surveys and quizzes to improve the Aestify experience"
            >
              <ToggleRow label="E-mail" settingName="surveysAndQuizzesEmail" />
            </NotificationGroup>

            <NotificationGroup
              title="Reports and violations centre updates"
              description="Get updates on reports and violations for your content and content you've reported"
            >
              <ToggleRow label="E-mail" settingName="reportsAndViolationsEmail" />
            </NotificationGroup>
          </StyledCard>

          {/* Permissions */}
          <StyledCard>
            <StyledTitle>Permissions</StyledTitle>
            <StyledDescription>
              Aestify will always send you important updates about your account.
            </StyledDescription>
            
            <Box sx={{ 
              alignSelf: 'stretch', 
              flexDirection: 'column', 
              justifyContent: 'flex-start', 
              alignItems: 'flex-start', 
              gap: 2, 
              display: 'flex'
            }}>
              <ToggleRow label="Push" settingName="pushEnabled" />
              <ToggleRow label="Browser push" settingName="browserPushEnabled" />
              <Box sx={{ 
                alignSelf: 'stretch', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                display: 'flex'
              }}>
                <StyledToggleLabel sx={{ flex: '1 1 0' }}>
                  Chrome users can activate browser notifications when push is turned on
                </StyledToggleLabel>
                <ToggleSwitch 
                  $enabled={settings.browserPushEnabled}
                  onClick={() => handleToggle('browserPushEnabled')}
                >
                  <ToggleKnob />
                </ToggleSwitch>
              </Box>
              <ToggleRow label="In-app" settingName="inAppEnabled" />
              <ToggleRow label="E-mail" settingName="emailEnabled" />
            </Box>
          </StyledCard>
        </Box>
      </Box>

      {isSaving && (
        <Typography sx={{ color: '#6F91D9', fontSize: '14px' }}>
          Saving...
        </Typography>
      )}
    </Box>
  );
};

export default NotificationsSection;
