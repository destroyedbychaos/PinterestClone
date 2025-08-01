import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "../../components/nft-market/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/nft-market/ui/card.jsx";
import { Badge } from "../../components/nft-market/ui/badge.jsx";
import { Link } from "react-router-dom";
import { useWeb3 } from "../../contexts/Web3Context.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { useUser } from "../../hooks/useUser.js";
import { useNFT } from "../../hooks/useNFT.js";
import NFTManageCard from "../../components/nft-market/NFTManageCard.jsx";
import { toast } from "react-toastify";
import { getFullImageUrl, handleImageError } from "../../utils/imageUtils.js";


const Profile = () => {
  const { walletAddress } = useParams(); // Отримуємо wallet адресу з URL
  const { account } = useWeb3();
  const { user: currentUser } = useAuth();
  const { getUserProfile } = useUser();
  const { getUserNFTs, getUserCreatedNFTs, getUserFavorites } = useNFT();

  
  const [activeTab, setActiveTab] = useState("created");
  const [userProfile, setUserProfile] = useState(null);
  const [userNFTs, setUserNFTs] = useState([]);
  const [userFavorites, setUserFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingNFTs, setIsLoadingNFTs] = useState(false);

  // Визначаємо чий це профіль
  const targetWallet = walletAddress || account;
  const isOwnProfile = account && targetWallet?.toLowerCase() === account.toLowerCase();

  // Завантаження даних профілю
  useEffect(() => {
    if (targetWallet) {
      loadUserProfile();
    }
  }, [targetWallet]);

  // Завантаження NFT при зміні таба
  useEffect(() => {
    if (targetWallet) {
      if (activeTab === "created") {
        loadUserCreatedNFTs();
      } else if (activeTab === "owned") {
        loadUserOwnedNFTs();
      } else if (activeTab === "collected") {
        loadUserFavorites();
      }
    }
  }, [activeTab, targetWallet]);

  const loadUserProfile = async () => {
    try {
      setIsLoading(true);
      const profile = await getUserProfile(targetWallet);
      setUserProfile(profile);
    } catch (error) {
      console.error('Error loading user profile:', error);
      // Якщо профіль не знайдений, створюємо базовий об'єкт
      setUserProfile({
        walletAddress: targetWallet,
        nickname: `Користувач ${targetWallet.slice(0, 6)}...${targetWallet.slice(-4)}`,
        bio: 'Цей користувач ще не заповнив свій профіль.',
        avatarUrl: null,
        bannerUrl: null,
        createdAt: new Date(),
        nftCount: 0,
        totalVolume: 0,
        followersCount: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Завантаження створених користувачем NFT  
  const loadUserCreatedNFTs = async () => {
    try {
      setIsLoadingNFTs(true);
      const data = await getUserCreatedNFTs(targetWallet);
      console.log('Created NFTs data:', data); // Для дебагу
      setUserNFTs(data.NFTs?.NFTs || data.items || []);
    } catch (error) {
      console.error('Error loading user created NFTs:', error);
      setUserNFTs([]);
    } finally {
      setIsLoadingNFTs(false);
    }
  };

  // Завантаження NFT у власності користувача (старий метод)
  const loadUserOwnedNFTs = async () => {
    try {
      setIsLoadingNFTs(true);
      const nfts = await getUserNFTs(targetWallet);
      setUserNFTs(nfts.items || []);
    } catch (error) {
      console.error('Error loading user owned NFTs:', error);
      setUserNFTs([]);
    } finally {
      setIsLoadingNFTs(false);
    }
  };

  // Функція для оновлення NFT після змін
  const handleNFTUpdate = () => {
    if (activeTab === "created") {
      loadUserCreatedNFTs();
    } else if (activeTab === "owned") {
      loadUserOwnedNFTs();
    }
    loadUserProfile(); // Оновлюємо також профіль для статистики
  };

  const loadUserFavorites = async () => {
    try {
      setIsLoadingNFTs(true);
      const favorites = await getUserFavorites(targetWallet);
      setUserFavorites(favorites.items || []);
    } catch (error) {
      console.error('Error loading user favorites:', error);
      setUserFavorites([]);
    } finally {
      setIsLoadingNFTs(false);
    }
  };

  const getStatusBadge = (nft) => {
    if (nft.isForSale) return { text: "На продажу", class: "bg-gradient-to-r from-purple-600 to-pink-600 text-white px-2 py-1 rounded text-xs font-medium" };
    if (nft.isMinted) return { text: "Створено", class: "bg-gradient-to-r from-green-600 to-blue-600 text-white px-2 py-1 rounded text-xs font-medium" };
    return { text: "Чернетка", class: "bg-gray-600 text-gray-300 px-2 py-1 rounded text-xs font-medium" };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('uk-UA', {
      year: 'numeric',
      month: 'long'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-48 md:h-64 bg-gray-700 rounded-lg mb-8"></div>
            <div className="flex items-center gap-6 mb-8">
              <div className="w-32 h-32 bg-gray-700 rounded-full"></div>
              <div className="flex-1">
                <div className="h-8 bg-gray-700 rounded mb-4 w-1/3"></div>
                <div className="h-4 bg-gray-700 rounded mb-2 w-2/3"></div>
                <div className="h-4 bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Profile Header */}
        <div className="relative mb-8">
          {/* Cover Image */}
          <div className="h-48 md:h-64 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg overflow-hidden">
            {userProfile?.bannerUrl ? (
              <img 
                src={getFullImageUrl(userProfile.bannerUrl)} 
                alt="Banner" 
                className="w-full h-full object-cover"
                onError={handleImageError}
              />
            ) : null}
          </div>
          
          {/* Profile Info */}
          <div className="relative -mt-16 px-6">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
              <div className="w-32 h-32 border-4 border-gray-900 rounded-full overflow-hidden">
                <img 
                  src={getFullImageUrl(userProfile?.avatarUrl) || `https://api.dicebear.com/7.x/identicon/svg?seed=${targetWallet}`}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    handleImageError(e, targetWallet);
                  }}
                />
              </div>
              
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                  <div className="bg-gray-900/90 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50">
                    <h1 className="text-3xl font-bold mb-2 text-white">
                      {userProfile?.nickname || 
                        `${targetWallet?.slice(0, 6)}...${targetWallet?.slice(-4)}`
                      }
                    </h1>
                    <p className="text-gray-300 mb-4 max-w-2xl leading-relaxed">
                      {userProfile?.bio || 'Цей користувач ще не заповнив опис профілю.'}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>Приєднався: {userProfile?.createdAt ? formatDate(userProfile.createdAt) : 'Невідомо'}</span>
                      <span>•</span>
                      <span>{userProfile?.nftCount || 0} створено</span>
                      <span>•</span>
                      <span>{userProfile?.followersCount || 0} підписників</span>
                    </div>
                  </div>
                  
                  {isOwnProfile && (
                    <div className="flex items-center gap-3 mt-4 md:mt-0 flex-wrap">
                      <Link to="/nft-market/profile/edit">
                        <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Редагувати
                        </Button>
                      </Link>
                      

                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gray-800/80 backdrop-blur-sm border border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400">Загальний об'єм</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-purple-400">
                {userProfile?.totalVolume || 0} MATIC
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800/80 backdrop-blur-sm border border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400">Створено</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-white">
                {userProfile?.nftCount || userNFTs.length || 0}
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800/80 backdrop-blur-sm border border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400">Продано</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-white">
                {userNFTs.filter(nft => nft.isSold).length || 0}
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800/80 backdrop-blur-sm border border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400">Підписники</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-white">
                {userProfile?.followersCount || 0}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* NFT Tabs */}
        <div className="w-full">
          <div className="grid w-full grid-cols-2 bg-gray-800/50 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("created")}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                activeTab === "created" 
                  ? "bg-gray-900 text-white shadow-sm" 
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Створені
            </button>
            <button
              onClick={() => setActiveTab("collected")}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                activeTab === "collected" 
                  ? "bg-gray-900 text-white shadow-sm" 
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              Колекція
            </button>
          </div>
          
          {activeTab === "created" && (
            <div className="mt-6">
              {isLoadingNFTs ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <Card key={index} className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden animate-pulse">
                      <CardContent className="p-0">
                        <div className="w-full h-48 bg-gray-700"></div>
                        <div className="p-4">
                          <div className="h-6 bg-gray-700 rounded mb-2"></div>
                          <div className="h-8 bg-gray-700 rounded"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : userNFTs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userNFTs.map((nft) => (
                    isOwnProfile ? (
                      // Для власного профілю показуємо карточки з управлінням
                      <NFTManageCard 
                        key={nft.id} 
                        nft={nft} 
                        onUpdate={handleNFTUpdate} 
                      />
                    ) : (
                      // Для чужого профілю - тільки перегляд
                      <Link key={nft.id} to={`/nft-market/nft/${nft.id}`}>
                        <Card className="group hover:scale-105 transition-all duration-300 bg-gray-900/80 backdrop-blur-sm border border-gray-800 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/20 rounded-xl overflow-hidden">
                          <CardContent className="p-0">
                            <div className="relative overflow-hidden">
                              <img 
                                src={getFullImageUrl(nft.imageUrl)} 
                                alt={nft.name}
                                className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                                onError={(e) => handleImageError(e, 'NFT')}
                              />
                              <div className="absolute top-3 right-3">
                                <Badge className={getStatusBadge(nft).class}>
                                  {getStatusBadge(nft).text}
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="p-4">
                              <h3 className="font-semibold text-lg mb-2 text-white group-hover:text-purple-400 transition-colors">
                                {nft.name}
                              </h3>
                              <div className="flex items-center justify-between">
                                <span className="text-xl font-bold text-purple-400">
                                  {nft.price ? `${nft.price} ${nft.currency || 'MATIC'}` : 'Не продається'}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    )
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="mb-6">
                    <svg className="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {isOwnProfile ? 'Ви ще не створили NFT' : 'Користувач ще не створив NFT'}
                    </h3>
                    <p className="text-gray-400">
                      {isOwnProfile ? 'Почніть створювати унікальні цифрові активи!' : 'Цей користувач ще не створив жодного NFT.'}
                    </p>
                    {isOwnProfile && (
                      <Link to="/nft-market/create" className="mt-4 inline-block">
                        <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3">
                          Створити NFT
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {activeTab === "collected" && (
            <div className="mt-6">
              {isLoadingNFTs ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <Card key={index} className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-xl overflow-hidden animate-pulse">
                      <CardContent className="p-0">
                        <div className="w-full h-48 bg-gray-700"></div>
                        <div className="p-4">
                          <div className="h-6 bg-gray-700 rounded mb-2"></div>
                          <div className="h-8 bg-gray-700 rounded"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : userFavorites.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userFavorites.map((nft) => (
                    <Link key={nft.id} to={`/nft-market/nft/${nft.id}`}>
                      <Card className="group hover:scale-105 transition-all duration-300 bg-gray-900/80 backdrop-blur-sm border border-gray-800 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/20 rounded-xl overflow-hidden">
                        <CardContent className="p-0">
                          <div className="relative overflow-hidden">
                            <img 
                              src={getFullImageUrl(nft.imageUrl)} 
                              alt={nft.name}
                              className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                              onError={(e) => handleImageError(e, 'NFT')}
                            />
                            <div className="absolute top-3 left-3">
                              <Badge className="bg-red-600 text-white px-2 py-1 rounded text-xs font-medium">
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                                Улюблене
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="p-4">
                            <h3 className="font-semibold text-lg mb-2 text-white group-hover:text-purple-400 transition-colors">
                              {nft.name}
                            </h3>
                            <p className="text-gray-400 mb-3 text-sm">
                              Від {nft.creatorWalletAddress ? 
                                `${nft.creatorWalletAddress.slice(0, 6)}...${nft.creatorWalletAddress.slice(-4)}` : 
                                'Невідомий'
                              }
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-xl font-bold text-purple-400">
                                {nft.price ? `${nft.price} ${nft.currency || 'MATIC'}` : 'Не продається'}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="mb-6">
                    <svg className="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <h3 className="text-xl font-semibold text-white mb-2">Порожня колекція</h3>
                    <p className="text-gray-400">
                      {isOwnProfile ? 'Ви ще не додали жодного NFT до улюблених' : 'Цей користувач ще не має улюблених NFT'}
                    </p>
                    <Link to="/nft-market" className="mt-4 inline-block">
                      <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 shadow-lg hover:shadow-purple-500/25 transition-all duration-300">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Переглянути маркетплейс
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile; 