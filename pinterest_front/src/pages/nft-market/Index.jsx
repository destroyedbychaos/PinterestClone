import { useState, useEffect } from "react";
import { Button } from "../../components/nft-market/ui/button.jsx";
import { Link } from "react-router-dom";
import { useNFT } from "../../hooks/useNFT.js";
import { useAuth } from "../../hooks/useAuth.js";
import { useWeb3 } from "../../contexts/Web3Context.jsx";
import MarketplaceNFTCard from "../../components/nft-market/MarketplaceNFTCard.jsx";
import { toast } from "react-toastify";

const Index = () => {
  const { getAllNFTs, isLoading } = useNFT();
  const { isAuthenticated } = useAuth();
  const { account } = useWeb3();
  const [nfts, setNfts] = useState([]);
  const [loadingNFTs, setLoadingNFTs] = useState(true);
  const [stats, setStats] = useState({
    totalNFTs: 0,
    mintedNFTs: 0,
    totalCreators: 0,
    totalVolume: 0
  });

  // Завантаження NFT при завантаженні компонента та зміні авторизації
  useEffect(() => {
    loadNFTs();
  }, [isAuthenticated]);

  const loadNFTs = async () => {
    try {
      setLoadingNFTs(true);
      const data = await getAllNFTs(1, 12); // Завантажуємо 12 NFT для головної сторінки
      setNfts(data.items || []);
      
      // Оновлюємо статистику
      const totalNFTs = data.totalCount || 0;
      const mintedNFTs = (data.items || []).filter(nft => nft.isMinted).length;
      const creators = new Set((data.items || []).map(nft => nft.creatorWalletAddress)).size;
      const totalVolume = (data.items || [])
        .filter(nft => nft.isForSale && nft.price)
        .reduce((sum, nft) => sum + parseFloat(nft.price || 0), 0);
      
      setStats({
        totalNFTs,
        mintedNFTs,
        totalCreators: creators,
        totalVolume: totalVolume.toFixed(2)
      });
    } catch (error) {
      console.error('Error loading NFTs:', error);
      toast.error('Помилка завантаження NFT');
      setNfts([]);
    } finally {
      setLoadingNFTs(false);
    }
  };
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        {/* Dark background with subtle purple/pink gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-purple-900/20 to-pink-900/20"></div>
        
        {/* Abstract glowing elements in background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-40 right-32 w-24 h-24 bg-pink-500/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-32 left-32 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-5xl mx-auto">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 text-white leading-tight">
              Відкрийте
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent animate-float">
                Майбутнє NFT
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Створюйте, купуйте та продавайте унікальні цифрові активи на найсучаснішому маркетплейсі
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link to="/nft-market/create">
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-lg px-10 py-4 rounded-xl shadow-lg hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105 neon-glow">
                  <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Почати створювати
                </Button>
              </Link>
              <Link to="/nft-market/marketplace">
                <Button size="lg" variant="outline" className="text-lg px-10 py-4 rounded-xl border-gray-600 hover:bg-gray-800/50 text-white hover:border-purple-500 transition-all duration-300">
                  Переглянути маркетплейс
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Recently Added NFTs */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-white flex items-center">
              <svg className="w-8 h-8 mr-3 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Щойно додані
            </h2>
            <Link to="/nft-market/marketplace">
              <Button variant="ghost" className="text-white hover:bg-gray-800/50">
                Переглянути всі
              </Button>
            </Link>
          </div>
          
          {loadingNFTs ? (
            // Skeleton loading
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
          ) : nfts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 px-2">
              {nfts.map((nft) => (
                <MarketplaceNFTCard
                  key={nft.id}
                  nft={nft}
                  isOwner={account && nft.ownerWalletAddress?.toLowerCase() === account.toLowerCase()}
                  onUpdate={loadNFTs}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
                <div className="mb-6">
                  <svg className="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  <h3 className="text-xl font-semibold text-white mb-2">Поки що немає NFT</h3>
                  <p className="text-gray-400">Станьте першим хто створить NFT на нашому маркетплейсі!</p>
                </div>
                <Link to="/nft-market/create">
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3">
                    Створити NFT
                  </Button>
                </Link>
              </div>
            )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-900/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <h3 className="text-4xl font-bold text-purple-400 mb-2">{stats.totalNFTs}</h3>
              <p className="text-gray-400">Всього NFT</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold text-purple-400 mb-2">{stats.mintedNFTs}</h3>
              <p className="text-gray-400">Замінчені NFT</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold text-purple-400 mb-2">{stats.totalVolume}</h3>
              <p className="text-gray-400">MATIC об'єм</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold text-purple-400 mb-2">{stats.totalCreators}</h3>
              <p className="text-gray-400">Творців</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index; 