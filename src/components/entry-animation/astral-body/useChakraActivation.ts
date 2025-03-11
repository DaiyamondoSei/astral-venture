
import { useState, useEffect, useMemo, useCallback } from 'react';
import { ChakraActivation } from './ChakraPoints';

/**
 * Interface defining chakra activation options
 */
export interface ChakraActivationOptions {
  userDream?: string | null;
  dominantTheme?: string | null;
  initialActivation?: Partial<ChakraActivation>;
  deepAnalysisEnabled?: boolean;
}

/**
 * useChakraActivation Hook
 * 
 * This hook processes user dream content and dominant themes to determine
 * which chakras should be activated in the visualization.
 * 
 * @param userDream - The user's dream text content
 * @param dominantTheme - The dominant emotional theme identified from the dream
 * @returns [chakraActivation, activatedCount] - The activation state and count of active chakras
 */
export const useChakraActivation = (
  userDream: string | null,
  dominantTheme: string | null
): [ChakraActivation, number] => {
  // Create chakra activation state
  const [chakras, setChakras] = useState<ChakraActivation>({ 
    root: false, 
    sacral: false, 
    solar: false, 
    heart: false, 
    throat: false, 
    third: false,
    crown: false 
  });
  
  useEffect(() => {
    // Performance optimization: Only process when inputs change
    const processChakraActivation = () => {
      let activations: ChakraActivation = { 
        root: false, 
        sacral: false, 
        solar: false, 
        heart: false, 
        throat: false, 
        third: false,
        crown: false 
      };
      
      // If we have an analyzed dominant theme, use that first
      if (dominantTheme) {
        switch(dominantTheme) {
          case 'love':
            activations.heart = true;
            break;
          case 'peace':
            activations.throat = true;
            activations.crown = true;
            break;
          case 'power':
            activations.solar = true;
            activations.root = true;
            break;
          case 'wisdom':
            activations.third = true;
            activations.crown = true;
            break;
          case 'creativity':
            activations.sacral = true;
            activations.throat = true;
            break;
          case 'spirituality':
            activations.crown = true;
            activations.third = true;
            break;
          case 'healing':
            activations.heart = true;
            activations.root = true;
            break;
          default:
            break;
        }
      }
      
      // Additional check through dream content for more activation
      if (userDream) {
        const dream = userDream.toLowerCase();
        
        // Root chakra - security, stability, safety
        if (dream.includes('security') || dream.includes('stability') || 
            dream.includes('safety') || dream.includes('ground') || dream.includes('home')) {
          activations.root = true;
        }
        
        // Sacral chakra - creativity, passion, emotion
        if (dream.includes('creativity') || dream.includes('passion') || 
            dream.includes('emotion') || dream.includes('desire') || dream.includes('pleasure')) {
          activations.sacral = true;
        }
        
        // Solar plexus - confidence, power, control
        if (dream.includes('confidence') || dream.includes('power') || 
            dream.includes('control') || dream.includes('strength') || dream.includes('success')) {
          activations.solar = true;
        }
        
        // Heart chakra - love, compassion, healing
        if (dream.includes('love') || dream.includes('compassion') || 
            dream.includes('healing') || dream.includes('heart') || dream.includes('connection')) {
          activations.heart = true;
        }
        
        // Throat chakra - expression, truth, communication
        if (dream.includes('expression') || dream.includes('truth') || 
            dream.includes('communication') || dream.includes('voice') || dream.includes('speak')) {
          activations.throat = true;
        }
        
        // Third eye - intuition, vision, insight
        if (dream.includes('intuition') || dream.includes('vision') || 
            dream.includes('insight') || dream.includes('clarity') || dream.includes('see')) {
          activations.third = true;
        }
        
        // Crown chakra - connection, spiritual, consciousness
        if (dream.includes('connection') || dream.includes('spiritual') || 
            dream.includes('consciousness') || dream.includes('divine') || dream.includes('highest')) {
          activations.crown = true;
        }
      }
      
      // Ensure at least one chakra is active by default
      if (!Object.values(activations).some(v => v)) {
        activations.heart = true;
      }
      
      setChakras(activations);
    };

    processChakraActivation();
  }, [userDream, dominantTheme]); // Only re-run when these inputs change
  
  // Calculate a glow intensity based on the number of activated chakras
  const activatedCount = useMemo(() => 
    Object.values(chakras).filter(Boolean).length,
    [chakras]
  );
  
  return [chakras, activatedCount];
};

/**
 * Advanced version of the hook with additional options and capabilities
 */
export const useAdvancedChakraActivation = (
  options: ChakraActivationOptions
): [ChakraActivation, number, (chakraKey: keyof ChakraActivation, active: boolean) => void] => {
  const { userDream, dominantTheme, initialActivation, deepAnalysisEnabled = false } = options;
  
  // Initialize with any provided initial activations
  const initialState: ChakraActivation = { 
    root: initialActivation?.root || false, 
    sacral: initialActivation?.sacral || false, 
    solar: initialActivation?.solar || false, 
    heart: initialActivation?.heart || false, 
    throat: initialActivation?.throat || false, 
    third: initialActivation?.third || false,
    crown: initialActivation?.crown || false 
  };
  
  const [chakras, setChakras] = useState<ChakraActivation>(initialState);
  
  // Use the base hook for initial analysis
  const [analysisResult, baseActivatedCount] = useChakraActivation(userDream, dominantTheme);
  
  // Merge the analysis result with the current state
  useEffect(() => {
    if (userDream || dominantTheme) {
      setChakras(current => ({
        ...current,
        ...analysisResult
      }));
    }
  }, [analysisResult, userDream, dominantTheme]);
  
  // Provide a function to manually update specific chakras
  const updateChakraState = useCallback((
    chakraKey: keyof ChakraActivation, 
    active: boolean
  ) => {
    setChakras(current => ({
      ...current,
      [chakraKey]: active
    }));
  }, []);
  
  // Calculate activated count
  const activatedCount = useMemo(() => 
    Object.values(chakras).filter(Boolean).length,
    [chakras]
  );
  
  // Return state, count, and update function
  return [chakras, activatedCount, updateChakraState];
};
