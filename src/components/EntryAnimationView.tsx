
import React, { useState, useEffect } from 'react';
import OrbToAstralTransition from '@/components/OrbToAstralTransition';
import EntryAnimationManager from '@/components/EntryAnimationManager';

interface EntryAnimationViewProps {
  user: any;
  onComplete: () => void;
  showTestButton: boolean;
}

const EntryAnimationView: React.FC<EntryAnimationViewProps> = ({ 
  user, 
  onComplete,
  showTestButton
}) => {
  const [animationCompleted, setAnimationCompleted] = useState(false);

  const handleEntryAnimationComplete = () => {
    setAnimationCompleted(true);
    if (user) {
      localStorage.setItem(`entry-animation-shown-${user.id}`, 'true');
    }

    setTimeout(() => {
      onComplete();
    }, 1000);
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <EntryAnimationManager 
        user={user} 
        onComplete={handleEntryAnimationComplete} 
        showTestButton={showTestButton}
      />
      
      <OrbToAstralTransition onComplete={handleEntryAnimationComplete} />
      
      {animationCompleted && (
        <div className="text-center mt-8 animate-fade-in">
          <p className="text-white/80 mb-4">
            Your astral field is now calibrated to your energy frequency.
          </p>
          <button 
            onClick={onComplete}
            className="px-6 py-2 rounded-full bg-gradient-to-r from-quantum-500 to-astral-500 text-white"
          >
            Continue to Your Practice
          </button>
        </div>
      )}
    </div>
  );
};

export default EntryAnimationView;
