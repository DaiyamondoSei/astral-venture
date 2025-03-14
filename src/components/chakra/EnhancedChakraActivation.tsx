
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

// Define missing sub-components
interface ChakraConnectionProps {
  sourceChakra: number;
  targetChakra: number;
  strength: number;
  opacity: number;
}

const ChakraConnection: React.FC<ChakraConnectionProps> = ({ 
  sourceChakra, targetChakra, strength, opacity 
}) => {
  // Simple visualization of connection between chakras
  return (
    <div 
      className="absolute h-0.5 bg-purple-500 transform-gpu z-0"
      style={{
        width: `${strength}%`,
        opacity: opacity,
        top: `${80 + sourceChakra * 90}px`,
        left: '50%',
        transform: 'translateX(-50%)'
      }}
    />
  );
};

interface ChakraNodeProps {
  chakraId: number;
  activated: boolean;
  activationLevel: number;
  onClick: () => void;
  glowIntensity: "high" | "medium" | "low" | "none";
}

const ChakraNode: React.FC<ChakraNodeProps> = ({
  chakraId, activated, activationLevel, onClick, glowIntensity
}) => {
  const color = CHAKRA_COLORS[chakraId];
  const glowSizes = {
    high: "0 0 20px 5px",
    medium: "0 0 15px 3px",
    low: "0 0 10px 2px",
    none: "none"
  };
  
  return (
    <motion.div
      className="rounded-full flex items-center justify-center"
      style={{
        backgroundColor: color,
        width: "50px",
        height: "50px",
        boxShadow: activated ? `${glowSizes[glowIntensity]} ${color}` : "none"
      }}
      animate={{
        scale: activated ? [1, 1.05, 1] : 1,
        transition: {
          duration: 2,
          repeat: Infinity,
          repeatType: 'reverse'
        }
      }}
      onClick={onClick}
    >
      <span className="text-white font-bold">{chakraId + 1}</span>
    </motion.div>
  );
};

// Helper function to determine glow intensity based on activation level
const getGlowIntensity = (activationLevel: number): "high" | "medium" | "low" | "none" => {
  if (activationLevel > 0.8) return "high";
  if (activationLevel > 0.4) return "medium";
  if (activationLevel > 0) return "low";
  return "none";
};

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
    const isEntangled = entangledPairs.some(pair => {
      // Using type guard to determine the type of pair
      if (isChakraPair(pair)) {
        return pair.primaryChakra === chakraId || pair.secondaryChakra === chakraId;
      }
      // For tuple type [number, number]
      return pair[0] === chakraId || pair[1] === chakraId;
    });
    
    if (!isEntangled) return {};
    
    // Find the strongest entanglement for this chakra
    const strongestPair = entangledPairs
      .filter(pair => {
        if (isChakraPair(pair)) {
          return pair.primaryChakra === chakraId || pair.secondaryChakra === chakraId;
        }
        return pair[0] === chakraId || pair[1] === chakraId;
      })
      .map(pair => {
        if (isChakraPair(pair)) {
          return { strength: pair.entanglementStrength };
        }
        return { strength: 50 }; // Default for tuple type
      })
      .sort((a, b) => b.strength - a.strength)[0];
    
    const entanglementIntensity = strongestPair ? strongestPair.strength / 100 : 0;
    
    // Return the CSS properties for the glow effect
    return {
      boxShadow: `0 0 ${10 * entanglementIntensity}px ${2 * entanglementIntensity}px rgba(147, 51, 234, ${entanglementIntensity})`,
      transform: `scale(${1 + 0.1 * entanglementIntensity})`
    };
  };
  
  // Type guard function to check for object type in union
  const isChakraPair = (pair: [number, number] | { primaryChakra: number; secondaryChakra: number; entanglementStrength: number }): 
    pair is { primaryChakra: number; secondaryChakra: number; entanglementStrength: number } => {
    return typeof pair === 'object' && !Array.isArray(pair) && 'primaryChakra' in pair;
  };

  // Extract entangled chakras for rendering connections
  const entangledChakras = system.quantumStates.entanglement.activePairs || [];

  // Using the type guard function in the rendering code
  const renderChakraConnections = () => {
    return entangledChakras.map((pair, index) => {
      if (isChakraPair(pair)) {
        // Safe to access properties now that we've verified the type
        const { primaryChakra, secondaryChakra, entanglementStrength } = pair;
        const entanglementOpacity = Math.min(0.8, Math.max(0.2, entanglementStrength / 100));
        
        return (
          <ChakraConnection
            key={`connection-${index}`}
            sourceChakra={primaryChakra}
            targetChakra={secondaryChakra}
            strength={entanglementStrength}
            opacity={entanglementOpacity}
          />
        );
      } else {
        // Handle the tuple variant
        const [source, target] = pair;
        const defaultStrength = 50; // Default strength for tuple format
        const entanglementOpacity = 0.5; // Default opacity
        
        return (
          <ChakraConnection
            key={`connection-${index}`}
            sourceChakra={source}
            targetChakra={target}
            strength={defaultStrength}
            opacity={entanglementOpacity}
          />
        );
      }
    });
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
          const isActive = chakra.activation > 0; // Use activation instead of active
          const activationLevel = chakra.activation; // Use activation directly
          const chakraName = CHAKRA_NAMES[index];
          const chakraColor = CHAKRA_COLORS[index];
          
          // Prepare the style object for the motion div
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
