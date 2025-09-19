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
  CircularProgress
} from '@mui/material';
import { useNFT } from '../../hooks/useNFT';
import { useMarketplace } from '../../hooks/useMarketplace';
import { toast } from 'react-toastify';
import { getFullImageUrl, handleImageError } from '../../utils/imageUtils';

const NFTManageCard = ({ nft, onUpdate }) => {
  const { updateNFT, deleteNFT, isLoading: nftLoading } = useNFT();
  const { listNFTForSale, delistNFT, isLoading: marketplaceLoading } = useMarketplace();
  
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
      await updateNFT(nft.id, {
        name: nft.name,
        description: nft.description,
        price: parseFloat(sellPrice),
        currency: 'MATIC',
        isForSale: true
      });


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

      if (nft.tokenId) {
        await delistNFT(nft.id, nft.tokenId);
      }

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

        <div className="relative">
          <img 
            src={getFullImageUrl(nft.imageUrl)} 
            alt={nft.name}
            className="w-full h-52 object-cover rounded-t-lg"
            onError={(e) => handleImageError(e, 'NFT')}
          />
          

          {!isMinted && (
            <div className="absolute top-3 right-3 bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-medium">
              В процесі
            </div>
          )}
          



          {(isLoading || nftLoading || marketplaceLoading) && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <CircularProgress size={40} className="text-purple-400" />
            </div>
          )}
        </div>

        <div className="p-2.5 bg-gray-950/95 backdrop-blur-sm rounded-b-lg border-t border-gray-800/50">

          <h3 className="text-white font-medium text-sm mb-1 line-clamp-1">
            {nft.name}
          </h3>

 
          <p className="text-gray-400 text-[11px] mb-2 line-clamp-2">
            {nft.description || 'Опис недоступний'}
          </p>

          <div className="mb-3">
            {isForSale ? (
              <div className="text-sm font-semibold text-purple-300">
                {nft.price} MATIC
              </div>
            ) : (
              <div className="text-gray-400 text-xs">
                {isMinted ? 'Не продається' : 'Чернетка'}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            {!isForSale && isMinted && (
              <button
                onClick={() => setShowSellDialog(true)}
                className="w-full bg-emerald-600/90 hover:bg-emerald-600 text-white font-medium py-2 px-3 rounded-md text-sm transition-colors"
              >
                💰 Виставити на продаж
              </button>
            )}
            
            {isForSale && (
              <button
                onClick={handleDelist}
                className="w-full bg-red-600/90 hover:bg-red-600 text-white font-medium py-2 px-3 rounded-md text-sm transition-colors"
              >
                🚫 Зняти з продажу
              </button>
            )}

            <Link to={`/nft-marketplace/nft/${nft.id}`} className="block">
              <button className="w-full bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 font-medium py-1.5 px-3 rounded-md text-sm transition-colors">
                👁️ Переглянути деталі
              </button>
            </Link>
          </div>
        </div>
      </div>


      <Dialog open={showSellDialog} onClose={() => setShowSellDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle className="bg-gray-900 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white">💰</div>
            <div>
              <h3 className="m-0 text-lg font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Виставити NFT на продаж</h3>
              <p className="m-0 text-xs text-gray-400">Вкажіть ціну в MATIC. Ви зможете змінити її пізніше.</p>
            </div>
          </div>
        </DialogTitle>
        <DialogContent className="bg-gray-900">
          <div className="mt-4 flex items-start gap-4">
            <img 
              src={getFullImageUrl(nft.imageUrl)} 
              alt={nft.name}
              className="w-28 h-28 object-cover rounded-lg border border-gray-800"
              onError={(e) => handleImageError(e, 'NFT')}
            />
            <div className="flex-1">
              <Typography variant="h6" className="text-white mb-2">
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
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(17,24,39,0.6)',
                    color: '#fff',
                    '& fieldset': { borderColor: '#374151' },
                    '&:hover fieldset': { borderColor: '#8b5cf6' },
                    '&.Mui-focused fieldset': { borderColor: '#8b5cf6' }
                  },
                  '& .MuiInputLabel-root': { color: '#9ca3af' },
                }}
                className="mb-2"
              />
              <div className="text-xs text-gray-400 leading-relaxed">
                Комісія маркетплейсу: <span className="text-gray-300">2.5%</span>. Комісія лістингу може стягуватись смарт‑контрактом.
              </div>
            </div>
          </div>
        </DialogContent>
        <DialogActions className="bg-gray-900 border-t border-gray-800">
          <Button onClick={() => setShowSellDialog(false)} className="text-gray-300 hover:text-white">
            Скасувати
          </Button>
          <Button 
            onClick={handleSell} 
            variant="contained"
            disabled={isLoading || !sellPrice || parseFloat(sellPrice) <= 0}
            className="bg-emerald-600/90 hover:bg-emerald-600 text-white"
          >
            {isLoading ? 'Виставляння...' : 'Виставити'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default NFTManageCard;