
import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Zap, Star, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Practice } from '@/services/practice/practiceService';

// Icon mapping based on practice type
const typeIcons: Record<string, LucideIcon> = {
  meditation: Star,
  'quantum-task': Zap,
  integration: Clock
};

// Color mapping based on chakra associations
const chakraColors: Record<string, string> = {
  root: '#FF5757',
  sacral: '#FF9E43',
  solar: '#FFDE59',
  heart: '#7ED957',
  throat: '#5CC9F5',
  'third-eye': '#A85CFF',
  crown: '#C588FF'
};

interface PracticeCardProps {
  practice: Practice;
  onClick: () => void;
  isCompleted?: boolean;
  className?: string;
}

const PracticeCard: React.FC<PracticeCardProps> = ({
  practice,
  onClick,
  isCompleted = false,
  className
}) => {
  // Get appropriate icon for practice type
  const TypeIcon = typeIcons[practice.type] || Star;
  
  // Get chakra color if available
  const chakraColor = practice.chakraAssociation && practice.chakraAssociation.length > 0
    ? chakraColors[practice.chakraAssociation[0]]
    : undefined;
  
  return (
    <motion.div
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className={cn(
        "cursor-pointer rounded-xl overflow-hidden",
        "bg-gradient-to-br from-gray-900/60 to-gray-800/40",
        "border border-gray-700/30",
        isCompleted && "border-green-500/30",
        className
      )}
      onClick={onClick}
    >
      {/* Chakra color bar */}
      {chakraColor && (
        <div 
          className="h-2 w-full" 
          style={{ backgroundColor: chakraColor }}
        />
      )}
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-medium text-white/90">{practice.title}</h3>
          
          <div className="flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-800/70 text-white/70">
            <TypeIcon className="h-3 w-3 mr-1" />
            {practice.type === 'quantum-task' ? 'Task' : practice.type === 'integration' ? 'Integration' : 'Meditation'}
          </div>
        </div>
        
        <p className="text-white/60 text-sm mb-3 line-clamp-2">{practice.description}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center text-white/60 text-xs">
            <Clock className="h-3 w-3 mr-1" />
            {practice.duration} min
          </div>
          
          <div className="flex items-center text-purple-300 text-xs">
            <Zap className="h-3 w-3 mr-1" />
            {practice.energyPoints} points
          </div>
          
          {isCompleted && (
            <div className="text-green-400 text-xs font-medium">
              Completed
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default PracticeCard;
