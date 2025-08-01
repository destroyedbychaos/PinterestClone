import { useState, useEffect } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { useAuth } from './useAuth';
import { API_CONFIG, getAuthHeaders, getMultipartHeaders } from '../config/api';
import { ethers } from 'ethers';
import axios from 'axios';

export const useNFT = () => {
  const { contract, account, sendTransaction, estimateGas } = useWeb3();
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Створення NFT
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
      
      // Додаємо обов'язкові поля для backend
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

  // Мінтинг NFT на блокчейні
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
      
      // Перевіряємо що всі параметри валідні
      const royalty = Number(royaltyFraction) || 0;
      
      // Оцінка gas
      const gasEstimate = await contract.mintNFT.estimateGas(
        account,
        tokenURI,
        royalty
      );

      // Виконання транзакції
      const tx = await contract.mintNFT(
        account,
        tokenURI,
        royalty,
        {
          gasLimit: gasEstimate + BigInt(50000) // Додаємо буфер
        }
      );

      const receipt = await tx.wait();
      
      // Отримання tokenId з логів
      const mintEvent = receipt.logs.find(log => log.topics[0] === contract.interface.getEvent('NFTMinted').topicHash);
      const tokenId = parseInt(mintEvent.topics[1], 16);

      // Оновлення NFT в базі даних
      try {
        console.log('🔄 Оновлюємо NFT в базі даних...', {
          endpoint: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.NFT_MINT(nftId)}`,
          data: { transactionHash: tx.hash, tokenId },
          nftId
        });
        
        const updateResponse = await axios.post(
          `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.NFT_MINT(nftId)}`,
          { transactionHash: tx.hash, tokenId },
          { headers: getAuthHeaders(token) }
        );
        
        console.log('✅ NFT успішно оновлено в базі даних:', updateResponse.data);
      } catch (dbError) {
        console.error('❌ Помилка оновлення NFT в базі даних:', dbError);
        console.error('Response data:', dbError.response?.data);
        console.error('Response status:', dbError.response?.status);
        
        // NFT вже заміньчений на блокчейні, тому показуємо попередження замість помилки
        throw new Error(`NFT успішно заміньчений на блокчейні (Token ID: ${tokenId}), але виникла помилка при оновленні бази даних. Будь ласка, оновіть сторінку.`);
      }

      return { tokenId, transactionHash: tx.hash };
    } catch (error) {
      console.error('Error minting NFT:', error);
      
      // Перевіряємо чи це помилка блокчейну чи бази даних
      if (error.message.includes('база даних')) {
        // Це наша кастомна помилка з попереднього блоку
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

  // Отримання всіх NFT
  const getAllNFTs = async (page = 1, pageSize = 20) => {
    try {
      const response = await axios.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.NFTS}?page=${page}&pageSize=${pageSize}`
      );

      if (response.data.isSuccess) {
        return {
          items: response.data.data.nfTs || [],
          totalCount: response.data.data.totalCount || 0,
          page: response.data.data.page || 1,
          pageSize: response.data.data.pageSize || 20,
          totalPages: response.data.data.totalPages || 1
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

  // Отримання NFT за ID
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

  // Оновлення NFT
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

  // Видалення NFT
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

  // Спалення NFT на блокчейні
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

  // Отримання NFT користувача (які йому належать)
  const getUserNFTs = async (walletAddress, page = 1, pageSize = 20) => {
    try {
      const response = await axios.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USER_NFTS(walletAddress)}?page=${page}&pageSize=${pageSize}`
      );

      if (response.data.isSuccess) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Помилка отримання NFT користувача');
      }
    } catch (error) {
      console.error('Error getting user NFTs:', error);
      throw new Error(error.response?.data?.message || error.message || 'Помилка отримання NFT користувача');
    }
  };

  // Отримання створених користувачем NFT
  const getUserCreatedNFTs = async (walletAddress, page = 1, pageSize = 20) => {
    try {
      const response = await axios.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USER_CREATED_NFTS(walletAddress)}?page=${page}&pageSize=${pageSize}`
      );

      if (response.data.isSuccess) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Помилка отримання створених NFT');
      }
    } catch (error) {
      console.error('Error getting user created NFTs:', error);
      throw new Error(error.response?.data?.message || error.message || 'Помилка отримання створених NFT');
    }
  };

  // Додавання в улюблені
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

  // Видалення з улюблених
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

  // Отримання улюблених NFT користувача
  const getUserFavorites = async (walletAddress, page = 1, pageSize = 20) => {
    try {
      const response = await axios.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USER_FAVORITES(walletAddress)}?page=${page}&pageSize=${pageSize}`
      );

      if (response.data.isSuccess) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Помилка отримання улюблених NFT');
      }
    } catch (error) {
      console.error('Error getting user favorites:', error);
      throw new Error(error.response?.data?.message || error.message || 'Помилка отримання улюблених NFT');
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
    getUserFavorites
  };
};