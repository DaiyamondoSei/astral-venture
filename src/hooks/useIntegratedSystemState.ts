
import { useState, useEffect, useCallback, useMemo } from 'react';
import { usePerfConfig } from './usePerfConfig';
import { Result, success, failure } from '../utils/result/Result';
import { asyncResultify } from '../utils/result/AsyncResult';

import type { 
  VisualizationSystem, 
  VisualState, 
  RenderingEngine 
} from '../types/visualization/VisualSystemTypes';

import type {
  ChakraSystem,
  ChakraType,
  EnergyLevel,
  ChakraStatus
} from '../types/chakra/ChakraSystemTypes';

// Default visual states
const DEFAULT_VISUAL_STATES: Record<string, VisualState> = {
  transcendence: {
    active: false,
    intensity: 0,
    level: 'inactive',
    transitionDuration: 1000,
    glowIntensity: 0.7,
    particleCount: 150,
    colorPalette: ['#8A2BE2', '#9370DB', '#E6E6FA']
  },
  infinity: {
    active: false,
    intensity: 0,
    level: 'inactive',
    transitionDuration: 1500,
    glowIntensity: 0.9,
    particleCount: 200,
    colorPalette: ['#00BFFF', '#1E90FF', '#87CEFA']
  },
  illumination: {
    active: false,
    intensity: 0,
    level: 'inactive',
    transitionDuration: 800,
    glowIntensity: 0.6,
    particleCount: 100,
    colorPalette: ['#FFD700', '#FFA500', '#FFFFE0']
  },
  fractal: {
    active: false,
    intensity: 0,
    level: 'inactive',
    transitionDuration: 1200,
    glowIntensity: 0.5,
    particleCount: 120,
    colorPalette: ['#32CD32', '#7CFC00', '#98FB98']
  }
};

// Default chakra states
const DEFAULT_CHAKRA_STATES: Record<ChakraType, ChakraStatus> = {
  'root': {
    type: 'root',
    energyLevel: 'dormant',
    activationPercentage: 0,
    blockagePercentage: 0,
    dominantElement: 'earth',
    associatedEmotions: ['security', 'stability']
  },
  'sacral': {
    type: 'sacral',
    energyLevel: 'dormant',
    activationPercentage: 0,
    blockagePercentage: 0,
    dominantElement: 'water',
    associatedEmotions: ['creativity', 'passion']
  },
  'solar': {
    type: 'solar',
    energyLevel: 'dormant',
    activationPercentage: 0,
    blockagePercentage: 0,
    dominantElement: 'fire',
    associatedEmotions: ['confidence', 'power']
  },
  'heart': {
    type: 'heart',
    energyLevel: 'dormant',
    activationPercentage: 0,
    blockagePercentage: 0,
    dominantElement: 'air',
    associatedEmotions: ['love', 'compassion']
  },
  'throat': {
    type: 'throat',
    energyLevel: 'dormant',
    activationPercentage: 0,
    blockagePercentage: 0,
    dominantElement: 'ether',
    associatedEmotions: ['expression', 'truth']
  },
  'third-eye': {
    type: 'third-eye',
    energyLevel: 'dormant',
    activationPercentage: 0,
    blockagePercentage: 0,
    dominantElement: 'light',
    associatedEmotions: ['intuition', 'insight']
  },
  'crown': {
    type: 'crown',
    energyLevel: 'dormant',
    activationPercentage: 0,
    blockagePercentage: 0,
    dominantElement: 'cosmic',
    associatedEmotions: ['consciousness', 'connection']
  }
};

export interface IntegratedSystemOptions {
  initialVisualEngine?: RenderingEngine;
  adaptToPerformance?: boolean;
  detailLevel?: 'low' | 'medium' | 'high';
  trackPerformance?: boolean;
  chakraActivations?: Record<ChakraType, number>;
  enableQuantumEffects?: boolean;
}

export interface IntegratedSystemResult {
  // Visual system state
  visualSystem: VisualizationSystem;
  updateVisualState: (stateName: string, updates: Partial<VisualState>) => void;
  setActiveVisualStates: (stateNames: string[]) => void;
  
  // Chakra system state
  chakraSystem: ChakraSystem;
  updateChakraActivation: (chakra: ChakraType, activationPercentage: number) => void;
  getChakraStatus: (chakra: ChakraType) => ChakraStatus;
  
  // Integration features
  synchronizeChakraToVisual: (mapping?: Record<ChakraType, string>) => void;
  adaptToDeviceCapability: () => void;
  
  // Performance
  renderingQuality: 'low' | 'medium' | 'high';
  isPerformanceConstrained: boolean;
  
  // Utility
  resetSystem: () => void;
}

/**
 * Hook for managing the integrated visual and chakra systems
 * 
 * Provides a unified interface for controlling both systems simultaneously,
 * with automatic performance optimization and type safety.
 */
export function useIntegratedSystemState(
  options: IntegratedSystemOptions = {}
): Result<IntegratedSystemResult, Error> {
  const {
    initialVisualEngine = 'svg',
    adaptToPerformance = true,
    detailLevel = 'medium',
    trackPerformance = true,
    chakraActivations = {},
    enableQuantumEffects = false
  } = options;

  // Get performance configuration
  const perfConfig = usePerfConfig();
  const { deviceCapability, isLowPerformance, shouldUseSimplifiedUI } = perfConfig;
  
  // Determine rendering quality based on performance
  const renderingQuality = useMemo((): 'low' | 'medium' | 'high' => {
    if (!adaptToPerformance) return detailLevel;
    
    if (isLowPerformance || shouldUseSimplifiedUI) {
      return 'low';
    } else if (deviceCapability === 'high' && detailLevel === 'high') {
      return 'high';
    }
    
    return 'medium';
  }, [adaptToPerformance, detailLevel, isLowPerformance,
      shouldUseSimplifiedUI, deviceCapability]);

  // Initialize core state
  const [visualSystem, setVisualSystem] = useState<VisualizationSystem>({
    renderingEngine: initialVisualEngine,
    performanceSettings: {
      adaptiveQuality: adaptToPerformance,
      measurePerformance: trackPerformance,
      targetFrameRate: 60,
      dropQualityThreshold: 45,
      recoveryDelay: 5000
    },
    visualStates: DEFAULT_VISUAL_STATES,
    animations: {
      transitions: {
        duration: 1000,
        easing: 'ease-out',
        staggered: true,
        staggerDelay: 100
      },
      particles: {
        count: renderingQuality === 'low' ? 50 : renderingQuality === 'medium' ? 100 : 200,
        size: [1, 3],
        speed: [0.5, 2],
        lifespan: [2000, 5000],
        colors: ['#8A2BE2', '#00BFFF', '#FFD700'],
        motionPattern: enableQuantumEffects ? 'quantum' : 'random'
      },
      glowEffects: {
        intensity: renderingQuality === 'low' ? 0.3 : renderingQuality === 'medium' ? 0.6 : 0.9,
        radius: renderingQuality === 'low' ? 10 : renderingQuality === 'medium' ? 20 : 30,
        color: '#FFFFFF',
        pulsate: true,
        pulsateFrequency: 2000
      }
    }
  });

  const [chakraSystem, setChakraSystem] = useState<ChakraSystem>({
    chakras: {
      activationStates: DEFAULT_CHAKRA_STATES,
      energyLevels: Object.keys(DEFAULT_CHAKRA_STATES).reduce((acc, chakra) => ({
        ...acc,
        [chakra]: 'dormant'
      }), {} as Record<ChakraType, EnergyLevel>),
      balanceMetrics: {
        overallBalance: 0,
        energyDistribution: Object.keys(DEFAULT_CHAKRA_STATES).reduce((acc, chakra) => ({
          ...acc,
          [chakra]: 0
        }), {} as Record<ChakraType, number>)
      },
      resonancePatterns: []
    },
    quantumStates: enableQuantumEffects ? {
      entanglement: {
        entangledChakras: [],
        entanglementStrength: 0,
        synchronicity: 0
      },
      superposition: {
        activeChakras: [],
        potentialStates: {},
        waveFunction: 0,
        collapseThreshold: 0.7
      },
      coherence: {
        overallCoherence: 0,
        stabilityIndex: 0,
        harmonicResonance: 0,
        entropyLevel: 0
      }
    } : undefined,
    metrics: trackPerformance ? {
      activationHistory: [],
      progressionPath: {
        historicalBalance: {},
        awakening: Object.keys(DEFAULT_CHAKRA_STATES).reduce((acc, chakra) => ({
          ...acc,
          [chakra]: 0
        }), {} as Record<ChakraType, number>),
        totalActivationTime: Object.keys(DEFAULT_CHAKRA_STATES).reduce((acc, chakra) => ({
          ...acc,
          [chakra]: 0
        }), {} as Record<ChakraType, number>),
        milestones: []
      },
      performanceStats: {
        energyEfficiency: 100,
        recoveryRate: 100,
        adaptabilityIndex: 100,
        resistanceFactors: []
      }
    } : undefined
  });

  // Update chakra activation
  const updateChakraActivation = useCallback((
    chakra: ChakraType,
    activationPercentage: number
  ) => {
    setChakraSystem(prev => {
      const newActivationStates = {
        ...prev.chakras.activationStates,
        [chakra]: {
          ...prev.chakras.activationStates[chakra],
          activationPercentage,
          energyLevel: activationPercentage > 80 ? 'transcendent' :
                      activationPercentage > 60 ? 'heightened' :
                      activationPercentage > 40 ? 'balanced' :
                      activationPercentage > 20 ? 'active' :
                      activationPercentage > 0 ? 'awakening' : 'dormant'
        }
      };

      return {
        ...prev,
        chakras: {
          ...prev.chakras,
          activationStates: newActivationStates,
          energyLevels: Object.keys(newActivationStates).reduce((acc, key) => ({
            ...acc,
            [key]: newActivationStates[key as ChakraType].energyLevel
          }), {} as Record<ChakraType, EnergyLevel>)
        }
      };
    });
  }, []);

  // Update visual state
  const updateVisualState = useCallback((
    stateName: string,
    updates: Partial<VisualState>
  ) => {
    setVisualSystem(prev => ({
      ...prev,
      visualStates: {
        ...prev.visualStates,
        [stateName]: {
          ...prev.visualStates[stateName],
          ...updates
        }
      }
    }));
  }, []);

  // Set active visual states
  const setActiveVisualStates = useCallback((stateNames: string[]) => {
    setVisualSystem(prev => ({
      ...prev,
      visualStates: Object.keys(prev.visualStates).reduce((acc, key) => ({
        ...acc,
        [key]: {
          ...prev.visualStates[key],
          active: stateNames.includes(key)
        }
      }), prev.visualStates)
    }));
  }, []);

  // Get chakra status
  const getChakraStatus = useCallback((chakra: ChakraType): ChakraStatus => {
    return chakraSystem.chakras.activationStates[chakra];
  }, [chakraSystem.chakras.activationStates]);

  // Synchronize chakra states to visual states
  const synchronizeChakraToVisual = useCallback((
    mapping: Record<ChakraType, string> = {
      root: 'fractal',
      sacral: 'illumination',
      solar: 'infinity',
      heart: 'transcendence',
      throat: 'illumination',
      'third-eye': 'infinity',
      crown: 'transcendence'
    }
  ) => {
    const activeVisualStates = new Set<string>();
    
    Object.entries(chakraSystem.chakras.activationStates).forEach(([chakra, status]) => {
      if (status.activationPercentage > 40) {
        const visualState = mapping[chakra as ChakraType];
        if (visualState) {
          activeVisualStates.add(visualState);
        }
      }
    });
    
    setActiveVisualStates(Array.from(activeVisualStates));
  }, [chakraSystem.chakras.activationStates, setActiveVisualStates]);

  // Adapt to device capability
  const adaptToDeviceCapability = useCallback(() => {
    if (!adaptToPerformance) return;

    const quality = renderingQuality;
    
    setVisualSystem(prev => ({
      ...prev,
      animations: {
        ...prev.animations,
        particles: {
          ...prev.animations.particles,
          count: quality === 'low' ? 50 : quality === 'medium' ? 100 : 200,
        },
        glowEffects: {
          ...prev.animations.glowEffects,
          intensity: quality === 'low' ? 0.3 : quality === 'medium' ? 0.6 : 0.9,
          radius: quality === 'low' ? 10 : quality === 'medium' ? 20 : 30
        }
      }
    }));
  }, [adaptToPerformance, renderingQuality]);

  // Reset systems to default state
  const resetSystem = useCallback(() => {
    setVisualSystem(prev => ({
      ...prev,
      visualStates: DEFAULT_VISUAL_STATES
    }));
    
    setChakraSystem(prev => ({
      ...prev,
      chakras: {
        ...prev.chakras,
        activationStates: DEFAULT_CHAKRA_STATES
      }
    }));
  }, []);

  // Initialize chakra activations from props
  useEffect(() => {
    Object.entries(chakraActivations).forEach(([chakra, activation]) => {
      updateChakraActivation(chakra as ChakraType, activation);
    });
  }, [chakraActivations, updateChakraActivation]);

  // Return success result with system state and methods
  return success({
    visualSystem,
    updateVisualState,
    setActiveVisualStates,
    chakraSystem,
    updateChakraActivation,
    getChakraStatus,
    synchronizeChakraToVisual,
    adaptToDeviceCapability,
    renderingQuality,
    isPerformanceConstrained: isLowPerformance || shouldUseSimplifiedUI,
    resetSystem
  });
}
