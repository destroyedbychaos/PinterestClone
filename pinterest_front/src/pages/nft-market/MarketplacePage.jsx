import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/nft-market/ui/button.jsx';
import { Badge } from '../../components/nft-market/ui/badge.jsx';
import { useNFTAuth } from '@/hooks/useNFTAuth';
import { useWeb3 } from '../../contexts/Web3Context';
import { useNFT } from '../../hooks/useNFT.js';
import { useMarketplace } from '../../hooks/useMarketplace.js';
import MarketplaceNFTCard from '../../components/nft-market/MarketplaceNFTCard.jsx';
import EnhancedLogoAnimation from '../../components/nft-market/EnhancedLogoAnimation.jsx';
import MinimalTransitionAnimation from '../../components/nft-market/MinimalTransitionAnimation.jsx';

import { toast } from 'react-toastify';

const MarketplacePage = () => {
  const { isAuthenticated } = useNFTAuth();
  const { isConnected, connect, balance, account } = useWeb3();
  const { getAllNFTs, getUserNFTs, getUserFavorites } = useNFT();
  const { getActiveListings } = useMarketplace();

  const [activeTab, setActiveTab] = useState(0);
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [stats, setStats] = useState({
    totalNFTs: 0,
    mintedNFTs: 0,
    totalVolume: 0,
    totalCreators: 0
  });

  const [showMarketplaceAnimation, setShowMarketplaceAnimation] = useState(false);
  const [isFirstMarketplaceVisit, setIsFirstMarketplaceVisit] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    if (hasInitialized) return; 
    
    const hasVisitedMarketplace = sessionStorage.getItem('visitedMarketplace');
    const hasVisitedNFTMarket = sessionStorage.getItem('visitedNFTMarket');
    
    setIsFirstMarketplaceVisit(false);
    setShowMarketplaceAnimation(false);
    sessionStorage.setItem('visitedMarketplace', 'true');
    
    if (hasVisitedNFTMarket !== 'true') {
      sessionStorage.setItem('visitedNFTMarket', 'true');
    }
    
    setHasInitialized(true);
  }, [hasInitialized]);

  useEffect(() => {
    loadNFTs();
  }, [activeTab, account, isAuthenticated]);

  const handleMarketplaceAnimationComplete = () => {
    setShowMarketplaceAnimation(false);
  };

  const loadNFTs = async () => {
    setLoading(true);
    try {
      let response;
      
      let nftsList = [];
      switch (activeTab) {
        case 0: {

          response = await getAllNFTs(1, 200);
          const raw = response?.items || response?.data || [];
          const isTruthy = (v) => v === true || v === 'true' || v === 1 || v === '1';
          nftsList = raw.filter(n =>
            isTruthy(n?.isForSale) || isTruthy(n?.IsForSale) ||
            isTruthy(n?.isActive) || isTruthy(n?.IsActive) ||
            isTruthy(n?.isListed) || isTruthy(n?.IsListed)
          );
          break;
        }
        case 1: {

          if (!account) break;
          const listingsResp = await getActiveListings(1, 200);
          const listings = listingsResp?.listings || listingsResp?.Listings || listingsResp?.items || listingsResp?.data?.listings || [];
          const mine = listings.filter(l => (l.sellerWalletAddress || l.SellerWalletAddress || l.seller || '')
            .toString().toLowerCase() === account.toLowerCase());
          nftsList = mine.map(l => ({
            id: l.nftId || l.NFTId || l.nftID || l.nft?.id,
            name: l.nftName || l.NFTName || l.nft?.name || 'NFT',
            imageUrl: l.nftImageUrl || l.NFTImageUrl || l.nft?.imageUrl,
            price: l.price || l.Price,
            currency: l.currency || l.Currency || 'MATIC',
            tokenId: l.tokenId || l.TokenId || l.nft?.tokenId,
            ownerWalletAddress: l.owner || l.ownerWalletAddress || account,
            creatorWalletAddress: l.sellerWalletAddress || l.SellerWalletAddress || l.seller || account,
            isForSale: true,
            isListed: true,
            listedAt: l.listedAt || l.ListedAt
          }));
          break;
        }
        case 2: {
          if (!account) break;
          response = await getUserFavorites(account, 1, 200);
          const raw = response?.items || response?.data || [];
          const isTruthy = (v) => v === true || v === 'true' || v === 1 || v === '1';
          nftsList = raw.filter(n =>
            isTruthy(n?.isForSale) || isTruthy(n?.IsForSale) ||
            isTruthy(n?.isActive) || isTruthy(n?.IsActive) ||
            isTruthy(n?.isListed) || isTruthy(n?.IsListed)
          );
          break;
        }
        default: {
          response = await getAllNFTs(1, 200);
          nftsList = response?.items || response?.data || [];
          break;
        }
      }
      setNfts(nftsList);
      

      updateStats(nftsList, response);
    } catch (error) {
      console.error('Error loading NFTs:', error);
      toast.error('Помилка завантаження NFT');
      setNfts([]);
    } finally {
      setLoading(false);
    }
  };

  const updateStats = (nftsList, response) => {
    const totalNFTs = response?.totalCount || response?.total || nftsList.length;
    const mintedNFTs = nftsList.filter(nft => nft.isMinted || nft.tokenId).length;
    const totalVolume = nftsList
      .filter(nft => (nft.isForSale || nft.isListed) && nft.price)
      .reduce((sum, nft) => sum + parseFloat(nft.price || 0), 0);
    const creators = new Set(nftsList.map(nft => nft.creatorWalletAddress || nft.ownerWalletAddress)).size;

    setStats({
      totalNFTs,
      mintedNFTs,
      totalVolume: totalVolume.toFixed(2),
      totalCreators: creators
    });
  };

  const handleTabChange = (tabIndex) => {
    setActiveTab(tabIndex);
  };

  const handleConnectWallet = async () => {
    try {
      await connect();
      toast.success('Гаманець підключено успішно!');
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast.error('Помилка підключення гаманця');
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 0: return 'NFT Маркетплейс';
      case 1: return 'Мої NFT';
      case 2: return 'Улюблені NFT';
      default: return 'NFT Маркетплейс';
    }
  };

  const getPageDescription = () => {
    switch (activeTab) {
      case 0: return 'Купуйте та продавайте унікальні NFT на Polygon мережі';
      case 1: return 'Керуйте своїм портфоліо NFT та створюйте нові';
      case 2: return 'Ваші улюблені NFT зібрані в одному місці';
      default: return 'Децентралізований маркетплейс для торгівлі NFT';
    }
  };

  const tabs = [
    { id: 0, label: 'NFT', icon: '🎨' },
    ...(isAuthenticated ? [
      { id: 1, label: 'Мої NFT', icon: '💎' },
      { id: 2, label: 'Улюблені', icon: '❤️' }
    ] : [])
  ];


  const filteredAndSortedNFTs = React.useMemo(() => {
    let filtered = [...nfts];


    if (searchTerm) {
      filtered = filtered.filter(nft =>
        nft.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nft.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
        break;
      case 'price-low':
        filtered.sort((a, b) => (parseFloat(a.price || 0) - parseFloat(b.price || 0)));
        break;
      case 'price-high':
        filtered.sort((a, b) => (parseFloat(b.price || 0) - parseFloat(a.price || 0)));
        break;
      case 'name':
        filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      default:
        break;
    }

    return filtered;
  }, [nfts, searchTerm, sortBy]);

  return (
    <div className="min-h-screen">
      {showMarketplaceAnimation && (
        <>
          {isFirstMarketplaceVisit ? (
            <EnhancedLogoAnimation onComplete={handleMarketplaceAnimationComplete} />
          ) : (
            <MinimalTransitionAnimation onComplete={handleMarketplaceAnimationComplete} />
          )}
        </>
      )}

      <div className={`transition-all duration-100 ease-out ${showMarketplaceAnimation ? 'opacity-0 scale-99' : 'opacity-100 scale-100'}`}>
        <section className="relative py-16 overflow-hidden">

        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-purple-900/20 to-pink-900/20"></div>
      

        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-40 right-32 w-24 h-24 bg-pink-500/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-32 left-32 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto mb-8">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white leading-tight">
              <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                {getPageTitle()}
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              {getPageDescription()}
            </p>
            

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/nft-market/create">
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-xl">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Створити NFT
                </Button>
              </Link>
              
              {!isConnected && (
                <Button onClick={handleConnectWallet} variant="outline" className="border-gray-600 hover:bg-gray-800/50 text-white hover:border-purple-500 px-8 py-3 rounded-xl">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Підключити гаманець
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>
 
      <section className="py-8">
        <div className="container mx-auto px-4">


          <div className="mb-8">
            <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-xl p-6">

              <div className="mb-4 pb-4 border-b border-gray-700">
                <div className="flex flex-wrap gap-2 justify-center">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center space-x-1 ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-500/20'
                          : 'bg-gray-700/50 border border-gray-600 text-gray-300 hover:text-white hover:border-purple-500/50 hover:bg-gray-700'
                      }`}
                    >
                      <span className="text-sm">{tab.icon}</span>
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Пошук NFT..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                >
                  <option value="newest">Найновіші</option>
                  <option value="oldest">Найстаріші</option>
                  <option value="price-low">Ціна: низька → висока</option>
                  <option value="price-high">Ціна: висока → низька</option>
                  <option value="name">За назвою</option>
                </select>

                <div className="flex items-center justify-center">
                  <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg">
                    {filteredAndSortedNFTs.length} результатів
                  </Badge>
                </div>
              </div>
                    </div>
      </div>

          {loading ? (

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 px-2">
              {Array.from({ length: 12 }).map((_, index) => (
                <div key={index} className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-xl overflow-hidden animate-pulse">
                  <div className="w-full aspect-[4/3] bg-gray-700"></div>
                  <div className="p-3">
                    <div className="h-5 bg-gray-700 rounded mb-2"></div>
                    <div className="h-3 bg-gray-700 rounded mb-2 w-3/4"></div>
                    <div className="h-6 bg-gray-700 rounded mb-2"></div>
                    <div className="h-8 bg-gray-700 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredAndSortedNFTs.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 px-2">
              {filteredAndSortedNFTs.map((nft) => (
                <MarketplaceNFTCard
                  key={nft.id}
                  nft={nft}
                  isOwner={account && nft.ownerWalletAddress?.toLowerCase() === account.toLowerCase()}
                  onUpdate={loadNFTs}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="mb-6">
                <svg className="w-20 h-20 mx-auto text-gray-600 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <h3 className="text-2xl font-semibold text-white mb-3">
                  {activeTab === 0 ? 'Поки що немає NFT' : 
                   activeTab === 1 ? 'У вас ще немає NFT' :
                   'Немає улюблених NFT'}
                </h3>
                <p className="text-gray-400 mb-6">
                  {activeTab === 1 ? 'Створіть свій перший NFT або купіть існуючий' :
                   activeTab === 2 ? 'Додайте NFT в улюблені для швидкого доступу' :
                   'Станьте першим хто створить NFT на нашому маркетплейсі!'}
                </p>
                {activeTab !== 2 && (
                  <Link to="/nft-market/create">
                    <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-xl">
                      Створити NFT
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </section>


      <footer className="mt-16 py-12 bg-gray-900/50 border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-xl p-6 text-center hover:bg-gray-900/90 transition-colors">
              <div className="text-3xl md:text-4xl font-bold text-purple-400 mb-2">{stats.totalNFTs}</div>
              <div className="text-gray-400 text-sm md:text-base">Всього NFT</div>
            </div>
            <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-xl p-6 text-center hover:bg-gray-900/90 transition-colors">
              <div className="text-3xl md:text-4xl font-bold text-purple-400 mb-2">{stats.mintedNFTs || 0}</div>
              <div className="text-gray-400 text-sm md:text-base">Замінчені</div>
            </div>
            <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-xl p-6 text-center hover:bg-gray-900/90 transition-colors">
              <div className="text-3xl md:text-4xl font-bold text-purple-400 mb-2">{stats.totalVolume}</div>
              <div className="text-gray-400 text-sm md:text-base">MATIC об'єм</div>
            </div>
            <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-xl p-6 text-center hover:bg-gray-900/90 transition-colors">
              <div className="text-3xl md:text-4xl font-bold text-purple-400 mb-2">{stats.totalCreators}</div>
              <div className="text-gray-400 text-sm md:text-base">Творців</div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-800 text-center">
            <p className="text-gray-400 text-sm">
              © 2024 NFT Marketplace. Створюйте, купуйте та продавайте унікальні цифрові активи.
            </p>
          </div>
        </div>
      </footer>

      {isAuthenticated && (
        <Link to="/nft-market/create">
          <button className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white p-4 rounded-full shadow-lg shadow-purple-500/25 transition-all duration-300 hover:scale-110 z-50">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </Link>
      )}
      </div>
    </div>
  );
};

export default MarketplacePage;