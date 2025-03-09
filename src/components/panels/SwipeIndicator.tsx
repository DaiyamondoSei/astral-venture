
import React from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SwipeIndicatorProps {
  position: 'top' | 'bottom'
  className?: string
}

const SwipeIndicator: React.FC<SwipeIndicatorProps> = ({ position, className }) => {
  const variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: [0, 1, 0],
      transition: {
        repeat: Infinity,
        duration: 2,
        repeatType: 'loop'
      }
    }
  }
  
  return (
    <motion.div 
      className={cn(
        "fixed left-1/2 -translate-x-1/2 z-30 flex flex-col items-center",
        position === 'top' ? "top-2" : "bottom-2",
        className
      )}
      variants={variants}
      initial="hidden"
      animate="visible"
    >
      {position === 'top' ? (
        <>
          <ChevronDown className="text-white/80" size={20} />
          <div className="text-white/80 text-xs">Profile</div>
        </>
      ) : (
        <>
          <div className="text-white/80 text-xs">Achievements</div>
          <ChevronUp className="text-white/80" size={20} />
        </>
      )}
    </motion.div>
  )
}

export default SwipeIndicator
