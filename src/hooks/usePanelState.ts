
import { useState, useCallback } from 'react'

export type PanelType = 'profile' | 'achievements' | null

interface PanelState {
  activePanel: PanelType
  isProfileOpen: boolean
  isAchievementsOpen: boolean
  openPanel: (panel: PanelType) => void
  closePanel: (panel?: PanelType) => void
  togglePanel: (panel: PanelType) => void
}

export function usePanelState(): PanelState {
  const [activePanel, setActivePanel] = useState<PanelType>(null)
  
  const isProfileOpen = activePanel === 'profile'
  const isAchievementsOpen = activePanel === 'achievements'
  
  const openPanel = useCallback((panel: PanelType) => {
    setActivePanel(panel)
  }, [])
  
  const closePanel = useCallback((panel?: PanelType) => {
    if (!panel || panel === activePanel) {
      setActivePanel(null)
    }
  }, [activePanel])
  
  const togglePanel = useCallback((panel: PanelType) => {
    setActivePanel(prev => prev === panel ? null : panel)
  }, [])
  
  return {
    activePanel,
    isProfileOpen,
    isAchievementsOpen,
    openPanel,
    closePanel,
    togglePanel
  }
}
