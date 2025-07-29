import { Outlet, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from '../nft-market/Navbar.jsx';
import '../../pages/nft-market/nft-market.css';
import '../../pages/nft-market/transition-animations.css';

const NFTLayout = () => {
  const location = useLocation();
  const [showNavbar, setShowNavbar] = useState(() => {
    // Початково ховаємо navbar під час будь-якої анімації на головній сторінці
    if (location.pathname === '/nft-marketplace') {
      // Завжди ховаємо navbar на початку, показуємо після анімації
      return false;
    }
    return true;
  });

  useEffect(() => {
    // Ховаємо navbar тільки на головній сторінці NFT marketplace під час анімації
    if (location.pathname === '/nft-marketplace') {
      console.log('Hiding navbar for animation');
      setShowNavbar(false);
      
      // Слухаємо подію завершення анімації
      const handleAnimationComplete = () => {
        console.log('Animation completed, showing navbar');
        setShowNavbar(true);
      };
      
      window.addEventListener('nftAnimationComplete', handleAnimationComplete);
      
      return () => {
        window.removeEventListener('nftAnimationComplete', handleAnimationComplete);
      };
    } else {
      // На всіх інших сторінках показуємо navbar завжди
      setShowNavbar(true);
    }
  }, [location.pathname]);

  return (
    <div className="nft-marketplace-container min-h-screen bg-gray-900 nft-market">
      <div className={!showNavbar ? 'hide-navbar' : ''}>
        <Navbar />
      </div>
      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default NFTLayout;
