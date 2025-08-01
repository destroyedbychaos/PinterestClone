import { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "../../components/nft-market/Navbar.jsx";
import Index from "./Index.jsx";
import MarketplacePage from "./MarketplacePage.jsx";
import Profile from "./Profile.jsx";
import EditProfile from "./EditProfile.jsx";
import ViewNFT from "./ViewNFT.jsx";
import CreateNFT from "./CreateNFT.jsx";
import NotFound from "./NotFound.jsx";
import TransitionAnimation from "../../components/nft-market/TransitionAnimation.jsx";
import DynamicTransitionAnimation from "../../components/nft-market/DynamicTransitionAnimation.jsx";
import "../../pages/nft-market/nft-market.css";
import "../../pages/nft-market/transition-animations.css";

const NFTMarketApp = () => {
  const [showAnimation, setShowAnimation] = useState(true);
  const [isFirstVisit, setIsFirstVisit] = useState(true);
  const [showDynamicAnimation, setShowDynamicAnimation] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Перевіряємо, чи це перший візит на NFT маркетплейс
    const hasVisitedNFTMarket = sessionStorage.getItem('visitedNFTMarket');
    
    if (hasVisitedNFTMarket) {
      // Показуємо динамічну анімацію для повторних відвідувань
      setShowDynamicAnimation(true);
      setIsFirstVisit(false);
    } else {
      // Показуємо повну анімацію при першому відвідуванні
      sessionStorage.setItem('visitedNFTMarket', 'true');
    }


  }, []);

  const handleAnimationComplete = () => {
    setShowAnimation(false);
  };

  const handleDynamicAnimationComplete = () => {
    setShowDynamicAnimation(false);
    // Миттєво показуємо контент після завершення анімації
    setTimeout(() => {
      const contentElement = document.querySelector('.nft-market-content');
      if (contentElement) {
        contentElement.classList.add('show-immediately');
      }
    }, 10);
  };

  console.log('NFTMarketApp rendered!');
  
  return (
    <div className="min-h-screen bg-gray-900 nft-market">
      {showAnimation && isFirstVisit && (
        <TransitionAnimation onComplete={handleAnimationComplete} />
      )}
      
      {showDynamicAnimation && !isFirstVisit && (
        <DynamicTransitionAnimation onComplete={handleDynamicAnimationComplete} />
      )}
      
      <div className={`nft-market-content transition-all duration-100 ease-out ${(showAnimation || showDynamicAnimation) ? 'opacity-0 scale-99' : 'opacity-100 scale-100'}`}>
        <Navbar />
        <Routes>
          <Route path="" element={<Index />} />
          <Route path="marketplace" element={<MarketplacePage />} />
          <Route path="profile" element={<Profile />} />
          <Route path="profile/edit" element={<EditProfile />} />
          <Route path="nft/:id" element={<ViewNFT />} />
          <Route path="create" element={<CreateNFT />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>


    </div>
  );
};

export default NFTMarketApp; 