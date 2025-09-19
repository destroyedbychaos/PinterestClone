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


  useEffect(() => {
    if (isInitialized) return; 
    
  
    let ethereum = window.ethereum;
    
    if (window.ethereum?.providers?.length) {
      ethereum = window.ethereum.providers.find(
        (provider) => provider.isMetaMask
      ) || window.ethereum.providers[0];
    }
    
    if (ethereum) {
      const provider = new ethers.BrowserProvider(ethereum);
      setProvider(provider);


      
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


  const checkConnection = async () => {
    try {
      if (window.ethereum && !account) { 
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        
        if (accounts.length > 0) {
          const signer = await provider.getSigner();
          const address = await signer.getAddress();
          const network = await provider.getNetwork();
          
          setAccount(address);
          setChainId(Number(network.chainId));
          setSigner(signer);
          
          initContract(signer);
          
          updateBalance(address, provider);
        }
      }
    } catch (error) {
      console.error('Error checking connection:', error);
    }
  };


  const connect = async () => {

    let ethereum = window.ethereum;
    
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
      await ethereum.request({ method: 'eth_requestAccounts' });
      
      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();
      
      setProvider(provider);
      setSigner(signer);
      setAccount(address);
      setChainId(Number(network.chainId));
      
      if (Number(network.chainId) !== BLOCKCHAIN_CONFIG.POLYGON_CHAIN_ID) {
        await switchToPolygon();
      }
      
      initContract(signer);
      
      updateBalance(address, provider);
      

      
      return address;
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };


  const disconnect = () => {
    setProvider(null);
    setSigner(null);
    setAccount(null);
    setChainId(null);
    setContract(null);
    setBalance('0');
  };


  const switchToPolygon = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${BLOCKCHAIN_CONFIG.POLYGON_CHAIN_ID.toString(16)}` }],
      });
    } catch (switchError) {
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


  const updateBalance = async (address, provider) => {
    try {
      const balance = await provider.getBalance(address);
      setBalance(ethers.formatEther(balance));
    } catch (error) {
      console.error('Error updating balance:', error);
    }
  };

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      disconnect();
    } else {
      setAccount(accounts[0]);
      if (provider) {
        updateBalance(accounts[0], provider);
      }
    }
  };

  const handleChainChanged = (chainId) => {
    const numericChainId = parseInt(chainId, 16);
    setChainId(numericChainId);
    

    window.location.reload();
  };

  const handleDisconnect = () => {
    disconnect();
  };

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


  const sendTransaction = async (transaction) => {
    if (!signer) {
      throw new Error('Гаманець не підключений');
    }
    
    try {
      const tx = await signer.sendTransaction(transaction);
      

      tx.wait().then(() => {
        updateBalance(account, provider);
      });
      
      return tx;
    } catch (error) {
      console.error('Error sending transaction:', error);
      throw error;
    }
  };


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

    provider,
    signer,
    account,
    chainId,
    contract,
    isConnecting,
    balance,
    
    connect,
    disconnect,
    switchToPolygon,
    signMessage,
    sendTransaction,
    getGasPrice,
    estimateGas,
    updateBalance: () => updateBalance(account, provider),
    
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