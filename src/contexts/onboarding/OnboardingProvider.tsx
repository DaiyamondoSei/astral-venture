
import React, { createContext, useContext } from 'react';
import { OnboardingState } from './types';
import { useOnboardingState } from './useOnboardingState';

const OnboardingContext = createContext<OnboardingState | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const onboardingState = useOnboardingState();

  return (
    <>
      <div 
        id="a11y-announcer" 
        className="sr-only" 
        aria-live="polite" 
        aria-atomic="true"
      ></div>
      
      <OnboardingContext.Provider value={onboardingState}>
        {children}
      </OnboardingContext.Provider>
    </>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};
