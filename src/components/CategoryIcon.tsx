
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";
import { Lock } from 'lucide-react';

interface CategoryIconProps {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  gradientColor: string;
  isActive?: boolean;
  isLocked?: boolean;
  onClick: () => void;
}

const CategoryIcon: React.FC<CategoryIconProps> = ({
  id,
  name,
  icon,
  description,
  gradientColor,
  isActive = false,
  isLocked = false,
  onClick
}) => {
  return (
    <motion.div
      className="relative"
      whileHover={{ scale: isLocked ? 1 : 1.05 }}
      whileTap={{ scale: isLocked ? 1 : 0.98 }}
    >
      <motion.button
        onClick={isLocked ? undefined : onClick}
        className={cn(
          "w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center relative",
          "text-white shadow-lg border border-white/20 transition-colors",
          isActive ? "bg-gradient-to-br border-white/40" : "bg-gradient-to-br border-white/10",
          isLocked ? "opacity-60 cursor-not-allowed" : "opacity-100 cursor-pointer",
          gradientColor
        )}
        animate={{ 
          boxShadow: isActive 
            ? [
                "0 0 0 rgba(255, 255, 255, 0.1)", 
                "0 0 20px rgba(255, 255, 255, 0.3)", 
                "0 0 0 rgba(255, 255, 255, 0.1)"
              ] 
            : "0 4px 6px rgba(0, 0, 0, 0.1)" 
        }}
        transition={{ 
          duration: 2, 
          repeat: isActive ? Infinity : 0,
          repeatType: "reverse"
        }}
      >
        {isLocked ? (
          <Lock className="w-6 h-6" />
        ) : (
          icon
        )}
        
        {/* Add a subtle glow effect for active state */}
        {isActive && (
          <motion.div 
            className="absolute inset-0 rounded-full bg-white/20"
            animate={{ 
              opacity: [0.2, 0.4, 0.2],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
        )}
      </motion.button>
      
      {/* Display name below icon */}
      <motion.div 
        className={cn(
          "text-center text-xs mt-2 font-medium select-none",
          isActive ? "text-white" : "text-white/80",
          isLocked ? "opacity-60" : "opacity-100"
        )}
        animate={{ 
          opacity: isActive ? 1 : 0.8
        }}
      >
        {name}
      </motion.div>
    </motion.div>
  );
};

export default CategoryIcon;
