import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  CircularProgress
} from '@mui/material';
import {
  MoreVert,
  Edit,
  Sell,
  RemoveShoppingCart,
  Visibility,
  Delete
} from '@mui/icons-material';
import { useNFT } from '../../hooks/useNFT';
import { useMarketplace } from '../../hooks/useMarketplace';
import { toast } from 'react-toastify';
import { getFullImageUrl, handleImageError } from '../../utils/imageUtils';

const NFTManageCard = ({ nft, onUpdate }) => {
  const { updateNFT, deleteNFT, isLoading: nftLoading } = useNFT();
  const { listNFTForSale, delistNFT, isLoading: marketplaceLoading } = useMarketplace();
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [showSellDialog, setShowSellDialog] = useState(false);
  const [sellPrice, setSellPrice] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isForSale = nft.isForSale || nft.isListed;
  const isMinted = nft.isMinted || nft.tokenId;

  const getStatusBadge = () => {
    if (isForSale) return { text: "На продажу", color: "success", icon: "🏪" };
    if (isMinted) return { text: "Створено", color: "primary", icon: "🎨" };
    return { text: "Чернетка", color: "default", icon: "⏳" };
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSell = async () => {
    if (!sellPrice || parseFloat(sellPrice) <= 0) {
      toast.error('Вкажіть правильну ціну');
      return;
    }

    if (!isMinted) {
      toast.error('NFT має бути замінчений перед продажем');
      return;
    }

    setIsLoading(true);
    try {
      // Спочатку оновлюємо NFT в базі
      await updateNFT(nft.id, {
        name: nft.name,
        description: nft.description,
        price: parseFloat(sellPrice),
        currency: 'MATIC',
        isForSale: true
      });

      // Потім виставляємо на маркетплейс
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
      // Знімаємо з маркетплейса
      if (nft.tokenId) {
        await delistNFT(nft.id, nft.tokenId);
      }
      
      // Оновлюємо в базі
      await updateNFT(nft.id, {
        name: nft.name,
        description: nft.description,
        price: nft.price,
        currency: nft.currency,
        isForSale: false
      });
      
      toast.success('NFT знято з продажу');
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error delisting NFT:', error);
      toast.error(error.message || 'Помилка зняття з продажу');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Ви впевнені, що хочете видалити цей NFT? Цю дію неможна відмінити.')) {
      setIsLoading(true);
      try {
        await deleteNFT(nft.id);
        toast.success('NFT видалено');
        if (onUpdate) onUpdate();
      } catch (error) {
        console.error('Error deleting NFT:', error);
        toast.error('Помилка видалення NFT');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const status = getStatusBadge();

  return (
    <>
      <div className="nft-card-modern group cursor-pointer">
        {/* Image Container */}
        <div className="relative">
          <img 
            src={getFullImageUrl(nft.imageUrl)} 
            alt={nft.name}
            className="w-full h-64 object-cover rounded-t-2xl"
            onError={(e) => handleImageError(e, 'NFT')}
          />
          
          {/* Status Badge */}
          {!isMinted && (
            <div className="absolute top-3 right-3 bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-medium">
              В процесі
            </div>
          )}
          
          {/* Actions Menu */}
          <div className="absolute top-3 left-3">
            <IconButton
              onClick={handleMenuOpen}
              size="small"
              className="bg-gray-900/80 text-white hover:bg-gray-800"
            >
              <MoreVert />
            </IconButton>
          </div>

          {/* Loading Overlay */}
          {(isLoading || nftLoading || marketplaceLoading) && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <CircularProgress size={40} className="text-purple-400" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 bg-gray-950/95 backdrop-blur-sm rounded-b-2xl border-t border-gray-800/50">
          
          {/* Title */}
          <h3 className="text-white font-semibold text-lg mb-2 line-clamp-1">
            {nft.name}
          </h3>

          {/* Description */}
          <p className="text-gray-400 text-sm mb-3 line-clamp-2">
            {nft.description || 'Опис недоступний'}
          </p>

          {/* Price */}
          <div className="mb-4">
            {isForSale ? (
              <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                {nft.price} MATIC
              </div>
            ) : (
              <div className="text-gray-400 text-lg">
                {isMinted ? 'Не продається' : 'Чернетка'}
              </div>
            )}
          </div>

          {/* Management Buttons */}
          <div className="space-y-2">
            {!isForSale && isMinted && (
              <button
                onClick={() => setShowSellDialog(true)}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-green-500/25"
              >
                💰 Виставити на продаж
              </button>
            )}
            
            {isForSale && (
              <button
                onClick={handleDelist}
                className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/25"
              >
                🚫 Зняти з продажу
              </button>
            )}

            <Link to={`/nft-market/nft/${nft.id}`} className="block">
              <button className="w-full bg-gray-800 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-xl transition-all duration-300">
                👁️ Переглянути деталі
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        className="mt-2"
      >
        <MenuItem onClick={() => { handleMenuClose(); }}>
          <Link to={`/nft-market/nft/${nft.id}`} className="flex items-center w-full">
            <Visibility className="mr-2" />
            Переглянути деталі
          </Link>
        </MenuItem>
        
        {!isForSale && isMinted && (
          <MenuItem onClick={() => { handleMenuClose(); setShowSellDialog(true); }}>
            <Sell className="mr-2" />
            Виставити на продаж
          </MenuItem>
        )}
        
        {isForSale && (
          <MenuItem onClick={() => { handleMenuClose(); handleDelist(); }}>
            <RemoveShoppingCart className="mr-2" />
            Зняти з продажу
          </MenuItem>
        )}
        
        {!isMinted && (
          <MenuItem onClick={() => { handleMenuClose(); handleDelete(); }}>
            <Delete className="mr-2 text-red-400" />
            <span className="text-red-400">Видалити</span>
          </MenuItem>
        )}
      </Menu>

      {/* Sell Dialog */}
      <Dialog open={showSellDialog} onClose={() => setShowSellDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle className="text-white bg-gray-800">
          Виставити NFT на продаж
        </DialogTitle>
        <DialogContent className="bg-gray-800">
          <div className="mt-4">
            <img 
              src={getFullImageUrl(nft.imageUrl)} 
              alt={nft.name}
              className="w-32 h-32 object-cover rounded-lg mx-auto mb-4"
              onError={(e) => handleImageError(e, 'NFT')}
            />
            <Typography variant="h6" className="text-white text-center mb-4">
              {nft.name}
            </Typography>
            <TextField
              autoFocus
              margin="dense"
              label="Ціна"
              type="number"
              fullWidth
              variant="outlined"
              value={sellPrice}
              onChange={(e) => setSellPrice(e.target.value)}
              placeholder="0.001"
              InputProps={{
                endAdornment: <Typography className="text-gray-400 ml-2">MATIC</Typography>,
                className: 'text-white'
              }}
              InputLabelProps={{
                className: 'text-gray-400'
              }}
              className="mb-4"
            />
            <Typography variant="body2" className="text-gray-400">
              Встановіть ціну за яку хочете продати ваш NFT. Покупці зможуть купити його за цією ціною.
            </Typography>
          </div>
        </DialogContent>
        <DialogActions className="bg-gray-800">
          <Button onClick={() => setShowSellDialog(false)} className="text-gray-400">
            Скасувати
          </Button>
          <Button 
            onClick={handleSell} 
            variant="contained"
            disabled={isLoading || !sellPrice || parseFloat(sellPrice) <= 0}
            className="bg-green-600 hover:bg-green-700"
          >
            {isLoading ? 'Виставляння...' : 'Виставити на продаж'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default NFTManageCard;