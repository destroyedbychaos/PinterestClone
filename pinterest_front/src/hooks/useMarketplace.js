import { useState } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { useAuth } from './useAuth';
import { API_CONFIG, getAuthHeaders } from '../config/api';
import { BLOCKCHAIN_CONFIG } from '../config/blockchain';
import { ethers } from 'ethers';
import axios from 'axios';

export const useMarketplace = () => {
  const { contract, account, sendTransaction, estimateGas, getGasPrice } = useWeb3();
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Виставлення NFT на продаж
  const listNFTForSale = async (nftId, tokenId, price) => {
    if (!contract || !account) {
      throw new Error('Контракт або гаманець не підключені');
    }

    setIsLoading(true);
    
    try {
      // Отримання комісії за лістинг
      const listingPrice = await contract.getListingPrice();
      const priceInWei = ethers.parseEther(price.toString());

      // Оцінка gas
      const gasEstimate = await contract.listNFTForSale.estimateGas(
        tokenId,
        priceInWei,
        { value: listingPrice }
      );

      // Виконання транзакції на блокчейні
      const tx = await contract.listNFTForSale(
        tokenId,
        priceInWei,
        {
          value: listingPrice,
          gasLimit: gasEstimate + BigInt(50000)
        }
      );

      await tx.wait();

      // Оновлення в базі даних
      const response = await axios.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MARKETPLACE_LIST}`,
        {
          nftId,
          tokenId,
          price,
          transactionHash: tx.hash
        },
        { headers: getAuthHeaders(token) }
      );

      if (!response.data.isSuccess) {
        throw new Error(response.data.message || 'Помилка створення лістингу');
      }

      return { transactionHash: tx.hash, listingData: response.data.data };
    } catch (error) {
      console.error('Error listing NFT:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Зняття NFT з продажу
  const delistNFT = async (nftId, tokenId) => {
    if (!contract || !account) {
      throw new Error('Контракт або гаманець не підключені');
    }

    setIsLoading(true);
    
    try {
      // Виконання транзакції на блокчейні
      const tx = await contract.delistNFT(tokenId);
      await tx.wait();

      // Оновлення в базі даних
      const response = await axios.delete(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MARKETPLACE_DELIST(nftId)}`,
        { 
          headers: getAuthHeaders(token),
          data: { transactionHash: tx.hash }
        }
      );

      if (!response.data.isSuccess) {
        throw new Error(response.data.message || 'Помилка зняття з продажу');
      }

      return { transactionHash: tx.hash };
    } catch (error) {
      console.error('Error delisting NFT:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Купівля NFT
  const buyNFT = async (nftId, tokenId, price) => {
    console.log('🛒 buyNFT called with:', { 
      nftId, 
      tokenId, 
      price, 
      priceType: typeof price, 
      priceValue: price,
      account 
    });

    if (!contract || !account) {
      throw new Error('Контракт або гаманець не підключені');
    }

    // Детальна перевірка ціни
    const numericPrice = Number(price);
    console.log('💰 Price validation:', { 
      originalPrice: price,
      numericPrice,
      isNaN: isNaN(numericPrice),
      isZero: numericPrice === 0,
      isEmpty: price === '',
      isNull: price === null,
      isUndefined: price === undefined
    });

    if (!price || price === '' || price === null || price === undefined || isNaN(numericPrice) || numericPrice <= 0) {
      throw new Error(`Ціна NFT некоректна: ${price} (тип: ${typeof price})`);
    }

    setIsLoading(true);
    
    try {
      const priceInWei = ethers.parseEther(price.toString());

      // Оцінка gas
      const gasEstimate = await contract.buyNFT.estimateGas(
        tokenId,
        { value: priceInWei }
      );

      // Ініціювання покупки в базі даних
      const initiateResponse = await axios.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MARKETPLACE_BUY(nftId)}`,
        { tokenId, price },
        { headers: getAuthHeaders(token) }
      );

      if (!initiateResponse.data.isSuccess) {
        throw new Error(initiateResponse.data.message || 'Помилка ініціювання покупки');
      }

      // Виконання транзакції на блокчейні
      const tx = await contract.buyNFT(tokenId, {
        value: priceInWei,
        gasLimit: gasEstimate + BigInt(50000)
      });

      const receipt = await tx.wait();

      // Підтвердження покупки
      const confirmResponse = await axios.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MARKETPLACE_CONFIRM}`,
        {
          nftId,
          tokenId,
          transactionHash: tx.hash,
          buyerAddress: account,
          finalPrice: price
        },
        { headers: getAuthHeaders(token) }
      );

      if (!confirmResponse.data.isSuccess) {
        throw new Error(confirmResponse.data.message || 'Помилка підтвердження покупки');
      }

      return { 
        transactionHash: tx.hash, 
        purchaseData: confirmResponse.data.data 
      };
    } catch (error) {
      console.error('Error buying NFT:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Отримання всіх активних лістингів
  const getActiveListings = async (page = 1, pageSize = 20) => {
    try {
      const response = await axios.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MARKETPLACE}?page=${page}&pageSize=${pageSize}`
      );

      if (response.data.isSuccess) {
        return response.data.data;
      } else {
        throw new Error('Помилка отримання лістингів');
      }
    } catch (error) {
      console.error('Error getting listings:', error);
      throw error;
    }
  };

  // Отримання статусу лістингу
  const getListingStatus = async (nftId) => {
    try {
      const response = await axios.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MARKETPLACE_STATUS(nftId)}`
      );

      if (response.data.isSuccess) {
        return response.data.data;
      } else {
        throw new Error('Помилка отримання статусу лістингу');
      }
    } catch (error) {
      console.error('Error getting listing status:', error);
      throw error;
    }
  };

  // Отримання інформації з блокчейну
  const getMarketItemFromBlockchain = async (tokenId) => {
    if (!contract) {
      throw new Error('Контракт не підключений');
    }

    try {
      const marketItem = await contract.getMarketItem(tokenId);
      return {
        tokenId: marketItem.tokenId.toString(),
        seller: marketItem.seller,
        owner: marketItem.owner,
        price: ethers.formatEther(marketItem.price),
        isListed: marketItem.isListed,
        exists: marketItem.exists
      };
    } catch (error) {
      console.error('Error getting market item from blockchain:', error);
      throw error;
    }
  };

  // Отримання активних лістингів з блокчейну
  const getActiveListingsFromBlockchain = async () => {
    if (!contract) {
      throw new Error('Контракт не підключений');
    }

    try {
      const listings = await contract.getActiveListings();
      return listings.map(item => ({
        tokenId: item.tokenId.toString(),
        seller: item.seller,
        owner: item.owner,
        price: ethers.formatEther(item.price),
        isListed: item.isListed,
        exists: item.exists
      }));
    } catch (error) {
      console.error('Error getting active listings from blockchain:', error);
      throw error;
    }
  };

  // Оцінка комісій для продажу
  const getListingFees = async () => {
    if (!contract) {
      throw new Error('Контракт не підключений');
    }

    try {
      const listingPrice = await contract.getListingPrice();
      const marketplaceFee = await contract.getMarketplaceFee();
      
      return {
        listingPrice: ethers.formatEther(listingPrice),
        marketplaceFeePercent: (Number(marketplaceFee) / 100).toFixed(2)
      };
    } catch (error) {
      console.error('Error getting listing fees:', error);
      throw error;
    }
  };

  // Розрахунок роялті
  const calculateRoyalty = async (tokenId, salePrice) => {
    if (!contract) {
      throw new Error('Контракт не підключений');
    }

    try {
      const salePriceWei = ethers.parseEther(salePrice.toString());
      const [receiver, royaltyAmount] = await contract.royaltyInfo(tokenId, salePriceWei);
      
      return {
        receiver,
        royaltyAmount: ethers.formatEther(royaltyAmount),
        royaltyPercent: ((Number(ethers.formatEther(royaltyAmount)) / salePrice) * 100).toFixed(2)
      };
    } catch (error) {
      console.error('Error calculating royalty:', error);
      throw error;
    }
  };

  // Отримання загальної статистики маркетплейсу
  const getMarketplaceStats = async () => {
    if (!contract) {
      throw new Error('Контракт не підключений');
    }

    try {
      const totalSupply = await contract.getTotalSupply();
      const itemsSold = await contract.getItemsSold();
      
      return {
        totalNFTs: totalSupply.toString(),
        totalSold: itemsSold.toString(),
        activeListings: (Number(totalSupply) - Number(itemsSold)).toString()
      };
    } catch (error) {
      console.error('Error getting marketplace stats:', error);
      throw error;
    }
  };

  return {
    isLoading,
    listNFTForSale,
    delistNFT,
    buyNFT,
    getActiveListings,
    getListingStatus,
    getMarketItemFromBlockchain,
    getActiveListingsFromBlockchain,
    getListingFees,
    calculateRoyalty,
    getMarketplaceStats
  };
};