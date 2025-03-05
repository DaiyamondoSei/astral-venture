
import { Json } from '@/integrations/supabase/types';

export interface ChakraData {
  activatedChakras?: number[];
  dominantEmotions?: string[];
  emotionalAnalysis?: Record<string, any>;
}

export type ChakraActivated = number[] | Json;

// Helper function to safely convert Json chakra data to number[]
export const normalizeChakraData = (chakras: ChakraActivated | undefined): number[] => {
  if (!chakras) return [];
  
  // If it's already a number array
  if (Array.isArray(chakras) && typeof chakras[0] === 'number') {
    return chakras as number[];
  }
  
  // If it's a string (JSON)
  if (typeof chakras === 'string') {
    try {
      const parsed = JSON.parse(chakras);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  
  // If it's some other JSON structure
  if (chakras && typeof chakras === 'object') {
    // Try to convert to array if possible
    return Array.isArray(chakras) ? 
      chakras.map(item => typeof item === 'number' ? item : Number(item)) :
      [];
  }
  
  return [];
};

// Check if a chakra is activated in the data
export const isChakraActivated = (chakras: ChakraActivated | undefined, index: number): boolean => {
  const normalizedChakras = normalizeChakraData(chakras);
  return normalizedChakras.includes(index);
};
