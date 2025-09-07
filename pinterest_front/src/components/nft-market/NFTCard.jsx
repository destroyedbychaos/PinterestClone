import React, { useState } from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Tooltip
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  MoreVert,
  Sell,
  RemoveShoppingCart,
  ShoppingCart,
  Edit,
  Delete,
  Share,
  OpenInNew
} from '@mui/icons-material';
import { useNFT } from '../../hooks/useNFT';
import { useMarketplace } from '../../hooks/useMarketplace';
import { useNFTAuth } from '@/hooks/useNFTAuth';
import { useWeb3 } from '../../contexts/Web3Context';
import { BLOCKCHAIN_CONFIG } from '../../config/blockchain';
import { toast } from 'react-toastify';
import { getFullImageUrl, handleImageError } from '../../utils/imageUtils';

const NFTCard = ({ nft, isOwner = false, onUpdate, showActions = true, showManageActions = false }) => {
  const { addToFavorites, removeFromFavorites, deleteNFT, isLoading: nftLoading } = useNFT();
  const { listNFTForSale, delistNFT, buyNFT, isLoading: marketplaceLoading } = useMarketplace();
  const { isAuthenticated } = useNFTAuth();
  const { isConnected, formatAddress, account } = useWeb3();

  const [isFavorite, setIsFavorite] = useState(nft.isFavorite || false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [showSellDialog, setShowSellDialog] = useState(false);
  const [showBuyDialog, setShowBuyDialog] = useState(false);
  const [sellPrice, setSellPrice] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isForSale = nft.isForSale || nft.isListed;
  const isMinted = nft.isMinted || false;
  const canBuy = isForSale && !isOwner && isAuthenticated && isMinted;
  // Кнопки продажу тільки якщо дозволено управління (в профілі)
  const canSell = showManageActions && isOwner && !isForSale && isAuthenticated && isMinted;
  const canDelist = showManageActions && isOwner && isForSale && isAuthenticated && isMinted;

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleFavoriteToggle = async () => {
    if (!isAuthenticated || !account) {
      toast.error('Увійдіть для додавання в улюблені');
      return;
    }

    try {
      if (isFavorite) {
        await removeFromFavorites(account, nft.id);
        setIsFavorite(false);
        toast.success('Видалено з улюблених');
      } else {
        await addToFavorites(account, nft.id);
        setIsFavorite(true);
        toast.success('Додано в улюблені');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Помилка оновлення улюблених');
    }
  };

  const handleSell = async () => {
    if (!sellPrice || parseFloat(sellPrice) <= 0) {
      toast.error('Вкажіть правильну ціну');
      return;
    }

    setIsLoading(true);
    try {
      await listNFTForSale(nft.id, nft.tokenId, parseFloat(sellPrice));
      toast.success('NFT виставлено на продаж');
      setShowSellDialog(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error listing NFT:', error);
      toast.error(error.message || 'Помилка виставлення на продаж');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelist = async () => {
    setIsLoading(true);
    try {
      await delistNFT(nft.id, nft.tokenId);
      toast.success('NFT знято з продажу');
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error delisting NFT:', error);
      toast.error(error.message || 'Помилка зняття з продажу');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuy = async () => {
    setIsLoading(true);
    try {
      await buyNFT(nft.id, nft.tokenId, nft.price);
      toast.success('NFT успішно куплено!');
      setShowBuyDialog(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error buying NFT:', error);
      toast.error(error.message || 'Помилка покупки NFT');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Ви впевнені, що хочете видалити цей NFT?')) {
      try {
        await deleteNFT(nft.id, false);
        toast.success('NFT видалено');
        if (onUpdate) onUpdate();
      } catch (error) {
        console.error('Error deleting NFT:', error);
        toast.error(error.message || 'Помилка видалення NFT');
      }
    }
    handleMenuClose();
  };

  const handleShare = () => {
    const url = `${window.location.origin}/nft/${nft.id}`;
    navigator.clipboard.writeText(url);
    toast.success('Посилання скопійовано');
    handleMenuClose();
  };

  const handleOpenInExplorer = () => {
    if (nft.tokenId) {
      const url = `${BLOCKCHAIN_CONFIG.POLYGON_BLOCK_EXPLORER}/token/${BLOCKCHAIN_CONFIG.NFT_MARKETPLACE_ADDRESS}?a=${nft.tokenId}`;
      window.open(url, '_blank');
    }
    handleMenuClose();
  };

  return (
    <>
      <Card sx={{ maxWidth: 345, position: 'relative', bgcolor: '#1f2937' }}>
        {/* Статус чипи */}
        <Box sx={{ position: 'absolute', top: 8, left: 8, zIndex: 1 }}>
          {isForSale && (
            <Chip 
              label="На продажі" 
              color="success" 
              size="small" 
              sx={{ mb: 1, display: 'block' }}
            />
          )}

        </Box>

        {/* Меню дій */}
        {showActions && (
          <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
            <IconButton
              onClick={handleFavoriteToggle}
              disabled={!isAuthenticated}
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.8)',
                mr: 1,
                '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
              }}
            >
              {isFavorite ? <Favorite color="error" /> : <FavoriteBorder />}
            </IconButton>
            
            <IconButton
              onClick={handleMenuOpen}
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.8)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
              }}
            >
              <MoreVert />
            </IconButton>
          </Box>
        )}

        <CardMedia
          component="img"
          height="300"
                      image={getFullImageUrl(nft.imageUrl)}
          alt={nft.name}
          sx={{ objectFit: 'cover' }}
        />

        <CardContent>
          <Typography gutterBottom variant="h6" component="div" noWrap>
            {nft.name}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {nft.description?.length > 100 
              ? `${nft.description.substring(0, 100)}...` 
              : nft.description
            }
          </Typography>

          {/* Ціна */}
          {isForSale && nft.price && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" color="primary">
                {nft.price} {nft.currency || 'MATIC'}
              </Typography>
            </Box>
          )}

          {/* Статус замінчення */}
          <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              label={isMinted ? "🎨 Замінчено" : "⏳ В процесі"}
              color={isMinted ? "success" : "warning"}
              size="small"
              variant={isMinted ? "filled" : "outlined"}
            />
            {isForSale && (
              <Chip
                label="🏪 На продажі"
                color="primary"
                size="small"
                variant="outlined"
              />
            )}
          </Box>

          {/* Інформація про власника */}
          <Typography variant="body2" color="text.secondary">
            Власник: {formatAddress(nft.ownerWalletAddress)}
          </Typography>

          {/* Роялті */}
          {nft.royaltyFraction && nft.royaltyFraction > 0 && (
            <Typography variant="body2" color="text.secondary">
              Роялті: {(nft.royaltyFraction / 100).toFixed(1)}%
            </Typography>
          )}
        </CardContent>

        {showActions && (
          <CardActions>
            {(canBuy || (isForSale && !isOwner && isAuthenticated && !isMinted)) && (
              <Tooltip 
                title={!isMinted ? "NFT ще не замінчений на блокчейні" : ""}
                placement="top"
              >
                <span style={{ width: '100%' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setShowBuyDialog(true)}
                    disabled={isLoading || marketplaceLoading || !isMinted}
                    startIcon={<ShoppingCart />}
                    fullWidth
                  >
                    Купити
                  </Button>
                </span>
              </Tooltip>
            )}

            {(canSell || (isOwner && !isForSale && isAuthenticated && !isMinted)) && (
              <Tooltip 
                title={!isMinted ? "NFT ще не замінчений на блокчейні" : ""}
                placement="top"
              >
                <span style={{ width: '100%' }}>
                  <Button
                    variant="outlined"
                    onClick={() => setShowSellDialog(true)}
                    disabled={isLoading || nftLoading || !isMinted}
                    startIcon={<Sell />}
                    fullWidth
                  >
                    Продати
                  </Button>
                </span>
              </Tooltip>
            )}

            {canDelist && (
              <Button
                variant="outlined"
                color="warning"
                onClick={handleDelist}
                disabled={isLoading || marketplaceLoading}
                startIcon={<RemoveShoppingCart />}
                fullWidth
              >
                Зняти з продажу
              </Button>
            )}

            {/* Показуємо повідомлення для незамінчених NFT */}
            {!isMinted && isOwner && (
              <Typography 
                variant="caption" 
                color="text.secondary" 
                sx={{ textAlign: 'center', width: '100%', mt: 1 }}
              >
                💡 NFT буде доступний для торгівлі після замінчення на блокчейні
              </Typography>
            )}

            {/* Показуємо повідомлення про управління в профілі */}
            {isOwner && isMinted && !showManageActions && (
              <Typography 
                variant="caption" 
                color="text.secondary" 
                sx={{ textAlign: 'center', width: '100%', mt: 1 }}
              >
                📝 Керування продажем доступне у вашому профілі
              </Typography>
            )}
          </CardActions>
        )}
      </Card>

      {/* Меню дій */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleShare}>
          <Share sx={{ mr: 1 }} />
          Поділитися
        </MenuItem>
        
        {nft.tokenId && (
          <MenuItem onClick={handleOpenInExplorer}>
            <OpenInNew sx={{ mr: 1 }} />
            Переглянути в explorer
          </MenuItem>
        )}
        
        {isOwner && (
          <MenuItem onClick={handleDelete}>
            <Delete sx={{ mr: 1 }} />
            Видалити
          </MenuItem>
        )}
      </Menu>

      {/* Діалог продажу */}
      <Dialog open={showSellDialog} onClose={() => setShowSellDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Виставити NFT на продаж</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Ціна"
            type="number"
            fullWidth
            variant="outlined"
            value={sellPrice}
            onChange={(e) => setSellPrice(e.target.value)}
            InputProps={{
              endAdornment: 'MATIC'
            }}
            sx={{ mb: 2 }}
          />
          
          <Alert severity="info">
            Буде стягнута комісія мережі за виставлення на продаж
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSellDialog(false)}>Скасувати</Button>
          <Button 
            onClick={handleSell} 
            variant="contained"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
          >
            Виставити
          </Button>
        </DialogActions>
      </Dialog>

      {/* Діалог покупки */}
      <Dialog open={showBuyDialog} onClose={() => setShowBuyDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Підтвердити покупку</DialogTitle>
        <DialogContent>
          <Typography variant="h6" gutterBottom>
            {nft.name}
          </Typography>
          
          <Typography variant="h4" color="primary" gutterBottom>
            {nft.price} {nft.currency || 'MATIC'}
          </Typography>
          
          <Alert severity="warning" sx={{ mb: 2 }}>
            Ця дія незворотна. Переконайтеся, що у вас достатньо коштів для покупки та оплати комісії мережі.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowBuyDialog(false)}>Скасувати</Button>
          <Button 
            onClick={handleBuy} 
            variant="contained" 
            color="primary"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : <ShoppingCart />}
          >
            Підтвердити покупку
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default NFTCard;