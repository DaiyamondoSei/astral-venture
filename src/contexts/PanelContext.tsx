import React, { createContext, useState, useCallback } from 'react';
import type { PanelType, PanelPosition, PanelState } from '@/hooks/usePanelState';

/**
 * Creates the Panel context with state management for panels
 */
export const PanelContext = createContext<PanelState | null>(null);

/**
 * Props for the PanelProvider component
 */
interface IPanelProviderProps {
  children: React.ReactNode;
}

/**
 * Panel provider component that manages panel state
 */
export const PanelProvider: React.FC<IPanelProviderProps> = ({ children }) => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [activePanelType, setActivePanelType] = useState<PanelType>(null);
  const [activePanelPosition, setActivePanelPosition] = useState<PanelPosition>('bottom');

  /**
   * Opens a panel
   */
  const openPanel = useCallback((panelType: Exclude<PanelType, null>, position: PanelPosition = 'bottom') => {
    setActivePanelType(panelType);
    setActivePanelPosition(position);
    setIsPanelOpen(true);
  }, []);

  /**
   * Closes the current panel
   */
  const closePanel = useCallback(() => {
    setIsPanelOpen(false);
    // Keep the panel type for animations, clear it after closing
    setTimeout(() => {
      if (!isPanelOpen) {
        setActivePanelType(null);
      }
    }, 300);
  }, [isPanelOpen]);

  /**
   * Toggles a panel open/closed
   */
  const togglePanel = useCallback((panelType: Exclude<PanelType, null>, position: PanelPosition = 'bottom') => {
    if (isPanelOpen && activePanelType === panelType) {
      closePanel();
    } else {
      openPanel(panelType, position);
    }
  }, [isPanelOpen, activePanelType, openPanel, closePanel]);

  // The panel state that will be provided through the context
  const panelState: PanelState = {
    isPanelOpen,
    activePanelType,
    activePanelPosition,
    setIsPanelOpen,
    openPanel,
    closePanel,
    togglePanel
  };

  return (
    <PanelContext.Provider value={panelState}>
      {children}
    </PanelContext.Provider>
  );
};

export default PanelContext;
