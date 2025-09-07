import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Box, 
  Typography, 
  CircularProgress, 
  Alert,
  Chip,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { 
  AccountBalanceWallet, 
  Error as ErrorIcon,
  CheckCircle,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useWeb3 } from '../../contexts/Web3Context';
import { useNFTAuth } from '@/hooks/useNFTAuth';
import { BLOCKCHAIN_CONFIG } from '../../config/blockchain';
import { toast } from 'react-toastify';

const WalletConnection = ({ onConnect, showBalance = true, variant = 'contained' }) => {
  const { 
    account, 
    balance, 
    chainId, 
    isConnecting, 
    isConnected, 
    isPolygon,
    connect, 
    disconnect, 
    switchToPolygon,
    formatAddress,
    formatMatic
  } = useWeb3();
  
  const { 
    isAuthenticated, 
    login, 
    logout, 
    isLoading: authLoading 
  } = useNFTAuth();

  const [showDetails, setShowDetails] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);



  const handleConnect = async () => {
    try {
      const connectedAddress = await connect();
      toast.success(`Гаманець підключено: ${formatAddress(connectedAddress)}`);
      
      if (onConnect) {
        onConnect(connectedAddress);
      }

 
      if (!isAuthenticated) {
        try {
          await login();
        } catch (e) {
          console.error('Auto-auth after wallet connect failed:', e);

        }
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
      toast.error(error.message || 'Помилка підключення гаманця');
    }
  };

  const handleDisconnect = () => {
    disconnect();
    toast.info('Гаманець відключено');
  };

  const handleAuthenticate = async () => {
    if (!isConnected) {
      toast.error('Спочатку підключіть гаманець');
      return;
    }

    setIsAuthenticating(true);
    
    try {
      await login();
      toast.success('Автентифікація успішна!');
    } catch (error) {
      console.error('Authentication error:', error);
      toast.error(error.message || 'Помилка автентифікації');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSwitchNetwork = async () => {
    try {
      await switchToPolygon();
      toast.success('Мережу переключено на Polygon');
    } catch (error) {
      console.error('Network switch error:', error);
      toast.error('Помилка перемикання мережі');
    }
  };


  if (!isConnected) {
    return (
      <Button
        variant={variant}
        onClick={handleConnect}
        disabled={isConnecting}
        startIcon={isConnecting ? <CircularProgress size={20} /> : <AccountBalanceWallet />}
        sx={{ minWidth: 200 }}
      >
        {isConnecting ? 'Підключення...' : 'Підключити гаманець'}
      </Button>
    );
  }


  if (!isPolygon) {
    return (
      <Box>
        <Alert 
          severity="warning" 
          action={
            <Button color="inherit" size="small" onClick={handleSwitchNetwork}>
              Переключити
            </Button>
          }
        >
          Необхідно переключитися на мережу Polygon
        </Alert>
      </Box>
    );
  }


  if (isConnected && !isAuthenticated) {
    return (
      <Box>
        <Alert 
          severity="info"
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={handleAuthenticate}
              disabled={isAuthenticating || authLoading}
            >
              {isAuthenticating || authLoading ? <CircularProgress size={16} /> : 'Увійти'}
            </Button>
          }
        >
          Підпишіть повідомлення для автентифікації
        </Alert>
      </Box>
    );
  }


  return (
    <Box>
      <Card variant="outlined" sx={{ minWidth: 300 }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Box display="flex" alignItems="center" gap={1}>
              <CheckCircle color="success" fontSize="small" />
              <Typography variant="subtitle2" color="success.main">
                Підключено
              </Typography>
            </Box>
            <Button size="small" onClick={() => setShowDetails(true)}>
              Деталі
            </Button>
          </Box>

          <Box mb={2}>
            <Typography variant="body2" color="text.secondary">
              Адреса гаманця:
            </Typography>
            <Typography variant="body1" fontFamily="monospace">
              {formatAddress(account)}
            </Typography>
          </Box>

          {showBalance && (
            <Box mb={2}>
              <Typography variant="body2" color="text.secondary">
                Баланс:
              </Typography>
              <Typography variant="h6" color="primary">
                {formatMatic(balance)} MATIC
              </Typography>
            </Box>
          )}

          <Box display="flex" gap={1} flexWrap="wrap">
            <Chip 
              label="Polygon" 
              color="success" 
              size="small" 
              icon={<CheckCircle fontSize="small" />}
            />
            {isAuthenticated && (
              <Chip 
                label="Автентифіковано" 
                color="primary" 
                size="small" 
                icon={<CheckCircle fontSize="small" />}
              />
            )}
          </Box>

          <Box mt={2}>
            <Button 
              variant="outlined" 
              color="error" 
              size="small" 
              onClick={handleDisconnect}
              fullWidth
            >
              Відключити гаманець
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Dialog open={showDetails} onClose={() => setShowDetails(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Деталі підключення</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2}>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Адреса гаманця:
              </Typography>
              <Typography variant="body2" fontFamily="monospace" sx={{ wordBreak: 'break-all' }}>
                {account}
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Мережа:
              </Typography>
              <Typography variant="body2">
                {BLOCKCHAIN_CONFIG.POLYGON_CHAIN_NAME} (ID: {chainId})
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Баланс:
              </Typography>
              <Typography variant="body2">
                {balance} MATIC
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Статус автентифікації:
              </Typography>
              <Chip 
                label={isAuthenticated ? 'Автентифіковано' : 'Не автентифіковано'}
                color={isAuthenticated ? 'success' : 'warning'}
                icon={isAuthenticated ? <CheckCircle /> : <WarningIcon />}
              />
            </Box>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Контракт маркетплейсу:
              </Typography>
              <Typography variant="body2" fontFamily="monospace" sx={{ wordBreak: 'break-all' }}>
                {BLOCKCHAIN_CONFIG.NFT_MARKETPLACE_ADDRESS}
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDetails(false)}>Закрити</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WalletConnection;