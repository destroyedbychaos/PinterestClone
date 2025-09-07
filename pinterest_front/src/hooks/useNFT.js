import { useState, useEffect } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { useNFTAuth } from '@/hooks/useNFTAuth';
import { API_CONFIG, getAuthHeaders, getMultipartHeaders } from '../config/api';
import { ethers } from 'ethers';
import axios from 'axios';

export const useNFT = () => {
  const { contract, account, sendTransaction, estimateGas } = useWeb3();
  const { token } = useNFTAuth();
  const [isLoading, setIsLoading] = useState(false);


  const createNFT = async (nftData, imageFile) => {
    setIsLoading(true);
    
    try {
      console.log('Creating NFT with data:', nftData);
      console.log('Image file:', imageFile);
      
      const formData = new FormData();
      formData.append('Name', nftData.name || '');
      formData.append('Description', nftData.description || '');
      formData.append('Price', nftData.price || '0');
      formData.append('Currency', nftData.currency || 'MATIC');
      formData.append('IsForSale', nftData.isForSale || false);
      formData.append('imageFile', imageFile);
      

      formData.append('CreatorWalletAddress', account);
      formData.append('OwnerWalletAddress', account);
      formData.append('IsMinted', 'false');
      formData.append('Blockchain', 'Polygon');
      
      if (nftData.royaltyFraction) {
        formData.append('RoyaltyFraction', nftData.royaltyFraction);
      }

      const response = await axios.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.NFTS}`,
        formData,
        { headers: getMultipartHeaders(token) }
      );

      if (response.data.isSuccess) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Помилка створення NFT');
      }
    } catch (error) {
      console.error('Error creating NFT:', error);
      if (error.response?.status === 400) {
        console.error('Bad Request details:', error.response.data);
        throw new Error(error.response.data?.message || 'Неправильні дані для створення NFT');
      }
      throw new Error(error.response?.data?.message || error.message || 'Помилка створення NFT');
    } finally {
      setIsLoading(false);
    }
  };


  const mintNFT = async (nftId, tokenURI, royaltyFraction = 0) => {
    if (!contract || !account) {
      throw new Error('Контракт або гаманець не підключені');
    }

    if (!tokenURI || typeof tokenURI !== 'string') {
      throw new Error('tokenURI повинен бути непустим рядком');
    }

    setIsLoading(true);
    
    try {
      console.log('Minting NFT with params:', { account, tokenURI, royaltyFraction });
      
      const royalty = Number(royaltyFraction) || 0;
      

      const gasEstimate = await contract.mintNFT.estimateGas(
        account,
        tokenURI,
        royalty
      );

      const tx = await contract.mintNFT(
        account,
        tokenURI,
        royalty,
        {
          gasLimit: gasEstimate + BigInt(50000) 
        }
      );

      const receipt = await tx.wait();
      
      const mintEvent = receipt.logs.find(log => log.topics[0] === contract.interface.getEvent('NFTMinted').topicHash);
      const tokenId = parseInt(mintEvent.topics[1], 16);


      try {
        console.log(' Оновлюємо NFT в базі даних...', {
          endpoint: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.NFT_MINT(nftId)}`,
          data: { transactionHash: tx.hash, tokenId },
          nftId
        });
        
        const updateResponse = await axios.post(
          `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.NFT_MINT(nftId)}`,
          { transactionHash: tx.hash, tokenId },
          { headers: getAuthHeaders(token) }
        );
        
        console.log(' NFT успішно оновлено в базі даних:', updateResponse.data);
      } catch (dbError) {
        console.error(' Помилка оновлення NFT в базі даних:', dbError);
        console.error('Response data:', dbError.response?.data);
        console.error('Response status:', dbError.response?.status);
        

        throw new Error(`NFT успішно заміньчений на блокчейні (Token ID: ${tokenId}), але виникла помилка при оновленні бази даних. Будь ласка, оновіть сторінку.`);
      }

      return { tokenId, transactionHash: tx.hash };
    } catch (error) {
      console.error('Error minting NFT:', error);
      
      if (error.message.includes('база даних')) {

        throw error;
      } else if (error.message.includes('Cannot read properties of undefined')) {
        throw new Error('Помилка параметрів контракту. Перевірте підключення до блокчейну');
      } else if (error.code === 'ACTION_REJECTED') {
        throw new Error('Транзакція була відхилена користувачем');
      } else if (error.message.includes('insufficient funds')) {
        throw new Error('Недостатньо коштів для оплати gas');
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };


  const getAllNFTs = async (page = 1, pageSize = 20) => {
    try {
      const response = await axios.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.NFTS}?page=${page}&pageSize=${pageSize}`
      );

      if (response.data.isSuccess) {
        const list = response.data.data?.nfTs || response.data.data?.NFTs || response.data.data?.nfts || [];
        return {
          items: list,
          totalCount: response.data.data?.totalCount || response.data.data?.TotalCount || list.length || 0,
          page: response.data.data?.page || response.data.data?.Page || 1,
          pageSize: response.data.data?.pageSize || response.data.data?.PageSize || pageSize,
          totalPages: response.data.data?.totalPages || response.data.data?.TotalPages || 1
        };
      } else {
        throw new Error(response.data.message || 'Помилка отримання NFT');
      }
    } catch (error) {
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        throw new Error('Backend сервер недоступний. Перевірте чи запущений backend на порту 5228');
      }
      console.error('Error getting NFTs:', error);
      throw new Error(error.response?.data?.message || error.message || 'Помилка отримання NFT');
    }
  };


  const getNFTById = async (id) => {
    try {
      const response = await axios.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.NFT_DETAIL(id)}`
      );

      if (response.data.isSuccess) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'NFT не знайдено');
      }
    } catch (error) {
      console.error('Error getting NFT:', error);
      throw error;
    }
  };


  const updateNFT = async (id, updateData) => {
    setIsLoading(true);
    
    try {
      const response = await axios.put(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.NFT_UPDATE(id)}`,
        updateData,
        { headers: getAuthHeaders(token) }
      );

      if (response.data.isSuccess) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Помилка оновлення NFT');
      }
    } catch (error) {
      console.error('Error updating NFT:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };


  const deleteNFT = async (id, burnOnChain = false) => {
    setIsLoading(true);
    
    try {
      const response = await axios.delete(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.NFT_DELETE(id)}?burnOnChain=${burnOnChain}`,
        { headers: getAuthHeaders(token) }
      );

      if (response.data.isSuccess) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Помилка видалення NFT');
      }
    } catch (error) {
      console.error('Error deleting NFT:', error);
      throw new Error(error.response?.data?.message || error.message || 'Помилка видалення NFT');
    } finally {
      setIsLoading(false);
    }
  };


  const burnNFT = async (tokenId) => {
    if (!contract || !account) {
      throw new Error('Контракт або гаманець не підключені');
    }

    setIsLoading(true);
    
    try {
      const tx = await contract.burnNFT(tokenId);
      await tx.wait();
      
      return { transactionHash: tx.hash };
    } catch (error) {
      console.error('Error burning NFT:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };


  const getUserNFTs = async (walletAddress, page = 1, pageSize = 20) => {
    try {
      const response = await axios.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USER_NFTS(walletAddress)}?page=${page}&pageSize=${pageSize}`
      );

      if (response.data.isSuccess) {
        const data = response.data.data;
        const list = data?.NFTs?.NFTs 
          || data?.nfts?.nfTs 
          || data?.nfts 
          || data?.items 
          || [];
        return {
          items: list,
          totalCount: data?.NFTs?.TotalCount 
            || data?.nfts?.totalCount 
            || data?.totalCount 
            || list.length 
            || 0,
          page: data?.NFTs?.Page 
            || data?.nfts?.page 
            || data?.page 
            || 1,
          pageSize: data?.NFTs?.PageSize 
            || data?.nfts?.pageSize 
            || data?.pageSize 
            || pageSize,
          totalPages: data?.NFTs?.TotalPages 
            || data?.nfts?.totalPages 
            || data?.totalPages 
            || 1
        };
      } else {
        throw new Error(response.data.message || 'Помилка отримання NFT користувача');
      }
    } catch (error) {
      console.error('Error getting user NFTs:', error);
      throw new Error(error.response?.data?.message || error.message || 'Помилка отримання NFT користувача');
    }
  };


  const getUserCreatedNFTs = async (walletAddress, page = 1, pageSize = 20) => {
    try {
      const response = await axios.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USER_CREATED_NFTS(walletAddress)}?page=${page}&pageSize=${pageSize}`
      );

      if (response.data.isSuccess) {
        const data = response.data.data;
        const list = data?.NFTs?.NFTs 
          || data?.nfts?.nfTs 
          || data?.nfts 
          || data?.items 
          || [];
        return {
          items: list,
          totalCount: data?.NFTs?.TotalCount 
            || data?.nfts?.totalCount 
            || data?.totalCount 
            || list.length 
            || 0,
          page: data?.NFTs?.Page 
            || data?.nfts?.page 
            || data?.page 
            || 1,
          pageSize: data?.NFTs?.PageSize 
            || data?.nfts?.pageSize 
            || data?.pageSize 
            || pageSize,
          totalPages: data?.NFTs?.TotalPages 
            || data?.nfts?.totalPages 
            || data?.totalPages 
            || 1
        };
      } else {
        throw new Error(response.data.message || 'Помилка отримання створених NFT');
      }
    } catch (error) {
      console.error('Error getting user created NFTs:', error);
      throw new Error(error.response?.data?.message || error.message || 'Помилка отримання створених NFT');
    }
  };


  const addToFavorites = async (walletAddress, nftId) => {
    setIsLoading(true);
    
    try {
      console.log('Adding to favorites:', { walletAddress, nftId });
      const response = await axios.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USER_ADD_FAVORITE(walletAddress, nftId)}`,
        {},
        { headers: getAuthHeaders(token) }
      );

      if (response.data.isSuccess) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Помилка додавання в улюблені');
      }
    } catch (error) {
      console.error('Error adding to favorites:', error);
      if (error.response?.status === 404) {
        throw new Error('Ендпоінт не знайдено. Перевірте налаштування backend');
      }
      throw new Error(error.response?.data?.message || error.message || 'Помилка додавання в улюблені');
    } finally {
      setIsLoading(false);
    }
  };


  const removeFromFavorites = async (walletAddress, nftId) => {
    setIsLoading(true);
    
    try {
      const response = await axios.delete(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USER_REMOVE_FAVORITE(walletAddress, nftId)}`,
        { headers: getAuthHeaders(token) }
      );

      if (response.data.isSuccess) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Помилка видалення з улюблених');
      }
    } catch (error) {
      console.error('Error removing from favorites:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };


  const getUserFavorites = async (walletAddress, page = 1, pageSize = 20) => {
    try {
      const response = await axios.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USER_FAVORITES(walletAddress)}?page=${page}&pageSize=${pageSize}`
      );

      if (response.data.isSuccess) {
        const data = response.data.data;
        const list = data?.Favorites?.NFTs 
          || data?.favorites?.nfTs 
          || data?.favorites 
          || data?.items 
          || [];
        return {
          items: list,
          totalCount: data?.Favorites?.TotalCount 
            || data?.favorites?.totalCount 
            || data?.totalCount 
            || list.length 
            || 0,
          page: data?.Favorites?.Page 
            || data?.favorites?.page 
            || data?.page 
            || 1,
          pageSize: data?.Favorites?.PageSize 
            || data?.favorites?.pageSize 
            || data?.pageSize 
            || pageSize,
          totalPages: data?.Favorites?.TotalPages 
            || data?.favorites?.totalPages 
            || data?.totalPages 
            || 1
        };
      } else {
        throw new Error(response.data.message || 'Помилка отримання улюблених NFT');
      }
    } catch (error) {
      console.error('Error getting user favorites:', error);
      throw new Error(error.response?.data?.message || error.message || 'Помилка отримання улюблених NFT');
    }
  };


  const isFavorite = async (walletAddress, nftId) => {
    try {
      const response = await axios.get(
        `${API_CONFIG.BASE_URL}/favorites/${nftId}/is-favorite?walletAddress=${walletAddress}`
      );
      if (response?.data?.isSuccess !== undefined) {
        return !!response.data.data;
      }

      return !!response?.data;
    } catch (e) {
      return false;
    }
  };



  return {
    isLoading,
    createNFT,
    mintNFT,
    getAllNFTs,
    getNFTById,
    updateNFT,
    deleteNFT,
    burnNFT,
    getUserNFTs,
    getUserCreatedNFTs,
    addToFavorites,
    removeFromFavorites,
    getUserFavorites,
    isFavorite
  };
};