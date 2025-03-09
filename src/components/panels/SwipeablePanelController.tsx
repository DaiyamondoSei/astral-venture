
import React, { useEffect, useRef } from 'react'
import { usePanel } from '@/contexts/PanelContext'
import SwipeablePanel from '@/components/ui/swipeable-panel'
import UserProfilePanel from './UserProfilePanel'
import AchievementsPanel from './AchievementsPanel'

const SWIPE_THRESHOLD = 50

const SwipeablePanelController: React.FC = () => {
  const { 
    isProfileOpen, 
    isAchievementsOpen, 
    openPanel, 
    closePanel 
  } = usePanel()
  
  const touchStartY = useRef<number | null>(null)
  
  // Handle touch swipe gestures to open panels
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY
    }
    
    const handleTouchMove = (e: TouchEvent) => {
      if (touchStartY.current === null) return
      
      const touchY = e.touches[0].clientY
      const diff = touchY - touchStartY.current
      
      // Top edge swipe down to open profile panel
      if (touchStartY.current < 20 && diff > SWIPE_THRESHOLD && !isProfileOpen && !isAchievementsOpen) {
        openPanel('profile')
        touchStartY.current = null
      }
      
      // Bottom edge swipe up to open achievements panel
      const viewportHeight = window.innerHeight
      if (touchStartY.current > viewportHeight - 20 && diff < -SWIPE_THRESHOLD && !isProfileOpen && !isAchievementsOpen) {
        openPanel('achievements')
        touchStartY.current = null
      }
    }
    
    const handleTouchEnd = () => {
      touchStartY.current = null
    }
    
    // Add touch event listeners
    document.addEventListener('touchstart', handleTouchStart)
    document.addEventListener('touchmove', handleTouchMove)
    document.addEventListener('touchend', handleTouchEnd)
    
    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isProfileOpen, isAchievementsOpen, openPanel])
  
  return (
    <>
      {/* Top Profile Panel */}
      <SwipeablePanel
        isOpen={isProfileOpen}
        onOpenChange={(open) => !open && closePanel('profile')}
        height={{ peek: '15%', half: '50%', full: '90%' }}
        initialState="half"
        position="top"
      >
        <UserProfilePanel />
      </SwipeablePanel>
      
      {/* Bottom Achievements Panel */}
      <SwipeablePanel
        isOpen={isAchievementsOpen}
        onOpenChange={(open) => !open && closePanel('achievements')}
        height={{ peek: '15%', half: '50%', full: '90%' }}
        initialState="half"
        position="bottom"
      >
        <AchievementsPanel />
      </SwipeablePanel>
    </>
  )
}

export default SwipeablePanelController
