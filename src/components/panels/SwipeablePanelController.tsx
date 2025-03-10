
import React from 'react';
import SwipeablePanel from '@/components/ui/swipeable-panel';
import AchievementsPanel from './AchievementsPanel';
import UserProfilePanel from './UserProfilePanel';
import { usePanelState } from '@/hooks/usePanelState';

/**
 * Manages the swipeable panels throughout the application
 */
const SwipeablePanelController: React.FC = () => {
  const { 
    isPanelOpen, 
    setIsPanelOpen,
    activePanelType,
    activePanelPosition
  } = usePanelState();

  // Handle panel open/close state changes
  const handlePanelStateChange = (open: boolean) => {
    setIsPanelOpen(open);
  };

  const renderPanelContent = () => {
    switch (activePanelType) {
      case 'achievements':
        return <AchievementsPanel />;
      case 'profile':
        return <UserProfilePanel />;
      default:
        return null;
    }
  };

  const getPanelSettings = () => {
    // Default settings
    let height = '80vh';
    let initialState: 'open' | 'closed' = 'closed';
    let position: 'bottom' | 'right' = 'bottom';

    // Customize based on panel type
    if (activePanelType === 'profile') {
      height = '90vh';
    } else if (activePanelType === 'achievements') {
      height = '85vh';
    }

    // Apply position from context
    if (activePanelPosition === 'right') {
      position = 'right';
    } else {
      position = 'bottom';
    }

    if (isPanelOpen) {
      initialState = 'open';
    }

    return { height, initialState, position };
  };

  const { height, initialState, position } = getPanelSettings();

  if (!activePanelType) return null;

  return (
    <SwipeablePanel
      isOpen={isPanelOpen}
      onClose={() => handlePanelStateChange(false)}
      position={position}
      height={height}
      initialState={initialState}
    >
      {renderPanelContent()}
    </SwipeablePanel>
  );
};

export default SwipeablePanelController;
