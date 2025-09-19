import { useState, useEffect } from "react";
import Index from "./index.jsx";
import NFTIntroAnimation from "../../components/nft-market/NFTIntroAnimation.jsx";
import MinimalTransitionAnimation from "../../components/nft-market/MinimalTransitionAnimation.jsx";

const NFTMarketApp = () => {
  const [showAnimation, setShowAnimation] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(false);

  useEffect(() => {
    try {
      const keys = Object.keys(sessionStorage);
      keys.forEach(key => {
        if (key.includes('aestify') || sessionStorage.getItem(key)?.includes?.('/aestify')) {
          sessionStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.log('Cache cleanup failed:', error);
    }

    const hasVisited = sessionStorage.getItem('visitedNFTMarket');
    const isFromPinterest = sessionStorage.getItem('nft_from_pinterest') === 'true';
    
    // Показуємо анімацію завжди
    if (!hasVisited) {
      // Перший візит - довга анімація
      setIsFirstVisit(true);
      setShowAnimation(true);
      sessionStorage.setItem('visitedNFTMarket', 'true');
    } else if (isFromPinterest) {
      // Повторний візит з Pinterest - коротка анімація
      setIsFirstVisit(false);
      setShowAnimation(true);
    } else {
      // Повторний візит без переходу з Pinterest - коротка анімація
      setIsFirstVisit(false);
      setShowAnimation(true);
    }
    
    // Очищуємо флаг переходу з Pinterest
    if (isFromPinterest) {
      sessionStorage.removeItem('nft_from_pinterest');
    }
  }, []);

  const handleAnimationComplete = () => {
    setShowAnimation(false);
    // Відправляємо подію про завершення анімації
    window.dispatchEvent(new CustomEvent('nftAnimationComplete'));
    setTimeout(() => {
      const contentElement = document.querySelector('.nft-market-content');
      if (contentElement) {
        contentElement.classList.add('show-immediately');
      }
    }, 10);
  };
  
  return (
    <div className="min-h-screen bg-gray-900 nft-market">

       {showAnimation && (
         <>
           {isFirstVisit ? (
             <NFTIntroAnimation onComplete={handleAnimationComplete} />
           ) : (
             <MinimalTransitionAnimation onComplete={handleAnimationComplete} />
           )}
         </>
       )}

      <div className={`nft-market-content transition-all duration-100 ease-out ${showAnimation ? 'opacity-0 scale-99' : 'opacity-100 scale-100'}`}>
        <Index />
      </div>
    </div>
  );
};

export default NFTMarketApp; 