import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/nft-market/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/nft-market/ui/card.jsx";
import { Badge } from "../../components/nft-market/ui/badge.jsx";
import { useWeb3 } from "../../contexts/Web3Context.jsx";
import { useNFTAuth } from "@/hooks/useNFTAuth";
import { useNFT } from "../../hooks/useNFT.js";
import { useMarketplace } from "../../hooks/useMarketplace.js";
import { toast } from "react-toastify";
import { getFullImageUrl, handleImageError } from "../../utils/imageUtils.js";

const ViewNFT = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { account, isConnected } = useWeb3();
  const { isAuthenticated } = useNFTAuth();
  const { getNFTById, addToFavorites, removeFromFavorites, mintNFT, deleteNFT } = useNFT();
  const { buyNFT, listNFTForSale, delistNFT, getListingStatus, isListedOnchain } = useMarketplace();
  
  const [nft, setNft] = useState(null);
  const [listingData, setListingData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showListingModal, setShowListingModal] = useState(false);
  const [listingPrice, setListingPrice] = useState("");
  const [isUpdatingFavorite, setIsUpdatingFavorite] = useState(false);
  const [onchainListed, setOnchainListed] = useState(false);

  const [debugViewAsBuyer, setDebugViewAsBuyer] = useState(() => {
    try { return localStorage.getItem('debugViewAsBuyer') === '1'; } catch { return false; }
  });
  const toggleDebugBuyer = () => {
    const next = !debugViewAsBuyer;
    setDebugViewAsBuyer(next);
    try { localStorage.setItem('debugViewAsBuyer', next ? '1' : '0'); } catch {}
    toast.info(next ? 'Debug: перегляд як покупець увімкнено' : 'Debug: перегляд як покупець вимкнено');
  };

  useEffect(() => {
    if (id) {
      loadNFT();
    }
  }, [id]);

  const loadNFT = async () => {
    try {
      setIsLoading(true);
      const nftData = await getNFTById(id);

      console.log('NFT Data loaded:', {
        id: nftData.id,
        name: nftData.name,
        price: nftData.price,
        priceType: typeof nftData.price,
        isForSale: nftData.isForSale,
        isMinted: nftData.isMinted,
        tokenId: nftData.tokenId,
        currency: nftData.currency,
        fullData: nftData
      });
      
      setNft(nftData);
      try {
        if (nftData?.tokenId) {
          const listed = await isListedOnchain(nftData.tokenId);
          setOnchainListed(!!listed);
        } else {
          setOnchainListed(false);
        }
      } catch { setOnchainListed(false); }
      

      if (nftData.isForSale) {
        try {
          const listing = await getListingStatus(nftData.id);
          console.log(' Marketplace Listing loaded:', listing);
          setListingData(listing);
        } catch (error) {
          console.warn('Warning: Could not load marketplace listing:', error);

        }
      } else {
        setListingData(null);
      }
      
    } catch (error) {
      console.error('Error loading NFT:', error);
      toast.error('Помилка завантаження NFT');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!isConnected || !isAuthenticated || !account) {
      toast.error('Потрібно підключити гаманець та авторизуватись');
      return;
    }

    try {
      setIsUpdatingFavorite(true);
      if (isFavorite) {
        await removeFromFavorites(account, nft.id);
        setIsFavorite(false);
        toast.success('Видалено з улюблених');
      } else {
        await addToFavorites(account, nft.id);
        setIsFavorite(true);
        toast.success('Додано до улюблених');
      }
    } catch (error) {
      console.error('Error updating favorites:', error);
      toast.error('Помилка оновлення улюблених');
    } finally {
      setIsUpdatingFavorite(false);
    }
  };


  const handleBuyNFT = async () => {
    if (!isConnected || !isAuthenticated) {
      toast.error('Спочатку підключіть гаманець та увійдіть в систему');
      return;
    }

    const salePrice = listingData?.price || nft.price;
    const tokenId = nft.tokenId;


    console.log(' Attempting to buy NFT:', { 
      nftId: nft.id, 
      tokenId: tokenId, 
      nftPrice: nft.price,
      listingPrice: listingData?.price,
      finalPrice: salePrice,
      priceType: typeof salePrice,
      isForSale: nft.isForSale,
      isMinted: nft.isMinted,
      hasListing: !!listingData,
      listingData: listingData
    });


    if (!nft.isForSale) {
      toast.error('Цей NFT не виставлений на продаж');
      return;
    }

    if (!nft.isMinted) {
      toast.error('Цей NFT ще не замінчений');
      return;
    }

    if (!tokenId) {
      toast.error('NFT не має токен ID');
      return;
    }



    setIsProcessing(true);
    try {

      const numericPrice = Number(salePrice);
      if (!salePrice || salePrice === '' || salePrice === null || salePrice === undefined || isNaN(numericPrice) || numericPrice <= 0) {
        throw new Error(`Ціна NFT некоректна: ${salePrice} (тип: ${typeof salePrice})`);
      }
      
      await buyNFT(nft.id, tokenId, salePrice);
      toast.success('NFT успішно придбано! Додаємо в "Всі NFT" вашого профілю.');

      await loadNFT();
      try { navigate(`/nft-marketplace/profile/${account}`); } catch {}
    } catch (error) {
      console.error('Error buying NFT:', error);
      toast.error('Помилка при покупці NFT');
    } finally {
      setIsProcessing(false);
    }
  };


  const handleListForSale = async () => {
    if (!listingPrice || parseFloat(listingPrice) <= 0) {
      toast.error('Введіть коректну ціну');
      return;
    }

    setIsProcessing(true);
    try {
      await listNFTForSale(nft.id, nft.tokenId, listingPrice);
      toast.success('NFT виставлено на продаж!');
      setShowListingModal(false);
      setListingPrice("");

      await loadNFT();
    } catch (error) {
      console.error('Error listing NFT:', error);
      toast.error('Помилка при виставленні на продаж');
    } finally {
      setIsProcessing(false);
    }
  };


  const handleMintNFT = async () => {
    if (!isConnected || !isAuthenticated) {
      toast.error('Спочатку підключіть гаманець та увійдіть в систему');
      return;
    }

    setIsProcessing(true);
    try {
      await mintNFT(nft.id, nft.metadataUrl, nft.royaltyFraction || 0);
      toast.success('NFT успішно змінтовано!');

      await loadNFT();
    } catch (error) {
      console.error('Error minting NFT:', error);
      toast.error('Помилка при мінтингу NFT');
    } finally {
      setIsProcessing(false);
    }
  };


  const handleDeleteNFT = async () => {
    if (!confirm('Ви впевнені, що хочете видалити цей NFT? Цю дію неможливо скасувати.')) {
      return;
    }

    setIsProcessing(true);
    try {
      await deleteNFT(nft.id, false); 
      toast.success('NFT успішно видалено!');

      navigate('/nft-marketplace/profile');
    } catch (error) {
      console.error('Error deleting NFT:', error);
      toast.error('Помилка при видаленні NFT');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('uk-UA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isOwner = account && nft?.ownerWalletAddress?.toLowerCase() === account.toLowerCase();

  if (isLoading) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-700 rounded-xl"></div>
              <div>
                <div className="h-8 bg-gray-700 rounded mb-4 w-3/4"></div>
                <div className="h-4 bg-gray-700 rounded mb-6 w-1/2"></div>
                <div className="h-32 bg-gray-700 rounded mb-6"></div>
                <div className="h-12 bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!nft) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-white mb-4">NFT не знайдено</h1>
            <p className="text-gray-400 mb-6">Цей NFT не існує або був видалений.</p>
            <Link to="/nft-marketplace">
              <Button>Повернутись до маркетплейсу</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="relative">
            <img 
                              src={getFullImageUrl(nft.imageUrl)} 
              alt={nft.name}
              className="w-full h-96 object-cover rounded-xl"
                              onError={(e) => handleImageError(e, 'NFT')}
            />
            
            <div className="absolute top-4 right-4 flex gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="bg-gray-900/80 backdrop-blur-sm border-gray-600 hover:bg-gray-800"
                onClick={() => navigator.share && navigator.share({
                  title: nft.name,
                  text: nft.description,
                  url: window.location.href
                })}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="bg-gray-900/80 backdrop-blur-sm border-gray-600 hover:bg-gray-800"
                onClick={handleFavoriteToggle}
                disabled={isUpdatingFavorite}
              >
                <svg 
                  className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} 
                  fill={isFavorite ? "currentColor" : "none"} 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-4">{nft.name}</h1>
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <img 
                    src={`https://api.dicebear.com/7.x/identicon/svg?seed=${nft.creatorWalletAddress}`}
                    alt="Creator"
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <p className="text-sm text-gray-400">Створено</p>
                    <div className="flex items-center gap-2">
                      <Link 
                        to={`/nft-market/profile/${nft.creatorWalletAddress}`}
                        className="text-white font-medium hover:text-purple-400 transition-colors"
                      >
                        {nft.creatorWalletAddress ? 
                          `${nft.creatorWalletAddress.slice(0, 6)}...${nft.creatorWalletAddress.slice(-4)}` : 
                          'Невідомий'
                        }
                      </Link>
                    </div>
                  </div>
                </div>
                
                {nft.ownerWalletAddress && nft.ownerWalletAddress !== nft.creatorWalletAddress && (
                  <div className="flex items-center gap-3">
                    <img 
                      src={`https://api.dicebear.com/7.x/identicon/svg?seed=${nft.ownerWalletAddress}`}
                      alt="Owner"
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <p className="text-sm text-gray-400">Власник</p>
                      <Link 
                        to={`/nft-market/profile/${nft.ownerWalletAddress}`}
                        className="text-white font-medium hover:text-purple-400 transition-colors"
                      >
                        {`${nft.ownerWalletAddress.slice(0, 6)}...${nft.ownerWalletAddress.slice(-4)}`}
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>


            <Card className="bg-gray-800/80 backdrop-blur-sm border border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Опис</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 leading-relaxed">
                  {nft.description || 'Опис не надано.'}
                </p>
              </CardContent>
            </Card>


            <Card className="bg-gray-800/80 backdrop-blur-sm border border-gray-700">
              <CardHeader>
                  <CardTitle className="text-white">Ціна</CardTitle>
                  {isOwner && nft.isForSale && (
                    <Button 
                      size="sm"
                      variant="outline" 
                      className="ml-auto border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                      onClick={async () => {
                        if (!confirm('Зняти NFT з продажу?')) return;
                        setIsProcessing(true);
                        try {
                          await delistNFT(nft.id, nft.tokenId);
                          toast.success('NFT знято з продажу');
                          await loadNFT();
                        } catch (e) {
                          console.error(e);
                          toast.error('Не вдалося зняти з продажу');
                        } finally {
                          setIsProcessing(false);
                        }
                      }}
                    >
                      Зняти з продажу
                    </Button>
                  )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    {(() => {
                      const displayPrice = listingData?.price || nft.price;
                      const currency = listingData?.currency || nft.currency || 'MATIC';
                      return (
                        <>
                          <p className="text-3xl font-bold text-purple-400">
                            {displayPrice ? `${displayPrice} ${currency}` : 'Не продається'}
                          </p>
                          {displayPrice && (
                            <p className="text-gray-400 text-sm">
                              ≈ ${((parseFloat(displayPrice) || 0) * 0.5).toFixed(2)} USD
                              {listingData && nft.price !== listingData.price && (
                                <span className="block text-yellow-400 text-xs">
                                  Ціна оновлена з маркетплейсу
                                </span>
                              )}
                            </p>
                          )}
                        </>
                      );
                    })()}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Статус</p>
                    <Badge className={
                      nft.isForSale 
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                        : nft.isMinted 
                        ? "bg-gradient-to-r from-green-600 to-blue-600 text-white"
                        : "bg-gray-600 text-gray-300"
                    }>
                      {nft.isForSale ? 'На продажу' : nft.isMinted ? 'Створено' : 'Чернетка'}
                    </Badge>
                    <div className="mt-2 text-xs text-gray-400">
                      On-chain: {onchainListed ? <span className="text-green-400">listed</span> : <span className="text-yellow-400">not listed</span>}
                    </div>
                    {isOwner && (
                      <div className="mt-2 text-xs text-gray-400">
                        <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                          <input type="checkbox" checked={debugViewAsBuyer} onChange={toggleDebugBuyer} />
                          <span>Debug: перегляд як покупець</span>
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">

                  {console.log('🔍 Button visibility check:', {
                    isForSale: nft.isForSale,
                    isOwner,
                    isMinted: nft.isMinted,
                    hasListing: !!listingData,
                    listingPrice: listingData?.price,
                    nftPrice: nft.price,
                    hasValidPrice: !!(listingData?.price || nft.price) && (listingData?.price || nft.price) > 0,
                    debugViewAsBuyer,
                    showBuyButton: (onchainListed || (nft.isForSale && ((listingData?.price || nft.price) > 0))) && (!isOwner || debugViewAsBuyer) && nft.isMinted
                  })}

                  {(onchainListed || (nft.isForSale && ((listingData?.price || nft.price) > 0))) && (!isOwner || debugViewAsBuyer) && nft.isMinted && (
                    <Button 
                      onClick={handleBuyNFT}
                      disabled={isProcessing}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white disabled:opacity-50"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      {isProcessing ? 'Покупка...' : 'Купити зараз'}
                    </Button>
                  )}
                  
                  {isOwner && nft.isMinted && !nft.isForSale && (
                    <Button 
                      onClick={() => setShowListingModal(true)}
                      disabled={isProcessing}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white disabled:opacity-50"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      Виставити на продаж
                    </Button>
                  )}

                  {isOwner && !nft.isMinted && (
                    <>
                      <Button 
                        onClick={handleMintNFT}
                        disabled={isProcessing}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white disabled:opacity-50"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        {isProcessing ? 'Мінтинг...' : 'Мінтити NFT'}
                      </Button>
                    </>
                  )}

                  {isOwner && (
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleDeleteNFT}
                        disabled={isProcessing}
                        variant="outline" 
                        className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white disabled:opacity-50"
                        title="Видалити NFT"
                      >
                        {isProcessing ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
                
                {isOwner && !nft.isMinted && (
                  <div className="mt-4 p-4 bg-yellow-400/10 border border-yellow-400/20 rounded-lg">
                    <div className="flex items-center gap-2 text-yellow-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <span className="font-medium">NFT не замінчено</span>
                    </div>
                    <p className="text-sm text-yellow-400/80 mt-1">
                      Це NFT існує тільки в базі даних. Щоб воно стало доступним для покупки та з'явилось на публічних сторінках, потрібно його замінтити на блокчейні.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>


            <Card className="bg-gray-800/80 backdrop-blur-sm border border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Статистика</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-purple-400">{nft.viewsCount || 0}</p>
                    <p className="text-sm text-gray-400">Переглядів</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-400">{nft.likesCount || 0}</p>
                    <p className="text-sm text-gray-400">Вподобань</p>
                  </div>
                </div>
              </CardContent>
            </Card>


            {nft.metadataUrl && (
              <Card className="bg-gray-800/80 backdrop-blur-sm border border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Метадані</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Створено:</span>
                      <span className="text-white">{formatDate(nft.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Мережа:</span>
                      <span className="text-white">Polygon</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Стандарт:</span>
                      <span className="text-white">ERC-721</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Метадані:</span>
                      <a 
                        href={nft.metadataUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-purple-400 hover:text-purple-300"
                      >
                        Переглянути IPFS
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>


      {showListingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Виставити NFT на продаж</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Ціна (MATIC)
              </label>
              <input
                type="number"
                step="0.001"
                min="0"
                value={listingPrice}
                onChange={(e) => setListingPrice(e.target.value)}
                placeholder="0.001"
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={() => {
                  setShowListingModal(false);
                  setListingPrice("");
                }}
                variant="outline" 
                className="flex-1 border-gray-600 text-white hover:bg-gray-700"
              >
                Скасувати
              </Button>
              <Button 
                onClick={handleListForSale}
                disabled={isProcessing || !listingPrice}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white disabled:opacity-50"
              >
                {isProcessing ? 'Виставляю...' : 'Виставити'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewNFT;