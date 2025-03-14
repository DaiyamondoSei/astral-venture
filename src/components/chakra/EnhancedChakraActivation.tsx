
/**
 * Enhanced Chakra Activation Component
 * 
 * A high-performance, feature-rich component for visualizing and managing
 * chakra activations with quantum state integration.
 */
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useChakraSystem } from '@/hooks/useChakraSystem';
import { usePerformanceMonitoring } from '@/hooks/usePerformanceMonitoring';
import { ChakraSystemProps } from '@/types/chakra/ChakraSystemTypes';
import { CHAKRA_NAMES, CHAKRA_COLORS } from '../entry-animation/cosmic/types';

// Chakra activation component props
export interface ChakraActivationProps extends ChakraSystemProps {
  className?: string;
  showLabels?: boolean;
  interactive?: boolean;
  animationLevel?: 'minimal' | 'standard' | 'enhanced';
}

/**
 * Enhanced Chakra Activation Component
 */
const EnhancedChakraActivation: React.FC<ChakraActivationProps> = ({
  system: systemProps,
  energyPoints = 0,
  activatedChakras = [],
  onActivationChange,
  className,
  showLabels = true,
  interactive = true,
  animationLevel = 'standard'
}) => {
  // Initialize chakra system
  const { 
    system, 
    activeChakras,
    activateChakra,
    deactivateChakra
  } = useChakraSystem({
    initialSystem: systemProps,
    energyPoints,
    activatedChakras,
    onActivationChange
  });
  
  // Performance monitoring
  const { 
    startTiming, 
    endTiming, 
    trackInteraction,
    setNodeRef
  } = usePerformanceMonitoring({
    componentName: 'EnhancedChakraActivation',
    trackRenderTime: true,
    trackInteractions: true
  });
  
  // Track render performance
  useEffect(() => {
    startTiming();
    return endTiming;
  }, [startTiming, endTiming]);
  
  // Handle chakra click
  const handleChakraClick = (chakraId: number) => {
    // Track interaction
    const endTracking = trackInteraction(`chakraClick.${chakraId}`);
    
    // Toggle chakra activation
    if (system.chakras.activationStates[chakraId].active) {
      deactivateChakra(chakraId as any);
    } else {
      activateChakra(chakraId as any);
    }
    
    // End tracking
    endTracking();
  };
  
  // Generate animation variants based on animation level
  const getAnimationProps = (chakraId: number) => {
    const isActive = system.chakras.activationStates[chakraId].active;
    const activationLevel = system.chakras.activationStates[chakraId].activationLevel;
    
    if (animationLevel === 'minimal') {
      return {
        animate: { 
          scale: isActive ? 1.1 : 1,
          opacity: isActive ? 1 : 0.6
        },
        transition: { duration: 0.3 }
      };
    }
    
    if (animationLevel === 'enhanced') {
      return {
        animate: { 
          scale: isActive ? [1, 1.2, 1.1] : 1,
          opacity: isActive ? 1 : 0.6,
          filter: isActive ? 'brightness(1.2) saturate(1.2)' : 'brightness(1) saturate(1)'
        },
        transition: { 
          duration: 0.5, 
          times: [0, 0.3, 1],
          repeat: isActive ? Infinity : 0,
          repeatType: 'reverse' as const,
          repeatDelay: 3
        }
      };
    }
    
    // Default: standard animations
    return {
      animate: { 
        scale: isActive ? 1.1 : 1,
        opacity: isActive ? 1 : 0.6,
        filter: isActive ? 'brightness(1.1) saturate(1.1)' : 'brightness(1) saturate(1)'
      },
      transition: { duration: 0.4 }
    };
  };
  
  // Check for entangled chakras
  const getEntanglementProps = (chakraId: number) => {
    // Get entanglement pairs from the system
    const entangledPairs = system.quantumStates.entanglement.activePairs || [];
    
    // Check if this chakra is part of any entangled pair
    const isEntangled = entangledPairs.some(
      pair => pair.primaryChakra === chakraId || pair.secondaryChakra === chakraId
    );
    
    if (!isEntangled) return {};
    
    // Find the strongest entanglement for this chakra
    const strongestPair = entangledPairs
      .filter(pair => pair.primaryChakra === chakraId || pair.secondaryChakra === chakraId)
      .sort((a, b) => b.entanglementStrength - a.entanglementStrength)[0];
    
    const entanglementIntensity = strongestPair ? strongestPair.entanglementStrength : 0;
    
    // Return the CSS properties for the glow effect
    // Using boxShadow directly as a style prop, not ringColor
    return {
      boxShadow: `0 0 ${10 * entanglementIntensity}px ${2 * entanglementIntensity}px rgba(147, 51, 234, ${entanglementIntensity})`,
      transform: `scale(${1 + 0.1 * entanglementIntensity})`
    };
  };
  
  // Convert chakra object to array for mapping
  const chakraArray = Object.values(system.chakras.activationStates || {});
  
  return (
    <div 
      ref={setNodeRef}
      className={cn(
        "flex flex-col items-center justify-center gap-4 p-4",
        className
      )}
    >
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold">Chakra System</h3>
        <div className="text-sm text-muted-foreground">
          Active Chakras: {activeChakras.length} / 7
        </div>
      </div>
      
      <div className="flex flex-col gap-6 items-center">
        {chakraArray.map((chakra, index) => {
          const isActive = chakra.active;
          const activationLevel = chakra.activationLevel;
          const chakraName = CHAKRA_NAMES[index];
          const chakraColor = CHAKRA_COLORS[index];
          
          // Prepare the style object for the motion div
          // Without the invalid ringColor property
          const motionStyle = {
            backgroundColor: chakraColor,
            ...(getEntanglementProps(index))
          };
          
          return (
            <div key={`chakra-${index}`} className="flex items-center gap-4">
              <motion.div
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center",
                  interactive ? "cursor-pointer hover:brightness-110" : "",
                  isActive ? "ring-2 ring-offset-2" : "opacity-60"
                )}
                style={motionStyle}
                onClick={interactive ? () => handleChakraClick(index) : undefined}
                {...getAnimationProps(index)}
              >
                <span className="text-white text-xs font-bold">{index + 1}</span>
              </motion.div>
              
              {showLabels && (
                <div>
                  <div className="font-medium">{chakraName}</div>
                  <div className="text-xs text-muted-foreground">
                    {isActive 
                      ? `Active (${Math.round(activationLevel * 100)}%)`
                      : 'Inactive'}
                  </div>
                </div>
              )}
              
              <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full"
                  style={{ backgroundColor: chakraColor }}
                  initial={{ width: 0 }}
                  animate={{ width: `${activationLevel * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Quantum state visualization */}
      <div className="mt-6 w-full">
        <h4 className="text-sm font-medium mb-2">Quantum States</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded">
            <div className="font-medium">Entanglement</div>
            <div>{(system.quantumStates.entanglement.activePairs || []).length} pairs active</div>
          </div>
          <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded">
            <div className="font-medium">Coherence</div>
            <div>{Math.round(system.quantumStates.coherence.overallCoherence * 100)}% synchronized</div>
          </div>
          <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded">
            <div className="font-medium">Superposition</div>
            <div>
              {typeof system.quantumStates.superposition.potentialStates === 'number' 
                ? system.quantumStates.superposition.potentialStates 
                : Object.keys(system.quantumStates.superposition.potentialStates).length} states
            </div>
          </div>
          <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded">
            <div className="font-medium">Balance</div>
            <div>{Math.round(system.chakras.balanceMetrics.overallBalance * 100)}% balanced</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedChakraActivation;
