
import { useContext } from 'react';
import { PanelContext } from '@/contexts/PanelContext';

/**
 * Panel types supported by the application
 */
export type PanelType = 'achievements' | 'profile' | 'settings' | null;

/**
 * Panel position options
 */
export type PanelPosition = 'bottom' | 'right';

/**
 * Panel state interface
 */
export interface PanelState {
  isPanelOpen: boolean;
  activePanelType: PanelType;
  activePanelPosition: PanelPosition;
  setIsPanelOpen: (isOpen: boolean) => void;
  openPanel: (panelType: Exclude<PanelType, null>, position?: PanelPosition) => void;
  closePanel: () => void;
  togglePanel: (panelType: Exclude<PanelType, null>, position?: PanelPosition) => void;
}

/**
 * Custom hook to access panel state
 * Provides methods to open, close, and toggle panels
 */
export const usePanelState = (): PanelState => {
  const context = useContext(PanelContext);
  
  if (!context) {
    throw new Error('usePanelState must be used within a PanelProvider');
  }
  
  return context;
};

export default usePanelState;
