
"use client"

import React, { useRef, useState, useEffect } from 'react'
import { motion, useSpring, useTransform, useMotionValue } from 'framer-motion'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { cn } from '@/lib/utils'

export type PanelPosition = 'top' | 'bottom'
export type PanelState = 'closed' | 'peek' | 'half' | 'full'

export interface SwipeablePanelProps {
  position: PanelPosition
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  className?: string
  initialState?: PanelState
  showHandle?: boolean
  backdropClassName?: string
  onStateChange?: (state: PanelState) => void
  height?: {
    peek?: number | string
    half?: number | string
    full?: number | string
  }
}

const SwipeablePanel = ({
  position,
  isOpen,
  onOpenChange,
  children,
  className,
  initialState = 'half',
  showHandle = true,
  backdropClassName,
  onStateChange,
  height = {
    peek: '15%',
    half: '50%',
    full: '90%',
  }
}: SwipeablePanelProps) => {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [panelState, setPanelState] = useState<PanelState>(isOpen ? initialState : 'closed')
  const panelRef = useRef<HTMLDivElement>(null)
  
  // Motion values for tracking drag
  const y = useMotionValue(0)
  const dragY = useMotionValue(0)
  
  // Spring animations for smooth transitions
  const springConfig = { damping: 30, stiffness: 300 }
  const animatedY = useSpring(y, springConfig)
  
  // Calculate panel heights for different states
  const getPanelHeight = (state: PanelState): number => {
    if (!panelRef.current) return 0
    const viewportHeight = window.innerHeight
    
    if (state === 'closed') return 0
    if (state === 'peek') {
      return typeof height.peek === 'string' && height.peek.includes('%')
        ? (viewportHeight * parseFloat(height.peek) / 100)
        : typeof height.peek === 'number' ? height.peek : 100
    }
    if (state === 'half') {
      return typeof height.half === 'string' && height.half.includes('%')
        ? (viewportHeight * parseFloat(height.half) / 100)
        : typeof height.half === 'number' ? height.half : 300
    }
    // Full state
    return typeof height.full === 'string' && height.full.includes('%')
      ? (viewportHeight * parseFloat(height.full) / 100)
      : typeof height.full === 'number' ? height.full : 500
  }
  
  // Transform y position based on panel position (top/bottom)
  const panelY = useTransform(() => {
    const height = getPanelHeight(panelState)
    
    if (position === 'top') {
      // For top panel, 0 is fully visible, negative is hidden upward
      if (panelState === 'closed') return -height
      return animatedY.get()
    } else {
      // For bottom panel, 0 is fully visible, positive is hidden downward
      if (panelState === 'closed') return height
      return animatedY.get()
    }
  })
  
  // Update panel state based on current position
  const updateStateFromPosition = (currentY: number) => {
    const viewportHeight = window.innerHeight
    const peekHeight = getPanelHeight('peek')
    const halfHeight = getPanelHeight('half')
    const fullHeight = getPanelHeight('full')
    
    // Different logic based on panel position
    if (position === 'top') {
      // For top panel
      if (currentY < -halfHeight) {
        setPanelState('closed')
        onOpenChange(false)
      } else if (currentY < -peekHeight / 2) {
        setPanelState('peek')
      } else if (currentY < -fullHeight / 3) {
        setPanelState('half')
      } else {
        setPanelState('full')
      }
    } else {
      // For bottom panel
      if (currentY > halfHeight) {
        setPanelState('closed')
        onOpenChange(false)
      } else if (currentY > peekHeight / 2) {
        setPanelState('peek')
      } else if (currentY > fullHeight / 3) {
        setPanelState('half')
      } else {
        setPanelState('full')
      }
    }
  }
  
  // Handle drag gestures
  const handleDragEnd = (_, info) => {
    const velocity = position === 'top' ? info.velocity.y : -info.velocity.y
    const offset = dragY.get()
    
    // Fast swipe detection
    if (Math.abs(velocity) > 500) {
      if (velocity > 0) {
        // Swiping to open more
        if (panelState === 'peek') setPanelState('half')
        else if (panelState === 'half') setPanelState('full')
      } else {
        // Swiping to close more
        if (panelState === 'full') setPanelState('half')
        else if (panelState === 'half') setPanelState('peek')
        else if (panelState === 'peek') {
          setPanelState('closed')
          onOpenChange(false)
        }
      }
    } else {
      // Normal position-based state update
      updateStateFromPosition(offset)
    }
    
    dragY.set(0)
  }
  
  // Update y position based on panel state
  useEffect(() => {
    if (!isOpen && panelState !== 'closed') {
      setPanelState('closed')
    } else if (isOpen && panelState === 'closed') {
      setPanelState(initialState)
    }
    
    // Notify about state changes
    onStateChange?.(panelState)
    
    // Update animation target
    if (panelState === 'closed') {
      y.set(position === 'top' ? -getPanelHeight('full') : getPanelHeight('full'))
    } else if (panelState === 'peek') {
      y.set(position === 'top' ? -getPanelHeight('full') + getPanelHeight('peek') : getPanelHeight('full') - getPanelHeight('peek'))
    } else if (panelState === 'half') {
      y.set(position === 'top' ? -getPanelHeight('full') + getPanelHeight('half') : getPanelHeight('full') - getPanelHeight('half'))
    } else if (panelState === 'full') {
      y.set(0)
    }
  }, [panelState, isOpen, initialState, position])
  
  // Handle backdrop clicks
  const handleBackdropClick = () => {
    setPanelState('closed')
    onOpenChange(false)
  }
  
  // Calculate drag constraints based on panel position
  const getDragConstraints = () => {
    const fullHeight = getPanelHeight('full')
    
    if (position === 'top') {
      return { top: -fullHeight, bottom: 0 }
    } else {
      return { top: 0, bottom: fullHeight }
    }
  }
  
  return (
    <>
      {/* Backdrop overlay */}
      {isOpen && (
        <motion.div
          className={cn(
            "fixed inset-0 z-40 bg-black/40 backdrop-blur-sm",
            backdropClassName
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: panelState === 'closed' ? 0 : 0.5 }}
          exit={{ opacity: 0 }}
          onClick={handleBackdropClick}
        />
      )}
      
      {/* Panel */}
      <motion.div
        ref={panelRef}
        className={cn(
          "fixed z-50 left-0 right-0 flex flex-col overflow-hidden bg-background shadow-lg",
          position === 'top' ? "top-0 rounded-b-xl" : "bottom-0 rounded-t-xl",
          className
        )}
        style={{
          y: panelY,
          height: getPanelHeight('full'),
          touchAction: 'none'
        }}
        initial={position === 'top' ? { y: -getPanelHeight('full') } : { y: getPanelHeight('full') }}
        drag="y"
        dragElastic={0.1}
        dragMomentum={false}
        dragConstraints={getDragConstraints()}
        onDrag={(_, info) => {
          dragY.set(info.point.y)
        }}
        onDragEnd={handleDragEnd}
      >
        {/* Handle */}
        {showHandle && (
          <div className="flex justify-center p-2">
            <div className="w-12 h-1.5 rounded-full bg-muted-foreground/30" />
          </div>
        )}
        
        {/* Content */}
        <div className="flex-1 overflow-auto px-4">
          {children}
        </div>
      </motion.div>
    </>
  )
}

export default SwipeablePanel
