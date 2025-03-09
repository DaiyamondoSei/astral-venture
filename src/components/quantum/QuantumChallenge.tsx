
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Clock, Star, ChevronRight, CheckCircle, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface QuantumChallengeProps {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: number; // in minutes
  energyPoints: number;
  level: number;
  completed?: boolean;
  onComplete?: () => void;
  onSelect?: () => void;
}

const QuantumChallenge: React.FC<QuantumChallengeProps> = ({
  id,
  title,
  description,
  category,
  duration,
  energyPoints,
  level,
  completed = false,
  onComplete,
  onSelect
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'meditation':
        return 'from-quantum-400 to-quantum-600';
      case 'reflection':
        return 'from-indigo-400 to-indigo-600';
      case 'energy':
        return 'from-cyan-400 to-cyan-600';
      case 'chakras':
        return 'from-violet-400 to-violet-600';
      case 'wisdom':
        return 'from-amber-400 to-amber-600';
      case 'astral':
        return 'from-blue-400 to-blue-600';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };
  
  const handleClick = () => {
    if (isMobile) {
      setIsExpanded(!isExpanded);
    } else {
      if (onSelect) onSelect();
    }
  };
  
  return (
    <motion.div 
      className={cn(
        "relative rounded-lg overflow-hidden transition-all duration-300",
        "bg-black/20 backdrop-blur-sm border border-white/10",
        completed ? "opacity-80" : "opacity-100",
        isExpanded ? "h-auto" : "h-auto"
      )}
      layout
    >
      {/* Category indicator */}
      <div 
        className={cn(
          "absolute top-0 left-0 h-full w-1 bg-gradient-to-b",
          getCategoryColor(category)
        )}
      />
      
      {/* Completed badge */}
      {completed && (
        <div className="absolute top-2 right-2 z-10">
          <div className="bg-green-500/80 rounded-full p-1">
            <CheckCircle className="w-4 h-4 text-white" />
          </div>
        </div>
      )}
      
      {/* Content */}
      <div 
        className={cn(
          "p-4 cursor-pointer",
          completed ? "opacity-80" : "opacity-100"
        )}
        onClick={handleClick}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <div className={cn(
                "text-xs px-2 py-0.5 rounded-full bg-gradient-to-r",
                getCategoryColor(category)
              )}>
                {category}
              </div>
              
              <div className="flex items-center text-xs text-white/60">
                <Clock className="w-3 h-3 mr-1" />
                {duration} min
              </div>
              
              <div className="flex items-center text-xs text-white/60">
                <Star className="w-3 h-3 mr-1 text-amber-400" />
                Level {level}
              </div>
            </div>
            
            <h3 className={cn(
              "text-lg font-semibold mb-1",
              completed ? "text-white/70" : "text-white"
            )}>
              {title}
            </h3>
            
            <motion.p 
              className="text-sm text-white/70"
              animate={{ height: isExpanded ? 'auto' : isMobile ? '0' : 'auto', opacity: isExpanded ? 1 : isMobile ? 0 : 1 }}
              transition={{ duration: 0.3 }}
            >
              {description}
            </motion.p>
          </div>
          
          {!isMobile && (
            <div className="ml-4">
              <ChevronRight className="w-5 h-5 text-white/40" />
            </div>
          )}
        </div>
        
        {/* Reward info */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center text-sm text-white/80">
            <Award className="w-4 h-4 mr-1 text-quantum-300" />
            {energyPoints} energy points
          </div>
          
          {isExpanded && (
            <Button 
              size="sm" 
              className="bg-quantum-500 hover:bg-quantum-400 text-white"
              onClick={e => {
                e.stopPropagation();
                if (onComplete) onComplete();
              }}
              disabled={completed}
            >
              {completed ? 'Completed' : 'Start Challenge'}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default QuantumChallenge;
