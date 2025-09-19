// Конфігурація блокчейна для NFT Marketplace
export const BLOCKCHAIN_CONFIG = {
  POLYGON_RPC_URL: "https://polygon-rpc.com",
  POLYGON_CHAIN_ID: 137,
  POLYGON_CHAIN_NAME: "Polygon Mainnet",
  POLYGON_SYMBOL: "MATIC",
  POLYGON_DECIMALS: 18,
  POLYGON_BLOCK_EXPLORER: "https://polygonscan.com",
  
  // Адреси контрактів (оновлений адрес після деплою)
  NFT_MARKETPLACE_ADDRESS: "0xb9830Ce3e630AC31cFC316d5155Fa0ff24eFD8E8", // Задеплоєний контракт
  
  // IPFS конфігурація
  IPFS_GATEWAY: "https://gateway.pinata.cloud/ipfs/",
  IPFS_API_URL: "https://api.pinata.cloud",
  
  // Налаштування таймаутів
  TRANSACTION_CONFIRMATION_BLOCKS: 2,
  TIMEOUT_SECONDS: 60,
  
  // Gas налаштування
  DEFAULT_GAS_LIMIT: 500000,
  MARKETPLACE_GAS_LIMIT: 300000,
  MINT_GAS_LIMIT: 200000
};

// ABI для оновленого NFT Marketplace контракту
export const NFT_MARKETPLACE_ABI = [
  // Події
  "event NFTMinted(uint256 indexed tokenId, address indexed creator, string tokenURI)",
  "event MarketItemCreated(uint256 indexed tokenId, address indexed seller, address indexed owner, uint256 price)",
  "event MarketItemSold(uint256 indexed tokenId, address indexed seller, address indexed buyer, uint256 price)",
  "event MarketItemDelisted(uint256 indexed tokenId, address indexed seller)",
  "event ListingPriceUpdated(uint256 oldPrice, uint256 newPrice)",
  "event MarketplaceFeeUpdated(uint256 oldFee, uint256 newFee)",
  
  // Основні функції NFT
  "function mintNFT(address to, string memory tokenURI, uint256 royaltyFraction) external returns (uint256)",
  "function burnNFT(uint256 tokenId) external",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function tokenURI(uint256 tokenId) external view returns (string memory)",
  "function balanceOf(address owner) external view returns (uint256)",
  "function totalSupply() external view returns (uint256)",
  
  // Marketplace функції
  "function listNFTForSale(uint256 tokenId, uint256 price) external payable",
  "function buyNFT(uint256 tokenId) external payable",
  "function delistNFT(uint256 tokenId) external",
  "function getMarketItem(uint256 tokenId) external view returns (tuple(uint256 tokenId, address seller, address owner, uint256 price, bool isListed, bool exists))",
  "function getActiveListings() external view returns (tuple(uint256 tokenId, address seller, address owner, uint256 price, bool isListed, bool exists)[])",
  
  // Користувацькі функції
  "function getUserNFTs(address user) external view returns (uint256[])",
  "function getUserNFTCount(address user) external view returns (uint256)",
  
  // Роялті
  "function royaltyInfo(uint256 tokenId, uint256 salePrice) external view returns (address, uint256)",
  
  // Адміністративні функції
  "function getListingPrice() external view returns (uint256)",
  "function getMarketplaceFee() external view returns (uint256)",
  "function getItemsSold() external view returns (uint256)",
  "function pause() external",
  "function unpause() external"
];

// Типи помилок блокчейна
export const BLOCKCHAIN_ERRORS = {
  USER_REJECTED: 'Користувач відхилив транзакцію',
  INSUFFICIENT_FUNDS: 'Недостатньо коштів для транзакції',
  NETWORK_ERROR: 'Помилка мережі',
  CONTRACT_ERROR: 'Помилка смарт-контракту',
  UNKNOWN_ERROR: 'Невідома помилка'
};

// Утиліти для роботи з блокчейном
export const BLOCKCHAIN_UTILS = {
  formatAddress: (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  },
  
  formatMatic: (wei) => {
    return (parseFloat(wei) / 1e18).toFixed(4);
  },
  
  parseError: (error) => {
    if (error.code === 4001) return BLOCKCHAIN_ERRORS.USER_REJECTED;
    if (error.message?.includes('insufficient funds')) return BLOCKCHAIN_ERRORS.INSUFFICIENT_FUNDS;
    if (error.message?.includes('network')) return BLOCKCHAIN_ERRORS.NETWORK_ERROR;
    return BLOCKCHAIN_ERRORS.UNKNOWN_ERROR;
  },
  
  validateAddress: (address) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }
};