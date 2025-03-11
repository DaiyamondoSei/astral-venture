
/**
 * Hook for managing the integrated visual and chakra systems
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { usePerfConfig } from './usePerfConfig';
import { ChakraSystem, ChakraType } from '../types/chakra/ChakraTypes';
import { 
  VisualizationSystem, 
  ChakraVisualizationState,
  VisualState
} from '../types/visualization/VisualSystemTypes';

// Default states
const DEFAULT_VISUAL_STATE: VisualState = {
  active: false,
  intensity: 0.5,
  color: '#7c3aed',
  opacity: 0.8,
  scale: 1,
  rotation: 0
};

const DEFAULT_VISUAL_SYSTEM: VisualizationSystem = {
  visualStates: {
    transcendence: { ...DEFAULT_VISUAL_STATE, color: '#8b5cf6' },
    infinity: { ...DEFAULT_VISUAL_STATE, color: '#3b82f6' },
    illumination: { ...DEFAULT_VISUAL_STATE, color: '#f59e0b' },
    fractal: { ...DEFAULT_VISUAL_STATE, color: '#10b981' }
  },
  renderingEngine: {
    useWebGL: true,
    useSVGOptimization: true,
    useCanvasForEffects: true,
    useOffscreenRendering: false,
    useHardwareAcceleration: true
  },
  performanceSettings: {
    targetFPS: 60,
    qualityLevel: 'high',
    useSimplifiedEffects: false,
    disableBlur: false,
    disableShadows: false,
    particleCount: 100,
    maxAnimationsPerFrame: 20
  },
  animations: {
    primary: {
      duration: 'normal',
      timingFunction: 'ease-out',
      transitionType: 'fade',
      enableParallax: true,
      enableStaggering: true,
      staggerAmount: 0.05
    },
    secondary: {
      duration: 'fast',
      timingFunction: 'ease-in-out',
      transitionType: 'pulse',
      enableParallax: false,
      enableStaggering: true,
      staggerAmount: 0.02
    },
    background: {
      duration: 'slow',
      timingFunction: 'linear',
      transitionType: 'fade',
      enableParallax: true,
      enableStaggering: false,
      staggerAmount: 0
    },
    particles: {
      count: 100,
      size: 3,
      speed: 1,
      color: '#8b5cf6',
      opacity: 0.6,
      variability: 0.3
    },
    glow: {
      radius: 20,
      intensity: 0.7,
      color: '#8b5cf6',
      pulseRate: 0.5
    }
  }
};

// Empty chakra activation levels
const EMPTY_ACTIVATION_LEVELS: Record<ChakraType, number> = {
  root: 0,
  sacral: 0,
  solar: 0,
  heart: 0,
  throat: 0,
  third: 0,
  crown: 0
};

// Default chakra visualization state
const DEFAULT_CHAKRA_VISUALIZATION: ChakraVisualizationState = {
  activationLevels: EMPTY_ACTIVATION_LEVELS,
  resonancePatterns: [],
  energyFlow: {
    direction: 'balanced',
    flowRate: 0,
    dominantChakra: null
  },
  systemState: {
    balance: 0.5,
    coherence: 0.5,
    totalEnergy: 0,
    harmonization: 0.5
  }
};

export interface UseIntegratedSystemOptions {
  initialChakraState?: Partial<ChakraVisualizationState>;
  initialVisualSystem?: Partial<VisualizationSystem>;
  adaptToPerformance?: boolean;
  interactiveMode?: boolean;
}

/**
 * Hook for integrating chakra and visual systems with performance adaptation
 */
export function useIntegratedSystemState(options: UseIntegratedSystemOptions = {}) {
  const {
    initialChakraState,
    initialVisualSystem,
    adaptToPerformance = true,
    interactiveMode = true
  } = options;
  
  // Access performance configuration
  const perfConfig = usePerfConfig();
  
  // Initialize the chakra visualization state
  const [chakraState, setChakraState] = useState<ChakraVisualizationState>({
    ...DEFAULT_CHAKRA_VISUALIZATION,
    ...initialChakraState
  });
  
  // Initialize the visual system
  const [visualSystem, setVisualSystem] = useState<VisualizationSystem>({
    ...DEFAULT_VISUAL_SYSTEM,
    ...initialVisualSystem
  });
  
  // Apply performance adaptations when device capability or config changes
  useEffect(() => {
    if (!adaptToPerformance) return;
    
    // Adapt visualizations based on performance capability
    const adaptedSystem = { ...visualSystem };
    
    if (perfConfig.isLowPerformance) {
      // Optimize for low-end devices
      adaptedSystem.performanceSettings.qualityLevel = 'low';
      adaptedSystem.performanceSettings.useSimplifiedEffects = true;
      adaptedSystem.performanceSettings.disableBlur = true;
      adaptedSystem.performanceSettings.disableShadows = true;
      adaptedSystem.performanceSettings.particleCount = 20;
      adaptedSystem.performanceSettings.maxAnimationsPerFrame = 5;
      adaptedSystem.animations.particles.count = 20;
      adaptedSystem.animations.primary.enableParallax = false;
      adaptedSystem.animations.secondary.enableStaggering = false;
      adaptedSystem.renderingEngine.useWebGL = false;
      adaptedSystem.renderingEngine.useOffscreenRendering = false;
      
    } else if (perfConfig.isMediumPerformance) {
      // Balanced settings for medium performance
      adaptedSystem.performanceSettings.qualityLevel = 'medium';
      adaptedSystem.performanceSettings.useSimplifiedEffects = false;
      adaptedSystem.performanceSettings.disableBlur = false;
      adaptedSystem.performanceSettings.disableShadows = false;
      adaptedSystem.performanceSettings.particleCount = 50;
      adaptedSystem.performanceSettings.maxAnimationsPerFrame = 10;
      adaptedSystem.animations.particles.count = 50;
      adaptedSystem.renderingEngine.useWebGL = true;
      
    } else if (perfConfig.isHighPerformance) {
      // Full experience for high-end devices
      adaptedSystem.performanceSettings.qualityLevel = 'high';
      adaptedSystem.performanceSettings.particleCount = 150;
      adaptedSystem.performanceSettings.maxAnimationsPerFrame = 30;
      adaptedSystem.animations.particles.count = 150;
      adaptedSystem.renderingEngine.useWebGL = true;
      adaptedSystem.renderingEngine.useOffscreenRendering = true;
    }
    
    // Update the system with adapted settings
    setVisualSystem(adaptedSystem);
    
  }, [
    perfConfig.isLowPerformance, 
    perfConfig.isMediumPerformance, 
    perfConfig.isHighPerformance,
    adaptToPerformance,
    visualSystem
  ]);
  
  // Update chakra activation levels
  const updateActivationLevels = useCallback((
    newLevels: Partial<Record<ChakraType, number>>
  ) => {
    setChakraState(prev => ({
      ...prev,
      activationLevels: {
        ...prev.activationLevels,
        ...newLevels
      }
    }));
  }, []);
  
  // Calculate resonance patterns between chakras
  const calculateResonance = useCallback((
    activationLevels: Record<ChakraType, number>
  ) => {
    const resonancePatterns = [];
    const chakraTypes: ChakraType[] = ['root', 'sacral', 'solar', 'heart', 'throat', 'third', 'crown'];
    
    // Natural resonance pairs
    const naturalPairs: Array<[ChakraType, ChakraType]> = [
      ['root', 'crown'],
      ['sacral', 'throat'],
      ['solar', 'third'],
      ['heart', 'heart'] // Heart resonates with itself
    ];
    
    // Calculate resonance for natural pairs
    for (const [source, target] of naturalPairs) {
      const sourceLevel = activationLevels[source];
      const targetLevel = activationLevels[target];
      
      if (sourceLevel > 0.3 && targetLevel > 0.3) {
        const strength = Math.min(1, (sourceLevel + targetLevel) / 1.8);
        resonancePatterns.push({
          source,
          target,
          strength,
          harmony: true
        });
      }
    }
    
    // Add some additional resonance based on energy levels
    for (let i = 0; i < chakraTypes.length - 1; i++) {
      const source = chakraTypes[i];
      const target = chakraTypes[i + 1];
      const sourceLevel = activationLevels[source];
      const targetLevel = activationLevels[target];
      
      // Adjacent chakras often resonate
      if (sourceLevel > 0.4 && targetLevel > 0.4) {
        const strength = Math.min(1, (sourceLevel + targetLevel) / 2 - 0.2);
        if (strength > 0.3) {
          resonancePatterns.push({
            source,
            target,
            strength,
            harmony: Math.abs(sourceLevel - targetLevel) < 0.3 // Harmony if levels are close
          });
        }
      }
    }
    
    return resonancePatterns;
  }, []);
  
  // Calculate the overall system state
  const calculateSystemState = useCallback((
    activationLevels: Record<ChakraType, number>,
    resonancePatterns: Array<any>
  ) => {
    // Calculate total energy
    const totalEnergy = Object.values(activationLevels).reduce((sum, level) => sum + level, 0);
    
    // Calculate balance (how evenly distributed the energy is)
    const chakraCount = Object.keys(activationLevels).length;
    const idealEnergyPerChakra = totalEnergy / chakraCount;
    
    const deviations = Object.values(activationLevels).map(level => 
      Math.abs(level - idealEnergyPerChakra)
    );
    
    const totalDeviation = deviations.reduce((sum, dev) => sum + dev, 0);
    const maxPossibleDeviation = totalEnergy; // Worst case: all energy in one chakra
    
    // Higher value means better balance
    const balance = 1 - (totalDeviation / maxPossibleDeviation || 0);
    
    // Calculate coherence based on resonance patterns
    const harmonicResonances = resonancePatterns.filter(pattern => pattern.harmony);
    const coherence = resonancePatterns.length > 0 
      ? harmonicResonances.length / resonancePatterns.length 
      : 0.5;
    
    // Calculate harmonization (combined metric)
    const harmonization = (balance + coherence) / 2;
    
    return {
      balance,
      coherence,
      totalEnergy,
      harmonization
    };
  }, []);
  
  // Find the dominant chakra
  const findDominantChakra = useCallback((
    activationLevels: Record<ChakraType, number>
  ): ChakraType | null => {
    let dominant: ChakraType | null = null;
    let maxLevel = 0;
    
    for (const [chakra, level] of Object.entries(activationLevels)) {
      if (level > maxLevel) {
        maxLevel = level;
        dominant = chakra as ChakraType;
      }
    }
    
    // Only return a dominant chakra if its activation is significant
    return maxLevel > 0.4 ? dominant : null;
  }, []);
  
  // Determine energy flow direction
  const determineFlowDirection = useCallback((
    activationLevels: Record<ChakraType, number>
  ): 'ascending' | 'descending' | 'balanced' => {
    const lowerChakras = ['root', 'sacral', 'solar'];
    const upperChakras = ['throat', 'third', 'crown'];
    
    const lowerTotal = lowerChakras.reduce((sum, chakra) => sum + activationLevels[chakra], 0);
    const upperTotal = upperChakras.reduce((sum, chakra) => sum + activationLevels[chakra], 0);
    const heartLevel = activationLevels.heart;
    
    // Calculate the difference as a percentage of total energy
    const totalEnergy = lowerTotal + upperTotal + heartLevel;
    if (totalEnergy < 0.5) return 'balanced'; // Not enough energy to determine
    
    const difference = (upperTotal - lowerTotal) / totalEnergy;
    
    if (difference > 0.2) return 'ascending';
    if (difference < -0.2) return 'descending';
    return 'balanced';
  }, []);
  
  // Update the chakra visualization based on new activation levels
  const updateChakraVisualization = useCallback((
    activationLevels: Partial<Record<ChakraType, number>>
  ) => {
    setChakraState(prev => {
      // Merge new activation levels
      const updatedLevels = {
        ...prev.activationLevels,
        ...activationLevels
      };
      
      // Calculate resonance patterns
      const resonancePatterns = calculateResonance(updatedLevels);
      
      // Find dominant chakra
      const dominantChakra = findDominantChakra(updatedLevels);
      
      // Determine flow direction
      const direction = determineFlowDirection(updatedLevels);
      
      // Calculate flow rate based on total energy
      const totalEnergy = Object.values(updatedLevels).reduce((sum, level) => sum + level, 0);
      const flowRate = totalEnergy / 7; // 7 chakras as denominator for normalization
      
      // Calculate system state
      const systemState = calculateSystemState(updatedLevels, resonancePatterns);
      
      // Return updated state
      return {
        activationLevels: updatedLevels,
        resonancePatterns,
        energyFlow: {
          direction,
          flowRate,
          dominantChakra
        },
        systemState
      };
    });
  }, [
    calculateResonance,
    calculateSystemState,
    findDominantChakra,
    determineFlowDirection
  ]);
  
  // Update a specific visual state
  const updateVisualState = useCallback((
    stateKey: keyof VisualizationSystem['visualStates'],
    updates: Partial<VisualState>
  ) => {
    setVisualSystem(prev => ({
      ...prev,
      visualStates: {
        ...prev.visualStates,
        [stateKey]: {
          ...prev.visualStates[stateKey],
          ...updates
        }
      }
    }));
  }, []);
  
  // Update performance settings
  const updatePerformanceSettings = useCallback((
    updates: Partial<VisualizationSystem['performanceSettings']>
  ) => {
    setVisualSystem(prev => ({
      ...prev,
      performanceSettings: {
        ...prev.performanceSettings,
        ...updates
      }
    }));
  }, []);
  
  // Derive colors for visualization based on active chakras
  const chakraColors = useMemo(() => {
    const colorMap: Record<ChakraType, string> = {
      root: '#ff0000',
      sacral: '#ff8c00',
      solar: '#ffff00',
      heart: '#00ff00',
      throat: '#00bfff',
      third: '#0000ff',
      crown: '#8a2be2'
    };
    
    // Calculate weighted color values based on activation levels
    return Object.entries(chakraState.activationLevels).reduce((result, [chakra, level]) => {
      if (level > 0.2) {
        result[chakra as ChakraType] = colorMap[chakra as ChakraType];
      }
      return result;
    }, {} as Record<ChakraType, string>);
  }, [chakraState.activationLevels]);
  
  // Calculate overall system activity level for animations
  const systemActivity = useMemo(() => {
    const { totalEnergy, harmonization } = chakraState.systemState;
    return (totalEnergy / 7) * 0.7 + harmonization * 0.3;
  }, [chakraState.systemState]);
  
  return {
    chakraState,
    visualSystem,
    chakraColors,
    systemActivity,
    updateActivationLevels,
    updateChakraVisualization,
    updateVisualState,
    updatePerformanceSettings,
    isLowPerformance: perfConfig.isLowPerformance,
    isMediumPerformance: perfConfig.isMediumPerformance,
    isHighPerformance: perfConfig.isHighPerformance
  };
}
