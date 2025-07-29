import { useState, useEffect } from 'react';

const INTRO_ANIMATION_KEY = 'nft_marketplace_intro_shown';

export const useIntroAnimation = () => {
  const [showIntro, setShowIntro] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {

    const hasShownIntro = localStorage.getItem(INTRO_ANIMATION_KEY);
    
    if (!hasShownIntro) {
      setShowIntro(true);
    }
    
    setIsLoading(false);
  }, []);

  const completeIntro = () => {
    setShowIntro(false);

    localStorage.setItem(INTRO_ANIMATION_KEY, 'true');
  };

  const resetIntro = () => {
    localStorage.removeItem(INTRO_ANIMATION_KEY);
    setShowIntro(true);
  };

  return {
    showIntro,
    isLoading,
    completeIntro,
    resetIntro
  };
};

