
import { Json } from '@/integrations/supabase/types';

export type ChakraActivated = number[] | Json | null | undefined;

export type ChakraData = {
  id: number;
  name: string;
  color: string;
  activated: boolean;
  activatedChakras?: number[];
  dominantEmotions?: string[];
  emotionalAnalysis?: Record<string, any>;
}

export function normalizeChakraData(chakras: ChakraActivated): number[] {
  if (!chakras) return [];
  
  if (Array.isArray(chakras)) {
    // If it's already an array, filter for numbers only
    return chakras.filter(item => typeof item === 'number') as number[];
  }
  
  if (typeof chakras === 'string') {
    try {
      const parsed = JSON.parse(chakras);
      return Array.isArray(parsed) 
        ? parsed.filter(item => typeof item === 'number')
        : [];
    } catch (e) {
      return [];
    }
  }
  
  // Handle object format that might come from the database
  if (typeof chakras === 'object' && chakras !== null) {
    try {
      const values = Object.values(chakras);
      return values.filter(item => typeof item === 'number') as number[];
    } catch {
      return [];
    }
  }
  
  return [];
}

export function isChakraActivated(chakras: ChakraActivated, chakraId: number): boolean {
  const normalizedChakras = normalizeChakraData(chakras);
  return normalizedChakras.includes(chakraId);
}
