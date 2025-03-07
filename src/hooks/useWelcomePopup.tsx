
import { useState, useEffect } from 'react';

interface UseWelcomePopupOptions {
  userId?: string;
  autoShow?: boolean;
  delay?: number;
}

export const useWelcomePopup = ({
  userId,
  autoShow = true,
  delay = 1000
}: UseWelcomePopupOptions = {}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenShown, setHasBeenShown] = useState(false);
  
  useEffect(() => {
    if (!autoShow) return;
    
    const hasSeenWelcome = userId 
      ? localStorage.getItem(`welcome-popup-seen-${userId}`) 
      : localStorage.getItem('welcome-popup-seen');
    
    if (!hasSeenWelcome && !hasBeenShown) {
      const timer = setTimeout(() => {
        setIsVisible(true);
        setHasBeenShown(true);
      }, delay);
      
      return () => clearTimeout(timer);
    }
  }, [userId, autoShow, delay, hasBeenShown]);
  
  const showWelcome = () => {
    setIsVisible(true);
    setHasBeenShown(true);
  };
  
  const hideWelcome = () => {
    setIsVisible(false);
  };
  
  const completeWelcome = () => {
    if (userId) {
      localStorage.setItem(`welcome-popup-seen-${userId}`, 'true');
    } else {
      localStorage.setItem('welcome-popup-seen', 'true');
    }
    
    setIsVisible(false);
  };
  
  const resetWelcome = () => {
    if (userId) {
      localStorage.removeItem(`welcome-popup-seen-${userId}`);
    } else {
      localStorage.removeItem('welcome-popup-seen');
    }
    setHasBeenShown(false);
  };
  
  return {
    isVisible,
    showWelcome,
    hideWelcome,
    completeWelcome,
    resetWelcome
  };
};
