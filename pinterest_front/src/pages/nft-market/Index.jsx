import { Button } from "../../components/nft-market/ui/button.jsx";
import { Card, CardContent } from "../../components/nft-market/ui/card.jsx";
import { Badge } from "../../components/nft-market/ui/badge.jsx";
import { Link } from "react-router-dom";

const mockNFTs = [
  {
    id: 1,
    title: "Cosmic Voyager #001",
    price: "2.5 ETH",
    image: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=400&h=400&fit=crop",
    creator: "CryptoArtist",
    likes: 234,
    views: 1500
  },
  {
    id: 2,
    title: "Cyberpunk Dreams",
    price: "1.8 ETH",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=400&fit=crop",
    creator: "NeonMaster",
    likes: 189,
    views: 950
  },
  {
    id: 3,
    title: "Digital Renaissance",
    price: "3.2 ETH",
    image: "https://images.unsplash.com/photo-1635322966219-b75ed372eb01?w=400&h=400&fit=crop",
    creator: "PixelVisioneer",
    likes: 342,
    views: 2100
  },
  {
    id: 4,
    title: "Abstract Reality",
    price: "0.9 ETH",
    image: "https://images.unsplash.com/photo-1636953056323-9c09fdd74fa6?w=400&h=400&fit=crop",
    creator: "ModernMuse",
    likes: 156,
    views: 780
  }
];

const Index = () => {
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
              <Button size="lg" variant="outline" className="text-lg px-10 py-4 rounded-xl border-gray-600 hover:bg-gray-800/50 text-white hover:border-purple-500 transition-all duration-300">
                Переглянути колекції
              </Button>
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
            <Button variant="ghost" className="text-white hover:bg-gray-800/50">
              Переглянути всі
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mockNFTs.map((nft) => (
              <Link key={nft.id} to={`/nft-market/nft/${nft.id}`}>
                <Card className="group hover:scale-105 transition-all duration-300 bg-gray-800/80 backdrop-blur-sm border border-gray-700 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/20 rounded-xl overflow-hidden">
                  <CardContent className="p-0">
                    <div className="relative overflow-hidden">
                      <img 
                        src={nft.image} 
                        alt={nft.title}
                        className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-2 py-1 rounded text-xs font-medium">
                          Нове
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-2 text-white group-hover:text-purple-400 transition-colors">
                        {nft.title}
                      </h3>
                      <p className="text-gray-400 mb-3 text-sm">
                        Від {nft.creator}
                      </p>
                      
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl font-bold text-purple-400">
                          {nft.price}
                        </span>
                        <div className="flex items-center space-x-3 text-sm text-gray-400">
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                            {nft.likes}
                          </div>
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            {nft.views}
                          </div>
                        </div>
                      </div>
                      
                      <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-2 rounded-lg font-medium transition-all duration-300">
                        Купити зараз
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-900/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <h3 className="text-4xl font-bold text-purple-400 mb-2">50K+</h3>
              <p className="text-gray-400">Творців</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold text-purple-400 mb-2">2M+</h3>
              <p className="text-gray-400">NFT продано</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold text-purple-400 mb-2">890K</h3>
              <p className="text-gray-400">ETH об'єм</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold text-purple-400 mb-2">120K+</h3>
              <p className="text-gray-400">Користувачів</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index; 