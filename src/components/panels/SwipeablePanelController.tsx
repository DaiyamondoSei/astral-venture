
import React from 'react';
import SwipeablePanel from '@/components/ui/swipeable-panel';
import AchievementsPanel from './AchievementsPanel';
import UserProfilePanel from './UserProfilePanel';
import { usePanelState } from '@/hooks/usePanelState';

/**
 * Manages the swipeable panels throughout the application
 * Controls which panel is displayed and its position
 */
const SwipeablePanelController: React.FC = () => {
  const { 
    isPanelOpen, 
    setIsPanelOpen,
    activePanelType,
    activePanelPosition
  } = usePanelState();

  // Handle panel open/close state changes
  const handlePanelStateChange = (open: boolean): void => {
    setIsPanelOpen(open);
  };

  // Render the appropriate panel content based on activePanelType
  const renderPanelContent = (): React.ReactNode => {
    switch (activePanelType) {
      case 'achievements':
        return <AchievementsPanel />;
      case 'profile':
        return <UserProfilePanel />;
      default:
        return null;
    }
  };

  // Calculate panel settings based on panel type and position
  const getPanelSettings = (): {
    height: string;
    initialState: 'open' | 'closed';
    position: 'bottom' | 'right';
  } => {
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
    position = activePanelPosition;

    // Set initial state based on isPanelOpen
    if (isPanelOpen) {
      initialState = 'open';
    }

    return { height, initialState, position };
  };

  const { height, initialState, position } = getPanelSettings();

  // Don't render anything if no panel is active
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
