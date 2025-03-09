
import React, { createContext, useContext, ReactNode } from 'react';
import { useConsciousnessData } from '@/hooks/useConsciousnessData';
import type { 
  ConsciousnessMetrics, 
  ConsciousnessProgress,
  DreamRecord,
  ChakraSystem,
  ChakraType 
} from '@/types/consciousness';

/**
 * Context type for Consciousness data
 */
interface ConsciousnessContextType {
  // Data
  consciousnessMetrics: ConsciousnessMetrics | null;
  progress: ConsciousnessProgress | null;
  dreams: DreamRecord[];
  chakraSystem: ChakraSystem | null;
  
  // Status
  isLoading: boolean;
  error: string | null;
  
  // Actions
  refreshData: () => Promise<void>;
  saveDream: (dreamContent: string) => Promise<DreamRecord | null>;
  updateChakraActivation: (chakraType: ChakraType, activation: number) => Promise<boolean>;
  getChakraRecommendations: () => {
    focusChakras: ChakraType[];
    recommendations: string[];
  };
}

// Create context with default values
const ConsciousnessContext = createContext<ConsciousnessContextType>({
  consciousnessMetrics: null,
  progress: null,
  dreams: [],
  chakraSystem: null,
  isLoading: false,
  error: null,
  refreshData: async () => {},
  saveDream: async () => null,
  updateChakraActivation: async () => false,
  getChakraRecommendations: () => ({ focusChakras: [], recommendations: [] })
});

/**
 * Provider component for consciousness data
 */
export const ConsciousnessProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const consciousnessData = useConsciousnessData();
  
  return (
    <ConsciousnessContext.Provider value={consciousnessData}>
      {children}
    </ConsciousnessContext.Provider>
  );
};

/**
 * Custom hook to use consciousness data
 */
export const useConsciousness = (): ConsciousnessContextType => {
  const context = useContext(ConsciousnessContext);
  
  if (!context) {
    throw new Error('useConsciousness must be used within a ConsciousnessProvider');
  }
  
  return context;
};
