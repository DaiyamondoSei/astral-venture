
import React from 'react';
import { cn } from "@/lib/utils";
import { motion } from 'framer-motion';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { getPerformanceCategory } from '@/utils/performanceUtils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  animate?: boolean;
  variant?: 'default' | 'dark' | 'light' | 'purple' | 'quantum';
  interactive?: boolean;
  shimmer?: boolean;
}

/**
 * GlassCard component - creates a glassmorphic card effect
 * 
 * @param children - Content to display inside the card
 * @param className - Additional CSS classes
 * @param animate - Whether to apply subtle animation effects
 * @param variant - Color variant of the glass effect
 * @param interactive - Whether to add hover/focus effects
 * @param shimmer - Whether to add a subtle shimmer animation
 */
export function GlassCard({
  children,
  className,
  animate = false,
  variant = 'default',
  interactive = false,
  shimmer = false
}: GlassCardProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isLowPerformance = getPerformanceCategory() === 'low';
  
  // Adjust effects for mobile and low-performance devices
  const shouldReduceMotion = isMobile || isLowPerformance;
  
  const baseStyles = "rounded-xl backdrop-blur-md border shadow-lg overflow-hidden";
  
  const variantStyles = {
    default: "bg-white/5 border-white/10",
    dark: "bg-black/10 border-white/5",
    light: "bg-white/10 border-white/20",
    purple: "bg-quantum-600/5 border-quantum-400/10",
    quantum: "bg-gradient-to-br from-quantum-900/40 to-quantum-800/20 border-quantum-700/30"
  };
  
  const interactiveStyles = interactive 
    ? "transition-all duration-300 hover:bg-opacity-[0.15] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-quantum-400/50"
    : "";
  
  if (animate) {
    return (
      <motion.div
        className={cn(
          baseStyles,
          variantStyles[variant],
          interactiveStyles,
          className
        )}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        whileHover={interactive && !shouldReduceMotion ? { 
          boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12)",
          y: -2,
          transition: { duration: 0.2 }
        } : undefined}
      >
        {shimmer && !shouldReduceMotion && (
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
            animate={{ 
              x: ["calc(-100% - 200px)", "calc(100% + 200px)"]
            }}
            transition={{ 
              duration: 2.5, 
              repeat: Infinity, 
              ease: "linear",
              repeatDelay: 4
            }}
            style={{ width: "100%" }}
          />
        )}
        {children}
      </motion.div>
    );
  }
  
  return (
    <div className={cn(
      baseStyles,
      variantStyles[variant],
      interactiveStyles,
      className
    )}>
      {shimmer && !shouldReduceMotion && (
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer" />
        </div>
      )}
      {children}
    </div>
  );
}
