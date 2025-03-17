
import React from 'react';
import { useChakraSystem } from '../hooks/useChakraSystem';
import { ChakraData } from '../types';

export interface ChakraDisplayProps {
  userId?: string;
  showDetails?: boolean;
  interactive?: boolean;
  className?: string;
}

/**
 * ChakraDisplay Component
 * 
 * Visualizes the user's chakra system with current activation levels
 */
export const ChakraDisplay: React.FC<ChakraDisplayProps> = ({
  userId,
  showDetails = true,
  interactive = false,
  className = '',
}) => {
  const { chakras, isLoading, error } = useChakraSystem(userId);
  
  if (isLoading) {
    return <div className="animate-pulse p-8 bg-quantum-900/30 rounded-lg">Loading chakra system...</div>;
  }
  
  if (error) {
    return <div className="text-red-500">Error loading chakra system</div>;
  }
  
  return (
    <div className={`chakra-display ${className}`}>
      <div className="flex flex-col items-center space-y-4">
        {chakras.map((chakra: ChakraData) => (
          <div 
            key={chakra.id} 
            className="chakra-node flex items-center p-4 rounded-lg transition-all"
            style={{ 
              backgroundColor: `${chakra.color}22`,
              borderColor: chakra.color,
              borderWidth: '2px'
            }}
          >
            <div 
              className="w-8 h-8 rounded-full mr-4" 
              style={{ backgroundColor: chakra.color, opacity: chakra.activationLevel / 100 }}
            />
            {showDetails && (
              <div>
                <div className="font-semibold">{chakra.name}</div>
                <div className="text-sm opacity-70">Activation: {chakra.activationLevel}%</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
