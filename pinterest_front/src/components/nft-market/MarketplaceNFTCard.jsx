import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNFT } from '../../hooks/useNFT';
import { useMarketplace } from '../../hooks/useMarketplace';
import { useAuth } from '../../hooks/useAuth';
import { useWeb3 } from '../../contexts/Web3Context';
import { toast } from 'react-toastify';
import { getFullImageUrl, handleImageError } from '../../utils/imageUtils';

const MarketplaceNFTCard = ({ nft, isOwner, onUpdate, isNew = false }) => {
  const { isAuthenticated } = useAuth();
  const { account } = useWeb3();
  const { addToFavorites, removeFromFavorites, isFavorite: checkFavorite } = useNFT();
  const { buyNFT, delistNFT, getActiveListings, getListingStatus } = useMarketplace();
  const [isLoading, setIsLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);


  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (isAuthenticated && account && nft?.id) {
          const fav = await checkFavorite(account, nft.id);
          if (mounted) setIsFavorite(!!fav);
        } else {
          if (mounted) setIsFavorite(false);
        }
      } catch {
        if (mounted) setIsFavorite(false);
      }
    })();
    return () => { mounted = false; };
  }, [account, isAuthenticated, nft?.id]);
  const navigate = useNavigate();


  const [viewCount] = useState(Math.floor(Math.random() * 1000) + 100);
  const [likeCount] = useState(Math.floor(Math.random() * 500) + 50);

  const handleToggleFavorite = async () => {
    try {
      if (!isAuthenticated || !account) {
        toast.info('Увійдіть в систему, щоб додавати в улюблені');
        return;
      }

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
      console.error('Помилка оновлення улюблених:', error);
      toast.error(error.message || 'Помилка оновлення улюблених');
    }
  };

  const handleBuy = async () => {
    setIsLoading(true);
    try {
      if (!isAuthenticated || !account) {
        toast.info('Увійдіть в систему, щоб купувати NFT');
        return;
      }

 
      let effectiveTokenId = nft.tokenId;
      let effectivePrice = nft.price;

      if (!effectivePrice || effectivePrice === '') {
        try {
          const status = await getListingStatus(nft.id);
          if (status?.price || status?.Price) {
            effectivePrice = status.price ?? status.Price;
          }
        } catch {}
      }

      if (!effectiveTokenId || effectiveTokenId === '' || effectiveTokenId === '0' || effectiveTokenId === 0) {
        try {
          const listingsResp = await getActiveListings(1, 100);
          const listings = listingsResp?.listings || listingsResp?.Listings || listingsResp?.items || listingsResp?.data?.listings || [];
          const found = listings.find((l) => (l.nftId ?? l.NFTId ?? l.nftID) === nft.id);
          if (found) {
            effectiveTokenId = found.tokenId ?? found.TokenId ?? found.tokenID;
            if (!effectivePrice && (found.price ?? found.Price)) {
              effectivePrice = found.price ?? found.Price;
            }
          }
        } catch {}
      }

      if (!effectiveTokenId || effectiveTokenId === '' || !effectivePrice || effectivePrice === '') {
        toast.error('Неможливо виконати покупку: відсутні tokenId або ціна');
        return;
      }

      await buyNFT(nft.id, effectiveTokenId, effectivePrice);
      toast.success('NFT успішно куплено!');
      
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Помилка покупки NFT:', error);
      toast.error(error.message || 'Помилка покупки NFT');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelist = async () => {
    setIsLoading(true);
    try {
      let effectiveTokenId = nft.tokenId;

      if (!effectiveTokenId || effectiveTokenId === '' || effectiveTokenId === '0' || effectiveTokenId === 0) {
        try {
          const listingsResp = await getActiveListings(1, 100);
          const listings = listingsResp?.listings || listingsResp?.Listings || listingsResp?.items || listingsResp?.data?.listings || [];
          const found = listings.find((l) => (l.nftId ?? l.NFTId ?? l.nftID) === nft.id);
          if (found) {
            effectiveTokenId = found.tokenId ?? found.TokenId ?? found.tokenID;
          }
        } catch {}
      }

      if (!effectiveTokenId || effectiveTokenId === '' || effectiveTokenId === '0') {
        toast.error('Неможливо зняти з продажу: відсутній tokenId');
        return;
      }

      await delistNFT(nft.id, effectiveTokenId);
      toast.success('NFT знято з продажу');
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Помилка зняття з продажу:', error);
      toast.error(error.message || 'Помилка зняття з продажу');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xs mx-auto group">

      <div
        className="relative bg-gray-800 rounded-xl shadow-lg group-hover:shadow-[0_0_25px_rgba(34,197,94,0.6)] transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-1 overflow-hidden cursor-pointer"
        onClick={() => navigate(`/nft-market/nft/${nft.id}`)}
      >

        <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
        <div className="absolute inset-1 bg-gray-800 rounded-xl z-10"></div>
        

        <div className="relative z-20 bg-gray-800 rounded-xl overflow-hidden">

          <div className="relative aspect-[4/3]">
            <img 
              src={getFullImageUrl(nft.imageUrl)} 
              alt={nft.name || 'NFT'}
              className="w-full h-full object-cover"
              onError={(e) => handleImageError(e, 'NFT')}
            />
            
  
            {isNew && (
              <div className="absolute top-2 right-2">
                <div className="bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full">
                  <span className="text-xs font-medium text-gray-800">Нове</span>
                </div>
              </div>
            )}

            {isAuthenticated && (
              <button
                onClick={(e) => { e.stopPropagation(); handleToggleFavorite(); }}
                className="absolute top-2 left-2 p-1.5 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
              >
              <svg 
                className={`w-4 h-4 ${isFavorite ? 'text-red-500 fill-current' : 'text-white'}`} 
                fill={isFavorite ? "currentColor" : "none"} 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
            )}
          </div>

          <div className="p-3 bg-gray-950">

            <h3 className="text-white font-bold text-base mb-1 line-clamp-1">
              {nft.name || 'Untitled NFT'}
            </h3>
            

            <p className="text-gray-400 text-xs mb-2">
              Від {nft.creatorWalletAddress ? 
                `${nft.creatorWalletAddress.slice(0, 6)}...${nft.creatorWalletAddress.slice(-4)}` : 
                'Невідомий автор'
              }
            </p>


            <div className="flex items-center mb-2">
              <span className="text-xl font-bold text-white mr-1">
                {nft.price || '0'} 
              </span>
              <span className="text-purple-400 font-medium text-sm">MATIC</span>
            </div>

            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  <svg className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span className="text-gray-400 text-xs font-medium">{likeCount}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span className="text-gray-400 text-xs font-medium">{viewCount}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceNFTCard;