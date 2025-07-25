import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "./ui/button.jsx";
import { Input } from "./ui/input.jsx";
import { useState } from "react";
import ExitAnimation from "../layout/ExitAnimation";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showExitAnimation, setShowExitAnimation] = useState(false);
  
  const isActive = (path) => location.pathname === path;

  const handleExitToMain = () => {
    setShowExitAnimation(true);
  };

  const handleExitAnimationComplete = () => {
    navigate('/');
  };
  
  return (
    <nav className="border-b border-gray-700 bg-gray-900/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Link to="/nft-market" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg shadow-lg"></div>
              <span className="font-bold text-xl text-white">NeonNFT</span>
            </Link>
            
            {/* Home icon to return to main Aestify site */}
            <button 
              onClick={handleExitToMain}
              className="ml-4 p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-all duration-300 group"
              title="Повернутися на головний сайт"
            >
              <svg 
                className="w-4 h-4 text-gray-300 group-hover:text-white transition-colors duration-300" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
                />
              </svg>
            </button>
          </div>
          
          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <Input 
                placeholder="Пошук NFT, колекцій, створювачів..." 
                className="pl-12 bg-gray-800/50 border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-white placeholder-gray-400 rounded-xl"
              />
            </div>
          </div>
          
          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            {!isActive("/nft-market") && (
              <Link to="/nft-market">
                <Button 
                  variant="ghost"
                  className="text-white hover:bg-gray-800/50"
                >
                  Головна
                </Button>
              </Link>
            )}
            
            <Link to="/nft-market/create">
              <Button 
                variant="ghost"
                className={isActive("/nft-market/create") ? "bg-purple-600 hover:bg-purple-700 text-white" : "text-white hover:bg-gray-800/50"}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Створити
              </Button>
            </Link>
            
            <Link to="/nft-market/profile">
              <Button 
                variant="ghost"
                className={isActive("/nft-market/profile") ? "bg-purple-600 hover:bg-purple-700 text-white" : "text-white hover:bg-gray-800/50"}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Профіль
              </Button>
            </Link>
            
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-purple-500/25 transition-all duration-300">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Підключити гаманець
            </Button>
          </div>
        </div>
      </div>
      
      {/* Анімація виходу */}
      {showExitAnimation && (
        <ExitAnimation onComplete={handleExitAnimationComplete} />
      )}
    </nav>
  );
};

export default Navbar; 