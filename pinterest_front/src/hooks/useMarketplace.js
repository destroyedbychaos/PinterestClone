import { useState } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { useNFTAuth } from '@/hooks/useNFTAuth';
import { API_CONFIG, getAuthHeaders } from '../config/api';
import { BLOCKCHAIN_CONFIG } from '../config/blockchain';
import { ethers } from 'ethers';
import axios from 'axios';

export const useMarketplace = () => {
  const { contract, account, sendTransaction, estimateGas, getGasPrice } = useWeb3();
  const { token } = useNFTAuth();
  const [isLoading, setIsLoading] = useState(false);


  const listNFTForSale = async (nftId, tokenId, price) => {
    if (!contract || !account) {
      throw new Error('Контракт або гаманець не підключені');
    }

    setIsLoading(true);
    
    try {
      if (tokenId === undefined || tokenId === null) {
        throw new Error('Некоректний tokenId');
      }

      let priceString;
      if (typeof price === 'string') {
        priceString = price.trim();
      } else if (typeof price === 'number' || typeof price === 'bigint') {
        priceString = price.toString();
      }
      if (!priceString) {
        throw new Error('Вкажіть ціну в MATIC');
      }
      if (!/^[0-9]*\.?[0-9]+$/.test(priceString)) {
        throw new Error('Некоректна ціна. Використовуйте формат 0.0');
      }


      const owner = await contract.ownerOf(tokenId);
      if (owner.toLowerCase() !== account.toLowerCase()) {
        throw new Error('Ви не є власником цього NFT');
      }

      const listingPrice = await contract.getListingPrice();
      let priceInWei;
      try {
        priceInWei = ethers.parseEther(priceString);
      } catch (e) {
        throw new Error('Не вдалося конвертувати ціну в wei');
      }
      if (priceInWei <= 0n) {
        throw new Error('Ціна має бути більшою за 0');
      }


      const gasEstimate = await contract.listNFTForSale.estimateGas(
        tokenId,
        priceInWei,
        { value: listingPrice }
      );


      const tx = await contract.listNFTForSale(
        tokenId,
        priceInWei,
        {
          value: listingPrice,
          gasLimit: gasEstimate + BigInt(50000)
        }
      );

      await tx.wait();


      let confirmed = false;
      for (let i = 0; i < 20; i++) {
        try {
          const item = await contract.getMarketItem(tokenId);
          if (item && item.exists && item.isListed) { confirmed = true; break; }
        } catch {}
        await new Promise(r => setTimeout(r, 1500));
      }
      if (!confirmed) {

        const newOwner = await contract.ownerOf(tokenId);
        if (newOwner.toLowerCase() !== contract.target.toLowerCase()) {
          throw new Error('Лістинг не підтверджено ончейн (токен не переведено на контракт)');
        }
      }

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


  const delistNFT = async (nftId, tokenId) => {
    if (!contract || !account) {
      throw new Error('Контракт або гаманець не підключені');
    }

    setIsLoading(true);
    
    try {

      let isListed = false;
      try {
        const item = await contract.getMarketItem(tokenId);
        isListed = !!(item && item.exists && item.isListed);
      } catch {}

      let txHash = null;
      if (isListed) {

        const tx = await contract.delistNFT(tokenId);
        await tx.wait();
        txHash = tx.hash;

        for (let i = 0; i < 20; i++) {
          let listed = false;
          try {
            const item = await contract.getMarketItem(tokenId);
            listed = !!(item && item.exists && item.isListed);
          } catch {}
          const ownerNow = await contract.ownerOf(tokenId);
          if (!listed && ownerNow.toLowerCase() === account.toLowerCase()) break;
          await new Promise(r => setTimeout(r, 1500));
        }
      }


      const response = await axios.delete(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MARKETPLACE_DELIST(nftId)}`,
        { 
          headers: getAuthHeaders(token),
          data: { transactionHash: txHash }
        }
      );

      if (!response.data.isSuccess) {
        throw new Error(response.data.message || 'Помилка зняття з продажу');
      }

      return { transactionHash: txHash };
    } catch (error) {

      const reason = error?.reason || error?.message || '';
      if (String(reason).includes('NFT not listed')) {
        try {
          const response = await axios.delete(
            `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MARKETPLACE_DELIST(nftId)}`,
            { headers: getAuthHeaders(token) }
          );
          if (response.data.isSuccess) {
            return { transactionHash: null };
          }
        } catch {}
      }
      console.error('Error delisting NFT:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };


  const buyNFT = async (nftId, tokenId, price) => {
    console.log(' buyNFT called with:', { 
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


    const numericPrice = Number(price);
    console.log(' Price validation:', { 
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

      const tokenIdBig = typeof tokenId === 'bigint' ? tokenId : BigInt(tokenId);


      let isListedFlag;
      try {
        if (typeof contract.isListed === 'function') {
          isListedFlag = await contract.isListed(tokenIdBig);
        }
      } catch (e) {
        console.warn('isListed() failed:', e);
      }

      let ownerOnchain;
      try {
        ownerOnchain = await contract.ownerOf(tokenIdBig);
      } catch (e) {
        console.warn('ownerOf() failed:', e);
      }

      let onchainItem;
      try {
        onchainItem = await contract.getMarketItem(tokenIdBig);
      } catch (e) {
        console.warn('getMarketItem failed', e);
      }

      const exists = !!onchainItem?.exists;
      const isListed = isListedFlag !== undefined ? isListedFlag : !!onchainItem?.isListed;

      const contractIsOwner = ownerOnchain && (ownerOnchain.toLowerCase() === contract.target.toLowerCase());
      if (!exists || (!isListed && !contractIsOwner)) {
        console.error('On-chain listing check failed', {
          tokenId: tokenIdBig.toString(),
          exists,
          isListed,
          isListedFlag,
          ownerOnchain,
          onchainItem
        });
        throw new Error('NFT не виставлено на продаж у смарт‑контракті (можливо, лістинг знято або ще не підтверджено). Оновіть сторінку.');
      }


      try {
        const onchainSeller = onchainItem.seller || onchainItem.owner || '';
        if (onchainSeller && onchainSeller.toLowerCase() === account.toLowerCase()) {
          throw new Error('Ви не можете купити власний NFT. Увійдіть іншим гаманцем.');
        }
      } catch {}

      const onchainPriceWei = onchainItem.price; 
      if (!onchainPriceWei || onchainPriceWei <= 0n) {
        throw new Error('Невірна ціна лістингу на блокчейні');
      }

      const gasEstimate = await contract.buyNFT.estimateGas(
        tokenIdBig,
        { value: onchainPriceWei }
      );


      const priceMatic = Number(ethers.formatEther(onchainPriceWei));
      let initiateSucceeded = false;
      try {
        const initiateResponse = await axios.post(
          `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MARKETPLACE_BUY(nftId)}`,
          { offerPrice: priceMatic, currency: 'MATIC' },
          { headers: getAuthHeaders(token) }
        );
        initiateSucceeded = !!initiateResponse?.data?.isSuccess;
        if (!initiateSucceeded) {
          console.warn('InitiatePurchase returned non-success:', initiateResponse?.data);
        }
      } catch (e) {
        console.warn('InitiatePurchase failed, continue with on-chain tx then confirm:', e?.response?.data || e?.message);
      }

      const tx = await contract.buyNFT(tokenIdBig, {
        value: onchainPriceWei,
        gasLimit: gasEstimate + BigInt(50000)
      });

      const receipt = await tx.wait();


      let gasPriceWei = 0n;
      try {
        gasPriceWei = receipt?.effectiveGasPrice ?? receipt?.gasPrice ?? await getGasPrice();
      } catch {}
      const gasUsed = receipt?.gasUsed ?? 0n;
      const txFeeWei = (typeof gasPriceWei === 'bigint' && typeof gasUsed === 'bigint') ? gasPriceWei * gasUsed : 0n;
      const confirmPayload = {
        nftId,
        transactionHash: tx.hash,
        gasUsed: Number(gasUsed || 0n),
        gasPrice: Number(ethers.formatUnits(gasPriceWei || 0n, 'gwei')),
        transactionFee: Number(ethers.formatEther(txFeeWei || 0n))
      };
      const confirmResponse = await axios.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MARKETPLACE_CONFIRM}`,
        confirmPayload,
        { headers: getAuthHeaders(token) }
      );

      if (!confirmResponse.data.isSuccess) {
        throw new Error(confirmResponse.data.message || 'Помилка підтвердження покупки');
      }

      return { transactionHash: tx.hash, purchaseData: confirmResponse.data.data };
    } catch (error) {
      const serverMessage = error?.response?.data?.message || error?.response?.data || error?.message;
      console.error('Error buying NFT:', serverMessage, error);
      throw new Error(serverMessage || 'Помилка покупки');
    } finally {
      setIsLoading(false);
    }
  };


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


  const repairListing = async (nftId, tokenId, price) => {
    if (!contract || !account) {
      throw new Error('Контракт або гаманець не підключені');
    }

    const owner = await contract.ownerOf(tokenId);
    if (owner.toLowerCase() !== account.toLowerCase()) {
      throw new Error('Лише власник може відновити лістинг');
    }

    try { await delistNFT(nftId, tokenId); } catch {}
    return await listNFTForSale(nftId, tokenId, price);
  };


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


  const isListedOnchain = async (tokenId) => {
    if (!contract) throw new Error('Контракт не підключений');
    const tokenIdBig = typeof tokenId === 'bigint' ? tokenId : BigInt(tokenId);
    try {

      if (typeof contract.isListed === 'function') {
        const listed = await contract.isListed(tokenIdBig);
        if (listed) return true;
      }
      const item = await contract.getMarketItem(tokenIdBig);
      return !!(item && item.exists && item.isListed);
    } catch (e) {
      return false;
    }
  };


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
    repairListing,
    isListedOnchain,
    getActiveListings,
    getListingStatus,
    getMarketItemFromBlockchain,
    getActiveListingsFromBlockchain,
    getListingFees,
    calculateRoyalty,
    getMarketplaceStats
  };
};