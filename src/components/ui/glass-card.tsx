
import React from 'react';
import { cn } from "@/lib/utils";
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  animate?: boolean;
  variant?: 'default' | 'dark' | 'light' | 'purple';
}

/**
 * GlassCard component - creates a glassmorphic card effect
 * 
 * @param children - Content to display inside the card
 * @param className - Additional CSS classes
 * @param animate - Whether to apply subtle animation effects
 * @param variant - Color variant of the glass effect
 */
export function GlassCard({
  children,
  className,
  animate = false,
  variant = 'default'
}: GlassCardProps) {
  const baseStyles = "rounded-xl backdrop-blur-md border shadow-lg overflow-hidden";
  
  const variantStyles = {
    default: "bg-white/5 border-white/10",
    dark: "bg-black/10 border-white/5",
    light: "bg-white/10 border-white/20",
    purple: "bg-quantum-600/5 border-quantum-400/10"
  };
  
  if (animate) {
    return (
      <motion.div
        className={cn(
          baseStyles,
          variantStyles[variant],
          className
        )}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        whileHover={{ 
          boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12)",
          y: -2,
          transition: { duration: 0.2 }
        }}
      >
        {children}
      </motion.div>
    );
  }
  
  return (
    <div className={cn(
      baseStyles,
      variantStyles[variant],
      className
    )}>
      {children}
    </div>
  );
}
