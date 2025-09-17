import { useState } from "react";
import { Button } from "../../components/nft-market/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/nft-market/ui/card.jsx";
import { Badge } from "../../components/nft-market/ui/badge.jsx";
import { Link } from "react-router-dom";

const userNFTs = [
  {
    id: 1,
    title: "My Digital Art #001",
    price: "1.5 ETH",
    image: "https://images.unsplash.com/photo-1634193295627-1cdddf751ebf?w=300&h=300&fit=crop",
    status: "listed"
  },
  {
    id: 2,
    title: "Cosmic Journey",
    price: "2.1 ETH",
    image: "https://images.unsplash.com/photo-1635322966219-b75ed372eb01?w=300&h=300&fit=crop",
    status: "sold"
  },
  {
    id: 3,
    title: "Abstract Thoughts",
    price: "0.8 ETH",
    image: "https://images.unsplash.com/photo-1636953056323-9c09fdd74fa6?w=300&h=300&fit=crop",
    status: "draft"
  }
];

const Profile = () => {
  const [activeTab, setActiveTab] = useState("created");

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Profile Header */}
        <div className="relative mb-8">
          {/* Cover Image */}
          <div className="h-48 md:h-64 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg overflow-hidden">
          </div>
          
          {/* Profile Info */}
          <div className="relative -mt-16 px-6">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
              <div className="w-32 h-32 border-4 border-gray-900 rounded-full overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop"
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                  <div className="bg-gray-900/90 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50">
                    <h1 className="text-3xl font-bold mb-2 text-white">Ukrainian Artist</h1>
                    <p className="text-gray-300 mb-4 max-w-2xl leading-relaxed">
                      Цифровий художник, що досліджує межі між технологією та мистецтвом. 
                      Створюю унікальні NFT, що поєднують традиційні техніки з сучасними інноваціями.
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>Приєднався: Січень 2023</span>
                      <span>•</span>
                      <span>50 створено</span>
                      <span>•</span>
                      <span>1.2K підписників</span>
                    </div>
                  </div>
                  
                                           <div className="flex items-center gap-3 mt-4 md:mt-0">
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
              <p className="text-2xl font-bold text-purple-400">45.7 ETH</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800/80 backdrop-blur-sm border border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400">Створено</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-white">50</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800/80 backdrop-blur-sm border border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400">Продано</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-white">32</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800/80 backdrop-blur-sm border border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400">Підписники</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-white">1,234</p>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userNFTs.map((nft) => (
                  <Link key={nft.id} to={`/nft-market/nft/${nft.id}`}>
                    <Card className="group hover:scale-105 transition-all duration-300 bg-gray-800/80 backdrop-blur-sm border border-gray-700 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/20 rounded-xl overflow-hidden">
                      <CardContent className="p-0">
                        <div className="relative overflow-hidden">
                          <img 
                            src={nft.image} 
                            alt={nft.title}
                            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute top-3 right-3">
                            <Badge className={
                              nft.status === "listed" 
                                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white px-2 py-1 rounded text-xs font-medium"
                                : nft.status === "sold" 
                                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white px-2 py-1 rounded text-xs font-medium"
                                : "bg-gray-600 text-gray-300 px-2 py-1 rounded text-xs font-medium"
                            }>
                              {nft.status === "listed" ? "На продажу" : nft.status === "sold" ? "Продано" : "Чернетка"}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="p-4">
                          <h3 className="font-semibold text-lg mb-2 text-white group-hover:text-purple-400 transition-colors">
                            {nft.title}
                          </h3>
                          <div className="flex items-center justify-between">
                            <span className="text-xl font-bold text-purple-400">
                              {nft.price}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
          
          {activeTab === "collected" && (
            <div className="mt-6">
              <div className="text-center py-12">
                <div className="mb-6">
                  <svg className="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <h3 className="text-xl font-semibold text-white mb-2">Порожня колекція</h3>
                  <p className="text-gray-400">Ви ще не зібрали жодного NFT</p>
                </div>
                <Link to="/nft-market">
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
      </div>
    </div>
  );
};

export default Profile; 