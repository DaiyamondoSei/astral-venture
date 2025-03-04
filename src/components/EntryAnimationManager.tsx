
import React, { useState, useEffect } from 'react';
import EntryAnimation from '@/components/EntryAnimation';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

interface EntryAnimationManagerProps {
  user: any;
  onComplete: () => void;
  showTestButton?: boolean;
}

const EntryAnimationManager: React.FC<EntryAnimationManagerProps> = ({ 
  user, 
  onComplete,
  showTestButton = false
}) => {
  const [showEntryAnimation, setShowEntryAnimation] = useState(false);
  const [firstLoad, setFirstLoad] = useState(true);

  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisitedQuanex');
    if (!hasVisited && user) {
      setShowEntryAnimation(true);
      localStorage.setItem('hasVisitedQuanex', 'true');
    } else {
      setFirstLoad(false);
    }
  }, [user]);

  const handleEntryAnimationComplete = () => {
    setShowEntryAnimation(false);
    setFirstLoad(false);
    onComplete();
  };

  const handleTriggerAnimation = () => {
    // Clear the localStorage flag to allow the animation to show again
    if (user) {
      localStorage.removeItem(`entry-animation-shown-${user.id}`);
    }
    setShowEntryAnimation(true);
  };

  return (
    <>
      {showEntryAnimation && (
        <EntryAnimation onComplete={handleEntryAnimationComplete} />
      )}
      
      {showTestButton && !showEntryAnimation && (
        <div className="fixed bottom-4 right-4 z-50">
          <Button 
            onClick={handleTriggerAnimation}
            className="bg-gradient-to-r from-quantum-500 to-astral-500 hover:from-quantum-600 hover:to-astral-600 rounded-full"
            size="sm"
          >
            <Sparkles size={16} className="mr-2" />
            Experience Entry Animation
          </Button>
        </div>
      )}
    </>
  );
};

export default EntryAnimationManager;
