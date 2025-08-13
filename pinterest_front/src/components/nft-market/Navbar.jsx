import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "./ui/button.jsx";
import { useWeb3 } from "../../contexts/Web3Context.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { toast } from "react-toastify";
import "./home-transition.css";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { account, isConnected, connect, disconnect, balance, isConnecting } = useWeb3();
  const { isAuthenticated, login, logout, user, isLoading } = useAuth();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleConnectWallet = async () => {
    try {
      await connect();
      toast.success('Гаманець підключено успішно!');

    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast.error('Помилка підключення гаманця');
    }
  };

  const handleLogin = async () => {
    try {
      await login();
      toast.success('Авторизація успішна!');
    } catch (error) {
      console.error('Error during login:', error);
      toast.error('Помилка авторизації');
    }
  };

  const handleLogout = () => {
    logout();
    disconnect();
    toast.info('Ви вийшли з системи');
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatBalance = (balance) => {
    return parseFloat(balance).toFixed(4);
  };

  const isActive = (path) => location.pathname === path;

  const handleHomeTransition = () => {
    setIsTransitioning(true);
    

    const homeButton = document.querySelector('.home-transition-btn');
    if (homeButton) {
      homeButton.classList.add('exploding');
    }


    const content = document.querySelector('.nft-market-content');
    if (content) {
      content.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.6, 1)';
      content.style.transform = 'scale(0.95) translateY(-20px)';
      content.style.opacity = '0';
      content.style.filter = 'blur(5px)';
    }

    createParticleEffect();

    setTimeout(() => {
      navigate('/');
    }, 800);
  };

  const createParticleEffect = () => {
    const particles = [];
    const homeButton = document.querySelector('.home-transition-btn');
    if (!homeButton) return;

    const rect = homeButton.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div');
      particle.className = 'transition-particle';
      particle.style.cssText = `
        position: fixed;
        width: 6px;
        height: 6px;
        background: linear-gradient(45deg, #8B5CF6, #EC4899);
        border-radius: 50%;
        left: ${centerX}px;
        top: ${centerY}px;
        pointer-events: none;
        z-index: 9999;
        animation: particleExplode 1s ease-out forwards;
        --random-x: ${(Math.random() - 0.5) * 400}px;
        --random-y: ${(Math.random() - 0.5) * 400}px;
      `;
      
      document.body.appendChild(particle);

      setTimeout(() => {
        particle.remove();
      }, 1000);
    }
  };

  return (
    <>
      <nav className="bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">

          <div className="flex items-center space-x-3">
            <Link to="/nft-market" className="flex items-center space-x-3 group">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent group-hover:from-purple-300 group-hover:to-pink-300 transition-all duration-300">
                Aestify
              </span>
            </Link>

            <button
              onClick={handleHomeTransition}
              disabled={isTransitioning}
              className="home-transition-btn group relative flex items-center justify-center w-10 h-10 bg-gray-800 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 rounded-lg transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-50"
              title="Повернутися на головну сторінку Aestify"
            >
              <svg 
                className="w-5 h-5 text-gray-400 group-hover:text-white transition-all duration-300 group-hover:scale-110" 
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
              

              <div className="tooltip absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-2 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none">
                <span>🏠 Головна сторінка Aestify</span>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
              </div>
              

              <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute inset-0 rounded-lg animate-ping bg-blue-400/20"></div>
              </div>
            </button>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <Link 
              to="/nft-market" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/nft-market') 
                  ? 'text-purple-400 bg-purple-400/10' 
                  : 'text-gray-300 hover:text-white hover:bg-gray-900'
              }`}
            >
              Головна
            </Link>
            <Link 
              to="/nft-market/marketplace" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/nft-market/marketplace') 
                  ? 'text-purple-400 bg-purple-400/10' 
                  : 'text-gray-300 hover:text-white hover:bg-gray-900'
              }`}
            >
              Маркетплейс
            </Link>
            <Link 
              to="/nft-market/create" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/nft-market/create') 
                  ? 'text-purple-400 bg-purple-400/10' 
                  : 'text-gray-300 hover:text-white hover:bg-gray-900'
              }`}
            >
              Створити
            </Link>
            {isAuthenticated && (
              <Link 
                to="/nft-market/profile" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/nft-market/profile') 
                    ? 'text-purple-400 bg-purple-400/10' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-900'
                }`}
              >
                Профіль
              </Link>
            )}
          </div>




          <div className="flex items-center space-x-4">
            {isConnected && (
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-300">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>{formatBalance(balance)} MATIC</span>
              </div>
            )}

            {!isConnected ? (
              <Button 
                onClick={handleConnectWallet} 
                disabled={isConnecting}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                {isConnecting ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Підключення...</span>
                  </div>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Підключити гаманець
                  </>
                )}
              </Button>
            ) : !isAuthenticated ? (
              <Button 
                onClick={handleLogin}
                disabled={isLoading}
                className={`${isLoading ? 'opacity-50 cursor-not-allowed' : ''} bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white`}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {isLoading ? 'Авторизація...' : 'Увійти'}
              </Button>
            ) : (

              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-900 transition-colors"
                >
                  <img 
                    src={user?.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${account}`}
                    alt="Profile" 
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-white">
                      {user?.nickname || formatAddress(account)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatAddress(account)}
                    </p>
                  </div>
                  <svg 
                    className={`w-4 h-4 text-gray-400 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-lg shadow-lg border border-gray-800 py-1 z-50">
                    <Link 
                      to="/nft-market/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Мій профіль
                    </Link>
                    <Link 
                      to="/nft-market/profile/edit"
                      className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Редагувати профіль
                    </Link>
                    <div className="border-t border-gray-700 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                    >
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Вийти
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="md:hidden border-t border-gray-800">
        <div className="px-2 pt-2 pb-3 space-y-1">

          <button
            onClick={handleHomeTransition}
            disabled={isTransitioning}
                              className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-900 transition-colors disabled:opacity-50 flex items-center"
          >
            🏠 <span className="ml-2">Головна сторінка Aestify</span>
          </button>
          
          <Link 
            to="/nft-market"
            className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
              isActive('/nft-market') 
                ? 'text-purple-400 bg-purple-400/10' 
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            NFT Marketplace
          </Link>
          <Link 
            to="/nft-market/create"
            className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
              isActive('/nft-market/create') 
                ? 'text-purple-400 bg-purple-400/10' 
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            Створити
          </Link>
          {isAuthenticated && (
            <Link 
              to="/nft-market/profile"
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                isActive('/nft-market/profile') 
                  ? 'text-purple-400 bg-purple-400/10' 
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              Профіль
            </Link>
          )}
        </div>
      </div>
    </nav>

    </>
  );
};

export default Navbar;