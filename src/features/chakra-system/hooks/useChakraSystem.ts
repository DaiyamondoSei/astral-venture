
import { useState, useEffect } from 'react';
import { ChakraType, ChakraData, ChakraSystemState } from '../types/chakraTypes';

const defaultChakraData: Record<ChakraType, Partial<ChakraData>> = {
  'crown': { 
    name: 'Crown', 
    color: 'violet', 
    relatedEmotions: ['awareness', 'consciousness', 'connection'] 
  },
  'third-eye': { 
    name: 'Third Eye', 
    color: 'indigo', 
    relatedEmotions: ['intuition', 'imagination', 'visualization'] 
  },
  'throat': { 
    name: 'Throat', 
    color: 'blue', 
    relatedEmotions: ['expression', 'truth', 'communication'] 
  },
  'heart': { 
    name: 'Heart', 
    color: 'green', 
    relatedEmotions: ['love', 'compassion', 'healing'] 
  },
  'solar': { 
    name: 'Solar Plexus', 
    color: 'yellow', 
    relatedEmotions: ['power', 'confidence', 'self-esteem'] 
  },
  'sacral': { 
    name: 'Sacral', 
    color: 'orange', 
    relatedEmotions: ['creativity', 'emotion', 'pleasure'] 
  },
  'root': { 
    name: 'Root', 
    color: 'red', 
    relatedEmotions: ['stability', 'security', 'groundedness'] 
  }
};

/**
 * useChakraSystem Hook
 * 
 * A hook for managing the state of the chakra system.
 */
export const useChakraSystem = (initialEnergyLevel = 50) => {
  const [state, setState] = useState<ChakraSystemState>(() => {
    // Initialize chakra system state
    const chakras = Object.entries(defaultChakraData).reduce((acc, [type, data]) => {
      acc[type as ChakraType] = {
        type: type as ChakraType,
        name: data.name || '',
        description: data.description || '',
        color: data.color || '',
        activationLevel: 0,
        isActive: false,
        isBlocked: false,
        relatedEmotions: data.relatedEmotions || [],
      } as ChakraData;
      return acc;
    }, {} as Record<ChakraType, ChakraData>);

    return {
      chakras,
      activeChakras: [],
      overallBalance: 0,
      dominantChakra: null,
      energyLevel: initialEnergyLevel,
    };
  });

  // Activate a specific chakra
  const activateChakra = (type: ChakraType, level = 100) => {
    setState(prev => {
      const updatedChakras = { ...prev.chakras };
      updatedChakras[type] = {
        ...updatedChakras[type],
        activationLevel: level,
        isActive: level > 30,
        isBlocked: false,
      };

      const activeChakras = Object.values(updatedChakras)
        .filter(chakra => chakra.isActive)
        .map(chakra => chakra.type);

      return {
        ...prev,
        chakras: updatedChakras,
        activeChakras,
        overallBalance: calculateOverallBalance(updatedChakras),
        dominantChakra: findDominantChakra(updatedChakras),
      };
    });
  };

  // Deactivate a specific chakra
  const deactivateChakra = (type: ChakraType) => {
    setState(prev => {
      const updatedChakras = { ...prev.chakras };
      updatedChakras[type] = {
        ...updatedChakras[type],
        activationLevel: 0,
        isActive: false,
      };

      const activeChakras = Object.values(updatedChakras)
        .filter(chakra => chakra.isActive)
        .map(chakra => chakra.type);

      return {
        ...prev,
        chakras: updatedChakras,
        activeChakras,
        overallBalance: calculateOverallBalance(updatedChakras),
        dominantChakra: findDominantChakra(updatedChakras),
      };
    });
  };

  // Set the overall energy level
  const setEnergyLevel = (level: number) => {
    setState(prev => ({
      ...prev,
      energyLevel: Math.min(100, Math.max(0, level)),
    }));
  };

  // Reset the chakra system
  const resetChakraSystem = () => {
    setState(prev => {
      const updatedChakras = { ...prev.chakras };
      Object.keys(updatedChakras).forEach(key => {
        updatedChakras[key as ChakraType] = {
          ...updatedChakras[key as ChakraType],
          activationLevel: 0,
          isActive: false,
          isBlocked: false,
        };
      });

      return {
        ...prev,
        chakras: updatedChakras,
        activeChakras: [],
        overallBalance: 0,
        dominantChakra: null,
        energyLevel: initialEnergyLevel,
      };
    });
  };

  // Helper functions
  const calculateOverallBalance = (chakras: Record<ChakraType, ChakraData>): number => {
    const activationValues = Object.values(chakras).map(c => c.activationLevel);
    const sum = activationValues.reduce((acc, val) => acc + val, 0);
    const count = activationValues.length;
    const mean = sum / count;
    
    // Calculate how balanced the system is based on deviation from mean
    const deviations = activationValues.map(val => Math.abs(val - mean));
    const avgDeviation = deviations.reduce((acc, val) => acc + val, 0) / count;
    
    // Convert to a 0-100 scale where 100 is perfectly balanced
    return 100 - (avgDeviation / 100 * 100);
  };

  const findDominantChakra = (chakras: Record<ChakraType, ChakraData>): ChakraType | null => {
    const entries = Object.entries(chakras) as [ChakraType, ChakraData][];
    const sorted = entries.sort((a, b) => b[1].activationLevel - a[1].activationLevel);
    return sorted[0][1].activationLevel > 50 ? sorted[0][0] : null;
  };

  return {
    chakraSystem: state,
    activateChakra,
    deactivateChakra,
    setEnergyLevel,
    resetChakraSystem,
  };
};
