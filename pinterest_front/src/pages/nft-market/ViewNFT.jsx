import { useParams } from "react-router-dom";
import { Button } from "../../components/nft-market/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/nft-market/ui/card.jsx";
import { Badge } from "../../components/nft-market/ui/badge.jsx";

const ViewNFT = () => {
  const { id } = useParams();
  
  // Mock NFT data
  const nft = {
    id: id,
    title: "Cosmic Voyager #001",
    description: "Унікальний цифровий твір мистецтва, що досліджує межі космосу та людської уяви. Створений за допомогою передових цифрових технік та штучного інтелекту.",
    image: "https://images.unsplash.com/photo-1634193295627-1cdddf751ebf?w=600&h=600&fit=crop",
    price: "2.5 ETH",
    priceUsd: "$4,250",
    creator: {
      name: "CryptoArtist",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
      verified: true
    },
    owner: {
      name: "DigitalCollector",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"
    },
    properties: [
      { trait: "Background", value: "Cosmic", rarity: "15%" },
      { trait: "Style", value: "Abstract", rarity: "8%" },
      { trait: "Color Scheme", value: "Neon", rarity: "23%" },
      { trait: "Elements", value: "Geometric", rarity: "12%" }
    ],
    stats: {
      views: 1542,
      likes: 234,
      listed: "2 дні тому"
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* NFT Image */}
          <div className="space-y-4">
            <Card className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 overflow-hidden">
              <CardContent className="p-0">
                <div className="relative group">
                  <img 
                    src={nft.image} 
                    alt={nft.title}
                    className="w-full aspect-square object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-4 right-4 flex gap-2">
                      <Button size="sm" variant="outline" className="bg-black/50 backdrop-blur-sm text-white border-gray-600 hover:bg-gray-700">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Properties */}
            <Card className="bg-gray-800/80 backdrop-blur-sm border border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Властивості
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {nft.properties.map((prop, index) => (
                    <div key={index} className="p-3 bg-gray-700/50 rounded-lg border border-gray-600">
                      <p className="text-sm text-gray-400">{prop.trait}</p>
                      <p className="font-semibold text-white">{prop.value}</p>
                      <p className="text-xs text-purple-400">{prop.rarity} мають</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* NFT Details */}
          <div className="space-y-6">
            {/* Title and Actions */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2 text-white">{nft.title}</h1>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {nft.stats.views} переглядів
                    </div>
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      {nft.stats.likes} вподобань
                    </div>
                    <div className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Опубліковано {nft.stats.listed}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" className="text-white border-gray-600 hover:bg-gray-700">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </Button>
                  <Button size="sm" variant="outline" className="text-white border-gray-600 hover:bg-gray-700">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                  </Button>
                  <Button size="sm" variant="outline" className="text-white border-gray-600 hover:bg-gray-700">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                    </svg>
                  </Button>
                </div>
              </div>
              
              <p className="text-gray-300 leading-relaxed">
                {nft.description}
              </p>
            </div>

            {/* Creator and Owner */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700">
                <CardContent className="p-4">
                  <p className="text-sm text-gray-400 mb-2">Створювач</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden">
                      <img src={nft.creator.avatar} alt="Creator" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="font-semibold flex items-center gap-1 text-white">
                        {nft.creator.name}
                        {nft.creator.verified && (
                          <span className="text-purple-400">✓</span>
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700">
                <CardContent className="p-4">
                  <p className="text-sm text-gray-400 mb-2">Власник</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden">
                      <img src={nft.owner.avatar} alt="Owner" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">{nft.owner.name}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Price and Purchase */}
            <Card className="bg-gray-800/80 backdrop-blur-sm border border-gray-700">
              <CardContent className="p-6">
                <div className="mb-4">
                  <p className="text-sm text-gray-400 mb-1">Поточна ціна</p>
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-bold text-purple-400">{nft.price}</span>
                    <span className="text-xl text-gray-400">{nft.priceUsd}</span>
                  </div>
                </div>
                
                <hr className="my-4 border-gray-600" />
                
                <div className="space-y-3">
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-lg py-6 shadow-lg hover:shadow-purple-500/25 transition-all duration-300">
                    Купити зараз
                  </Button>
                  <Button variant="outline" className="w-full text-lg py-6 text-white border-gray-600 hover:bg-gray-700">
                    Зробити пропозицію
                  </Button>
                </div>
                
                <div className="mt-4 p-3 bg-gray-700/30 rounded-lg">
                  <p className="text-sm text-gray-300 flex items-center gap-2">
                    <span className="text-yellow-400">💡</span>
                    Цей NFT може бути відразу придбаний за вказаною ціною
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Trading History */}
            <Card className="bg-gray-800/80 backdrop-blur-sm border border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Історія торгів</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                    <div>
                      <p className="font-semibold text-white">Виставлено на продаж</p>
                      <p className="text-sm text-gray-400">DigitalCollector</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-white">2.5 ETH</p>
                      <p className="text-sm text-gray-400">2 дні тому</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewNFT; 