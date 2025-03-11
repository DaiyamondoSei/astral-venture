
/**
 * Integrated Visual and Chakra System Component
 * 
 * This component combines chakra visualization with advanced visual effects,
 * adapting to device performance capabilities.
 */
import React, { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useIntegratedSystemState } from '../../hooks/useIntegratedSystemState';
import { ChakraType } from '../../types/chakra/ChakraTypes';
import QuantumParticles from '../effects/quantum-particles/QuantumParticles';
import InteractiveEnergyField from '../effects/energy-field/InteractiveEnergyField';
import { usePerfConfig } from '../../hooks/usePerfConfig';

export interface IntegratedSystemProps {
  // Initial chakra activation values (0-1)
  initialActivation?: Record<ChakraType, number>;
  
  // Visual style and behavior options
  showParticles?: boolean;
  showEnergyField?: boolean;
  showChakraLabels?: boolean;
  interactive?: boolean;
  animationLevel?: 'minimal' | 'standard' | 'enhanced';
  
  // Size and layout
  width?: number | string;
  height?: number | string;
  className?: string;
  style?: React.CSSProperties;
  
  // Event callbacks
  onChakraActivated?: (chakra: ChakraType, level: number) => void;
  onSystemStateChange?: (systemState: any) => void;
}

/**
 * IntegratedSystem component combining chakra and quantum visualizations
 */
const IntegratedSystem: React.FC<IntegratedSystemProps> = ({
  initialActivation = {},
  showParticles = true,
  showEnergyField = true,
  showChakraLabels = true,
  interactive = true,
  animationLevel = 'standard',
  width = '100%',
  height = '500px',
  className = '',
  style = {},
  onChakraActivated,
  onSystemStateChange
}) => {
  // Get performance configuration
  const { shouldUseSimplifiedUI } = usePerfConfig();
  
  // Initialize the integrated system state
  const {
    chakraState,
    visualSystem,
    chakraColors,
    systemActivity,
    updateActivationLevels,
    updateChakraVisualization,
    isLowPerformance
  } = useIntegratedSystemState({
    initialChakraState: {
      activationLevels: initialActivation
    },
    adaptToPerformance: true,
    interactiveMode: interactive
  });
  
  // Apply initial activation values
  useEffect(() => {
    if (Object.keys(initialActivation).length > 0) {
      updateChakraVisualization(initialActivation);
    }
  }, [initialActivation, updateChakraVisualization]);
  
  // Notify parent component about system state changes
  useEffect(() => {
    onSystemStateChange?.(chakraState.systemState);
  }, [chakraState.systemState, onSystemStateChange]);
  
  // Calculate particle configuration based on system state and performance
  const particleConfig = useMemo(() => {
    const baseCount = isLowPerformance ? 30 : (shouldUseSimplifiedUI ? 60 : 100);
    
    return {
      count: Math.round(baseCount * (0.5 + systemActivity * 0.5)),
      speed: 0.5 + systemActivity * 1.5,
      size: 2 + systemActivity * 2,
      opacity: 0.6 + systemActivity * 0.3,
      colors: Object.values(chakraColors).length > 0 
        ? Object.values(chakraColors) 
        : ['#8b5cf6']
    };
  }, [isLowPerformance, shouldUseSimplifiedUI, systemActivity, chakraColors]);
  
  // Handle chakra interaction
  const handleChakraInteraction = (chakra: ChakraType, level: number) => {
    if (!interactive) return;
    
    // Update chakra activation level
    updateActivationLevels({ [chakra]: level });
    
    // Notify parent component
    onChakraActivated?.(chakra, level);
  };
  
  // Handle energy field interaction
  const handleEnergyFieldInteraction = (intensity: number, position: { x: number, y: number }) => {
    if (!interactive) return;
    
    // Map position to chakra (simplified mapping based on vertical position)
    const normalizedY = 1 - (position.y / (typeof height === 'number' ? height : 500));
    
    // Determine which chakra to activate based on vertical position
    let targetChakra: ChakraType;
    
    if (normalizedY < 0.14) targetChakra = 'root';
    else if (normalizedY < 0.28) targetChakra = 'sacral';
    else if (normalizedY < 0.42) targetChakra = 'solar';
    else if (normalizedY < 0.58) targetChakra = 'heart';
    else if (normalizedY < 0.72) targetChakra = 'throat';
    else if (normalizedY < 0.86) targetChakra = 'third';
    else targetChakra = 'crown';
    
    // Update the targeted chakra with an intensity based on the interaction
    const updatedLevel = Math.min(1, chakraState.activationLevels[targetChakra] + intensity * 0.2);
    handleChakraInteraction(targetChakra, updatedLevel);
  };
  
  return (
    <motion.div 
      className={`relative overflow-hidden rounded-lg ${className}`}
      style={{ 
        width, 
        height, 
        background: 'linear-gradient(to bottom, #1a1a2e, #16213e, #0f3460)',
        ...style 
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Background effects */}
      <div className="absolute inset-0 z-0">
        {showParticles && systemActivity > 0.1 && (
          <QuantumParticles
            count={particleConfig.count}
            speed={particleConfig.speed}
            size={particleConfig.size}
            opacity={particleConfig.opacity}
            colors={particleConfig.colors}
            interactive={interactive}
          />
        )}
      </div>
      
      {/* Interactive energy field */}
      {showEnergyField && (
        <div className="absolute inset-0 z-10">
          <InteractiveEnergyField
            intensity={systemActivity}
            colors={Object.values(chakraColors)}
            responsive={true}
            interactive={interactive}
            onInteraction={handleEnergyFieldInteraction}
          />
        </div>
      )}
      
      {/* Chakra visualization */}
      <div className="absolute inset-0 z-20 flex items-center justify-center">
        <div className="h-full flex flex-col justify-between py-8">
          {/* Render chakra points from top (crown) to bottom (root) */}
          {['crown', 'third', 'throat', 'heart', 'solar', 'sacral', 'root'].map((chakra) => {
            const chakraType = chakra as ChakraType;
            const activation = chakraState.activationLevels[chakraType] || 0;
            const color = chakraColors[chakraType] || '#888';
            
            return (
              <div key={chakra} className="flex items-center">
                <motion.div
                  className="rounded-full relative"
                  style={{
                    backgroundColor: color,
                    boxShadow: activation > 0.3 ? `0 0 ${activation * 20}px ${color}` : 'none',
                  }}
                  animate={{
                    width: 20 + activation * 20,
                    height: 20 + activation * 20,
                    opacity: 0.2 + activation * 0.8,
                    scale: [1, 1 + activation * 0.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  onClick={() => interactive && handleChakraInteraction(
                    chakraType,
                    activation < 0.5 ? 0.8 : 0.2 // Toggle activation
                  )}
                />
                
                {showChakraLabels && (
                  <div className="ml-4 text-white opacity-90">
                    <div className="font-bold capitalize">{chakra}</div>
                    <div className="text-xs opacity-70">
                      {Math.round(activation * 100)}% active
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Overlay for system metrics */}
      {interactive && (
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 p-2 rounded text-xs text-white">
          <div>Balance: {Math.round(chakraState.systemState.balance * 100)}%</div>
          <div>Energy: {Math.round(chakraState.systemState.totalEnergy * 14)}%</div>
          <div>Flow: {chakraState.energyFlow.direction}</div>
        </div>
      )}
    </motion.div>
  );
};

export default IntegratedSystem;
