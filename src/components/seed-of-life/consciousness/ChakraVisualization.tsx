
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ChakraVisualizationProps {
  userLevel?: number;
  primaryColor?: string;
  secondaryColor?: string;
  className?: string;
}

// Chakra data with positions and colors
const chakras = [
  { id: 'root', name: 'Root', color: '#FF5757', position: 85, description: 'Stability and security foundation' },
  { id: 'sacral', name: 'Sacral', color: '#FF9E45', position: 70, description: 'Creativity and emotional center' },
  { id: 'solar', name: 'Solar Plexus', color: '#FFDE59', position: 55, description: 'Personal power and confidence' },
  { id: 'heart', name: 'Heart', color: '#7ED957', position: 40, description: 'Love and compassion center' },
  { id: 'throat', name: 'Throat', color: '#5271FF', position: 25, description: 'Communication and expression' },
  { id: 'third-eye', name: 'Third Eye', color: '#A85CFF', position: 10, description: 'Intuition and higher perception' },
  { id: 'crown', name: 'Crown', color: '#D59FFF', position: -5, description: 'Higher consciousness connection' },
];

const ChakraVisualization: React.FC<ChakraVisualizationProps> = ({
  userLevel = 1,
  primaryColor = '#8B5CF6',
  secondaryColor = '#EC4899',
  className
}) => {
  // Calculate chakra activation based on user level
  const getChakraActivationPercentage = (chakraIndex: number) => {
    // Base activation + level-based activation (higher chakras need higher levels)
    const baseActivation = 20;
    const levelBonus = Math.max(0, userLevel * 10 - (chakraIndex * 10));
    return Math.min(100, baseActivation + levelBonus);
  };
  
  return (
    <div className={cn("flex flex-col items-center", className)}>
      <h3 className="text-xl text-white/90 mb-4 text-center">Chakra Activation</h3>
      
      <div className="flex flex-col md:flex-row items-center">
        {/* Human silhouette with chakra points */}
        <div className="relative flex justify-center mt-4 w-full md:w-1/2">
          <div className="relative h-[400px] w-[120px]">
            {/* Simple human silhouette */}
            <div className="absolute inset-0 flex items-center justify-center opacity-40">
              <svg viewBox="0 0 100 300" width="100%" height="100%">
                <path
                  d="M50,0 C60,0 70,10 70,20 C70,30 65,35 60,40 L63,80 L73,100 L63,140 C63,140 80,160 80,180 C80,200 70,230 65,260 C63,270 60,280 50,280 C40,280 37,270 35,260 C30,230 20,200 20,180 C20,160 37,140 37,140 L27,100 L37,80 L40,40 C35,35 30,30 30,20 C30,10 40,0 50,0 Z"
                  fill="rgba(255, 255, 255, 0.2)"
                  stroke="rgba(255, 255, 255, 0.5)"
                  strokeWidth="1"
                />
              </svg>
            </div>
            
            {/* Chakra points */}
            {chakras.map((chakra, index) => {
              const activation = getChakraActivationPercentage(index);
              const isActive = activation > 30;
              const size = 14 + (activation / 100) * 10;
              
              return (
                <motion.div
                  key={chakra.id}
                  className="absolute left-1/2 transform -translate-x-1/2"
                  style={{ top: `${chakra.position}%` }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ 
                    opacity: activation / 100,
                    scale: isActive ? [1, 1.1, 1] : 1
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: isActive ? Infinity : 0,
                    repeatType: "reverse"
                  }}
                >
                  <div
                    className="rounded-full relative"
                    style={{
                      backgroundColor: chakra.color,
                      width: size,
                      height: size,
                      boxShadow: `0 0 ${(activation / 100) * 15}px ${chakra.color}`
                    }}
                  />
                </motion.div>
              );
            })}
          </div>
        </div>
        
        {/* Chakra details and levels */}
        <div className="mt-6 md:mt-0 space-y-2 w-full md:w-1/2">
          {chakras.map((chakra, index) => {
            const activation = getChakraActivationPercentage(index);
            
            return (
              <div key={chakra.id} className="mb-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: chakra.color }}
                    />
                    <span className="text-white/90">{chakra.name}</span>
                  </div>
                  <span className="text-white/70 text-sm">{Math.round(activation)}%</span>
                </div>
                <div className="mt-1 h-2 w-full bg-black/30 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: chakra.color }}
                    initial={{ width: '0%' }}
                    animate={{ width: `${activation}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
                <p className="text-white/60 text-xs mt-1">{chakra.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ChakraVisualization;
