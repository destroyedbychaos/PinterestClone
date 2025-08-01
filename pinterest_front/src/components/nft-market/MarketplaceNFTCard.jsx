import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNFT } from '../../hooks/useNFT';
import { useMarketplace } from '../../hooks/useMarketplace';
import { useAuth } from '../../hooks/useAuth';
import { useWeb3 } from '../../contexts/Web3Context';
import { toast } from 'react-toastify';
import { getFullImageUrl, handleImageError } from '../../utils/imageUtils';

const MarketplaceNFTCard = ({ nft, isOwner, onUpdate }) => {
  const { token, account, isAuthenticated } = useAuth();
  const { addToFavorites, removeFromFavorites } = useNFT();
  const { buyNFT } = useMarketplace();
  const [isLoading, setIsLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Генеруємо випадкові статистики для демонстрації
  const [viewCount] = useState(Math.floor(Math.random() * 1000) + 100);
  const [likeCount] = useState(Math.floor(Math.random() * 500) + 50);

  const handleToggleFavorite = async () => {
    try {
      if (!isAuthenticated) {
        toast.info('Увійдіть в систему, щоб додавати в улюблені');
        return;
      }

      if (isFavorite) {
        await removeFromFavorites(nft.id);
        setIsFavorite(false);
        toast.success('Видалено з улюблених');
      } else {
        await addToFavorites(nft.id);
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
      if (!isAuthenticated) {
        toast.info('Увійдіть в систему, щоб купувати NFT');
        return;
      }

      await buyNFT(nft.id, nft.price);
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

  return (
    <div className="w-full max-w-xs mx-auto group">
      {/* NFT Card з градієнтною рамкою що з'являється при hover */}
      <div className="relative bg-gray-800 rounded-xl shadow-lg group-hover:shadow-[0_0_25px_rgba(34,197,94,0.6)] transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-1 overflow-hidden">
        {/* Градієнтна рамка як псевдо-елемент */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
        <div className="absolute inset-1 bg-gray-800 rounded-xl z-10"></div>
        
        {/* Внутрішня картка */}
        <div className="relative z-20 bg-gray-800 rounded-xl overflow-hidden">
          {/* Зображення NFT */}
          <div className="relative aspect-[4/3]">
            <img 
              src={getFullImageUrl(nft.imageUrl)} 
              alt={nft.name || 'NFT'}
              className="w-full h-full object-cover"
              onError={(e) => handleImageError(e, 'NFT')}
            />
            
            {/* Статус "Нове" в правому верхньому куті */}
            <div className="absolute top-2 right-2">
              <div className="bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full">
                <span className="text-xs font-medium text-gray-800">Нове</span>
              </div>
            </div>

            {/* Кнопка улюблених в лівому верхньому куті - тільки для авторизованих */}
            {isAuthenticated && (
              <button
                onClick={handleToggleFavorite}
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

          {/* Темна нижня секція з інформацією */}
          <div className="p-3 bg-gray-950">
            {/* Назва NFT */}
            <h3 className="text-white font-bold text-base mb-1 line-clamp-1">
              {nft.name || 'Untitled NFT'}
            </h3>
            
            {/* Автор */}
            <p className="text-gray-400 text-xs mb-2">
              Від {nft.creatorWalletAddress ? 
                `${nft.creatorWalletAddress.slice(0, 6)}...${nft.creatorWalletAddress.slice(-4)}` : 
                'Невідомий автор'
              }
            </p>

            {/* Ціна з MATIC */}
            <div className="flex items-center mb-2">
              <span className="text-xl font-bold text-white mr-1">
                {nft.price || '0'} 
              </span>
              <span className="text-purple-400 font-medium text-sm">MATIC</span>
            </div>

            {/* Статистика (лайки та перегляди) */}
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

            {/* Кнопка дії */}
            {nft.isForSale && !isOwner && isAuthenticated ? (
              <button
                onClick={handleBuy}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 shadow-md hover:shadow-blue-500/25 disabled:cursor-not-allowed text-sm"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Обробка...
                  </div>
                ) : (
                  'Купити зараз'
                )}
              </button>
            ) : (
              <Link
                to={`/nft-market/nft/${nft.id}`}
                className="block w-full bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 text-center shadow-md hover:shadow-gray-500/25 text-sm"
              >
                Переглянути
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceNFTCard;