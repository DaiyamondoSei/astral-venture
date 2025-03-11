
/**
 * Hook for chakra system management
 * 
 * Provides state management and functionality for the chakra system.
 */
import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  ChakraSystem,
  ChakraActivationState,
  ChakraId,
  ActivationLevel
} from '../types/chakra/ChakraSystemTypes';
import { CHAKRA_NAMES, CHAKRA_COLORS } from '../components/entry-animation/cosmic/types';

// Default chakra activation states
const DEFAULT_CHAKRA_ACTIVATION_STATES: ChakraActivationState[] = Array.from({ length: 7 }, (_, i) => ({
  id: i as ChakraId,
  name: CHAKRA_NAMES[i].toLowerCase() as any,
  active: false,
  activationLevel: 0,
  blockages: 0,
  resonanceQuality: 0.5,
  lastActivated: null
}));

// Default chakra system
const DEFAULT_CHAKRA_SYSTEM: ChakraSystem = {
  chakras: {
    activationStates: DEFAULT_CHAKRA_ACTIVATION_STATES,
    energyLevels: Array.from({ length: 7 }, (_, i) => ({
      chakraId: i as ChakraId,
      currentLevel: 0,
      maxLevel: 100,
      flowRate: 1,
      blockagePoints: []
    })),
    balanceMetrics: {
      overallBalance: 0.5,
      chakraBalanceRatios: Object.fromEntries(Array.from({ length: 7 }, (_, i) => [i, 0.5])) as Record<ChakraId, number>,
      harmonicResonance: 0.5,
      stabilityIndex: 0.5
    },
    resonancePatterns: []
  },
  quantumStates: {
    entanglement: {
      activePairs: [],
      entanglementMatrix: Array.from({ length: 7 }, () => Array(7).fill(0)),
      coherenceIndex: 0
    },
    superposition: {
      activeChakras: [],
      potentialStates: 0,
      collapseThreshold: 0.7,
      probabilityDistribution: Array(7).fill(0.1)
    },
    coherence: {
      overallCoherence: 0,
      phaseSynchronization: 0,
      quantumResonance: 0,
      stabilityFactor: 0.5
    }
  },
  metrics: {
    activationHistory: [],
    progressionPath: {
      overallProgress: 0,
      chakraProgression: Object.fromEntries(Array.from({ length: 7 }, (_, i) => [i, 0])) as Record<ChakraId, number>,
      milestones: [],
      projectedGrowthRate: 0.01
    },
    performanceStats: {
      activationLatency: 0,
      energyEfficiency: 0.8,
      resonanceQuality: 0.7,
      stateTransitionSmoothness: 0.9
    }
  }
};

export interface ChakraSystemOptions {
  initialSystem?: Partial<ChakraSystem>;
  energyPoints?: number;
  activatedChakras?: number[];
  onActivationChange?: (activatedChakras: number[]) => void;
}

/**
 * Hook for chakra system management
 */
export function useChakraSystem(options: ChakraSystemOptions = {}) {
  const [system, setSystem] = useState<ChakraSystem>({
    ...DEFAULT_CHAKRA_SYSTEM,
    ...options.initialSystem
  });
  
  const { energyPoints = 0, activatedChakras = [] } = options;
  
  // Update chakra activation based on energy points and explicitly activated chakras
  useEffect(() => {
    // Performance optimization: Calculate derived state based on inputs
    const startTime = performance.now();
    
    // Update chakra activation states
    const newActivationStates = system.chakras.activationStates.map((state, index) => {
      const isExplicitlyActivated = activatedChakras.includes(index);
      
      // Calculate activation level based on energy points
      let calculatedLevel: ActivationLevel = 0;
      if (energyPoints > 100 * index) calculatedLevel = 0.2;
      if (energyPoints > 200 * index) calculatedLevel = 0.4;
      if (energyPoints > 300 * index) calculatedLevel = 0.6;
      if (energyPoints > 400 * index) calculatedLevel = 0.8;
      if (energyPoints > 500 * index) calculatedLevel = 1;
      
      // Prioritize explicit activation
      const activationLevel = isExplicitlyActivated ? 1 : calculatedLevel;
      
      return {
        ...state,
        active: activationLevel > 0,
        activationLevel,
        lastActivated: activationLevel > 0 ? Date.now() : state.lastActivated
      };
    });
    
    // Calculate overall balance
    const activeCount = newActivationStates.filter(s => s.active).length;
    const overallBalance = activeCount > 0 ? newActivationStates.reduce((sum, s) => sum + s.activationLevel, 0) / activeCount : 0;
    
    // Calculate energy levels
    const newEnergyLevels = system.chakras.energyLevels.map((level, index) => ({
      ...level,
      currentLevel: Math.min(level.maxLevel, energyPoints / (10 * (index + 1)))
    }));
    
    // Create entanglement patterns between adjacent activated chakras
    const newEntanglementPairs = [];
    for (let i = 0; i < 6; i++) {
      if (newActivationStates[i].active && newActivationStates[i + 1].active) {
        newEntanglementPairs.push({
          primaryChakra: i as ChakraId,
          secondaryChakra: (i + 1) as ChakraId,
          entanglementStrength: (newActivationStates[i].activationLevel + newActivationStates[i + 1].activationLevel) / 2,
          synchronizationRate: 0.7
        });
      }
    }
    
    // Create superposition state
    const activeChakraIds = newActivationStates
      .filter(s => s.active)
      .map(s => s.id);
      
    // Update system state
    setSystem(prevSystem => ({
      ...prevSystem,
      chakras: {
        ...prevSystem.chakras,
        activationStates: newActivationStates,
        energyLevels: newEnergyLevels,
        balanceMetrics: {
          ...prevSystem.chakras.balanceMetrics,
          overallBalance,
          chakraBalanceRatios: Object.fromEntries(
            newActivationStates.map(s => [s.id, s.activationLevel])
          ) as Record<ChakraId, number>,
        }
      },
      quantumStates: {
        ...prevSystem.quantumStates,
        entanglement: {
          ...prevSystem.quantumStates.entanglement,
          activePairs: newEntanglementPairs,
          coherenceIndex: newEntanglementPairs.length > 0 ? newEntanglementPairs.reduce((sum, p) => sum + p.entanglementStrength, 0) / newEntanglementPairs.length : 0
        },
        superposition: {
          ...prevSystem.quantumStates.superposition,
          activeChakras: activeChakraIds,
          potentialStates: Math.pow(2, activeChakraIds.length),
          probabilityDistribution: Array(7).fill(0).map((_, i) => 
            newActivationStates[i].active ? newActivationStates[i].activationLevel : 0
          )
        }
      },
      metrics: {
        ...prevSystem.metrics,
        performanceStats: {
          ...prevSystem.metrics.performanceStats,
          activationLatency: performance.now() - startTime,
        }
      }
    }));
    
  }, [energyPoints, activatedChakras, system.chakras.activationStates]);
  
  // Extract the active chakras
  const activeChakras = useMemo(() => {
    return system.chakras.activationStates
      .filter(state => state.active)
      .map(state => state.id);
  }, [system.chakras.activationStates]);
  
  // Calculate if the chakra system is in balance
  const isInBalance = useMemo(() => {
    return system.chakras.balanceMetrics.overallBalance > 0.7;
  }, [system.chakras.balanceMetrics.overallBalance]);
  
  // Activate a specific chakra
  const activateChakra = useCallback((chakraId: ChakraId, level: ActivationLevel = 1) => {
    setSystem(prevSystem => {
      const newActivationStates = [...prevSystem.chakras.activationStates];
      newActivationStates[chakraId] = {
        ...newActivationStates[chakraId],
        active: true,
        activationLevel: level,
        lastActivated: Date.now()
      };
      
      return {
        ...prevSystem,
        chakras: {
          ...prevSystem.chakras,
          activationStates: newActivationStates
        }
      };
    });
  }, []);
  
  // Deactivate a specific chakra
  const deactivateChakra = useCallback((chakraId: ChakraId) => {
    setSystem(prevSystem => {
      const newActivationStates = [...prevSystem.chakras.activationStates];
      newActivationStates[chakraId] = {
        ...newActivationStates[chakraId],
        active: false,
        activationLevel: 0
      };
      
      return {
        ...prevSystem,
        chakras: {
          ...prevSystem.chakras,
          activationStates: newActivationStates
        }
      };
    });
  }, []);
  
  // Reset the chakra system
  const resetSystem = useCallback(() => {
    setSystem(DEFAULT_CHAKRA_SYSTEM);
  }, []);
  
  return {
    system,
    activeChakras,
    isInBalance,
    activateChakra,
    deactivateChakra,
    resetSystem
  };
}
