
import React from 'react';
import { cn } from "@/lib/utils";
import GlowEffect from './GlowEffect';
import { Lock } from 'lucide-react';

interface CategoryIconProps {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  gradientColor: string;
  isActive?: boolean;
  isLocked?: boolean;
  onClick?: () => void;
}

const CategoryIcon = ({
  id,
  name,
  icon,
  description,
  gradientColor,
  isActive = false,
  isLocked = false,
  onClick
}: CategoryIconProps) => {
  return (
    <div 
      className={cn(
        "relative group", 
        isLocked ? "cursor-not-allowed" : "cursor-pointer"
      )} 
      onClick={isLocked ? undefined : onClick}
    >
      <GlowEffect 
        animation={isActive ? 'pulse' : 'none'}
        intensity={isActive ? 'high' : 'medium'}
        className={cn(
          "rounded-full w-16 h-16 flex items-center justify-center transition-all duration-500",
          "bg-gradient-to-br",
          gradientColor,
          isActive ? "scale-110" : "scale-100 hover:scale-105",
          isLocked ? "opacity-50" : "opacity-100"
        )}
      >
        <div className="text-white relative">
          {icon}
          {isLocked && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
              <Lock size={14} className="text-white/90" />
            </div>
          )}
        </div>
      </GlowEffect>
      
      <div className={cn(
        "absolute opacity-0 pointer-events-none transition-all duration-300 w-max px-4 py-2 rounded-xl",
        "bg-black/70 backdrop-blur-sm text-white text-center",
        "top-full left-1/2 -translate-x-1/2 mt-2",
        "group-hover:opacity-100",
        isActive && "opacity-100"
      )}>
        <p className="font-display font-medium">{name}</p>
        <p className="text-xs mt-1 opacity-80">{description}</p>
        {isLocked && (
          <p className="text-xs mt-1 text-yellow-400">Complete previous challenges to unlock</p>
        )}
      </div>
    </div>
  );
};

export default CategoryIcon;
