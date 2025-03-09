
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface EmotionalMatrixProps {
  userLevel?: number;
  className?: string;
}

// Emotional intelligence categories
const emotionalCategories = [
  { id: 'awareness', name: 'Self-Awareness', description: 'Understanding your own emotions' },
  { id: 'management', name: 'Emotional Management', description: 'Ability to regulate emotions effectively' },
  { id: 'empathy', name: 'Empathic Resonance', description: 'Understanding others\' emotions' },
  { id: 'social', name: 'Social Harmony', description: 'Building meaningful emotional connections' }
];

const EmotionalMatrix: React.FC<EmotionalMatrixProps> = ({
  userLevel = 1,
  className
}) => {
  // Calculate emotional intelligence score based on user level
  const getEmotionalScore = (category: string) => {
    const baseScore = 20; // Everyone starts with some ability
    
    // Different categories develop at different rates
    const multipliers = {
      awareness: 12,
      management: 10,
      empathy: 8,
      social: 9
    };
    
    const multiplier = multipliers[category as keyof typeof multipliers] || 10;
    const score = baseScore + (userLevel * multiplier);
    
    return Math.min(100, score);
  };
  
  // Get color based on score
  const getColorForScore = (score: number) => {
    if (score < 30) return '#FF5757'; // Red
    if (score < 50) return '#FFA726'; // Orange
    if (score < 70) return '#FFDE59'; // Yellow
    if (score < 90) return '#7ED957'; // Green
    return '#5271FF'; // Blue
  };
  
  return (
    <div className={cn("space-y-6", className)}>
      <div>
        <h3 className="text-xl text-white/90 mb-4 text-center">Emotional Intelligence Matrix</h3>
        <p className="text-white/70 text-center text-sm mb-6">
          Your emotional landscape and intelligence development
        </p>
        
        {/* Matrix visualization */}
        <div className="relative w-full h-64 mb-6">
          <svg width="100%" height="100%" viewBox="0 0 300 300" className="max-w-full">
            {/* Grid lines */}
            <line x1="150" y1="0" x2="150" y2="300" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
            <line x1="0" y1="150" x2="300" y2="150" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
            
            {/* Concentric circles */}
            {[25, 50, 75, 100].map((radius) => (
              <circle 
                key={`circle-${radius}`}
                cx="150" 
                cy="150" 
                r={radius * 1.3} 
                fill="none" 
                stroke="rgba(255,255,255,0.1)" 
                strokeWidth="1" 
                strokeDasharray="3,3"
              />
            ))}
            
            {/* Matrix shape formed by emotional scores */}
            <motion.path
              d={`
                M 150 ${150 - getEmotionalScore('awareness') * 1.3}
                L ${150 + getEmotionalScore('management') * 1.3} 150
                L 150 ${150 + getEmotionalScore('empathy') * 1.3}
                L ${150 - getEmotionalScore('social') * 1.3} 150
                Z
              `}
              fill="rgba(138, 43, 226, 0.2)"
              stroke="rgba(138, 43, 226, 0.8)"
              strokeWidth="2"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.8 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
            
            {/* Axis labels */}
            <text x="150" y="10" textAnchor="middle" fill="white" fontSize="12">Self-Awareness</text>
            <text x="290" y="150" textAnchor="end" fill="white" fontSize="12">Management</text>
            <text x="150" y="295" textAnchor="middle" fill="white" fontSize="12">Empathy</text>
            <text x="10" y="150" textAnchor="start" fill="white" fontSize="12">Social</text>
            
            {/* Emotional scores dots */}
            <motion.circle 
              cx="150" 
              cy={150 - getEmotionalScore('awareness') * 1.3} 
              r="5" 
              fill={getColorForScore(getEmotionalScore('awareness'))}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            />
            <motion.circle 
              cx={150 + getEmotionalScore('management') * 1.3} 
              cy="150" 
              r="5" 
              fill={getColorForScore(getEmotionalScore('management'))}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            />
            <motion.circle 
              cx="150" 
              cy={150 + getEmotionalScore('empathy') * 1.3} 
              r="5" 
              fill={getColorForScore(getEmotionalScore('empathy'))}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            />
            <motion.circle 
              cx={150 - getEmotionalScore('social') * 1.3} 
              cy="150" 
              r="5" 
              fill={getColorForScore(getEmotionalScore('social'))}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            />
          </svg>
        </div>
        
        {/* Detailed emotional scores */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {emotionalCategories.map((category) => {
            const score = getEmotionalScore(category.id);
            const color = getColorForScore(score);
            
            return (
              <div 
                key={category.id} 
                className="bg-black/20 rounded-lg p-3 border border-gray-700/30"
              >
                <div className="flex justify-between items-center">
                  <h4 className="text-white/90 font-medium">{category.name}</h4>
                  <div 
                    className="px-2 py-1 rounded text-xs font-medium" 
                    style={{ backgroundColor: `${color}30`, color }}
                  >
                    {Math.round(score)}%
                  </div>
                </div>
                <p className="text-white/60 text-sm mt-1">{category.description}</p>
                <div className="mt-2 h-2 w-full bg-black/30 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full"
                    style={{ backgroundColor: color }}
                    initial={{ width: '0%' }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default EmotionalMatrix;
