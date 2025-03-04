
import React, { useState, useEffect } from 'react';
import EntryAnimation from '@/components/EntryAnimation';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisitedQuanex');
    const dreamCaptureCompleted = localStorage.getItem('dreamCaptureCompleted');
    
    if (!hasVisited && user) {
      // If first visit and dream not captured yet, navigate to dream capture
      if (!dreamCaptureCompleted) {
        navigate('/dream-capture');
      } else {
        // If they've already done dream capture, show entry animation
        setShowEntryAnimation(true);
      }
      localStorage.setItem('hasVisitedQuanex', 'true');
    } else {
      setFirstLoad(false);
    }
  }, [user, navigate]);

  const handleEntryAnimationComplete = () => {
    setShowEntryAnimation(false);
    setFirstLoad(false);
    onComplete();
  };

  const handleTriggerAnimation = () => {
    // Clear the localStorage flag to allow the animation to show again
    if (user) {
      localStorage.removeItem(`entry-animation-shown-${user.id}`);
      localStorage.removeItem('dreamCaptureCompleted'); // Also reset dream capture
    }
    
    // For test button, first go to dream capture
    navigate('/dream-capture');
  };

  const handleSkipAnimation = () => {
    setShowEntryAnimation(false);
    setFirstLoad(false);
    onComplete();
  };

  return (
    <>
      {showEntryAnimation && (
        <>
          <a 
            href="#main-content" 
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-black/80 focus:text-white focus:rounded-md"
            onClick={handleSkipAnimation}
          >
            Skip animation and continue to main content
          </a>
          <EntryAnimation onComplete={handleEntryAnimationComplete} />
        </>
      )}
      
      {showTestButton && !showEntryAnimation && (
        <div className="fixed bottom-4 right-4 z-50">
          <Button 
            onClick={handleTriggerAnimation}
            className="bg-gradient-to-r from-quantum-500 to-astral-500 hover:from-quantum-600 hover:to-astral-600 rounded-full"
            size="sm"
            aria-label="Experience entry animation sequence"
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
