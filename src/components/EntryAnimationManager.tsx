
import React, { useState, useEffect } from 'react';
import EntryAnimation from '@/components/EntryAnimation';

interface EntryAnimationManagerProps {
  user: any;
  onComplete: () => void;
}

const EntryAnimationManager: React.FC<EntryAnimationManagerProps> = ({ user, onComplete }) => {
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

  return (
    <>
      {showEntryAnimation && (
        <EntryAnimation onComplete={handleEntryAnimationComplete} />
      )}
    </>
  );
};

export default EntryAnimationManager;
