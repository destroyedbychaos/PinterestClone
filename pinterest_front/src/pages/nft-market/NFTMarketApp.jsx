import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "../../components/nft-market/Navbar.jsx";
import Index from "./index.jsx";
import MarketplacePage from "./MarketplacePage.jsx";
import Profile from "./Profile.jsx";
import EditProfile from "./EditProfile.jsx";
import ViewNFT from "./ViewNFT.jsx";
import CreateNFT from "./CreateNFT.jsx";
import NotFound from "./NotFound.jsx";
import EnhancedLogoAnimation from "../../components/nft-market/EnhancedLogoAnimation.jsx";
import MinimalTransitionAnimation from "../../components/nft-market/MinimalTransitionAnimation.jsx";
import "../../pages/nft-market/nft-market.css";
import "../../pages/nft-market/transition-animations.css";

const NFTMarketApp = () => {
  const [showFirstAnimation, setShowFirstAnimation] = useState(false);
  const [showSecondAnimation, setShowSecondAnimation] = useState(false);

  useEffect(() => {
    const hasVisited = sessionStorage.getItem('visitedNFTMarket');
    
    if (hasVisited === 'true') {

      setShowSecondAnimation(true);
    } else {

      setShowFirstAnimation(true);
      sessionStorage.setItem('visitedNFTMarket', 'true');
    }
  }, []);

  const handleFirstAnimationComplete = () => {
    setShowFirstAnimation(false);
    setTimeout(() => {
      const contentElement = document.querySelector('.nft-market-content');
      if (contentElement) {
        contentElement.classList.add('show-immediately');
      }
    }, 10);
  };

  const handleSecondAnimationComplete = () => {
    setShowSecondAnimation(false);
    setTimeout(() => {
      const contentElement = document.querySelector('.nft-market-content');
      if (contentElement) {
        contentElement.classList.add('show-immediately');
      }
    }, 10);
  };
  
  return (
    <div className="min-h-screen bg-gray-900 nft-market">

      {showFirstAnimation && (
        <EnhancedLogoAnimation onComplete={handleFirstAnimationComplete} />
      )}
      

      {showSecondAnimation && (
        <MinimalTransitionAnimation onComplete={handleSecondAnimationComplete} />
      )}
      

      <div className={`nft-market-content transition-all duration-100 ease-out ${(showFirstAnimation || showSecondAnimation) ? 'opacity-0 scale-99' : 'opacity-100 scale-100'}`}>
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