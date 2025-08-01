import { useState } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { useAuth } from './useAuth';
import { API_CONFIG, getAuthHeaders } from '../config/api';
import { BLOCKCHAIN_CONFIG } from '../config/blockchain';
import { ethers } from 'ethers';
import axios from 'axios';

export const usePayments = () => {
  const { provider, account, balance, updateBalance, getGasPrice, estimateGas } = useWeb3();
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Оцінка газу для операції
  const getGasEstimate = async (operationType, params = {}) => {
    setIsLoading(true);
    
    try {
      const queryParams = new URLSearchParams({
        operationType,
        ...params
      });

      const response = await axios.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PAYMENTS_GAS_ESTIMATE}?${queryParams}`,
        { headers: getAuthHeaders(token) }
      );

      if (response.data.isSuccess) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Помилка оцінки газу');
      }
    } catch (error) {
      console.error('Error estimating gas:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Підтвердження транзакції
  const confirmTransaction = async (transactionHash) => {
    setIsLoading(true);
    
    try {
      const response = await axios.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PAYMENTS_CONFIRM}`,
        { transactionHash },
        { headers: getAuthHeaders(token) }
      );

      if (response.data.isSuccess) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Помилка підтвердження транзакції');
      }
    } catch (error) {
      console.error('Error confirming transaction:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Отримання балансу MATIC
  const getMaticBalance = async (walletAddress = null) => {
    try {
      const targetAddress = walletAddress || account;
      
      if (!targetAddress) {
        throw new Error('Адреса гаманця не вказана');
      }

      const response = await axios.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PAYMENTS_BALANCE}`,
        { headers: getAuthHeaders(token) }
      );

      if (response.data.isSuccess) {
        return response.data.data;
      } else {
        throw new Error('Помилка отримання балансу');
      }
    } catch (error) {
      console.error('Error getting MATIC balance:', error);
      throw error;
    }
  };

  // Переказ MATIC
  const transferMatic = async (toAddress, amount) => {
    if (!provider || !account) {
      throw new Error('Гаманець не підключений');
    }

    setIsLoading(true);
    
    try {
      // Валідація адреси
      if (!ethers.isAddress(toAddress)) {
        throw new Error('Неправильна адреса отримувача');
      }

      // Валідація суми
      if (!amount || amount <= 0) {
        throw new Error('Неправильна сума для переказу');
      }

      const amountWei = ethers.parseEther(amount.toString());
      const currentBalance = ethers.parseEther(balance);

      if (amountWei > currentBalance) {
        throw new Error('Недостатньо коштів для переказу');
      }

      // Оцінка gas
      const gasEstimate = await estimateGas({
        to: toAddress,
        value: amountWei
      });

      const gasPrice = await getGasPrice();
      const gasCost = gasEstimate * gasPrice;

      if (amountWei + gasCost > currentBalance) {
        throw new Error('Недостатньо коштів для покриття комісії мережі');
      }

      // Виконання транзакції через API
      const response = await axios.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PAYMENTS_TRANSFER}`,
        {
          toAddress,
          amount,
          fromAddress: account
        },
        { headers: getAuthHeaders(token) }
      );

      if (response.data.isSuccess) {
        // Оновлення балансу після успішної транзакції
        setTimeout(() => updateBalance(), 3000);
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Помилка переказу');
      }
    } catch (error) {
      console.error('Error transferring MATIC:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Отримання інформації про транзакцію
  const getTransactionInfo = async (transactionHash) => {
    try {
      const response = await axios.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PAYMENTS_TRANSACTION(transactionHash)}`,
        { headers: getAuthHeaders(token) }
      );

      if (response.data.isSuccess) {
        return response.data.data;
      } else {
        throw new Error('Помилка отримання інформації про транзакцію');
      }
    } catch (error) {
      console.error('Error getting transaction info:', error);
      throw error;
    }
  };

  // Очікування підтвердження транзакції
  const waitForTransaction = async (transactionHash, confirmations = 2) => {
    if (!provider) {
      throw new Error('Provider не підключений');
    }

    try {
      const receipt = await provider.waitForTransaction(transactionHash, confirmations);
      
      if (receipt && receipt.status === 1) {
        // Оновлення балансу після підтвердження
        setTimeout(() => updateBalance(), 1000);
        return receipt;
      } else {
        throw new Error('Транзакція не вдалася');
      }
    } catch (error) {
      console.error('Error waiting for transaction:', error);
      throw error;
    }
  };

  // Розрахунок комісії в USD (примерно)
  const calculateFeeInUSD = async (gasLimit, gasPrice, maticPriceUSD = 0.5) => {
    try {
      const gasCostMatic = ethers.formatEther(BigInt(gasLimit) * BigInt(gasPrice));
      const gasCostUSD = parseFloat(gasCostMatic) * maticPriceUSD;
      
      return {
        gasCostMatic: parseFloat(gasCostMatic).toFixed(6),
        gasCostUSD: gasCostUSD.toFixed(2),
        gasLimit: gasLimit.toString(),
        gasPrice: ethers.formatUnits(gasPrice, 'gwei')
      };
    } catch (error) {
      console.error('Error calculating fee:', error);
      throw error;
    }
  };

  // Перевірка достатності коштів для транзакції
  const checkSufficientFunds = async (requiredAmount, includeGas = true) => {
    try {
      const currentBalance = ethers.parseEther(balance);
      const requiredWei = ethers.parseEther(requiredAmount.toString());
      
      if (includeGas) {
        // Орієнтовна оцінка gas для стандартної транзакції
        const gasPrice = await getGasPrice();
        const estimatedGasCost = BigInt(21000) * gasPrice; // Стандартний transfer
        
        return currentBalance >= (requiredWei + estimatedGasCost);
      }
      
      return currentBalance >= requiredWei;
    } catch (error) {
      console.error('Error checking sufficient funds:', error);
      return false;
    }
  };

  // Форматування суми MATIC
  const formatMatic = (amount, decimals = 4) => {
    try {
      if (typeof amount === 'string' && amount.includes('0x')) {
        // Це Wei в hex форматі
        return parseFloat(ethers.formatEther(amount)).toFixed(decimals);
      }
      
      if (typeof amount === 'bigint') {
        return parseFloat(ethers.formatEther(amount)).toFixed(decimals);
      }
      
      return parseFloat(amount).toFixed(decimals);
    } catch (error) {
      console.error('Error formatting MATIC:', error);
      return '0.0000';
    }
  };

  // Конвертація в Wei
  const toWei = (amount) => {
    try {
      return ethers.parseEther(amount.toString());
    } catch (error) {
      console.error('Error converting to Wei:', error);
      throw new Error('Неправильний формат суми');
    }
  };

  // Конвертація з Wei
  const fromWei = (amount) => {
    try {
      return ethers.formatEther(amount);
    } catch (error) {
      console.error('Error converting from Wei:', error);
      return '0';
    }
  };

  return {
    // Стан
    isLoading,
    balance,
    
    // Основні методи
    getGasEstimate,
    confirmTransaction,
    getMaticBalance,
    transferMatic,
    getTransactionInfo,
    waitForTransaction,
    
    // Утилітарні методи
    calculateFeeInUSD,
    checkSufficientFunds,
    formatMatic,
    toWei,
    fromWei,
    
    // Оновлення стану
    updateBalance
  };
};