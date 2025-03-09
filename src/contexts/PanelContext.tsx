
import React, { createContext, useContext } from 'react'
import { usePanelState, PanelType } from '@/hooks/usePanelState'

interface PanelContextProps {
  activePanel: PanelType
  isProfileOpen: boolean
  isAchievementsOpen: boolean
  openPanel: (panel: PanelType) => void
  closePanel: (panel?: PanelType) => void
  togglePanel: (panel: PanelType) => void
}

const PanelContext = createContext<PanelContextProps | undefined>(undefined)

export function PanelProvider({ children }: { children: React.ReactNode }) {
  const panelState = usePanelState()
  
  return (
    <PanelContext.Provider value={panelState}>
      {children}
    </PanelContext.Provider>
  )
}

export function usePanel() {
  const context = useContext(PanelContext)
  
  if (context === undefined) {
    throw new Error('usePanel must be used within a PanelProvider')
  }
  
  return context
}
