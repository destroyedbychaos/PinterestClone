import React, { createContext, useContext, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { BLOCKCHAIN_CONFIG, NFT_MARKETPLACE_ABI, BLOCKCHAIN_UTILS } from '../config/blockchain';

const Web3Context = createContext();

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

export const Web3Provider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [contract, setContract] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [balance, setBalance] = useState('0');
  const [isInitialized, setIsInitialized] = useState(false);

  // Ініціалізація Web3
  useEffect(() => {
    if (isInitialized) return; // Уникаємо повторної ініціалізації
    
    // Знаходимо правильний Ethereum провайдер
    let ethereum = window.ethereum;
    
    if (window.ethereum?.providers?.length) {
      ethereum = window.ethereum.providers.find(
        (provider) => provider.isMetaMask
      ) || window.ethereum.providers[0];
    }
    
    if (ethereum) {
      const provider = new ethers.BrowserProvider(ethereum);
      setProvider(provider);

      // Відкладена перевірка попереднього підключення (тільки якщо є збережений токен)
      const savedToken = localStorage.getItem('authToken');
      const tokenExpiration = localStorage.getItem('authTokenExpiration');
      const isTokenValid = savedToken && (!tokenExpiration || Date.now() < parseInt(tokenExpiration));
      
      if (isTokenValid) {
        setTimeout(() => {
          checkConnection();
        }, 1000); // Відкладаємо на 1 секунду
      }
      
      // Слухачі подій
      ethereum.on('accountsChanged', handleAccountsChanged);
      ethereum.on('chainChanged', handleChainChanged);
      ethereum.on('disconnect', handleDisconnect);
      
      setIsInitialized(true);
    }

    return () => {
      let ethereum = window.ethereum;
      if (window.ethereum?.providers?.length) {
        ethereum = window.ethereum.providers.find(
          (provider) => provider.isMetaMask
        ) || window.ethereum.providers[0];
      }
      
      if (ethereum) {
        ethereum.removeListener('accountsChanged', handleAccountsChanged);
        ethereum.removeListener('chainChanged', handleChainChanged);
        ethereum.removeListener('disconnect', handleDisconnect);
      }
    };
  }, [isInitialized]);

  // Перевірка попереднього підключення
  const checkConnection = async () => {
    try {
      if (window.ethereum && !account) { // Перевіряємо тільки якщо ще не підключені
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        
        if (accounts.length > 0) {
          const signer = await provider.getSigner();
          const address = await signer.getAddress();
          const network = await provider.getNetwork();
          
          setAccount(address);
          setChainId(Number(network.chainId));
          setSigner(signer);
          
          // Ініціалізація контракту
          initContract(signer);
          
          // Отримання балансу
          updateBalance(address, provider);
        }
      }
    } catch (error) {
      console.error('Error checking connection:', error);
    }
  };

  // Підключення гаманця
  const connect = async () => {
    // Перевіряємо різні способи підключення до MetaMask
    let ethereum = window.ethereum;
    
    // Якщо є кілька провайдерів (напр. MetaMask + Manta), шукаємо MetaMask
    if (window.ethereum?.providers?.length) {
      ethereum = window.ethereum.providers.find(
        (provider) => provider.isMetaMask
      ) || window.ethereum.providers[0];
    } else if (window.ethereum?.isMetaMask) {
      ethereum = window.ethereum;
    } else if (!window.ethereum) {
      throw new Error('MetaMask не встановлено. Встановіть MetaMask для продовження.');
    }

    setIsConnecting(true);
    
    try {
      // Запит доступу до акаунтів через конкретний провайдер
      await ethereum.request({ method: 'eth_requestAccounts' });
      
      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();
      
      setProvider(provider);
      setSigner(signer);
      setAccount(address);
      setChainId(Number(network.chainId));
      
      // Перевірка мережі (тільки якщо потрібно)
      if (Number(network.chainId) !== BLOCKCHAIN_CONFIG.POLYGON_CHAIN_ID) {
        await switchToPolygon();
      }
      
      // Ініціалізація контракту
      initContract(signer);
      
      // Отримання балансу
      updateBalance(address, provider);
      
      // Автоматична авторизація після підключення кошелька (тільки якщо немає токена)
      const savedToken = localStorage.getItem('authToken');
      const tokenExpiration = localStorage.getItem('authTokenExpiration');
      
      // Перевіряємо чи токен не прострочений
      const isTokenExpired = tokenExpiration && Date.now() > parseInt(tokenExpiration);
      
      if (!savedToken || isTokenExpired) {
        console.log('🚀 Відправляємо подію walletConnected для:', address);
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('walletConnected', { detail: address }));
        }, 1000); // Збільшуємо затримку для стабільності
      } else {
        console.log('✅ Токен дійсний, пропускаємо автоматичний логін');
      }
      
      return address;
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  // Відключення гаманця
  const disconnect = () => {
    setProvider(null);
    setSigner(null);
    setAccount(null);
    setChainId(null);
    setContract(null);
    setBalance('0');
  };

  // Перемикання на Polygon
  const switchToPolygon = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${BLOCKCHAIN_CONFIG.POLYGON_CHAIN_ID.toString(16)}` }],
      });
    } catch (switchError) {
      // Якщо мережа не додана, додаємо її
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: `0x${BLOCKCHAIN_CONFIG.POLYGON_CHAIN_ID.toString(16)}`,
            chainName: BLOCKCHAIN_CONFIG.POLYGON_CHAIN_NAME,
            nativeCurrency: {
              name: BLOCKCHAIN_CONFIG.POLYGON_SYMBOL,
              symbol: BLOCKCHAIN_CONFIG.POLYGON_SYMBOL,
              decimals: BLOCKCHAIN_CONFIG.POLYGON_DECIMALS,
            },
            rpcUrls: [BLOCKCHAIN_CONFIG.POLYGON_RPC_URL],
            blockExplorerUrls: [BLOCKCHAIN_CONFIG.POLYGON_BLOCK_EXPLORER],
          }],
        });
      } else {
        throw switchError;
      }
    }
  };

  // Ініціалізація контракту
  const initContract = (signer) => {
    if (signer && BLOCKCHAIN_CONFIG.NFT_MARKETPLACE_ADDRESS) {
      const contractInstance = new ethers.Contract(
        BLOCKCHAIN_CONFIG.NFT_MARKETPLACE_ADDRESS,
        NFT_MARKETPLACE_ABI,
        signer
      );
      setContract(contractInstance);
    }
  };

  // Оновлення балансу
  const updateBalance = async (address, provider) => {
    try {
      const balance = await provider.getBalance(address);
      setBalance(ethers.formatEther(balance));
    } catch (error) {
      console.error('Error updating balance:', error);
    }
  };

  // Обробники подій
  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      disconnect();
    } else {
      setAccount(accounts[0]);
      // Оновлення балансу для нового акаунту
      if (provider) {
        updateBalance(accounts[0], provider);
      }
    }
  };

  const handleChainChanged = (chainId) => {
    const numericChainId = parseInt(chainId, 16);
    setChainId(numericChainId);
    
    // Перезавантаження сторінки для правильної ініціалізації
    window.location.reload();
  };

  const handleDisconnect = () => {
    disconnect();
  };

  // Підпис повідомлення
  const signMessage = async (message) => {
    if (!signer) {
      throw new Error('Гаманець не підключений');
    }
    
    try {
      return await signer.signMessage(message);
    } catch (error) {
      console.error('Error signing message:', error);
      throw error;
    }
  };

  // Відправка транзакції
  const sendTransaction = async (transaction) => {
    if (!signer) {
      throw new Error('Гаманець не підключений');
    }
    
    try {
      const tx = await signer.sendTransaction(transaction);
      
      // Оновлення балансу після транзакції
      tx.wait().then(() => {
        updateBalance(account, provider);
      });
      
      return tx;
    } catch (error) {
      console.error('Error sending transaction:', error);
      throw error;
    }
  };

  // Отримання gas price
  const getGasPrice = async () => {
    if (!provider) {
      throw new Error('Provider не ініціалізований');
    }
    
    try {
      const feeData = await provider.getFeeData();
      return feeData.gasPrice;
    } catch (error) {
      console.error('Error getting gas price:', error);
      throw error;
    }
  };

  // Оцінка gas для транзакції
  const estimateGas = async (transaction) => {
    if (!provider) {
      throw new Error('Provider не ініціалізований');
    }
    
    try {
      return await provider.estimateGas(transaction);
    } catch (error) {
      console.error('Error estimating gas:', error);
      throw error;
    }
  };

  const value = {
    // Стан
    provider,
    signer,
    account,
    chainId,
    contract,
    isConnecting,
    balance,
    
    // Методи
    connect,
    disconnect,
    switchToPolygon,
    signMessage,
    sendTransaction,
    getGasPrice,
    estimateGas,
    updateBalance: () => updateBalance(account, provider),
    
    // Утиліти
    isConnected: !!account,
    isPolygon: chainId === BLOCKCHAIN_CONFIG.POLYGON_CHAIN_ID,
    formatAddress: BLOCKCHAIN_UTILS.formatAddress,
    formatMatic: BLOCKCHAIN_UTILS.formatMatic
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
};