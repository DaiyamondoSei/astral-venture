
import { Json } from '@/integrations/supabase/types';

export type ChakraActivated = number[] | Json | null | undefined;

export type ChakraData = {
  id: number;
  name: string;
  color: string;
  activated: boolean;
}

export function normalizeChakraData(chakras: ChakraActivated): number[] {
  if (!chakras) return [];
  
  if (Array.isArray(chakras)) {
    return chakras as number[];
  }
  
  if (typeof chakras === 'string') {
    try {
      const parsed = JSON.parse(chakras);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }
  
  return [];
}

export function isChakraActivated(chakras: ChakraActivated, chakraId: number): boolean {
  const normalizedChakras = normalizeChakraData(chakras);
  return normalizedChakras.includes(chakraId);
}
