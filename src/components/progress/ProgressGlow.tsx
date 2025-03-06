
import React from 'react';
import { cn } from '@/lib/utils';

type AnimationType = "pulse" | "slide" | "ripple" | "none";

interface ProgressGlowProps {
  progress: number;
  intensity?: "low" | "medium" | "high";
  animation?: AnimationType;
  colorScheme?: string;
}

const ProgressGlow: React.FC<ProgressGlowProps> = ({
  progress,
  intensity = "medium",
  animation = "none",
  colorScheme = "primary"
}) => {
  // Early return if no progress
  if (progress <= 0) return null;
  
  // Define intensity values
  const intensityClasses = {
    low: "opacity-30 blur-[2px]",
    medium: "opacity-50 blur-[3px]",
    high: "opacity-70 blur-[4px]",
  };
  
  // Define animation classes
  const animationClasses = {
    pulse: "animate-pulse",
    slide: "animate-slide",
    ripple: "animate-ripple",
    none: ""
  };
  
  // Get animation class based on type
  const animationClass = animationClasses[animation];
  
  // Get intensity class
  const intensityClass = intensityClasses[intensity];
  
  // Default glow color if colorScheme is a named scheme
  const glowColorClasses = {
    primary: "bg-primary",
    secondary: "bg-secondary",
    accent: "bg-accent",
    quantum: "bg-quantum-500",
    success: "bg-green-500",
    warning: "bg-yellow-500",
    error: "bg-red-500",
  };
  
  // Choose color class based on scheme (default to primary if not found)
  const colorClass = colorScheme.startsWith("from-") 
    ? colorScheme.replace("from-", "bg-") 
    : (glowColorClasses[colorScheme as keyof typeof glowColorClasses] || "bg-primary");
  
  return (
    <div 
      className={cn(
        "absolute inset-0 rounded-full",
        colorClass,
        intensityClass,
        animationClass
      )}
      style={{ width: `${progress}%` }}
    />
  );
};

export default ProgressGlow;
