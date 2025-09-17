import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Dialog, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import styled from 'styled-components';
import securityApi from '../../services/securityApi';

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

const StyledButton = styled(Button)`
  align-self: stretch;
  padding: 16px 24px;
  background: #D7E0F4;
  border-radius: 100px;
  color: #000D17;
  font-size: 21px;
  font-family: Geologica;
  font-weight: 400;
  text-transform: none;
  
  &:hover {
    background: #CBD7F1;
  }
`;

const StyledModal = styled(Box)`
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
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  outline: none;
`;

const StyledModalHeader = styled(Box)`
  width: 100%;
  max-width: 768px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StyledModalTitle = styled(Typography)`
  color: #011D35;
  font-size: 28px;
  font-family: Geologica;
  font-weight: 600;
  word-wrap: break-word;
`;

const StyledCloseButton = styled(IconButton)`
  width: 40px;
  height: 40px;
  color: #01233F;
`;

const StyledEmptyMessage = styled(Box)`
  align-self: stretch;
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  color: #52697C;
  font-size: 21px;
  font-family: Geologica;
  font-weight: 400;
  word-wrap: break-word;
`;

const StyledSessionsList = styled(Box)`
  align-self: stretch;
  flex: 1;
  overflow: hidden;
  display: flex;
  gap: 20px;
`;

const StyledSessionsContent = styled(Box)`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 40px;
  overflow-y: auto;
  padding-right: 20px;
`;

const StyledSessionCard = styled(Box)`
  width: 100%;
  max-width: 768px;
  padding: 24px;
  border-radius: 40px;
  border: 1px solid #B4C6EB;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const StyledSessionInfo = styled(Box)`
  display: flex;
  align-items: center;
  gap: 40px;
`;

const StyledSessionDetails = styled(Box)`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const StyledSessionField = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const StyledFieldLabel = styled(Typography)`
  color: black;
  font-size: 21px;
  font-family: Geologica;
  font-weight: 600;
  word-wrap: break-word;
`;

const StyledFieldValue = styled(Typography)`
  color: black;
  font-size: 21px;
  font-family: Geologica;
  font-weight: 400;
  word-wrap: break-word;
`;

const StyledCurrentDeviceLabel = styled(Typography)`
  color: #6F91D9;
  font-size: 21px;
  font-family: Geologica;
  font-weight: 600;
  word-wrap: break-word;
`;

const StyledEndActivityButton = styled(Button)`
  width: 227px;
  padding: 16px 24px;
  background: #D7E0F4;
  border-radius: 100px;
  color: #000D17;
  font-size: 21px;
  font-family: Geologica;
  font-weight: 400;
  text-transform: none;
  
  &:hover {
    background: #CBD7F1;
  }
`;

const SecuritySection = () => {
  const [settings, setSettings] = useState({
    googleLoginEnabled: true,
    facebookLoginEnabled: false,
    appleLoginEnabled: false,
    twoFactorEnabled: false,
    smsBackupEnabled: false,
    emailBackupEnabled: true,
    loginNotificationsEnabled: true,
    suspiciousActivityNotifications: true,
    passwordChangeNotifications: true,
    showOnlineStatus: true,
    allowPasswordReset: true
  });

  const [sessions, setSessions] = useState([]);
  const [connectedApps, setConnectedApps] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSessionsModal, setShowSessionsModal] = useState(false);
  const [showAppsModal, setShowAppsModal] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [settingsResponse, sessionsResponse, appsResponse] = await Promise.all([
          securityApi.getSecuritySettings(),
          securityApi.getUserSessions(),
          securityApi.getConnectedApps()
        ]);
        
        if (settingsResponse && settingsResponse.success) {
          setSettings(settingsResponse.payload || settingsResponse.data || settingsResponse);
        }
        
        if (sessionsResponse && sessionsResponse.success) {
          setSessions(sessionsResponse.payload || sessionsResponse.data || []);
        }
        
        if (appsResponse && appsResponse.success) {
          setConnectedApps(appsResponse.payload || appsResponse.data || []);
        }
      } catch (error) {
        console.error('Error loading security data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const saveSettings = async () => {
        try {
          setIsSaving(true);
          await securityApi.updateSecuritySettings(settings);
        } catch (error) {
          console.error('Error saving security settings:', error);
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

  const handleRevokeSession = async (sessionId) => {
    try {
      await securityApi.revokeSession(sessionId);
      setSessions(prev => prev.filter(session => session.id !== sessionId));
    } catch (error) {
      console.error('Error revoking session:', error);
    }
  };

  const handleRevokeAllOtherSessions = async () => {
    try {
      await securityApi.revokeAllOtherSessions();
      setSessions(prev => prev.filter(session => session.isCurrent));
    } catch (error) {
      console.error('Error revoking all other sessions:', error);
    }
  };

  const handleRevokeAppAccess = async (appId) => {
    try {
      await securityApi.revokeAppAccess(appId);
      setConnectedApps(prev => prev.filter(app => app.id !== appId));
    } catch (error) {
      console.error('Error revoking app access:', error);
    }
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
        <StyledMainTitle>Security</StyledMainTitle>
        <StyledMainDescription>
          Keep your account secure by checking your connected devices etc.
        </StyledMainDescription>
      </Box>

      {/* Cards */}
      <Box sx={{ 
        width: '100%', 
        maxWidth: '1721px',
        justifyContent: 'flex-start', 
        alignItems: 'flex-start', 
        gap: '25px', 
        display: 'flex',
        flexWrap: 'wrap'
      }}>
        {/* Login Options */}
        <StyledCard>
          <StyledTitle>Login options</StyledTitle>
          <StyledDescription>
            Use your social account to log in to Pinterest.
          </StyledDescription>
          <ToggleRow label="Use your Google account to log in" settingName="googleLoginEnabled" />
        </StyledCard>

        {/* App Logins */}
        <StyledCard>
          <StyledTitle>App logins</StyledTitle>
          <StyledDescription>
            Keep track of everywhere you've logged in with your Aestify profile and remove access from apps you're no longer using with Aestify.
          </StyledDescription>
          <StyledButton
            onClick={() => setShowAppsModal(true)}
          >
            Manage app logins
          </StyledButton>
        </StyledCard>

        {/* Connected Devices */}
        <StyledCard>
          <StyledTitle>Connected devices</StyledTitle>
          <StyledDescription>
            This is a list of devices that have logged in to your account. Revoke access to any devices you don't recognise.
          </StyledDescription>
          <StyledButton
            onClick={() => setShowSessionsModal(true)}
          >
            Show sessions
          </StyledButton>
        </StyledCard>
      </Box>

      {/* Sessions Modal */}
      <Dialog 
        open={showSessionsModal} 
        onClose={() => setShowSessionsModal(false)}
        maxWidth={false}
        PaperProps={{
          sx: { background: 'transparent', boxShadow: 'none', overflow: 'visible' }
        }}
      >
        <StyledModal sx={{ paddingRight: '20px' }}>
          <StyledModalHeader>
            <StyledModalTitle>Active sessions</StyledModalTitle>
            <StyledCloseButton onClick={() => setShowSessionsModal(false)}>
              <CloseIcon />
            </StyledCloseButton>
          </StyledModalHeader>
          
          <StyledSessionsList>
            <StyledSessionsContent>
              {sessions.map((session) => (
                <StyledSessionCard key={session.id}>
                  <StyledSessionInfo>
                    <StyledSessionDetails>
                      {session.isCurrent && (
                        <StyledSessionField>
                          <StyledCurrentDeviceLabel>Current device</StyledCurrentDeviceLabel>
                        </StyledSessionField>
                      )}
                      
                      <StyledSessionField>
                        <StyledFieldLabel>Last accessed:</StyledFieldLabel>
                        <StyledFieldValue>
                          {new Date(session.lastActivityAt).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </StyledFieldValue>
                      </StyledSessionField>

                      <StyledSessionField>
                        <StyledFieldLabel>Location:</StyledFieldLabel>
                        <StyledFieldValue>
                          {session.location || 'Unknown'}<br/>
                          (approximate, based on IP = {session.ipAddress || 'Unknown'})
                        </StyledFieldValue>
                      </StyledSessionField>

                      <StyledSessionField>
                        <StyledFieldLabel>Device type:</StyledFieldLabel>
                        <StyledFieldValue>
                          {session.browser || 'Unknown'} on {session.operatingSystem || 'Unknown'}
                        </StyledFieldValue>
                      </StyledSessionField>
                    </StyledSessionDetails>

                    {!session.isCurrent && (
                      <StyledEndActivityButton
                        onClick={() => handleRevokeSession(session.id)}
                      >
                        End activity
                      </StyledEndActivityButton>
                    )}
                  </StyledSessionInfo>
                </StyledSessionCard>
              ))}
            </StyledSessionsContent>
            
            {/* Custom scrollbar placeholder */}
            <Box sx={{ 
              width: '17px', 
              background: '#F1F1F1', 
              borderRadius: '8px',
              minHeight: '100px'
            }} />
          </StyledSessionsList>
        </StyledModal>
      </Dialog>

      {/* Connected Apps Modal */}
      <Dialog 
        open={showAppsModal} 
        onClose={() => setShowAppsModal(false)}
        maxWidth={false}
        PaperProps={{
          sx: { background: 'transparent', boxShadow: 'none', overflow: 'visible' }
        }}
      >
        <StyledModal>
          <StyledModalHeader>
            <StyledModalTitle>App logins</StyledModalTitle>
            <StyledCloseButton onClick={() => setShowAppsModal(false)}>
              <CloseIcon />
            </StyledCloseButton>
          </StyledModalHeader>
          
          <StyledEmptyMessage>
            You have not approved any apps
          </StyledEmptyMessage>
        </StyledModal>
      </Dialog>

      {isSaving && (
        <Typography sx={{ color: '#6F91D9', fontSize: '14px' }}>
          Saving...
        </Typography>
      )}
    </Box>
  );
};

export default SecuritySection;
